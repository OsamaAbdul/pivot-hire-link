import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Search, Github, Linkedin, Globe, Mail } from "lucide-react";

const DeveloperDirectory = () => {
  const [developers, setDevelopers] = useState<any[]>([]);
  const [filteredDevelopers, setFilteredDevelopers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDevelopers();
  }, []);

  useEffect(() => {
    filterDevelopers();
  }, [searchTerm, developers]);

  const fetchDevelopers = async () => {
    try {
      const { data, error } = await supabase
        .from("developer_profiles")
        .select(`
          *,
          profiles:user_id (
            full_name,
            email,
            location
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDevelopers(data || []);
      setFilteredDevelopers(data || []);
    } catch (error: any) {
      toast.error("Failed to load developers");
    } finally {
      setLoading(false);
    }
  };

  const filterDevelopers = () => {
    if (!searchTerm) {
      setFilteredDevelopers(developers);
      return;
    }

    const filtered = developers.filter((dev) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        dev.profiles?.full_name?.toLowerCase().includes(searchLower) ||
        dev.specialization?.toLowerCase().includes(searchLower) ||
        dev.skills?.some((skill: string) => skill.toLowerCase().includes(searchLower)) ||
        dev.experience_level?.toLowerCase().includes(searchLower)
      );
    });

    setFilteredDevelopers(filtered);
  };

  if (loading) {
    return <div className="text-center py-8">Loading developers...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, skills, or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="columns-1 sm:columns-2 lg:columns-3 gap-x-4">
        {filteredDevelopers.length === 0 ? (
          <Card style={{ breakInside: "avoid" }} className="mb-4">
            <CardContent className="py-8 text-center text-muted-foreground">
              No developers found
            </CardContent>
          </Card>
        ) : (
          filteredDevelopers.map((dev) => (
            <Card
              key={dev.id}
              className="hover:shadow-md transition-shadow mb-4"
              style={{ breakInside: "avoid" }}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl font-serif">
                      {dev.profiles?.full_name || "Developer"}
                    </CardTitle>
                    <div className="flex gap-2 mt-2 text-sm text-muted-foreground">
                      {dev.specialization && <span>{dev.specialization}</span>}
                      {dev.experience_level && (
                        <>
                          <span>•</span>
                          <span>{dev.experience_level}</span>
                        </>
                      )}
                      {dev.availability && (
                        <>
                          <span>•</span>
                          <Badge variant="outline">{dev.availability}</Badge>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {dev.bio && (
                  <p className="text-muted-foreground">{dev.bio}</p>
                )}

                {dev.skills && dev.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {dev.skills.map((skill: string) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-3 pt-2">
                  {dev.github_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={dev.github_url} target="_blank" rel="noopener noreferrer">
                        <Github className="h-4 w-4 mr-2" />
                        GitHub
                      </a>
                    </Button>
                  )}
                  {dev.linkedin_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={dev.linkedin_url} target="_blank" rel="noopener noreferrer">
                        <Linkedin className="h-4 w-4 mr-2" />
                        LinkedIn
                      </a>
                    </Button>
                  )}
                  {dev.portfolio_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={dev.portfolio_url} target="_blank" rel="noopener noreferrer">
                        <Globe className="h-4 w-4 mr-2" />
                        Portfolio
                      </a>
                    </Button>
                  )}
                  {dev.profiles?.email && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={`mailto:${dev.profiles.email}`}>
                        <Mail className="h-4 w-4 mr-2" />
                        Contact
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default DeveloperDirectory;
