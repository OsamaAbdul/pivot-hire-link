import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <section className="container mx-auto px-6 py-12">
        <h1 className="text-2xl font-serif font-bold">Terms of Service</h1>
        <p className="mt-4 text-sm text-muted-foreground max-w-3xl">
          This is a placeholder Terms of Service page to provide a working link from the footer. Replace with your actual terms.
        </p>
      </section>
      <Footer />
    </div>
  );
};

export default Terms;