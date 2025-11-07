import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { Users, Megaphone, Wrench, Lightbulb, TrendingUp, UsersRound } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <Navbar />

      {/* Hero */}
      <section className="container mx-auto px-6 pt-16 pb-12 md:pt-24 md:pb-20 text-center">
        <h1 className="font-serif font-extrabold tracking-tight text-5xl md:text-7xl lg:text-8xl leading-tight">
          Discover and Empower
          <br />
          Northern Talent.
        </h1>
        <p className="mt-6 max-w-3xl mx-auto text-muted-foreground text-base md:text-lg">
          Connecting aspiring individuals from the North with the mentors and investors who can help them thrive.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="px-8 ">
            <Link to="/auth?mode=signup">Apply Now</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="px-8 border-2 border-accent">
            <Link to="/partners/apply">Become a Partner</Link>
          </Button>
         
        </div>
      </section>

      {/* Programs */}
      <section id="programs" className="container mx-auto px-6 py-10 md:py-16">
        <h2 className="text-center text-2xl md:text-3xl font-serif font-bold">Our Programs</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-md bg-muted text-foreground">
                  <Users className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold">Mentorship Programs</p>
                  <p className="text-sm text-muted-foreground">Gain invaluable guidance from industry experts and seasoned entrepreneurs.</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-md bg-muted text-foreground">
                  <Megaphone className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold">Investor Pitch Nights</p>
                  <p className="text-sm text-muted-foreground">Present your innovative ideas to a network of active investors and VCs.</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-md bg-muted text-foreground">
                  <Wrench className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold">Skill-Building Workshops</p>
                  <p className="text-sm text-muted-foreground">Enhance your capabilities with targeted workshops on tech, business, and design.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Featured Talents */}
      <section className="container mx-auto px-6 py-10 md:py-16">
        <h2 className="text-center text-2xl md:text-3xl font-serif font-bold">Featured Talents</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-4">
          {[
            { name: "Aisha Bello", role: "Fintech Innovator" },
            { name: "Chinedu Okoro", role: "AI Specialist" },
            { name: "Musa Ibrahim", role: "SaaS Founder" },
            { name: "Fatima Garba", role: "UX Designer" },
          ].map((t, i) => (
            <Card key={i} className="text-center">
              <CardContent className="p-6 space-y-4">
                <div className="mx-auto h-24 w-24 rounded-full ring-2 ring-accent overflow-hidden">
                  <Avatar className="h-24 w-24">
                    <AvatarImage
                      src={`https://avatar.iran.liara.run/public`}
                      alt={`${t.name} avatar`}
                      loading="lazy"
                    />
                    <AvatarFallback>{t.name.split(" ")[0].charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
                <Link to="/talents/profile/demo" className="text-xs text-accent hover:underline" aria-label={`View ${t.name} profile`}>
                  View Profile →
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Foundation Goals */}
      <section className="container mx-auto px-6 py-10 md:py-16">
        <h2 className="text-center text-2xl md:text-3xl font-serif font-bold">Our Foundation's Goals</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <Card>
            <CardContent className="p-6 text-center space-y-3">
              <div className="mx-auto p-3 rounded-full bg-muted w-12 h-12 flex items-center justify-center">
                <Lightbulb className="h-6 w-6 text-accent" />
              </div>
              <p className="font-semibold">Fostering Innovation</p>
              <p className="text-sm text-muted-foreground">Nurturing groundbreaking ideas and providing resources for them to flourish.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center space-y-3">
              <div className="mx-auto p-3 rounded-full bg-muted w-12 h-12 flex items-center justify-center">
                <UsersRound className="h-6 w-6 text-accent" />
              </div>
              <p className="font-semibold">Building Community</p>
              <p className="text-sm text-muted-foreground">Creating a strong, supportive network of founders, mentors, and investors.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center space-y-3">
              <div className="mx-auto p-3 rounded-full bg-muted w-12 h-12 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <p className="font-semibold">Driving Regional Growth</p>
              <p className="text-sm text-muted-foreground">Empowering local talent to build sustainable businesses and boost the economy.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
