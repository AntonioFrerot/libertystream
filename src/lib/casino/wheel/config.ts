/** Roue casino style Gamba / Stake — 99 % RTP, 1 % house edge. */

export type WheelRisk = "low" | "medium" | "high";
export type WheelSegmentCount = 10 | 20 | 30 | 40 | 50;

export const WHEEL_SEGMENT_OPTIONS: WheelSegmentCount[] = [10, 20, 30, 40, 50];

export {
  getStakeMultiplierAccent,
  getStakeMultiplierColor,
  getStakeMultiplierTextColor,
  getWheelLayout,
} from "@/lib/casino/wheel/layouts";

import {
  getStakeMultiplierColor,
  getWheelLayout,
} from "@/lib/casino/wheel/layouts";

export function getWheelMultipliers(risk: WheelRisk, count: WheelSegmentCount): number[] {
  return getWheelLayout(risk, count);
}

export function pickWheelSegmentIndex(count: number): number {
  return Math.floor(Math.random() * count);
}

export interface WheelMultiplierSummary {
  multiplier: number;
  count: number;
  color: string;
}

export function summarizeWheelMultipliers(
  multipliers: number[],
): WheelMultiplierSummary[] {
  const max = Math.max(...multipliers);
  const counts = new Map<number, number>();
  for (const mult of multipliers) {
    counts.set(mult, (counts.get(mult) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([multiplier, count]) => ({
      multiplier,
      count,
      color: getStakeMultiplierColor(multiplier, max),
    }));
}
