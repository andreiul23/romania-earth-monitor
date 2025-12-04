import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Trash2, RefreshCw, Megaphone } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Announcement {
  id: string;
  region_id: string;
  region_name: string;
  hazard_type: string;
  message: string;
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
}

export function VolunteerAnnouncementsPanel() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("volunteer_announcements")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch {
      toast.error("Failed to load announcements");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleDeactivate = async (id: string) => {
    try {
      const { error } = await supabase
        .from("volunteer_announcements")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;
      toast.success("Announcement deactivated");
      fetchAnnouncements();
    } catch {
      toast.error("Failed to deactivate announcement");
    }
  };

  const hazardColors: Record<string, string> = {
    flood: "bg-flood/20 text-flood border-flood/30",
    vegetation: "bg-vegetation/20 text-vegetation border-vegetation/30",
    fire: "bg-danger/20 text-danger border-danger/30",
    hybrid: "bg-alert/20 text-alert border-alert/30",
  };

  return (
    <div className="glass-panel border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-primary" />
          Active Announcements
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchAnnouncements}
          disabled={isLoading}
        >
          <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
        </Button>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground text-center py-4">
          Loading...
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-4">
          No active announcements
        </div>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="p-3 rounded-lg bg-card/50 border border-border space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={cn("text-xs", hazardColors[announcement.hazard_type] || hazardColors.hybrid)}>
                      {announcement.hazard_type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {announcement.region_name}
                    </span>
                  </div>
                  <p className="text-sm">{announcement.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Posted: {new Date(announcement.created_at).toLocaleString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeactivate(announcement.id)}
                  className="text-muted-foreground hover:text-danger"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-xs text-muted-foreground flex items-center gap-1 pt-2 border-t border-border">
        <Users className="w-3 h-3" />
        {announcements.length} active announcement{announcements.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
