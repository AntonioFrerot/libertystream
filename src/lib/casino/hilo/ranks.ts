import type { Rank } from "@/lib/casino/blackjack/types";
import type { HiloGuess, HiloOption } from "./types";

/** A=1 (bas) … K=13 (haut) — modèle Stake/Gamba pour les probabilités. */
export const HILO_RTP = 0.99;

export const RANK_VALUE: Record<Rank, number> = {
  A: 1,
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  "10": 10,
  J: 11,
  Q: 12,
  K: 13,
};

export function roundHiloMultiplier(value: number): number {
  return Math.floor(value * 10000) / 10000;
}

export function getGuessProbability(guess: HiloGuess, rank: Rank): number {
  const value = RANK_VALUE[rank];
  // Modèle Stake/Gamba : égalité = gain, mais la proba affichée plafonne à 12/13
  // (sur As « plus haut » ou Roi « plus bas », toutes les cartes ne comptent pas à 100 %).
  if (guess === "higher") {
    return Math.min((13 - value + 1) / 13, 12 / 13);
  }
  return Math.min(value / 13, 12 / 13);
}

export function getStepMultiplier(guess: HiloGuess, rank: Rank): number {
  const probability = getGuessProbability(guess, rank);
  if (probability <= 0) return 0;
  return roundHiloMultiplier(HILO_RTP / probability);
}

export function isGuessWin(guess: HiloGuess, current: Rank, next: Rank): boolean {
  const currentValue = RANK_VALUE[current];
  const nextValue = RANK_VALUE[next];
  if (guess === "higher") return nextValue >= currentValue;
  return nextValue <= currentValue;
}

export function getHiloOptions(rank: Rank): HiloOption[] {
  return (["higher", "lower"] as const).map((guess) => ({
    guess,
    probability: getGuessProbability(guess, rank),
    stepMultiplier: getStepMultiplier(guess, rank),
  }));
}

export function formatProbability(probability: number): string {
  return `${(probability * 100).toFixed(1)}%`;
}
