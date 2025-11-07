import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DeveloperProfile from "./developer/DeveloperProfile";
import JobsList from "./developer/JobsList";
import ApplicationsList from "./developer/ApplicationsList";
import DashboardShell from "./talent/DashboardShell";
import DashboardHome from "./talent/DashboardHome";
import MessagesSection from "./talent/MessagesSection";
import AccountSettings from "./settings/AccountSettings";

interface DeveloperDashboardProps {
  profile: any;
}

const DeveloperDashboard = ({ profile }: DeveloperDashboardProps) => {
  const [developerProfile, setDeveloperProfile] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const activeSection = (searchParams.get("section") || "dashboard").toLowerCase();

  useEffect(() => {
    fetchDeveloperProfile();
  }, [profile.id]);

  const fetchDeveloperProfile = async () => {
    const { data } = await supabase
      .from("developer_profiles")
      .select("*")
      .eq("user_id", profile.id)
      .maybeSingle();

    setDeveloperProfile(data);
  };


  const handleSelect = (key: string) => {
    const sp = new URLSearchParams(location.search);
    sp.set("section", key);
    navigate({ search: sp.toString() }, { replace: true });
  };

  // Statistics and leaderboard panels removed per requirements.

  return (
    <DashboardShell active={activeSection} onSelect={handleSelect}>
      {activeSection === "dashboard" && (
        <>
          <DashboardHome name={profile.full_name || "Developer"} />
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
      {activeSection === "job" && (
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
        <AccountSettings profile={profile} />
      )}
    </DashboardShell>
  );
};

export default DeveloperDashboard;
