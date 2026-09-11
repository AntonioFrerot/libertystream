"use client";

import { formatMultiplier } from "@/lib/casino/plinko/multipliers";
import type { WheelMultiplierSummary } from "@/lib/casino/wheel/config";

interface WheelMultiplierStripProps {
  items: WheelMultiplierSummary[];
  segmentCount: number;
}

export function WheelMultiplierStrip({ items, segmentCount }: WheelMultiplierStripProps) {
  return (
    <div className="wheel-multiplier-strip" role="list" aria-label="Multiplicateurs">
      {items.map((item) => (
        <div key={item.multiplier} className="wheel-multiplier-chip" role="listitem">
          <span className="wheel-multiplier-chip-value">{formatMultiplier(item.multiplier)}</span>
          <span className="wheel-multiplier-chip-count">
            {item.count}/{segmentCount}
          </span>
        </div>
      ))}
    </div>
  );
}
