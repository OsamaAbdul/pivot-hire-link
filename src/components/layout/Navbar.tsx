import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "@/assets/nfclogo.jpg";
import LoginModal from "@/components/auth/LoginModal";
import SignupModal from "@/components/auth/SignupModal";

const Navbar = () => {
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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
  }, [location]);

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-border bg-card/60 backdrop-blur">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" aria-label="Go to landing page" className="flex items-center gap-3 hover:opacity-90">
            <img src={logo} alt="Northern Founders Community logo" className="w-8 h-8 rounded-full object-cover" />
            <span className="font-serif font-bold text-sm md:text-base">NFC Talents</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            
            <Link to="/talents" className="hover:text-foreground">Talents</Link>
            <Link to="/about" className="hover:text-foreground">About Us</Link>
            <Link to="/partners" className="hover:text-foreground">Partners</Link>
            <button onClick={() => setLoginOpen(true)} className="hover:text-foreground">Login</button>
            <Button size="sm" className="ml-2" onClick={() => setSignupOpen(true)}>Apply Now</Button>
          </div>
        </div>
      </nav>

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