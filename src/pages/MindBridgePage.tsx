import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, RotateCcw, Bookmark, Archive } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

const emotions = [
  "Hurt", "Lonely", "Misunderstood", "Overwhelmed", "Disappointed",
  "Frustrated", "Afraid", "Ashamed", "Exhausted", "Grateful",
  "Hopeful", "Relieved", "Confused", "Angry", "Numb",
  "Nostalgic", "Guilty", "Yearning", "Tender", "Resigned",
];

const emotionExpander: Record<string, string[]> = {
  Hurt: ["Wounded", "Stung", "Bruised", "Raw"],
  Lonely: ["Isolated", "Disconnected", "Invisible", "Adrift"],
  Misunderstood: ["Unseen", "Dismissed", "Silenced", "Overlooked"],
  Overwhelmed: ["Flooded", "Scattered", "Stretched thin", "Drowning"],
  Disappointed: ["Let down", "Deflated", "Disheartened", "Unfulfilled"],
  Frustrated: ["Stuck", "Blocked", "Agitated", "Impatient"],
  Afraid: ["Anxious", "On edge", "Terrified", "Uneasy"],
  Ashamed: ["Exposed", "Small", "Mortified", "Unworthy"],
  Exhausted: ["Drained", "Worn", "Bone-weary", "Running on empty"],
  Grateful: ["Moved", "Tender", "Appreciative", "Softened"],
  Hopeful: ["Cautiously open", "Expectant", "Emerging", "Stirring"],
  Relieved: ["Unburdened", "Lighter", "Released", "At ease"],
  Confused: ["Lost", "Uncertain", "Foggy", "Torn"],
  Angry: ["Furious", "Bitter", "Resentful", "Burning"],
  Numb: ["Hollow", "Detached", "Flatlined", "Shut down"],
  Nostalgic: ["Wistful", "Aching", "Bittersweet", "Longing"],
  Guilty: ["Regretful", "Heavy-hearted", "Burdened", "Self-blaming"],
  Yearning: ["Craving", "Pining", "Reaching", "Hungry for"],
  Tender: ["Soft", "Open", "Vulnerable", "Gentle"],
  Resigned: ["Surrendered", "Given up", "Defeated", "Accepting"],
};

const tones = [
  { id: "gentle", label: "Very Gentle" },
  { id: "honest", label: "Honest & Calm" },
  { id: "short", label: "Short & Simple" },
  { id: "unsent", label: "Unsent" },
];

const contexts = ["Myself", "Someone I love", "A friend", "A colleague", "Family"];

