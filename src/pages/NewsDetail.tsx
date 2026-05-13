import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getNewsById } from "@/services/newsService";
import { getCategoryFallbackImage } from "@/data/api";
import { useLanguage } from "@/i18n/LanguageContext";
import { useUserProfile } from "@/contexts/UserProfileContext";
import type { TranslationKey } from "@/i18n/translations";
import {
  ArrowLeft, CheckCircle2, User, FileText, ExternalLink,
  Calendar, Building2, ImageOff, Sprout, HardHat, Globe,
  ClipboardCheck, MessageCircle,
} from "lucide-react";
import EligibilityChecker from "@/components/EligibilityChecker";
import WhereToGo from "@/components/WhereToGo";

const categoryConfig = {
  Farmer: { icon: Sprout, colorClass: "bg-farmer text-primary-foreground" },
  Worker: { icon: HardHat, colorClass: "bg-worker text-secondary-foreground" },
  General: { icon: Globe, colorClass: "bg-general text-accent-foreground" },
};

const NewsDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { profile } = useUserProfile();
  const [imgError, setImgError] = useState(false);
  const [showEligibility, setShowEligibility] = useState(false);
  const item = getNewsById(Number(id));

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <p className="text-lg text-muted-foreground mb-4">{t("newsNotFound" as TranslationKey)}</p>
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold text-base"
        >
          <ArrowLeft className="h-5 w-5" />
          {t("backToHome" as TranslationKey)}
        </button>
      </div>
    );
  }

  const config = categoryConfig[item.category];
  const Icon = config.icon;
  const imageUrl = imgError ? getCategoryFallbackImage(item.category) : item.imageUrl;

  const formattedDate = new Date(item.publishedAt).toLocaleDateString(`${language}-IN`, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Section renderer for benefits/eligibility/howToApply
  const renderSection = (
    titleKey: string,
    icon: React.ReactNode,
    keys: string[],
    bgClass: string
  ) => {
    if (!keys.length) return null;
    return (
      <div className={`rounded-xl p-4 ${bgClass}`}>
        <h3 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
          {icon}
          {t(titleKey as TranslationKey)}
        </h3>
        <ul className="space-y-2">
          {keys.map((key, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-card-foreground leading-relaxed">
              <span className="mt-0.5 shrink-0">•</span>
              <span>{t(key as TranslationKey)}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-24">
      <main className="container mx-auto max-w-2xl px-4 py-4">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-primary font-bold text-sm mb-4 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backToHome" as TranslationKey)}
        </button>

        {/* Hero image */}
        <div className="relative rounded-xl overflow-hidden h-[200px] md:h-[280px] bg-muted mb-4">
          {imgError && !getCategoryFallbackImage(item.category) ? (
            <div className="flex items-center justify-center h-full">
              <ImageOff className="h-12 w-12 text-muted-foreground/40" />
            </div>
          ) : (
            <img
              src={imageUrl}
              alt={t(item.titleKey as TranslationKey)}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          )}
          <span
            className={`absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${config.colorClass} shadow-lg`}
          >
            <Icon className="h-3.5 w-3.5" />
            {t((`filter${item.category}`) as TranslationKey)}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-xl md:text-2xl font-extrabold text-foreground leading-tight mb-2">
          {t(item.titleKey as TranslationKey)}
        </h1>

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {formattedDate}
          </span>
          <span className="inline-flex items-center gap-1">
            <Building2 className="h-3.5 w-3.5" />
            {t(item.sourceKey as TranslationKey)}
          </span>
        </div>

        {/* Simple summary — "Why this matters to you" */}
        <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 mb-4">
          <h3 className="text-sm font-bold text-primary mb-1">
            {t("whyThisMatters" as TranslationKey)}
          </h3>
          <p className="text-base font-medium text-foreground leading-relaxed">
            {t(item.simpleSummaryKey as TranslationKey)}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            onClick={() => setShowEligibility(!showEligibility)}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary/10 border border-primary/30 py-3 text-sm font-bold text-primary hover:bg-primary/20 transition-colors active:scale-[0.98]"
          >
            <ClipboardCheck className="h-4 w-4" />
            {t("helpMeApply" as TranslationKey)}
          </button>
          <button
            onClick={() => {
              const location = profile?.state || "India";
              const role = profile?.role || "citizen";
              const prompt = `Explain the scheme "${t(item.titleKey as TranslationKey)}" for a ${role} in ${location} in simple language.`;
              sessionStorage.setItem("gs-ai-prompt", prompt);
              navigate("/chat");
            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-accent/10 border border-accent/30 py-3 text-sm font-bold text-accent hover:bg-accent/20 transition-colors active:scale-[0.98]"
          >
            <MessageCircle className="h-4 w-4" />
            {t("askAIAbout" as TranslationKey)}
          </button>
        </div>

        {/* Eligibility Checker */}
        {showEligibility && (
          <div className="mb-4">
            <EligibilityChecker item={item} onClose={() => setShowEligibility(false)} />
          </div>
        )}

        {/* Bullet sections */}
        <div className="space-y-3 mb-4">
          {renderSection("benefitsTitle", <CheckCircle2 className="h-5 w-5 text-primary" />, item.benefitsKeys, "bg-muted/50")}
          {renderSection("eligibilityTitle", <User className="h-5 w-5 text-accent" />, item.eligibilityKeys, "bg-accent/10")}
          {renderSection("howToApplyTitle", <FileText className="h-5 w-5 text-secondary" />, item.howToApplyKeys, "bg-secondary/10")}
        </div>

        {/* Where to Go */}
        <div className="mb-6">
          <WhereToGo />
        </div>

        {/* Official link */}
        <a
          href={item.officialLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-base shadow-md hover:bg-primary/90 transition-colors mb-3"
        >
          <ExternalLink className="h-5 w-5" />
          {t("openGovPage" as TranslationKey)}
        </a>

        {/* Back button bottom */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center justify-center gap-2 w-full bg-muted text-muted-foreground py-3 rounded-xl font-bold text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backToHome" as TranslationKey)}
        </button>
      </main>
    </div>
  );
};

export default NewsDetail;
