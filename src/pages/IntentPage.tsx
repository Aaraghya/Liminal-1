import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Wind, Brain, Flame, Compass } from "lucide-react";

const intents = [
  { icon: Heart, label: "Mental support", desc: "I need someone in my corner" },
  { icon: Flame, label: "Vent out", desc: "I just need to let it out" },
  { icon: Brain, label: "Understand my feelings", desc: "Help me make sense of things" },
  { icon: Wind, label: "Calm down", desc: "I need a moment of peace" },
  { icon: Compass, label: "Just explore", desc: "I'll look around at my own pace" },
];

const IntentPage = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState("");

  const handleContinue = () => {
    if (!selected) return;
    localStorage.setItem("liminal_intent", selected);
    localStorage.setItem("liminal_onboarded", "true");
    navigate("/home");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        <h1 className="mb-2 font-display text-2xl font-bold text-foreground md:text-3xl">
          What are you looking for right now?
        </h1>
        <p className="mb-8 text-sm text-muted-foreground">
          No pressure. You can always change your mind later.
        </p>

        <div className="space-y-3">
          {intents.map(({ icon: Icon, label, desc }) => (
            <button
              key={label}
              onClick={() => setSelected(label)}
              className={`flex w-full items-center gap-4 rounded-xl border p-5 text-left transition-calm ${
                selected === label
                  ? "border-primary bg-primary/10 shadow-sm"
                  : "border-border bg-card hover:border-primary/30 hover:bg-card/80"
              }`}
            >
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-calm ${
                  selected === label ? "bg-primary/20" : "bg-primary/10"
                }`}
              >
                <Icon size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={handleContinue}
          disabled={!selected}
          className="mt-8 w-full rounded-xl bg-primary py-3.5 text-sm font-medium text-primary-foreground transition-calm hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue
        </button>
      </motion.div>
    </div>
  );
};

export default IntentPage;
