import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Heuristic signals for misinformation detection
function analyzeHeuristics(text: string): { signals: string[]; adjustment: number } {
  const signals: string[] = [];
  let adjustment = 0;

  // Excess emojis
  const emojiCount = (text.match(/[\u{1F600}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu) || []).length;
  if (emojiCount > 5) {
    signals.push("excessive_emojis");
    adjustment -= 10;
  }

  // ALL CAPS detection
  const words = text.split(/\s+/);
  const capsWords = words.filter(w => w.length > 3 && w === w.toUpperCase()).length;
  if (capsWords > 3) {
    signals.push("excessive_caps");
    adjustment -= 10;
  }

  // WhatsApp forwarded pattern
  if (text.match(/forwarded|fwd:|shared via|sent as forwarded/i)) {
    signals.push("forwarded_message");
    adjustment -= 15;
  }

  // No source mentioned
  if (!text.match(/according to|source|reported by|official|ministry|government|gov\.in|pib|reuters|pti/i)) {
    signals.push("no_source");
    adjustment -= 5;
  }

  // Urgency/fear patterns
  if (text.match(/urgent|breaking|share immediately|forward to everyone|last date today|hurry/i)) {
    signals.push("urgency_language");
    adjustment -= 10;
  }

  return { signals, adjustment };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { text, session_id } = await req.json();

    if (!text?.trim()) {
      return new Response(JSON.stringify({ error: "Text is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Step 1: Heuristic analysis
    const heuristics = analyzeHeuristics(text);

    // Step 2: AI Analysis using tool calling for structured output
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a fact-checking assistant for rural Indian users. Analyze the given text and determine if it is TRUE, FALSE, or UNCERTAIN.

Rules:
- Give a confidence score from 0-100
- Explain in very simple language (imagine explaining to a village elder)
- Consider: Does it mention a real government scheme? Are the numbers realistic? Is there a verifiable source?
- Be especially careful about: fake government announcements, WhatsApp forwards, money scams
- Keep explanation under 100 words
- If the text is in Hindi, respond in Hindi`,
          },
          { role: "user", content: `Analyze this message:\n\n"${text}"` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "fact_check_result",
              description: "Return the fact-check analysis result",
              parameters: {
                type: "object",
                properties: {
                  verdict: { type: "string", enum: ["true", "false", "uncertain"], description: "Whether the information is true, false, or uncertain" },
                  confidence: { type: "number", description: "Confidence score 0-100" },
                  explanation: { type: "string", description: "Simple explanation for rural users" },
                },
                required: ["verdict", "confidence", "explanation"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "fact_check_result" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI analysis failed");
    }

    const aiResult = await response.json();

    // Parse tool call result
    let verdict = "uncertain";
    let confidence = 50;
    let explanation = "Could not analyze this message. Please verify with official sources.";

    try {
      const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall?.function?.arguments) {
        const parsed = JSON.parse(toolCall.function.arguments);
        verdict = parsed.verdict || "uncertain";
        confidence = Math.max(0, Math.min(100, (parsed.confidence || 50) + heuristics.adjustment));
        explanation = parsed.explanation || explanation;
      }
    } catch (parseErr) {
      console.error("Failed to parse AI result:", parseErr);
    }

    const result = { verdict, confidence, explanation, signals: heuristics.signals };

    // Save to database
    try {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      await supabase.from("fake_news_checks").insert({
        session_id: session_id || "anonymous",
        news_text: text.substring(0, 2000),
        verdict,
        confidence,
        explanation,
      });
    } catch (dbErr) {
      console.error("DB save error:", dbErr);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("verify error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
