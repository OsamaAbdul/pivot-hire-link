import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
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
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const PAGE_SIZE = 6;
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, [developerId]);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from("applications")
        .select("job_id")
        .eq("developer_id", developerId);

      if (error) throw error;
      setAppliedJobIds(new Set(data?.map(app => app.job_id) || []));
    } catch (error: any) {
      console.error("Failed to load applications:", error);
    }
  };

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select(`
          *,
          profiles:recruiter_id (
            full_name,
            recruiter_profiles!recruiter_profiles_user_id_fkey (company_name)
          )
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

    // Require a non-empty cover letter before submitting
    if (!coverLetter.trim()) {
      toast.error("Cover letter cannot be empty");
      setApplying(false);
      return;
    }

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
      fetchApplications();
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

  // Pagination derived values
  const totalPages = useMemo(() => Math.max(1, Math.ceil(jobs.length / PAGE_SIZE)), [jobs.length]);
  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return jobs.slice(start, start + PAGE_SIZE);
  }, [jobs, page]);

  useEffect(() => {
    // Reset/clamp page when jobs change
    setPage((p) => Math.min(p, Math.max(1, Math.ceil(jobs.length / PAGE_SIZE))));
  }, [jobs.length]);

  useEffect(() => {
    const el = document.getElementById("dev-jobs-grid");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [page]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: PAGE_SIZE }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="p-4 pb-3">
              <Skeleton className="h-4 w-40" />
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-9 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div
        id="dev-jobs-grid"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in slide-in-from-bottom-2 duration-300"
        key={page}
        aria-live="polite"
        aria-busy={loading ? "true" : "false"}
      >
        {jobs.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No jobs available at the moment
            </CardContent>
          </Card>
        ) : (
          paged.map((job) => (
            <Card
              key={job.id}
              className="transition-shadow transition-transform duration-200 hover:shadow-lg hover:-translate-y-0.5"
            >
              <CardHeader className="p-4 pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-serif">{job.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1 text-sm">
                      <span className="font-medium">
                        {job.profiles?.recruiter_profiles?.[0]?.company_name || "Company"}
                      </span>
                    </CardDescription>
                  </div>
                  <Badge>{formatJobType(job.job_type)}</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-3">{job.description}</p>

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

                <Button 
                  onClick={() => setSelectedJob(job)} 
                  className="w-full"
                  disabled={appliedJobIds.has(job.id)}
                  variant={appliedJobIds.has(job.id) ? "secondary" : "default"}
                >
                  {appliedJobIds.has(job.id) ? "Applied" : "Apply Now"}
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {jobs.length > PAGE_SIZE && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
              Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, jobs.length)} of {jobs.length} jobs
            </p>
            <p className="text-sm" aria-label={`Current page ${page} of ${totalPages}`}>Page {page} / {totalPages}</p>
          </div>
          <Pagination aria-label="Jobs pagination">
            <PaginationContent aria-controls="dev-jobs-grid">
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  aria-label="Previous page"
                  aria-disabled={page === 1}
                  onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)); }}
                />
              </PaginationItem>
              {(() => {
                const windowSize = 5;
                let start = Math.max(1, page - Math.floor(windowSize / 2));
                let end = start + windowSize - 1;
                if (end > totalPages) {
                  end = totalPages;
                  start = Math.max(1, end - windowSize + 1);
                }

                const items: JSX.Element[] = [];
                if (start > 1) {
                  items.push(
                    <PaginationItem key={1}>
                      <PaginationLink
                        href="#"
                        aria-label="Go to page 1"
                        aria-current={page === 1 ? "page" : undefined}
                        isActive={page === 1}
                        onClick={(e) => { e.preventDefault(); setPage(1); }}
                      >1</PaginationLink>
                    </PaginationItem>
                  );
                  if (start > 2) items.push(<PaginationItem key="start-ellipsis"><PaginationEllipsis /></PaginationItem>);
                }

                for (let n = start; n <= end; n++) {
                  items.push(
                    <PaginationItem key={n}>
                      <PaginationLink
                        href="#"
                        aria-label={`Go to page ${n}`}
                        aria-current={page === n ? "page" : undefined}
                        isActive={page === n}
                        onClick={(e) => { e.preventDefault(); setPage(n); }}
                      >{n}</PaginationLink>
                    </PaginationItem>
                  );
                }

                if (end < totalPages) {
                  if (end < totalPages - 1) items.push(<PaginationItem key="end-ellipsis"><PaginationEllipsis /></PaginationItem>);
                  items.push(
                    <PaginationItem key={totalPages}>
                      <PaginationLink
                        href="#"
                        aria-label={`Go to page ${totalPages}`}
                        aria-current={page === totalPages ? "page" : undefined}
                        isActive={page === totalPages}
                        onClick={(e) => { e.preventDefault(); setPage(totalPages); }}
                      >{totalPages}</PaginationLink>
                    </PaginationItem>
                  );
                }
                return items;
              })()}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  aria-label="Next page"
                  aria-disabled={page === totalPages}
                  onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(totalPages, p + 1)); }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif">Apply for {selectedJob?.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="coverLetter">Cover Letter (Required)</Label>
              <Textarea
                id="coverLetter"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Tell the recruiter why you're interested in this position..."
                rows={6}
                className="mt-2"
              />
              {coverLetter.trim().length === 0 && (
                <p className="mt-2 text-xs text-destructive">Please enter a cover letter.</p>
              )}
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setSelectedJob(null)}>
                Cancel
              </Button>
              <Button onClick={handleApply} disabled={applying || coverLetter.trim().length === 0}>
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
