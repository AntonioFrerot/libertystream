"use client";

import { useState, useRef, useEffect } from "react";
import { Globe, Check, ChevronUp } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { Locale } from "@/lib/i18n/translations";

const locales: { code: Locale; label: string; flag: string }[] = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
];

interface LanguageSwitcherProps {
  variant?: "navbar" | "sidebar";
  collapsed?: boolean;
}

export function LanguageSwitcher({ variant = "navbar", collapsed = false }: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (variant === "sidebar") {
    return (
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          title={t("menuDisplayLanguage")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            open ? "bg-kick-hover text-white" : "text-white/60 hover:text-white hover:bg-kick-hover"
          } ${collapsed ? "justify-center px-2" : ""}`}
        >
          <Globe className="w-5 h-5 flex-shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left truncate">{t("menuDisplayLanguage")}</span>
              <span className="text-xs text-white/35 uppercase">{locale}</span>
              <ChevronUp className={`w-3.5 h-3.5 text-white/30 transition-transform ${open ? "" : "rotate-180"}`} />
            </>
          )}
        </button>

        {open && (
          <div
            className={`absolute bottom-full mb-2 rounded-lg bg-kick-bg border border-kick-border shadow-2xl overflow-hidden z-50 ${
              collapsed ? "left-0 w-44" : "left-0 right-0"
            }`}
          >
            {locales.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => {
                  setLocale(l.code);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-kick-hover transition-colors ${
                  locale === l.code ? "text-kick-green" : "text-white/70"
                }`}
              >
                <span>{l.flag}</span>
                <span className="flex-1 text-left">{l.label}</span>
                {locale === l.code && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg hover:bg-glass-hover transition-colors hidden sm:flex items-center gap-1.5"
        title={t("language")}
      >
        <Globe className="w-5 h-5 text-white/60" />
        <span className="text-xs font-medium text-white/60 uppercase">{locale}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 glass-panel py-1 z-50 shadow-glass">
          {locales.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => {
                setLocale(l.code);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-glass-hover transition-colors ${
                locale === l.code ? "text-neon-cyan" : "text-white/70"
              }`}
            >
              <span>{l.flag}</span>
              <span className="flex-1 text-left">{l.label}</span>
              {locale === l.code && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
