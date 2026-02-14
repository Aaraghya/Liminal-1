import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bot } from "lucide-react";

const welcomeMessages = [
  "Welcome back. Take a moment to check in with yourself.",
  "How are you feeling right now, honestly?",
  "This space is yours. Start wherever you are.",
  "You can take your time here.",
  "Whatever you are feeling today is allowed.",
  "No pressure. Just notice what is present.",
  "What feels most real to you today?",
  "What has been on your mind lately?",
  "Start with what is easiest to say.",
  "Name what you are carrying today.",
];

const WelcomeNotification = () => {
  const [visible, setVisible] = useState(false);
  const [message] = useState(
    () => welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)]
  );

  useEffect(() => {
    const alreadyShown = sessionStorage.getItem("liminal_welcome_shown");
    if (alreadyShown) return;
    const timer = setTimeout(() => {
      setVisible(true);
      sessionStorage.setItem("liminal_welcome_shown", "true");
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const dismiss = setTimeout(() => setVisible(false), 6000);
    return () => clearTimeout(dismiss);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ x: -320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -320, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="fixed bottom-24 left-4 z-50 flex max-w-[300px] items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-lg"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15">
            <Bot size={16} className="text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-foreground/90 leading-relaxed">{message}</p>
            <p className="mt-1 text-[10px] text-muted-foreground">Liminal AI</p>
          </div>
          <button
            onClick={() => setVisible(false)}
            className="shrink-0 rounded-md p-0.5 text-muted-foreground transition-calm hover:text-foreground"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeNotification;
