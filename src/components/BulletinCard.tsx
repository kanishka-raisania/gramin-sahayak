/**
 * BulletinCard — Scannable card for government scheme updates
 * Supports both static (translation-keyed) and dynamic (raw text from RSS) items
 */
import { type NewsItem, getCategoryFallbackImage } from "@/data/api";
import { Sprout, HardHat, Globe, Building2, ArrowRight, Clock, Sparkles, Radio } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";
import LazyImage from "./LazyImage";

const categoryConfig = {
  Farmer: { icon: Sprout, colorClass: "bg-farmer text-primary-foreground" },
  Worker: { icon: HardHat, colorClass: "bg-worker text-secondary-foreground" },
  General: { icon: Globe, colorClass: "bg-general text-accent-foreground" },
};

interface BulletinCardProps {
  item: NewsItem;
  index: number;
  onClick: () => void;
  /** When true, title/desc/source are raw strings (RSS) — skip translation lookup. */
  isDynamic?: boolean;
}

const BulletinCard = ({ item, index, onClick, isDynamic = false }: BulletinCardProps) => {
  const config = categoryConfig[item.category];
  const Icon = config.icon;
  const { t } = useLanguage();

  const fallbackImg = getCategoryFallbackImage(item.category);

  // Resolve text — dynamic items already have raw strings stored in the *Key fields
  const title = isDynamic ? item.titleKey : t(item.titleKey as TranslationKey);
  const sourceText = isDynamic ? item.source : t(item.sourceKey as TranslationKey);
  const benefitText = item.benefitsKeys[0]
    ? (isDynamic ? item.benefitsKeys[0] : t(item.benefitsKeys[0] as TranslationKey))
    : "";

  // Determine badges based on publishedAt
  const daysSincePublished = Math.floor(
    (Date.now() - new Date(item.publishedAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  const isNew = daysSincePublished <= 7;
  const isExpiring = !isDynamic && daysSincePublished >= 20;

  return (
    <article
      onClick={onClick}
      className="group rounded-2xl border border-border bg-card shadow-sm hover:shadow-xl transition-all duration-200 hover:-translate-y-1 animate-fade-in overflow-hidden cursor-pointer focus-within:ring-2 focus-within:ring-primary"
      style={{ animationDelay: `${index * 60}ms` }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      aria-label={title}
    >
      {/* Image */}
      <div className="relative h-[120px] bg-muted overflow-hidden">
        <LazyImage
          src={item.imageUrl}
          fallbackSrc={fallbackImg || undefined}
          alt={title}
          className="group-hover:scale-105 transition-transform duration-300"
        />

        {/* Category badge */}
        <span
          className={`absolute top-2 right-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${config.colorClass} shadow-md`}
        >
          <Icon className="h-3 w-3" />
          {t((`filter${item.category}`) as TranslationKey)}
        </span>

        {/* Status badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isDynamic && (
            <span className="inline-flex items-center gap-1 rounded-full bg-destructive/90 px-2 py-0.5 text-[10px] font-bold text-destructive-foreground shadow-md">
              <Radio className="h-2.5 w-2.5 animate-pulse" />
              LIVE
            </span>
          )}
          {isNew && !isDynamic && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground shadow-md">
              <Sparkles className="h-2.5 w-2.5" />
              {t("badgeNew" as TranslationKey)}
            </span>
          )}
          {isExpiring && (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-secondary-foreground shadow-md">
              <Clock className="h-2.5 w-2.5" />
              {t("badgeExpiring" as TranslationKey)}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <h3 className="text-base font-bold text-card-foreground leading-tight line-clamp-2 min-h-[2.75rem]">
          {title}
        </h3>

        {/* One benefit line */}
        {benefitText && (
          <p className="text-sm text-primary font-medium line-clamp-1">
            {benefitText}
          </p>
        )}

        {/* Source */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Building2 className="h-3.5 w-3.5" />
          <span className="truncate">{sourceText}</span>
        </div>

        {/* Read More CTA */}
        <button className="flex items-center gap-1 text-sm font-bold text-primary group-hover:underline pt-1">
          {t("readMore" as TranslationKey)}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </article>
  );
};

export default BulletinCard;
