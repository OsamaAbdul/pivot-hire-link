import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type DevProfileForm = {
  bio: string;
  specialization: string;
  experience_level: string;
  skills: string[];
  github_url: string;
  linkedin_url: string;
  portfolio_url: string;
  resume_url: string;
  availability: string;
};

const REQUIRED_FIELDS: (keyof DevProfileForm)[] = [
  "bio",
  "specialization",
  "experience_level",
  "skills",
];

function isProfileComplete(form: DevProfileForm) {
  const requiredOK = (
    form.bio.trim().length > 0 &&
    form.specialization.trim().length > 0 &&
    form.experience_level.trim().length > 0 &&
    (form.skills?.length || 0) > 0
  );
  const hasAnyLink = [form.portfolio_url, form.github_url, form.linkedin_url, form.resume_url]
    .some((v) => !!v && v.trim().length > 0);
  return requiredOK && hasAnyLink;
}

export default function ProfileBuilder() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(0); // 0: About, 1: Skills, 2: Links, 3: Preview
  const [newSkill, setNewSkill] = useState("");
  const [form, setForm] = useState<DevProfileForm>({
    bio: "",
    specialization: "",
    experience_level: "",
    skills: [],
    github_url: "",
    linkedin_url: "",
    portfolio_url: "",
    resume_url: "",
    availability: "",
  });

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/auth", { replace: true });
          return;
        }
        setUserId(session.user.id);

        const { data } = await supabase
          .from("developer_profiles")
          .select("*")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (data) {
          setForm({
            bio: data.bio || "",
            specialization: data.specialization || "",
            experience_level: data.experience_level || "",
            skills: data.skills || [],
            github_url: data.github_url || "",
            linkedin_url: data.linkedin_url || "",
            portfolio_url: data.portfolio_url || "",
            resume_url: data.resume_url || "",
            availability: data.availability || "",
          });
        }
      } catch (e) {
        toast.error("Failed to load your profile");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [navigate]);

  const progressValue = useMemo(() => {
    const total = REQUIRED_FIELDS.length + 1; // +1 for any link
    let complete = 0;
    if (form.bio.trim()) complete++;
    if (form.specialization.trim()) complete++;
    if (form.experience_level.trim()) complete++;
    if ((form.skills?.length || 0) > 0) complete++;
    const hasAnyLink = [form.portfolio_url, form.github_url, form.linkedin_url, form.resume_url]
      .some((v) => v && v.trim().length > 0);
    if (hasAnyLink) complete++;
    return Math.round((complete / total) * 100);
  }, [form]);

  const saveDraft = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      const payload = {
        user_id: userId,
        bio: form.bio || null,
        specialization: form.specialization || null,
        experience_level: form.experience_level || null,
        skills: form.skills && form.skills.length > 0 ? form.skills : null,
        github_url: form.github_url || null,
        linkedin_url: form.linkedin_url || null,
        portfolio_url: form.portfolio_url || null,
        resume_url: form.resume_url || null,
        availability: form.availability || null,
      };

      const { data: existing } = await supabase
        .from("developer_profiles")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("developer_profiles")
          .update(payload)
          .eq("user_id", userId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("developer_profiles")
          .insert(payload);
        if (error) throw error;
      }
      toast.success("Profile saved");
    } catch (e: any) {
      toast.error(e?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitFinal = async () => {
    if (!isProfileComplete(form)) {
      toast.error("Please complete all required sections before submitting");
      return;
    }
    await saveDraft();
    toast.success("Profile completed! Redirecting to your dashboard...");
    navigate("/dashboard");
  };

  const addSkill = () => {
    const s = newSkill.trim();
    if (!s) return;
    if (form.skills.includes(s)) {
      setNewSkill("");
      return;
    }
    setForm((prev) => ({ ...prev, skills: [...(prev.skills || []), s] }));
    setNewSkill("");
  };

  const removeSkill = (s: string) => {
    setForm((prev) => ({ ...prev, skills: (prev.skills || []).filter((x) => x !== s) }));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-12">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="font-serif text-2xl md:text-3xl font-bold">Build Your Profile</h1>
          <p className="text-sm text-muted-foreground">Complete your profile to connect with mentors and investors.</p>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <Progress value={progressValue} />
              </div>
              <span className="text-xs text-muted-foreground">{progressValue}% complete</span>
            </div>
          </CardContent>
        </Card>

        {/* Step nav */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { k: 0, label: "About" },
            { k: 1, label: "Skills" },
            { k: 2, label: "Links" },
            { k: 3, label: "Preview" },
          ].map(({ k, label }) => (
            <Button key={k} variant={step === k ? "default" : "outline"} size="sm" onClick={() => setStep(k)}>
              {label}
            </Button>
          ))}
        </div>

        {step === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>About You</CardTitle>
              <CardDescription>Tell us about your background and role.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input
                    id="specialization"
                    value={form.specialization}
                    onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                    placeholder="UI/UX Designer, Frontend Engineer, Data Scientist"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Experience Level</Label>
                  <Select
                    value={form.experience_level || undefined}
                    onValueChange={(v) => setForm({ ...form, experience_level: v })}
                  >
                    <SelectTrigger id="experience">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="junior">Junior</SelectItem>
                      <SelectItem value="mid">Mid-level</SelectItem>
                      <SelectItem value="senior">Senior</SelectItem>
                      <SelectItem value="lead">Lead</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Write a short professional summary…"
                  rows={5}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="availability">Availability</Label>
                <Select
                  value={form.availability}
                  onValueChange={(value) => setForm({ ...form, availability: value })}
                >
                  <SelectTrigger id="availability">
                    <SelectValue placeholder="Select availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Not available">Not available</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={saveDraft} disabled={saving}>Save</Button>
              <Button onClick={async () => { await saveDraft(); setStep(1); }} disabled={saving}>Save & Continue</Button>
            </CardFooter>
          </Card>
        )}

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
              <CardDescription>Add your primary skills. Press Enter to add.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {(form.skills || []).map((s) => (
                  <Badge key={s} variant="secondary" className="px-2 py-1">
                    <span>{s}</span>
                    <button className="ml-2 text-xs text-muted-foreground" onClick={() => removeSkill(s)} aria-label={`Remove ${s}`}>✕</button>
                  </Badge>
                ))}
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-skill">Add a skill</Label>
                <Input
                  id="add-skill"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                  placeholder="e.g., React, Figma, Node.js"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={saveDraft} disabled={saving}>Save</Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
                <Button onClick={async () => { await saveDraft(); setStep(2); }} disabled={saving}>Save & Continue</Button>
              </div>
            </CardFooter>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Links</CardTitle>
              <CardDescription>Provide at least one link to your work or resume.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="portfolio_url">Portfolio URL</Label>
                  <Input
                    id="portfolio_url"
                    type="url"
                    value={form.portfolio_url}
                    onChange={(e) => setForm({ ...form, portfolio_url: e.target.value })}
                    placeholder="https://yourportfolio.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="resume_url">Resume URL</Label>
                  <Input
                    id="resume_url"
                    type="url"
                    value={form.resume_url}
                    onChange={(e) => setForm({ ...form, resume_url: e.target.value })}
                    placeholder="https://drive.google.com/…"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="github_url">GitHub</Label>
                  <Input
                    id="github_url"
                    type="url"
                    value={form.github_url}
                    onChange={(e) => setForm({ ...form, github_url: e.target.value })}
                    placeholder="https://github.com/yourhandle"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin_url">LinkedIn</Label>
                  <Input
                    id="linkedin_url"
                    type="url"
                    value={form.linkedin_url}
                    onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={saveDraft} disabled={saving}>Save</Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={async () => { await saveDraft(); setStep(3); }} disabled={saving}>Save & Continue</Button>
              </div>
            </CardFooter>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>Review your profile before submitting.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Specialization</Label>
                  <p className="text-sm text-muted-foreground">{form.specialization || "—"}</p>
                </div>
                <div className="space-y-2">
                  <Label>Experience Level</Label>
                  <p className="text-sm text-muted-foreground">{form.experience_level || "—"}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Bio</Label>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{form.bio || "—"}</p>
              </div>
              <div className="space-y-2">
                <Label>Skills</Label>
                <div className="flex flex-wrap gap-2">
                  {(form.skills || []).length > 0 ? (
                    form.skills.map((s) => <Badge key={s} variant="secondary">{s}</Badge>)
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Portfolio</Label>
                  <a href={form.portfolio_url || "#"} target="_blank" rel="noopener noreferrer" className="text-sm text-accent underline">
                    {form.portfolio_url || "—"}
                  </a>
                </div>
                <div className="space-y-2">
                  <Label>Resume</Label>
                  <a href={form.resume_url || "#"} target="_blank" rel="noopener noreferrer" className="text-sm text-accent underline">
                    {form.resume_url || "—"}
                  </a>
                </div>
                <div className="space-y-2">
                  <Label>GitHub</Label>
                  <a href={form.github_url || "#"} target="_blank" rel="noopener noreferrer" className="text-sm text-accent underline">
                    {form.github_url || "—"}
                  </a>
                </div>
                <div className="space-y-2">
                  <Label>LinkedIn</Label>
                  <a href={form.linkedin_url || "#"} target="_blank" rel="noopener noreferrer" className="text-sm text-accent underline">
                    {form.linkedin_url || "—"}
                  </a>
                </div>
              </div>
              {!isProfileComplete(form) && (
                <p className="text-xs text-destructive-foreground bg-destructive/15 border border-destructive rounded-md px-3 py-2">
                  Your profile is not complete yet. Please ensure Bio, Specialization, Experience, Skills, and at least one link are provided.
                </p>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                <Button variant="outline" onClick={() => setStep(0)}>Edit Details</Button>
              </div>
              <Button onClick={handleSubmitFinal} disabled={saving || !isProfileComplete(form)}>Submit Profile</Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}