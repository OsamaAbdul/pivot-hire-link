import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Listen for OAuth callback session after redirect
  useEffect(() => {
    const handleSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // User just came back from Google OAuth. Route based on profile completeness.
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (roleData?.role === "developer") {
          const { data: devProfile } = await supabase
            .from("developer_profiles")
            .select("*")
            .eq("user_id", session.user.id)
            .maybeSingle();

          const requiredOK = !!devProfile &&
            !!devProfile.bio &&
            !!devProfile.specialization &&
            !!devProfile.experience_level &&
            Array.isArray(devProfile.skills) && devProfile.skills.length > 0;
          const hasAnyLink = !!devProfile && [
            devProfile.portfolio_url,
            devProfile.github_url,
            devProfile.linkedin_url,
            devProfile.resume_url,
          ].some((v) => !!v && String(v).trim().length > 0);

          if (!requiredOK || !hasAnyLink) {
            navigate("/profile/build", { replace: true });
            return;
          }
        }
        navigate("/dashboard", { replace: true });
      }
    };

    handleSession();

    // Optional: listen for future auth changes
    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .maybeSingle();
        if (roleData?.role === "developer") {
          const { data: devProfile } = await supabase
            .from("developer_profiles")
            .select("*")
            .eq("user_id", session.user.id)
            .maybeSingle();
          const requiredOK = !!devProfile && !!devProfile.bio && !!devProfile.specialization && !!devProfile.experience_level && Array.isArray(devProfile.skills) && devProfile.skills.length > 0;
          const hasAnyLink = !!devProfile && [devProfile.portfolio_url, devProfile.github_url, devProfile.linkedin_url, devProfile.resume_url].some((v) => !!v && String(v).trim().length > 0);
          if (!requiredOK || !hasAnyLink) {
            navigate("/profile/build", { replace: true });
            return;
          }
        }
        navigate("/dashboard", { replace: true });
      }
    });

    return () => subscription.subscription.unsubscribe();
  }, [navigate]);

  // This chief trigger nav bar redirect
  useEffect(() => {
    // Navbar inspects `/auth?mode=` and opens correct modal.
  }, [location]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <section className="container mx-auto px-6 pt-16 pb-10 text-center">
        <h1 className="font-serif font-extrabold text-4xl md:text-5xl">Authentication</h1>
        <p className="mt-3 text-sm md:text-base text-muted-foreground">
          Use the navigation bar to sign in or apply. This page automatically redirects once logged in.
        </p>
      </section>
      <Footer />
    </div>
  );
};

export default Auth;
