/**
 * BulletinBoard — Government scheme feed with filters, pagination, and detail modal
 * Now backed by live data from bulletin_items DB table + RSS feeds with translation support
 */
import { useState, useEffect, useRef } from "react";
import type { NewsItem } from "@/data/api";
import BulletinCard from "./BulletinCard";
import SchemeDetailModal from "./SchemeDetailModal";
import { BulletinSkeletonGrid } from "./BulletinSkeleton";
import { Newspaper, RefreshCw, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useUserProfile } from "@/contexts/UserProfileContext";
import type { TranslationKey } from "@/i18n/translations";
import { getBulletinPage, triggerRssRefresh, requestTranslations, type BulletinItem } from "@/services/bulletinService";

type CategoryFilter = "All" | "Farmer" | "Worker" | "General";
const ITEMS_PER_PAGE = 9;

/**
 * Each topic has a POOL of 4-5 images.
 * The item's unique ID is hashed to pick one — so two articles on the same
 * topic always get DIFFERENT photos. Includes Hindi keywords for translated titles.
 */
const TOPIC_POOLS: { keywords: string[]; urls: string[] }[] = [
  {
    keywords: ["livestock", "cattle", "cow", "buffalo", "dairy", "milk", "poultry", "sheep", "goat", "pig",
               "animal husbandry", "vaccination", "vaccine", "pashu", "पशु", "गाय", "भैंस", "टीकाकरण", "डेयरी"],
    urls: [
      "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1560493676-04071185765e?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1444858291040-58f756a3bdd6?w=600&h=400&fit=crop",
    ],
  },
  {
    keywords: ["paddy", "rice", "wheat", "crop", "harvest", "kharif", "rabi", "msp", "minimum support",
               "grain", "cereal", "sugarcane", "fasal", "फसल", "खरीफ", "रबी", "गेहूं", "धान", "चावल", "गन्ना"],
    urls: [
      "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1440342359743-84fcb8c21f21?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop",
    ],
  },
  {
    keywords: ["fertilizer", "fertiliser", "soil", "nutrient", "urea", "organic", "compost",
               "उर्वरक", "मिट्टी", "खाद", "जैविक"],
    urls: [
      "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&h=400&fit=crop",
    ],
  },
  {
    keywords: ["irrigation", "water", "dam", "canal", "flood", "drought", "jal", "river",
               "सिंचाई", "जल", "बाढ़", "नदी", "नहर", "सूखा", "बांध"],
    urls: [
      "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=600&h=400&fit=crop",
    ],
  },
  {
    keywords: ["fishery", "fish", "aquaculture", "seafood", "fishermen", "matsya", "prawn", "shrimp",
               "मछली", "मत्स्य", "झींगा", "मछुआरे", "चारा"],
    urls: [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1504472478235-9bc48ba4d60f?w=600&h=400&fit=crop",
    ],
  },
  {
    keywords: ["tractor", "machinery", "equipment", "mechanization", "drone",
               "ट्रैक्टर", "मशीन", "यंत्र"],
    urls: [
      "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1536657464919-892534f60d6e?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1595855759920-86582396756a?w=600&h=400&fit=crop",
    ],
  },
  {
    keywords: ["mgnrega", "nrega", "wage", "labour", "labor", "employment", "job card", "mazdoor", "rozgar",
               "मजदूरी", "रोजगार", "मजदूर", "श्रमिक", "नरेगा", "मनरेगा"],
    urls: [
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1590650153855-d9e808231d41?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop",
    ],
  },
  {
    keywords: ["skill", "training", "vocational", "apprentice", "pmkvy", "kaushal",
               "कौशल", "प्रशिक्षण", "रोजगार प्रशिक्षण"],
    urls: [
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop",
    ],
  },
  {
    keywords: ["health", "hospital", "medical", "ayushman", "pmjay", "doctor", "medicine", "healthcare", "nursing",
               "स्वास्थ्य", "अस्पताल", "डॉक्टर", "आयुष्मान", "दवा", "चिकित्सा"],
    urls: [
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=400&fit=crop",
    ],
  },
  {
    keywords: ["housing", "home", "house", "awas", "pmay", "shelter", "construction", "building",
               "आवास", "मकान", "घर", "निर्माण", "इमारत"],
    urls: [
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1582407947304-fd86f28f9e91?w=600&h=400&fit=crop",
    ],
  },
  {
    keywords: ["education", "school", "scholarship", "student", "study", "college", "learning",
               "शिक्षा", "विद्यालय", "छात्र", "पढ़ाई", "स्कूल", "छात्रवृत्ति"],
    urls: [
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop",
    ],
  },
  {
    keywords: ["loan", "credit", "bank", "finance", "mudra", "kcc", "kisan credit", "subsidy", "insurance",
               "ऋण", "क्रेडिट", "बैंक", "वित्त", "बीमा", "सब्सिडी", "फसल बीमा"],
    urls: [
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&h=400&fit=crop",
    ],
  },
  {
    keywords: ["ration", "food", "pds", "nutrition", "mid day meal", "anganwadi",
               "राशन", "खाद्य", "अनाज", "पोषण", "मध्याह्न भोजन"],
    urls: [
      "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&h=400&fit=crop",
    ],
  },
  {
    keywords: ["women", "mahila", "self help group", "shg", "ujjwala", "sakhi",
               "महिला", "स्वयं सहायता समूह", "नारी", "उज्ज्वला"],
    urls: [
      "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=600&h=400&fit=crop",
    ],
  },
  {
    keywords: ["solar", "energy", "electricity", "power", "renewable", "kusum", "bijli",
               "सौर", "बिजली", "ऊर्जा", "नवीकरणीय"],
    urls: [
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1548337138-e87d889cc369?w=600&h=400&fit=crop",
    ],
  },
  {
    keywords: ["road", "highway", "infrastructure", "pmgsy", "bridge", "transport",
               "सड़क", "राजमार्ग", "पुल", "यातायात", "परिवहन"],
    urls: [
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1518623489648-a173ef7824f3?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=600&h=400&fit=crop",
    ],
  },
  {
    keywords: ["land", "property", "revenue", "court", "legal", "order", "challenge", "stadium", "college",
               "जमीन", "संपत्ति", "कोर्ट", "कानूनी", "आदेश", "भूमि", "भूमि आवंटन"],
    urls: [
      "https://images.unsplash.com/photo-1423592707957-3b212afa6733?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1575517111839-3a3843ee7f5d?w=600&h=400&fit=crop",
    ],
  },
  {
    keywords: ["election", "politics", "candidate", "party", "minister", "cm", "government",
               "चुनाव", "राजनीति", "उम्मीदवार", "मुख्यमंत्री", "सरकार", "मंत्री"],
    urls: [
      "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1519452575417-564c1401ecc0?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1494172961521-33799ddd43a5?w=600&h=400&fit=crop",
    ],
  },
];

