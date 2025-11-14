import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DeveloperProfileProps {
  profile: any;
  developerProfile: any;
  onUpdate: () => void;
}

const DeveloperProfile = ({ profile, developerProfile, onUpdate }: DeveloperProfileProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    skills: developerProfile?.skills?.join(", ") || "",
    specialization: developerProfile?.specialization || "",
    experience_level: developerProfile?.experience_level || "",
    bio: developerProfile?.bio || "",
    github_url: developerProfile?.github_url || "",
    linkedin_url: developerProfile?.linkedin_url || "",
    portfolio_url: developerProfile?.portfolio_url || "",
    availability: developerProfile?.availability || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const skillsArray = formData.skills.split(",").map((s) => s.trim()).filter(Boolean);

      if (developerProfile) {
        const { error } = await supabase
          .from("developer_profiles")
          .update({
            skills: skillsArray,
            specialization: formData.specialization,
            experience_level: formData.experience_level,
            bio: formData.bio,
            github_url: formData.github_url,
            linkedin_url: formData.linkedin_url,
            portfolio_url: formData.portfolio_url,
            availability: formData.availability,
          })
          .eq("user_id", profile.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("developer_profiles").insert({
          user_id: profile.id,
          skills: skillsArray,
          specialization: formData.specialization,
          experience_level: formData.experience_level,
          bio: formData.bio,
          github_url: formData.github_url,
          linkedin_url: formData.linkedin_url,
          portfolio_url: formData.portfolio_url,
          availability: formData.availability,
        });

        if (error) throw error;
      }

      toast.success("Profile updated successfully!");
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-serif">Developer Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="skills">Skills (comma-separated)</Label>
            <Input
              id="skills"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              placeholder="React, TypeScript, Node.js, Python"
            />
            {developerProfile?.skills && (
              <div className="flex flex-wrap gap-2 mt-2">
                {developerProfile.skills.map((skill: string) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Input
                id="specialization"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                placeholder="Frontend, Backend, Full Stack, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience_level">Experience Level</Label>
              <Input
                id="experience_level"
                value={formData.experience_level}
                onChange={(e) => setFormData({ ...formData, experience_level: e.target.value })}
                placeholder="Junior, Mid-level, Senior"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell us about yourself..."
              rows={4}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="github_url">GitHub URL</Label>
              <Input
                id="github_url"
                type="url"
                value={formData.github_url}
                onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                placeholder="https://github.com/yourusername"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin_url">LinkedIn URL</Label>
              <Input
                id="linkedin_url"
                type="url"
                value={formData.linkedin_url}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="portfolio_url">Portfolio URL</Label>
              <Input
                id="portfolio_url"
                type="url"
                value={formData.portfolio_url}
                onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                placeholder="https://yourportfolio.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="availability">Availability</Label>
              <Select
                value={formData.availability}
                onValueChange={(value) => setFormData({ ...formData, availability: value })}
              >
                <SelectTrigger id="availability">
                  <SelectValue placeholder="Select availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Not available">Not available</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {developerProfile ? "Update Profile" : "Create Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default DeveloperProfile;
