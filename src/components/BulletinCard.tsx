/**
 * BulletinCard — Scannable card for government scheme updates
 * Shows title, one benefit line, source, and read more CTA
 * Supports "New" and "Expiring Soon" badges
 * Works with both legacy NewsItem and new BulletinItem shapes
 */
import type { BulletinItem } from "./BulletinBoard";
import { Sprout, HardHat, Globe, ImageOff, Building2, ArrowRight, Clock, Sparkles } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";

const categoryConfig = {
  Farmer: { icon: Sprout, colorClass: "bg-farmer text-primary-foreground" },
  Worker: { icon: HardHat, colorClass: "bg-worker text-secondary-foreground" },
  General: { icon: Globe, colorClass: "bg-general text-accent-foreground" },
};

const categoryFallbackImages: Record<string, string> = {
  Farmer: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&h=400&fit=crop",
  Worker: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop",
  General: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&h=400&fit=crop",
};

interface BulletinCardProps {
  item: BulletinItem;
  index: number;
  onClick: () => void;
}

const BulletinCard = ({ item, index, onClick }: BulletinCardProps) => {
  const config = categoryConfig[item.category] || categoryConfig.General;
  const Icon = config.icon;
  const [imgError, setImgError] = useState(false);
  const { t } = useLanguage();

  const imageUrl = imgError
    ? categoryFallbackImages[item.category]
    : (item.image_url || categoryFallbackImages[item.category]);

  // Determine badges based on publish_date
  const daysSincePublished = Math.floor(
    (Date.now() - new Date(item.publish_date).getTime()) / (1000 * 60 * 60 * 24)
  );
  const isNew = daysSincePublished <= 7;
  const isExpiring = item.is_expiring || daysSincePublished >= 45;

  // First line of description as benefit preview
  const benefitPreview = item.description.split(".")[0] + ".";

  return (
    <article
      onClick={onClick}
      className="group rounded-2xl border border-border bg-card shadow-sm hover:shadow-xl transition-all duration-200 hover:-translate-y-1 animate-fade-in overflow-hidden cursor-pointer focus-within:ring-2 focus-within:ring-primary"
      style={{ animationDelay: `${index * 60}ms` }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      aria-label={item.title}
    >
      {/* Image */}
      <div className="relative h-[120px] bg-muted overflow-hidden">
        {imgError && !categoryFallbackImages[item.category] ? (
          <div className="flex items-center justify-center h-full">
            <ImageOff className="h-8 w-8 text-muted-foreground/40" />
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        )}

        {/* Category badge */}
        <span
          className={`absolute top-2 right-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${config.colorClass} shadow-md`}
        >
          <Icon className="h-3 w-3" />
          {t((`filter${item.category}`) as TranslationKey)}
        </span>

        {/* Status badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isNew && (
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
          {item.title}
        </h3>

        {/* One benefit line */}
        <p className="text-sm text-primary font-medium line-clamp-1">
          {benefitPreview}
        </p>

        {/* Source */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Building2 className="h-3.5 w-3.5" />
          <span className="truncate">{item.source}</span>
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
