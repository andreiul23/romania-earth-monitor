import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Romanian regions with bounding boxes [min_lon, min_lat, max_lon, max_lat]
const REGIONS: Record<string, { bbox: number[], name: string }> = {
  fagaras: { bbox: [24.5, 45.5, 25.5, 46.0], name: "Făgăraș" },
  iasi: { bbox: [27.5, 47.0, 27.8, 47.3], name: "Iași" },
  timisoara: { bbox: [21.1, 45.6, 21.4, 45.9], name: "Timișoara" },
  craiova: { bbox: [23.7, 44.2, 24.0, 44.5], name: "Craiova" },
  constanta: { bbox: [28.5, 44.1, 28.8, 44.4], name: "Constanța" },
  baia_mare: { bbox: [23.4, 47.5, 23.7, 47.8], name: "Baia Mare" },
  bucuresti: { bbox: [25.9, 44.3, 26.2, 44.6], name: "București" },
  cluj: { bbox: [23.5, 46.7, 23.8, 47.0], name: "Cluj" },
};

interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface ProductMetadata {
  id: string;
  name: string;
  acquisitionDate: string;
  cloudCover?: number;
  productType: string;
  satellite: string;
  processingLevel: string;
}

// NASA FIRMS fire hotspot data interface
interface FireHotspot {
  latitude: number;
  longitude: number;
  brightness: number;
  confidence: string | number;
  acq_date: string;
  acq_time: string;
  satellite: string;
  frp: number; // Fire Radiative Power
}

// Fetch fire hotspots from NASA FIRMS API
async function getFireHotspots(bbox: number[], daysBack: number = 3): Promise<FireHotspot[]> {
  const firmsApiKey = Deno.env.get('NASA_FIRMS_API_KEY');
  
  // Use VIIRS data source (most accurate for fire detection)
  const source = 'VIIRS_SNPP_NRT';
  const [minLon, minLat, maxLon, maxLat] = bbox;
  
  // Expand bbox slightly for better coverage
  const expandedBbox = `${minLon - 0.5},${minLat - 0.5},${maxLon + 0.5},${maxLat + 0.5}`;
  
  let url: string;
  if (firmsApiKey) {
    // Use authenticated API for better rate limits
    url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${firmsApiKey}/${source}/${expandedBbox}/${daysBack}`;
  } else {
    // Use open data endpoint (Romania country code: ROU)
    // This gets all fires in Romania, we'll filter by bbox
    url = `https://firms.modaps.eosdis.nasa.gov/api/country/csv/OPEN_DATA/${source}/ROU/${daysBack}`;
  }

  console.log(`[satellite-data] Fetching FIRMS data: ${firmsApiKey ? 'authenticated' : 'open'}`);

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`[satellite-data] FIRMS API error: ${response.status}`);
      return [];
    }

    const csvText = await response.text();
    const lines = csvText.trim().split('\n');
    
    if (lines.length < 2) {
      console.log('[satellite-data] No fire data returned from FIRMS');
      return [];
    }

    // Parse CSV header
    const headers = lines[0].split(',');
    const latIdx = headers.indexOf('latitude');
    const lonIdx = headers.indexOf('longitude');
    const brightIdx = headers.indexOf('bright_ti4') !== -1 ? headers.indexOf('bright_ti4') : headers.indexOf('brightness');
    const confIdx = headers.indexOf('confidence');
    const dateIdx = headers.indexOf('acq_date');
    const timeIdx = headers.indexOf('acq_time');
    const satIdx = headers.indexOf('satellite');
    const frpIdx = headers.indexOf('frp');

    const hotspots: FireHotspot[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      
      const lat = parseFloat(values[latIdx]);
      const lon = parseFloat(values[lonIdx]);
      
      // Filter by bbox if using country-wide data
      if (!firmsApiKey) {
        if (lon < minLon - 0.5 || lon > maxLon + 0.5 || lat < minLat - 0.5 || lat > maxLat + 0.5) {
          continue;
        }
      }
      
      hotspots.push({
        latitude: lat,
        longitude: lon,
        brightness: parseFloat(values[brightIdx]) || 0,
        confidence: values[confIdx] || 'unknown',
        acq_date: values[dateIdx] || '',
        acq_time: values[timeIdx] || '',
        satellite: values[satIdx] || 'VIIRS',
        frp: parseFloat(values[frpIdx]) || 0,
      });
    }

    console.log(`[satellite-data] Found ${hotspots.length} fire hotspots for region`);
    return hotspots;
    
  } catch (error) {
    console.error('[satellite-data] Error fetching FIRMS data:', error);
    return [];
  }
}

