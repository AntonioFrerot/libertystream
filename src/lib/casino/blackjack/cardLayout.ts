import type { Rank } from "./types";

export interface PipPosition {
  x: number;
  y: number;
  inverted?: boolean;
}

/** Positions en % pour le corps de la carte (entre les coins) */
export const PIP_LAYOUTS: Partial<Record<Rank, PipPosition[]>> = {
  "2": [
    { x: 50, y: 24 },
    { x: 50, y: 76, inverted: true },
  ],
  "3": [
    { x: 50, y: 20 },
    { x: 50, y: 50 },
    { x: 50, y: 80, inverted: true },
  ],
  "4": [
    { x: 34, y: 24 },
    { x: 66, y: 24 },
    { x: 34, y: 76, inverted: true },
    { x: 66, y: 76, inverted: true },
  ],
  "5": [
    { x: 34, y: 22 },
    { x: 66, y: 22 },
    { x: 50, y: 50 },
    { x: 34, y: 78, inverted: true },
    { x: 66, y: 78, inverted: true },
  ],
  "6": [
    { x: 34, y: 22 },
    { x: 66, y: 22 },
    { x: 34, y: 50 },
    { x: 66, y: 50 },
    { x: 34, y: 78, inverted: true },
    { x: 66, y: 78, inverted: true },
  ],
  "7": [
    { x: 34, y: 20 },
    { x: 66, y: 20 },
    { x: 50, y: 38 },
    { x: 34, y: 56 },
    { x: 66, y: 56 },
    { x: 34, y: 80, inverted: true },
    { x: 66, y: 80, inverted: true },
  ],
  "8": [
    { x: 34, y: 20 },
    { x: 66, y: 20 },
    { x: 34, y: 42 },
    { x: 66, y: 42 },
    { x: 34, y: 64, inverted: true },
    { x: 66, y: 64, inverted: true },
    { x: 34, y: 84, inverted: true },
    { x: 66, y: 84, inverted: true },
  ],
  "9": [
    { x: 34, y: 18 },
    { x: 66, y: 18 },
    { x: 34, y: 40 },
    { x: 66, y: 40 },
    { x: 50, y: 50 },
    { x: 34, y: 60, inverted: true },
    { x: 66, y: 60, inverted: true },
    { x: 34, y: 82, inverted: true },
    { x: 66, y: 82, inverted: true },
  ],
  "10": [
    { x: 34, y: 16 },
    { x: 66, y: 16 },
    { x: 50, y: 30 },
    { x: 34, y: 42 },
    { x: 66, y: 42 },
    { x: 34, y: 58, inverted: true },
    { x: 66, y: 58, inverted: true },
    { x: 50, y: 70, inverted: true },
    { x: 34, y: 84, inverted: true },
    { x: 66, y: 84, inverted: true },
  ],
};

export function isFaceRank(rank: Rank): boolean {
  return rank === "J" || rank === "Q" || rank === "K";
}

export function displayRank(rank: Rank): string {
  return rank;
}
