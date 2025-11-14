import { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import { Search, Menu, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface DashboardShellProps {
  active: string;
  onSelect: (key: string) => void;
  children: ReactNode;
  rightAside?: ReactNode;
}

export default function DashboardShell({ active, onSelect, children, rightAside }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleSelect = (key: string) => {
    onSelect(key);
    setMobileOpen(false);
  };
  return (
    <div className="flex gap-0">
      <Sidebar active={active} onSelect={onSelect} />
      <main className="flex-1 min-h-[calc(100vh-160px)]">
        {/* Mobile hamburger anchored left and sticky */}
        <div className="md:hidden sticky top-2 z-30 px-3 flex items-center justify-start">
          <button
            className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-muted/20 focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Open sidebar menu"
            aria-controls="dashboard-mobile-menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
          </button>
        </div>

        {/* Top search bar */}
        <div className="px-6 pt-6">
          <div className="rounded-md bg-card border border-border p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                aria-label="Search"
                placeholder="Search..."
                className="pl-9 bg-background/70"
              />
            </div>
          </div>
        </div>

        <div className={`grid grid-cols-1 ${rightAside ? "xl:grid-cols-[1fr_360px]" : "xl:grid-cols-1"} gap-6 px-6 py-6`}>
          <section aria-label="Primary content" className="space-y-6">
            {children}
          </section>
          {rightAside && (
            <aside aria-label="Secondary panels" className="space-y-6">
              {rightAside}
            </aside>
          )}
        </div>
      </main>

      {/* Mobile sidebar panel - opens from left */}
      {mobileOpen && (
        <div
          id="dashboard-mobile-menu"
          role="dialog"
          aria-modal="true"
          className="md:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          onKeyDown={(e) => {
            if (e.key === "Escape") setMobileOpen(false);
          }}
        >
          <div className="absolute left-0 top-0 h-full w-72 max-w-[80vw] bg-card border-r border-border shadow-xl">
            <div className="px-5 py-4 flex items-center justify-between border-b border-border">
              <span className="font-serif font-semibold">Menu</span>
              <button
                className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-muted/20 focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <Sidebar active={active} onSelect={handleSelect} inMobile />
          </div>
        </div>
      )}
    </div>
  );
}