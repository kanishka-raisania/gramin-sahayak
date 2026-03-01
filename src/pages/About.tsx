/**
 * About — Mission, features grid, trust indicators, and coming soon
 * Enhanced with hero banner, rural imagery, and trust section
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
  Shield,
  Building,
  ShieldCheck,
  Accessibility,
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

  const trustIndicators = [
    { icon: Shield, titleKey: "trustSecure", descKey: "trustSecureDesc" },
    { icon: Building, titleKey: "trustGovSources", descKey: "trustGovSourcesDesc" },
    { icon: ShieldCheck, titleKey: "trustAiVerified", descKey: "trustAiVerifiedDesc" },
    { icon: Accessibility, titleKey: "trustAccessible", descKey: "trustAccessibleDesc" },
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
      {/* Hero banner with background image */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&h=600&fit=crop')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/85 to-primary/70" />
        <div className="relative px-4 py-16 text-center">
          <div className="container mx-auto flex flex-col items-center gap-4">
            <GraminLogo size={72} />
            <div>
              <h1 className="text-3xl font-extrabold text-primary-foreground">
                Gramin Sahayak
              </h1>
              <p className="text-lg text-primary-foreground/85 mt-2 max-w-md mx-auto">
                {t("aboutHeroTagline" as TranslationKey)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 space-y-10">
        {/* Mission — two column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
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
          <div className="rounded-2xl overflow-hidden shadow-sm border border-border hidden md:block">
            <img
              src="https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&h=400&fit=crop"
              alt="Farmer using mobile phone"
              className="w-full h-[240px] object-cover"
              loading="lazy"
            />
          </div>
        </div>

        {/* What We Do — icon grid */}
        <div>
          <h3 className="text-lg font-bold text-foreground mb-4">{t("aboutFeatures")}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {features.map(({ icon: FeatureIcon, titleKey, descKey }, i) => (
              <div
                key={i}
                className="flex items-start gap-3.5 rounded-2xl border border-border bg-card p-4 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all animate-fade-in"
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

        {/* Trust Indicators */}
        <div>
          <h3 className="text-lg font-bold text-foreground mb-4">
            {t("trustTitle" as TranslationKey)}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {trustIndicators.map(({ icon: TrustIcon, titleKey, descKey }, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-2.5 rounded-2xl border border-border bg-card p-4 text-center shadow-sm hover:shadow-md transition-all animate-fade-in"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="rounded-full bg-primary/10 p-3">
                  <TrustIcon className="h-6 w-6 text-primary" />
                </div>
                <h4 className="text-sm font-bold text-card-foreground">{t(titleKey as TranslationKey)}</h4>
                <p className="text-xs text-muted-foreground">{t(descKey as TranslationKey)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Coming Soon */}
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
