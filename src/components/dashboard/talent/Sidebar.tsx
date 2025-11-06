import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { Home, Trophy, User, Settings, MessageSquare } from "lucide-react";

interface SidebarProps {
  active: string;
  onSelect: (key: string) => void;
}

const items = [
  { key: "dashboard", label: "Dashboard", icon: Home },
  { key: "challenges", label: "Challenges", icon: Trophy },
  { key: "profile", label: "My Profile", icon: User },
  { key: "settings", label: "Settings", icon: Settings },
  { key: "messages", label: "Messages", icon: MessageSquare },
];

export default function Sidebar({ active, onSelect }: SidebarProps) {
  const location = useLocation();

  return (
    <aside
      className="bg-sidebar-background/100 text-sidebar-foreground w-[240px] shrink-0 border-r border-sidebar-border p-3 hidden md:block"
      aria-label="Dashboard navigation"
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
              {key === "messages" && (
                <span className="ml-auto inline-flex items-center justify-center text-xs rounded-full bg-primary/25 text-primary-foreground px-2 py-0.5">
                  New
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}