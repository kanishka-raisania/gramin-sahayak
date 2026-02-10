import { Link } from "react-router-dom";
import { MessageCircle, ShieldCheck, Info } from "lucide-react";
import BulletinBoard from "@/components/BulletinBoard";
import { useLanguage } from "@/i18n/LanguageContext";

const Home = () => {
  const { t } = useLanguage();

  const actionButtons = [
    {
      to: "/chat",
      emoji: "💬",
      labelKey: "askForHelp" as const,
      descKey: "askForHelpDesc" as const,
      color: "bg-primary hover:bg-primary/90 text-primary-foreground",
    },
    {
      to: "/verify",
      emoji: "🛡",
      labelKey: "checkNews" as const,
      descKey: "checkNewsDesc" as const,
      color: "bg-secondary hover:bg-secondary/90 text-secondary-foreground",
    },
    {
      to: "/about",
      emoji: "ℹ️",
      labelKey: "aboutApp" as const,
      descKey: "aboutAppDesc" as const,
      color: "bg-accent hover:bg-accent/90 text-accent-foreground",
    },
  ];

  return (
    <div className="min-h-screen pb-24">
      <main className="container mx-auto px-4 py-8 space-y-10">
        {/* Bulletin Board — shown first */}
        <BulletinBoard />

        {/* Action Buttons */}
        <section>
          <h2 className="text-xl font-extrabold text-foreground mb-4">
            🚀 {t("quickActions")}
          </h2>
          <div className="grid gap-3">
            {actionButtons.map(({ to, emoji, labelKey, descKey, color }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-4 rounded-xl p-5 shadow-sm transition-all hover:shadow-md active:scale-[0.98] ${color}`}
              >
                <span className="text-3xl">{emoji}</span>
                <div>
                  <div className="text-lg font-bold">{t(labelKey)}</div>
                  <div className="text-sm opacity-90">{t(descKey)}</div>
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
