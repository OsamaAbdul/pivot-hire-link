import { cn } from "@/lib/utils";
import { Briefcase, Settings, User, Users } from "lucide-react";

interface SidebarProps {
  active: string;
  onSelect: (key: string) => void;
  inMobile?: boolean;
}

const items = [
  { key: "jobs", label: "Job Posts", icon: Briefcase },
  { key: "talents", label: "Talents", icon: Users },
  { key: "profile", label: "Profile", icon: User },
  { key: "settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ active, onSelect, inMobile = false }: SidebarProps) {
  return (
    <aside
      className={cn(
        "bg-sidebar-background/100 text-sidebar-foreground border-sidebar-border p-3",
        inMobile ? "block w-full border-0" : "w-[240px] shrink-0 border-r hidden md:block",
      )}
      aria-label="Recruiter dashboard navigation"
    >
      <nav className="space-y-1">
        {items.map(({ key, label, icon: Icon }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-primary/15 text-sidebar-foreground ring-1 ring-sidebar-ring"
                  : "hover:bg-sidebar-accent/40"
              )}
              aria-current={isActive ? "page" : undefined}
              aria-label={label}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}