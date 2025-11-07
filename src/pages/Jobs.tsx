import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Search, ChevronDown, Bookmark, Building2, MapPin, Briefcase, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { JOBS, JobRecord } from "@/lib/jobs-data";

type Job = JobRecord;
const allJobs: Job[] = JOBS;

export default function Jobs() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [jobType, setJobType] = useState<Job["type"] | null>(null);
  const [experience, setExperience] = useState<Job["experience"] | null>(null);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return allJobs.filter((j) => {
      const matchQ = !q || [j.title, j.company, j.location, ...j.tags].some((v) => v.toLowerCase().includes(q));
      const matchRole = !role || j.title.toLowerCase().includes(role.toLowerCase());
      const matchLoc = !location || j.location.toLowerCase().includes(location.toLowerCase());
      const matchType = !jobType || j.type === jobType;
      const matchExp = !experience || j.experience === experience;
      return matchQ && matchRole && matchLoc && matchType && matchExp;
    });
  }, [search, role, location, jobType, experience]);

  const perPage = 6;
  const totalPages = 8; // match screenshot pagination count
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const resetPage = () => setPage(1);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Header */}
      <section className="container mx-auto px-6 pt-16 md:pt-24 text-center">
        <h1 className="font-serif font-extrabold tracking-tight text-5xl md:text-7xl leading-tight">
          Explore Job Opportunities
        </h1>
        <p className="mt-6 max-w-3xl mx-auto text-muted-foreground text-base md:text-lg">
          Find your next role within the Northern Founders community. Discover opportunities from top startups and established companies.
        </p>
      </section>

      {/* Filters */}
      <section className="container mx-auto px-6 pb-6 md:pb-10">
        <Card className="border border-border/80 bg-card/60">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  aria-label="Search jobs"
                  placeholder="Search by job title, company, or keyword..."
                  className="pl-9 bg-background/70"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    resetPage();
                  }}
                />
              </div>
              <Button
                className="md:self-stretch"
                onClick={() => {
                  // No-op apply button to match original behavior; filters apply live
                }}
              >
                Apply Filters
              </Button>
            </div>

            <div className="mt-3 md:mt-4 flex flex-wrap gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-full px-3 py-1 h-9">
                    Role
                    <ChevronDown className="ml-1.5 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel>Select role</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {Array.from(new Set(allJobs.map(j => j.title))).map((r) => (
                    <DropdownMenuItem
                      key={r}
                      onClick={() => { setRole(r); resetPage(); }}
                      aria-selected={role === r}
                    >
                      {r}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { setRole(null); resetPage(); }}>Clear</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-full px-3 py-1 h-9">
                    Location
                    <ChevronDown className="ml-1.5 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel>Select location</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {Array.from(new Set(allJobs.map(j => j.location))).map((loc) => (
                    <DropdownMenuItem
                      key={loc}
                      onClick={() => { setLocation(loc); resetPage(); }}
                      aria-selected={location === loc}
                    >
                      {loc}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { setLocation(null); resetPage(); }}>Clear</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-full px-3 py-1 h-9">
                    Job Type
                    <ChevronDown className="ml-1.5 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuLabel>Select type</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {["Full-time","Part-time","Contract"].map((t) => (
                    <DropdownMenuItem
                      key={t}
                      onClick={() => { setJobType(t as Job["type"]); resetPage(); }}
                      aria-selected={jobType === t}
                    >
                      {t}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { setJobType(null); resetPage(); }}>Clear</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-full px-3 py-1 h-9">
                    Experience
                    <ChevronDown className="ml-1.5 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-44">
                  <DropdownMenuLabel>Select experience</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {["Entry","Mid","Senior"].map((e) => (
                    <DropdownMenuItem
                      key={e}
                      onClick={() => { setExperience(e as Job["experience"]); resetPage(); }}
                      aria-selected={experience === e}
                    >
                      {e}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { setExperience(null); resetPage(); }}>Clear</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Results grid */}
      <section className="container mx-auto px-6 pb-12">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {paged.map((job) => (
            <Card key={job.id} className="relative">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{job.company}</p>
                    <CardTitle className="mt-1 text-base leading-tight">{job.title}</CardTitle>
                  </div>
                  <Button variant="ghost" size="icon" aria-label="Save job" className="h-8 w-8 rounded-md bg-muted/40">
                    <Bookmark className="h-4 w-4 text-accent" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-[11px] inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> {job.location}
                  </Badge>
                  <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-[11px] inline-flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5" /> {job.type}
                  </Badge>
                  <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-[11px] inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> {job.experience}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {job.summary}
                </p>
                <div className="flex flex-wrap gap-2">
                  {job.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[11px] py-0.5 px-2 rounded-full">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="pt-2">
                  <Button
                    variant="outline"
                    className="w-full border-2"
                    onClick={() => navigate(`/jobs/${job.id}`)}
                    aria-label={`View details for ${job.title}`}
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
          <Button variant="outline" size="sm" className="rounded-full h-9 w-9" aria-label="Previous page" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {Array.from({ length: totalPages }).map((_, i) => {
            const n = i + 1;
            const isActive = page === n;
            return (
              <Button
                key={n}
                variant={isActive ? "default" : "outline"}
                size="sm"
                className="rounded-full h-9 min-w-9 px-3"
                aria-current={isActive ? "page" : undefined}
                onClick={() => setPage(n)}
              >
                {n}
              </Button>
            );
          })}
          <Button variant="outline" size="sm" className="rounded-full h-9 w-9" aria-label="Next page" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </nav>
      </section>

      <Footer />
    </div>
  );
}