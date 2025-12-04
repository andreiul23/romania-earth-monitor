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
import type { Region, HazardType, AcquisitionMode } from "@/types";
import type { RegionAnalysis } from "@/lib/satellite-api";
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
  Users,
  Database,
  Thermometer,
  Droplets
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
  satelliteData: RegionAnalysis | null;
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

// Calculate risk level from satellite data
function calculateRiskLevel(data: RegionAnalysis): 'low' | 'medium' | 'high' | 'critical' {
  const { indicators, geeAnalysis, fireHotspots } = data;
  
  // Fire risk takes priority
  if (indicators.fireRisk === 'critical' || fireHotspots.length >= 10) return 'critical';
  if (indicators.fireRisk === 'high' || fireHotspots.length >= 5) return 'high';
  
  // Flood risk
  if (indicators.floodRisk === 'high') return 'high';
  if (geeAnalysis?.floodPercentage && geeAnalysis.floodPercentage > 10) return 'high';
  
  // Vegetation stress
  if (geeAnalysis?.vegetationStress === 'high') return 'medium';
  if (indicators.vegetationHealth === 'poor') return 'medium';
  
  // Medium conditions
  if (indicators.fireRisk === 'medium' || indicators.floodRisk === 'medium') return 'medium';
  
  return 'low';
}

export function ControlPanel({
  regions,
  selectedRegion,
  onRegionChange,
  hazardType,
  onHazardTypeChange,
  satelliteData,
  isLoading,
  onRunAcquisition,
  onRefresh,
}: ControlPanelProps) {
  const [acquisitionMode, setAcquisitionMode] = useState<AcquisitionMode>("auto");
  const [opacity, setOpacity] = useState([70]);
  const [isPostingAnnouncement, setIsPostingAnnouncement] = useState(false);

  const riskLevel = satelliteData ? calculateRiskLevel(satelliteData) : null;

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
    if (riskLevel !== "high" && riskLevel !== "critical") {
      toast.error("Volunteer announcements are only available for high-risk zones");
      return;
    }

    setIsPostingAnnouncement(true);
    try {
      const { error } = await supabase.from("volunteer_announcements").insert({
        region_id: selectedRegion.id,
        region_name: selectedRegion.displayName,
        hazard_type: hazardType,
        message: `Volunteers needed in ${selectedRegion.displayName} due to ${hazardType} hazard. Risk level: ${riskLevel?.toUpperCase()}`,
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
          Real-time satellite data analysis
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
          {riskLevel && (riskLevel === "high" || riskLevel === "critical") && (
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

        {/* Real Satellite Data Summary */}
        {satelliteData && (
          <div className="space-y-3 pt-4 border-t border-border">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Database className="w-4 h-4 text-primary" />
              Satellite Data Summary
            </h3>
            
            <div className="glass-panel p-3 space-y-3">
              {/* Risk Level */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Risk Level</span>
                <Badge className={cn("text-xs", riskColors[riskLevel || 'low'])}>
                  {(riskLevel || 'unknown').toUpperCase()}
                </Badge>
              </div>

              {/* Data Sources */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Data Sources</span>
                <div className="flex gap-1">
                  {satelliteData.indicators.opticalCoverage && (
                    <Badge variant="outline" className="text-xs">S2</Badge>
                  )}
                  {satelliteData.indicators.radarCoverage && (
                    <Badge variant="outline" className="text-xs">S1</Badge>
                  )}
                  {satelliteData.geeAnalysis && (
                    <Badge variant="outline" className="text-xs text-vegetation">GEE</Badge>
                  )}
                  {satelliteData.fireHotspots.length > 0 && (
                    <Badge variant="outline" className="text-xs text-danger">FIRMS</Badge>
                  )}
                </div>
              </div>
              
              {/* GEE NDVI - show for vegetation and hybrid */}
              {satelliteData.geeAnalysis && satelliteData.geeAnalysis.ndviMean !== null && (hazardType === "vegetation" || hazardType === "hybrid") && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Leaf className="w-3 h-3" />
                      NDVI (GEE)
                    </span>
                    <span className="text-sm font-mono text-vegetation">
                      {satelliteData.geeAnalysis.ndviMean.toFixed(3)}
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-vegetation rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(0, (satelliteData.geeAnalysis.ndviMean + 1) * 50)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Min: {satelliteData.geeAnalysis.ndviMin?.toFixed(2) ?? 'N/A'}</span>
                    <span>Max: {satelliteData.geeAnalysis.ndviMax?.toFixed(2) ?? 'N/A'}</span>
                  </div>
                </div>
              )}

              {/* GEE Flood Percentage - show for flood and hybrid */}
              {satelliteData.geeAnalysis && satelliteData.geeAnalysis.floodPercentage !== null && (hazardType === "flood" || hazardType === "hybrid") && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Droplets className="w-3 h-3" />
                      Flood Coverage (GEE)
                    </span>
                    <span className="text-sm font-mono text-flood">
                      {satelliteData.geeAnalysis.floodPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-flood rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(satelliteData.geeAnalysis.floodPercentage * 5, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Fire Hotspots - show for fire and hybrid */}
              {(hazardType === "fire" || hazardType === "hybrid") && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      Fire Hotspots (FIRMS)
                    </span>
                    <span className={cn(
                      "text-sm font-mono",
                      satelliteData.fireHotspots.length > 0 ? "text-danger" : "text-muted-foreground"
                    )}>
                      {satelliteData.fireHotspots.length}
                    </span>
                  </div>
                  {satelliteData.indicators.fireData && (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-muted/50 rounded p-2">
                        <span className="text-muted-foreground block">High Confidence</span>
                        <span className="font-mono text-danger">{satelliteData.indicators.fireData.highConfidenceCount}</span>
                      </div>
                      <div className="bg-muted/50 rounded p-2">
                        <span className="text-muted-foreground block">Total FRP</span>
                        <span className="font-mono">{satelliteData.indicators.fireData.totalFRP.toFixed(1)} MW</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Data Availability */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Data Availability</span>
                <Badge variant="outline" className={cn(
                  "text-xs",
                  satelliteData.indicators.dataAvailability === 'good' ? "text-accent" :
                  satelliteData.indicators.dataAvailability === 'moderate' ? "text-alert" : "text-muted-foreground"
                )}>
                  {satelliteData.indicators.dataAvailability}
                </Badge>
              </div>
              
              <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                Last Update: {satelliteData.indicators.lastUpdate 
                  ? new Date(satelliteData.indicators.lastUpdate).toLocaleString()
                  : 'N/A'}
              </div>
            </div>

            {/* Vegetation Stress Alert */}
            {satelliteData.geeAnalysis?.vegetationStress === 'high' && (
              <div className="p-3 rounded-lg border bg-alert/10 border-alert/30 text-alert text-sm">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-medium">Vegetation Stress Detected</span>
                </div>
                <p className="text-xs mt-1 opacity-80">
                  Low NDVI values indicate stressed or sparse vegetation
                </p>
              </div>
            )}

            {/* Fire Alert */}
            {satelliteData.fireHotspots.length > 0 && (
              <div className="p-3 rounded-lg border bg-danger/10 border-danger/30 text-danger text-sm">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4" />
                  <span className="font-medium">Active Fire Detected</span>
                </div>
                <p className="text-xs mt-1 opacity-80">
                  {satelliteData.fireHotspots.length} hotspot(s) detected via NASA FIRMS
                </p>
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {isLoading && !satelliteData && (
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Loading satellite data...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
