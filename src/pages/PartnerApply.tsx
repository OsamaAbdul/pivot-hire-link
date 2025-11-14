import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import "./PartnerApply.css";
import logo from "@/assets/nfclogo.jpg";

const PartnerApply = () => {
  const [company, setCompany] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState("Sponsorship");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string>("");

  const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/svg+xml"];
  const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setLogoError("");
    setErrors((prev) => ({ ...prev, logo: "" }));
    if (!file) {
      setLogoFile(null);
      setLogoPreview(null);
      setErrors((prev) => ({ ...prev, logo: "Company logo is required." }));
      return;
    }
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setLogoError("Invalid file type. Upload JPG, PNG, or SVG.");
      setErrors((prev) => ({ ...prev, logo: "Invalid logo file type." }));
      setLogoFile(null);
      setLogoPreview(null);
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setLogoError("File size exceeds 2MB limit.");
      setErrors((prev) => ({ ...prev, logo: "Logo must be ≤ 2MB." }));
      setLogoFile(null);
      setLogoPreview(null);
      return;
    }
    setLogoFile(file);
    const url = URL.createObjectURL(file);
    setLogoPreview(url);
  };

  const clearLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setLogoError("");
    setErrors((prev) => ({ ...prev, logo: "Company logo is required." }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!company.trim()) e.company = "Company name is required.";
    if (!contact.trim()) e.contact = "Contact person is required.";
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) e.email = "Enter a valid email address.";
    if (!message.trim()) e.message = "Message is required.";
    if (!logoFile) e.logo = "Company logo is required.";
    if (logoError) e.logo = logoError;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const toastId = toast.loading("Submitting application…");
    try {
      const toDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Failed to read logo file"));
        reader.readAsDataURL(file);
      });

      const logo_data_url = logoFile ? await toDataUrl(logoFile) : null;

      const { error } = await (supabase as any)
        .from("partner_applications")
        .insert({
          company,
          contact_person: contact,
          email,
          partnership_type: type,
          message,
          logo_data_url,
        });

      if (error) throw error;

      toast.success("Application submitted! We will reach out via email shortly.", { id: toastId });
      setCompany("");
      setContact("");
      setEmail("");
      setType("Sponsorship");
      setMessage("");
      clearLogo();
    } catch (err: any) {
      const msg = (() => {
        const raw = String(err?.message || "");
        const code = String((err && (err.code || err.status)) || "");
        if (code === "PGRST205" || /Could not find the table 'public\.partner_applications'/.test(raw)) {
          return "Server configuration error: partner_applications table not deployed. Please apply migrations and refresh API cache.";
        }
        if (code === "404" || /404/.test(raw) || /not found/i.test(raw)) {
          return "Server configuration error: partner applications endpoint not found. Please try again later.";
        }
        if (/relation .* does not exist/i.test(raw) || /42P01/.test(raw)) {
          return "Server configuration error: required table is missing.";
        }
        return raw || "Submission failed. Please try again later.";
      })();
      // Console for developers to diagnose
      console.error("Partner application submit failed:", err);
      toast.error(msg, { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const inputError = (key: string) => (errors[key] ? "border-red-500" : "border-input");

  return (
    <div className="min-h-screen partner-bg text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1">
      <section className="container mx-auto px-6 pt-14 md:pt-20 text-center">
        <div className="partner-brand justify-center">
          <img src={logo} alt="Northern Founders logo" className="w-6 h-6 rounded-sm object-cover" />
          <span>Northern Founders Community</span>
        </div>
        <h1 id="apply-title" className="apply-title mt-3">Become a Partner</h1>
        <p className="apply-subtitle mt-3">
          Join us in our mission to empower the next generation of Northern talent. We’re looking
          for partners to help us build a thriving ecosystem.
        </p>
      </section>

      <section className="container mx-auto px-6 py-8">
        <form className="apply-form space-y-6 text-left" onSubmit={onSubmit} noValidate>
          <div>
            <Label className="apply-label" htmlFor="company">Company Name <span className="required-asterisk" aria-hidden="true">*</span></Label>
            <Input
              id="company"
              className={`apply-input ${inputError("company")}`}
              placeholder="Your Company Inc."
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              aria-required="true"
              aria-invalid={!!errors.company}
              aria-describedby={errors.company ? "company-error" : undefined}
            />
            {errors.company && <p id="company-error" className="mt-2 text-xs text-red-600" role="alert">{errors.company}</p>}
          </div>

          <div>
            <Label className="apply-label" htmlFor="contact">Contact Person <span className="required-asterisk" aria-hidden="true">*</span></Label>
            <Input
              id="contact"
              className={`apply-input ${inputError("contact")}`}
              placeholder="Jane Doe"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              aria-required="true"
              aria-invalid={!!errors.contact}
              aria-describedby={errors.contact ? "contact-error" : undefined}
            />
            {errors.contact && <p id="contact-error" className="mt-2 text-xs text-red-600" role="alert">{errors.contact}</p>}
          </div>

          <div>
            <Label className="apply-label" htmlFor="email">Email Address <span className="required-asterisk" aria-hidden="true">*</span></Label>
            <Input
              id="email"
              className={`apply-input ${inputError("email")}`}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-required="true"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && <p id="email-error" className="mt-2 text-xs text-red-600" role="alert">{errors.email}</p>}
          </div>

          <div>
            <Label className="apply-label" htmlFor="partnership-type">Type of Partnership <span className="required-asterisk" aria-hidden="true">*</span></Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="partnership-type" className="apply-select" aria-label="Select type of partnership" aria-required="true">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Sponsorship">Sponsorship</SelectItem>
                <SelectItem value="Mentorship">Mentorship</SelectItem>
                <SelectItem value="Investment">Investment</SelectItem>
                <SelectItem value="Community Support">Community Support</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="apply-label" htmlFor="company-logo">Company Logo <span className="required-asterisk" aria-hidden="true">*</span></Label>
            <Input
              id="company-logo"
              type="file"
              accept="image/png, image/jpeg, image/svg+xml"
              className={`apply-input apply-file ${inputError("logo")}`}
              onChange={handleLogoChange}
              aria-required="true"
              aria-invalid={!!errors.logo}
              aria-describedby={errors.logo ? "logo-error" : undefined}
            />
            {errors.logo && (
              <p id="logo-error" className="mt-2 text-xs text-red-600" role="alert">{errors.logo}</p>
            )}
            {logoPreview && (
              <div className="mt-3 logo-preview" aria-live="polite">
                <img src={logoPreview} alt="Company logo preview" className="rounded-sm preview-image" />
                <Button type="button" variant="outline" size="sm" className="ml-3" onClick={clearLogo} aria-label="Clear uploaded logo">Clear</Button>
              </div>
            )}
          </div>

          <div>
            <Label className="apply-label" htmlFor="message">Message <span className="required-asterisk" aria-hidden="true">*</span></Label>
            <Textarea
              id="message"
              className={`apply-textarea ${inputError("message")}`}
              placeholder="Tell us how you’d like to partner with us..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              aria-required="true"
              aria-invalid={!!errors.message}
              aria-describedby={errors.message ? "message-error" : undefined}
            />
            {errors.message && <p id="message-error" className="mt-2 text-xs text-red-600" role="alert">{errors.message}</p>}
          </div>

          <div>
            <Button type="submit" className="w-full apply-button" disabled={submitting}>
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" className="opacity-75" />
                  </svg>
                  Submitting…
                </span>
              ) : (
                "Submit Application"
              )}
            </Button>
            <p className="mt-2 apply-legal">
              By submitting, you agree to our <a href="/privacy" className="underline">Privacy Policy</a> and
              <a href="/terms" className="underline ml-1">Terms of Service</a>.
            </p>
           
          </div>
        </form>
      </section>
      </main>

      <Footer />
    </div>
  );
};

export default PartnerApply;