import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rocket, GraduationCap, Share2 } from "lucide-react";
import { Link } from "react-router-dom";

const PillarCard = ({ icon: Icon, title, description }: { icon: any; title: string; description: string }) => (
  <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-transform duration-200 hover:-translate-y-[2px]">
    <div className="flex flex-col items-center text-center gap-4">
      <div className="p-3 rounded-md bg-muted text-foreground">
        <Icon className="h-5 w-5 text-accent" />
      </div>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  </div>
);

const About = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero / Intro */}
      <section className="container mx-auto px-6 py-10 md:py-16">
        <Card className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f2536] via-[#132c43] to-[#0f1f2e] border-0">
          <div className="px-6 md:px-10 py-10 md:py-14 text-center">
            <h1 className="font-serif font-extrabold tracking-tight text-3xl md:text-5xl lg:text-6xl leading-tight">
              About the Northern Founders
              <br />
              Community
            </h1>
            <p className="mt-4 max-w-3xl mx-auto text-muted-foreground text-sm md:text-base">
              Fostering innovation and connection by bridging the gap between emerging
              talent, experienced mentors, and visionary investors in the North.
            </p>
          </div>
        </Card>
      </section>

      {/* Mission */}
      <section className="container mx-auto px-6 py-10">
        <h2 className="text-center text-xl md:text-2xl font-serif font-bold">Our Mission</h2>
        <p className="mt-4 max-w-3xl mx-auto text-center text-muted-foreground text-xs md:text-sm">
          Our core purpose is to bridge the gap between emerging talent, experienced mentors, and visionary
          investors. We are dedicated to creating a dynamic ecosystem where innovative ideas can flourish and careers
          can be built, fostering a new generation of leaders and groundbreaking ventures in the North.
        </p>
      </section>

      {/* Pillars */}
      <section className="container mx-auto px-6 py-6 md:py-10">
        <h2 className="text-center text-xl md:text-2xl font-serif font-bold">Our Pillars</h2>
        <p className="mt-2 text-center text-xs md:text-sm text-muted-foreground">
          The foundational principles that guide our community and drive our mission forward.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <PillarCard
            icon={Share2}
            title="Connect"
            description="Creating a vibrant, interconnected network where founders, talent, and investors can forge meaningful and lasting relationships."
          />
          <PillarCard
            icon={GraduationCap}
            title="Empower"
            description="Providing access to essential resources, expert mentorship, and skill‑building workshops to equip our members for success."
          />
          <PillarCard
            icon={Rocket}
            title="Accelerate"
            description="Fast‑tracking career and company growth by creating direct pathways to funding, opportunities, and strategic partnerships."
          />
        </div>
      </section>

      {/* CTA Banner */}
      <section className="container mx-auto px-6 py-10">
        <Card className="rounded-2xl border border-border bg-gradient-to-br from-[#0f2536] via-[#132c43] to-[#0f1f2e]">
          <div className="px-6 md:px-10 py-10 md:py-12 text-center">
            <h3 className="text-xl md:text-2xl font-serif font-bold text-accent">Become Part of Our Community</h3>
            <p className="mt-3 max-w-3xl mx-auto text-muted-foreground text-xs md:text-sm">
              Whether you are an aspiring talent, a seasoned mentor, or a forward‑thinking investor,
              your journey starts here. Join us in shaping the future of innovation in the North.
            </p>
            <div className="mt-6">
              <Button asChild className="px-6">
                <Link to="/auth?mode=signup">Join the Hunt</Link>
              </Button>
            </div>
          </div>
        </Card>
      </section>

      <Footer />
    </div>
  );
};

export default About;