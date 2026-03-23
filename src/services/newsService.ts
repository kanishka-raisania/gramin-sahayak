// News service with in-memory caching and auto-refresh
import { fetchNews, fetchNewsPaginated, fetchNewsById as apiFetchNewsById, type NewsItem } from "@/data/api";

interface CacheEntry {
  data: NewsItem[];
  timestamp: number;
}

const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes
let cache: CacheEntry | null = null;
let refreshInterval: ReturnType<typeof setInterval> | null = null;

// Fetch news with caching — returns cached data if fresh
export function getNews(): NewsItem[] {
  const now = Date.now();
  if (cache && now - cache.timestamp < CACHE_DURATION_MS) {
    return cache.data;
  }
  const data = fetchNews();
  cache = { data, timestamp: now };
  return data;
}

// Get single news item by ID
export function getNewsById(id: number): NewsItem | undefined {
  return apiFetchNewsById(id);
}

// Paginated news
export function getNewsPaginated(page: number, perPage: number, category?: string) {
  return fetchNewsPaginated(page, perPage, category);
}

// Start auto-refresh timer
export function startAutoRefresh(onUpdate?: (data: NewsItem[]) => void) {
  if (refreshInterval) return;
  refreshInterval = setInterval(() => {
    cache = null;
    const freshData = getNews();
    onUpdate?.(freshData);
  }, CACHE_DURATION_MS);
}

// Cleanup
export function stopAutoRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
}

// Force refresh
export function forceRefresh(): NewsItem[] {
  cache = null;
  return getNews();
}
