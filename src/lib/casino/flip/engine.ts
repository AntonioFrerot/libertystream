import { roundLiberty } from "@/lib/wallet/types";
import { FLIP_MAX_STREAK, getFlipMultiplier } from "./config";
import type { CoinSide, FlipHistoryEntry, FlipState } from "./types";

export function createInitialFlipState(): FlipState {
  return {
    phase: "betting",
    bet: 0,
    streak: 0,
    cumulativeMultiplier: 1,
    history: [],
    roundOutcome: null,
  };
}

export function startFlipRound(bet: number): FlipState {
  return {
    phase: "playing",
    bet,
    streak: 0,
    cumulativeMultiplier: 1,
    history: [],
    roundOutcome: null,
  };
}

export function rollCoin(): CoinSide {
  return Math.random() < 0.5 ? "eagle" : "snake";
}

export function pickRandomSide(): CoinSide {
  return rollCoin();
}

export interface FlipResult {
  state: FlipState;
  result: CoinSide;
  won: boolean;
  entry: FlipHistoryEntry;
}

export function applyFlip(state: FlipState, chosenSide: CoinSide): FlipResult {
  if (state.phase !== "playing") {
    throw new Error("Invalid flip state");
  }

  const result = rollCoin();
  const won = result === chosenSide;
  const entry: FlipHistoryEntry = { chosen: chosenSide, result, won };

  if (!won) {
    return {
      won: false,
      result,
      entry,
      state: {
        ...state,
        history: [...state.history, entry],
        phase: "finished",
        roundOutcome: "lost",
      },
    };
  }

  const streak = state.streak + 1;
  const cumulativeMultiplier = getFlipMultiplier(streak);
  const maxReached = streak >= FLIP_MAX_STREAK;

  return {
    won: true,
    result,
    entry,
    state: {
      ...state,
      streak,
      cumulativeMultiplier,
      history: [...state.history, entry],
      ...(maxReached ? { phase: "finished" as const, roundOutcome: "won" as const } : {}),
    },
  };
}

/** Mode auto : un flip = gain ou perte immédiat (pas de série progressive). */
export function applyAutoFlip(state: FlipState, chosenSide: CoinSide): FlipResult {
  if (state.phase !== "playing") {
    throw new Error("Invalid flip state");
  }

  const result = rollCoin();
  const won = result === chosenSide;
  const entry: FlipHistoryEntry = { chosen: chosenSide, result, won };

  if (!won) {
    return {
      won: false,
      result,
      entry,
      state: {
        ...state,
        history: [...state.history, entry],
        phase: "finished",
        roundOutcome: "lost",
      },
    };
  }

  return {
    won: true,
    result,
    entry,
    state: {
      ...state,
      streak: 1,
      cumulativeMultiplier: getFlipMultiplier(1),
      history: [...state.history, entry],
      phase: "finished",
      roundOutcome: "won",
    },
  };
}

export function getFlipPayout(state: FlipState): number {
  if (state.streak === 0) return 0;
  return roundLiberty(state.bet * state.cumulativeMultiplier);
}

export function getFlipMissedPayout(state: FlipState): number {
  if (state.roundOutcome !== "lost") return 0;
  return getFlipPayout(state);
}

export function getFlipDisplayMultiplier(state: FlipState): number {
  if (state.streak === 0) return 0;
  return state.cumulativeMultiplier;
}

export function getFlipProfit(state: FlipState): number {
  if (state.streak === 0) return 0;
  return roundLiberty(getFlipPayout(state) - state.bet);
}
