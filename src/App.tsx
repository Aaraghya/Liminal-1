import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ChatProvider } from "@/contexts/ChatContext";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import IntentPage from "./pages/IntentPage";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import MindBridgePage from "./pages/MindBridgePage";
import AICompanionPage from "./pages/AICompanionPage";
import PeerSupportPage from "./pages/PeerSupportPage";
import CommunityPage from "./pages/CommunityPage";
import BreathePage from "./pages/BreathePage";
import JournalPage from "./pages/JournalPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";
import UnsentTextsPage from "./pages/UnsentTextsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ChatProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/intent" element={<IntentPage />} />
                <Route element={<AppLayout />}>
                  <Route path="/home" element={<HomePage />} />
                  <Route path="/mind-bridge" element={<MindBridgePage />} />
                  <Route path="/ai-companion" element={<AICompanionPage />} />
                  <Route path="/peer-support" element={<PeerSupportPage />} />
                  <Route path="/community" element={<CommunityPage />} />
                  <Route path="/breathe" element={<BreathePage />} />
                  <Route path="/journal" element={<JournalPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/unsent" element={<UnsentTextsPage />} />
                </Route>
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ChatProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
