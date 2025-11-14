import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff } from "lucide-react";
import logo from "@/assets/nfclogo.jpg";

type LoginModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

// Pixel-perfect login modal modeled on the provided reference
export default function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const location = useLocation();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      onOpenChange(false);
      // If developer and profile incomplete, send to builder; else dashboard
      if (data.session) {
        const userId = data.session.user.id;
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .maybeSingle();
        if (roleData?.role === "developer") {
          const { data: devProfile } = await supabase
            .from("developer_profiles")
            .select("*")
            .eq("user_id", userId)
            .maybeSingle();
          const requiredOK = !!devProfile && !!devProfile.bio && !!devProfile.specialization && !!devProfile.experience_level && Array.isArray(devProfile.skills) && devProfile.skills.length > 0;
          const hasAnyLink = !!devProfile && [devProfile.portfolio_url, devProfile.github_url, devProfile.linkedin_url, devProfile.resume_url].some((v) => !!v && String(v).trim().length > 0);
          if (!requiredOK || !hasAnyLink) {
            navigate("/profile/build");
            return;
          }
        }
      }
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  // logging in with google

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
         provider: "google",
          options: {
        redirectTo: `${window.location.origin}/dashboard`, 
      },
        });
      if (error) throw error;
    } catch (err: any) {
      setError(err?.message || "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent id="auth-login-modal" className="w-full max-w-md max-h-[85vh] overflow-y-auto no-scrollbar rounded-[var(--radius)] border border-border bg-card p-6 shadow-lg" aria-labelledby="login-modal-title">
        {/* Brand */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <img src={logo} alt="Northern Founders logo" className="w-7 h-7 rounded-sm object-cover" />
          <span className="text-sm font-medium tracking-wide">NFC Talents</span>
        </div>

        <DialogHeader className="text-center space-y-2">
          <DialogTitle id="login-modal-title" className="text-2xl md:text-3xl font-semibold">Welcome Back</DialogTitle>
          <p className="text-sm text-muted-foreground">Log in to access the community platform.</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-email" className="text-sm">Email</Label>
            <Input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-invalid={!!error}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="login-password" className="text-sm">Password</Label>
              <a href="#" className="text-xs text-accent hover:underline">Forgot Password?</a>
            </div>
            <div className="relative">
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                aria-invalid={!!error}
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
            <p className="text-xs text-destructive-foreground bg-destructive/10 border border-destructive rounded-md px-3 py-2">
              {error}
            </p>
          ) : null}

          <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-[hsl(160,78%,48%)]">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Log In
          </Button>
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
                      Sign In with Google
                    </Button>
        </form>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Don't have an account? <a href="/auth?mode=signup" className="text-accent hover:underline">Sign Up</a>
        </p>
      </DialogContent>
    </Dialog>
  );
}