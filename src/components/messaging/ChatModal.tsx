import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send } from "lucide-react";

export type ChatMessage = {
  id: string;
  author: "me" | "them";
  content: string;
  timestamp: number;
};

export type ChatThread = {
  id: string;
  name: string;
};

type ChatModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  thread: ChatThread;
  messages: ChatMessage[];
  onSend: (text: string) => void;
  onBack: () => void;
  initialScrollTop?: number;
  onCaptureScrollTop?: (value: number) => void;
};

const ChatModal = ({
  open,
  onOpenChange,
  thread,
  messages,
  onSend,
  onBack,
  initialScrollTop = 0,
  onCaptureScrollTop,
}: ChatModalProps) => {
  const [composer, setComposer] = useState("");
  const historyRef = useRef<HTMLDivElement | null>(null);
  const composerRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    const node = historyRef.current;
    if (!node) return;
    node.scrollTop = initialScrollTop ?? 0;
    if ((initialScrollTop ?? 0) === 0) {
      node.scrollTop = node.scrollHeight;
    }
  }, [thread.id]);

  useEffect(() => {
    const node = historyRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [messages.length]);

  useEffect(() => {
    return () => {
      const node = historyRef.current;
      if (onCaptureScrollTop && node) {
        onCaptureScrollTop(node.scrollTop);
      }
    };
  }, [onCaptureScrollTop]);

  const handleSend = () => {
    const text = composer.trim();
    if (!text) return;
    onSend(text);
    setComposer("");
    composerRef.current?.focus();
  };

  const ariaLabel = useMemo(() => `Chat with ${thread.name}`, [thread.name]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-label={ariaLabel}
        className="z-50 w-[calc(100vw-2rem)] sm:w-full max-w-[640px] sm:max-w-lg p-0 sm:p-0 max-h-[90vh] sm:max-h-[85vh] overflow-hidden"
      >
        <DialogHeader className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={onBack}
              aria-label="Back to contacts"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <DialogTitle className="text-base">{thread.name}</DialogTitle>
          </div>
        </DialogHeader>

        <div
          ref={historyRef}
          aria-label="Message history"
          className="flex-1 overflow-y-auto scroll-smooth touch-pan-y p-4 space-y-3 bg-background"
        >
          {messages.map((m) => (
            <div
              key={m.id}
              className={
                m.author === "me"
                  ? "max-w-[72%] ml-auto rounded-md bg-primary/20 p-3"
                  : "max-w-[72%] rounded-md bg-secondary/40 p-3"
              }
            >
              <p className="text-sm">{m.content}</p>
              <span className="sr-only">{new Date(m.timestamp).toLocaleString()}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-border p-3 bg-card">
          <label htmlFor="chat-composer" className="sr-only">Compose message</label>
          <div className="flex items-end gap-2">
            <Input
              id="chat-composer"
              ref={composerRef}
              value={composer}
              onChange={(e) => setComposer(e.target.value)}
              placeholder="Type your message..."
              aria-label="Type your message"
              className="bg-background/70"
            />
            <Button onClick={handleSend} aria-label="Send message" className="gap-2">
              <Send className="h-4 w-4" />
              Send
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatModal;