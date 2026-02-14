import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Wind, BookOpen, PenLine } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const getGreeting = (displayName: string, isFirstTime: boolean) => {
  const hour = new Date().getHours();
  if (isFirstTime) {
    return `Welcome to your journey, ${displayName}`;
  }
  // Late night: 10pm - 5am
  if (hour >= 22 || hour < 5) {
    return `You're safe here, ${displayName}`;
  }
  // Morning: 5am - 12pm
  if (hour < 12) {
    return `Welcome to your journey, ${displayName}`;
  }
  // Afternoon / evening
  return `Welcome back, ${displayName}`;
};

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [badges, setBadges] = useState<{ primary: string; secondary: string } | null>(null);
  const displayName = user?.user_metadata?.display_name || "friend";
  const isFirstTime = !localStorage.getItem("liminal_onboarded");

  useEffect(() => {
    // Redirect first-time users to intent page
    if (isFirstTime) {
      navigate("/intent", { replace: true });
      return;
    }
    const stored = localStorage.getItem("mindbridge_badges");
    if (stored) setBadges(JSON.parse(stored));
  }, [isFirstTime, navigate]);

  const greeting = getGreeting(displayName, false);

  const quickActions = [
    {
      icon: PenLine,
      label: "Express something",
      desc: "Use Say It For Me to find words",
      action: () => navigate("/mind-bridge"),
    },
    {
      icon: Wind,
      label: "Breathe",
      desc: "4-7-8 breathing exercise",
      action: () => navigate("/breathe"),
    },
    {
      icon: BookOpen,
      label: "Journal",
      desc: "Reflect on how you've been",
      action: () => navigate("/journal"),
    },
  ];

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="mb-2 font-display text-2xl font-bold text-foreground md:text-3xl">
          {greeting}
        </h2>
        <p className="mb-10 text-base text-muted-foreground md:text-lg">
          Take it at your own pace. There's no rush.
        </p>

        {/* Badges */}
        {badges && (
          <div className="mb-10 flex gap-2">
            <span className="rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
              {badges.primary}
            </span>
            <span className="rounded-full border border-border bg-secondary px-4 py-1.5 text-sm text-secondary-foreground">
              {badges.secondary}
            </span>
          </div>
        )}

        {/* Quick actions */}
        <div className="space-y-4">
          {quickActions.map(({ icon: Icon, label, desc, action }) => (
            <button
              key={label}
              onClick={action}
              className="flex w-full items-center gap-5 rounded-xl border border-border bg-card p-5 md:p-6 text-left transition-calm hover:border-primary/30 hover:bg-card/80"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Icon size={22} className="text-primary" />
              </div>
              <div>
                <p className="text-base font-medium text-foreground">{label}</p>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Reassurance */}
        <p className="mt-14 text-center text-sm text-muted-foreground/50">
          You can close this app anytime. It will be here when you return.
        </p>
      </motion.div>
    </div>
  );
};

export default HomePage;
