import { Newspaper, Scale, ShieldAlert, Heart } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const About = () => {
  const { t } = useLanguage();

  const features = [
    { emoji: "📋", titleKey: "aboutVerifiedNews" as const, descKey: "aboutVerifiedNewsDesc" as const },
    { emoji: "⚖️", titleKey: "aboutLegalHelp" as const, descKey: "aboutLegalHelpDesc" as const },
    { emoji: "🛡", titleKey: "aboutFakeNews" as const, descKey: "aboutFakeNewsDesc" as const },
  ];

  return (
    <div className="min-h-screen pb-24">
      <div className="bg-primary px-4 py-3 text-primary-foreground">
        <div className="container mx-auto flex items-center gap-2">
          <Heart className="h-6 w-6" />
          <div>
            <h2 className="text-lg font-bold">ℹ️ {t("aboutTitle")}</h2>
            <p className="text-xs opacity-80">{t("aboutSubtitle")}</p>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero */}
        <div className="rounded-xl bg-primary/10 p-8 text-center">
          <span className="text-5xl">🌾</span>
          <h2 className="mt-3 text-2xl font-extrabold text-foreground">
            {t("aboutHeroName")}
          </h2>
          <p className="mt-1 text-base text-muted-foreground">
            {t("aboutHeroDesc")}
          </p>
        </div>

        {/* Mission */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-bold text-card-foreground mb-2">
            🎯 {t("aboutMission")}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t("aboutMissionText")}
          </p>
        </div>

        {/* Features */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-foreground">✨ {t("aboutFeatures")}</h3>
          {features.map(({ emoji, titleKey, descKey }, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-sm animate-fade-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <span className="text-2xl shrink-0">{emoji}</span>
              <div>
                <h4 className="font-bold text-card-foreground">{t(titleKey)}</h4>
                <p className="text-sm text-muted-foreground mt-0.5">{t(descKey)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Future roadmap */}
        <div className="rounded-xl bg-muted p-6">
          <h3 className="text-base font-bold text-foreground mb-2">
            🔮 {t("aboutComingSoon")}
          </h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>{t("aboutVoice")}</li>
            <li>{t("aboutAI")}</li>
            <li>{t("aboutML")}</li>
            <li>{t("aboutMultiLang")}</li>
          </ul>
        </div>

        {/* Credits */}
        <div className="text-center text-sm text-muted-foreground">
          <p>{t("footer")}</p>
        </div>
      </main>
    </div>
  );
};

export default About;