// Get OAuth2 token from Copernicus Data Space
async function getAccessToken(): Promise<string> {
  const clientId = Deno.env.get('COPERNICUS_CLIENT_ID');
  const clientSecret = Deno.env.get('COPERNICUS_CLIENT_SECRET');
  
  if (!clientId || !clientSecret) {
    throw new Error('Copernicus credentials not configured');
  }

  const tokenUrl = 'https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token';
  
  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[satellite-data] Token error:', error);
    throw new Error(`Failed to get access token: ${response.status}`);
  }

  const data: TokenResponse = await response.json();
  return data.access_token;
}

// Search for satellite products using OData API
async function searchProducts(
  accessToken: string,
  regionId: string,
  satellite: 'sentinel-1' | 'sentinel-2',
  maxCloudCover: number = 30,
  daysBack: number = 30
): Promise<ProductMetadata[]> {
  const region = REGIONS[regionId];
  if (!region) {
    throw new Error(`Unknown region: ${regionId}`);
  }

  const [minLon, minLat, maxLon, maxLat] = region.bbox;
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  // Build collection filter based on satellite
  let collectionFilter: string;
  if (satellite === 'sentinel-2') {
    collectionFilter = "Collection/Name eq 'SENTINEL-2'";
  } else {
    collectionFilter = "Collection/Name eq 'SENTINEL-1'";
  }

  // Build spatial filter using WKT polygon
  const polygon = `POLYGON((${minLon} ${minLat},${maxLon} ${minLat},${maxLon} ${maxLat},${minLon} ${maxLat},${minLon} ${minLat}))`;
  const spatialFilter = `OData.CSC.Intersects(area=geography'SRID=4326;${polygon}')`;

  // Build temporal filter
  const temporalFilter = `ContentDate/Start ge ${startDate.toISOString()} and ContentDate/Start le ${endDate.toISOString()}`;

  // Cloud cover filter (only for Sentinel-2)
  let cloudFilter = '';
  if (satellite === 'sentinel-2') {
    cloudFilter = ` and Attributes/OData.CSC.DoubleAttribute/any(att:att/Name eq 'cloudCover' and att/OData.CSC.DoubleAttribute/Value le ${maxCloudCover})`;
  }

  const filter = `${collectionFilter} and ${spatialFilter} and ${temporalFilter}${cloudFilter}`;
  
  const catalogUrl = `https://catalogue.dataspace.copernicus.eu/odata/v1/Products?$filter=${encodeURIComponent(filter)}&$top=10&$orderby=ContentDate/Start desc`;

  console.log(`[satellite-data] Searching ${satellite} for ${regionId}`);
  
  const response = await fetch(catalogUrl, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[satellite-data] Search error:', error);
    throw new Error(`Failed to search products: ${response.status}`);
  }

  const data = await response.json();
  
  return (data.value || []).map((product: any) => {
    const cloudCoverAttr = product.Attributes?.find((a: any) => a.Name === 'cloudCover');
    
    return {
      id: product.Id,
      name: product.Name,
      acquisitionDate: product.ContentDate?.Start || product.ModificationDate,
      cloudCover: cloudCoverAttr?.Value,
      productType: product.ProductType || 'Unknown',
      satellite: satellite === 'sentinel-2' ? 'Sentinel-2' : 'Sentinel-1',
      processingLevel: product.Name?.includes('L2A') ? 'L2A' : product.Name?.includes('L1C') ? 'L1C' : 'Unknown',
    };
  });
}

