import { Link, useLocation } from "react-router-dom";
import { Home, MessageCircle, ShieldCheck, Info } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";

const navItems: { path: string; labelKey: TranslationKey; icon: typeof Home }[] = [
  { path: "/", labelKey: "navHome", icon: Home },
  { path: "/chat", labelKey: "navHelp", icon: MessageCircle },
  { path: "/verify", labelKey: "navCheck", icon: ShieldCheck },
  { path: "/about", labelKey: "navAbout", icon: Info },
];

const Navbar = () => {
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();

  return (
    <>
      {/* Top header */}
      <header className="sticky top-0 z-50 bg-primary px-4 py-3 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🌾</span>
            <h1 className="text-xl font-extrabold text-primary-foreground tracking-tight">
              {t("appTitle")}
            </h1>
          </Link>
          {/* Language selector — persisted in localStorage */}
          {/* Bhashini API integration here later */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as "en" | "hi")}
            className="rounded-md bg-primary-foreground/20 px-2 py-1 text-sm font-semibold text-primary-foreground border-none outline-none cursor-pointer"
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
          </select>
        </div>
      </header>

      {/* Bottom tab bar for mobile */}
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
