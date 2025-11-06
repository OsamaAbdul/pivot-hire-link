import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import "./talent-dashboard.css";

interface DashboardShellProps {
  active: string;
  onSelect: (key: string) => void;
  children: ReactNode;
  rightAside?: ReactNode;
}

export default function DashboardShell({ active, onSelect, children, rightAside }: DashboardShellProps) {
  return (
    <div className="flex gap-0">
      <Sidebar active={active} onSelect={onSelect} />
      <main className="flex-1 min-h-[calc(100vh-160px)]">
        {/* Top search bar */}
        <div className="px-6 pt-6">
          <div className="rounded-md bg-card border border-border p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                aria-label="Search challenges, mentors"
                placeholder="Search challenges, mentors..."
                className="pl-9 bg-background/70"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 px-6 py-6">
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