import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        const msg = error.message?.toLowerCase() || "";
        if (msg.includes("invalid login credentials")) {
          setError("Invalid credentials!");
        } else if (msg.includes("user not found") || msg.includes("no user found")) {
          setError("User not found!");
        } else {
          setError(error.message);
        }
      } else {
        navigate("/home", { replace: true });
      }
    } else {
      const { error } = await signUp(email, password, displayName);
      if (error) {
        setError(error.message);
      } else {
        setConfirmEmail(true);
      }
    }
    setLoading(false);
  };

  if (confirmEmail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm text-center"
        >
          <h1 className="mb-3 font-display text-xl font-bold tracking-calm text-foreground md:text-2xl">Check your email</h1>
          <p className="mb-6 text-sm text-muted-foreground">
            We sent a confirmation link to <strong className="text-foreground">{email}</strong>. Click it to activate your space.
          </p>
          <button
            onClick={() => { setConfirmEmail(false); setIsLogin(true); }}
            className="text-sm text-primary transition-calm hover:text-primary/80"
          >
            Back to sign in
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm"
      >
        <h1 className="mb-1 font-display text-xl font-bold tracking-calm text-foreground md:text-2xl">
          {isLogin ? "Welcome back" : "Begin your journey"}
        </h1>
        <p className="mb-8 text-sm text-muted-foreground">
          {isLogin ? "Your space is still here." : "Everything stays between you and this screen."}
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-destructive/10 px-4 py-2.5 text-xs text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 transition-calm focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                placeholder="What should we call you?"
              />
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 transition-calm focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-lg border border-border bg-card px-4 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground/50 transition-calm focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-calm hover:text-foreground"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {isLogin && (
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-border accent-primary"
              />
              Remember me
            </label>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-calm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50"
          >
            {loading ? "Please wait..." : isLogin ? "Enter" : "Create your space"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          {isLogin ? "New here?" : "Already have a space?"}{" "}
          <button
            onClick={() => { setIsLogin(!isLogin); setError(""); }}
            className="text-primary transition-calm text-glow-hover hover:text-primary/80"
          >
            {isLogin ? "Create an account" : "Sign in"}
          </button>
        </p>

        <p className="mt-8 text-center text-[11px] leading-relaxed text-muted-foreground/50">
          Your identity is yours alone. We don't share, sell, or expose anything.
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
