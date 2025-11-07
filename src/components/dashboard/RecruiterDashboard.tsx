import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, Users, FileText } from "lucide-react";
import RecruiterProfile from "./recruiter/RecruiterProfile";
import JobManagement from "./recruiter/JobManagement";
import DeveloperDirectory from "./recruiter/DeveloperDirectory";
import ApplicationsManager from "./recruiter/ApplicationsManager";
import MatchingDevelopers from "./recruiter/MatchingDevelopers";

interface RecruiterDashboardProps {
  profile: any;
}

const RecruiterDashboard = ({ profile }: RecruiterDashboardProps) => {
  const [recruiterProfile, setRecruiterProfile] = useState<any>(null);
  const [stats, setStats] = useState({ jobs: 0, applications: 0, developers: 0 });

  useEffect(() => {
    fetchRecruiterProfile();
    fetchStats();
  }, [profile.id]);

  const fetchRecruiterProfile = async () => {
    const { data } = await supabase
      .from("recruiter_profiles")
      .select("*")
      .eq("user_id", profile.id)
      .maybeSingle();

    setRecruiterProfile(data);
  };

  const fetchStats = async () => {
    const { data: jobs } = await supabase
      .from("jobs")
      .select("id")
      .eq("recruiter_id", profile.id);

    const { data: applications } = await supabase
      .from("applications")
      .select("id")
      .in("job_id", jobs?.map((j) => j.id) || []);

    const { data: developers } = await supabase
      .from("developer_profiles")
      .select("id");

    setStats({
      jobs: jobs?.length || 0,
      applications: applications?.length || 0,
      developers: developers?.length || 0,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold">Welcome back, {profile.full_name || "Recruiter"}!</h1>
          <p className="text-muted-foreground">Manage your job postings and find talent</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.jobs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.applications}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Developers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.developers}</div>
          </CardContent>
        </Card>
      </div>

      <MatchingDevelopers recruiterId={profile.id} />

      <Tabs defaultValue="jobs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="jobs">My Jobs</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="developers">Find Developers</TabsTrigger>
          <TabsTrigger value="profile">Company Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs">
          <JobManagement recruiterId={profile.id} onUpdate={fetchStats} />
        </TabsContent>

        <TabsContent value="applications">
          <ApplicationsManager recruiterId={profile.id} />
        </TabsContent>

        <TabsContent value="developers">
          <DeveloperDirectory />
        </TabsContent>

        <TabsContent value="profile">
          <RecruiterProfile 
            profile={profile} 
            recruiterProfile={recruiterProfile}
            onUpdate={fetchRecruiterProfile}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RecruiterDashboard;
