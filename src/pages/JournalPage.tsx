import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Download, Trash2, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface JournalEntry {
  id: string;
  date: string;
  emotions: string[];
  text: string;
}

const emotionColors: Record<string, string> = {
  Calm: "bg-lavender/20 text-lavender",
  Grateful: "bg-periwinkle/20 text-periwinkle",
  Overwhelmed: "bg-primary/15 text-primary",
  Tired: "bg-muted text-muted-foreground",
  Sad: "bg-indigo-soft/20 text-indigo-soft",
  Hopeful: "bg-periwinkle/20 text-periwinkle",
};

const emotionColorMap: Record<string, string> = {
  Calm: "hsl(var(--lavender))",
  Grateful: "hsl(var(--periwinkle))",
  Overwhelmed: "hsl(var(--primary))",
  Tired: "hsl(var(--muted-foreground))",
  Sad: "hsl(var(--indigo-soft))",
  Hopeful: "hsl(var(--periwinkle))",
};

const maxScore = 7;

const JournalPage = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWriting, setIsWriting] = useState(false);
  const [newText, setNewText] = useState("");
  const [newEmotions, setNewEmotions] = useState<string[]>([]);
  const [newDate, setNewDate] = useState<Date>(new Date());
  const [view, setView] = useState<"entries" | "timeline">("entries");
  const { user } = useAuth();

  const quickEmotions = ["Calm", "Sad", "Grateful", "Overwhelmed", "Hopeful", "Tired"];

  const emotionExpander: Record<string, string[]> = {
    Calm: ["Peaceful", "Settled", "Centered", "Still"],
    Sad: ["Melancholic", "Depleted", "Bereft", "Hollow"],
    Grateful: ["Moved", "Tender", "Appreciative", "Softened"],
    Overwhelmed: ["Flooded", "Scattered", "Stretched thin", "Drowning"],
    Hopeful: ["Cautiously open", "Expectant", "Emerging", "Stirring"],
    Tired: ["Drained", "Worn", "Bone-weary", "Running on empty"],
  };

  const [expandedEmotion, setExpandedEmotion] = useState<string | null>(null);

  // Fetch entries from database
  useEffect(() => {
    if (!user) return;
    const fetchEntries = async () => {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (!error && data) {
        setEntries(
          data.map((d) => ({
            id: d.id,
            date: format(new Date(d.created_at), "MMM d, yyyy"),
            emotions: d.emotions || [],
            text: d.content,
          }))
        );
      }
      setLoading(false);
    };
    fetchEntries();
  }, [user]);

  const toggleEmotion = (e: string) => {
    setNewEmotions((prev) =>
      prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]
    );
    if (!newEmotions.includes(e)) {
      setExpandedEmotion(e);
    } else {
      setExpandedEmotion(null);
    }
  };

  const selectGranularEmotion = (emotion: string) => {
    if (!newEmotions.includes(emotion)) {
      setNewEmotions((prev) => [...prev, emotion]);
    }
    setExpandedEmotion(null);
  };

  const saveEntry = async () => {
    if (!newText.trim() || !user) return;
    const { data, error } = await supabase
      .from("journal_entries")
      .insert({
        user_id: user.id,
        content: newText,
        emotions: newEmotions,
        created_at: newDate.toISOString(),
      })
      .select()
      .single();
    if (error) {
      toast({ title: "Failed to save entry", variant: "destructive" });
      return;
    }
    if (data) {
      const entry: JournalEntry = {
        id: data.id,
        date: format(new Date(data.created_at), "MMM d, yyyy"),
        emotions: data.emotions || [],
        text: data.content,
      };
      setEntries([entry, ...entries]);
    }
    setNewText("");
    setNewEmotions([]);
    setNewDate(new Date());
    setIsWriting(false);
    toast({ title: "Entry saved" });
  };

  const deleteEntry = async (id: string) => {
    const { error } = await supabase.from("journal_entries").delete().eq("id", id);
    if (!error) {
      setEntries((prev) => prev.filter((e) => e.id !== id));
      toast({ title: "Entry deleted" });
    }
  };

  const exportEntry = (entry: JournalEntry) => {
    const content = `Date: ${entry.date}\nEmotions: ${entry.emotions.join(", ")}\n\n${entry.text}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `journal-${entry.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Build timeline data from actual entries
  const buildWeeklyData = () => {
    const now = new Date();
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weekData: { day: string; emotions: string[]; score: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayEntries = entries.filter((e) => e.date === format(d, "MMM d, yyyy"));
      const allEmotions = dayEntries.flatMap((e) => e.emotions);
      weekData.push({
        day: days[d.getDay()],
        emotions: allEmotions.length > 0 ? allEmotions : [],
        score: dayEntries.length,
      });
    }
    return weekData;
  };

  const weeklyData = buildWeeklyData();
  const weekMaxScore = Math.max(...weeklyData.map((d) => d.score), 1);

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">Journal</h2>
          <button
            onClick={() => setIsWriting(true)}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-sm transition-calm hover:bg-primary/90"
          >
            <Plus size={14} />
            New entry
          </button>
        </div>

        {/* View toggle */}
        <div className="mb-6 flex gap-1 rounded-lg bg-secondary p-1">
          {(["entries", "timeline"] as const).map((v) => (
            <button
              key={v}
              onClick={() => {
                setView(v);
                if (v === "timeline" && isWriting) {
                  setIsWriting(false);
                  setNewText("");
                  setNewEmotions([]);
                  setExpandedEmotion(null);
                }
              }}
              className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-calm ${
                view === v
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {v === "entries" ? "Entries" : "Emotion Timeline"}
            </button>
          ))}
        </div>

        {/* New entry form */}
        {isWriting && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-6 space-y-4 rounded-lg border border-border bg-card p-4"
          >
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {quickEmotions.map((e) => (
                  <button
                    key={e}
                    onClick={() => toggleEmotion(e)}
                    className={`rounded-full px-2.5 py-1 text-[11px] transition-calm ${
                      newEmotions.includes(e)
                        ? "bg-primary/15 text-primary"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>

              {/* Emotion Vocabulary Expander */}
              {expandedEmotion && emotionExpander[expandedEmotion] && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-md bg-secondary/50 px-3 py-2"
                >
                  <p className="mb-1.5 text-[10px] text-muted-foreground">
                    Want more precision? No pressure.
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {emotionExpander[expandedEmotion].map((word) => (
                      <button
                        key={word}
                        onClick={() => selectGranularEmotion(word)}
                        className={`rounded-full border border-border px-2.5 py-1 text-[11px] transition-calm ${
                          newEmotions.includes(word)
                            ? "bg-primary/15 text-primary border-primary/30"
                            : "text-muted-foreground hover:text-foreground hover:border-foreground/30"
                        }`}
                      >
                        {word}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Show selected granular emotions */}
              {newEmotions.filter((e) => !quickEmotions.includes(e)).length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {newEmotions.filter((e) => !quickEmotions.includes(e)).map((e) => (
                    <span
                      key={e}
                      onClick={() => setNewEmotions((prev) => prev.filter((x) => x !== e))}
                      className="cursor-pointer rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary hover:bg-primary/20 transition-calm"
                    >
                      {e} ×
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Date picker */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs transition-calm",
                    newDate ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  <CalendarIcon size={14} />
                  {format(newDate, "MMM d, yyyy")}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={newDate}
                  onSelect={(d) => d && setNewDate(d)}
                  disabled={(date) => date > new Date()}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>

            <textarea
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Write freely. No one else will see this."
              className="w-full resize-none rounded-lg border-0 bg-transparent p-0 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
              rows={4}
            />
            <div className="flex gap-2">
              <button
                onClick={saveEntry}
                disabled={!newText.trim()}
                className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-calm hover:bg-primary/90 disabled:opacity-40"
              >
                Save
              </button>
              <button
                onClick={() => { setIsWriting(false); setNewText(""); setNewEmotions([]); setNewDate(new Date()); }}
                className="rounded-lg px-4 py-2 text-xs text-muted-foreground transition-calm hover:text-foreground"
              >
                Discard
              </button>
            </div>
          </motion.div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : view === "entries" ? (
          entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="font-display text-base font-bold text-foreground">No entries yet.</p>
              <p className="mt-1 text-sm text-muted-foreground">Let your heart out.</p>
            </div>
          ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="rounded-lg border border-border bg-card p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{entry.date}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => exportEntry(entry)}
                      className="rounded-md p-1.5 text-muted-foreground transition-calm hover:text-foreground"
                      aria-label="Export"
                    >
                      <Download size={14} />
                    </button>
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      className="rounded-md p-1.5 text-muted-foreground transition-calm hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="mb-2 flex flex-wrap gap-1">
                  {entry.emotions.map((e) => (
                    <span
                      key={e}
                      className={`rounded-full px-2 py-0.5 text-[10px] ${
                        emotionColors[e] || "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {e}
                    </span>
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-foreground/80">{entry.text}</p>
              </div>
            ))}
          </div>
          )
        ) : (
          entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="font-display text-base font-bold text-foreground">No emotions tracked yet.</p>
              <p className="mt-1 text-sm text-muted-foreground">Let's begin.</p>
            </div>
          ) : (
          <div className="space-y-8">
            {/* Last Week */}
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="mb-1 font-display text-sm font-bold text-foreground">Last Week</h3>
              <p className="mb-4 text-[11px] text-muted-foreground">Daily emotional presence</p>
              <div className="flex items-end gap-2">
                {weeklyData.map((d) => {
                  const height = (d.score / weekMaxScore) * 100;
                  const primaryEmotion = d.emotions[0];
                  const color = emotionColorMap[primaryEmotion] || "hsl(var(--primary))";
                  return (
                    <div key={d.day} className="group flex flex-1 flex-col items-center gap-1.5">
                      <div className="relative w-full">
                        <div
                          className="w-full rounded-t-md transition-all duration-300 group-hover:opacity-80"
                          style={{
                            height: `${d.score > 0 ? Math.max(height, 12) : 4}px`,
                            backgroundColor: d.score > 0 ? color : "hsl(var(--muted))",
                            opacity: d.score > 0 ? 0.7 : 0.3,
                          }}
                        />
                        {d.emotions.length > 0 && (
                          <div className="pointer-events-none absolute -top-16 left-1/2 z-10 hidden -translate-x-1/2 rounded-md border border-border bg-card px-2 py-1.5 shadow-md group-hover:block">
                            <p className="whitespace-nowrap text-[10px] font-medium text-foreground">
                              {d.emotions.join(", ")}
                            </p>
                            <p className="text-[9px] text-muted-foreground">
                              {d.score} {d.score === 1 ? "entry" : "entries"}
                            </p>
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground">{d.day}</span>
                    </div>
                  );
                })}
              </div>
              {/* Legend */}
              <div className="mt-4 flex flex-wrap gap-2">
                {Array.from(new Set(weeklyData.flatMap((d) => d.emotions))).map((e) => (
                  <div key={e} className="flex items-center gap-1">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: emotionColorMap[e] || "hsl(var(--primary))" }}
                    />
                    <span className="text-[10px] text-muted-foreground">{e}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-center text-xs text-muted-foreground/50">
              These reflect your emotional presence, not a score.
            </p>
          </div>
          )
        )}
      </motion.div>
    </div>
  );
};

export default JournalPage;
