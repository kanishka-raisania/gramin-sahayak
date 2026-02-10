import { useState } from "react";
import { fetchNews } from "@/data/api";
import NewsCard from "./NewsCard";
import { Newspaper } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

type CategoryFilter = "All" | "Farmer" | "Worker" | "General";

const BulletinBoard = () => {
  const news = fetchNews();
  const [filter, setFilter] = useState<CategoryFilter>("All");
  const { t } = useLanguage();

  const filters: { key: CategoryFilter; labelKey: string }[] = [
    { key: "All", labelKey: "filterAll" },
    { key: "Farmer", labelKey: "filterFarmer" },
    { key: "Worker", labelKey: "filterWorker" },
    { key: "General", labelKey: "filterGeneral" },
  ];

  const filtered = filter === "All" ? news : news.filter((n) => n.category === filter);

  return (
    <section className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <Newspaper className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-extrabold text-foreground">
          📋 {t("bulletinTitle")}
        </h2>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {filters.map(({ key, labelKey }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`rounded-full px-4 py-2 text-sm font-bold whitespace-nowrap transition-all ${
              filter === key
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {t(labelKey as any)}
          </button>
        ))}
      </div>

      {/* Grid layout: 2 cols on mobile, 3 on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {filtered.map((item, i) => (
          <NewsCard key={item.id} item={item} index={i} />
        ))}
      </div>
    </section>
  );
};

export default BulletinBoard;
