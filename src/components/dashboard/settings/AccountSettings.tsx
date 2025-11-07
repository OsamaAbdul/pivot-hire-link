import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

type AccountSettingsProps = {
  profile: any;
};

export default function AccountSettings({ profile }: AccountSettingsProps) {
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [headline, setHeadline] = useState(profile?.headline || "");
  const [email, setEmail] = useState(profile?.email || "");

  const [savingProfile, setSavingProfile] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const emailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), [email]);
  const passwordValid = useMemo(() => newPassword.length >= 8, [newPassword]);
  const passwordMatch = useMemo(() => newPassword === confirmPassword, [newPassword, confirmPassword]);

  useEffect(() => {
    setFullName(profile?.full_name || "");
    setHeadline(profile?.headline || "");
    setEmail(profile?.email || "");
  }, [profile]);

  const saveProfileInfo = async () => {
    if (!fullName.trim()) {
      toast.error("Full name is required");
      return;
    }
    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName.trim(), headline: headline.trim() })
        .eq("id", profile.id);
      if (error) throw error;
      toast.success("Profile updated");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const updateEmail = async () => {
    if (!emailValid) {
      toast.error("Enter a valid email address");
      return;
    }
    setEmailLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ email });
      if (error) throw error;
      await supabase.from("profiles").update({ email }).eq("id", profile.id);
      toast.success("Email update requested. Please verify via email.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update email");
    } finally {
      setEmailLoading(false);
    }
  };

  const updatePassword = async () => {
    if (!passwordValid) {
      toast.error("Password must be at least 8 characters long");
      return;
    }
    if (!passwordMatch) {
      toast.error("Passwords do not match");
      return;
    }
    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      // Placeholder destructive action: sign the user out.
      await supabase.auth.signOut();
      toast.success("You have been signed out. Account deletion requires admin.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to process deletion");
    } finally {
      setDeleteLoading(false);
      setDeleteOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-serif font-bold">Account Settings</h2>
        <p className="text-muted-foreground mt-1">Manage your profile information, email, password, and account security.</p>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Alex Chen" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="headline">Headline</Label>
              <Input id="headline" value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Software Engineer | AI Enthusiast" />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={saveProfileInfo} disabled={savingProfile} className="ml-auto">
            {savingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Changes
          </Button>
        </CardFooter>
      </Card>

      {/* Change Email */}
      <Card>
        <CardHeader>
          <CardTitle>Change Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new_email">New Email Address</Label>
            <Input id="new_email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" aria-invalid={!emailValid} aria-describedby="email-help" />
            <p id="email-help" className="text-xs text-muted-foreground">We’ll send a verification link to your new email.</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={updateEmail} disabled={emailLoading || !emailValid} className="ml-auto">
            {emailLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Update Email
          </Button>
        </CardFooter>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current_password">Current Password</Label>
            <Input id="current_password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="new_password">New Password</Label>
              <Input id="new_password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" aria-invalid={!passwordValid} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirm New Password</Label>
              <Input id="confirm_password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" aria-invalid={!passwordMatch} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Password must be at least 8 characters long.</p>
        </CardContent>
        <CardFooter>
          <Button onClick={updatePassword} disabled={passwordLoading || !passwordValid || !passwordMatch} className="ml-auto">
            {passwordLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Update Password
          </Button>
        </CardFooter>
      </Card>

      {/* Delete Account */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive-foreground">Delete Account</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive-foreground bg-destructive/10 border border-destructive rounded-md px-3 py-2">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="destructive" onClick={() => setDeleteOpen(true)} disabled={deleteLoading} className="ml-auto">
            {deleteLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Delete Account
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete account?</AlertDialogTitle>
            <AlertDialogDescription>
              This action is permanent and cannot be undone. You will be signed out immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleteLoading}>
              {deleteLoading ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}