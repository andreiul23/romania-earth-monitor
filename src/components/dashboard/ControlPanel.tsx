import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import type { Region, HazardType, AcquisitionMode, HazardSummary } from "@/types";
import { 
  Satellite, 
  Waves, 
  Leaf, 
  Layers, 
  Download, 
  RefreshCw, 
  AlertTriangle,
  Activity,
  CloudRain,
  Sun,
  Flame,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ControlPanelProps {
  regions: Region[];
  selectedRegion: Region | null;
  onRegionChange: (region: Region | null) => void;
  hazardType: HazardType;
  onHazardTypeChange: (type: HazardType) => void;
  summary: HazardSummary | null;
  isLoading: boolean;
  onRunAcquisition: (mode: AcquisitionMode) => void;
  onRefresh: () => void;
}

const hazardTypes: { value: HazardType; label: string; icon: typeof Waves; color: string }[] = [
  { value: "flood", label: "Flood Detection", icon: Waves, color: "text-flood" },
  { value: "vegetation", label: "Vegetation Health", icon: Leaf, color: "text-vegetation" },
  { value: "fire", label: "Fire Detection", icon: Flame, color: "text-danger" },
  { value: "hybrid", label: "Hybrid Analysis", icon: Layers, color: "text-alert" },
];

const acquisitionModes: { value: AcquisitionMode; label: string; icon: typeof Satellite; description: string }[] = [
  { value: "auto", label: "Auto", icon: Satellite, description: "Selects best sensor based on conditions" },
  { value: "optical", label: "Optical", icon: Sun, description: "Sentinel-2 (requires clear sky)" },
  { value: "radar", label: "Radar", icon: CloudRain, description: "Sentinel-1 (works in any weather)" },
];

export function ControlPanel({
  regions,
  selectedRegion,
  onRegionChange,
  hazardType,
  onHazardTypeChange,
  summary,
  isLoading,
  onRunAcquisition,
  onRefresh,
}: ControlPanelProps) {
  const [acquisitionMode, setAcquisitionMode] = useState<AcquisitionMode>("auto");
  const [opacity, setOpacity] = useState([70]);
  const [isPostingAnnouncement, setIsPostingAnnouncement] = useState(false);

  const handleAcquisition = () => {
    if (!selectedRegion) {
      toast.error("Please select a region first");
      return;
    }
    onRunAcquisition(acquisitionMode);
    toast.success(`Starting ${acquisitionMode} acquisition for ${selectedRegion.displayName}`);
  };

  const handlePostVolunteerAnnouncement = async () => {
    if (!selectedRegion) {
      toast.error("Please select a region first");
      return;
    }
    if (summary?.risk_level !== "high" && summary?.risk_level !== "critical") {
      toast.error("Volunteer announcements are only available for high-risk zones");
      return;
    }

    setIsPostingAnnouncement(true);
    try {
      const { error } = await supabase.from("volunteer_announcements").insert({
        region_id: selectedRegion.id,
        region_name: selectedRegion.displayName,
        hazard_type: hazardType,
        message: `Volunteers needed in ${selectedRegion.displayName} due to ${hazardType} hazard. Risk level: ${summary?.risk_level.toUpperCase()}`,
        is_active: true,
      });

      if (error) throw error;
      toast.success("Volunteer announcement posted successfully!");
    } catch {
      toast.error("Failed to post announcement. You may not have permission.");
    } finally {
      setIsPostingAnnouncement(false);
    }
  };

  const riskColors = {
    low: "bg-accent/20 text-accent border-accent/30",
    medium: "bg-alert/20 text-alert border-alert/30",
    high: "bg-danger/20 text-danger border-danger/30",
    critical: "bg-danger text-danger-foreground border-danger animate-pulse",
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Panel Header */}
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Control Panel
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Configure monitoring parameters
        </p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Region Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Select Region
          </label>
          <Select
            value={selectedRegion?.id || ""}
            onValueChange={(value) => {
              const region = regions.find((r) => r.id === value) || null;
              onRegionChange(region);
            }}
          >
            <SelectTrigger className="w-full bg-secondary border-border">
              <SelectValue placeholder="Choose a region..." />
            </SelectTrigger>
            <SelectContent>
              {regions.map((region) => (
                <SelectItem key={region.id} value={region.id}>
                  {region.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Hazard Type Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Hazard Type
          </label>
          <div className="grid grid-cols-1 gap-2">
            {hazardTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = hazardType === type.value;
              return (
                <button
                  key={type.value}
                  onClick={() => onHazardTypeChange(type.value)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 text-left",
                    isSelected
                      ? "bg-secondary border-primary/50 shadow-md"
                      : "bg-card/50 border-border hover:bg-secondary/50"
                  )}
                >
                  <Icon className={cn("w-5 h-5", type.color)} />
                  <span className="text-sm font-medium">{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Acquisition Mode */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Acquisition Mode
          </label>
          <div className="space-y-2">
            {acquisitionModes.map((mode) => {
              const Icon = mode.icon;
              const isSelected = acquisitionMode === mode.value;
              return (
                <button
                  key={mode.value}
                  onClick={() => setAcquisitionMode(mode.value)}
                  className={cn(
                    "w-full flex items-start gap-3 p-3 rounded-lg border transition-all duration-200 text-left",
                    isSelected
                      ? "bg-secondary border-primary/50"
                      : "bg-card/50 border-border hover:bg-secondary/50"
                  )}
                >
                  <Icon className={cn("w-4 h-4 mt-0.5", isSelected ? "text-primary" : "text-muted-foreground")} />
                  <div>
                    <span className="text-sm font-medium block">{mode.label}</span>
                    <span className="text-xs text-muted-foreground">{mode.description}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Overlay Opacity */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">
              Overlay Opacity
            </label>
            <span className="text-xs text-muted-foreground">{opacity[0]}%</span>
          </div>
          <Slider
            value={opacity}
            onValueChange={setOpacity}
            max={100}
            step={5}
            className="w-full"
          />
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button
            variant="hero"
            size="lg"
            className="w-full"
            onClick={handleAcquisition}
            disabled={!selectedRegion || isLoading}
          >
            <Download className="w-4 h-4" />
            Run Acquisition
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={onRefresh}
            disabled={!selectedRegion || isLoading}
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            Refresh Analysis
          </Button>
          
          {/* Volunteer Announcement Button */}
          {summary && (summary.risk_level === "high" || summary.risk_level === "critical") && (
            <Button
              variant="destructive"
              className="w-full"
              onClick={handlePostVolunteerAnnouncement}
              disabled={!selectedRegion || isPostingAnnouncement}
            >
              <Users className="w-4 h-4" />
              {isPostingAnnouncement ? "Posting..." : "Request Volunteers"}
            </Button>
          )}
        </div>

        {/* Summary Stats */}
        {summary && (
          <div className="space-y-3 pt-4 border-t border-border">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-alert" />
              Region Summary
            </h3>
            
            <div className="glass-panel p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Risk Level</span>
                <Badge className={cn("text-xs", riskColors[summary.risk_level])}>
                  {summary.risk_level.toUpperCase()}
                </Badge>
              </div>
              
              {/* Flood - show for flood and hybrid */}
              {summary.flood_percentage !== undefined && (hazardType === "flood" || hazardType === "hybrid") && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Flood Coverage</span>
                    <span className="text-sm font-mono text-flood">{summary.flood_percentage}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-flood rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(summary.flood_percentage * 5, 100)}%` }}
                    />
                  </div>
                </div>
              )}
              
              {/* Fire - show for fire and hybrid */}
              {summary.fire_percentage !== undefined && (hazardType === "fire" || hazardType === "hybrid") && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Fire Risk</span>
                    <span className="text-sm font-mono text-danger">{summary.fire_percentage}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-danger rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(summary.fire_percentage * 5, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Vegetation NDVI - show for vegetation and hybrid */}
              {summary.avg_ndvi !== undefined && (hazardType === "vegetation" || hazardType === "hybrid") && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Avg. NDVI</span>
                    <span className="text-sm font-mono text-vegetation">{summary.avg_ndvi}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-vegetation rounded-full transition-all duration-500"
                      style={{ width: `${summary.avg_ndvi * 100}%` }}
                    />
                  </div>
                </div>
              )}
              
              <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                Updated: {new Date(summary.last_updated).toLocaleString()}
              </div>
            </div>

            {/* Alerts */}
            {summary.alerts.length > 0 && (
              <div className="space-y-2">
                {summary.alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={cn(
                      "p-3 rounded-lg border text-sm",
                      alert.severity === "danger"
                        ? "bg-danger/10 border-danger/30 text-danger"
                        : alert.severity === "warning"
                        ? "bg-alert/10 border-alert/30 text-alert"
                        : "bg-primary/10 border-primary/30 text-primary"
                    )}
                  >
                    <p className="font-medium">{alert.message}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
