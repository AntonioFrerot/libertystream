"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useGameSounds } from "@/lib/casino/sounds/useGameSounds";

function isMobileViewport() {
  return typeof window !== "undefined" && window.matchMedia("(max-width: 899px)").matches;
}

export function GameSoundControls() {
  const { t } = useLanguage();
  const { volume, setVolume } = useGameSounds();
  const [open, setOpen] = useState(false);
  const draggingRef = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const closePanel = useCallback(() => {
    draggingRef.current = false;
    document.body.style.overflow = "";
    setOpen(false);
  }, []);

  const closeOnMobileRelease = useCallback(() => {
    if (!isMobileViewport() || !draggingRef.current) return;
    closePanel();
  }, [closePanel]);

  const handleSliderPointerDown = useCallback(() => {
    if (!isMobileViewport()) return;
    draggingRef.current = true;
    document.body.style.overflow = "hidden";
  }, []);

  useEffect(() => {
    if (!open || !isMobileViewport()) return;

    const handleRelease = () => {
      closeOnMobileRelease();
    };

    window.addEventListener("pointerup", handleRelease);
    window.addEventListener("pointercancel", handleRelease);

    return () => {
      window.removeEventListener("pointerup", handleRelease);
      window.removeEventListener("pointercancel", handleRelease);
      draggingRef.current = false;
      document.body.style.overflow = "";
    };
  }, [open, closeOnMobileRelease]);

  useEffect(() => {
    if (!open || !isMobileViewport()) return;

    const handlePointerDownOutside = (event: PointerEvent) => {
      const root = rootRef.current;
      if (!root || root.contains(event.target as Node)) return;
      closePanel();
    };

    const timer = window.setTimeout(() => {
      document.addEventListener("pointerdown", handlePointerDownOutside);
    }, 0);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("pointerdown", handlePointerDownOutside);
    };
  }, [open, closePanel]);

  return (
    <div ref={rootRef} className={`blackjack-sound-controls${open ? " is-open" : ""}`}>
      <button
        type="button"
        className="blackjack-sound-toggle"
        onClick={() => {
          if (open) {
            closePanel();
          } else {
            setOpen(true);
          }
        }}
        aria-expanded={open}
        aria-label={t("blackjackSoundVolume")}
      >
        <Volume2 className="w-4 h-4" aria-hidden />
      </button>

      {open && (
        <label className="blackjack-sound-volume">
          <span className="sr-only">{t("blackjackSoundVolume")}</span>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={Math.round(volume * 100)}
            onChange={(event) => setVolume(Number(event.target.value) / 100)}
            onInput={(event) => setVolume(Number(event.currentTarget.value) / 100)}
            onPointerDown={handleSliderPointerDown}
            aria-label={t("blackjackSoundVolume")}
          />
        </label>
      )}
    </div>
  );
}
