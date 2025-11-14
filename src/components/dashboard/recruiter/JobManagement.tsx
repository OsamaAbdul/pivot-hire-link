import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit, Trash2 } from "lucide-react";

interface JobManagementProps {
  recruiterId: string;
  onUpdate: () => void;
}

const JobManagement = ({ recruiterId, onUpdate }: JobManagementProps) => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);

  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    job_type: "full_time" | "part_time" | "contract" | "freelance";
    location: string;
    remote_allowed: boolean;
    salary_range: string;
    application_deadline?: string;
    required_skills: string;
    experience_required: string;
    is_active: boolean;
  }>({
    title: "",
    description: "",
    job_type: "full_time",
    location: "",
    remote_allowed: false,
    salary_range: "",
    application_deadline: "",
    required_skills: "",
    experience_required: "",
    is_active: true,
  });

  const [viewTab, setViewTab] = useState<"active" | "drafts" | "past">("active");

  useEffect(() => {
    fetchJobs();
  }, [recruiterId]);

  const fetchJobs = async () => {
    const { data } = await supabase
      .from("jobs")
      .select("*")
      .eq("recruiter_id", recruiterId)
      .order("created_at", { ascending: false });

    setJobs(data || []);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      job_type: "full_time",
      location: "",
      remote_allowed: false,
      salary_range: "",
      application_deadline: "",
      required_skills: "",
      experience_required: "",
      is_active: true,
    });
    setEditingJob(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const skillsArray = formData.required_skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      // Normalize application_deadline to null when empty to satisfy DB type
      const jobData = {
        ...formData,
        application_deadline: formData.application_deadline ? formData.application_deadline : null,
        required_skills: skillsArray,
        recruiter_id: recruiterId,
      };

      if (editingJob) {
        let { error } = await supabase
          .from("jobs")
          .update(jobData)
          .eq("id", editingJob.id);
        // Fallback: environments without application_deadline column
        if (error && String(error.message || "").toLowerCase().includes("application_deadline")) {
          const { application_deadline, ...jobDataNoDeadline } = jobData as any;
          const retry = await supabase
            .from("jobs")
            .update(jobDataNoDeadline)
            .eq("id", editingJob.id);
          if (retry.error) throw retry.error;
          error = null;
        }
        if (error) throw error;
        toast.success("Job updated successfully!");
      } else {
        let { error } = await supabase.from("jobs").insert(jobData);
        // Fallback: environments without application_deadline column
        if (error && String(error.message || "").toLowerCase().includes("application_deadline")) {
          const { application_deadline, ...jobDataNoDeadline } = jobData as any;
          const retry = await supabase.from("jobs").insert(jobDataNoDeadline);
          if (retry.error) throw retry.error;
          error = null;
        }
        if (error) throw error;
        toast.success("Job posted successfully!");
      }

      setDialogOpen(false);
      resetForm();
      fetchJobs();
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || "Failed to save job");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    try {
      const skillsArray = formData.required_skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const jobData = {
        ...formData,
        application_deadline: formData.application_deadline ? formData.application_deadline : null,
        is_active: false,
        required_skills: skillsArray,
        recruiter_id: recruiterId,
      };

      let { error } = await supabase.from("jobs").insert(jobData);
      // Fallback: environments without application_deadline column
      if (error && String(error.message || "").toLowerCase().includes("application_deadline")) {
        const { application_deadline, ...jobDataNoDeadline } = jobData as any;
        const retry = await supabase.from("jobs").insert(jobDataNoDeadline);
        if (retry.error) throw retry.error;
        error = null;
      }
      if (error) throw error;
      toast.success("Draft saved");
      setDialogOpen(false);
      resetForm();
      fetchJobs();
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || "Failed to save draft");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (job: any) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      description: job.description,
      job_type: job.job_type,
      location: job.location || "",
      remote_allowed: job.remote_allowed,
      salary_range: job.salary_range || "",
      application_deadline: job.application_deadline || "",
      required_skills: job.required_skills?.join(", ") || "",
      experience_required: job.experience_required || "",
      is_active: job.is_active,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return;

    try {
      const { error } = await supabase.from("jobs").delete().eq("id", jobId);

      if (error) throw error;
      toast.success("Job deleted successfully!");
      fetchJobs();
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete job");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif font-bold">Job Postings</h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Post New Job
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif">
                {editingJob ? "Edit Job" : "Post New Job"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="job_type">Job Type *</Label>
                  <Select
                    value={formData.job_type}
                    onValueChange={(value: any) => setFormData({ ...formData, job_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_time">Full Time</SelectItem>
                      <SelectItem value="part_time">Part Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="remote_allowed"
                  checked={formData.remote_allowed}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, remote_allowed: checked })
                  }
                />
                <Label htmlFor="remote_allowed">Remote work allowed</Label>
              </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="salary_range">Salary Range</Label>
          <Input
            id="salary_range"
            value={formData.salary_range}
            onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
            placeholder="$50k - $80k"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="experience_required">Experience Required</Label>
          <Input
            id="experience_required"
            value={formData.experience_required}
            onChange={(e) =>
              setFormData({ ...formData, experience_required: e.target.value })
            }
            placeholder="2-5 years"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="application_deadline">Application Deadline</Label>
          <Input
            id="application_deadline"
            type="date"
            value={formData.application_deadline}
            onChange={(e) => setFormData({ ...formData, application_deadline: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="required_skills">Required Skills (comma-separated)</Label>
          <Input
            id="required_skills"
            value={formData.required_skills}
            onChange={(e) => setFormData({ ...formData, required_skills: e.target.value })}
            placeholder="React, TypeScript, Node.js"
          />
        </div>
      </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active (visible to developers)</Label>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="button" variant="secondary" onClick={handleSaveDraft} disabled={loading}>
                  {loading ? "Saving..." : "Save as Draft"}
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : editingJob ? "Update Job" : "Post Job"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Simple tabs to filter Active / Drafts / Past */}
      <div className="flex items-center gap-6 border-b border-border pb-3">
        {[
          { key: "active", label: `Active (${jobs.filter(j => j.is_active).length})` },
          { key: "drafts", label: `Drafts (${jobs.filter(j => !j.is_active).length})` },
          { key: "past", label: `Past (${jobs.filter(j => !j.is_active && new Date(j.created_at) < new Date(Date.now() - 30*24*60*60*1000)).length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            className={"text-sm px-1 pb-1 border-b-2 " + (viewTab === tab.key ? "border-primary text-foreground" : "border-transparent text-muted-foreground")}
            onClick={() => setViewTab(tab.key as any)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {jobs.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No jobs posted yet. Create your first job posting!
            </CardContent>
          </Card>
        ) : (
          jobs
            .filter((job) => {
              if (viewTab === "active") return job.is_active;
              if (viewTab === "drafts") return !job.is_active && new Date(job.created_at) >= new Date(Date.now() - 30*24*60*60*1000);
              // past: inactive older than 30 days
              return !job.is_active && new Date(job.created_at) < new Date(Date.now() - 30*24*60*60*1000);
            })
            .map((job) => (
            <Card key={job.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl font-serif">{job.title}</CardTitle>
                    <div className="flex gap-2 mt-2">
                      <Badge variant={job.is_active ? "default" : "secondary"}>
                        {job.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline">
                        {job.job_type.split("_").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(job)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(job.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground line-clamp-2">{job.description}</p>
                {job.required_skills && job.required_skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {job.required_skills.map((skill: string) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default JobManagement;
