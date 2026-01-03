import { PropsWithChildren, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/hooks/useSessionManager";
import { toast } from "sonner";
import { isAdmin } from "@/utils/admin";

function parseAllowlist(): string[] {
  try {
    const raw = import.meta.env.VITE_ADMIN_ALLOWLIST || "";
    return raw.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  } catch {
    return [];
  }
}

export default function RequireAdmin({ children }: PropsWithChildren) {
  const { status, user } = useSession();
  const navigate = useNavigate();
  const debugAny = (import.meta.env.VITE_ADMIN_DEBUG_ANY || "").toLowerCase() === "true";
  const debugEmail = (import.meta.env.VITE_ADMIN_DEBUG_EMAIL || "").trim().toLowerCase();

  const isAllowed = useMemo(() => {
    const byEnv = isAdmin(user?.email, import.meta.env.VITE_ADMIN_ALLOWLIST, import.meta.env.VITE_ADMIN_DOMAIN);
    const byClaim = (user?.app_metadata?.role === "admin");
    const byDebugAny = debugAny; // allow regardless of auth for temporary demo access
    const byDebugEmail = !!debugEmail && (user?.email?.toLowerCase() === debugEmail);
    return Boolean(byEnv || byClaim || byDebugAny || byDebugEmail);
  }, [user?.email, status, debugAny, debugEmail]);

  useEffect(() => {
    const debugActive = debugAny || (!!debugEmail && (!user?.email || user?.email?.toLowerCase() === debugEmail));
    if (!debugActive) {
      if (status === "unauthenticated") {
        toast.error("Please log in to continue.");
        navigate("/auth?mode=login", { replace: true });
        return;
      }
      if (status === "authenticated" && !isAllowed) {
        toast.error("Admin access required");
        navigate("/", { replace: true });
      }
    } else if (status !== "loading") {
      toast.warning("Admin debug override active: frontend-only access");
    }
  }, [status, isAllowed, navigate, debugAny, debugEmail, user?.email]);

  if (status === "loading") {
    return null;
  }

  return <>{children}</>;
}
