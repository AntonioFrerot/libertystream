import type { ChickenRoadDifficulty } from "./types";

export interface DifficultyConfig {
  maxSteps: number;
  crashChance: number;
  minMultiplier: number;
  maxMultiplier: number;
  /** Courbe de progression (CR2 : départ lent, accélération en fin de parcours). */
  curvePower: number;
}

export const CHICKEN_ROAD_DIFFICULTIES: ChickenRoadDifficulty[] = [
  "easy",
  "medium",
  "hard",
  "hardcore",
];

/** Paramètres alignés sur Chicken Road 2 (InOut Games). */
export const DIFFICULTY_CONFIG: Record<ChickenRoadDifficulty, DifficultyConfig> = {
  easy: {
    maxSteps: 30,
    crashChance: 0.04,
    minMultiplier: 1.01,
    maxMultiplier: 23.24,
    curvePower: 2,
  },
  medium: {
    maxSteps: 25,
    crashChance: 0.12,
    minMultiplier: 1.08,
    maxMultiplier: 2457,
    curvePower: 1.85,
  },
  hard: {
    maxSteps: 22,
    crashChance: 0.2,
    minMultiplier: 1.18,
    maxMultiplier: 62162.09,
    curvePower: 1.75,
  },
  hardcore: {
    maxSteps: 18,
    crashChance: 0.4,
    minMultiplier: 1.44,
    maxMultiplier: 3608855.25,
    curvePower: 1.55,
  },
};

function roundCr2Multiplier(value: number): number {
  if (value >= 1_000_000) return Math.round(value * 100) / 100;
  if (value >= 10_000) return Math.round(value * 10) / 10;
  if (value >= 1000) return Math.round(value);
  if (value >= 100) return Math.round(value * 10) / 10;
  if (value >= 10) return Math.round(value * 100) / 100;
  return Math.round(value * 100) / 100;
}

function buildMultiplierTable(config: DifficultyConfig): number[] {
  const { maxSteps, minMultiplier, maxMultiplier, curvePower } = config;
  const logMin = Math.log(minMultiplier);
  const logSpan = Math.log(maxMultiplier) - logMin;

  return Array.from({ length: maxSteps }, (_, index) => {
    const step = index + 1;
    const progress = Math.pow(step / maxSteps, curvePower);
    return roundCr2Multiplier(Math.exp(logMin + logSpan * progress));
  });
}

const MULTIPLIER_TABLES: Record<ChickenRoadDifficulty, number[]> = {
  easy: buildMultiplierTable(DIFFICULTY_CONFIG.easy),
  medium: buildMultiplierTable(DIFFICULTY_CONFIG.medium),
  hard: buildMultiplierTable(DIFFICULTY_CONFIG.hard),
  hardcore: buildMultiplierTable(DIFFICULTY_CONFIG.hardcore),
};

export function getMultiplierForStep(
  difficulty: ChickenRoadDifficulty,
  step: number,
): number {
  if (step <= 0) return 1;
  const table = MULTIPLIER_TABLES[difficulty];
  return table[Math.min(step, table.length) - 1] ?? 1;
}

export function formatLaneMultiplier(value: number): string {
  return formatChickenRoadMultiplier(value);
}

/** Affichage précis des multiplicateurs CR2 (2 décimales quand pertinent). */
export function formatChickenRoadMultiplier(value: number): string {
  if (value >= 1_000_000) {
    const compact = value / 1_000_000;
    return `${compact >= 100 ? Math.round(compact) : compact.toFixed(2)}M×`;
  }
  if (value >= 1000) {
    if (value % 1000 === 0) return `${value / 1000}k×`;
    return `${(value / 1000).toFixed(2)}k×`;
  }
  if (value >= 100) {
    return Number.isInteger(value) ? `${value}×` : `${value.toFixed(2)}×`;
  }
  if (value >= 10) {
    return Number.isInteger(value) ? `${value}×` : `${value.toFixed(2)}×`;
  }
  if (value >= 1) return `${value.toFixed(2)}×`;
  return `${value}×`;
}

export function getLaneMultipliers(difficulty: ChickenRoadDifficulty): number[] {
  return MULTIPLIER_TABLES[difficulty];
}
