import { useState } from "react";
import { verifyNews } from "@/data/api";
import { ShieldCheck, Search, XCircle, CheckCircle } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const Verify = () => {
  const [text, setText] = useState("");
  const [result, setResult] = useState<{
    status: string;
    likely: "false" | "true";
    explanation: string;
  } | null>(null);
  const { t } = useLanguage();

  // ML integration here later — will use trained NLP model
  const handleVerify = () => {
    if (!text.trim()) return;
    const res = verifyNews(text);
    setResult(res);
  };

  return (
    <div className="min-h-screen pb-24">
      <div className="bg-primary px-4 py-3 text-primary-foreground">
        <div className="container mx-auto flex items-center gap-2">
          <ShieldCheck className="h-6 w-6" />
          <div>
            <h2 className="text-lg font-bold">🛡 {t("verifyTitle")}</h2>
            <p className="text-xs opacity-80">{t("verifySubtitle")}</p>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Input */}
        <div className="space-y-3">
          <label className="block text-base font-bold text-foreground">
            📝 {t("verifyLabel")}
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("verifyPlaceholder")}
            rows={5}
            className="w-full rounded-xl border border-input bg-card p-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none shadow-sm"
          />
          <button
            onClick={handleVerify}
            disabled={!text.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary p-4 text-lg font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50"
          >
            <Search className="h-5 w-5" />
            {t("verifyButton")}
          </button>
        </div>

        {/* Result — colored card based on likely true/false */}
        {result && (
          <div
            className={`animate-fade-in rounded-xl p-6 shadow-lg text-center ${
              result.likely === "false"
                ? "bg-destructive/10 border-2 border-destructive"
                : "bg-primary/10 border-2 border-primary"
            }`}
          >
            <div className="flex justify-center mb-3">
              {result.likely === "false" ? (
                <XCircle className="h-16 w-16 text-destructive" />
              ) : (
                <CheckCircle className="h-16 w-16 text-primary" />
              )}
            </div>
            <h3 className="text-xl font-extrabold text-foreground mb-2">
              {t("verifyResult")}
            </h3>
            <p
              className={`text-lg font-bold mb-4 ${
                result.likely === "false" ? "text-destructive" : "text-primary"
              }`}
            >
              ⚠️ {result.status}
            </p>
            <div className="rounded-lg bg-card p-4 text-left">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {result.explanation}
              </p>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="rounded-xl bg-muted p-5 text-sm text-muted-foreground">
          <p className="font-semibold mb-1">ℹ️ {t("verifyHow")}</p>
          <p>{t("verifyHowDesc")}</p>
        </div>
      </main>
    </div>
  );
};

export default Verify;
