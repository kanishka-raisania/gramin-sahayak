/**
 * SchemeDetailModal — Full detail modal with eligibility checker, Ask AI, and Where to Go
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { NewsItem } from "@/data/api";
import { getCategoryFallbackImage } from "@/data/api";
import { useLanguage } from "@/i18n/LanguageContext";
import { useUserProfile } from "@/contexts/UserProfileContext";
import type { TranslationKey } from "@/i18n/translations";
import {
  CheckCircle2, User, FileText, ExternalLink, Calendar, Building2,
  Sprout, HardHat, Globe, ImageOff, ClipboardCheck, MessageCircle, MapPin,
} from "lucide-react";
import EligibilityChecker from "@/components/EligibilityChecker";
import WhereToGo from "@/components/WhereToGo";

const categoryConfig = {
  Farmer: { icon: Sprout, colorClass: "bg-farmer text-primary-foreground" },
  Worker: { icon: HardHat, colorClass: "bg-worker text-secondary-foreground" },
  General: { icon: Globe, colorClass: "bg-general text-accent-foreground" },
};

interface Props {
  item: NewsItem | null;
  open: boolean;
  onClose: () => void;
  isDynamic?: boolean;
}

const SchemeDetailModal = ({ item, open, onClose, isDynamic = false }: Props) => {
  const { t, language } = useLanguage();
  const { profile } = useUserProfile();
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const [showEligibility, setShowEligibility] = useState(false);

  if (!item) return null;

  // Helper: skip translation for dynamic (RSS) items — raw text already in the field
  const tx = (key: string) => isDynamic ? key : t(key as TranslationKey);

  const config = categoryConfig[item.category];
  const Icon = config.icon;
  const imageUrl = imgError ? getCategoryFallbackImage(item.category) : item.imageUrl;

  const formattedDate = new Date(item.publishedAt).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });

  const handleAskAI = () => {
    const location = profile?.state || "India";
    const role = profile?.role || "citizen";
    const prompt = `Explain the scheme "${t(item.titleKey as TranslationKey)}" for a ${role} in ${location} in simple language. What are the benefits and how to apply?`;
    // Store prompt for chatbot to pick up
    sessionStorage.setItem("gs-ai-prompt", prompt);
    onClose();
    navigate("/chat");
  };

  const renderSection = (
    titleKey: string, icon: React.ReactNode, keys: string[], bgClass: string
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
            <img src={imageUrl} alt={t(item.titleKey as TranslationKey)} className="w-full h-full object-cover" loading="lazy" onError={() => setImgError(true)} />
          )}
          <span className={`absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${config.colorClass} shadow-lg`}>
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
            <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formattedDate}</span>
            <span className="inline-flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{t(item.sourceKey as TranslationKey)}</span>
          </div>

          {/* Summary */}
          <div className="rounded-xl bg-primary/10 border border-primary/20 p-4">
            <p className="text-base font-medium text-foreground leading-relaxed">{t(item.simpleSummaryKey as TranslationKey)}</p>
          </div>

          {/* Action Buttons — Help Me Apply + Ask AI */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setShowEligibility(!showEligibility)}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary/10 border border-primary/30 py-3 text-sm font-bold text-primary hover:bg-primary/20 transition-colors active:scale-[0.98]"
            >
              <ClipboardCheck className="h-4 w-4" />
              {t("helpMeApply" as TranslationKey)}
            </button>
            <button
              onClick={handleAskAI}
              className="flex items-center justify-center gap-2 rounded-xl bg-accent/10 border border-accent/30 py-3 text-sm font-bold text-accent hover:bg-accent/20 transition-colors active:scale-[0.98]"
            >
              <MessageCircle className="h-4 w-4" />
              {t("askAIAbout" as TranslationKey)}
            </button>
          </div>

          {/* Eligibility Checker */}
          {showEligibility && (
            <EligibilityChecker item={item} onClose={() => setShowEligibility(false)} />
          )}

          {/* Sections */}
          <div className="space-y-3">
            {renderSection("benefitsTitle", <CheckCircle2 className="h-5 w-5 text-primary" />, item.benefitsKeys, "bg-muted/50")}
            {renderSection("eligibilityTitle", <User className="h-5 w-5 text-accent" />, item.eligibilityKeys, "bg-accent/10")}
            {renderSection("howToApplyTitle", <FileText className="h-5 w-5 text-secondary" />, item.howToApplyKeys, "bg-secondary/10")}
          </div>

          {/* Where to Go */}
          <WhereToGo />

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
