import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ProfileBuilder from "./pages/ProfileBuilder";
import RecruiterOnboarding from "./pages/RecruiterOnboarding";
import NotFound from "./pages/NotFound";
import Talents from "./pages/Talents";
import TalentProfile from "./pages/TalentProfile";
import Partners from "./pages/Partners";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import PartnerApply from "./pages/PartnerApply";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import Admin from "./pages/Admin";
import { SessionProvider } from "@/hooks/useSessionManager";
import RequireAuth from "@/components/auth/RequireAuth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SessionProvider>
          <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/talents" element={<Talents />} />
          <Route path="/talents/profile/:id" element={<TalentProfile />} />
          <Route path="/partners" element={<Partners />} />
          <Route path="/partners/apply" element={<PartnerApply />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/profile/build" element={<RequireAuth><ProfileBuilder /></RequireAuth>} />
          <Route path="/recruiter/build" element={<RequireAuth><RecruiterOnboarding /></RequireAuth>} />
          <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
          </Routes>
        </SessionProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
