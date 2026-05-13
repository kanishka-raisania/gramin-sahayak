/**
 * tts-sarvam — Proxy edge function for Sarvam AI Text-to-Speech API
 *
 * Keeps the SARVAM_API_KEY secret on the server.
 * Returns base64-encoded WAV audio that the browser plays directly.
 *
 * Request  : POST { text: string, language: string, gender?: "female"|"male" }
 * Response : { audio: string, speaker: string }  (base64 WAV + which voice was used)
 *          | { error: string }  (on failure — browser falls back to browser TTS)
 *
 * Set SARVAM_API_KEY in your Supabase project → Settings → Edge Functions → Secrets
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Sarvam language codes keyed by our app language codes
const LANG_MAP: Record<string, string> = {
  hi: "hi-IN",
  en: "en-IN",
  ta: "ta-IN",
  bn: "bn-IN",
  pa: "pa-IN",
};

/**
 * Best Sarvam AI voices per language and gender.
 * All voices use the bulbul:v1 model.
 *
 * Hindi   — meera (F, warm & clear), arvind (M, natural)
 * English — maya  (F, Indian accent), arjun  (M, Indian accent)
 * Tamil   — pavithra (F, native Tamil), suresh (M, native Tamil)
 * Bengali — anushka (F, native Bengali), amartya (M, native Bengali)
 * Punjabi — meera (F, closest Hindi voice), amol (M, closest Hindi voice)
 */
const SPEAKERS: Record<string, { female: string; male: string }> = {
  "hi-IN": { female: "meera",    male: "arvind"   },
  "en-IN": { female: "maya",     male: "arjun"    },
  "ta-IN": { female: "pavithra", male: "suresh"   },
  "bn-IN": { female: "anushka",  male: "amartya"  },
  "pa-IN": { female: "meera",    male: "amol"     },
};

/** Trim to ~500 chars at a sentence boundary so Sarvam handles it cleanly. */
function trimToLimit(text: string, limit = 500): string {
  if (text.length <= limit) return text;
  const truncated = text.slice(0, limit);
  const lastPunct = Math.max(
    truncated.lastIndexOf("।"),
    truncated.lastIndexOf("."),
    truncated.lastIndexOf("?"),
    truncated.lastIndexOf("!"),
  );
  return lastPunct > limit * 0.5 ? truncated.slice(0, lastPunct + 1) : truncated;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("SARVAM_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "SARVAM_API_KEY not configured" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { text, language = "hi", gender = "female" } = await req.json();
    if (!text?.trim()) {
      return new Response(
        JSON.stringify({ error: "text is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const langCode  = LANG_MAP[language] ?? "hi-IN";
    const langVoices = SPEAKERS[langCode] ?? SPEAKERS["hi-IN"];
    const speaker   = gender === "male" ? langVoices.male : langVoices.female;
    const cleanText = trimToLimit(text.trim());

    const sarvamRes = await fetch("https://api.sarvam.ai/text-to-speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": apiKey,
      },
      body: JSON.stringify({
        inputs: [cleanText],
        target_language_code: langCode,
        speaker,
        pitch: 0,
        pace: 1.0,
        loudness: 1.5,
        speech_sample_rate: 22050,
        enable_preprocessing: true,
        model: "bulbul:v1",
      }),
    });

    if (!sarvamRes.ok) {
      const err = await sarvamRes.text().catch(() => sarvamRes.statusText);
      console.error("Sarvam API error:", sarvamRes.status, err);
      return new Response(
        JSON.stringify({ error: `Sarvam API returned ${sarvamRes.status}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await sarvamRes.json();
    // Sarvam returns: { audios: ["base64wav..."], request_id: "..." }
    const audio: string | undefined = data?.audios?.[0];
    if (!audio) {
      return new Response(
        JSON.stringify({ error: "No audio in Sarvam response" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ audio, speaker }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("tts-sarvam error:", e);
    return new Response(
      JSON.stringify({ error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
