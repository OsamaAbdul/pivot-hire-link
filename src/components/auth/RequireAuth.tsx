import { PropsWithChildren, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/hooks/useSessionManager";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function RequireAuth({ children }: PropsWithChildren) {
  const { status } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (status === "unauthenticated") {
      toast.error("Please log in to continue.");
      navigate("/auth?mode=login", { replace: true });
    }
  }, [status, navigate]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}