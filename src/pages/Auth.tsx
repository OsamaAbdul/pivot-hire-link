import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const Auth = () => {
  const location = useLocation();
  // This route exists to trigger Navbar's route-driven auth modals.
  useEffect(() => {
    // Navbar inspects `/auth?mode=` and opens the correct modal.
  }, [location]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <section className="container mx-auto px-6 pt-16 pb-10 text-center">
        <h1 className="font-serif font-extrabold text-4xl md:text-5xl">Authentication</h1>
        <p className="mt-3 text-sm md:text-base text-muted-foreground">
          Use the navigation bar to sign in or apply. This page opens the appropriate modal automatically.
        </p>
      </section>
      <Footer />
    </div>
  );
};

export default Auth;