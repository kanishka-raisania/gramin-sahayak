/**
 * BulletinBoard — Government scheme feed with filters, pagination, and detail modal
 */
import { useState, useEffect } from "react";
import { fetchNewsPaginated } from "@/data/api";
import type { NewsItem } from "@/data/api";
import BulletinCard from "./BulletinCard";
import SchemeDetailModal from "./SchemeDetailModal";
import { BulletinSkeletonGrid } from "./BulletinSkeleton";
import { Newspaper, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";

type CategoryFilter = "All" | "Farmer" | "Worker" | "General";
const ITEMS_PER_PAGE = 9;

const BulletinBoard = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<CategoryFilter>("All");
  const [page, setPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<NewsItem | null>(null);
  const { t } = useLanguage();

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const loadPage = (p: number, cat: CategoryFilter) => {
    setLoading(true);
    // Simulate slight network feel
    setTimeout(() => {
      const result = fetchNewsPaginated(p, ITEMS_PER_PAGE, cat);
      setNews(result.items);
      setTotal(result.total);
      setLoading(false);
    }, 300);
  };

  useEffect(() => {
    loadPage(page, filter);
  }, [page, filter]);

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

  // Generate page numbers to display
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
          onClick={() => loadPage(page, filter)}
          className="p-2.5 rounded-full hover:bg-muted transition-colors"
          aria-label={t("refresh" as TranslationKey)}
        >
          <RefreshCw className="h-4 w-4 text-muted-foreground" />
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

      {/* Loading */}
      {loading && <BulletinSkeletonGrid />}

      {/* Empty */}
      {!loading && news.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Newspaper className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-base font-medium">{t("noUpdates" as TranslationKey)}</p>
        </div>
      )}

      {/* Grid */}
      {!loading && news.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {news.map((item, i) => (
            <BulletinCard
              key={item.id}
              item={item}
              index={i}
              onClick={() => setSelectedItem(item)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
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

      {/* Detail modal */}
      <SchemeDetailModal
        item={selectedItem}
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </section>
  );
};

export default BulletinBoard;
