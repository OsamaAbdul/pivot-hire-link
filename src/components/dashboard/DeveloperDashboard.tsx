import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Briefcase, FileText, User } from "lucide-react";
import { toast } from "sonner";
import DeveloperProfile from "./developer/DeveloperProfile";
import JobsList from "./developer/JobsList";
import ApplicationsList from "./developer/ApplicationsList";
import DashboardShell from "./talent/DashboardShell";
import DashboardHome from "./talent/DashboardHome";
import MessagesSection from "./talent/MessagesSection";
import RightAsidePanels from "./talent/RightAsidePanels";
import RecommendedJobs from "./developer/RecommendedJobs";

interface DeveloperDashboardProps {
  profile: any;
}

const DeveloperDashboard = ({ profile }: DeveloperDashboardProps) => {
  const [developerProfile, setDeveloperProfile] = useState<any>(null);
  const [stats, setStats] = useState({ applications: 0, pending: 0, approved: 0 });
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const activeSection = (searchParams.get("section") || "dashboard").toLowerCase();

  useEffect(() => {
    fetchDeveloperProfile();
    fetchStats();
  }, [profile.id]);

  const fetchDeveloperProfile = async () => {
    const { data } = await supabase
      .from("developer_profiles")
      .select("*")
      .eq("user_id", profile.id)
      .maybeSingle();

    setDeveloperProfile(data);
  };

  const fetchStats = async () => {
    const { data } = await supabase
      .from("applications")
      .select("status")
      .eq("developer_id", profile.id);

    if (data) {
      setStats({
        applications: data.length,
        pending: data.filter((a) => a.status === "pending").length,
        approved: data.filter((a) => a.status === "approved").length,
      });
    }
  };

  const handleSelect = (key: string) => {
    const isComplete = isProfileComplete(developerProfile);
    if (!isComplete && key !== "profile") {
      toast.error("Please complete your profile before accessing other sections.");
      key = "profile";
    }
    const sp = new URLSearchParams(location.search);
    sp.set("section", key);
    navigate({ search: sp.toString() }, { replace: true });
  };

  const isProfileComplete = (dp: any | null) => {
    if (!dp) return false;
    const hasSkills = Array.isArray(dp.skills) && dp.skills.length > 0;
    const hasBio = !!(dp.bio && dp.bio.trim().length);
    const hasSpec = !!(dp.specialization && dp.specialization.trim().length);
    const hasExp = !!(dp.experience_level && dp.experience_level.trim().length);
    return hasSkills && hasBio && hasSpec && hasExp;
  };

  // Gate access: if incomplete, force "profile" section
  useEffect(() => {
    const isComplete = isProfileComplete(developerProfile);
    if (!isComplete && activeSection !== "profile") {
      const sp = new URLSearchParams(location.search);
      sp.set("section", "profile");
      navigate({ search: sp.toString() }, { replace: true });
      toast.info("Finish your profile to unlock the dashboard.");
    }
  }, [developerProfile, activeSection, location.search, navigate]);

  const HomePanels = (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.applications}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <Badge variant="default" className="h-4 px-2">✓</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
          </CardContent>
        </Card>
      </div>
    </>
  );

  return (
    <DashboardShell active={activeSection} onSelect={handleSelect} rightAside={<RightAsidePanels />}>
      {activeSection === "dashboard" && (
        <>
          <DashboardHome name={profile.full_name || "Developer"} />
          {HomePanels}
          <div className="mt-6">
            <RecommendedJobs 
              developerId={profile.id} 
              developerSkills={developerProfile?.skills || []} 
            />
          </div>
        </>
      )}
      {activeSection === "messages" && <MessagesSection />}
      {activeSection === "profile" && (
        <DeveloperProfile 
          profile={profile} 
          developerProfile={developerProfile}
          onUpdate={fetchDeveloperProfile}
        />
      )}
      {activeSection === "challenges" && (
        <Tabs defaultValue="jobs" className="space-y-4">
          <TabsList>
            <TabsTrigger value="jobs">Browse Jobs</TabsTrigger>
            <TabsTrigger value="applications">My Applications</TabsTrigger>
          </TabsList>
          <TabsContent value="jobs">
            <JobsList developerId={profile.id} />
          </TabsContent>
          <TabsContent value="applications">
            <ApplicationsList developerId={profile.id} />
          </TabsContent>
        </Tabs>
      )}
      {activeSection === "settings" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Settings will be available soon.</p>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardShell>
  );
};

export default DeveloperDashboard;
