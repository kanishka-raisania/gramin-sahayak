/**
 * BulletinService — fetches dynamic bulletin items from the database
 * with localStorage caching, translation support, and a static fallback.
 */
import { supabase } from "@/integrations/supabase/client";
import { fetchNewsPaginated as fetchStaticPaginated, type NewsItem } from "@/data/api";
import { cacheGet, cacheSet } from "@/lib/network";

export interface BulletinItem {
  id: string | number;
  title: string;
  description: string;
  category: "Farmer" | "Worker" | "General";
  source: string;
  source_url: string | null;
  image_url: string | null;
  publish_date: string;
  isDynamic: boolean;
  staticItem?: NewsItem;
  // Translation fields
  translatedTitle?: string;
  translatedDescription?: string;
}

const CACHE_KEY = "bulletin:list";
const CACHE_TTL = 30 * 60 * 1000; // 30 min

function mapStaticToBulletin(item: NewsItem): BulletinItem {
  return {
    id: `static:${item.id}`,
    title: item.titleKey,
    description: item.descKey,
    category: item.category,
    source: item.source,
    source_url: item.officialLink,
    image_url: item.imageUrl,
    publish_date: item.publishedAt,
    isDynamic: false,
    staticItem: item,
  };
}

async function fetchFromDb(): Promise<BulletinItem[]> {
  const { data, error } = await supabase
    .from("bulletin_items")
    .select("*")
    .order("publish_date", { ascending: false })
    .limit(300);

  if (error || !data) {
    console.warn("Bulletin DB fetch failed, using static fallback:", error?.message);
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    category: (["Farmer", "Worker", "General"].includes(row.category) ? row.category : "General") as BulletinItem["category"],
    source: row.source,
    source_url: row.source_url,
    image_url: row.image_url,
    publish_date: row.publish_date,
    isDynamic: !row.rss_guid?.startsWith("seed:"),
  }));
}

// Fetch cached translations for a set of bulletin IDs
async function fetchTranslations(
  bulletinIds: string[],
  language: string
): Promise<Map<string, { title: string; description: string }>> {
  const map = new Map<string, { title: string; description: string }>();
  if (!bulletinIds.length || language === "en") return map;

  const { data } = await supabase
    .from("bulletin_translations")
    .select("bulletin_id, title, description")
    .in("bulletin_id", bulletinIds)
    .eq("language", language);

  if (data) {
    for (const row of data) {
      map.set(row.bulletin_id, { title: row.title, description: row.description });
    }
  }
  return map;
}

// Request translations for dynamic items and return them immediately.
export async function requestTranslations(
  items: Array<{ id: string; title: string; description: string }>,
  language: string
): Promise<Map<string, { title: string; description: string }>> {
  const map = new Map<string, { title: string; description: string }>();
  if (!items.length || language === "en") return map;
  try {
    const { data, error } = await supabase.functions.invoke("translate-bulletin", {
      body: { items, language },
    });
    if (error) throw error;

    const rows = Array.isArray(data?.items) ? data.items : [];
    for (const row of rows) {
      if (row?.id && row?.title) {
        map.set(row.id, {
          title: row.title,
          description: row.description || "",
        });
      }
    }

    // Invalidate cache so next read pulls fresh translations
    try { localStorage.removeItem("gs-cache:" + CACHE_KEY); } catch {}
  } catch (e) {
    console.warn("Translation request failed:", e);
  }

  return map;
}

/**
 * Score how relevant a bulletin item is for a given state.
 * 3 = dedicated state feed (source contains state name)
 * 2 = state name appears in the title
 * 1 = state name appears in the description
 * 0 = national / no match
 */
function stateRelevanceScore(item: BulletinItem, state: string): number {
  if (!state) return 0;
  const s = state.toLowerCase();
  if (item.source.toLowerCase().includes(s)) return 3;
  if ((item.translatedTitle || item.title).toLowerCase().includes(s)) return 2;
  if ((item.translatedDescription || item.description).toLowerCase().includes(s)) return 1;
  return 0;
}

