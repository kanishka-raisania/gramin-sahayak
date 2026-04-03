/**
 * Home — Main landing page with personalized greeting, bulletin board, and quick actions
 */
import { Link } from "react-router-dom";
import { MessageCircle, ShieldCheck, Sprout, Scale } from "lucide-react";
import BulletinBoard from "@/components/BulletinBoard";
import { useLanguage } from "@/i18n/LanguageContext";
import { useUserProfile } from "@/contexts/UserProfileContext";
import type { TranslationKey } from "@/i18n/translations";

const greetings: Record<string, string> = {
  en: "Welcome back",
  hi: "नमस्ते",
  pa: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ",
  bn: "নমস্কার",
  ta: "வணக்கம்",
};

const Home = () => {
  const { t, language } = useLanguage();
  const { profile } = useUserProfile();

  const greeting = greetings[language] || greetings.en;
  const userName = profile?.name;

  const quickActions = [
    {
      to: "/chat",
      icon: MessageCircle,
      labelKey: "quickWage" as const,
      descKey: "askForHelpDesc" as const,
      color: "bg-primary/10 border-primary/20 hover:bg-primary/15",
      iconColor: "text-primary",
    },
    {
      to: "/chat",
      icon: Sprout,
      labelKey: "quickFarming" as const,
      descKey: "quickFarmingDesc" as const,
      color: "bg-farmer/10 border-farmer/20 hover:bg-farmer/15",
      iconColor: "text-farmer",
    },
    {
      to: "/chat",
      icon: ShieldCheck,
      labelKey: "quickRation" as const,
      descKey: "quickRationDesc" as const,
      color: "bg-accent/10 border-accent/20 hover:bg-accent/15",
      iconColor: "text-accent",
    },
    {
      to: "/chat",
      icon: Scale,
      labelKey: "quickLegal" as const,
      descKey: "quickLegalDesc" as const,
      color: "bg-secondary/10 border-secondary/20 hover:bg-secondary/15",
      iconColor: "text-secondary",
    },
  ];

  return (
    <div className="min-h-screen pb-24">
      <main className="container mx-auto px-4 py-8 space-y-10">
        {/* Personalized greeting */}
        <div className="animate-fade-in">
          <h1 className="text-2xl font-extrabold text-foreground">
            {greeting}{userName ? `, ${userName} ji` : ""} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("homeSubtitle" as TranslationKey)}
          </p>
        </div>

        {/* Bulletin Board */}
        <BulletinBoard />

        {/* Quick Actions */}
        <section>
          <h2 className="text-xl font-extrabold text-foreground mb-5">
            {t("quickActions")}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map(({ to, icon: ActionIcon, labelKey, descKey, color, iconColor }) => (
              <Link
                key={labelKey}
                to={to}
                className={`flex flex-col items-center gap-2.5 rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md active:scale-[0.98] ${color}`}
              >
                <div className={`rounded-full bg-card p-3 shadow-sm ${iconColor}`}>
                  <ActionIcon className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-foreground">{t(labelKey as TranslationKey)}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{t(descKey as TranslationKey)}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-8 border-t border-border bg-muted py-5 text-center text-sm text-muted-foreground mb-16">
        <p>{t("footer")}</p>
      </footer>
    </div>
  );
};

export default Home;
