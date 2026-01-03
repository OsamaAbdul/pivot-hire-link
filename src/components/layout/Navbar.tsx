import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "@/assets/nfclogo.jpg";
import LoginModal from "@/components/auth/LoginModal";
import SignupModal from "@/components/auth/SignupModal";
import { Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Navbar = () => {
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isTalentsRoute = location.pathname.startsWith("/talents");

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
    } catch (e) {
      // noop: keep UI simple per requirement
    }
  };

  // Route-driven auth: automatically open modals when visiting /auth
  useEffect(() => {
    const isAuth = location.pathname === "/auth";
    if (isAuth) {
      const params = new URLSearchParams(location.search);
      const mode = params.get("mode");
      if (mode === "signup") {
        setSignupOpen(true);
        setLoginOpen(false);
      } else {
        setLoginOpen(true);
        setSignupOpen(false);
      }
    }
    // Close mobile menu on route changes for consistency
    setMobileOpen(false);
  }, [location]);

  // Global event-driven auth trigger so any page button can open modals
  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<{ mode?: "login" | "signup" }>;
      const mode = custom.detail?.mode || "login";
      if (mode === "signup") {
        setSignupOpen(true);
        setLoginOpen(false);
      } else {
        setLoginOpen(true);
        setSignupOpen(false);
      }
    };
    window.addEventListener("nfc:openAuth", handler as EventListener);
    return () => window.removeEventListener("nfc:openAuth", handler as EventListener);
  }, []);

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-border bg-card/60 backdrop-blur">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" aria-label="Go to landing page" className="flex items-center gap-3 hover:opacity-90">
            <img src={logo} alt="Northern Founders Community logo" className="w-8 h-8 rounded-full object-cover" />
            <span className="font-serif font-bold text-sm md:text-base">NFC Talents</span>
          </Link>
          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            {isTalentsRoute ? (
              <>
                <Link to="/" className="hover:text-foreground">Home</Link>
                <Link to="/jobs" className="hover:text-foreground">Jobs</Link>
                <Link to="/dashboard?section=profile" className="hover:text-foreground">My Profile</Link>
                <Link to="/dashboard?section=settings" className="hover:text-foreground">Settings</Link>
                <Button variant="outline" size="sm" onClick={handleSignOut}>Sign Out</Button>
              </>
            ) : (
              <>
                <Link to="/" className="hover:text-foreground">Home</Link>
                <Link to="/jobs" className="hover:text-foreground">Jobs</Link>
                <Link to="/about" className="hover:text-foreground">About Us</Link>
                <button onClick={() => setLoginOpen(true)} className="hover:text-foreground">Login</button>
                <Button size="sm" className="ml-2" onClick={() => setSignupOpen(true)}>Apply Now</Button>
              </>
            )}
          </div>
          {/* Mobile menu button */}
          <button
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-muted/20 focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Open menu"
            aria-controls="mobile-menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {/* Mobile navigation panel */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          className="md:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          onKeyDown={(e) => {
            if (e.key === "Escape") setMobileOpen(false);
          }}
        >
          <div className="absolute right-0 top-0 h-full w-72 max-w-[80vw] bg-card border-l border-border shadow-xl">
            <div className="px-5 py-4 flex items-center justify-between border-b border-border">
              <span className="font-serif font-semibold">Menu</span>
              <button
                className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-muted/20 focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <nav className="flex flex-col gap-1 p-4 text-sm">
              {isTalentsRoute ? (
                <>
                  <Link to="/" className="px-3 py-2 rounded hover:bg-muted/20" onClick={() => setMobileOpen(false)}>
                    Home
                  </Link>
                  <Link to="/jobs" className="px-3 py-2 rounded hover:bg-muted/20" onClick={() => setMobileOpen(false)}>
                    Jobs
                  </Link>
                  <Link to="/dashboard?section=profile" className="px-3 py-2 rounded hover:bg-muted/20" onClick={() => setMobileOpen(false)}>
                    My Profile
                  </Link>
                  <Link to="/dashboard?section=settings" className="px-3 py-2 rounded hover:bg-muted/20" onClick={() => setMobileOpen(false)}>
                    Settings
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setMobileOpen(false);
                      handleSignOut();
                    }}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/" className="px-3 py-2 rounded hover:bg-muted/20" onClick={() => setMobileOpen(false)}>
                    Home
                  </Link>
                  <Link to="/jobs" className="px-3 py-2 rounded hover:bg-muted/20" onClick={() => setMobileOpen(false)}>
                    Jobs
                  </Link>
                  <Link to="/about" className="px-3 py-2 rounded hover:bg-muted/20" onClick={() => setMobileOpen(false)}>
                    About Us
                  </Link>
                  <button
                    className="mt-2 px-3 py-2 text-left rounded hover:bg-muted/20"
                    onClick={() => {
                      setMobileOpen(false);
                      setLoginOpen(true);
                    }}
                  >
                    Login
                  </button>
                  <Button
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setMobileOpen(false);
                      setSignupOpen(true);
                    }}
                  >
                    Apply Now
                  </Button>
                </>
              )}
            </nav>
          </div>
        </div>
      )}

      <LoginModal
        open={loginOpen}
        onOpenChange={(open) => {
          setLoginOpen(open);
          if (!open && location.pathname === "/auth") navigate("/");
        }}
      />
      <SignupModal
        open={signupOpen}
        onOpenChange={(open) => {
          setSignupOpen(open);
          if (!open && location.pathname === "/auth") navigate("/");
        }}
      />
    </>
  );
};

export default Navbar;