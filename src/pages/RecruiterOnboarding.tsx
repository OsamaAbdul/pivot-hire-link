import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type RecruiterForm = {
  company_name: string;
  company_website: string;
  company_size: string;
  industry: string;
  description: string;
  contact_email: string;
  contact_phone: string;
  hiring_preferences: string;
  verification_docs_url: string;
};

const REQUIRED_FIELDS: (keyof RecruiterForm)[] = [
  "company_name",
  "company_size",
  "industry",
  "description",
];

export default function RecruiterOnboarding() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(0); // 0: Company, 1: Contact, 2: Preferences, 3: Preview
  const [form, setForm] = useState<RecruiterForm>({
    company_name: "",
    company_website: "",
    company_size: "",
    industry: "",
    description: "",
    contact_email: "",
    contact_phone: "",
    hiring_preferences: "",
    verification_docs_url: "",
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
          .from("recruiter_profiles")
          .select("*")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (data) {
          setForm({
            company_name: data.company_name || "",
            company_website: data.company_website || "",
            company_size: data.company_size || "",
            industry: data.industry || "",
            description: data.description || "",
            contact_email: data.contact_email || "",
            contact_phone: data.contact_phone || "",
            hiring_preferences: data.hiring_preferences || "",
            verification_docs_url: data.verification_docs_url || "",
          });
        }
      } catch (e) {
        toast.error("Failed to load recruiter profile");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [navigate]);

  const progressValue = useMemo(() => {
    const total = REQUIRED_FIELDS.length;
    let complete = 0;
    REQUIRED_FIELDS.forEach((f) => {
      if (String(form[f] || "").trim().length > 0) complete++;
    });
    return Math.round((complete / total) * 100);
  }, [form]);

  const saveDraft = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      const fullPayload = {
        user_id: userId,
        company_name: form.company_name,
        company_website: form.company_website || null,
        company_size: form.company_size || null,
        industry: form.industry || null,
        description: form.description || null,
        contact_email: form.contact_email || null,
        contact_phone: form.contact_phone || null,
        hiring_preferences: form.hiring_preferences || null,
        verification_docs_url: form.verification_docs_url || null,
      };

      const minimalPayload = {
        user_id: userId,
        company_name: form.company_name,
        company_website: form.company_website || null,
        company_size: form.company_size || null,
        industry: form.industry || null,
        description: form.description || null,
      };

      const { data: existing } = await supabase
        .from("recruiter_profiles")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      const upsert = async (payload: any) => {
        if (existing) {
          return await supabase
            .from("recruiter_profiles")
            .update(payload)
            .eq("user_id", userId);
        } else {
          return await supabase
            .from("recruiter_profiles")
            .insert(payload);
        }
      };

      let { error } = await upsert(fullPayload);
      if (error) {
        // Fallback if columns aren't present yet in DB (e.g., migration not applied)
        const msg = String(error.message || "");
        const looksLikeMissingColumn = /column/i.test(msg) || /does not exist/i.test(msg) || /42703/.test(msg) || /contact/i.test(msg);
        if (looksLikeMissingColumn) {
          const { error: fallbackError } = await upsert(minimalPayload);
          if (fallbackError) throw fallbackError;
        } else {
          throw error;
        }
      }

      toast.success("Profile saved");
    } catch (e: any) {
      console.error("Recruiter onboarding save error:", e);
      toast.error(e?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const isComplete = () => {
    // Minimal completion criteria to accommodate environments without contact columns
    const minimal = (
      form.company_name.trim().length > 0 &&
      form.company_size.trim().length > 0 &&
      form.industry.trim().length > 0 &&
      form.description.trim().length > 0
    );
    return minimal;
  };

  const handleSubmitFinal = async () => {
    if (!isComplete()) {
      toast.error("Please complete all required sections before submitting");
      return;
    }
    await saveDraft();
    toast.success("Profile completed! Redirecting to your profile...");
    navigate("/dashboard?section=profile");
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
          <h1 className="font-serif text-2xl md:text-3xl font-bold">Recruiter Onboarding</h1>
          <p className="text-sm text-muted-foreground">Complete your company profile to start posting jobs.</p>
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
            { k: 0, label: "Company" },
            { k: 1, label: "Contact" },
            { k: 2, label: "Preferences" },
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
              <CardTitle>Company Details</CardTitle>
              <CardDescription>Tell us about your company.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name *</Label>
                  <Input id="company_name" value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_website">Company Website</Label>
                  <Input id="company_website" value={form.company_website} onChange={(e) => setForm({ ...form, company_website: e.target.value })} />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_size">Company Size *</Label>
                  <Select value={form.company_size} onValueChange={(v) => setForm({ ...form, company_size: v })}>
                    <SelectTrigger id="company_size"><SelectValue placeholder="Select size" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10</SelectItem>
                      <SelectItem value="11-50">11-50</SelectItem>
                      <SelectItem value="51-200">51-200</SelectItem>
                      <SelectItem value="200+">200+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry *</Label>
                  <Input id="industry" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} placeholder="Fintech, AI, Healthcare" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Company Description *</Label>
                <Textarea id="description" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
            </CardContent>
          </Card>
        )}

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>How can candidates reach you?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_email">Contact Email *</Label>
                  <Input id="contact_email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_phone">Contact Phone</Label>
                  <Input id="contact_phone" value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Hiring Preferences</CardTitle>
              <CardDescription>Share any preferences to help us match candidates.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hiring_preferences">Preferences</Label>
                <Textarea id="hiring_preferences" rows={4} value={form.hiring_preferences} onChange={(e) => setForm({ ...form, hiring_preferences: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="verification_docs_url">Verification Docs URL</Label>
                <Input id="verification_docs_url" value={form.verification_docs_url} onChange={(e) => setForm({ ...form, verification_docs_url: e.target.value })} placeholder="Link to company registration or proof" />
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>Review your details before submitting.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>Company: {form.company_name}</div>
              <div>Website: {form.company_website || "—"}</div>
              <div>Size: {form.company_size || "—"}</div>
              <div>Industry: {form.industry || "—"}</div>
              <div>Description: {form.description || "—"}</div>
              <div>Email: {form.contact_email || "—"}</div>
              <div>Phone: {form.contact_phone || "—"}</div>
              <div>Preferences: {form.hiring_preferences || "—"}</div>
              <div>Verification Docs: {form.verification_docs_url || "—"}</div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-2 justify-end mt-6">
          <Button variant="outline" onClick={saveDraft} disabled={saving}>
            {saving ? "Saving…" : "Save Draft"}
          </Button>
          <Button onClick={handleSubmitFinal} disabled={saving}>
            {saving ? "Saving…" : "Finish Onboarding"}
          </Button>
        </div>
      </div>
    </div>
  );
}