// Calculate fire risk based on FIRMS hotspots
function calculateFireRisk(hotspots: FireHotspot[]): {
  fireRisk: 'low' | 'medium' | 'high' | 'critical';
  activeHotspots: number;
  highConfidenceCount: number;
  maxBrightness: number;
  totalFRP: number;
} {
  if (hotspots.length === 0) {
    return {
      fireRisk: 'low',
      activeHotspots: 0,
      highConfidenceCount: 0,
      maxBrightness: 0,
      totalFRP: 0,
    };
  }

  const highConfidence = hotspots.filter(h => 
    h.confidence === 'high' || h.confidence === 'h' || 
    (typeof h.confidence === 'number' && h.confidence >= 80)
  );
  
  const maxBrightness = Math.max(...hotspots.map(h => h.brightness));
  const totalFRP = hotspots.reduce((sum, h) => sum + (h.frp || 0), 0);
  
  // Determine fire risk level
  let fireRisk: 'low' | 'medium' | 'high' | 'critical' = 'low';
  
  if (hotspots.length >= 10 || highConfidence.length >= 5 || totalFRP > 100) {
    fireRisk = 'critical';
  } else if (hotspots.length >= 5 || highConfidence.length >= 2 || totalFRP > 50) {
    fireRisk = 'high';
  } else if (hotspots.length >= 1) {
    fireRisk = 'medium';
  }

  return {
    fireRisk,
    activeHotspots: hotspots.length,
    highConfidenceCount: highConfidence.length,
    maxBrightness,
    totalFRP,
  };
}

