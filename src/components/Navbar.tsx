/**
 * Navbar — Top header with logo + language selector + profile, and bottom tab bar
 */
import { Link, useLocation } from "react-router-dom";
import { Home, MessageCircle, ShieldCheck, Info, User } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { languageNames, type Language } from "@/i18n/translations";
import type { TranslationKey } from "@/i18n/translations";
import GraminLogo from "./GraminLogo";
import { useToast } from "@/hooks/use-toast";

const navItems: { path: string; labelKey: TranslationKey; icon: typeof Home }[] = [
  { path: "/", labelKey: "navHome", icon: Home },
  { path: "/chat", labelKey: "navHelp", icon: MessageCircle },
  { path: "/verify", labelKey: "navCheck", icon: ShieldCheck },
  { path: "/profile", labelKey: "navProfile" as TranslationKey, icon: User },
];

const Navbar = () => {
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const { profile } = useUserProfile();
  const { toast } = useToast();

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    toast({
      title: `${t("langChanged")} ${languageNames[lang]}`,
      duration: 2000,
    });
  };

  return (
    <>
      {/* Top header */}
      <header className="sticky top-0 z-50 bg-primary px-4 py-3 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <GraminLogo size={36} showText />
          </Link>

          <div className="flex items-center gap-2">
            {/* Language selector */}
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value as Language)}
              className="rounded-full bg-card/90 px-4 py-2 text-sm font-semibold text-foreground border border-border shadow-sm outline-none cursor-pointer hover:bg-card transition-colors backdrop-blur-sm"
            >
              {(Object.keys(languageNames) as Language[]).map((code) => (
                <option key={code} value={code}>
                  {languageNames[code]}
                </option>
              ))}
            </select>

            {/* Profile avatar */}
            <Link
              to="/profile"
              className="rounded-full bg-primary-foreground/20 p-2 hover:bg-primary-foreground/30 transition-colors"
            >
              <User className="h-5 w-5 text-primary-foreground" />
            </Link>
          </div>
        </div>
      </header>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-around py-1">
          {navItems.map(({ path, labelKey, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 text-xs font-semibold transition-colors ${
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-6 w-6" strokeWidth={active ? 2.5 : 2} />
                <span>{t(labelKey)}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
