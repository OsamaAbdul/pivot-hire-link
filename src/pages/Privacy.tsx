import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1">
      <section className="container mx-auto px-6 py-12">
        <h1 className="text-2xl font-serif font-bold">Privacy Policy</h1>
        <p className="mt-4 text-sm text-muted-foreground max-w-3xl">
          This is a placeholder Privacy Policy page to provide a working link from the footer. Replace with your actual policy content.
        </p>
      </section>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;