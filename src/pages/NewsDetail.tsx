import { useParams, useNavigate } from "react-router-dom";
import { getNewsById } from "@/services/newsService";
import { getCategoryFallbackImage } from "@/data/api";
import { useLanguage } from "@/i18n/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";
import {
  ArrowLeft,
  CheckCircle2,
  User,
  FileText,
  ArrowRight,
  ExternalLink,
  Calendar,
  Building2,
  ImageOff,
  Sprout,
  HardHat,
  Globe,
} from "lucide-react";
import { useState } from "react";

const categoryConfig = {
  Farmer: { icon: Sprout, colorClass: "bg-farmer text-primary-foreground" },
  Worker: { icon: HardHat, colorClass: "bg-worker text-secondary-foreground" },
  General: { icon: Globe, colorClass: "bg-general text-accent-foreground" },
};

const NewsDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [imgError, setImgError] = useState(false);

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

  const formattedDate = new Date(item.publishedAt).toLocaleDateString("en-IN", {
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

        {/* Bullet sections */}
        <div className="space-y-3 mb-6">
          {renderSection(
            "benefitsTitle",
            <CheckCircle2 className="h-5 w-5 text-primary" />,
            item.benefitsKeys,
            "bg-muted/50"
          )}
          {renderSection(
            "eligibilityTitle",
            <User className="h-5 w-5 text-accent" />,
            item.eligibilityKeys,
            "bg-accent/10"
          )}
          {renderSection(
            "howToApplyTitle",
            <FileText className="h-5 w-5 text-secondary" />,
            item.howToApplyKeys,
            "bg-secondary/10"
          )}
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
