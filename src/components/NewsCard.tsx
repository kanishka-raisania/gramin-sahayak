import { type NewsItem } from "@/data/api";
import { Sprout, HardHat, Globe, ImageOff } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";

const categoryConfig = {
  Farmer: { icon: Sprout, colorClass: "bg-farmer text-primary-foreground" },
  Worker: { icon: HardHat, colorClass: "bg-worker text-secondary-foreground" },
  General: { icon: Globe, colorClass: "bg-general text-accent-foreground" },
};

interface NewsCardProps {
  item: NewsItem;
  index: number;
}

const NewsCard = ({ item, index }: NewsCardProps) => {
  const config = categoryConfig[item.category];
  const [imgError, setImgError] = useState(false);
  const { t } = useLanguage();

  return (
    <div
      className="rounded-xl border border-border bg-card shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1 animate-fade-in overflow-hidden cursor-pointer"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Image with fallback */}
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        {imgError ? (
          <div className="flex items-center justify-center h-full">
            <ImageOff className="h-10 w-10 text-muted-foreground/50" />
          </div>
        ) : (
          <img
            src={item.imageUrl}
            alt={t(item.titleKey as TranslationKey)}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        )}
        {/* Category badge overlaid on image */}
        <span
          className={`absolute top-2 right-2 rounded-full px-2.5 py-0.5 text-xs font-bold ${config.colorClass} shadow-md`}
        >
          {item.category}
        </span>
      </div>

      {/* Text content */}
      <div className="p-3">
        <h3 className="text-base font-bold text-card-foreground leading-tight line-clamp-2">
          {t(item.titleKey as TranslationKey)}
        </h3>
        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {t(item.descKey as TranslationKey)}
        </p>
      </div>
    </div>
  );
};

export default NewsCard;
