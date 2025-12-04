import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Trash2, RefreshCw, Megaphone, AlertCircle, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AnnouncementCreationForm } from "./AnnouncementCreationForm";

interface Announcement {
  id: string;
  region_id: string;
  region_name: string;
  hazard_type: string;
  message: string;
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
  volunteer_count?: number;
}

const MAX_ANNOUNCEMENTS = 3;

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
        .order("created_at", { ascending: false })
        .limit(MAX_ANNOUNCEMENTS);

      if (error) throw error;

      // Fetch volunteer counts for each announcement
      const announcementsWithCounts = await Promise.all(
        (data || []).map(async (announcement) => {
          const { count } = await supabase
            .from("volunteer_signups")
            .select("*", { count: "exact", head: true })
            .eq("announcement_id", announcement.id);
          return { ...announcement, volunteer_count: count || 0 };
        })
      );

      setAnnouncements(announcementsWithCounts);
    } catch {
      toast.error("Failed to load announcements");
    } finally {
      setIsLoading(false);
    }
  };

  // Cleanup old announcements - keep only latest 3
  const cleanupOldAnnouncements = async () => {
    try {
      // Get all active announcements ordered by date
      const { data: allAnnouncements, error: fetchError } = await supabase
        .from("volunteer_announcements")
        .select("id, created_at")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      // If more than MAX_ANNOUNCEMENTS, deactivate the oldest ones
      if (allAnnouncements && allAnnouncements.length > MAX_ANNOUNCEMENTS) {
        const toDeactivate = allAnnouncements.slice(MAX_ANNOUNCEMENTS).map(a => a.id);
        
        const { error: updateError } = await supabase
          .from("volunteer_announcements")
          .update({ is_active: false })
          .in("id", toDeactivate);

        if (updateError) throw updateError;
      }
    } catch (error) {
      console.error("Failed to cleanup old announcements:", error);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    cleanupOldAnnouncements();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('volunteer_announcements_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'volunteer_announcements',
        },
        () => {
          fetchAnnouncements();
          cleanupOldAnnouncements();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDelete = async (id: string) => {
    try {
      // First delete all signups for this announcement
      await supabase
        .from("volunteer_signups")
        .delete()
        .eq("announcement_id", id);

      // Then delete the announcement
      const { error } = await supabase
        .from("volunteer_announcements")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Announcement deleted");
      fetchAnnouncements();
    } catch {
      toast.error("Failed to delete announcement");
    }
  };

  const hazardColors: Record<string, string> = {
    flood: "bg-flood/20 text-flood border-flood/30",
    vegetation: "bg-vegetation/20 text-vegetation border-vegetation/30",
    fire: "bg-danger/20 text-danger border-danger/30",
    hybrid: "bg-alert/20 text-alert border-alert/30",
  };

  const hazardIcons: Record<string, string> = {
    flood: "🌊",
    vegetation: "🌿",
    fire: "🔥",
    hybrid: "⚠️",
  };

  return (
    <div className="glass-panel-elevated border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-alert/10 to-danger/10 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-alert" />
          <span>Active Volunteer Requests</span>
          <Badge variant="outline" className="ml-1 text-xs bg-background/50">
            {announcements.length}/{MAX_ANNOUNCEMENTS}
          </Badge>
        </h3>
        <div className="flex items-center gap-2">
          <AnnouncementCreationForm onCreated={fetchAnnouncements} />
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="h-8"
          >
            <Link to="/volunteers">
              <ExternalLink className="w-4 h-4 mr-1" />
              Manage
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchAnnouncements}
            disabled={isLoading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-6 space-y-2">
            <AlertCircle className="w-8 h-8 text-muted-foreground/50 mx-auto" />
            <p className="text-sm text-muted-foreground">No active volunteer requests</p>
            <p className="text-xs text-muted-foreground/70">
              High-risk zones will trigger volunteer requests
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {announcements.map((announcement, index) => (
              <div
                key={announcement.id}
                className={cn(
                  "relative p-4 rounded-lg border transition-all duration-300 hover:shadow-lg",
                  "bg-gradient-to-br from-card to-card/50",
                  index === 0 && "ring-1 ring-alert/30"
                )}
              >
                {index === 0 && (
                  <div className="absolute -top-2 -right-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-alert text-alert-foreground rounded-full uppercase">
                      Latest
                    </span>
                  </div>
                )}
                
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{hazardIcons[announcement.hazard_type] || "⚠️"}</span>
                    <Badge className={cn("text-xs", hazardColors[announcement.hazard_type] || hazardColors.hybrid)}>
                      {announcement.hazard_type}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(announcement.id)}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-danger hover:bg-danger/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
                
                <h4 className="font-medium text-sm mb-1">{announcement.region_name}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                  {announcement.message}
                </p>
                
                <div className="flex items-center justify-between text-[10px] text-muted-foreground/70">
                  <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
                  <div className="flex items-center gap-1 text-primary font-medium">
                    <Users className="w-3 h-3" />
                    <span>{announcement.volunteer_count || 0} volunteers</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
