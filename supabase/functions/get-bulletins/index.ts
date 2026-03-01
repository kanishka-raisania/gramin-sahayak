/**
 * get-bulletins — Server-side paginated bulletin API
 * Accepts: page, per_page, category
 * Returns: { items, total, page, totalPages }
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const perPage = Math.min(50, Math.max(1, parseInt(url.searchParams.get("per_page") || "9")));
    const category = url.searchParams.get("category") || "";

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Count query
    let countQuery = supabase
      .from("bulletin_items")
      .select("*", { count: "exact", head: true });
    
    if (category && category !== "All") {
      countQuery = countQuery.eq("category", category);
    }

    const { count } = await countQuery;
    const total = count ?? 0;
    const totalPages = Math.ceil(total / perPage);
    const offset = (page - 1) * perPage;

    // Data query
    let dataQuery = supabase
      .from("bulletin_items")
      .select("*")
      .order("publish_date", { ascending: false })
      .range(offset, offset + perPage - 1);

    if (category && category !== "All") {
      dataQuery = dataQuery.eq("category", category);
    }

    const { data: items, error } = await dataQuery;
    if (error) throw error;

    return new Response(
      JSON.stringify({ items: items || [], total, page, totalPages }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("get-bulletins error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
