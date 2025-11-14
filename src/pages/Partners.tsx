import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";

const partners = [
  {
    name: "Innovate North",
    desc:
      "Pioneering technological advancements and supporting deep-tech startups across the region.",
  },
  {
    name: "VentureUp",
    desc: "Fueling the growth of promising startups with strategic investments and mentorship.",
  },
  {
    name: "Future Fund",
    desc: "A leading venture capital firm focused on scalable, impact-driven technology companies.",
  },
  {
    name: "TechSphere",
    desc: "Global technology powerhouse providing infrastructure and cloud solutions for startups.",
  },
  {
    name: "Northern Growth",
    desc: "A regional development agency committed to fostering economic prosperity in the North.",
  },
  {
    name: "Quantum Leap AI",
    desc: "Specialists in artificial intelligence and machine learning solutions for modern enterprises.",
  },
];

const LogoMark = () => (
  <div className="mx-auto mb-5 flex items-center justify-center">
    <div className="rounded-md bg-card p-2 shadow-sm">
      <div className="rounded-md border-4 border-white/80 p-2">
        <div className="h-10 w-10 rounded-sm bg-accent" />
      </div>
    </div>
  </div>
);

const Partners = () => {
  return (
    <div className="dark min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1">
      {/* Header */}
      <section className="container mx-auto px-6 pt-14 md:pt-20 text-center">
        <h1 className="font-sans font-extrabold tracking-tight text-5xl md:text-6xl">
          Our Esteemed Partners
        </h1>
        <p className="mt-5 max-w-3xl mx-auto text-muted-foreground text-sm md:text-base">
          We are proud to collaborate with a diverse group of industry leaders, investors, and
          innovators who are dedicated to empowering the next generation of Northern talent.
        </p>
      </section>

      {/* Grid */}
      <section className="container mx-auto px-6 py-10 md:py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {partners.map((p) => (
            <Card key={p.name} className="bg-card">
              <CardContent className="p-8 text-center">
                <LogoMark />
                <p className="font-semibold">{p.name}</p>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {p.desc}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      </main>

      <Footer />
    </div>
  );
};

export default Partners;