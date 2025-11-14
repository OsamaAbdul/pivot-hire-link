import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import RecruiterProfile from "./recruiter/RecruiterProfile";
import JobManagement from "./recruiter/JobManagement";
import DeveloperDirectory from "./recruiter/DeveloperDirectory";
import AccountSettings from "./settings/AccountSettings";
import DashboardShell from "./recruiter/DashboardShell";
import { useNavigate, useLocation } from "react-router-dom";

interface RecruiterDashboardProps {
  profile: any;
}

const RecruiterDashboard = ({ profile }: RecruiterDashboardProps) => {
  const [recruiterProfile, setRecruiterProfile] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [active, setActive] = useState<string>(new URLSearchParams(location.search).get("section") || "jobs");

  useEffect(() => {
    fetchRecruiterProfile();
  }, [profile.id]);

  const fetchRecruiterProfile = async () => {
    const { data } = await supabase
      .from("recruiter_profiles")
      .select("*")
      .eq("user_id", profile.id)
      .maybeSingle();

    setRecruiterProfile(data);
  };

  // Stats cards removed per requirements

  const handleSelect = (key: string) => {
    setActive(key);
    const sp = new URLSearchParams(location.search);
    sp.set("section", key);
    navigate({ search: sp.toString() }, { replace: true });
  };

  return (
    <div className="space-y-6">
      <DashboardShell active={active} onSelect={handleSelect}>
        {active === "jobs" && (
          <JobManagement recruiterId={profile.id} onUpdate={() => {}} />
        )}
        {active === "talents" && (
          <DeveloperDirectory />
        )}
        {active === "profile" && (
          <RecruiterProfile 
            profile={profile} 
            recruiterProfile={recruiterProfile}
            onUpdate={fetchRecruiterProfile}
          />
        )}
        {active === "settings" && (
          <AccountSettings profile={profile} />
        )}
      </DashboardShell>
    </div>
  );
};

export default RecruiterDashboard;
