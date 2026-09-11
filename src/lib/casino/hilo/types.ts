import type { Card } from "@/lib/casino/blackjack/types";

export type HiloPhase = "betting" | "playing" | "finished";

export type HiloRoundOutcome = "won" | "lost";

export type HiloGuess = "higher" | "lower";

export type HiloHistoryAction = HiloGuess | "skip";

export interface HiloHistoryStep {
  card: Card;
  kind: "start" | "multiplier" | "loss" | "current";
  multiplier?: number;
}

export interface HiloState {
  phase: HiloPhase;
  bet: number;
  currentCard: Card | null;
  historySteps: HiloHistoryStep[];
  historyGuesses: HiloHistoryAction[];
  cumulativeMultiplier: number;
  winStreak: number;
  roundOutcome: HiloRoundOutcome | null;
}

export interface HiloOption {
  guess: HiloGuess;
  probability: number;
  stepMultiplier: number;
}

export interface HiloTimelineItem {
  step: HiloHistoryStep;
  guessAfter?: HiloHistoryAction;
}

/** Historique passé + carte active en fin de bandeau (sans multiplicateur). */
export function buildHiloTimeline(state: HiloState): HiloTimelineItem[] {
  const items: HiloTimelineItem[] = state.historySteps.map((step, index) => ({
    step,
    guessAfter: state.historyGuesses[index],
  }));

  if (state.phase !== "betting" && state.currentCard) {
    items.push({
      step:
        state.roundOutcome === "lost"
          ? { card: state.currentCard, kind: "loss" }
          : state.winStreak > 0
            ? {
                card: state.currentCard,
                kind: "multiplier",
                multiplier: state.cumulativeMultiplier,
              }
            : { card: state.currentCard, kind: "current" },
    });
  }

  return items;
}
