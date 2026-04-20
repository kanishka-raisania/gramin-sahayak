// Fetches government scheme news from official RSS feeds (PIB, ministries),
// classifies into Farmer / Worker / General, and upserts into bulletin_items.
// Idempotent: safe to run on a cron every few hours.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FeedConfig {
  url: string;
  source: string;
  defaultCategory: "Farmer" | "Worker" | "General";
}

// Public Indian RSS feeds — PIB requires browser UA
const FEEDS: FeedConfig[] = [
  { url: "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3", source: "Press Information Bureau", defaultCategory: "General" },
  { url: "https://pib.gov.in/RssMain.aspx?ModId=8&Lang=1&Regid=3", source: "Ministry of Agriculture", defaultCategory: "Farmer" },
  { url: "https://pib.gov.in/RssMain.aspx?ModId=22&Lang=1&Regid=3", source: "Ministry of Labour", defaultCategory: "Worker" },
  { url: "https://pib.gov.in/RssMain.aspx?ModId=18&Lang=1&Regid=3", source: "Ministry of Health", defaultCategory: "General" },
  { url: "https://pib.gov.in/RssMain.aspx?ModId=29&Lang=1&Regid=3", source: "Ministry of Rural Development", defaultCategory: "General" },
  { url: "https://www.thehindu.com/news/national/feeder/default.rss", source: "The Hindu - National", defaultCategory: "General" },
  { url: "https://www.thehindu.com/business/agri-business/feeder/default.rss", source: "The Hindu - Agri Business", defaultCategory: "Farmer" },
];

const BROWSER_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// Lightweight category classifier from keywords in title/description
function classify(text: string, fallback: "Farmer" | "Worker" | "General"): "Farmer" | "Worker" | "General" {
  const t = text.toLowerCase();
  if (/farmer|kisan|crop|agricultur|fertiliz|soil|irrigation|seed|paddy|wheat|fpo|mandi|fishery|dairy|cattle|livestock|horticult/.test(t)) return "Farmer";
  if (/worker|labour|labor|wage|mgnrega|epfo|employment|skill|artisan|construction|gig|migrant/.test(t)) return "Worker";
  return fallback;
}

// Strip HTML tags
function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();
}

// Naive but reliable RSS parser (no XML lib in Deno edge runtime)
function parseRss(xml: string, feed: FeedConfig) {
  const items: Array<{ title: string; description: string; link: string; guid: string; pubDate: string }> = [];
  const itemRegex = /<item[\s\S]*?<\/item>/gi;
  const blocks = xml.match(itemRegex) || [];

  for (const block of blocks) {
    const grab = (tag: string) => {
      const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`, "i"));
      if (!m) return "";
      return stripHtml(m[1].replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, ""));
    };
    const title = grab("title");
    const description = grab("description");
    const link = grab("link");
    const guid = grab("guid") || link;
    const pubDate = grab("pubDate");
    if (title && (link || guid)) {
      items.push({ title, description, link, guid, pubDate });
    }
  }
  return items.map((it) => ({ ...it, _feed: feed }));
}

async function fetchFeedSafe(feed: FeedConfig, signal: AbortSignal) {
  try {
    const resp = await fetch(feed.url, {
      signal,
      redirect: "follow",
      headers: {
        "User-Agent": BROWSER_UA,
        "Accept": "application/rss+xml, application/xml, text/xml, */*",
      },
    });
    if (!resp.ok) {
      console.log(`Feed ${feed.url} returned ${resp.status}`);
      return [];
    }
    const xml = await resp.text();
    return parseRss(xml, feed);
  } catch (e) {
    console.log(`Feed ${feed.url} failed:`, (e as Error).message);
    return [];
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    // Fetch all feeds in parallel
    const results = await Promise.all(FEEDS.map((f) => fetchFeedSafe(f, controller.signal)));
    clearTimeout(timeout);

    const fallbackImages = {
      Farmer: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&h=400&fit=crop",
      Worker: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop",
      General: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&h=400&fit=crop",
    };

    const rows: Array<Record<string, unknown>> = [];
    const seenGuids = new Set<string>();

    for (const items of results) {
      for (const it of items) {
        const guid = `rss:${it.guid}`.slice(0, 500);
        if (seenGuids.has(guid)) continue;
        seenGuids.add(guid);

        const category = classify(`${it.title} ${it.description}`, it._feed.defaultCategory);
        const publishDate = it.pubDate ? new Date(it.pubDate) : new Date();
        const description = (it.description || it.title).slice(0, 500);

        rows.push({
          title: it.title.slice(0, 300),
          description,
          category,
          source: it._feed.source,
          source_url: it.link || null,
          image_url: fallbackImages[category],
          publish_date: isNaN(publishDate.getTime()) ? new Date().toISOString() : publishDate.toISOString(),
          rss_guid: guid,
          last_fetched_at: new Date().toISOString(),
        });
      }
    }

    if (rows.length === 0) {
      return new Response(JSON.stringify({ success: true, inserted: 0, message: "No items fetched" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Upsert in chunks (ON CONFLICT skip duplicates by rss_guid)
    const chunkSize = 50;
    let inserted = 0;
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);
      const { error, count } = await supabase
        .from("bulletin_items")
        .upsert(chunk, { onConflict: "rss_guid", ignoreDuplicates: false, count: "exact" });
      if (error) {
        console.error("Upsert error:", error);
      } else {
        inserted += count || chunk.length;
      }
    }

    // Cleanup: keep only last 200 dynamic (rss:) items
    const { data: oldRows } = await supabase
      .from("bulletin_items")
      .select("id")
      .like("rss_guid", "rss:%")
      .order("publish_date", { ascending: false })
      .range(200, 999);
    if (oldRows && oldRows.length) {
      await supabase.from("bulletin_items").delete().in("id", oldRows.map((r) => r.id));
    }

    return new Response(JSON.stringify({ success: true, inserted, totalParsed: rows.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    clearTimeout(timeout);
    console.error("fetch-bulletin-rss error:", e);
    return new Response(JSON.stringify({ success: false, error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
