/**
 * LanguageSelector — First-launch screen for language selection
 * Large buttons with native script names, no emojis
 */
import { useLanguage } from "@/i18n/LanguageContext";
import type { Language, TranslationKey } from "@/i18n/translations";
import GraminLogo from "./GraminLogo";

const languageList: { code: Language; native: string }[] = [
  { code: "en", native: "English" },
  { code: "hi", native: "हिन्दी" },
  { code: "pa", native: "ਪੰਜਾਬੀ" },
  { code: "bn", native: "বাংলা" },
  { code: "ta", native: "தமிழ்" },
];

const LanguageSelector = () => {
  const { language, setLanguage, markLanguageChosen, t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        <GraminLogo size={72} />

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-extrabold text-foreground">Gramin Sahayak</h1>
          <p className="text-sm text-muted-foreground">Rural Digital Assistant</p>
        </div>

        <div className="w-full space-y-2">
          <p className="text-base font-bold text-foreground text-center mb-4">
            {t("chooseLang" as TranslationKey)}
          </p>
          {languageList.map(({ code, native }) => (
            <button
              key={code}
              onClick={() => setLanguage(code)}
              className={`w-full rounded-2xl border-2 px-6 py-4 text-lg font-bold transition-all active:scale-[0.98] ${
                language === code
                  ? "border-primary bg-primary/10 text-primary shadow-md"
                  : "border-border bg-card text-foreground hover:border-primary/50"
              }`}
            >
              {native}
            </button>
          ))}
        </div>

        <button
          onClick={markLanguageChosen}
          className="w-full rounded-2xl bg-primary py-4 text-lg font-bold text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors active:scale-[0.98]"
        >
          {t("continueLang" as TranslationKey)}
        </button>
      </div>
    </div>
  );
};

export default LanguageSelector;
