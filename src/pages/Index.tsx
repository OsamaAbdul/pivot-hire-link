import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import logo from "@/assets/nfc-logo.jpg";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={logo} alt="NFC Logo" className="w-12 h-12 rounded-full object-cover" />
            <div>
              <h2 className="font-serif font-bold text-lg text-foreground">Northern Founders</h2>
              <p className="text-sm text-muted-foreground">Community</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button asChild>
              <Link to="/auth?mode=signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <p className="text-xl md:text-2xl text-muted-foreground font-light">
              Hey, it's
            </p>
            <h1 className="text-6xl md:text-8xl font-bold text-primary leading-tight">
              YOUR PLATFORM
            </h1>
          </div>
          
          <div className="bg-primary text-primary-foreground py-16 px-8 md:px-16 rounded-lg transform -skew-y-2 shadow-xl">
            <div className="transform skew-y-2 space-y-6">
              <h2 className="text-3xl md:text-4xl font-serif font-bold">
                Connecting Talent with Opportunity
              </h2>
              <p className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                The platform where developers showcase their skills and recruiters discover the perfect talent for their teams
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button size="lg" asChild className="text-lg px-8">
              <Link to="/auth?mode=signup&role=developer">I'm a Developer</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8">
              <Link to="/auth?mode=signup&role=recruiter">I'm a Recruiter</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-card py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div className="space-y-4">
              <h3 className="text-3xl font-serif font-bold text-primary">For Developers</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">●</span>
                  <span>Build and showcase your professional profile</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">●</span>
                  <span>Upload your resume and highlight your skills</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">●</span>
                  <span>Browse and apply for exciting opportunities</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">●</span>
                  <span>Track your applications in real-time</span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-3xl font-serif font-bold text-primary">For Recruiters</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">●</span>
                  <span>Post job openings and freelance gigs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">●</span>
                  <span>Search developers by skills and experience</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">●</span>
                  <span>Review applications and manage candidates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">●</span>
                  <span>Connect directly with top talent</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-6 text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <img src={logo} alt="NFC Logo" className="w-10 h-10 rounded-full object-cover" />
            <div className="text-left">
              <h3 className="font-serif font-bold">Northern Founders Community</h3>
              <p className="text-sm opacity-80">Building connections, creating opportunities</p>
            </div>
          </div>
          <p className="text-sm opacity-70">© 2025 Northern Founders Community. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
