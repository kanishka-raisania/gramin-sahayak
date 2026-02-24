/**
 * SchemeDetailModal — Full detail modal for a government scheme
 * Shows image, benefits, eligibility, how to apply, and official link
 */
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { NewsItem } from "@/data/api";
import { getCategoryFallbackImage } from "@/data/api";
import { useLanguage } from "@/i18n/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";
import {
  CheckCircle2,
  User,
  FileText,
  ExternalLink,
  Calendar,
  Building2,
  Sprout,
  HardHat,
  Globe,
  ImageOff,
} from "lucide-react";
import { useState } from "react";

const categoryConfig = {
  Farmer: { icon: Sprout, colorClass: "bg-farmer text-primary-foreground" },
  Worker: { icon: HardHat, colorClass: "bg-worker text-secondary-foreground" },
  General: { icon: Globe, colorClass: "bg-general text-accent-foreground" },
};

interface Props {
  item: NewsItem | null;
  open: boolean;
  onClose: () => void;
}

const SchemeDetailModal = ({ item, open, onClose }: Props) => {
  const { t } = useLanguage();
  const [imgError, setImgError] = useState(false);

  if (!item) return null;

  const config = categoryConfig[item.category];
  const Icon = config.icon;
  const imageUrl = imgError ? getCategoryFallbackImage(item.category) : item.imageUrl;

  const formattedDate = new Date(item.publishedAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  /** Render a bullet section */
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
              <span className="mt-0.5 shrink-0 text-primary">•</span>
              <span>{t(key as TranslationKey)}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* Hero image */}
        <div className="relative h-[200px] bg-muted overflow-hidden rounded-t-lg">
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

        <div className="p-5 space-y-4">
          <DialogHeader className="space-y-1 p-0">
            <DialogTitle className="text-xl font-extrabold text-foreground leading-tight">
              {t(item.titleKey as TranslationKey)}
            </DialogTitle>
          </DialogHeader>

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formattedDate}
            </span>
            <span className="inline-flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" />
              {t(item.sourceKey as TranslationKey)}
            </span>
          </div>

          {/* Simple summary */}
          <div className="rounded-xl bg-primary/10 border border-primary/20 p-4">
            <p className="text-base font-medium text-foreground leading-relaxed">
              {t(item.simpleSummaryKey as TranslationKey)}
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-3">
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
            className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold text-base shadow-md hover:bg-primary/90 transition-colors"
          >
            <ExternalLink className="h-5 w-5" />
            {t("openGovPage" as TranslationKey)}
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SchemeDetailModal;