/** Per-category fallback pools used when no topic keyword matches. */
const CATEGORY_POOLS: Record<string, string[]> = {
  Farmer: [
    "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1592982537447-6f2a6a0c7c10?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1491900177661-4e1cd2d7cce2?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1560493676-04071185765e?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=600&h=400&fit=crop",
  ],
  Worker: [
    "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1513828583688-c52646db42da?w=600&h=400&fit=crop",
  ],
  General: [
    "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1577495508326-19a1b3cf65b7?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&h=400&fit=crop",
  ],
};

/** Deterministic hash of a string → non-negative integer. */
function strHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/**
 * Pick a relevant, unique image for a DB bulletin item.
 * - Scans title for topic keywords (English + Hindi).
 * - When a topic matches, uses the item's unique ID to select from that
 *   topic's image pool — so two articles on the same topic get DIFFERENT photos.
 * - Falls back to a per-category pool if no topic keyword matches.
 */
function getRelevantImage(title: string, category: string, itemId: string | number): string {
  const lower = title.toLowerCase();
  const seed = String(itemId);
  for (const { keywords, urls } of TOPIC_POOLS) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return urls[strHash(seed) % urls.length];
    }
  }
  const pool = CATEGORY_POOLS[category] || CATEGORY_POOLS.General;
  return pool[strHash(seed) % pool.length];
}

function toNewsItem(b: BulletinItem): NewsItem {
  if (b.staticItem) return b.staticItem;
  const title = b.translatedTitle || b.title;
  return {
    id: typeof b.id === "string" ? Math.abs(b.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) : b.id,
    titleKey: title,
    descKey: b.translatedDescription || b.description,
    simpleSummaryKey: b.translatedDescription || b.description,
    category: b.category,
    imageUrl: getRelevantImage(title, b.category, b.id),
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
  const { t, language } = useLanguage();
  const { profile } = useUserProfile();
  const latestRequestRef = useRef(0);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const loadPage = async (p: number, cat: CategoryFilter, showSpinner = true) => {
    const requestId = ++latestRequestRef.current;
    if (showSpinner) setLoading(true);
    const result = await getBulletinPage(p, ITEMS_PER_PAGE, cat, profile?.role, language, profile?.state ?? undefined);
    if (requestId !== latestRequestRef.current) return;

    setItems(result.items);
    setTotal(result.total);
    setLoading(false);

    // Request translations for ALL DB items (RSS + seed) that don't have them yet
    if (language !== "en") {
      const untranslated = result.items.filter(
        (i) => !i.staticItem && !i.translatedTitle && typeof i.id === "string"
      );
      if (untranslated.length > 0) {
        const translations = await requestTranslations(
          untranslated.map((i) => ({ id: i.id as string, title: i.title, description: i.description })),
          language
        );

        if (requestId !== latestRequestRef.current || translations.size === 0) return;

        setItems((prev) =>
          prev.map((item) => {
            if (item.staticItem || typeof item.id !== "string") return item;
            const tr = translations.get(item.id);
            return tr
              ? { ...item, translatedTitle: tr.title, translatedDescription: tr.description }
              : item;
          })
        );
      }
    }
  };

  useEffect(() => {
    loadPage(page, filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filter, language, profile?.state]);

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
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <Newspaper className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-extrabold text-foreground">
              {t("bulletinTitle")}
            </h2>
          </div>
          {profile?.state && (
            <div className="flex items-center gap-1.5 ml-0.5">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                {profile.state}
              </span>
            </div>
          )}
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
              isDynamic={!b.staticItem}
              isLiveFeed={b.isDynamic && !b.staticItem}
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
        isDynamic={!!selected && !selected.staticItem}
      />
    </section>
  );
};

export default BulletinBoard;
