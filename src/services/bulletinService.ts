/**
 * BulletinService — fetches dynamic bulletin items from the database
 * with localStorage caching and a static fallback for offline/empty states.
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
  // Compatibility fields so existing UI keeps working
  isDynamic: boolean;
  staticItem?: NewsItem;
}

const CACHE_KEY = "bulletin:list";
const CACHE_TTL = 30 * 60 * 1000; // 30 min

function mapStaticToBulletin(item: NewsItem): BulletinItem {
  return {
    id: `static:${item.id}`,
    title: item.titleKey, // resolved via t() in card
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

// Returns paginated bulletin items: tries DB, then falls back to static.
export async function getBulletinPage(
  page: number,
  perPage: number,
  category?: string,
  userRole?: string,
): Promise<{ items: BulletinItem[]; total: number; fromCache: boolean }> {
  // Serve from cache instantly
  const cached = cacheGet<BulletinItem[]>(CACHE_KEY);
  let all: BulletinItem[] = cached || [];
  let fromCache = !!cached;

  if (!cached) {
    all = await fetchFromDb();
    if (all.length === 0) {
      // Fallback to bundled static data
      const staticAll = fetchStaticPaginated(1, 1000).items;
      all = staticAll.map(mapStaticToBulletin);
    }
    cacheSet(CACHE_KEY, all, CACHE_TTL);
  } else {
    // Refresh in background
    fetchFromDb().then((fresh) => {
      if (fresh.length > 0) cacheSet(CACHE_KEY, fresh, CACHE_TTL);
    });
  }

  // Filter by category
  let filtered = all;
  if (category && category !== "All") {
    filtered = all.filter((i) => i.category === category);
  }

  // Role-based priority sort
  if (userRole && (!category || category === "All")) {
    const map: Record<string, string> = { farmer: "Farmer", worker: "Worker", citizen: "General" };
    const pref = map[userRole];
    if (pref) {
      filtered = [
        ...filtered.filter((i) => i.category === pref),
        ...filtered.filter((i) => i.category !== pref),
      ];
    }
  }

  const start = (page - 1) * perPage;
  return { items: filtered.slice(start, start + perPage), total: filtered.length, fromCache };
}

// Trigger a server-side RSS refresh (fire-and-forget)
export async function triggerRssRefresh(): Promise<void> {
  try {
    await supabase.functions.invoke("fetch-bulletin-rss", { body: {} });
    // Invalidate cache so next read pulls fresh data
    try { localStorage.removeItem("gs-cache:" + CACHE_KEY); } catch {}
  } catch (e) {
    console.warn("RSS refresh trigger failed:", e);
  }
}
