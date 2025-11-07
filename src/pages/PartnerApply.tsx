import { useState } from "react";
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

  const validate = () => {
    const e: Record<string, string> = {};
    if (!company.trim()) e.company = "Company name is required.";
    if (!contact.trim()) e.contact = "Contact person is required.";
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) e.email = "Enter a valid email address.";
    if (!message.trim()) e.message = "Message is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    toast.loading("Submitting application…");
    try {
      // Simulate network latency for loading state fidelity
      await new Promise((r) => setTimeout(r, 1200));
      toast.success("Application submitted! We will reach out via email shortly.");
      setCompany("");
      setContact("");
      setEmail("");
      setType("Sponsorship");
      setMessage("");
    } catch (err) {
      toast.error("Submission failed. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputError = (key: string) => (errors[key] ? "border-red-500" : "border-input");

  return (
    <div className="min-h-screen partner-bg text-foreground">
      <Navbar />

      <section className="container mx-auto px-6 pt-14 md:pt-20 text-center">
        <div className="partner-brand justify-center">
          <img src={logo} alt="Northern Founders logo" className="w-6 h-6 rounded-sm object-cover" />
          <span>Northern Founders Community</span>
        </div>
        <h1 className="apply-title mt-3">Become a Partner</h1>
        <p className="apply-subtitle mt-3">
          Join us in our mission to empower the next generation of Northern talent. We’re looking
          for partners to help us build a thriving ecosystem.
        </p>
      </section>

      <section className="container mx-auto px-6 py-8">
        <form className="apply-form space-y-6 text-left" onSubmit={onSubmit} noValidate>
          <div>
            <Label className="apply-label">Company Name</Label>
            <Input
              className={`apply-input ${inputError("company")}`}
              placeholder="Your Company Inc."
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
            {errors.company && <p className="mt-2 text-xs text-red-400">{errors.company}</p>}
          </div>

          <div>
            <Label className="apply-label">Contact Person</Label>
            <Input
              className={`apply-input ${inputError("contact")}`}
              placeholder="Jane Doe"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
            {errors.contact && <p className="mt-2 text-xs text-red-400">{errors.contact}</p>}
          </div>

          <div>
            <Label className="apply-label">Email Address</Label>
            <Input
              className={`apply-input ${inputError("email")}`}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <p className="mt-2 text-xs text-red-400">{errors.email}</p>}
          </div>

          <div>
            <Label className="apply-label">Type of Partnership</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="apply-select" aria-label="Select type of partnership">
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
            <Label className="apply-label">Message</Label>
            <Textarea
              className={`apply-textarea ${inputError("message")}`}
              placeholder="Tell us how you’d like to partner with us..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            {errors.message && <p className="mt-2 text-xs text-red-400">{errors.message}</p>}
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

      <Footer />
    </div>
  );
};

export default PartnerApply;