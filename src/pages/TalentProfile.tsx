import "./TalentProfile.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";
import { Download, Bookmark, Mail, MapPin, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/nfclogo.jpg";

type Skill = { name: string; level: number; category: string };
type Experience = { role: string; company: string; period: string; logo?: string; summary: string };
type Education = { school: string; degree: string; period: string };

const SAMPLE_SKILLS: Skill[] = [
  { name: "UI/UX Design", level: 90, category: "Design" },
  { name: "Figma", level: 85, category: "Design" },
  { name: "Prototyping", level: 80, category: "Design" },
  { name: "User Research", level: 75, category: "Research" },
  { name: "Design Systems", level: 88, category: "Design" },
  { name: "Project Management", level: 70, category: "Management" },
  { name: "HTML & CSS", level: 72, category: "Frontend" },
];

const SAMPLE_EXPERIENCE: Experience[] = [
  { role: "Senior Product Designer", company: "FintechCo", period: "2021 – Present", summary: "Leading design for consumer banking app; shipped analytics dashboard and mobile redesign." },
  { role: "Product Designer", company: "SaaSlytics", period: "2018 – 2021", summary: "Designed end-to-end reporting suite; improved task completion by 20%." },
];

const SAMPLE_EDU: Education[] = [
  { school: "Design Institute", degree: "B.A. Interaction Design", period: "2014 – 2018" },
];

export default function TalentProfile() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [bookmarked, setBookmarked] = useState<boolean>(() => {
    try { return localStorage.getItem("bookmark_jordan_lee") === "1"; } catch { return false; }
  });

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/talents");
  };

  const filteredSkills = useMemo(() => {
    const q = query.toLowerCase();
    return SAMPLE_SKILLS.filter(s => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q));
  }, [query]);

  const toggleBookmark = () => {
    setBookmarked(v => {
      const next = !v;
      try { localStorage.setItem("bookmark_jordan_lee", next ? "1" : "0"); } catch {}
      return next;
    });
  };

  const downloadResume = () => {
    const content = `Jordan Lee\nSenior Product Designer\nExperience: 6+ years\nSkills: ${SAMPLE_SKILLS.map(s => s.name).join(", ")}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Jordan_Lee_Resume.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto px-6 py-8">
        <div className="mb-4">
          <Button variant="ghost" className="gap-2" onClick={handleBack} aria-label="Go back">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </div>
        <div className="profile-grid">
          {/* Left profile card */}
          <aside className="profile-card">
            <div className="flex flex-col items-center text-center">
              <div className="h-24 w-24 rounded-full bg-muted/40 overflow-hidden mb-3">
                {/* Placeholder avatar */}
                <img src={logo} alt="Profile" className="h-full w-full object-cover" />
              </div>
              <h2 className="text-xl font-semibold">Jordan Lee</h2>
              <p className="text-sm text-muted-foreground">Senior Product Designer</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" /> Toronto, Canada</p>

              <div className="w-full mt-4 flex gap-2">
                <Button className="flex-1 gap-2" onClick={() => window.open("mailto:jordan.lee@example.com") } aria-label="Contact Talent">
                  <Mail className="h-4 w-4" /> Contact Talent
                </Button>
                <Button variant="outline" className="gap-2" onClick={toggleBookmark} aria-pressed={bookmarked} aria-label="Save for Later">
                  <Bookmark className="h-4 w-4" /> {bookmarked ? "Saved" : "Save"}
                </Button>
              </div>

              <div className="w-full mt-4 space-y-2 text-left">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Experience Level</span>
                  <span>5–7 Years</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Availability</span>
                  <span className="font-medium text-primary">Available Immediately</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Desired Salary</span>
                  <span>Not Specified</span>
                </div>
              </div>

              <Button variant="secondary" className="w-full mt-4 gap-2" onClick={downloadResume} aria-label="Download Resume">
                <Download className="h-4 w-4" /> Download Resume
              </Button>
            </div>
          </aside>

          {/* Right content */}
          <section className="space-y-6">
            {/* Tabs header mimic */}
            <div className="flex items-center gap-6">
              <Button
                variant="link"
                className="px-0"
                onClick={() => scrollTo("overview")}
                aria-controls="overview"
                aria-label="Jump to Overview"
              >
                Overview
              </Button>
              <Button
                variant="link"
                className="px-0 text-muted-foreground"
                onClick={() => scrollTo("portfolio")}
                aria-controls="portfolio"
                aria-label="Jump to Portfolio"
              >
                Portfolio
              </Button>
              <Button
                variant="link"
                className="px-0 text-muted-foreground"
                onClick={() => scrollTo("achievements")}
                aria-controls="achievements"
                aria-label="Jump to Achievements"
              >
                Achievements
              </Button>
            </div>
            <div className="tabs-line" />

            {/* Highlight banner */}
            <Card id="overview">
              <CardContent className="p-4 flex items-start gap-3">
                <div className="h-8 w-8 rounded-md bg-primary/20 flex items-center justify-center">🏆</div>
                <div>
                  <p className="font-medium">Talent Hunt Challenge Finalist</p>
                  <p className="text-sm text-muted-foreground">Currently participating in the "Next-Gen Fintech App" challenge.</p>
                </div>
              </CardContent>
            </Card>

            {/* About Me */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">About Me</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">A passionate and user-centric Senior Product Designer with over 6 years of experience in creating intuitive and engaging digital experiences. I thrive in collaborative environments, translating complex problems into elegant solutions that balance user needs and business goals. My expertise lies in end-to-end design processes, from user research and wireframing to prototyping and visual design.</p>
              </CardContent>
            </Card>

            {/* Skills with filter and bars */}
            <Card>
              <CardHeader className="pb-2 flex items-center justify-between">
                <CardTitle className="text-base">Skills</CardTitle>
                <Input placeholder="Filter skills" value={query} onChange={(e) => setQuery(e.target.value)} className="max-w-[200px] bg-background/70" aria-label="Filter skills" />
              </CardHeader>
              <CardContent className="space-y-4">
                {filteredSkills.map((s) => (
                  <div key={s.name} className="grid grid-cols-[160px_1fr_60px] items-center gap-3">
                    <span className="chip inline-block">{s.name}</span>
                    <div className="skill-bar" role="progressbar" aria-valuenow={s.level} aria-valuemin={0} aria-valuemax={100} aria-label={`${s.name} proficiency`}>
                      <span style={{ width: `${s.level}%` }} />
                    </div>
                    <span className="text-sm text-muted-foreground justify-self-end">{s.level}%</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Experience & Education collapsible */}
            <Accordion type="single" collapsible defaultValue="exp">
              <AccordionItem value="exp" className="section-panel">
                <AccordionTrigger className="w-full px-4 py-3 text-left">Work Experience</AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="relative timeline space-y-4">
                    {SAMPLE_EXPERIENCE.map((e) => (
                      <div key={e.company + e.period} className="timeline-item">
                        <div className="timeline-dot" aria-hidden="true" />
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-md bg-muted/40" />
                          <div>
                            <p className="font-medium text-sm">{e.role} · {e.company}</p>
                            <p className="text-xs text-muted-foreground">{e.period}</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">{e.summary}</p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="edu" className="section-panel mt-3">
                <AccordionTrigger className="w-full px-4 py-3 text-left">Education</AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <ul className="space-y-3">
                    {SAMPLE_EDU.map((e) => (
                      <li key={e.school} className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-md bg-muted/40" />
                        <div>
                          <p className="font-medium text-sm">{e.school}</p>
                          <p className="text-xs text-muted-foreground">{e.degree} · {e.period}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Portfolio */}
            <Card id="portfolio">
              <CardHeader className="pb-2"><CardTitle className="text-base">Portfolio</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-0">
                      <div className="h-28 bg-muted/30" />
                      <div className="p-4">
                        <p className="font-medium text-sm">Fintech Mobile App Redesign</p>
                        <p className="text-xs text-muted-foreground">Complete overhaul of a mobile banking app to improve user flow and visual appeal.</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-0">
                      <div className="h-28 bg-muted/30" />
                      <div className="p-4">
                        <p className="font-medium text-sm">SaaS Analytics Dashboard</p>
                        <p className="text-xs text-muted-foreground">Designed a data-rich dashboard for a B2B SaaS platform, focusing on clarity and usability.</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card id="achievements">
              <CardHeader className="pb-2"><CardTitle className="text-base">Achievements</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-md bg-secondary/40 p-4 text-center">
                    <div className="text-2xl">⭐</div>
                    <p className="text-xs text-muted-foreground mt-2">Top Coder Q3</p>
                  </div>
                  <div className="rounded-md bg-secondary/40 p-4 text-center">
                    <div className="text-2xl">👥</div>
                    <p className="text-xs text-muted-foreground mt-2">Community Contributor</p>
                  </div>
                  <div className="rounded-md bg-secondary/40 p-4 text-center">
                    <div className="text-2xl">🎓</div>
                    <p className="text-xs text-muted-foreground mt-2">Figma Certified</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}