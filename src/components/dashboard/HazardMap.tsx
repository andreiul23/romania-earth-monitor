import type { Region, HazardType } from "@/types";
import { cn } from "@/lib/utils";
import { MapPin, Satellite, Waves, Leaf, Layers, Flame } from "lucide-react";

interface HazardMapProps {
  region: Region | null;
  hazardType: HazardType;
  className?: string;
}

const hazardConfig: Record<HazardType, { color: string; icon: typeof Waves; label: string }> = {
  flood: { color: "#0ea5e9", icon: Waves, label: "Flood Risk" },
  vegetation: { color: "#22c55e", icon: Leaf, label: "Vegetation Health" },
  fire: { color: "#ef4444", icon: Flame, label: "Fire Risk" },
  hybrid: { color: "#f97316", icon: Layers, label: "Combined Hazard" },
};

export function HazardMap({ region, hazardType, className }: HazardMapProps) {
  const config = hazardConfig[hazardType];
  const Icon = config.icon;

  // Build OpenStreetMap iframe URL centered on region or Romania
  const lat = region?.center[0] || 45.9432;
  const lon = region?.center[1] || 24.9668;
  const zoom = region?.zoom || 7;
  
  // Use OpenStreetMap embed
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${
    region ? `${region.bbox[0]},${region.bbox[1]},${region.bbox[2]},${region.bbox[3]}` : `22,43,30,48`
  }&layer=mapnik&marker=${lat},${lon}`;

  return (
    <div className={cn("relative w-full h-full rounded-xl overflow-hidden border border-border bg-card", className)}>
      {/* Map iframe */}
      <iframe
        src={mapUrl}
        className="w-full h-full border-0"
        style={{ filter: "invert(90%) hue-rotate(180deg)" }}
        title="SAFE-RO Map"
        loading="lazy"
      />

      {/* Hazard Indicator Overlay */}
      {region && (
        <div 
          className="absolute inset-4 border-2 rounded-lg pointer-events-none animate-pulse"
          style={{ 
            borderColor: config.color,
            boxShadow: `0 0 20px ${config.color}40, inset 0 0 20px ${config.color}20`
          }}
        />
      )}

      {/* Info Panel */}
      {region && (
        <div className="absolute top-4 right-4 glass-panel p-3 z-10 min-w-[180px]">
          <div className="flex items-center gap-2 mb-2">
            <Satellite className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">{region.displayName}</span>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <div>Lat: {lat.toFixed(4)}°</div>
            <div>Lon: {lon.toFixed(4)}°</div>
            <div>Zoom: {zoom}x</div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 glass-panel p-3 z-10">
        <h4 className="text-xs font-semibold mb-2 text-foreground">Legend</h4>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded flex items-center justify-center" style={{ backgroundColor: config.color }}>
            <Icon className="w-3 h-3 text-background" />
          </div>
          <span className="text-xs text-muted-foreground">{config.label}</span>
        </div>
        {region && (
          <div className="flex items-center gap-2 mt-1.5">
            <div className="w-4 h-4 rounded border-2 border-dashed border-foreground/50" />
            <span className="text-xs text-muted-foreground">Region Bounds</span>
          </div>
        )}
      </div>

      {/* No region selected overlay */}
      {!region && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm z-20">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-primary mx-auto mb-3 animate-bounce" />
            <p className="text-foreground font-medium">Select a Region</p>
            <p className="text-sm text-muted-foreground mt-1">Choose a region from the control panel to view hazard data</p>
          </div>
        </div>
      )}
    </div>
  );
}
