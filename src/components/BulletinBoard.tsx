/**
 * BulletinBoard — Government scheme feed with server-side pagination
 * Fetches from get-bulletins edge function, supports category filters
 */
import { useState, useEffect, useCallback } from "react";
import { Newspaper, RefreshCw } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";
import BulletinCard from "./BulletinCard";
import SchemeDetailModal from "./SchemeDetailModal";
import { BulletinSkeletonGrid } from "./BulletinSkeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

/** Shape returned from the get-bulletins edge function */
export interface BulletinItem {
  id: string;
  title: string;
  description: string;
  category: "Farmer" | "Worker" | "General";
  source: string;
  image_url: string | null;
  publish_date: string;
  source_url: string | null;
  is_expiring: boolean;
  rss_guid: string | null;
  created_at: string;
  last_fetched_at: string | null;
}

type CategoryFilter = "All" | "Farmer" | "Worker" | "General";

const PER_PAGE = 9;

const BulletinBoard = () => {
  const [items, setItems] = useState<BulletinItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<CategoryFilter>("All");
  const [selectedItem, setSelectedItem] = useState<BulletinItem | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { t } = useLanguage();

  const fetchBulletins = useCallback(async (p: number, cat: CategoryFilter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(p),
        per_page: String(PER_PAGE),
      });
      if (cat !== "All") params.set("category", cat);

      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-bulletins?${params}`;
      const resp = await fetch(url, {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
      });

      if (!resp.ok) throw new Error("Failed to fetch bulletins");
      const data = await resp.json();
      setItems(data.items || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Bulletin fetch error:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Trigger seed on first load
  useEffect(() => {
    const seedUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-bulletins`;
    fetch(seedUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    }).catch(() => {});
  }, []);

  useEffect(() => {
    fetchBulletins(page, filter);
  }, [page, filter, fetchBulletins]);

  const handleFilterChange = (cat: CategoryFilter) => {
    setFilter(cat);
    setPage(1);
  };

  const filters: { key: CategoryFilter; labelKey: string }[] = [
    { key: "All", labelKey: "filterAll" },
    { key: "Farmer", labelKey: "filterFarmer" },
    { key: "Worker", labelKey: "filterWorker" },
    { key: "General", labelKey: "filterGeneral" },
  ];

  /** Generate page numbers to display */
  const getPageNumbers = (): number[] => {
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
          onClick={() => fetchBulletins(page, filter)}
          className="p-2.5 rounded-full hover:bg-muted transition-colors"
          aria-label={t("refresh" as TranslationKey)}
        >
          <RefreshCw className={`h-4 w-4 text-muted-foreground ${loading ? "animate-spin" : ""}`} />
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
      {!loading && items.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Newspaper className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-base font-medium">{t("noUpdates" as TranslationKey)}</p>
        </div>
      )}

      {/* Grid */}
      {!loading && items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {items.map((item, i) => (
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
        <div className="mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              {getPageNumbers().map((p) => (
                <PaginationItem key={p}>
                  <PaginationLink
                    isActive={p === page}
                    onClick={() => setPage(p)}
                    className="cursor-pointer"
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className={page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
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
