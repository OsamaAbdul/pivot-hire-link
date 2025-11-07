import { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import { Search, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import "./talent-dashboard.css";

interface DashboardShellProps {
  active: string;
  onSelect: (key: string) => void;
  children: ReactNode;
  rightAside?: ReactNode;
}

export default function DashboardShell({ active, onSelect, children, rightAside }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="flex gap-0">
      {/* Desktop sidebar */}
      <Sidebar active={active} onSelect={onSelect} />
      <main className="flex-1 min-h-[calc(100vh-160px)]">
        {/* Mobile top bar with hamburger */}
        <div className="px-6 pt-4 md:hidden flex items-center justify-between">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                aria-label="Open dashboard menu"
                className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-muted/20 focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <Menu className="h-6 w-6" aria-hidden="true" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-3/4 sm:max-w-sm">
              <SheetHeader className="border-b border-border p-3">
                <SheetTitle className="text-base">Menu</SheetTitle>
              </SheetHeader>
              <div className="p-2">
                <Sidebar
                  active={active}
                  inMobile
                  onSelect={(key) => {
                    setMobileOpen(false);
                    onSelect(key);
                  }}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
        {/* Top search bar */}
        <div className="px-6 pt-6">
          <div className="rounded-md bg-card border border-border p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                aria-label="Search jobs"
                placeholder="Search jobs..."
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
    </div>
  );
}