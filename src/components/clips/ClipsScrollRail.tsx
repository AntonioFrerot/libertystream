"use client";

import { useRef } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { WaterRippleCanvas } from "@/components/clips/WaterRippleCanvas";

function ChevronArrow({ up }: { up?: boolean }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`w-12 h-12 lg:w-14 lg:h-14 transition-transform duration-200 ${up ? "rotate-180" : ""}`}
      aria-hidden
    >
      <path d="M8 18 L24 32 L40 18" />
    </svg>
  );
}

interface ClipsScrollRailProps {
  onScrollUp: () => void;
  onScrollDown: () => void;
  canScrollUp: boolean;
  canScrollDown: boolean;
}

export function ClipsScrollRail({
  onScrollUp,
  onScrollDown,
  canScrollUp,
  canScrollDown,
}: ClipsScrollRailProps) {
  const { t } = useLanguage();
  const railRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={railRef}
      className="clips-scroll-rail hidden lg:flex flex-col flex-1 min-w-[4.5rem] relative overflow-hidden"
    >
      <WaterRippleCanvas containerRef={railRef} />

      <button
        type="button"
        onClick={onScrollUp}
        disabled={!canScrollUp}
        aria-label={t("previous")}
        className="clips-scroll-rail-zone clips-scroll-rail-zone-up"
      >
        <ChevronArrow up />
      </button>

      <div className="clips-scroll-rail-divider" aria-hidden />

      <button
        type="button"
        onClick={onScrollDown}
        disabled={!canScrollDown}
        aria-label={t("next")}
        className="clips-scroll-rail-zone clips-scroll-rail-zone-down"
      >
        <ChevronArrow />
      </button>
    </div>
  );
}
