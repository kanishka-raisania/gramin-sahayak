/**
 * About — Mission, features grid, and coming soon section
 * No emojis — uses Lucide icons throughout
 */
import {
  Newspaper,
  Scale,
  ShieldAlert,
  Globe,
  MessageCircle,
  Heart,
  Mic,
  MapPin,
  UserCheck,
  BarChart3,
  FileUp,
  Smartphone,
  Target,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";
import GraminLogo from "@/components/GraminLogo";

const About = () => {
  const { t } = useLanguage();

  const features = [
    { icon: Newspaper, titleKey: "aboutVerifiedNews", descKey: "aboutVerifiedNewsDesc" },
    { icon: MessageCircle, titleKey: "aboutSmartChat", descKey: "aboutSmartChatDesc" },
    { icon: ShieldAlert, titleKey: "aboutFakeNews", descKey: "aboutFakeNewsDesc" },
    { icon: Globe, titleKey: "aboutRegionalLang", descKey: "aboutRegionalLangDesc" },
    { icon: Scale, titleKey: "aboutLegalHelp", descKey: "aboutLegalHelpDesc" },
  ];

  const comingSoon = [
    { icon: Mic, labelKey: "comingVoice" },
    { icon: MapPin, labelKey: "comingLocation" },
    { icon: UserCheck, labelKey: "comingWomen" },
    { icon: BarChart3, labelKey: "comingDashboard" },
    { icon: FileUp, labelKey: "comingDocUpload" },
    { icon: Smartphone, labelKey: "comingWhatsApp" },
  ];

  return (
    <div className="min-h-screen pb-24">
      {/* Hero section */}
      <div className="bg-gradient-to-br from-primary to-primary/80 px-4 py-12 text-center">
        <div className="container mx-auto flex flex-col items-center gap-4">
          <GraminLogo size={64} />
          <div>
            <h1 className="text-2xl font-extrabold text-primary-foreground">
              Gramin Sahayak
            </h1>
            <p className="text-base text-primary-foreground/80 mt-1">
              {t("aboutHeroTagline" as TranslationKey)}
            </p>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Mission */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2.5 mb-3">
            <Target className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold text-card-foreground">
              {t("aboutMission")}
            </h3>
          </div>
          <p className="text-base text-muted-foreground leading-relaxed">
            {t("aboutMissionText")}
          </p>
        </div>

        {/* What We Do — icon grid */}
        <div>
          <h3 className="text-lg font-bold text-foreground mb-4">{t("aboutFeatures")}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {features.map(({ icon: FeatureIcon, titleKey, descKey }, i) => (
              <div
                key={i}
                className="flex items-start gap-3.5 rounded-2xl border border-border bg-card p-4 shadow-sm animate-fade-in"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="shrink-0 rounded-full bg-primary/10 p-2.5">
                  <FeatureIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-card-foreground">{t(titleKey as TranslationKey)}</h4>
                  <p className="text-sm text-muted-foreground mt-0.5">{t(descKey as TranslationKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coming Soon — feature cards */}
        <div>
          <h3 className="text-lg font-bold text-foreground mb-4">{t("aboutComingSoon")}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {comingSoon.map(({ icon: SoonIcon, labelKey }, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-2 rounded-2xl bg-muted p-4 text-center animate-fade-in"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="rounded-full bg-card p-2.5 shadow-sm">
                  <SoonIcon className="h-5 w-5 text-muted-foreground" />
                </div>
                <span className="text-sm font-semibold text-foreground">{t(labelKey as TranslationKey)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Credits */}
        <div className="text-center text-sm text-muted-foreground pt-4">
          <p>{t("footer")}</p>
        </div>
      </main>
    </div>
  );
};

export default About;