// Calculate simple hazard indicators based on available data
function calculateHazardIndicators(
  sentinel2Products: ProductMetadata[],
  sentinel1Products: ProductMetadata[],
  fireHotspots: FireHotspot[] = []
): {
  floodRisk: 'low' | 'medium' | 'high';
  vegetationHealth: 'poor' | 'moderate' | 'good';
  fireRisk: 'low' | 'medium' | 'high' | 'critical';
  dataAvailability: 'limited' | 'moderate' | 'good';
  lastUpdate: string | null;
  radarCoverage: boolean;
  opticalCoverage: boolean;
  fireData: {
    activeHotspots: number;
    highConfidenceCount: number;
    maxBrightness: number;
    totalFRP: number;
  };
} {
  const hasOptical = sentinel2Products.length > 0;
  const hasRadar = sentinel1Products.length > 0;
  
  // Determine data availability
  let dataAvailability: 'limited' | 'moderate' | 'good' = 'limited';
  if (hasOptical && hasRadar) {
    dataAvailability = 'good';
  } else if (hasOptical || hasRadar) {
    dataAvailability = 'moderate';
  }

  // Calculate average cloud cover for optical imagery
  const avgCloudCover = sentinel2Products.length > 0
    ? sentinel2Products.reduce((sum, p) => sum + (p.cloudCover || 0), 0) / sentinel2Products.length
    : 100;

  // Estimate vegetation health based on cloud cover and data freshness
  let vegetationHealth: 'poor' | 'moderate' | 'good' = 'moderate';
  if (avgCloudCover < 20 && hasOptical) {
    vegetationHealth = 'good';
  } else if (avgCloudCover > 50 || !hasOptical) {
    vegetationHealth = 'poor';
  }

  // Estimate flood risk based on radar availability
  let floodRisk: 'low' | 'medium' | 'high' = 'medium';
  if (hasRadar && sentinel1Products.length >= 3) {
    floodRisk = 'low';
  } else if (!hasRadar) {
    floodRisk = 'high';
  }

  // Calculate fire risk from FIRMS data
  const fireAnalysis = calculateFireRisk(fireHotspots);

  // Get the most recent acquisition date
  const allDates = [
    ...sentinel2Products.map(p => p.acquisitionDate),
    ...sentinel1Products.map(p => p.acquisitionDate),
    ...fireHotspots.map(h => h.acq_date),
  ].filter(Boolean).sort().reverse();

  return {
    floodRisk,
    vegetationHealth,
    fireRisk: fireAnalysis.fireRisk,
    dataAvailability,
    lastUpdate: allDates[0] || null,
    radarCoverage: hasRadar,
    opticalCoverage: hasOptical,
    fireData: {
      activeHotspots: fireAnalysis.activeHotspots,
      highConfidenceCount: fireAnalysis.highConfidenceCount,
      maxBrightness: fireAnalysis.maxBrightness,
      totalFRP: fireAnalysis.totalFRP,
    },
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, regionId, satellite, maxCloudCover, daysBack } = await req.json();

    console.log(`[satellite-data] Action: ${action}, Region: ${regionId}`);

    // Action: list-regions - Return available regions
    if (action === 'list-regions') {
      const regions = Object.entries(REGIONS).map(([id, data]) => ({
        id,
        name: data.name,
        bbox: data.bbox,
      }));
      return new Response(JSON.stringify({ regions }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Action: search - Search for satellite products
    if (action === 'search') {
      if (!regionId) {
        return new Response(JSON.stringify({ error: 'regionId is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const accessToken = await getAccessToken();
      const products = await searchProducts(
        accessToken,
        regionId,
        satellite || 'sentinel-2',
        maxCloudCover || 30,
        daysBack || 30
      );

      return new Response(JSON.stringify({ products }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Action: analyze - Get hazard analysis for a region
    if (action === 'analyze') {
      if (!regionId) {
        return new Response(JSON.stringify({ error: 'regionId is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const region = REGIONS[regionId];
      if (!region) {
        return new Response(JSON.stringify({ error: 'Unknown region' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const accessToken = await getAccessToken();
      
      // Search for Sentinel data and fire hotspots in parallel
      const [sentinel2Products, sentinel1Products, fireHotspots] = await Promise.all([
        searchProducts(accessToken, regionId, 'sentinel-2', maxCloudCover || 30, daysBack || 30),
        searchProducts(accessToken, regionId, 'sentinel-1', 100, daysBack || 30),
        getFireHotspots(region.bbox, Math.min(daysBack || 3, 10)), // FIRMS allows max 10 days
      ]);

      const indicators = calculateHazardIndicators(sentinel2Products, sentinel1Products, fireHotspots);

      return new Response(JSON.stringify({
        regionId,
        regionName: region.name,
        bbox: region.bbox,
        indicators,
        sentinel2Products: sentinel2Products.slice(0, 5),
        sentinel1Products: sentinel1Products.slice(0, 5),
        fireHotspots: fireHotspots.slice(0, 20), // Limit to 20 hotspots in response
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Action: fires - Get fire hotspots for a region
    if (action === 'fires') {
      if (!regionId) {
        return new Response(JSON.stringify({ error: 'regionId is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const region = REGIONS[regionId];
      if (!region) {
        return new Response(JSON.stringify({ error: 'Unknown region' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const fireHotspots = await getFireHotspots(region.bbox, Math.min(daysBack || 3, 10));
      const fireAnalysis = calculateFireRisk(fireHotspots);

      return new Response(JSON.stringify({
        regionId,
        regionName: region.name,
        bbox: region.bbox,
        fireRisk: fireAnalysis.fireRisk,
        activeHotspots: fireAnalysis.activeHotspots,
        highConfidenceCount: fireAnalysis.highConfidenceCount,
        maxBrightness: fireAnalysis.maxBrightness,
        totalFRP: fireAnalysis.totalFRP,
        hotspots: fireHotspots,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[satellite-data] Error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
