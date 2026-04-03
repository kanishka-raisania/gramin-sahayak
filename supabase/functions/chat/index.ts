import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function detectIntent(message: string): string {
  const lower = message.toLowerCase();
  if (lower.match(/wage|salary|pay|मजदूरी|वेतन|तनख्वाह/)) return "worker";
  if (lower.match(/crop|farm|kisan|kheti|खेती|फसल|किसान|बीज/)) return "farmer";
  if (lower.match(/ration|food|राशन|खाना|अनाज/)) return "ration";
  if (lower.match(/health|hospital|doctor|स्वास्थ्य|अस्पताल|डॉक्टर/)) return "health";
  if (lower.match(/school|education|padhai|शिक्षा|पढ़ाई|स्कूल/)) return "education";
  return "general";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { message, session_id, language = "en", history = [], user_context } = await req.json();

    if (!message?.trim()) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const intent = detectIntent(message);
    const langMap: Record<string, string> = {
      hi: "Always respond in Hindi (Devanagari script). Use simple Hindi that a village person can understand.",
      pa: "Always respond in Punjabi (Gurmukhi script). Use simple Punjabi that a village person can understand.",
      bn: "Always respond in Bengali (Bengali script). Use simple Bengali that a village person can understand.",
      ta: "Always respond in Tamil (Tamil script). Use simple Tamil that a village person can understand.",
      en: "Respond in simple English. Use short sentences. Avoid technical words.",
    };
    const langInstruction = langMap[language] || langMap.en;

    // Build personalized context from user profile
    let personalizationContext = "";
    if (user_context) {
      const parts: string[] = [];
      if (user_context.name) parts.push(`User's name is ${user_context.name}`);
      if (user_context.role) parts.push(`User is a ${user_context.role}`);
      if (user_context.state) parts.push(`User lives in ${user_context.state}, India`);
      if (user_context.age_group) parts.push(`User's age group: ${user_context.age_group}`);
      if (user_context.gender) parts.push(`User's gender: ${user_context.gender}`);
      
      if (parts.length > 0) {
        personalizationContext = `\n\nUser Profile:\n${parts.join("\n")}

IMPORTANT PERSONALIZATION RULES:
- Address the user by name if known (use "ji" suffix for respect)
- Prioritize schemes and information relevant to their role (${user_context.role || "citizen"})
- If they are a farmer, focus on agriculture schemes, crop insurance, KCC, soil health
- If they are a worker, focus on labor rights, minimum wage, e-Shram, MGNREGA
- If they live in a specific state, mention state-specific schemes and local offices
- If they are female, also mention women-specific schemes like Ujjwala, Mahila Samman
- If they are 40+, use simpler language and mention pension schemes
- Make responses feel personally curated, not generic`;
      }
    }

    const systemPrompt = `You are Gramin Sahayak (ग्रामीण सहायक), a personalized rural Indian digital assistant.

Your role:
- Help farmers, workers, and rural citizens understand government schemes
- Explain things in very simple language — imagine talking to someone who never went to school
- Focus on: government schemes, farming advice, wages & labour rights, ration/food distribution, health services, education
- Give practical, actionable answers (where to go, what documents to carry, helpline numbers)
- Be warm, respectful, and encouraging
- Use examples with rupee amounts when possible
- Keep answers under 150 words
- Use bullet points and bold text for clarity

${langInstruction}
${personalizationContext}

Important government helplines:
- Kisan Call Centre: 1800-180-1551
- Labour helpline: 14434
- PM-KISAN: 155261
- Ayushman Bharat: 14555
- MGNREGA: 1800-345-22444`;

    const contextMessages = history.slice(-5).map((h: { role: string; text: string }) => ({
      role: h.role === "user" ? "user" : "assistant",
      content: h.text,
    }));

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...contextMessages,
          { role: "user", content: message },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please try again later." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
