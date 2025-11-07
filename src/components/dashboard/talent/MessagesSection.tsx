import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Send } from "lucide-react";
import ChatModal, { ChatMessage } from "@/components/messaging/ChatModal";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [chatScrollPositions, setChatScrollPositions] = useState<Record<string, number>>({});
  const contactListRef = useRef<HTMLUListElement | null>(null);
  const contactBtnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const contactListScrollTopRef = useRef<number>(0);
  const [composerInline, setComposerInline] = useState("");
  const isMobile = useIsMobile();
  const largeChatRef = useRef<HTMLDivElement | null>(null);

  const [messagesByThread, setMessagesByThread] = useState<Record<string, ChatMessage[]>>(() => {
    const now = Date.now();
    const byId: Record<string, ChatMessage[]> = {};
    initialThreads.forEach((t, idx) => {
      byId[t.id] = [
        { id: `${t.id}-m1`, author: "them", content: t.lastMessage, timestamp: now - (idx + 1) * 60000 },
        { id: `${t.id}-m2`, author: "me", content: "Sounds great — let’s proceed.", timestamp: now - idx * 30000 },
      ];
    });
    return byId;
  });

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return threads.filter(t => [t.name, t.title, t.lastMessage].filter(Boolean).some(v => v!.toLowerCase().includes(q)));
  }, [threads, query]);

  useEffect(() => {
    setThreads(prev => prev.map(t => (t.id === activeId ? { ...t, unread: 0 } : t)));
  }, [activeId]);

  const activeThread = threads.find(t => t.id === activeId) || threads[0];

  const openChatFor = (id: string) => {
    contactListScrollTopRef.current = contactListRef.current?.scrollTop ?? 0;
    setActiveId(id);
    if (isMobile) {
      setChatOpen(true);
    }
  };

  const handleSend = (text: string) => {
    const now = Date.now();
    setMessagesByThread(prev => ({
      ...prev,
      [activeId]: [...(prev[activeId] || []), { id: `${activeId}-${now}`, author: "me", content: text, timestamp: now }],
    }));
    setThreads(prev => prev.map(t => (t.id === activeId ? { ...t, lastMessage: text } : t)));
  };

  const handleBack = () => {
    setChatOpen(false);
    requestAnimationFrame(() => {
      const btn = contactBtnRefs.current[activeId];
      if (btn) btn.focus();
      const list = contactListRef.current;
      if (list) list.scrollTop = contactListScrollTopRef.current;
    });
  };

  useEffect(() => {
    if (isMobile) return; // modal handles its own scroll
    const el = largeChatRef.current;
    if (!el) return;
    // Auto-scroll to bottom when new messages arrive
    el.scrollTop = el.scrollHeight;
  }, [messagesByThread[activeThread.id]?.length, isMobile]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
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
          <ul
            ref={contactListRef}
            role="list"
            aria-label="Contact list"
            className="divide-y divide-border max-h-[520px] overflow-y-auto no-scrollbar"
          >
            {filtered.map((t) => {
              const isActive = t.id === activeId;
              return (
                <li key={t.id}>
                  <button
                    ref={(el) => (contactBtnRefs.current[t.id] = el)}
                    className={`w-full text-left p-4 flex items-start gap-3 transition-colors ${
                      isActive ? "bg-card" : "hover:bg-secondary/40"
                    }`}
                    onClick={() => openChatFor(t.id)}
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
      {/* Large screens: inline chat (maintain previous two-pane design) */}
      <div className="hidden lg:block">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-base">{activeThread?.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            <div ref={largeChatRef} className="space-y-3 max-h-[520px] overflow-y-auto no-scrollbar pr-1">
              {(messagesByThread[activeThread.id] || []).map((m) => (
                <div
                  key={m.id}
                  className={
                    m.author === "me"
                      ? "rounded-md bg-primary/20 p-3 max-w-[70%] ml-auto"
                      : "rounded-md bg-secondary/40 p-3 max-w-[70%]"
                  }
                >
                  {m.content}
                </div>
              ))}
            </div>
            <div className="mt-6 border-t border-border pt-4">
              <label htmlFor="composer-inline" className="sr-only">Compose message</label>
              <div className="flex gap-3 items-end">
                <Input
                  id="composer-inline"
                  value={composerInline}
                  onChange={(e) => setComposerInline(e.target.value)}
                  placeholder="Type your message..."
                  className="bg-background/70"
                />
                <Button
                  onClick={() => {
                    if (!composerInline.trim()) return;
                    handleSend(composerInline.trim());
                    setComposerInline("");
                  }}
                  className="gap-2"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                  Send
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile: modal chat */}
      <div className="lg:hidden">
        <ChatModal
          key={activeThread.id}
          open={chatOpen}
          onOpenChange={(o) => setChatOpen(o)}
          thread={{ id: activeThread.id, name: activeThread.name }}
          messages={messagesByThread[activeThread.id] || []}
          onSend={handleSend}
          onBack={handleBack}
          initialScrollTop={chatScrollPositions[activeThread.id] || 0}
          onCaptureScrollTop={(value) => setChatScrollPositions((prev) => ({ ...prev, [activeThread.id]: value }))}
        />
      </div>
    </div>
  );
}