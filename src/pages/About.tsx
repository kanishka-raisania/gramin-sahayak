/**
 * About — Professional page with hero, mission, features, trust, and coming soon
 * Uses Lucide icons throughout — no emojis
 */
import {
  Newspaper,
  Scale,
  ShieldAlert,
  ShieldCheck,
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
  Lock,
  Building2,
  Cpu,
  Users,
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

  const trustItems = [
    { icon: Lock, titleKey: "aboutTrustSecure", descKey: "aboutTrustSecureDesc" },
    { icon: Building2, titleKey: "aboutTrustGovSource", descKey: "aboutTrustGovSourceDesc" },
    { icon: Cpu, titleKey: "aboutTrustAI", descKey: "aboutTrustAIDesc" },
    { icon: Users, titleKey: "aboutTrustAccessible", descKey: "aboutTrustAccessibleDesc" },
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
      {/* Hero section with overlay */}
      <div className="relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&h=400&fit=crop"
          alt="Rural India"
          className="w-full h-[220px] md:h-[280px] object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/70 to-primary/90 flex flex-col items-center justify-center text-center px-4">
          <GraminLogo size={56} />
          <h1 className="text-2xl md:text-3xl font-extrabold text-primary-foreground mt-3">
            Gramin Sahayak
          </h1>
          <p className="text-base text-primary-foreground/90 mt-1 max-w-md">
            {t("aboutHeroTagline" as TranslationKey)}
          </p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 space-y-10">
        {/* Mission — 2 column */}
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-6 flex flex-col justify-center">
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
            <div className="hidden md:block">
              <img
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop"
                alt="Rural digital access"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* What We Do — icon grid */}
        <div>
          <h3 className="text-lg font-bold text-foreground mb-4">{t("aboutFeatures")}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {features.map(({ icon: FeatureIcon, titleKey, descKey }, i) => (
              <div
                key={i}
                className="flex items-start gap-3.5 rounded-2xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow animate-fade-in"
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

        {/* Trust Section */}
        <div>
          <h3 className="text-lg font-bold text-foreground mb-4">{t("aboutTrustTitle" as TranslationKey)}</h3>
          <div className="grid grid-cols-2 gap-3">
            {trustItems.map(({ icon: TrustIcon, titleKey, descKey }, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-center animate-fade-in"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="rounded-full bg-primary/10 p-2.5">
                  <TrustIcon className="h-5 w-5 text-primary" />
                </div>
                <h4 className="text-sm font-bold text-foreground">{t(titleKey as TranslationKey)}</h4>
                <p className="text-xs text-muted-foreground leading-snug">{t(descKey as TranslationKey)}</p>
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
