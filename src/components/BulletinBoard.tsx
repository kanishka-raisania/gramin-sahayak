/**
 * BulletinBoard — Government scheme feed with filters, pagination, and detail modal
 * Now backed by live data from bulletin_items DB table + RSS feeds
 */
import { useState, useEffect } from "react";
import type { NewsItem } from "@/data/api";
import BulletinCard from "./BulletinCard";
import SchemeDetailModal from "./SchemeDetailModal";
import { BulletinSkeletonGrid } from "./BulletinSkeleton";
import { Newspaper, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useUserProfile } from "@/contexts/UserProfileContext";
import type { TranslationKey } from "@/i18n/translations";
import { getBulletinPage, triggerRssRefresh, type BulletinItem } from "@/services/bulletinService";

type CategoryFilter = "All" | "Farmer" | "Worker" | "General";
const ITEMS_PER_PAGE = 9;

// Adapt a BulletinItem (DB) to the NewsItem shape consumed by Card/Modal.
// For dynamic items, the *Key fields hold raw text (the card/modal honor isDynamic).
function toNewsItem(b: BulletinItem): NewsItem {
  if (b.staticItem) return b.staticItem;
  return {
    id: typeof b.id === "string" ? Math.abs(b.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) : b.id,
    titleKey: b.title,
    descKey: b.description,
    simpleSummaryKey: b.description,
    category: b.category,
    imageUrl: b.image_url || "",
    publishedAt: b.publish_date,
    source: b.source,
    sourceKey: b.source,
    benefitsKeys: [],
    eligibilityKeys: [],
    howToApplyKeys: [],
    officialLink: b.source_url || "#",
  };
}

const BulletinBoard = () => {
  const [items, setItems] = useState<BulletinItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<CategoryFilter>("All");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<BulletinItem | null>(null);
  const { t } = useLanguage();
  const { profile } = useUserProfile();

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const loadPage = async (p: number, cat: CategoryFilter, showSpinner = true) => {
    if (showSpinner) setLoading(true);
    const result = await getBulletinPage(p, ITEMS_PER_PAGE, cat, profile?.role);
    setItems(result.items);
    setTotal(result.total);
    setLoading(false);
  };

  useEffect(() => {
    loadPage(page, filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await triggerRssRefresh();
    await loadPage(page, filter, false);
    setRefreshing(false);
  };

  const handleFilterChange = (newFilter: CategoryFilter) => {
    setFilter(newFilter);
    setPage(1);
  };

  const filters: { key: CategoryFilter; labelKey: string }[] = [
    { key: "All", labelKey: "filterAll" },
    { key: "Farmer", labelKey: "filterFarmer" },
    { key: "Worker", labelKey: "filterWorker" },
    { key: "General", labelKey: "filterGeneral" },
  ];

  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <section className="w-full">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <Newspaper className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-extrabold text-foreground">
            {t("bulletinTitle")}
          </h2>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2.5 rounded-full hover:bg-muted transition-colors disabled:opacity-50"
          aria-label={t("refresh" as TranslationKey)}
        >
          <RefreshCw className={`h-4 w-4 text-muted-foreground ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {filters.map(({ key, labelKey }) => (
          <button
            key={key}
            onClick={() => handleFilterChange(key)}
            className={`rounded-full px-5 py-2.5 text-sm font-bold whitespace-nowrap transition-all ${
              filter === key
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {t(labelKey as TranslationKey)}
          </button>
        ))}
      </div>

      {loading && <BulletinSkeletonGrid />}

      {!loading && items.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Newspaper className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-base font-medium">{t("noUpdates" as TranslationKey)}</p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {items.map((b, i) => (
            <BulletinCard
              key={String(b.id)}
              item={toNewsItem(b)}
              index={i}
              isDynamic={b.isDynamic && !b.staticItem}
              onClick={() => setSelected(b)}
            />
          ))}
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 rounded-full px-4 py-2.5 text-sm font-bold bg-muted text-muted-foreground hover:bg-muted/80 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            {t("previousPage" as TranslationKey)}
          </button>

          {getPageNumbers().map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`rounded-full w-10 h-10 text-sm font-bold transition-all ${
                p === page
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-1 rounded-full px-4 py-2.5 text-sm font-bold bg-muted text-muted-foreground hover:bg-muted/80 disabled:opacity-40 transition-colors"
          >
            {t("nextPage" as TranslationKey)}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      <SchemeDetailModal
        item={selected ? toNewsItem(selected) : null}
        open={!!selected}
        onClose={() => setSelected(null)}
        isDynamic={!!selected && selected.isDynamic && !selected.staticItem}
      />
    </section>
  );
};

export default BulletinBoard;
