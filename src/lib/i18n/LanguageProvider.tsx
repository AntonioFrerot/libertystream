"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { translations, type Locale, type TranslationKey } from "./translations";

const STORAGE_KEY = "libertystream-locale";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, vars?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("fr");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved === "fr" || saved === "en") setLocaleState(saved);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.lang = locale;
      localStorage.setItem(STORAGE_KEY, locale);
    }
  }, [locale, mounted]);

  const setLocale = useCallback((l: Locale) => setLocaleState(l), []);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string>) => {
      let str: string = translations[locale][key] ?? translations.fr[key] ?? key;
      if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
          str = str.replace(`{${k}}`, v);
        });
      }
      return str;
    },
    [locale]
  );

  if (!mounted) {
    return <div className="min-h-screen bg-void" />;
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

export function getCategoryLabel(
  t: (key: TranslationKey) => string,
  categoryId: string
): string {
  const map: Record<string, TranslationKey> = {
    gaming: "catGaming",
    casino: "catCasino",
    irl: "catIrl",
    combat: "catCombat",
    porno: "catPorno",
  };
  return t(map[categoryId] ?? "catGaming");
}
