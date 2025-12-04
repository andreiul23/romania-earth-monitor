import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MOCK_REGIONS } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

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
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { VolunteerAnnouncement } from "@/types";

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

// Generate mock status data
const regionStatuses: RegionStatus[] = MOCK_REGIONS.map((region) => {
  const floodRisk = Math.random() * 100;
  const vegetationHealth = 30 + Math.random() * 60;
  const fireRisk = Math.random() * 100;
  const maxRisk = Math.max(floodRisk, fireRisk);
  const riskLevel: RiskLevel = 
    maxRisk > 70 ? "critical" : 
    maxRisk > 50 ? "high" : 
    maxRisk > 25 ? "medium" : "low";
  
  return {
    id: region.id,
    name: region.name,
    displayName: region.displayName,
    riskLevel,
    floodRisk: Math.round(floodRisk),
    vegetationHealth: Math.round(vegetationHealth),
    fireRisk: Math.round(fireRisk),
    lastUpdated: new Date(Date.now() - Math.random() * 3600000).toISOString(),
    alerts: riskLevel === "critical" ? 2 : riskLevel === "high" ? 1 : 0,
  };
});

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
  const [volunteerAnnouncements, setVolunteerAnnouncements] = useState<VolunteerAnnouncement[]>([]);

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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-6 h-6 text-primary" />
            <span className="text-sm font-medium text-primary">Public Hazard Monitor</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Romania Hazard Status</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Real-time satellite monitoring of natural hazards across Romanian regions. 
            Check your area's status and subscribe to alerts.
          </p>
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
          <div className="mb-8 space-y-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <h2 className="font-semibold">Volunteer Requests</h2>
            </div>
            {volunteerAnnouncements.map((announcement) => (
              <div
                key={announcement.id}
                className="p-4 rounded-xl bg-primary/10 border border-primary/30"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-primary">{announcement.region_name}</p>
                    <p className="text-sm text-muted-foreground mt-1">{announcement.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Posted: {new Date(announcement.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Badge className="bg-primary/20 text-primary">
                    {announcement.hazard_type}
                  </Badge>
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {filteredRegions.map((region) => {
            const config = riskConfig[region.riskLevel];
            const Icon = config.icon;
            
            return (
              <div
                key={region.id}
                className={cn(
                  "glass-panel p-5 transition-all duration-300 hover:border-primary/30 cursor-pointer",
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
                    Updated {new Date(region.lastUpdated).toLocaleTimeString()}
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

        {/* Subscribe Section */}
        <div className="glass-panel-elevated p-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">Alert Notifications</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">Stay Informed</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Subscribe to receive email alerts when hazard levels change in your selected region.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Your email address"
                value={subscribeEmail}
                onChange={(e) => setSubscribeEmail(e.target.value)}
                className="pl-10 bg-secondary border-border"
              />
            </div>
            <Button
              variant="hero"
              onClick={handleSubscribe}
              disabled={!selectedRegion || !subscribeEmail || isSubscribing}
            >
              {isSubscribing ? "Subscribing..." : "Subscribe"}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {selectedRegion ? (
            <p className="text-sm text-primary mt-3">
              Subscribing to: {regionStatuses.find((r) => r.id === selectedRegion)?.displayName}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground mt-3">
              Click on a region above to select it for alerts
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default Public;
