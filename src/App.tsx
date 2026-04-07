import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { UserProfileProvider } from "@/contexts/UserProfileContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { useUserProfile } from "@/contexts/UserProfileContext";
import Navbar from "@/components/Navbar";
import LanguageSelector from "@/components/LanguageSelector";
import OnboardingFlow from "@/components/OnboardingFlow";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Verify from "./pages/Verify";
import About from "./pages/About";
import Profile from "./pages/Profile";
import NewsDetail from "./pages/NewsDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Apply stored theme on load
(() => {
  const theme = localStorage.getItem("gs-theme");
  if (theme === "pink") document.documentElement.classList.add("theme-pink");
  if (theme === "highcontrast") document.documentElement.classList.add("theme-highcontrast");
})();

const AppContent = () => {
  const { isFirstLaunch } = useLanguage();
  const { isOnboarded } = useUserProfile();

  if (isFirstLaunch) {
    return <LanguageSelector />;
  }

  if (!isOnboarded) {
    return <OnboardingFlow />;
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/news/:id" element={<NewsDetail />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/about" element={<About />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <LanguageProvider>
          <UserProfileProvider>
            <AppContent />
          </UserProfileProvider>
        </LanguageProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
