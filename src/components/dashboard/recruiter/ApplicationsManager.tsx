import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CheckCircle, XCircle, Clock } from "lucide-react";

interface ApplicationsManagerProps {
  recruiterId: string;
}

const ApplicationsManager = ({ recruiterId }: ApplicationsManagerProps) => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    fetchApplications();
  }, [recruiterId]);

  const fetchApplications = async () => {
    try {
      const { data: jobs } = await supabase
        .from("jobs")
        .select("id")
        .eq("recruiter_id", recruiterId);

      if (!jobs || jobs.length === 0) {
        setApplications([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("applications")
        .select(`
          *,
          jobs:job_id (title, job_type),
          profiles:developer_id (
            full_name,
            email
          ),
          developer_profiles:developer_profiles!developer_profiles_user_id_fkey (
            skills,
            specialization,
            experience_level,
            resume_url
          )
        `)
        .in("job_id", jobs.map((j) => j.id))
        .order("applied_at", { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error: any) {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (applicationId: string, status: "pending" | "approved" | "rejected") => {
    try {
      const { error } = await supabase
        .from("applications")
        .update({ status })
        .eq("id", applicationId);

      if (error) throw error;

      toast.success(`Application ${status}`);
      fetchApplications();
    } catch (error: any) {
      toast.error("Failed to update application");
    }
  };

  const filteredApplications = applications.filter((app) => {
    if (filterStatus === "all") return true;
    return app.status === filterStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading applications...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif font-bold">Applications</h2>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No applications found
            </CardContent>
          </Card>
        ) : (
          filteredApplications.map((app) => (
            <Card key={app.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-serif">
                      {app.profiles?.full_name || "Developer"}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Applied for: {app.jobs?.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(app.applied_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(app.status)}
                    <Badge
                      variant={
                        app.status === "approved"
                          ? "default"
                          : app.status === "rejected"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {app.developer_profiles?.[0] && (
                  <div className="space-y-2">
                    <div className="flex gap-2 text-sm text-muted-foreground">
                      {app.developer_profiles[0].specialization && (
                        <span>{app.developer_profiles[0].specialization}</span>
                      )}
                      {app.developer_profiles[0].experience_level && (
                        <>
                          <span>•</span>
                          <span>{app.developer_profiles[0].experience_level}</span>
                        </>
                      )}
                    </div>

                    {app.developer_profiles[0].skills && (
                      <div className="flex flex-wrap gap-2">
                        {app.developer_profiles[0].skills.map((skill: string) => (
                          <Badge key={skill} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {app.cover_letter && (
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm font-medium mb-2">Cover Letter:</p>
                    <p className="text-sm text-muted-foreground">{app.cover_letter}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  {app.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleUpdateStatus(app.id, "approved")}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleUpdateStatus(app.id, "rejected")}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}
                  <Button size="sm" variant="outline" asChild>
                    <a href={`mailto:${app.profiles?.email}`}>Contact Applicant</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ApplicationsManager;
