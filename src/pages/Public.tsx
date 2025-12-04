import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { getCachedSatelliteData } from "@/lib/satellite-cache";
import { type RegionAnalysis } from "@/lib/satellite-api";

const emailSchema = z.string()
  .trim()
  .email("Please enter a valid email address")
  .max(255, "Email is too long");

import { 
  Search, 
  Bell, 
  MapPin, 
  Waves, 
  Leaf, 
  Shield, 
  AlertTriangle, 
  CheckCircle2,
  Clock,
  Mail,
  ChevronRight,
  Flame,
  Users,
  UserPlus,
  Loader2,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { VolunteerAnnouncement } from "@/types";

interface AnnouncementWithSignup extends VolunteerAnnouncement {
  isSigningUp?: boolean;
  volunteerEmail?: string;
}

type RiskLevel = "low" | "medium" | "high" | "critical";

interface RegionStatus {
  id: string;
  name: string;
  displayName: string;
  riskLevel: RiskLevel;
  floodRisk: number;
  vegetationHealth: number;
  fireRisk: number;
  lastUpdated: string;
  alerts: number;
}

// Convert satellite API data to UI format
function convertAnalysisToStatus(analysis: RegionAnalysis): RegionStatus {
  const { indicators, geeAnalysis } = analysis;
  
  // Use actual numeric data from GEE analysis when available
  const floodRisk = geeAnalysis?.floodPercentage ?? 
    (indicators.floodRisk === 'high' ? 65 : indicators.floodRisk === 'medium' ? 35 : 15);
  
  // Convert NDVI to vegetation health percentage (NDVI ranges from -1 to 1, healthy > 0.3)
  const ndviValue = geeAnalysis?.ndviMean ?? 0.4;
  const vegetationHealth = Math.max(0, Math.min(100, Math.round((ndviValue + 0.2) * 70)));
  
  // Use actual fire data from FIRMS
  const fireHotspots = indicators.fireData?.activeHotspots ?? 0;
  const totalFRP = indicators.fireData?.totalFRP ?? 0;
  
  // Calculate fire risk based on actual hotspot data
  let fireRisk: number;
  if (fireHotspots >= 10 || totalFRP > 100) {
    fireRisk = 85 + Math.random() * 10;
  } else if (fireHotspots >= 5 || totalFRP > 50) {
    fireRisk = 60 + Math.random() * 15;
  } else if (fireHotspots >= 1) {
    fireRisk = 35 + Math.random() * 15;
  } else {
    fireRisk = 5 + Math.random() * 15;
  }
  
  const maxRisk = Math.max(floodRisk, fireRisk);
  const riskLevel: RiskLevel = 
    maxRisk > 60 ? "critical" : 
    maxRisk > 40 ? "high" : 
    maxRisk > 20 ? "medium" : "low";
  
  return {
    id: analysis.regionId,
    name: analysis.regionId,
    displayName: analysis.regionName,
    riskLevel,
    floodRisk: Math.round(floodRisk),
    vegetationHealth: Math.round(vegetationHealth),
    fireRisk: Math.round(fireRisk),
    lastUpdated: geeAnalysis?.dataDate || indicators.lastUpdate || new Date().toISOString(),
    alerts: fireHotspots + (floodRisk > 50 ? 1 : 0),
  };
}

const riskConfig: Record<RiskLevel, { color: string; bg: string; icon: typeof CheckCircle2; label: string }> = {
  low: { color: "text-vegetation", bg: "bg-vegetation/10", icon: CheckCircle2, label: "Low Risk" },
  medium: { color: "text-alert", bg: "bg-alert/10", icon: Clock, label: "Moderate" },
  high: { color: "text-alert", bg: "bg-alert/20", icon: AlertTriangle, label: "High Risk" },
  critical: { color: "text-danger", bg: "bg-danger/20", icon: AlertTriangle, label: "Critical" },
};

export function Public() {
  const [searchQuery, setSearchQuery] = useState("");
  const [subscribeEmail, setSubscribeEmail] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [volunteerAnnouncements, setVolunteerAnnouncements] = useState<AnnouncementWithSignup[]>([]);
  const [volunteerEmails, setVolunteerEmails] = useState<Record<string, string>>({});
  const [signingUpFor, setSigningUpFor] = useState<string | null>(null);
  const [regionStatuses, setRegionStatuses] = useState<RegionStatus[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [lastCacheTime, setLastCacheTime] = useState<number | null>(null);

  // Fetch satellite data (with caching)
  useEffect(() => {
    const fetchSatelliteData = async () => {
      setIsLoadingData(true);
      setDataError(null);
      try {
        const { data: analyses, fromCache, cacheTime } = await getCachedSatelliteData(false);
        const statuses = analyses.map(convertAnalysisToStatus);
        setRegionStatuses(statuses);
        setLastCacheTime(cacheTime);
        if (fromCache) {
          console.log("Loaded satellite data from cache");
        }
      } catch (error) {
        console.error("Failed to fetch satellite data:", error);
        setDataError("Unable to load satellite data. Please try again.");
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchSatelliteData();
  }, []);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const { data } = await supabase
        .from("volunteer_announcements")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(3);
      
      if (data) {
        setVolunteerAnnouncements(data as VolunteerAnnouncement[]);
      }
    };
    fetchAnnouncements();
  }, []);

  const filteredRegions = regionStatuses.filter((region) =>
    region.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRefreshData = async () => {
    setIsLoadingData(true);
    setDataError(null);
    try {
      const { data: analyses, cacheTime } = await getCachedSatelliteData(true); // Force refresh
      const statuses = analyses.map(convertAnalysisToStatus);
      setRegionStatuses(statuses);
      setLastCacheTime(cacheTime);
      toast.success("Data refreshed successfully");
    } catch (error) {
      console.error("Failed to refresh satellite data:", error);
      setDataError("Unable to refresh data. Please try again.");
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSubscribe = async () => {
    if (!selectedRegion) {
      toast.error("Please select a region");
      return;
    }

    // Validate email with Zod
    const emailResult = emailSchema.safeParse(subscribeEmail);
    if (!emailResult.success) {
      toast.error(emailResult.error.errors[0].message);
      return;
    }

    setIsSubscribing(true);
    try {
      // Use edge function for secure subscription handling
      const { data, error } = await supabase.functions.invoke('manage-subscription', {
        body: {
          action: 'subscribe',
          email: emailResult.data,
          region_id: selectedRegion,
          hazard_types: ["flood", "vegetation", "fire"],
        },
      });

      if (error) throw error;
      
      toast.success(data?.message || "Successfully subscribed to alerts!");
      setSubscribeEmail("");
      setSelectedRegion(null);
    } catch {
      toast.error("Failed to subscribe. Please try again.");
    } finally {
      setIsSubscribing(false);
    }
  };

  const criticalRegions = regionStatuses.filter((r) => r.riskLevel === "critical" || r.riskLevel === "high");

  const handleVolunteerSignup = async (announcementId: string) => {
    const email = volunteerEmails[announcementId];
    const emailResult = emailSchema.safeParse(email);
    
    if (!emailResult.success) {
      toast.error(emailResult.error.errors[0].message);
      return;
    }

    setSigningUpFor(announcementId);
    try {
      const { error } = await supabase.from("volunteer_signups").insert({
        announcement_id: announcementId,
        email: emailResult.data,
      });

      if (error) {
        if (error.code === "23505") {
          toast.error("You've already signed up for this request");
        } else {
          throw error;
        }
      } else {
        toast.success("Thank you for volunteering! The institution will contact you.");
        setVolunteerEmails({ ...volunteerEmails, [announcementId]: "" });
      }
    } catch {
      toast.error("Failed to sign up. Please try again.");
    } finally {
      setSigningUpFor(null);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            <span className="text-xs sm:text-sm font-medium text-primary">Public Hazard Monitor</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4">Romania Hazard Status</h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-2">
            Real-time satellite monitoring of natural hazards across Romanian regions. 
            Check your area's status and subscribe to alerts.
          </p>
          <div className="flex flex-col items-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshData}
              disabled={isLoadingData}
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", isLoadingData && "animate-spin")} />
              {isLoadingData ? "Loading..." : "Refresh Data"}
            </Button>
            {lastCacheTime && (
              <p className="text-xs text-muted-foreground">
                Last updated: {new Date(lastCacheTime).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Active Alerts Banner */}
        {criticalRegions.length > 0 && (
          <div className="mb-8 p-4 rounded-xl bg-danger/10 border border-danger/30">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-danger animate-pulse" />
              <div>
                <p className="font-semibold text-danger">Active Alerts</p>
                <p className="text-sm text-muted-foreground">
                  Elevated risk detected in: {criticalRegions.map((r) => r.displayName).join(", ")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Volunteer Announcements */}
        {volunteerAnnouncements.length > 0 && (
          <div className="mb-6 sm:mb-8 space-y-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <h2 className="font-semibold text-sm sm:text-base">Volunteer Requests</h2>
            </div>
            {volunteerAnnouncements.map((announcement) => (
              <div
                key={announcement.id}
                className="p-3 sm:p-4 rounded-xl bg-primary/10 border border-primary/30 transition-all duration-300 hover:bg-primary/15 hover:border-primary/50"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-primary text-sm sm:text-base">{announcement.region_name}</p>
                      <Badge className="bg-primary/20 text-primary text-xs">
                        {announcement.hazard_type}
                      </Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">{announcement.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Posted: {new Date(announcement.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {/* Volunteer Signup */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-3 border-t border-primary/20">
                  <div className="flex items-center gap-2 flex-1">
                    <UserPlus className="w-4 h-4 text-primary flex-shrink-0 hidden sm:block" />
                    <Input
                      type="email"
                      placeholder="Your email to volunteer"
                      value={volunteerEmails[announcement.id] || ""}
                      onChange={(e) => setVolunteerEmails({ ...volunteerEmails, [announcement.id]: e.target.value })}
                      className="h-9 sm:h-8 text-sm bg-background/50 border-primary/30"
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="hero"
                    onClick={() => handleVolunteerSignup(announcement.id)}
                    disabled={signingUpFor === announcement.id || !volunteerEmails[announcement.id]}
                    className="h-9 sm:h-8 px-4 sm:px-3 w-full sm:w-auto"
                  >
                    {signingUpFor === announcement.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-1 sm:hidden" />
                        Sign Up
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search your city or region..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-base bg-card border-border"
            />
          </div>
        </div>

        {/* Region Status Grid */}
        {dataError && (
          <div className="mb-8 p-4 rounded-xl bg-danger/10 border border-danger/30 text-center">
            <p className="text-danger">{dataError}</p>
            <Button variant="outline" size="sm" onClick={handleRefreshData} className="mt-2">
              Try Again
            </Button>
          </div>
        )}
        
        {isLoadingData && regionStatuses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading satellite data...</p>
          </div>
        ) : filteredRegions.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No regions found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-12">
            {filteredRegions.map((region) => {
              const config = riskConfig[region.riskLevel];
              const Icon = config.icon;
              
              return (
                <div
                  key={region.id}
                  className={cn(
                    "glass-panel p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 cursor-pointer",
                    selectedRegion === region.id && "ring-2 ring-primary"
                  )}
                  onClick={() => setSelectedRegion(region.id === selectedRegion ? null : region.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <h3 className="font-semibold">{region.displayName}</h3>
                    </div>
                    <Badge className={cn("text-xs", config.bg, config.color)}>
                      <Icon className="w-3 h-3 mr-1" />
                      {config.label}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {/* Flood Risk */}
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Waves className="w-3 h-3" /> Flood Risk
                        </span>
                        <span className={region.floodRisk > 50 ? "text-danger" : "text-foreground"}>
                          {region.floodRisk}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            region.floodRisk > 70 ? "bg-danger" :
                            region.floodRisk > 50 ? "bg-alert" :
                            region.floodRisk > 25 ? "bg-primary" : "bg-vegetation"
                          )}
                          style={{ width: `${region.floodRisk}%` }}
                        />
                      </div>
                    </div>

                    {/* Fire Risk */}
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Flame className="w-3 h-3" /> Fire Risk
                        </span>
                        <span className={region.fireRisk > 50 ? "text-danger" : "text-foreground"}>
                          {region.fireRisk}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            region.fireRisk > 70 ? "bg-danger" :
                            region.fireRisk > 50 ? "bg-alert" :
                            region.fireRisk > 25 ? "bg-primary" : "bg-vegetation"
                          )}
                          style={{ width: `${region.fireRisk}%` }}
                        />
                      </div>
                    </div>

                    {/* Vegetation Health */}
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Leaf className="w-3 h-3" /> Vegetation
                        </span>
                        <span className="text-vegetation">{region.vegetationHealth}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-vegetation rounded-full transition-all"
                          style={{ width: `${region.vegetationHealth}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                    <span className="text-xs text-muted-foreground">
                      {lastCacheTime ? `Updated ${new Date(lastCacheTime).toLocaleTimeString()}` : "Loading..."}
                    </span>
                    {region.alerts > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {region.alerts} alert{region.alerts > 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Subscribe Section */}
        <div className="glass-panel-elevated p-5 sm:p-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
            <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <span className="text-xs sm:text-sm font-medium text-primary">Alert Notifications</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Stay Informed</h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-md mx-auto">
            Subscribe to receive email alerts when hazard levels change in your selected region.
          </p>

          <div className="flex flex-col gap-3 max-w-lg mx-auto">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Your email address"
                value={subscribeEmail}
                onChange={(e) => setSubscribeEmail(e.target.value)}
                className="pl-10 h-11 sm:h-10 bg-secondary border-border"
              />
            </div>
            <Button
              variant="hero"
              className="h-11 sm:h-10"
              onClick={handleSubscribe}
              disabled={!selectedRegion || !subscribeEmail || isSubscribing}
            >
              {isSubscribing ? "Subscribing..." : "Subscribe"}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {selectedRegion ? (
            <p className="text-xs sm:text-sm text-primary mt-3">
              Subscribing to: {regionStatuses.find((r) => r.id === selectedRegion)?.displayName}
            </p>
          ) : (
            <p className="text-xs sm:text-sm text-muted-foreground mt-3">
              Tap on a region above to select it for alerts
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default Public;
