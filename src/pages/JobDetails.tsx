import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/hooks/useSessionManager";
import { getJobById, JOBS } from "@/lib/jobs-data";
import LoginModal from "@/components/auth/LoginModal";
import SignupModal from "@/components/auth/SignupModal";
import { toast } from "sonner";
import { Bookmark, MapPin, Briefcase, Clock, FileUp, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type UploadFile = { file?: File | null; name?: string };

type DbJob = {
  id: string;
  title: string;
  description: string | null;
  job_type: "full_time" | "part_time" | "contract" | "freelance" | null;
  location: string | null;
  remote_allowed: boolean | null;
  salary_range: string | null;
  experience_required: string | null; // entry | mid | senior
  required_skills: string[] | null;
  created_at: string | null;
  profiles?: {
    recruiter_profiles?: Array<{ company_name?: string | null }>
  } | null;
};

function mapDbType(t: DbJob["job_type"]): "Full-time" | "Part-time" | "Contract" {
  switch (t) {
    case "full_time":
      return "Full-time";
    case "part_time":
      return "Part-time";
    case "contract":
    case "freelance":
    default:
      return "Contract";
  }
}

function mapExperience(exp: string | null | undefined): "Entry" | "Mid" | "Senior" | undefined {
  if (!exp) return undefined;
  const e = exp.toLowerCase();
  if (e.startsWith("entry") || e.startsWith("junior")) return "Entry";
  if (e.startsWith("mid")) return "Mid";
  return "Senior";
}

export default function JobDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [job, setJob] = useState<ReturnType<typeof getJobById> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { status } = useSession();

  const [showAuthChoice, setShowAuthChoice] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showApply, setShowApply] = useState(false);

  // Application form state
  const [resume, setResume] = useState<UploadFile>({ file: null, name: "" });
  const [coverLetter, setCoverLetter] = useState("");
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!id) {
        setJob(null);
        setLoading(false);
        return;
      }

      // Try DB first
      try {
        const { data, error } = await supabase
          .from("jobs")
          .select(
            `*, profiles:recruiter_id ( recruiter_profiles!recruiter_profiles_user_id_fkey (company_name) )`
          )
          .eq("id", id)
          .maybeSingle();

        if (!error && data) {
          const r = data as DbJob;
          const mapped = {
            id: r.id,
            title: r.title,
            company: r.profiles?.recruiter_profiles?.[0]?.company_name || "Company",
            location: r.location || "—",
            type: mapDbType(r.job_type),
            experience: mapExperience(r.experience_required) || "Mid",
            tags: (r.required_skills || []) as string[],
            summary: r.description || "",
            description: r.description || undefined,
            responsibilities: undefined,
            requirements: undefined,
            preferred: undefined,
            salaryRange: r.salary_range || undefined,
            officePolicy: r.remote_allowed ? "Remote" : "Onsite",
            applyBy: undefined,
          };
          if (!cancelled) {
            setJob(mapped as any);
            setLoading(false);
          }
          return;
        }
      } catch {
        // ignore and fallback
      }

      // Fallback to static dataset
      const staticJob = getJobById(id);
      if (!cancelled) {
        setJob(staticJob || null);
        setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="container mx-auto px-6 py-12">
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">Loading job details…</p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="container mx-auto px-6 py-12">
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">Job not found.</p>
              <Button variant="secondary" className="mt-4" onClick={() => navigate("/jobs")}>Back to Jobs</Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const onApplyClick = () => {
    if (status === "authenticated") {
      setShowApply(true);
    } else if (status === "unauthenticated") {
      setShowAuthChoice(true);
    }
  };

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setResume({ file, name: file ? file.name : "" });
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resume.file) {
      toast.error("Please upload your resume/CV.");
      return;
    }
    setSubmitting(true);
    toast.loading("Submitting application…");
    try {
      await new Promise((r) => setTimeout(r, 1200));
      toast.success("Application submitted successfully!");
      setShowApply(false);
      setResume({ file: null, name: "" });
      setCoverLetter("");
      setAnswer("");
    } catch {
      toast.error("Failed to submit application. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const snapshot = [
    { label: "Salary", value: job.salaryRange || "—" },
    { label: "Experience", value: job.experience },
    { label: "Office", value: job.officePolicy || "—" },
    { label: "Apply By", value: job.applyBy || "—" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="container mx-auto px-6 py-8 flex-1">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main content */}
          <section className="flex-1 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">{job.company} • {job.location}</p>
                <h1 className="text-3xl md:text-4xl font-semibold leading-tight">{job.title}</h1>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-[11px] inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> {job.location}
                  </Badge>
                  <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-[11px] inline-flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5" /> {job.type}
                  </Badge>
                  <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-[11px] inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> {job.experience}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="gap-2" onClick={onApplyClick} aria-label="Apply for this job">
                  Apply Now
                </Button>
                <Button variant="outline" className="gap-2" aria-label="Save job">
                  <Bookmark className="h-4 w-4 text-accent" /> Save Job
                </Button>
              </div>
            </div>

            {/* About / Description */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">About the Role</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">{job.description || job.summary}</p>
              </CardContent>
            </Card>

            {/* Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 ? (
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">Key Responsibilities</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                    {job.responsibilities.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ) : null}

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 ? (
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">Required Qualifications</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                    {job.requirements.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ) : null}

            {/* Preferred */}
            {job.preferred && job.preferred.length > 0 ? (
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">Preferred Qualifications</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                    {job.preferred.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ) : null}
          </section>

          {/* Sidebar */}
          <aside className="w-full lg:w-[340px] xl:w-[380px] space-y-6">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Job Snapshot</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {snapshot.map((row) => (
                  <div key={row.label} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="font-medium">{row.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>

      <Footer />

      {/* Auth Choice Modal */}
      <Dialog open={showAuthChoice} onOpenChange={setShowAuthChoice}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Apply to {job.title}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">You need an account to apply. Choose an option below.</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Button className="w-full" onClick={() => { setShowAuthChoice(false); setShowLogin(true); }}>Log In</Button>
            <Button variant="secondary" className="w-full" onClick={() => { setShowAuthChoice(false); setShowSignup(true); }}>Create Account</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Login / Signup Modals */}
      <LoginModal open={showLogin} onOpenChange={(o) => setShowLogin(o)} />
      <SignupModal open={showSignup} onOpenChange={(o) => setShowSignup(o)} />

      {/* Application Form Modal (authenticated only) */}
      <Dialog open={showApply} onOpenChange={setShowApply}>
        <DialogContent className="w-full max-w-xl">
          <DialogHeader>
            <DialogTitle>Apply to {job.title}</DialogTitle>
          </DialogHeader>

          <form className="space-y-6" onSubmit={handleSubmitApplication}>
            {/* Upload */}
            <div>
              <Label className="text-sm">Upload your Resume / CV</Label>
              <div className="mt-2 border border-border rounded-md p-4 bg-muted/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-secondary flex items-center justify-center">
                      <FileUp className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm">Upload your Resume / CV</p>
                      <p className="text-xs text-muted-foreground">Drag & drop your file here or click to browse.</p>
                    </div>
                  </div>
                  <Input type="file" accept=".pdf,.doc,.docx,.txt" onChange={onUpload} aria-label="Upload resume" />
                </div>
                {resume.name ? (
                  <p className="mt-2 text-xs text-muted-foreground">Selected: {resume.name}</p>
                ) : null}
              </div>
            </div>

            {/* Cover Letter */}
            <div>
              <Label className="text-sm">Cover Letter (Optional)</Label>
              <Textarea
                className="mt-2"
                placeholder="Tell us why you're excited about this role..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
              />
            </div>

            {/* Application Question */}
            <div>
              <Label className="text-sm">Why are you the right fit for this role?</Label>
              <Textarea
                className="mt-2"
                placeholder="Share your experience and how it aligns with our needs..."
                required
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                aria-invalid={!answer}
              />
            </div>

            <div className="flex items-center justify-between">
              <Button type="button" variant="outline" className="px-6">Save Draft</Button>
              <Button type="submit" disabled={submitting} className="px-6">
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Submit Application
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}