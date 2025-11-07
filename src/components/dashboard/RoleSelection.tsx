import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface RoleSelectionProps {
  userId: string;
  onRoleSelected: () => void;
}

const RoleSelection = ({ userId, onRoleSelected }: RoleSelectionProps) => {
  const [loading, setLoading] = useState(false);

  const handleRoleSelection = async (role: "developer" | "recruiter") => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role });

      if (error) throw error;

      toast.success(`Role set to ${role}`);
      onRoleSelected();
    } catch (error: any) {
      toast.error("Failed to set role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-serif">Welcome!</CardTitle>
          <CardDescription>
            Please select your role to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <Button
              size="lg"
              onClick={() => handleRoleSelection("developer")}
              disabled={loading}
              className="h-20 text-lg"
            >
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
              I'm a Developer
              <p className="text-sm opacity-80 mt-1">Looking for opportunities</p>
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => handleRoleSelection("recruiter")}
              disabled={loading}
              className="h-20 text-lg"
            >
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
              I'm a Recruiter
              <p className="text-sm opacity-80 mt-1">Looking for talent</p>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleSelection;
