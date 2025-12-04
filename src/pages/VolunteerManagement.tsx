import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Users, Mail, Trash2, RefreshCw, Search, 
  Calendar, Megaphone, ExternalLink 
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface VolunteerSignup {
  id: string;
  email: string;
  created_at: string;
  announcement_id: string;
  announcement?: {
    region_name: string;
    hazard_type: string;
    message: string;
    is_active: boolean;
  };
}

interface AnnouncementWithVolunteers {
  id: string;
  region_name: string;
  hazard_type: string;
  message: string;
  is_active: boolean;
  created_at: string;
  volunteers: { id: string; email: string; created_at: string }[];
}

export default function VolunteerManagement() {
  const [announcements, setAnnouncements] = useState<AnnouncementWithVolunteers[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);

  const fetchVolunteers = async () => {
    setIsLoading(true);
    try {
      // Fetch all announcements with their signups
      const { data: announcementsData, error: announcementsError } = await supabase
        .from("volunteer_announcements")
        .select("*")
        .order("created_at", { ascending: false });

      if (announcementsError) throw announcementsError;

      // Fetch all signups
      const { data: signupsData, error: signupsError } = await supabase
        .from("volunteer_signups")
        .select("*")
        .order("created_at", { ascending: false });

      if (signupsError) throw signupsError;

      // Group signups by announcement
      const announcementsWithVolunteers = (announcementsData || []).map(announcement => ({
        ...announcement,
        volunteers: (signupsData || []).filter(s => s.announcement_id === announcement.id)
      }));

      setAnnouncements(announcementsWithVolunteers);
    } catch (error) {
      console.error("Error fetching volunteers:", error);
      toast.error("Failed to load volunteer data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const handleDeleteSignup = async (signupId: string) => {
    try {
      const { error } = await supabase
        .from("volunteer_signups")
        .delete()
        .eq("id", signupId);

      if (error) throw error;
      toast.success("Volunteer removed");
      fetchVolunteers();
    } catch {
      toast.error("Failed to remove volunteer");
    }
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    try {
      // First delete all signups for this announcement
      await supabase
        .from("volunteer_signups")
        .delete()
        .eq("announcement_id", announcementId);

      // Then delete the announcement
      const { error } = await supabase
        .from("volunteer_announcements")
        .delete()
        .eq("id", announcementId);

      if (error) throw error;
      toast.success("Announcement deleted");
      fetchVolunteers();
    } catch {
      toast.error("Failed to delete announcement");
    }
  };

  const handleContactVolunteer = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const handleContactAll = (emails: string[]) => {
    if (emails.length === 0) {
      toast.error("No volunteers to contact");
      return;
    }
    window.location.href = `mailto:${emails.join(",")}`;
  };

  const toggleEmailSelection = (email: string) => {
    setSelectedEmails(prev => 
      prev.includes(email) 
        ? prev.filter(e => e !== email)
        : [...prev, email]
    );
  };

  const filteredAnnouncements = announcements.filter(a => 
    a.region_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.hazard_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.volunteers.some(v => v.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalVolunteers = announcements.reduce((sum, a) => sum + a.volunteers.length, 0);
  const allEmails = [...new Set(announcements.flatMap(a => a.volunteers.map(v => v.email)))];

  const hazardColors: Record<string, string> = {
    flood: "bg-flood/20 text-flood border-flood/30",
    vegetation: "bg-vegetation/20 text-vegetation border-vegetation/30",
    fire: "bg-danger/20 text-danger border-danger/30",
    hybrid: "bg-alert/20 text-alert border-alert/30",
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Users className="w-6 h-6 text-primary" />
                Volunteer Management
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                View and contact all volunteers who signed up for announcements
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm px-3 py-1">
                {totalVolunteers} Total Volunteers
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleContactAll(allEmails)}
                disabled={allEmails.length === 0}
              >
                <Mail className="w-4 h-4 mr-2" />
                Contact All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchVolunteers}
                disabled={isLoading}
              >
                <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by region, hazard type, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Announcements with Volunteers */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No announcements found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAnnouncements.map((announcement) => (
                <div
                  key={announcement.id}
                  className={cn(
                    "glass-panel-elevated border border-border rounded-xl overflow-hidden",
                    !announcement.is_active && "opacity-60"
                  )}
                >
                  {/* Announcement Header */}
                  <div className="px-4 py-3 bg-gradient-to-r from-card to-card/50 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={cn("text-xs", hazardColors[announcement.hazard_type] || hazardColors.hybrid)}>
                        {announcement.hazard_type}
                      </Badge>
                      <span className="font-medium">{announcement.region_name}</span>
                      {!announcement.is_active && (
                        <Badge variant="secondary" className="text-xs">Inactive</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        <Users className="w-3 h-3 mr-1" />
                        {announcement.volunteers.length} volunteers
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleContactAll(announcement.volunteers.map(v => v.email))}
                        disabled={announcement.volunteers.length === 0}
                        className="h-8"
                      >
                        <Mail className="w-4 h-4 mr-1" />
                        Contact All
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAnnouncement(announcement.id)}
                        className="h-8 text-danger hover:text-danger hover:bg-danger/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Announcement Message */}
                  <div className="px-4 py-2 bg-muted/30 text-sm text-muted-foreground border-b border-border">
                    {announcement.message}
                  </div>

                  {/* Volunteers List */}
                  <div className="p-4">
                    {announcement.volunteers.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No volunteers have signed up yet
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {announcement.volunteers.map((volunteer) => (
                          <div
                            key={volunteer.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border/50 hover:border-primary/30 transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Users className="w-4 h-4 text-primary" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{volunteer.email}</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(volunteer.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleContactVolunteer(volunteer.email)}
                                className="h-7 w-7 p-0"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteSignup(volunteer.id)}
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-danger hover:bg-danger/10"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
