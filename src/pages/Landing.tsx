import { useState, useEffect, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import LandingShaderBackground from "@/components/LandingShaderBackground";
import ThemeToggle from "@/components/ThemeToggle";
import liminalLogo from "@/assets/liminal-logo-new.jpeg";


const subtexts = [
  "You don't have to know the right words.",
  "Say it gently. Or don't send it at all.",
  "This is a quiet place. Take your time.",
  "There's no wrong way to feel.",
  "You're allowed to just be here.",
];

// Generate random waypoints for the butterfly flight


const Landing = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [currentText, setCurrentText] = useState(0);

  useEffect(() => {
    if (!loading && user) {
      navigate("/home", { replace: true });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentText((prev) => (prev + 1) % subtexts.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);


  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="absolute right-4 top-4 z-20">
        <ThemeToggle />
      </div>
      <Suspense fallback={null}>
        <LandingShaderBackground />
      </Suspense>


      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center text-center"
      >

        {/* Logo */}
        <div className="mb-8 flex items-center justify-center">
          <img src={liminalLogo} alt="Liminal" className="h-20 w-20 rounded-full object-cover shadow-lg" />
        </div>

        <h1 className="mb-3 font-display text-3xl font-bold tracking-calm text-foreground md:text-5xl">
          Liminal
        </h1>

        <div className="mb-10 h-8">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentText}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.5 }}
              className="text-base text-muted-foreground italic"
            >
              {subtexts[currentText]}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="relative mb-6">
          <button
            onClick={() => navigate("/auth")}
            className="rounded-lg bg-primary px-8 py-3.5 text-sm font-medium text-primary-foreground transition-calm text-glow-hover hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
          >
            Start with how you feel
          </button>
        </div>

        <p className="max-w-xs text-xs leading-relaxed text-muted-foreground/70">
          Nothing here is posted. Nothing is saved unless you want it.
        </p>
      </motion.div>
    </div>
  );
};

export default Landing;
