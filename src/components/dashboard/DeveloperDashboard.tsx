import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Briefcase, FileText, User } from "lucide-react";
import DeveloperProfile from "./developer/DeveloperProfile";
import JobsList from "./developer/JobsList";
import ApplicationsList from "./developer/ApplicationsList";

interface DeveloperDashboardProps {
  profile: any;
}

const DeveloperDashboard = ({ profile }: DeveloperDashboardProps) => {
  const [developerProfile, setDeveloperProfile] = useState<any>(null);
  const [stats, setStats] = useState({ applications: 0, pending: 0, approved: 0 });

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold">Welcome back, {profile.full_name || "Developer"}!</h1>
          <p className="text-muted-foreground">Manage your profile and track your applications</p>
        </div>
      </div>

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

      <Tabs defaultValue="jobs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="jobs">Browse Jobs</TabsTrigger>
          <TabsTrigger value="applications">My Applications</TabsTrigger>
          <TabsTrigger value="profile">My Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs">
          <JobsList developerId={profile.id} />
        </TabsContent>

        <TabsContent value="applications">
          <ApplicationsList developerId={profile.id} />
        </TabsContent>

        <TabsContent value="profile">
          <DeveloperProfile 
            profile={profile} 
            developerProfile={developerProfile}
            onUpdate={fetchDeveloperProfile}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeveloperDashboard;
