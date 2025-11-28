export interface Region {
  id: string;
  name: string;
  displayName: string;
  bbox: [number, number, number, number]; // [minLon, minLat, maxLon, maxLat]
  center: [number, number]; // [lat, lon]
  zoom: number;
}

export type HazardType = 'flood' | 'vegetation' | 'hybrid';
export type AcquisitionMode = 'auto' | 'optical' | 'radar';

export interface AcquisitionRequest {
  region_id: string;
  mode: AcquisitionMode;
}

export interface AcquisitionResponse {
  job_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  message?: string;
  result_paths?: string[];
}

export interface HazardMapRequest {
  region_id: string;
  hazard_type: HazardType;
}

export interface HazardMapResponse {
  status: 'success' | 'error';
  overlay_url?: string;
  geojson?: GeoJSON.FeatureCollection;
  bounds?: [[number, number], [number, number]];
  metadata?: {
    sensor: 'sentinel-1' | 'sentinel-2';
    acquisition_date: string;
    cloud_cover?: number;
  };
}

export interface HazardSummary {
  region_id: string;
  region_name: string;
  flood_percentage?: number;
  avg_ndvi?: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  last_updated: string;
  alerts: Alert[];
}

export interface Alert {
  id: string;
  type: 'flood' | 'drought' | 'vegetation_stress' | 'fire_risk';
  severity: 'info' | 'warning' | 'danger';
  message: string;
  timestamp: string;
}

export interface JobStatus {
  job_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress?: number;
  message?: string;
  result?: unknown;
}

export interface HealthResponse {
  status: 'ok' | 'error';
  version?: string;
  timestamp: string;
}
