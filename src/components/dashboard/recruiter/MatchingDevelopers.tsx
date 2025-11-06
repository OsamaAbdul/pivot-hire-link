import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sparkles, Mail, Github, Linkedin, Globe } from "lucide-react";

interface MatchingDevelopersProps {
  recruiterId: string;
}

const MatchingDevelopers = ({ recruiterId }: MatchingDevelopersProps) => {
  const [matchingDevelopers, setMatchingDevelopers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatchingDevelopers();
  }, [recruiterId]);

  const fetchMatchingDevelopers = async () => {
    try {
      // Fetch recruiter's active jobs
      const { data: jobs, error: jobsError } = await supabase
        .from("jobs")
        .select("id, title, required_skills")
        .eq("recruiter_id", recruiterId)
        .eq("is_active", true);

      if (jobsError) throw jobsError;

      if (!jobs || jobs.length === 0) {
        setLoading(false);
        return;
      }

      // Get all required skills from all jobs
      const allRequiredSkills = jobs.reduce((acc: string[], job) => {
        return [...acc, ...(job.required_skills || [])];
      }, []);

      const uniqueSkills = [...new Set(allRequiredSkills)];

      if (uniqueSkills.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch developers with matching skills
      const { data: developers, error: devsError } = await supabase
        .from("developer_profiles")
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            email,
            avatar_url
          )
        `);

      if (devsError) throw devsError;

      // Score developers based on skill match
      const scoredDevelopers = (developers || [])
        .map(dev => {
          const devSkills = dev.skills || [];
          const matchingSkills = devSkills.filter((skill: string) => 
            uniqueSkills.some(reqSkill => 
              reqSkill.toLowerCase() === skill.toLowerCase()
            )
          );

          // Find best matching job for this developer
          const jobMatches = jobs.map(job => {
            const jobSkillMatch = (job.required_skills || []).filter((skill: string) =>
              devSkills.some((devSkill: string) => 
                devSkill.toLowerCase() === skill.toLowerCase()
              )
            );
            return {
              jobTitle: job.title,
              matchCount: jobSkillMatch.length,
              matchingSkills: jobSkillMatch
            };
          }).sort((a, b) => b.matchCount - a.matchCount)[0];

          return {
            ...dev,
            matchScore: matchingSkills.length,
            matchingSkills,
            bestJobMatch: jobMatches
          };
        })
        .filter(dev => dev.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 10);

      setMatchingDevelopers(scoredDevelopers);
    } catch (error: any) {
      console.error("Failed to load matching developers:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading matching developers...</div>;
  }

  if (matchingDevelopers.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No matching developers yet. Post jobs with required skills to see recommendations!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Developers Matching Your Jobs</h3>
      </div>

      {matchingDevelopers.map((developer) => (
        <Card key={developer.id} className="hover:shadow-md transition-shadow border-primary/20">
          <CardHeader>
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={developer.profiles?.avatar_url} />
                <AvatarFallback>
                  {developer.profiles?.full_name?.charAt(0) || "D"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-xl font-serif">
                  {developer.profiles?.full_name || "Developer"}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {developer.specialization || "Software Developer"}
                </p>
                {developer.experience_level && (
                  <Badge variant="outline" className="mt-2">
                    {developer.experience_level}
                  </Badge>
                )}
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {developer.matchScore} {developer.matchScore === 1 ? 'skill' : 'skills'} match
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {developer.bio && (
              <p className="text-sm text-muted-foreground line-clamp-2">{developer.bio}</p>
            )}

            {developer.bestJobMatch && developer.bestJobMatch.matchCount > 0 && (
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm font-medium mb-2">
                  Best match for: <span className="text-primary">{developer.bestJobMatch.jobTitle}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {developer.bestJobMatch.matchingSkills.map((skill: string) => (
                    <Badge key={skill} variant="default" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {developer.matchingSkills && developer.matchingSkills.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">All matching skills:</p>
                <div className="flex flex-wrap gap-2">
                  {developer.matchingSkills.map((skill: string) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              {developer.github_url && (
                <a 
                  href={developer.github_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <Github className="h-4 w-4" />
                  GitHub
                </a>
              )}
              {developer.linkedin_url && (
                <a 
                  href={developer.linkedin_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </a>
              )}
              {developer.portfolio_url && (
                <a 
                  href={developer.portfolio_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <Globe className="h-4 w-4" />
                  Portfolio
                </a>
              )}
            </div>

            <Button asChild className="w-full">
              <a href={`/dashboard?section=developers`}>
                View Full Profile
              </a>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MatchingDevelopers;
