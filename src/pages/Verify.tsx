import { useState } from "react";
import { ShieldCheck, Search, XCircle, CheckCircle, AlertTriangle, Loader2, History } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

interface VerifyResult {
  verdict: "true" | "false" | "uncertain";
  confidence: number;
  explanation: string;
  signals?: string[];
}

// Session ID for tracking
function getSessionId(): string {
  let id = localStorage.getItem("gs-session-id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("gs-session-id", id);
  }
  return id;
}

const Verify = () => {
  const [text, setText] = useState("");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<VerifyResult[]>([]);
  const { t } = useLanguage();
  const { toast } = useToast();

  const handleVerify = async () => {
    if (!text.trim() || isLoading) return;
    setIsLoading(true);
    setResult(null);

    try {
      const VERIFY_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify`;
      const resp = await fetch(VERIFY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          text: text.trim(),
          session_id: getSessionId(),
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || `Error ${resp.status}`);
      }

      const data: VerifyResult = await resp.json();
      setResult(data);
      setHistory((prev) => [data, ...prev].slice(0, 5));
    } catch (e) {
      console.error("Verify error:", e);
      const errorMessage = e instanceof Error ? e.message : "Something went wrong";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verdictConfig = {
    true: {
      bg: "bg-primary/10 border-primary",
      textColor: "text-primary",
      icon: <CheckCircle className="h-16 w-16 text-primary" />,
      labelKey: "verifyLikelyTrue" as const,
    },
    false: {
      bg: "bg-destructive/10 border-destructive",
      textColor: "text-destructive",
      icon: <XCircle className="h-16 w-16 text-destructive" />,
      labelKey: "verifyLikelyFalse" as const,
    },
    uncertain: {
      bg: "bg-amber-100/50 border-amber-500 dark:bg-amber-900/20",
      textColor: "text-amber-600 dark:text-amber-400",
      icon: <AlertTriangle className="h-16 w-16 text-amber-500" />,
      labelKey: "verifyNotSure" as const,
    },
  };

  return (
    <div className="min-h-screen pb-24">
      <div className="bg-primary px-4 py-3 text-primary-foreground">
        <div className="container mx-auto flex items-center gap-2">
          <ShieldCheck className="h-6 w-6" />
          <div>
            <h2 className="text-lg font-bold">{t("verifyTitle")}</h2>
            <p className="text-xs opacity-80">{t("verifySubtitle")}</p>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Input */}
        <div className="space-y-3">
          <label className="block text-base font-bold text-foreground">
            {t("verifyLabel")}
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("verifyPlaceholder")}
            rows={5}
            maxLength={2000}
            className="w-full rounded-xl border border-input bg-card p-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none shadow-sm"
          />
          <button
            onClick={handleVerify}
            disabled={!text.trim() || isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary p-4 text-lg font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Search className="h-5 w-5" />
            )}
            {isLoading ? t("verifyChecking") : t("verifyButton")}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div
            className={`animate-fade-in rounded-xl p-6 shadow-lg text-center border-2 ${
              verdictConfig[result.verdict].bg
            }`}
          >
            <div className="flex justify-center mb-3">
              {verdictConfig[result.verdict].icon}
            </div>
            <h3 className="text-xl font-extrabold text-foreground mb-2">
              {t("verifyResult")}
            </h3>
            <p className={`text-lg font-bold mb-2 ${verdictConfig[result.verdict].textColor}`}>
              {t(verdictConfig[result.verdict].labelKey)}
            </p>

            {/* Confidence bar */}
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-1">
                {t("verifyConfidence")}: {result.confidence}%
              </p>
              <Progress value={result.confidence} className="h-3" />
            </div>

            <div className="rounded-lg bg-card p-4 text-left">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {result.explanation}
              </p>
            </div>

            {result.signals && result.signals.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2 justify-center">
                {result.signals.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
                  >
                    {s.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Advice */}
        {result && (
          <div className="rounded-xl bg-muted p-4 text-sm text-muted-foreground text-center animate-fade-in">
            <p className="font-semibold">{t("verifyAdvice")}</p>
          </div>
        )}

        {/* History */}
        {history.length > 1 && (
          <div className="space-y-2">
            <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
              <History className="h-4 w-4" /> {t("verifyRecentChecks")}
            </h3>
            {history.slice(1).map((h, i) => (
              <div
                key={i}
                className={`rounded-lg border p-3 text-sm ${verdictConfig[h.verdict].bg}`}
              >
                <span className={`font-bold ${verdictConfig[h.verdict].textColor}`}>
                  {t(verdictConfig[h.verdict].labelKey)}
                </span>
                <span className="text-muted-foreground ml-2">({h.confidence}%)</span>
              </div>
            ))}
          </div>
        )}

        {/* Info */}
        <div className="rounded-xl bg-muted p-5 text-sm text-muted-foreground">
          <p className="font-semibold mb-1">{t("verifyHow")}</p>
          <p>{t("verifyHowDesc")}</p>
        </div>
      </main>
    </div>
  );
};

export default Verify;
