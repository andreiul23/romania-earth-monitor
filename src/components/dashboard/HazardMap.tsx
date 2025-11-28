import { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap, Rectangle, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Region, HazardType } from "@/types";
import { cn } from "@/lib/utils";

interface HazardMapProps {
  region: Region | null;
  hazardType: HazardType;
  className?: string;
}

function MapController({ region }: { region: Region | null }) {
  const map = useMap();

  useEffect(() => {
    if (region) {
      map.flyTo(region.center, region.zoom, { duration: 1.5 });
    }
  }, [map, region]);

  return null;
}

const hazardColors: Record<HazardType, { fill: string; stroke: string }> = {
  flood: { fill: "#0ea5e9", stroke: "#0284c7" },
  vegetation: { fill: "#22c55e", stroke: "#16a34a" },
  hybrid: { fill: "#f97316", stroke: "#ea580c" },
};

export function HazardMap({ region, hazardType, className }: HazardMapProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={cn("relative w-full h-full rounded-xl overflow-hidden border border-border bg-card flex items-center justify-center", className)}>
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  return (
    <div className={cn("relative w-full h-full rounded-xl overflow-hidden border border-border", className)}>
      <MapContainer
        center={region?.center || [45.9432, 24.9668]}
        zoom={region?.zoom || 7}
        className="w-full h-full"
        zoomControl={false}
        style={{ height: "100%", width: "100%" }}
      >
        <ZoomControl position="bottomright" />
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <MapController region={region} />
        {region && (
          <Rectangle
            bounds={[[region.bbox[1], region.bbox[0]], [region.bbox[3], region.bbox[2]]]}
            pathOptions={{ color: hazardColors[hazardType].stroke, fillColor: hazardColors[hazardType].fill, fillOpacity: 0.3, weight: 2 }}
          />
        )}
      </MapContainer>

      <div className="absolute bottom-4 left-4 glass-panel p-3 z-[1000]">
        <h4 className="text-xs font-semibold mb-2 text-foreground">Legend</h4>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: hazardColors[hazardType].fill, opacity: 0.7 }} />
          <span className="text-xs text-muted-foreground">
            {hazardType === 'flood' ? 'Flood Risk' : hazardType === 'vegetation' ? 'Vegetation Health' : 'Combined Hazard'}
          </span>
        </div>
      </div>

      {!region && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-[1000]">
          <p className="text-muted-foreground">Select a region to view hazard data</p>
        </div>
      )}
    </div>
  );
}
