import { analyzeAllRegions, type RegionAnalysis } from "./satellite-api";

const CACHE_KEY = "safero_satellite_data";
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const FETCH_TIMEOUT_MS = 60 * 1000; // 60 second timeout for API calls

interface CachedData {
  data: RegionAnalysis[];
  timestamp: number;
}

function getCache(): CachedData | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const parsed: CachedData = JSON.parse(cached);
    const isExpired = Date.now() - parsed.timestamp > CACHE_TTL_MS;
    
    if (isExpired) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    
    return parsed;
  } catch {
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
}

function setCache(data: RegionAnalysis[]): void {
  const cacheData: CachedData = {
    data,
    timestamp: Date.now(),
  };
  localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
}

// Wrapper to add timeout to promises
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Request timed out after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
}

export async function getCachedSatelliteData(
  forceRefresh = false,
  maxCloudCover = 50,
  daysBack = 14
): Promise<{ data: RegionAnalysis[]; fromCache: boolean; cacheTime: number | null }> {
  if (!forceRefresh) {
    const cached = getCache();
    if (cached) {
      return { data: cached.data, fromCache: true, cacheTime: cached.timestamp };
    }
  }

  console.log("[satellite-cache] Fetching fresh satellite data...");
  const data = await withTimeout(analyzeAllRegions(maxCloudCover, daysBack), FETCH_TIMEOUT_MS);
  console.log("[satellite-cache] Received", data.length, "region analyses");
  
  if (data.length > 0) {
    setCache(data);
  }
  
  return { data, fromCache: false, cacheTime: Date.now() };
}

export function getCacheTimestamp(): number | null {
  const cached = getCache();
  return cached?.timestamp || null;
}

export function clearSatelliteCache(): void {
  localStorage.removeItem(CACHE_KEY);
}