const MindBridgePage = () => {
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [expandedEmotion, setExpandedEmotion] = useState<string | null>(null);
  const [intensity, setIntensity] = useState(50);
  const [context, setContext] = useState("");
  const [tone, setTone] = useState("");
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [step, setStep] = useState<"select" | "compose" | "result">("select");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const toggleEmotion = (e: string) => {
    if (selectedEmotions.includes(e)) {
      setSelectedEmotions((prev) => prev.filter((x) => x !== e));
      setExpandedEmotion(null);
    } else {
      setSelectedEmotions((prev) => [...prev, e]);
      if (emotionExpander[e]) setExpandedEmotion(e);
    }
  };

  const selectGranularEmotion = (emotion: string) => {
    if (!selectedEmotions.includes(emotion)) {
      setSelectedEmotions((prev) => [...prev, emotion]);
    }
    setExpandedEmotion(null);
  };

  const generateMessage = () => {
    const emotionStr = selectedEmotions.join(", ").toLowerCase();
    const intensityWord = intensity < 30 ? "a quiet" : intensity < 70 ? "a steady" : "a deep";
    const recipient = context || "you";

    const messages: Record<string, string> = {
      gentle: `I've been carrying ${intensityWord} sense of ${emotionStr} lately, and I wanted to share that with ${recipient === "Myself" ? "myself" : recipient.toLowerCase()}. It's not something I need fixed or solved. I just needed to let it out, to give it a shape outside of my head.\n\nSome days it sits heavier than others. Today feels like one of those days. I don't have all the words for it yet, but this is what I have right now. And maybe that's enough.`,

      honest: `I'm going to be honest with ${recipient === "Myself" ? "myself" : recipient.toLowerCase()} about something. I've been feeling ${emotionStr}, and the intensity of it caught me off guard. It's not just a passing mood. It's been sitting with me, shaping how I move through the day.\n\nI'm not looking for someone to make it better. I just want to name it, because pretending it's not there hasn't been working. This is me, being real about where I am right now.`,

      short: `I've been feeling ${emotionStr}. It's real, it's present, and I'm sitting with it.\n\nI wanted to put it into words. Not to fix anything, just to be honest with ${recipient === "Myself" ? "myself" : recipient.toLowerCase()}.`,

      unsent: `Dear ${recipient},\n\nI've been carrying something I haven't been able to say out loud. I feel ${emotionStr}, and the weight of it has been building. There are moments when it's ${intensityWord} presence I can't shake, and other times it fades just enough to let me breathe.\n\nI don't know if I'll ever send this. Maybe the point isn't sending it. Maybe the point is letting these feelings exist somewhere outside of me, even if it's just here, in words no one else will read.\n\nI hope you understand, even if you never hear this.\n\nWith quiet honesty.`,
    };

    setGeneratedMessage(messages[tone] || messages.gentle);
    setStep("result");
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedMessage);
    toast({ title: "Copied to clipboard" });
  };

  const saveForLater = async () => {
    if (!user) {
      toast({ title: "Please sign in to save messages", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("saved_messages").insert({
      user_id: user.id,
      emotions: selectedEmotions,
      intensity,
      context,
      tone,
      message: generatedMessage,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Could not save", description: "Something went wrong.", variant: "destructive" });
    } else {
      toast({ title: "Saved to Unsent Texts" });
    }
  };

  const reset = () => {
    setSelectedEmotions([]);
    setExpandedEmotion(null);
    setIntensity(50);
    setContext("");
    setTone("");
    setGeneratedMessage("");
    setStep("select");
  };

  const intensityLabel = intensity < 30 ? "Quiet" : intensity < 70 ? "Present" : "Deep";

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">Say It For Me</h2>
          <button
            onClick={() => navigate("/unsent")}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card/80 px-3 py-1.5 text-xs text-muted-foreground transition-calm hover:border-primary/30 hover:text-foreground"
          >
            <Archive size={14} />
            Unsent
          </button>
        </div>
        <p className="mb-8 text-base text-muted-foreground md:text-lg">
          Want help putting your feelings into words?
        </p>

        {step === "select" && (
          <div className="space-y-6">
            {/* Emotions */}
            <div>
              <label className="mb-2 block text-xs font-medium text-muted-foreground">
                What are you feeling?
              </label>
              <div className="flex flex-wrap gap-2">
                {emotions.map((e) => (
                  <button
                    key={e}
                    onClick={() => toggleEmotion(e)}
                    className={`rounded-full border px-3 py-1.5 text-xs transition-calm ${
                      selectedEmotions.includes(e)
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border bg-card text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Emotion Vocabulary Expander */}
            {expandedEmotion && emotionExpander[expandedEmotion] && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-secondary/50 px-4 py-3"
              >
                <p className="mb-2 text-[11px] text-muted-foreground">
                  Want more precision? No pressure.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {emotionExpander[expandedEmotion].map((word) => (
                    <button
                      key={word}
                      onClick={() => selectGranularEmotion(word)}
                      className={`rounded-full border border-border px-2.5 py-1 text-[11px] transition-calm ${
                        selectedEmotions.includes(word)
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

            {/* Selected granular emotions */}
            {selectedEmotions.filter((e) => !emotions.includes(e)).length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedEmotions.filter((e) => !emotions.includes(e)).map((e) => (
                  <span
                    key={e}
                    onClick={() => setSelectedEmotions((prev) => prev.filter((x) => x !== e))}
                    className="cursor-pointer rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary hover:bg-primary/20 transition-calm"
                  >
                    {e} ×
                  </span>
                ))}
              </div>
            )}

            {/* Intensity */}
            <div>
              <label className="mb-3 block text-xs font-medium text-muted-foreground">
                How intense does it feel?
              </label>
              <div className="space-y-2">
                <Slider
                  value={[intensity]}
                  onValueChange={(v) => setIntensity(v[0])}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">Quiet</span>
                  <span className="text-[11px] font-medium text-primary">{intensityLabel}</span>
                  <span className="text-[11px] text-muted-foreground">Deep</span>
                </div>
              </div>
            </div>

            {selectedEmotions.length > 0 && (
              <button
                onClick={() => setStep("compose")}
                className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-calm hover:bg-primary/90"
              >
                Continue
              </button>
            )}
          </div>
        )}

        {step === "compose" && (
          <div className="space-y-6">
            {/* Context */}
            <div>
              <label className="mb-2 block text-xs font-medium text-muted-foreground">
                Who is this for?
              </label>
              <div className="flex flex-wrap gap-2">
                {contexts.map((c) => (
                  <button
                    key={c}
                    onClick={() => setContext(c)}
                    className={`rounded-full border px-3 py-1.5 text-xs transition-calm ${
                      context === c
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border bg-card text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Tone */}
            <div>
              <label className="mb-2 block text-xs font-medium text-muted-foreground">
                Choose a tone
              </label>
              <div className="space-y-2">
                {tones.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTone(t.id)}
                    className={`block w-full rounded-lg border p-3 text-left text-sm transition-calm ${
                      tone === t.id
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {tone && (
              <button
                onClick={generateMessage}
                className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-calm hover:bg-primary/90"
              >
                Help me find the words
              </button>
            )}

            <button
              onClick={() => setStep("select")}
              className="w-full text-center text-xs text-muted-foreground transition-calm hover:text-foreground"
            >
              Go back
            </button>
          </div>
        )}

        {step === "result" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="rounded-lg border border-border bg-card p-5">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {generatedMessage}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground transition-calm hover:border-primary/30"
              >
                <Copy size={14} />
                Copy
              </button>
              <button
                onClick={saveForLater}
                disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2.5 text-sm text-primary transition-calm hover:bg-primary/15 disabled:opacity-40"
              >
                <Bookmark size={14} />
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={reset}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground transition-calm hover:border-primary/30"
              >
                <RotateCcw size={14} />
                Start over
              </button>
            </div>

            <p className="text-center text-xs text-muted-foreground/60">
              You don't have to send this. Saving is optional.
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default MindBridgePage;
