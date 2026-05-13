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
  // National feeds
  { url: "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3", source: "Press Information Bureau", defaultCategory: "General" },
  { url: "https://pib.gov.in/RssMain.aspx?ModId=8&Lang=1&Regid=3", source: "Ministry of Agriculture", defaultCategory: "Farmer" },
  { url: "https://pib.gov.in/RssMain.aspx?ModId=22&Lang=1&Regid=3", source: "Ministry of Labour", defaultCategory: "Worker" },
  { url: "https://pib.gov.in/RssMain.aspx?ModId=18&Lang=1&Regid=3", source: "Ministry of Health", defaultCategory: "General" },
  { url: "https://pib.gov.in/RssMain.aspx?ModId=29&Lang=1&Regid=3", source: "Ministry of Rural Development", defaultCategory: "General" },
  { url: "https://www.thehindu.com/news/national/feeder/default.rss", source: "The Hindu - National", defaultCategory: "General" },
  { url: "https://www.thehindu.com/business/agri-business/feeder/default.rss", source: "The Hindu - Agri Business", defaultCategory: "Farmer" },
  // State-specific feeds — source name encodes the state for client-side filtering
  { url: "https://www.thehindu.com/news/national/kerala/feeder/default.rss", source: "The Hindu - Kerala", defaultCategory: "General" },
  { url: "https://www.thehindu.com/news/national/tamil-nadu/feeder/default.rss", source: "The Hindu - Tamil Nadu", defaultCategory: "General" },
  { url: "https://www.thehindu.com/news/national/karnataka/feeder/default.rss", source: "The Hindu - Karnataka", defaultCategory: "General" },
  { url: "https://www.thehindu.com/news/national/andhra-pradesh/feeder/default.rss", source: "The Hindu - Andhra Pradesh", defaultCategory: "General" },
  { url: "https://www.thehindu.com/news/national/telangana/feeder/default.rss", source: "The Hindu - Telangana", defaultCategory: "General" },
];

const BROWSER_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// Image pools per category — 18 unique images each so repeats are rare even on full pages
const IMAGE_POOLS: Record<string, string[]> = {
  Farmer: [
    "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1592982537447-6f2a6a0c7c10?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1595855759920-86582396756a?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1440342359743-84fcb8c21f21?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1491900177661-4e1cd2d7cce2?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1560493676-04071185765e?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1444858291040-58f756a3bdd6?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=600&h=400&fit=crop",
  ],
  Worker: [
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1513828583688-c52646db42da?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1590650153855-d9e808231d41?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1585559604959-d3b7e2a4aac7?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop",
  ],
  General: [
    "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1577495508326-19a1b3cf65b7?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1562564055-71e051d33c19?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=600&h=400&fit=crop",
  ],
};

function hashTitle(title: string): number {
  let h = 0;
  for (let i = 0; i < title.length; i++) {
    h = ((h << 5) - h + title.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function getRotatedImage(category: string, title: string): string {
  const pool = IMAGE_POOLS[category] || IMAGE_POOLS.General;
  return pool[hashTitle(title) % pool.length];
}

function classify(text: string, fallback: "Farmer" | "Worker" | "General"): "Farmer" | "Worker" | "General" {
  const t = text.toLowerCase();
  if (/farmer|kisan|crop|agricultur|fertiliz|soil|irrigation|seed|paddy|wheat|fpo|mandi|fishery|dairy|cattle|livestock|horticult/.test(t)) return "Farmer";
  if (/worker|labour|labor|wage|mgnrega|epfo|employment|skill|artisan|construction|gig|migrant/.test(t)) return "Worker";
  return fallback;
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();
}

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
    const results = await Promise.all(FEEDS.map((f) => fetchFeedSafe(f, controller.signal)));
    clearTimeout(timeout);

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
          image_url: getRotatedImage(category, it.title),
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
