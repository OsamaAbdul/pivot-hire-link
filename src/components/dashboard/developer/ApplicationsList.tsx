import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Clock, CheckCircle, XCircle } from "lucide-react";

interface ApplicationsListProps {
  developerId: string;
}

const ApplicationsList = ({ developerId }: ApplicationsListProps) => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, [developerId]);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from("applications")
        .select(`
          *,
          jobs:job_id (
            *,
            profiles:recruiter_id (full_name),
            recruiter_profiles:recruiter_profiles!recruiter_profiles_user_id_fkey (company_name)
          )
        `)
        .eq("developer_id", developerId)
        .order("applied_at", { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error: any) {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

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

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" => {
    switch (status) {
      case "approved":
        return "default";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading applications...</div>;
  }

  return (
    <div className="grid gap-4">
      {applications.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            You haven't applied to any jobs yet
          </CardContent>
        </Card>
      ) : (
        applications.map((application) => (
          <Card key={application.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-serif">
                    {application.jobs.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {application.jobs.recruiter_profiles?.[0]?.company_name || "Company"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(application.status)}
                  <Badge variant={getStatusVariant(application.status)}>
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Applied on {new Date(application.applied_at).toLocaleDateString()}
              </p>
              {application.cover_letter && (
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-medium mb-2">Your Cover Letter:</p>
                  <p className="text-sm text-muted-foreground">{application.cover_letter}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default ApplicationsList;
