import type {
  Region,
  AcquisitionRequest,
  AcquisitionResponse,
  HazardMapResponse,
  HazardSummary,
  JobStatus,
  HealthResponse,
  HazardType,
} from '@/types';

// API base URL - change this to your FastAPI backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Demo mode flag - when true, uses mock data instead of real API
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== 'false';

class SafeRoApi {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Health check
  async checkHealth(): Promise<HealthResponse> {
    if (DEMO_MODE) {
      return {
        status: 'ok',
        version: '1.0.0-demo',
        timestamp: new Date().toISOString(),
      };
    }
    return this.request<HealthResponse>('/api/health');
  }

  // Get available regions
  async getRegions(): Promise<Region[]> {
    if (DEMO_MODE) {
      return MOCK_REGIONS;
    }
    return this.request<Region[]>('/api/regions');
  }

  // Run data acquisition
  async runAcquisition(
    request: AcquisitionRequest
  ): Promise<AcquisitionResponse> {
    if (DEMO_MODE) {
      // Simulate async acquisition
      return {
        job_id: `job_${Date.now()}`,
        status: 'completed',
        message: 'Demo mode: Simulated acquisition complete',
        result_paths: ['/demo/sentinel_data.tif'],
      };
    }
    return this.request<AcquisitionResponse>('/api/acquisition/run', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Get hazard map data
  async getHazardMap(
    regionId: string,
    hazardType: HazardType
  ): Promise<HazardMapResponse> {
    if (DEMO_MODE) {
      return generateMockHazardMap(regionId, hazardType);
    }
    return this.request<HazardMapResponse>(
      `/api/hazards/map?region_id=${regionId}&hazard_type=${hazardType}`
    );
  }

  // Get hazard summary for a region
  async getHazardSummary(regionId: string): Promise<HazardSummary> {
    if (DEMO_MODE) {
      return generateMockSummary(regionId);
    }
    return this.request<HazardSummary>(
      `/api/hazards/summary?region_id=${regionId}`
    );
  }

  // Check job status
  async getJobStatus(jobId: string): Promise<JobStatus> {
    if (DEMO_MODE) {
      return {
        job_id: jobId,
        status: 'completed',
        progress: 100,
        message: 'Demo mode: Job complete',
      };
    }
    return this.request<JobStatus>(`/api/jobs/${jobId}`);
  }
}

// Mock data for demo mode
export const MOCK_REGIONS: Region[] = [
  {
    id: 'fagaras',
    name: 'fagaras',
    displayName: 'Făgăraș Mountains',
    bbox: [24.5, 45.5, 25.5, 45.8],
    center: [45.65, 25.0],
    zoom: 10,
  },
  {
    id: 'iasi',
    name: 'iasi',
    displayName: 'Iași County',
    bbox: [26.8, 46.8, 28.0, 47.5],
    center: [47.15, 27.4],
    zoom: 9,
  },
  {
    id: 'timisoara',
    name: 'timisoara',
    displayName: 'Timișoara Region',
    bbox: [20.8, 45.5, 21.5, 46.0],
    center: [45.75, 21.15],
    zoom: 10,
  },
  {
    id: 'craiova',
    name: 'craiova',
    displayName: 'Craiova Area',
    bbox: [23.5, 44.0, 24.2, 44.5],
    center: [44.25, 23.85],
    zoom: 10,
  },
  {
    id: 'constanta',
    name: 'constanta',
    displayName: 'Constanța Coast',
    bbox: [28.3, 43.8, 29.0, 44.5],
    center: [44.15, 28.65],
    zoom: 10,
  },
  {
    id: 'baia_mare',
    name: 'baia_mare',
    displayName: 'Baia Mare Region',
    bbox: [23.2, 47.4, 24.0, 47.8],
    center: [47.6, 23.6],
    zoom: 10,
  },
  {
    id: 'bucuresti',
    name: 'bucuresti',
    displayName: 'București Metropolitan',
    bbox: [25.8, 44.3, 26.4, 44.6],
    center: [44.45, 26.1],
    zoom: 11,
  },
  {
    id: 'cluj',
    name: 'cluj',
    displayName: 'Cluj-Napoca Area',
    bbox: [23.3, 46.6, 24.0, 47.0],
    center: [46.8, 23.65],
    zoom: 10,
  },
];

function generateMockHazardMap(
  regionId: string,
  hazardType: HazardType
): HazardMapResponse {
  const region = MOCK_REGIONS.find((r) => r.id === regionId);
  if (!region) {
    return { status: 'error' };
  }

  return {
    status: 'success',
    bounds: [
      [region.bbox[1], region.bbox[0]],
      [region.bbox[3], region.bbox[2]],
    ],
    metadata: {
      sensor: hazardType === 'flood' ? 'sentinel-1' : 'sentinel-2',
      acquisition_date: new Date().toISOString().split('T')[0],
      cloud_cover: hazardType === 'flood' ? undefined : Math.random() * 20,
    },
  };
}

function generateMockSummary(regionId: string): HazardSummary {
  const region = MOCK_REGIONS.find((r) => r.id === regionId);
  const riskLevels: Array<'low' | 'medium' | 'high' | 'critical'> = [
    'low',
    'medium',
    'high',
    'critical',
  ];

  // Generate realistic-ish random data
  const floodPercentage = Math.random() * 15;
  const avgNdvi = 0.3 + Math.random() * 0.4;
  const riskIndex = floodPercentage > 10 ? 3 : floodPercentage > 5 ? 2 : floodPercentage > 2 ? 1 : 0;

  return {
    region_id: regionId,
    region_name: region?.displayName || regionId,
    flood_percentage: Number(floodPercentage.toFixed(2)),
    avg_ndvi: Number(avgNdvi.toFixed(3)),
    risk_level: riskLevels[riskIndex],
    last_updated: new Date().toISOString(),
    alerts:
      floodPercentage > 5
        ? [
            {
              id: `alert_${Date.now()}`,
              type: 'flood',
              severity: floodPercentage > 10 ? 'danger' : 'warning',
              message: `Elevated water levels detected in ${region?.displayName || regionId}`,
              timestamp: new Date().toISOString(),
            },
          ]
        : [],
  };
}

// Export singleton instance
export const api = new SafeRoApi();

// Export class for custom configurations
export { SafeRoApi };
