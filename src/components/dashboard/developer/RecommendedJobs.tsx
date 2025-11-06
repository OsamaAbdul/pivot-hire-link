import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Sparkles, MapPin, DollarSign } from "lucide-react";

interface RecommendedJobsProps {
  developerId: string;
  developerSkills: string[];
}

const RecommendedJobs = ({ developerId, developerSkills }: RecommendedJobsProps) => {
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (developerSkills && developerSkills.length > 0) {
      fetchRecommendedJobs();
    } else {
      setLoading(false);
    }
  }, [developerSkills, developerId]);

  const fetchRecommendedJobs = async () => {
    try {
      // Fetch all active jobs
      const { data: jobs, error } = await supabase
        .from("jobs")
        .select(`
          *,
          profiles:recruiter_id (
            full_name,
            recruiter_profiles!recruiter_profiles_user_id_fkey (company_name)
          )
        `)
        .eq("is_active", true);

      if (error) throw error;

      // Fetch developer's applications
      const { data: applications } = await supabase
        .from("applications")
        .select("job_id")
        .eq("developer_id", developerId);

      const appliedJobIds = new Set(applications?.map(app => app.job_id) || []);

      // Filter and score jobs based on skill match
      const scoredJobs = (jobs || [])
        .filter(job => !appliedJobIds.has(job.id))
        .map(job => {
          const jobSkills = job.required_skills || [];
          const matchingSkills = jobSkills.filter((skill: string) => 
            developerSkills.some(devSkill => 
              devSkill.toLowerCase() === skill.toLowerCase()
            )
          );
          return {
            ...job,
            matchScore: matchingSkills.length,
            matchingSkills
          };
        })
        .filter(job => job.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 5);

      setRecommendedJobs(scoredJobs);
    } catch (error: any) {
      console.error("Failed to load recommended jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatJobType = (type: string) => {
    return type.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };

  if (loading) {
    return <div className="text-center py-8">Loading recommendations...</div>;
  }

  if (recommendedJobs.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No job recommendations yet. Update your skills in your profile to get personalized recommendations!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Recommended For You</h3>
      </div>
      
      {recommendedJobs.map((job) => (
        <Card key={job.id} className="hover:shadow-md transition-shadow border-primary/20">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl font-serif">{job.title}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-2">
                  <span className="font-medium">
                    {job.profiles?.recruiter_profiles?.[0]?.company_name || "Company"}
                  </span>
                </CardDescription>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <Badge>{formatJobType(job.job_type)}</Badge>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {job.matchScore} {job.matchScore === 1 ? 'skill' : 'skills'} match
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground line-clamp-3">{job.description}</p>

            <div className="flex flex-wrap gap-4 text-sm">
              {job.location && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {job.location}
                </div>
              )}
              {job.salary_range && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  {job.salary_range}
                </div>
              )}
              {job.remote_allowed && (
                <Badge variant="secondary">Remote</Badge>
              )}
            </div>

            {job.matchingSkills && job.matchingSkills.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Your matching skills:</p>
                <div className="flex flex-wrap gap-2">
                  {job.matchingSkills.map((skill: string) => (
                    <Badge key={skill} variant="default">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Button asChild className="w-full">
              <a href={`/dashboard?section=challenges`}>
                View & Apply
              </a>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RecommendedJobs;
