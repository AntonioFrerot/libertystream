"use client";

import { useState } from "react";
import { Globe, Headphones, ChevronDown, ChevronUp } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { Locale } from "@/lib/i18n/translations";

const locales: { code: Locale; label: string }[] = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
];

interface SidebarFooterProps {
  collapsed?: boolean;
}

export function SidebarFooter({ collapsed = false }: SidebarFooterProps) {
  const { locale, setLocale, t } = useLanguage();
  const [open, setOpen] = useState(false);

  const currentLabel = locales.find((l) => l.code === locale)?.label ?? "Français";

  if (collapsed) {
    return (
      <div className="sidebar-footer sidebar-footer-collapsed">
        <button type="button" className="sidebar-footer-row" title={t("menuLiveSupport")}>
          <Headphones className="sidebar-footer-icon" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          className="sidebar-footer-row"
          title={`${t("language")}: ${currentLabel}`}
          onClick={() => setOpen(!open)}
        >
          <Globe className="sidebar-footer-icon" strokeWidth={1.75} />
        </button>
      </div>
    );
  }

  return (
    <div className="sidebar-footer">
      <button type="button" className="sidebar-footer-row">
        <Headphones className="sidebar-footer-icon" strokeWidth={1.75} />
        <span>{t("menuLiveSupport")}</span>
      </button>

      <div className={`sidebar-footer-lang ${open ? "sidebar-footer-lang-open" : ""}`}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="sidebar-footer-row w-full"
          aria-expanded={open}
        >
          <Globe className="sidebar-footer-icon" strokeWidth={1.75} />
          <span className="flex-1 text-left truncate">
            {t("language")}: {currentLabel}
          </span>
          <span className="sidebar-footer-chevron-btn">
            {open ? (
              <ChevronUp className="w-3 h-3 text-white/70" strokeWidth={2.5} />
            ) : (
              <ChevronDown className="w-3 h-3 text-white/70" strokeWidth={2.5} />
            )}
          </span>
        </button>

        <div className={`sidebar-footer-lang-panel ${open ? "sidebar-footer-lang-panel-open" : ""}`}>
          <div className="sidebar-footer-lang-list">
            {locales.map((l) => {
              const selected = locale === l.code;
              return (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLocale(l.code)}
                  className={`sidebar-footer-lang-option ${selected ? "sidebar-footer-lang-option-active" : ""}`}
                >
                  <span>{l.label}</span>
                  <span className={`sidebar-footer-radio ${selected ? "sidebar-footer-radio-active" : ""}`} />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
