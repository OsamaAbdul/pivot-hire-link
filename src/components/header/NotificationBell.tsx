import { useState } from "react";
import { Bell, CheckCircle, AlertTriangle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Notification = {
  id: string;
  title: string;
  description?: string;
  type?: "success" | "warning" | "info";
  read?: boolean;
  timestamp?: string;
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Application submitted",
      description: "Your application to Acme Design Lead was received.",
      type: "success",
      read: false,
      timestamp: "2m",
    },
    {
      id: "2",
      title: "New job posted",
      description: "Fintech front-end role in Toronto.",
      type: "info",
      read: false,
      timestamp: "1h",
    },
    {
      id: "3",
      title: "Profile incomplete",
      description: "Add a headline to improve visibility.",
      type: "warning",
      read: true,
      timestamp: "1d",
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const iconFor = (type?: Notification["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" aria-hidden />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" aria-hidden />;
      default:
        return <Bell className="h-4 w-4 text-primary" aria-hidden />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span
              aria-label={`${unreadCount} unread notifications`}
              className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-0.5 rounded-full bg-primary text-primary-foreground text-[10px] leading-4 text-center"
            >
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80" aria-label="Notification list">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          <Button variant="link" className="h-auto p-0 text-xs" onClick={markAllRead} aria-label="Mark all as read">
            Mark all read
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="p-3 text-sm text-muted-foreground">No notifications</div>
        ) : (
          notifications.slice(0, 8).map((n) => (
            <DropdownMenuItem
              key={n.id}
              className="flex items-start gap-3 focus:bg-accent/20 data-[highlighted]:bg-accent/20"
            >
              <div className="pt-1">{iconFor(n.type)}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{n.title}</p>
                  {!n.read && <Badge variant="secondary">New</Badge>}
                </div>
                {n.description && <p className="text-xs text-muted-foreground mt-0.5">{n.description}</p>}
              </div>
              {n.timestamp && <span className="text-[10px] text-muted-foreground">{n.timestamp}</span>}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}