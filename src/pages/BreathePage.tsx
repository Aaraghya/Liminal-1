import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

type Phase = "inhale" | "hold" | "exhale";

const phases: { name: Phase; duration: number; label: string }[] = [
  { name: "inhale", duration: 4, label: "Breathe in" },
  { name: "hold", duration: 7, label: "Hold" },
  { name: "exhale", duration: 8, label: "Breathe out" },
];

const BreathePage = () => {
  const [active, setActive] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [timer, setTimer] = useState(0);
  const [cycles, setCycles] = useState(0);

  const currentPhase = phases[phaseIndex];

  const tick = useCallback(() => {
    setTimer((t) => {
      if (t + 1 >= currentPhase.duration) {
        setPhaseIndex((pi) => {
          const next = (pi + 1) % phases.length;
          if (next === 0) setCycles((c) => c + 1);
          return next;
        });
        return 0;
      }
      return t + 1;
    });
  }, [currentPhase.duration]);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [active, tick]);

  const reset = () => {
    setActive(false);
    setPhaseIndex(0);
    setTimer(0);
    setCycles(0);
  };

  const circleScale =
    currentPhase.name === "inhale"
      ? 1 + (timer / currentPhase.duration) * 0.4
      : currentPhase.name === "exhale"
      ? 1.4 - (timer / currentPhase.duration) * 0.4
      : 1.4;

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-12 md:py-20">
      <h2 className="mb-2 font-display text-2xl font-bold text-foreground md:text-3xl">Breathe</h2>
      <p className="mb-12 text-sm text-muted-foreground">4 – 7 – 8</p>

      {/* Circle */}
      <div className="relative mb-12 flex h-48 w-48 items-center justify-center">
        <motion.div
          animate={{ scale: active ? circleScale : 1 }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
          className="absolute h-full w-full rounded-full border-2 border-primary/30 bg-primary/10"
        />
        <span className="relative z-10 text-sm text-foreground">
          {active ? currentPhase.label : "Ready"}
        </span>
      </div>

      {active && (
        <p className="mb-8 text-xs text-muted-foreground">
          Cycle {cycles + 1} · {currentPhase.duration - timer}s
        </p>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => setActive(!active)}
          className="rounded-lg bg-primary px-8 py-2.5 text-sm font-medium text-primary-foreground transition-calm hover:bg-primary/90"
        >
          {active ? "Pause" : "Begin"}
        </button>
        {(active || cycles > 0) && (
          <button
            onClick={reset}
            className="rounded-lg border border-border px-6 py-2.5 text-sm text-foreground transition-calm hover:border-primary/30"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
};

export default BreathePage;
