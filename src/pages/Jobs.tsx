import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, MapPin, DollarSign, Clock, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { JOBS, JobRecord } from "@/lib/jobs-data";

type DbJob = {
  id: string;
  title: string;
  description: string;
  job_type: "full_time" | "part_time" | "contract" | "freelance";
  location: string | null;
  remote_allowed: boolean | null;
  salary_range: string | null;
  experience_required: string | null;
  required_skills: string[] | null;
  created_at: string | null;
  profiles?: {
    full_name?: string | null;
    recruiter_profiles?: Array<{ company_name?: string | null; industry?: string | null }>;
  } | null;
};

type Source = "db" | "static";

const PAGE_SIZE = 6;

function normalizeJobType(type: string | undefined | null) {
  if (!type) return "";
  return type
    .toString()
    .replace("_", " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatPosted(dateStr: string | null) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  const diff = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 1) return "Today";
  if (diff === 1) return "1 day ago";
  return `${diff} days ago`;
}

export default function Jobs() {
  const [source, setSource] = useState<Source>("db");
  const [jobs, setJobs] = useState<Array<DbJob | JobRecord>>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [jobType, setJobType] = useState<string>("any");
  const [experience, setExperience] = useState<string>("any");
  const [industry, setIndustry] = useState<string>("any");

  // Pagination
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("jobs")
          .select(
            `*, profiles:recruiter_id ( full_name, recruiter_profiles!recruiter_profiles_user_id_fkey (company_name, industry) )`
          )
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const rows: DbJob[] = (data || []) as any;
        if (rows.length) {
          setJobs(rows);
          setSource("db");
        } else {
          // Fallback to static demo jobs
          setJobs(JOBS);
          setSource("static");
        }
      } catch (e) {
        // Fallback to static demo jobs if Supabase is not configured
        setJobs(JOBS);
        setSource("static");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const industryOptions = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach((j) => {
      // Only DB jobs have industry; static list omits it
      const ind = (j as DbJob).profiles?.recruiter_profiles?.[0]?.industry || "";
      if (ind) set.add(ind);
    });
    return Array.from(set).sort();
  }, [jobs]);

  const filtered = useMemo(() => {
    let out = [...jobs];
    const term = searchTerm.trim().toLowerCase();

    if (term) {
      out = out.filter((j) => {
        const title = (j as any).title?.toLowerCase?.() || "";
        const desc = (j as any).description?.toLowerCase?.() || (j as any).summary?.toLowerCase?.() || "";
        const loc = ((j as any).location || "").toLowerCase();
        const companyDb = (j as DbJob).profiles?.recruiter_profiles?.[0]?.company_name?.toLowerCase?.() || "";
        const companyStatic = (j as JobRecord).company?.toLowerCase?.() || "";
        const tags = ((j as JobRecord).tags || []).join(" ").toLowerCase();
        return title.includes(term) || desc.includes(term) || loc.includes(term) || companyDb.includes(term) || companyStatic.includes(term) || tags.includes(term);
      });
    }

    if (jobType !== "any") {
      out = out.filter((j) => {
        const dbType = normalizeJobType((j as DbJob).job_type);
        const staticType = (j as JobRecord).type;
        return dbType.toLowerCase() === jobType.toLowerCase() || staticType?.toLowerCase() === jobType.toLowerCase();
      });
    }

    if (experience !== "any") {
      out = out.filter((j) => {
        const dbExp = ((j as DbJob).experience_required || "").toLowerCase();
        const stExp = ((j as JobRecord).experience || "").toLowerCase();
        return dbExp === experience.toLowerCase() || stExp === experience.toLowerCase();
      });
    }

    if (industry !== "any") {
      out = out.filter((j) => {
        const ind = (j as DbJob).profiles?.recruiter_profiles?.[0]?.industry || "";
        return ind.toLowerCase() === industry.toLowerCase();
      });
    }

    return out;
  }, [jobs, searchTerm, jobType, experience, industry]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)), [filtered.length]);
  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  // Clamp page if filters reduce results, and smooth scroll to grid on change
  useEffect(() => {
    setPage((p) => Math.min(p, Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))));
  }, [filtered.length]);

  useEffect(() => {
    const el = document.getElementById("jobs-grid");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [page]);

  const jobTypeOptions = ["any", "Full time", "Part time", "Contract", "Freelance"];
  const experienceOptions = ["any", "entry", "mid", "senior"];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1">

      {/* Header */}
      <section className="container mx-auto px-6 pt-12 md:pt-16">
        <h1 className="text-center font-serif font-bold tracking-tight text-4xl md:text-5xl">Explore Job Opportunities</h1>
        <p className="mt-3 text-center max-w-3xl mx-auto text-muted-foreground">Find your next role within the Northern Founders community. Discover opportunities from top startups and established companies.</p>
      </section>

      {/* Controls */}
      <section className="container mx-auto px-6 py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              aria-label="Search by job title, company, or keyword"
              placeholder="Search by job title, company, or keyword..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:w-auto">
            <Select value={jobType} onValueChange={(v) => { setJobType(v); setPage(1); }}>
              <SelectTrigger aria-label="Filter by job type" className="w-full"><SelectValue placeholder="Role" /></SelectTrigger>
              <SelectContent>
                {jobTypeOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt === "any" ? "Role" : opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={experience} onValueChange={(v) => { setExperience(v); setPage(1); }}>
              <SelectTrigger aria-label="Filter by experience level" className="w-full"><SelectValue placeholder="Experience" /></SelectTrigger>
              <SelectContent>
                {experienceOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt === "any" ? "Experience" : opt.charAt(0).toUpperCase() + opt.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={industry} onValueChange={(v) => { setIndustry(v); setPage(1); }}>
              <SelectTrigger aria-label="Filter by industry" className="w-full"><SelectValue placeholder="Industry" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Industry</SelectItem>
                {industryOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Listing */}
      <section className="container mx-auto px-6 pb-10">
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-40" />
                  <div className="mt-3 flex gap-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <Skeleton className="h-9 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div
            id="jobs-grid"
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-2 duration-300"
            key={page}
            aria-live="polite"
            aria-busy={loading ? "true" : "false"}
          >
            {paged.map((job) => {
              const isDb = source === "db";
              const company = isDb
                ? ((job as DbJob).profiles?.recruiter_profiles?.[0]?.company_name || "Company")
                : (job as JobRecord).company;
              const location = (job as any).location || "—";
              const salary = (job as any).salary_range || (job as JobRecord).salaryRange || null;
              const type = isDb ? normalizeJobType((job as DbJob).job_type) : (job as JobRecord).type;
              const experienceLevel = isDb ? (job as DbJob).experience_required || "" : (job as JobRecord).experience;
              const posted = isDb ? formatPosted((job as DbJob).created_at) : "—";

              return (
                <Card key={(job as any).id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl font-serif">{(job as any).title}</CardTitle>
                        <CardDescription className="mt-1 flex items-center gap-2">
                          <span className="font-medium">{company}</span>
                          <Badge variant="outline" className="rounded-full px-2 py-0.5 text-[11px] inline-flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5" /> {location}
                          </Badge>
                        </CardDescription>
                      </div>
                      <Badge className="rounded-md">{type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">{(job as any).summary || (job as any).description}</p>

                    <div className="flex flex-wrap gap-4 text-sm">
                      {salary && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <DollarSign className="h-4 w-4" />
                          {salary}
                        </div>
                      )}
                      {experienceLevel && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {(experienceLevel || "").toString().charAt(0).toUpperCase() + (experienceLevel || "").toString().slice(1)}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Briefcase className="h-3.5 w-3.5" />
                        <span>Posted {posted}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button asChild className="px-4">
                          <a href={`/jobs/${(job as any).id}`}>View Details</a>
                        </Button>
                        <Button variant="outline" className="px-4" aria-label="Save job">Save</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <section className="container mx-auto px-6 pb-12">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
              Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} jobs
            </p>
            <p className="text-sm" aria-label={`Current page ${page} of ${totalPages}`}>Page {page} / {totalPages}</p>
          </div>
          <Pagination aria-label="Jobs pagination">
            <PaginationContent aria-controls="jobs-grid">
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  aria-label="Previous page"
                  aria-disabled={page === 1}
                  onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)); }}
                />
              </PaginationItem>
              {/* Dynamic windowed page numbers */}
              {(() => {
                const windowSize = 5;
                let start = Math.max(1, page - Math.floor(windowSize / 2));
                let end = start + windowSize - 1;
                if (end > totalPages) {
                  end = totalPages;
                  start = Math.max(1, end - windowSize + 1);
                }

                const items: JSX.Element[] = [];
                if (start > 1) {
                  items.push(
                    <PaginationItem key={1}>
                      <PaginationLink
                        href="#"
                        aria-label="Go to page 1"
                        aria-current={page === 1 ? "page" : undefined}
                        isActive={page === 1}
                        onClick={(e) => { e.preventDefault(); setPage(1); }}
                      >1</PaginationLink>
                    </PaginationItem>
                  );
                  if (start > 2) items.push(<PaginationItem key="start-ellipsis"><PaginationEllipsis /></PaginationItem>);
                }

                for (let n = start; n <= end; n++) {
                  items.push(
                    <PaginationItem key={n}>
                      <PaginationLink
                        href="#"
                        aria-label={`Go to page ${n}`}
                        aria-current={page === n ? "page" : undefined}
                        isActive={page === n}
                        onClick={(e) => { e.preventDefault(); setPage(n); }}
                      >{n}</PaginationLink>
                    </PaginationItem>
                  );
                }

                if (end < totalPages) {
                  if (end < totalPages - 1) items.push(<PaginationItem key="end-ellipsis"><PaginationEllipsis /></PaginationItem>);
                  items.push(
                    <PaginationItem key={totalPages}>
                      <PaginationLink
                        href="#"
                        aria-label={`Go to page ${totalPages}`}
                        aria-current={page === totalPages ? "page" : undefined}
                        isActive={page === totalPages}
                        onClick={(e) => { e.preventDefault(); setPage(totalPages); }}
                      >{totalPages}</PaginationLink>
                    </PaginationItem>
                  );
                }
                return items;
              })()}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  aria-label="Next page"
                  aria-disabled={page === totalPages}
                  onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(totalPages, p + 1)); }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </section>
      )}

      </main>

      <Footer />
    </div>
  );
}