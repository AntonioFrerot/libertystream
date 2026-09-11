import type { Card } from "@/lib/casino/blackjack/types";
import { roundLiberty } from "@/lib/wallet/types";
import { drawRandomCard } from "./deck";
import { getStepMultiplier, getHiloOptions, isGuessWin, roundHiloMultiplier } from "./ranks";
import type { HiloGuess, HiloState } from "./types";

export function createInitialHiloState(): HiloState {
  return {
    phase: "betting",
    bet: 0,
    currentCard: null,
    historySteps: [],
    historyGuesses: [],
    cumulativeMultiplier: 1,
    winStreak: 0,
    roundOutcome: null,
  };
}

export function startHiloRound(bet: number, startingCard: Card | null = null): HiloState {
  return {
    phase: "playing",
    bet,
    currentCard: startingCard ?? drawRandomCard(),
    historySteps: [],
    historyGuesses: [],
    cumulativeMultiplier: 1,
    winStreak: 0,
    roundOutcome: null,
  };
}

export function skipHiloCard(state: HiloState): HiloState {
  if (state.phase !== "playing" || !state.currentCard) return state;

  const leavingStep =
    state.winStreak === 0
      ? { card: state.currentCard, kind: "start" as const }
      : {
          card: state.currentCard,
          kind: "multiplier" as const,
          multiplier: state.cumulativeMultiplier,
        };

  return {
    ...state,
    currentCard: drawRandomCard(),
    historySteps: [...state.historySteps, leavingStep],
    historyGuesses: [...state.historyGuesses, "skip"],
  };
}

export interface HiloGuessResult {
  state: HiloState;
  won: boolean;
  nextCard: Card;
  stepMultiplier: number;
}

export function applyHiloGuess(state: HiloState, guess: HiloGuess): HiloGuessResult {
  if (state.phase !== "playing" || !state.currentCard) {
    throw new Error("Invalid hilo guess state");
  }

  const nextCard = drawRandomCard();
  const stepMultiplier = getStepMultiplier(guess, state.currentCard.rank);
  const won = isGuessWin(guess, state.currentCard.rank, nextCard.rank);
  const leavingStep =
    state.winStreak === 0
      ? { card: state.currentCard, kind: "start" as const }
      : {
          card: state.currentCard,
          kind: "multiplier" as const,
          multiplier: state.cumulativeMultiplier,
        };

  if (!won) {
    return {
      won: false,
      nextCard,
      stepMultiplier,
      state: {
        ...state,
        phase: "finished",
        currentCard: nextCard,
        historySteps: [...state.historySteps, leavingStep],
        historyGuesses: [...state.historyGuesses, guess],
        roundOutcome: "lost",
      },
    };
  }

  const cumulativeMultiplier = roundHiloMultiplier(state.cumulativeMultiplier * stepMultiplier);

  return {
    won: true,
    nextCard,
    stepMultiplier,
    state: {
      ...state,
      currentCard: nextCard,
      historySteps: [...state.historySteps, leavingStep],
      historyGuesses: [...state.historyGuesses, guess],
      cumulativeMultiplier,
      winStreak: state.winStreak + 1,
    },
  };
}

export function getHiloPayout(state: HiloState): number {
  if (state.winStreak === 0) return 0;
  return roundLiberty(state.bet * state.cumulativeMultiplier);
}

export function getHiloMissedPayout(state: HiloState): number {
  if (state.roundOutcome !== "lost") return 0;
  return getHiloPayout(state);
}

export function getHiloDisplayMultiplier(state: HiloState): number {
  if (state.winStreak === 0) return 0;
  return state.cumulativeMultiplier;
}

export function getHiloProfit(state: HiloState): number {
  if (state.winStreak === 0) return 0;
  return roundLiberty(getHiloPayout(state) - state.bet);
}

/** Meilleur multiplicateur cumulé possible au prochain coup (plus haut / plus bas). */
export function getHiloNextCumulativeMultiplier(state: HiloState): number | null {
  const byGuess = getHiloNextMultipliersByGuess(state);
  if (!byGuess) return null;

  return Math.max(byGuess.higher ?? 0, byGuess.lower ?? 0);
}

/** Multiplicateurs cumulés possibles au prochain coup pour chaque direction. */
export function getHiloNextMultipliersByGuess(
  state: HiloState,
): { higher: number; lower: number } | null {
  if (state.phase !== "playing" || !state.currentCard) return null;

  const options = getHiloOptions(state.currentCard.rank);
  if (options.length === 0) return null;

  const higher = options.find((option) => option.guess === "higher");
  const lower = options.find((option) => option.guess === "lower");
  if (!higher || !lower) return null;

  return {
    higher: roundHiloMultiplier(state.cumulativeMultiplier * higher.stepMultiplier),
    lower: roundHiloMultiplier(state.cumulativeMultiplier * lower.stepMultiplier),
  };
}

export function getHiloNextPayout(state: HiloState): number | null {
  const nextMultiplier = getHiloNextCumulativeMultiplier(state);
  if (nextMultiplier == null) return null;
  return roundLiberty(state.bet * nextMultiplier);
}
