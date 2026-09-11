"use client";

import { useEffect, useRef } from "react";
import { ArrowDown, ArrowUp, ChevronsRight } from "lucide-react";
import { HiloCard } from "@/components/casino/hilo/HiloCard";
import { formatFlipMultiplier } from "@/lib/casino/flip/config";
import { formatMultiplier } from "@/lib/casino/plinko/multipliers";
import type { HiloHistoryAction, HiloTimelineItem } from "@/lib/casino/hilo/types";

interface HiloHistoryStripProps {
  timeline: HiloTimelineItem[];
}

function HistoryLink({ action }: { action: HiloHistoryAction }) {
  if (action === "skip") {
    return (
      <div className="hilo-history-link hilo-history-link-skip" aria-hidden>
        <ChevronsRight className="hilo-history-link-arrow" strokeWidth={2.75} />
      </div>
    );
  }

  return (
    <div className={`hilo-history-link hilo-history-link-${action}`} aria-hidden>
      {action === "higher" ? (
        <ArrowUp className="hilo-history-link-arrow" strokeWidth={2.75} />
      ) : (
        <ArrowDown className="hilo-history-link-arrow" strokeWidth={2.75} />
      )}
    </div>
  );
}

function stepBadgeLabel(item: HiloTimelineItem): { label: string; isLoss: boolean } | null {
  const { step } = item;
  if (step.kind === "loss") {
    return { label: formatFlipMultiplier(0), isLoss: true };
  }
  if (step.kind === "multiplier" && step.multiplier != null) {
    return { label: formatMultiplier(step.multiplier), isLoss: false };
  }
  return null;
}

export function HiloHistoryStrip({ timeline }: HiloHistoryStripProps) {
  const stripRef = useRef<HTMLDivElement>(null);
  const lastItemKey =
    timeline.length > 0
      ? `${timeline.at(-1)?.step.card.id}-${timeline.length - 1}-${timeline.at(-1)?.guessAfter ?? "end"}`
      : null;

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip || timeline.length === 0) return;

    strip.scrollTo({
      left: strip.scrollWidth,
      behavior: "smooth",
    });
  }, [lastItemKey, timeline.length]);

  if (timeline.length === 0) return null;

  return (
    <div ref={stripRef} className="hilo-history-strip" aria-label="Historique">
      <div className="hilo-history-track">
        {timeline.map((item, index) => {
          const badge = stepBadgeLabel(item);

          return (
            <div key={`${item.step.card.id}-${index}`} className="hilo-history-segment">
              <div className="hilo-history-item">
                <div className="hilo-history-card-wrap">
                  <HiloCard card={item.step.card} size="history" />
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
              {item.guessAfter && <HistoryLink action={item.guessAfter} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
