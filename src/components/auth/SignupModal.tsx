import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/nfclogo.jpg";

type RoleUI = "talent" | "hirer";

type SignupModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function SignupModal({ open, onOpenChange }: SignupModalProps) {
  const navigate = useNavigate();
  const [roleUI, setRoleUI] = useState<RoleUI>("talent");
  const roleDB = useMemo(() => (roleUI === "talent" ? "developer" : "recruiter"), [roleUI]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Accessibility: focus management on open
  useEffect(() => {
    if (open) setError(null);
  }, [open]);

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
         provider: "google",
         options: {
          redirectTo:  `${window.location.origin}/dashboard`,
         }
        
        });
      if (error) throw error;
    } catch (err: any) {
      setError(err?.message || "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Client-side validation mirroring reference behavior
    if (!fullName.trim()) {
      setError("Full name is required.");
      setLoading(false);
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setError("Enter a valid email address.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;

      if (data.user) {
        // Insert role into user_roles table
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({ user_id: data.user.id, role: roleDB });
        if (roleError) throw roleError;

        // Update profile with full name
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ full_name: fullName })
          .eq("id", data.user.id);
        if (profileError) throw profileError;
      }

      onOpenChange(false);
      // After signup, direct users to login via the route-driven modal
      navigate("/auth");
    } catch (err: any) {
      setError(err?.message || "Sign up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Container uses exact measurements to match reference */}
      <DialogContent
        id="auth-signup-modal"
        aria-label="Sign up"
        aria-labelledby="signup-modal-title"
        className="w-full max-w-md max-h-[85vh] overflow-y-auto no-scrollbar rounded-2xl border border-border bg-card p-6 shadow-xl"
      >
        {/* Brand */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <img src={logo} alt="Northern Founders logo" className="w-7 h-7 rounded-sm object-cover" />
          <span className="text-sm font-medium tracking-wide">NFC Talents</span>
        </div>

        <DialogHeader className="space-y-2 text-center">
          <DialogTitle id="signup-modal-title" className="text-2xl font-semibold">Create Your Account</DialogTitle>
          <p className="text-xs text-muted-foreground">
            Connect with top mentors, investors, and talent in the North.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" aria-describedby={error ? "signup-error" : undefined}>
          {/* Account Type segmented controls */}
          <div className="space-y-2">
            <Label className="text-sm">Account Type</Label>
            <div role="radiogroup" aria-label="Account Type" className="grid grid-cols-2 gap-3">
              {([
                { key: "talent" as RoleUI, label: "Talent" },
                { key: "hirer" as RoleUI, label: "Recruiter" },
              ]).map((opt) => {
                const selected = roleUI === opt.key;
                return (
                  <label key={opt.key} className="cursor-pointer">
                    <input
                      type="radio"
                      name="account-type"
                      value={opt.key}
                      checked={selected}
                      onChange={() => setRoleUI(opt.key)}
                      className="sr-only"
                    />
                    <div
                      className={
                        "flex items-center justify-center gap-2 rounded-md border px-5 py-3" +
                        (selected
                          ? " border-accent/70 ring-1 ring-accent bg-secondary text-foreground"
                          : " border-border bg-transparent text-muted-foreground")
                      }
                    >
                      <span
                        aria-hidden
                        className={
                          "inline-block h-2.5 w-2.5 rounded-full" +
                          (selected ? " bg-accent" : " bg-muted")
                        }
                      />
                      <span className="text-sm font-medium">{opt.label}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="signup-name" className="text-sm">Full Name</Label>
            <Input
              id="signup-name"
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              aria-required
              className="h-11"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="signup-email" className="text-sm">Email Address</Label>
            <Input
              id="signup-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              inputMode="email"
              aria-required
              className="h-11"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="signup-password" className="text-sm">Password</Label>
            <div className="relative">
              <Input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                aria-required
                className="h-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error ? (
            <p id="signup-error" role="alert" className="text-xs text-destructive-foreground bg-destructive/10 border border-destructive rounded-md px-3 py-2">
              {error}
            </p>
          ) : null}

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground hover:bg-[hsl(160,78%,48%)]"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Sign Up
          </Button>

          {/* Divider */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-3 text-xs text-muted-foreground">OR</span>
            </div>
          </div>

          {/* Google */}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleAuth}
            disabled={loading}
            aria-label="Sign Up with Google"
          >
            {!loading ? (
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            ) : (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Sign Up with Google
          </Button>

          {/* Footer links */}
          <p className="text-center text-xs text-muted-foreground">
            Already have an account? <a href="/auth" className="text-accent hover:underline">Log In</a>
          </p>
          <p className="text-center text-[11px] text-muted-foreground">
            By signing up, you agree to our <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}