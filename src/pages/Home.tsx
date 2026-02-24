/**
 * Home — Main landing page with bulletin board and quick action cards
 */
import { Link } from "react-router-dom";
import { MessageCircle, ShieldCheck, Sprout, Scale } from "lucide-react";
import BulletinBoard from "@/components/BulletinBoard";
import { useLanguage } from "@/i18n/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";

const Home = () => {
  const { t } = useLanguage();

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
