import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Send } from "lucide-react";

type Thread = {
  id: string;
  name: string;
  title?: string;
  lastMessage: string;
  unread: number;
  avatar?: string;
};

const initialThreads: Thread[] = [
  { id: "t1", name: "Sarah Chen", title: "AI & ML Specialist", lastMessage: "Let's review your model metrics.", unread: 2 },
  { id: "t2", name: "Michael B.", title: "Fintech Innovator", lastMessage: "Great work on the dashboard!", unread: 0 },
  { id: "t3", name: "Emily Rose", title: "UX/UI Designer", lastMessage: "Can you share the latest mockups?", unread: 1 },
  { id: "t4", name: "David Lee", title: "Blockchain Dev", lastMessage: "Let's sync on the smart contract.", unread: 0 },
];

export default function MessagesSection() {
  const [threads, setThreads] = useState<Thread[]>(initialThreads);
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string>(initialThreads[0].id);
  const [composer, setComposer] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return threads.filter(t => [t.name, t.title, t.lastMessage].filter(Boolean).some(v => v!.toLowerCase().includes(q)));
  }, [threads, query]);

  useEffect(() => {
    // When a thread becomes active, mark unread as seen
    setThreads(prev => prev.map(t => (t.id === activeId ? { ...t, unread: 0 } : t)));
  }, [activeId]);

  const activeThread = threads.find(t => t.id === activeId) || threads[0];

  const handleSend = () => {
    if (!composer.trim()) return;
    // Simulate message append by updating lastMessage and clearing input
    setThreads(prev => prev.map(t => (t.id === activeId ? { ...t, lastMessage: composer.trim() } : t)));
    setComposer("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
      {/* Threads list */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Messages</CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input
              aria-label="Search messages"
              placeholder="Search"
              className="pl-9 bg-background/70"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ul role="list" className="divide-y divide-border max-h-[520px] overflow-y-auto no-scrollbar">
            {filtered.map((t) => {
              const isActive = t.id === activeId;
              return (
                <li key={t.id}>
                  <button
                    className={`w-full text-left p-4 flex items-start gap-3 transition-colors ${
                      isActive ? "bg-card" : "hover:bg-secondary/40"
                    }`}
                    onClick={() => setActiveId(t.id)}
                    aria-current={isActive ? "true" : undefined}
                  >
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full bg-muted/40 flex items-center justify-center text-sm font-semibold">
                        {t.name.split(" ").map(w => w[0]).slice(0,2).join("")}
                      </div>
                      {t.unread > 0 && (
                        <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-primary" aria-label={`${t.unread} unread`} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{t.name}</p>
                        {t.unread > 0 && (
                          <Badge variant="default" className="text-[10px] px-1.5 py-0">{t.unread}</Badge>
                        )}
                      </div>
                      {t.title && <p className="text-xs text-muted-foreground">{t.title}</p>}
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{t.lastMessage}</p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      {/* Active thread / composer */}
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="text-base">{activeThread?.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 space-y-4">
          <div className="space-y-3">
            <div className="rounded-md bg-secondary/40 p-3 max-w-[70%]">{activeThread?.lastMessage}</div>
            <div className="rounded-md bg-primary/20 p-3 max-w-[70%] ml-auto">Sounds great — let’s proceed.</div>
          </div>
          <div className="mt-6 border-t border-border pt-4">
            <label htmlFor="composer" className="sr-only">Compose message</label>
            <div className="flex gap-3 items-end">
              <Input
                id="composer"
                value={composer}
                onChange={(e) => setComposer(e.target.value)}
                placeholder="Type your message..."
                className="bg-background/70"
              />
              <Button onClick={handleSend} className="gap-2" aria-label="Send message">
                <Send className="h-4 w-4" />
                Send
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}