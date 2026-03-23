import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { translations, type Language, type TranslationKey } from "./translations";
import { extraTranslationsEn } from "@/data/extraTranslations";
import { translations, type Language, type TranslationKey } from "./translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  isFirstLaunch: boolean;
  markLanguageChosen: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function getInitialLanguage(): Language {
  try {
    const stored = localStorage.getItem("gs-lang");
    if (stored === "hi" || stored === "en" || stored === "pa" || stored === "bn" || stored === "ta") return stored;
  } catch {}
  return "hi"; // Default to Hindi
}

function hasChosenLanguage(): boolean {
  try {
    return localStorage.getItem("gs-lang-chosen") === "true";
  } catch {}
  return false;
}

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);
  const [isFirstLaunch, setIsFirstLaunch] = useState(!hasChosenLanguage());

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("gs-lang", lang);
    } catch {}
  }, []);

  const markLanguageChosen = useCallback(() => {
    setIsFirstLaunch(false);
    try {
      localStorage.setItem("gs-lang-chosen", "true");
    } catch {}
  }, []);

  const t = useCallback(
    (key: TranslationKey | string): string => {
      const langTranslations = translations[language] as Record<string, string>;
      const extra = extraTranslationsEn as Record<string, string>;
      return langTranslations[key] ?? (translations.en as Record<string, string>)[key] ?? extra[key] ?? key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isFirstLaunch, markLanguageChosen }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};
