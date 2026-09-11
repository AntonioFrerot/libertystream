import type { WheelRisk, WheelSegmentCount } from "@/lib/casino/wheel/config";

const LOW_10: readonly number[] = [1.5, 1.2, 1.2, 1.2, 0, 1.2, 1.2, 1.2, 1.2, 0];

function repeatLow(count: WheelSegmentCount): number[] {
  const repeats = count / 10;
  return Array.from({ length: repeats }, () => [...LOW_10]).flat();
}

function highLayout(count: WheelSegmentCount): number[] {
  const max = Math.round(count * 99) / 100;
  return [...Array(count - 1).fill(0), max];
}

/** Layouts Stake / Gamba — ordre visuel des segments (0× espacés en medium). */
export const WHEEL_LAYOUTS: Record<WheelSegmentCount, Record<WheelRisk, readonly number[]>> = {
  10: {
    low: LOW_10,
    medium: [0, 1.9, 0, 1.5, 0, 2, 0, 1.5, 0, 3],
    high: highLayout(10),
  },
  20: {
    low: repeatLow(20),
    medium: [
      1.5, 0, 2, 0, 2, 0, 2, 0, 1.5, 0, 3, 0, 1.8, 0, 2, 0, 2, 0, 2, 0,
    ],
    high: highLayout(20),
  },
  30: {
    low: repeatLow(30),
    medium: [
      1.5, 0, 1.5, 0, 2, 0, 1.5, 0, 2, 0, 2, 0, 1.5, 0, 3, 0, 1.5, 0, 2, 0,
      2, 0, 1.7, 0, 4, 0, 1.5, 0, 2, 0,
    ],
    high: highLayout(30),
  },
  40: {
    low: repeatLow(40),
    medium: [
      2, 0, 3, 0, 2, 0, 1.5, 0, 3, 0, 1.5, 0, 1.5, 0, 2, 0, 1.5, 0, 3, 0,
      1.5, 0, 2, 0, 2, 0, 1.6, 0, 2, 0, 1.5, 0, 3, 0, 1.5, 0, 2, 0, 1.5, 0,
    ],
    high: highLayout(40),
  },
  50: {
    low: repeatLow(50),
    medium: [
      2, 0, 1.5, 0, 2, 0, 1.5, 0, 3, 0, 1.5, 0, 1.5, 0, 2, 0, 1.5, 0, 3, 0,
      1.5, 0, 2, 0, 1.5, 0, 2, 0, 2, 0, 1.5, 0, 3, 0, 1.5, 0, 2, 0, 1.5, 0,
      1.5, 0, 5, 0, 1.5, 0, 2, 0, 1.5, 0,
    ],
    high: highLayout(50),
  },
};

export function getWheelLayout(risk: WheelRisk, count: WheelSegmentCount): number[] {
  return [...WHEEL_LAYOUTS[count][risk]];
}

/** Palette Liberty — violets simples par multiplicateur. */
const MULTIPLIER_COLORS: Record<number, string> = {
  0: "#1a1525",
  1.2: "#4c1d95",
  1.5: "#5b21b6",
  1.6: "#6d28d9",
  1.7: "#6d28d9",
  1.8: "#7c3aed",
  1.9: "#7c3aed",
  2: "#7c3aed",
  3: "#9333ea",
  4: "#a855f7",
  5: "#b57bff",
};

const JACKPOT_COLOR = "#c894ff";

export function getStakeMultiplierColor(multiplier: number, maxMultiplier: number): string {
  if (multiplier >= maxMultiplier && maxMultiplier > 5) return JACKPOT_COLOR;
  return MULTIPLIER_COLORS[multiplier] ?? "#9333ea";
}

export function getStakeMultiplierTextColor(multiplier: number): string {
  if (multiplier <= 0) return "#94a3b8";
  return "#ffffff";
}

export function getStakeMultiplierAccent(multiplier: number): string {
  return getStakeMultiplierColor(multiplier, 0);
}
