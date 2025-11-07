import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

type Developer = {
  id: string;
  profiles?: {
    full_name?: string;
    email?: string;
    location?: string;
  } | null;
  specialization?: string | null;
  experience_level?: string | null;
  skills?: string[] | null;
  bio?: string | null;
  github_url?: string | null;
  linkedin_url?: string | null;
  portfolio_url?: string | null;
  availability?: string | null;
};

const PAGE_SIZE = 6;

const Talents = () => {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [filtered, setFiltered] = useState<Developer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [workArrangement, setWorkArrangement] = useState<string[]>([]); // Remote, Onsite, Hybrid
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [experience, setExperience] = useState<string>("any");
  const [skillsQuery, setSkillsQuery] = useState<string>("");

  // Pagination
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    const fetchDevelopers = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("developer_profiles")
          .select(`*, profiles:user_id ( full_name, email, location )`)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setDevelopers((data || []) as Developer[]);
        setFiltered((data || []) as Developer[]);
      } catch (e) {
        // silent fail; page will still render gracefully
      } finally {
        setLoading(false);
      }
    };

    fetchDevelopers();
  }, []);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)), [filtered.length]);
  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const toggleArrayValue = (arr: string[], value: string) =>
    arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];

  const applyFilters = () => {
    let out = [...developers];
    const term = searchTerm.trim().toLowerCase();
    const skillsTerm = skillsQuery.trim().toLowerCase();

    if (term) {
      out = out.filter((d) => {
        const name = d.profiles?.full_name?.toLowerCase() || "";
        const bio = d.bio?.toLowerCase() || "";
        const spec = d.specialization?.toLowerCase() || "";
        const skills = (d.skills || []).join(" ").toLowerCase();
        return name.includes(term) || bio.includes(term) || spec.includes(term) || skills.includes(term);
      });
    }

    if (skillsTerm) {
      out = out.filter((d) => (d.skills || []).some((s) => s.toLowerCase().includes(skillsTerm)));
    }

    if (specializations.length) {
      out = out.filter((d) => (d.specialization ? specializations.includes(d.specialization) : false));
    }

    if (experience !== "any") {
      out = out.filter((d) => (d.experience_level || "").toLowerCase() === experience.toLowerCase());
    }

    if (workArrangement.length) {
      // We map work arrangement to availability keywords if present
      out = out.filter((d) => {
        const avail = (d.availability || "").toLowerCase();
        const wa = workArrangement.map((w) => w.toLowerCase());
        return wa.some((w) => avail.includes(w));
      });
    }

    setFiltered(out);
    setPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setWorkArrangement([]);
    setSpecializations([]);
    setExperience("any");
    setSkillsQuery("");
    setFiltered(developers);
    setPage(1);
  };

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <Navbar />
      {/* Header */}
      <section className="container mx-auto px-6 pt-12 md:pt-16">
        <h1 className="text-center font-bold tracking-tight text-4xl md:text-5xl">Find Your Next Star</h1>
        <p className="mt-3 md:mt-4 text-center max-w-3xl mx-auto text-muted-foreground">
          Discover exceptional talent from the North. Use the filters below to find the perfect match for your team.
        </p>
      </section>

      {/* Body */}
      <section className="container mx-auto px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Filters Sidebar */}
          <Card className="lg:col-span-3 self-start">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Filters</CardTitle>
              <CardDescription>Refine by arrangement, specialization, experience, and skills</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    aria-label="Search by name or keyword"
                    placeholder="Search by name or key"
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Work Arrangement */}
              <div className="space-y-3">
                <p className="text-sm font-medium">Work Arrangement</p>
                {[
                  { label: "Remote", value: "remote" },
                  { label: "Onsite", value: "onsite" },
                  { label: "Hybrid", value: "hybrid" },
                ].map((opt) => (
                  <div key={opt.value} className="flex items-center gap-3">
                    <Checkbox
                      checked={workArrangement.includes(opt.value)}
                      onCheckedChange={() => setWorkArrangement((prev) => toggleArrayValue(prev, opt.value))}
                      aria-label={opt.label}
                    />
                    <span className="text-sm">{opt.label}</span>
                  </div>
                ))}
              </div>

              {/* Specialization */}
              <div className="space-y-3">
                <p className="text-sm font-medium">Specialization</p>
                {[
                  "Software Development",
                  "Frontend Development",
                  "Backend Development",
                  "UX/UI Design",
                  "Product Management",
                ].map((sp) => (
                  <div key={sp} className="flex items-center gap-3">
                    <Checkbox
                      checked={specializations.includes(sp)}
                      onCheckedChange={() => setSpecializations((prev) => toggleArrayValue(prev, sp))}
                      aria-label={sp}
                    />
                    <span className="text-sm">{sp}</span>
                  </div>
                ))}
              </div>

              {/* Experience */}
              <div className="space-y-2">
                <label className="text-sm">Experience Level</label>
                <Select value={experience} onValueChange={(v) => setExperience(v)}>
                  <SelectTrigger aria-label="Experience level">
                    <SelectValue placeholder="Any Experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Experience</SelectItem>
                    <SelectItem value="junior">Junior</SelectItem>
                    <SelectItem value="mid">Mid</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <label className="text-sm">Skills</label>
                <Input
                  aria-label="Filter by skills"
                  placeholder="e.g., React, Node.js, Figma"
                  value={skillsQuery}
                  onChange={(e) => setSkillsQuery(e.target.value)}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button className="flex-1" onClick={applyFilters}>Apply Filters</Button>
                <Button variant="outline" onClick={clearFilters}>Reset</Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Grid */}
          <div className="lg:col-span-9 space-y-6">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading talents…</p>
            ) : (
              <>
                {/* Cards Grid */}
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {paged.map((dev) => (
                    <Card key={dev.id} className="transition-all hover:shadow-lg">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage
                              src={`https://avatar.iran.liara.run/public/`}
                              alt={`${dev.profiles?.full_name || "Talent"} avatar`}
                              loading="lazy"
                            />
                            <AvatarFallback>
                              {(dev.profiles?.full_name || "T").charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg leading-tight">
                              {dev.profiles?.full_name || "Unnamed"}
                            </CardTitle>
                            <p className="text-xs text-accent">{dev.specialization || "Generalist"}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4 pt-0">
                        <p className="text-sm text-muted-foreground min-h-[60px]">
                          {dev.bio || "A talented professional ready to make an impact."}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(dev.skills || []).slice(0, 5).map((skill, i) => (
                            <Badge key={i} variant="secondary" className="rounded-full">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                        <div>
                          <Link to={`/talents/profile/${dev.id}`} className="text-sm text-accent hover:underline" aria-label={`View ${dev.profiles?.full_name || "talent"} profile`}>
                            View Profile →
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                <Pagination className="pt-2">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setPage((p) => Math.max(1, p - 1));
                        }}
                      />
                    </PaginationItem>
                    {page > 2 && (
                      <>
                        <PaginationItem>
                          <PaginationLink href="#" onClick={(e) => { e.preventDefault(); setPage(1); }}>
                            1
                          </PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      </>
                    )}
                    <PaginationItem>
                      <PaginationLink href="#" isActive>
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                    {page < totalPages - 1 && (
                      <>
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink href="#" onClick={(e) => { e.preventDefault(); setPage(totalPages); }}>
                            {totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      </>
                    )}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setPage((p) => Math.min(totalPages, p + 1));
                        }}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Talents;