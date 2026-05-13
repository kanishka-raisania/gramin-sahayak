/**
 * tts-sarvam — Proxy edge function for Sarvam AI Text-to-Speech API
 *
 * Keeps the SARVAM_API_KEY secret on the server.
 * Returns base64-encoded WAV audio that the browser plays directly.
 *
 * Request  : POST { text: string, language: string }
 * Response : { audio: string }  (base64 WAV)
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

// Sarvam language codes keyed by our app's language codes
const LANG_MAP: Record<string, string> = {
  hi: "hi-IN",
  en: "en-IN",
  ta: "ta-IN",
  bn: "bn-IN",
  pa: "pa-IN",
};

// Default speaker per language — Sarvam voices that sound natural
const SPEAKER_MAP: Record<string, string> = {
  "hi-IN": "meera",
  "en-IN": "arjun",
  "ta-IN": "pavithra",
  "bn-IN": "amartya",
  "pa-IN": "meera",   // fallback; Sarvam may add Punjabi voices later
};

/** Trim text to ~500 chars at a sentence boundary so Sarvam handles it cleanly. */
function trimToLimit(text: string, limit = 500): string {
  if (text.length <= limit) return text;
  // Try to break at last sentence-ending punctuation before limit
  const truncated = text.slice(0, limit);
  const lastPunct = Math.max(
    truncated.lastIndexOf("।"), // Hindi danda
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
      // Return a clear error so the client falls back to browser TTS
      return new Response(
        JSON.stringify({ error: "SARVAM_API_KEY not configured" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { text, language = "hi" } = await req.json();
    if (!text?.trim()) {
      return new Response(
        JSON.stringify({ error: "text is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const langCode = LANG_MAP[language] ?? "hi-IN";
    const speaker  = SPEAKER_MAP[langCode] ?? "meera";
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
      JSON.stringify({ audio }),
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