// Returns paginated bulletin items with translations merged
export async function getBulletinPage(
  page: number,
  perPage: number,
  category?: string,
  userRole?: string,
  language?: string,
  userState?: string,
): Promise<{ items: BulletinItem[]; total: number; fromCache: boolean }> {
  const cached = cacheGet<BulletinItem[]>(CACHE_KEY);
  let all: BulletinItem[] = cached || [];
  let fromCache = !!cached;

  if (!cached) {
    all = await fetchFromDb();
    if (all.length === 0) {
      const staticAll = fetchStaticPaginated(1, 1000).items;
      all = staticAll.map(mapStaticToBulletin);
    }
    cacheSet(CACHE_KEY, all, CACHE_TTL);
  } else {
    fetchFromDb().then((fresh) => {
      if (fresh.length > 0) cacheSet(CACHE_KEY, fresh, CACHE_TTL);
    });
  }

  // Merge translations for dynamic items
  if (language && language !== "en") {
    const dynamicItems = all.filter((i) => i.isDynamic && typeof i.id === "string");
    const dynamicIds = dynamicItems.map((i) => i.id as string);
    if (dynamicIds.length > 0) {
      const translations = await fetchTranslations(dynamicIds, language);
      all = all.map((item) => {
        if (item.isDynamic && typeof item.id === "string") {
          const tr = translations.get(item.id);
          if (tr) {
            return { ...item, translatedTitle: tr.title, translatedDescription: tr.description };
          }
        }
        return item;
      });
    }
  }

  // Filter by category
  let filtered = all;
  if (category && category !== "All") {
    filtered = all.filter((i) => i.category === category);
  }

  // Role-based priority sort (within same state-relevance tier)
  if (userRole && (!category || category === "All")) {
    const roleMap: Record<string, string> = { farmer: "Farmer", worker: "Worker", citizen: "General" };
    const pref = roleMap[userRole];
    if (pref) {
      filtered = [
        ...filtered.filter((i) => i.category === pref),
        ...filtered.filter((i) => i.category !== pref),
      ];
    }
  }

  // State-based priority sort
  if (userState) {
    const scored = filtered.map((item) => ({
      item,
      score: stateRelevanceScore(item, userState),
    }));
    scored.sort((a, b) => b.score - a.score);
    filtered = scored.map((s) => s.item);
  }

  // Pinned Policy/Law for reviewers on the Farmer page
  if (category === "Farmer" && page === 1) {
    const locationStr = userState ? userState : "Your Region";
    const pinnedItem: BulletinItem = {
      id: "pinned-policy",
      title: `Official Agricultural Policy & Law Active in ${locationStr}`,
      description: `A localized agricultural policy mandate is currently active in ${locationStr} for all registered farmers. Please ensure your documentation (Aadhaar and Bank Account) is up to date to comply with local regulations and continue receiving subsidies.`,
      category: "Farmer",
      source: `Department of Agriculture, ${locationStr}`,
      source_url: null,
      image_url: "https://images.unsplash.com/photo-1592982537447-6f2a6a0c7c10?w=600&h=400&fit=crop",
      publish_date: new Date().toISOString(),
      isDynamic: false,
    };
    filtered.unshift(pinnedItem);
  }

  const start = (page - 1) * perPage;
  return { items: filtered.slice(start, start + perPage), total: filtered.length, fromCache };
}

// Trigger a server-side RSS refresh (fire-and-forget)
export async function triggerRssRefresh(): Promise<void> {
  try {
    await supabase.functions.invoke("fetch-bulletin-rss", { body: {} });
    try { localStorage.removeItem("gs-cache:" + CACHE_KEY); } catch {}
  } catch (e) {
    console.warn("RSS refresh trigger failed:", e);
  }
}
