import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { streamChat } from "@/lib/streamChat";
import { useToast } from "@/hooks/use-toast";
import { useChat } from "@/contexts/ChatContext";

const AICompanionPage = () => {
  const { messages, setMessages, welcomeMessage } = useChat();
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Get intent for AI context
  const intent = localStorage.getItem("liminal_intent") || "";

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const send = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    const userMsg = { role: "user" as const, content: trimmed };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsStreaming(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    const controller = new AbortController();
    abortRef.current = controller;

    let assistantSoFar = "";

    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && prev.length > newMessages.length) {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
          );
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: newMessages.filter((m) => m !== welcomeMessage),
        userContext: intent ? { journeyStage: intent } : undefined,
        onDelta: upsertAssistant,
        onDone: () => setIsStreaming(false),
        onError: (err) => {
          toast({
            title: "Liminal",
            description: err,
            variant: "destructive",
          });
          setIsStreaming(false);
        },
        signal: controller.signal,
      });
    } catch (e: any) {
      if (e.name !== "AbortError") {
        toast({
          title: "Connection lost",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
      setIsStreaming(false);
    }
  }, [input, isStreaming, messages, setMessages, welcomeMessage, toast, intent]);

  const clearChat = () => {
    if (isStreaming) {
      abortRef.current?.abort();
    }
    setMessages([welcomeMessage]);
    setIsStreaming(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  return (
    <div className="flex h-[calc(100dvh-4rem-4rem)] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div>
          <h2 className="font-display text-base font-bold text-foreground md:text-lg">Liminal AI</h2>
          <p className="text-xs text-muted-foreground">
            A quiet space for whatever you need to say
          </p>
        </div>
        <button
          onClick={clearChat}
          className="rounded-lg p-2 text-muted-foreground transition-calm hover:bg-card hover:text-foreground"
          title="Clear conversation"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="mx-auto max-w-2xl space-y-4 px-6 py-6">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary/15 text-foreground"
                      : "bg-card text-foreground"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="rounded-2xl bg-card px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground [animation-delay:300ms]" />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-border px-6 py-3">
        <div className="mx-auto flex max-w-2xl items-end gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Say whatever you need..."
            rows={1}
            className="min-h-[40px] max-h-[120px] resize-none rounded-xl border-border bg-card text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
          />
          <button
            onClick={send}
            disabled={!input.trim() || isStreaming}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-calm hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="mx-auto mt-2 max-w-2xl text-center text-[11px] text-muted-foreground/50">
          This is a private space. Nothing is shared or scored.
        </p>
      </div>
    </div>
  );
};

export default AICompanionPage;
