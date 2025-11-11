import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import DeveloperDashboard from "@/components/dashboard/DeveloperDashboard";
import RecruiterDashboard from "@/components/dashboard/RecruiterDashboard";
import RoleSelection from "@/components/dashboard/RoleSelection";
import logo from "@/assets/nfclogo.jpg";
import ConfirmLogoutModal from "@/components/auth/ConfirmLogoutModal";
import NotificationBell from "@/components/header/NotificationBell";
import NFCLoader from "@/components/nfc-loader";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Avoid redirecting on INITIAL_SESSION when session may be null during hydration.
      if (event === "SIGNED_OUT") {
        navigate("/auth");
        return;
      }
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        checkUser();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;

      // Fetch user role from user_roles table
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .maybeSingle();

      setProfile({ ...profileData, role: roleData?.role });

      // If developer, enforce profile completion before allowing dashboard access
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
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoggingOut(true);
      await supabase.auth.signOut();
      setLogoutOpen(false);
      navigate("/");
      toast.success("Signed out successfully");
    } catch (error: any) {
      toast.error("Failed to sign out");
    } finally {
      setLoggingOut(false);
    }
  };

  const handleRoleUpdate = async () => {
    await checkUser();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {/* <Loader2 className="h-8 w-8 animate-spin text-primary" /> */}
        <NFCLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={logo} alt="NFC Logo" className="w-12 h-12 rounded-full object-cover" />
            <div>
              <h2 className="font-serif font-bold text-lg text-foreground">NFC Talents</h2>
              <p className="text-sm text-muted-foreground">
                {profile?.role === "developer" ? "Your Dashboard" : "Recruiter Dashboard"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <Button variant="outline" onClick={() => setLogoutOpen(true)}>
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="container mx-auto px-6 py-8">
        {!profile?.role ? (
          <RoleSelection userId={user?.id} onRoleSelected={handleRoleUpdate} />
        ) : profile.role === "developer" ? (
          <DeveloperDashboard profile={profile} />
        ) : (
          <RecruiterDashboard profile={profile} />
        )}
      </div>
      <ConfirmLogoutModal
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        onConfirm={handleSignOut}
        loading={loggingOut}
      />
    </div>
  );
};

export default Dashboard;
