import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { Home, MessageCircle, Bot, Users, BookOpen, User, ArrowLeft, Mail } from "lucide-react";
import liminalLogo from "@/assets/liminal-logo-new.jpeg";
import ThemeToggle from "@/components/ThemeToggle";
import { NavBar } from "@/components/ui/tubelight-navbar";
import WelcomeNotification from "@/components/WelcomeNotification";

const navItems = [
  { name: "Home", url: "/home", icon: Home },
  { name: "Say It", url: "/mind-bridge", icon: MessageCircle },
  { name: "Unsent", url: "/unsent", icon: Mail },
  { name: "AI", url: "/ai-companion", icon: Bot },
  { name: "Community", url: "/community", icon: BookOpen },
  { name: "Profile", url: "/profile", icon: User },
];

const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/home";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-3">
          {!isHome && (
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card/80 px-2.5 py-1.5 text-sm text-muted-foreground transition-calm hover:border-primary/30 hover:bg-card hover:text-foreground"
              aria-label="Go back"
            >
              <ArrowLeft size={16} strokeWidth={2} />
              <span className="text-xs font-medium">Back</span>
            </button>
          )}
          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-2 font-display text-lg font-bold tracking-calm text-foreground md:text-xl"
          >
            <img src={liminalLogo} alt="Liminal" className="h-8 w-8 rounded-md object-cover" />
            Liminal
          </button>
        </div>
        <ThemeToggle />
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      {/* Welcome notification - only on home */}
      {isHome && <WelcomeNotification />}

      {/* Bottom navigation - Tubelight navbar */}
      <NavBar items={navItems} />
    </div>
  );
};

export default AppLayout;
