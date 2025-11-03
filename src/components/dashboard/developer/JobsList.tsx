import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Briefcase, MapPin, DollarSign, Clock } from "lucide-react";

interface JobsListProps {
  developerId: string;
}

const JobsList = ({ developerId }: JobsListProps) => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select(`
          *,
          profiles:recruiter_id (full_name),
          recruiter_profiles:recruiter_profiles!recruiter_profiles_user_id_fkey (company_name)
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error: any) {
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!selectedJob) return;
    setApplying(true);

    try {
      const { error } = await supabase.from("applications").insert({
        job_id: selectedJob.id,
        developer_id: developerId,
        cover_letter: coverLetter,
      });

      if (error) throw error;

      toast.success("Application submitted successfully!");
      setSelectedJob(null);
      setCoverLetter("");
    } catch (error: any) {
      if (error.code === "23505") {
        toast.error("You've already applied for this job");
      } else {
        toast.error(error.message || "Failed to submit application");
      }
    } finally {
      setApplying(false);
    }
  };

  const formatJobType = (type: string) => {
    return type.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };

  if (loading) {
    return <div className="text-center py-8">Loading jobs...</div>;
  }

  return (
    <>
      <div className="grid gap-4">
        {jobs.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No jobs available at the moment
            </CardContent>
          </Card>
        ) : (
          jobs.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl font-serif">{job.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-2">
                      <span className="font-medium">
                        {job.recruiter_profiles?.[0]?.company_name || "Company"}
                      </span>
                    </CardDescription>
                  </div>
                  <Badge>{formatJobType(job.job_type)}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground line-clamp-3">{job.description}</p>

                <div className="flex flex-wrap gap-4 text-sm">
                  {job.location && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </div>
                  )}
                  {job.salary_range && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      {job.salary_range}
                    </div>
                  )}
                  {job.remote_allowed && (
                    <Badge variant="secondary">Remote</Badge>
                  )}
                </div>

                {job.required_skills && job.required_skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {job.required_skills.map((skill: string) => (
                      <Badge key={skill} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}

                <Button onClick={() => setSelectedJob(job)} className="w-full">
                  Apply Now
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif">Apply for {selectedJob?.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
              <Textarea
                id="coverLetter"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Tell the recruiter why you're interested in this position..."
                rows={6}
                className="mt-2"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setSelectedJob(null)}>
                Cancel
              </Button>
              <Button onClick={handleApply} disabled={applying}>
                {applying ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default JobsList;
