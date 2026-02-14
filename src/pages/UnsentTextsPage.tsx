import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trash2, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface SavedMessage {
  id: string;
  emotions: string[];
  intensity: number;
  context: string | null;
  tone: string | null;
  message: string;
  created_at: string;
}

const UnsentTextsPage = () => {
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("saved_messages")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (!error && data) setMessages(data as SavedMessage[]);
      setLoading(false);
    };
    fetchMessages();
  }, [user]);

  const deleteMessage = async (id: string) => {
    const { error } = await supabase.from("saved_messages").delete().eq("id", id);
    if (!error) {
      setMessages((prev) => prev.filter((m) => m.id !== id));
      toast({ title: "Message deleted" });
    }
  };

  const copyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="mb-2 font-display text-2xl font-bold text-foreground md:text-3xl">Unsent Texts</h2>
        <p className="mb-8 text-base text-muted-foreground md:text-lg">
          Words you wrote but didn't send.
        </p>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="font-display text-base font-bold text-foreground">No unsent texts yet.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Save a message from Say It For Me and it'll appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-lg border border-border bg-card p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-1">
                      {msg.emotions.map((e) => (
                        <span
                          key={e}
                          className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary"
                        >
                          {e}
                        </span>
                      ))}
                      <span className="ml-auto text-[10px] text-muted-foreground">
                        {formatDate(msg.created_at)}
                      </span>
                    </div>

                    {msg.context && (
                      <p className="mb-2 text-[11px] text-muted-foreground">
                        For: {msg.context}
                      </p>
                    )}

                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
                      {msg.message}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col gap-1 pt-1">
                    <button
                      onClick={() => copyMessage(msg.message)}
                      className="rounded-md p-1.5 text-muted-foreground transition-calm hover:bg-secondary hover:text-foreground"
                      aria-label="Copy"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      onClick={() => deleteMessage(msg.id)}
                      className="rounded-md p-1.5 text-muted-foreground transition-calm hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default UnsentTextsPage;
