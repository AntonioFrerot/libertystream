export type PlinkoRisk = "low" | "medium" | "high";

export const PLINKO_ROWS = [8, 10, 12, 14, 16] as const;
export type PlinkoRows = (typeof PLINKO_ROWS)[number];

/** Tables Stake (low / medium / high) — source: stake plinko paytables */
const TABLES: Record<PlinkoRows, [number[], number[], number[]]> = {
  8: [
    [5.6, 2.1, 1.1, 1, 0.5, 1, 1.1, 2.1, 5.6],
    [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13],
    [29, 4, 1.5, 0.3, 0.2, 0.3, 1.5, 4, 29],
  ],
  10: [
    [8.9, 3, 1.4, 1.1, 1, 0.5, 1, 1.1, 1.4, 3, 8.9],
    [22, 5, 2, 1.4, 0.6, 0.4, 0.6, 1.4, 2, 5, 22],
    [76, 10, 3, 0.9, 0.3, 0.2, 0.3, 0.9, 3, 10, 76],
  ],
  12: [
    [10, 3, 1.6, 1.4, 1.1, 1, 0.5, 1, 1.1, 1.4, 1.6, 3, 10],
    [33, 11, 4, 2, 1.1, 0.6, 0.3, 0.6, 1.1, 2, 4, 11, 33],
    [170, 24, 8.1, 2, 0.7, 0.2, 0.2, 0.2, 0.7, 2, 8.1, 24, 170],
  ],
  14: [
    [7.1, 4, 1.9, 1.4, 1.3, 1.1, 1, 0.5, 1, 1.1, 1.3, 1.4, 1.9, 4, 7.1],
    [58, 15, 7, 4, 1.9, 1, 0.5, 0.2, 0.5, 1, 1.9, 4, 7, 15, 58],
    [420, 56, 18, 5, 1.9, 0.3, 0.2, 0.2, 0.2, 0.3, 1.9, 5, 18, 56, 420],
  ],
  16: [
    [16, 9, 2, 1.4, 1.4, 1.2, 1.1, 1, 0.5, 1, 1.1, 1.2, 1.4, 1.4, 2, 9, 16],
    [110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10, 41, 110],
    [1000, 130, 26, 9, 4, 2, 0.2, 0.2, 0.2, 0.2, 0.2, 2, 4, 9, 26, 130, 1000],
  ],
};

const RISK_INDEX: Record<PlinkoRisk, number> = { low: 0, medium: 1, high: 2 };

export function getPlinkoMultipliers(rows: PlinkoRows, risk: PlinkoRisk): number[] {
  return TABLES[rows][RISK_INDEX[risk]];
}

export function generatePlinkoPath(rows: number): number[] {
  const path: number[] = [];
  for (let i = 0; i < rows; i++) {
    path.push(Math.random() > 0.5 ? 1 : -1);
  }
  return path;
}

export function pathToBucket(path: number[]): number {
  return path.filter((p) => p === 1).length;
}

export function formatMultiplier(value: number): string {
  if (value >= 1000 && value % 1000 === 0) return `${value / 1000}k×`;
  if (value >= 100) return `${Math.round(value)}×`;
  if (value >= 10) return `${value % 1 === 0 ? value : value.toFixed(1)}×`;
  if (value >= 1) return `${value % 1 === 0 ? value : value.toFixed(1)}×`;
  return `${value}×`;
}
