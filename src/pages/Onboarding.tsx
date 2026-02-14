import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const feelings = [
  "Anxious", "Sad", "Overwhelmed", "Lonely", "Confused",
  "Angry", "Numb", "Hopeful", "Restless", "Uncertain",
  "Grateful", "Calm", "Disconnected", "Exhausted",
];

const areas = [
  { label: "Relationships", icon: "💭" },
  { label: "Career", icon: "📌" },
  { label: "Academics", icon: "📖" },
  { label: "Family", icon: "🏠" },
  { label: "Mental Well-being", icon: "🧠" },
  { label: "Life Transitions", icon: "🔄" },
];

const durations = [
  "Just today",
  "A few days",
  "Weeks",
  "Months",
  "As long as I can remember",
];

const challengeBadges: Record<string, string> = {
  Relationships: "Navigating Loneliness",
  Career: "Career Crossroads",
  Academics: "Academic Stress",
  Family: "Family Challenges",
  "Mental Well-being": "Heartbreak Healing",
  "Life Transitions": "Life Transitions",
};

const journeyStages = [
  "Just Starting",
  "Making Progress",
  "Finding Strength",
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selectedFeelings, setSelectedFeelings] = useState<string[]>([]);
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("");

  const toggleFeeling = (f: string) => {
    setSelectedFeelings((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );
  };

  const getJourneyStage = () => {
    if (selectedDuration === "Just today" || selectedDuration === "A few days")
      return journeyStages[0];
    if (selectedDuration === "Weeks" || selectedDuration === "Months")
      return journeyStages[1];
    return journeyStages[2];
  };

  const handleComplete = () => {
    // Store badges locally for now
    const badges = {
      primary: challengeBadges[selectedArea] || "Life Transitions",
      secondary: getJourneyStage(),
      feelings: selectedFeelings,
      area: selectedArea,
      duration: selectedDuration,
    };
    localStorage.setItem("mindbridge_badges", JSON.stringify(badges));
    navigate("/home");
  };

  const canProceed =
    (step === 0 && selectedFeelings.length > 0) ||
    (step === 1 && selectedArea) ||
    (step === 2 && selectedDuration);

  const steps = [
    // Step 0: Feelings
    <motion.div
      key="feelings"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="space-y-6"
    >
      <div>
      <h2 className="font-display text-lg font-bold text-foreground md:text-xl">
          How are you feeling right now?
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Select as many as feel true. There are no wrong answers.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {feelings.map((f) => (
          <button
            key={f}
            onClick={() => toggleFeeling(f)}
            className={`rounded-full border px-4 py-2 text-sm transition-calm ${
              selectedFeelings.includes(f)
                ? "border-primary bg-primary/15 text-primary"
                : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>
    </motion.div>,

    // Step 1: Area
    <motion.div
      key="area"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="space-y-6"
    >
      <div>
      <h2 className="font-display text-lg font-bold text-foreground md:text-xl">
          What area needs support?
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This helps us understand, not diagnose.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {areas.map((a) => (
          <button
            key={a.label}
            onClick={() => setSelectedArea(a.label)}
            className={`flex items-center gap-3 rounded-lg border p-4 text-left text-sm transition-calm ${
              selectedArea === a.label
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/30"
            }`}
          >
            <span className="text-lg">{a.icon}</span>
            {a.label}
          </button>
        ))}
      </div>
    </motion.div>,

    // Step 2: Duration
    <motion.div
      key="duration"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="space-y-6"
    >
      <div>
      <h2 className="font-display text-lg font-bold text-foreground md:text-xl">
          How long have you felt this way?
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          No pressure for precision. A rough sense is enough.
        </p>
      </div>
      <div className="space-y-2">
        {durations.map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDuration(d)}
            className={`block w-full rounded-lg border p-3.5 text-left text-sm transition-calm ${
              selectedDuration === d
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/30"
            }`}
          >
            {d}
          </button>
        ))}
      </div>
    </motion.div>,
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md">
        {/* Progress indicator */}
        <div className="mb-8 flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-calm ${
                i <= step ? "bg-primary" : "bg-border"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">{steps[step]}</AnimatePresence>

        <div className="mt-8 flex justify-between">
          {step > 0 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="text-sm text-muted-foreground transition-calm hover:text-foreground"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={() => {
              if (step < 2) setStep((s) => s + 1);
              else handleComplete();
            }}
            disabled={!canProceed}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-calm hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {step < 2 ? "Continue" : "Begin"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
