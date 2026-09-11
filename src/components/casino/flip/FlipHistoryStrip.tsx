"use client";

import { useEffect, useRef } from "react";
import { FlipSideIcon } from "@/components/casino/flip/FlipSideVisuals";
import { formatFlipMultiplier, getFlipMultiplier } from "@/lib/casino/flip/config";
import type { FlipHistoryEntry } from "@/lib/casino/flip/types";

interface FlipHistoryStripProps {
  history: FlipHistoryEntry[];
  autoMode?: boolean;
}

function historyBadge(
  entry: FlipHistoryEntry,
  index: number,
  autoMode: boolean,
): { label: string; isLoss: boolean } | null {
  if (!entry.won) {
    return { label: formatFlipMultiplier(0), isLoss: true };
  }
  if (autoMode) {
    return { label: formatFlipMultiplier(getFlipMultiplier(1)), isLoss: false };
  }
  return { label: formatFlipMultiplier(getFlipMultiplier(index + 1)), isLoss: false };
}

export function FlipHistoryStrip({ history, autoMode = false }: FlipHistoryStripProps) {
  const stripRef = useRef<HTMLDivElement>(null);
  const lastItemKey =
    history.length > 0 ? `${history.length - 1}-${history.at(-1)?.result}-${history.at(-1)?.won}` : null;

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip || history.length === 0) return;

    strip.scrollTo({
      left: strip.scrollWidth,
      behavior: "smooth",
    });
  }, [lastItemKey, history.length]);

  if (history.length === 0) return null;

  return (
    <div ref={stripRef} className="hilo-history-strip flip-history-strip" aria-label="Historique">
      <div className="hilo-history-track">
        {history.map((entry, index) => {
          const badge = historyBadge(entry, index, autoMode);

          return (
            <div key={`${index}-${entry.result}`} className="hilo-history-segment">
              <div className="hilo-history-item">
                <div className="hilo-history-card-wrap">
                  <div className="flip-history-coin-wrap">
                    <div
                      className={`flip-history-coin flip-history-coin-${entry.result}${entry.won ? " flip-history-coin-win" : " flip-history-coin-loss"}`}
                    >
                      <FlipSideIcon side={entry.result} variant="history" />
                    </div>
                  </div>
                </div>
                <div className="hilo-history-badge-wrap">
                  {badge && (
                    <span
                      className={`hilo-history-badge${badge.isLoss ? " hilo-history-badge-loss" : ""}`}
                    >
                      {badge.label}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
