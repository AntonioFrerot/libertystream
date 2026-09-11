import { roundLiberty } from "@/lib/wallet/types";
import { clampEagleFlightMultiplier, eagleFlightMaxWin, multiplierAtElapsed } from "./config";
import type { EagleFlightState } from "./types";

export function createInitialEagleFlightState(): EagleFlightState {
  return {
    phase: "betting",
    bet: 0,
    crashPoint: 1,
    currentMultiplier: 1,
    roundOutcome: null,
    flightStartedAt: null,
  };
}

export function startEagleFlightRound(bet: number, crashPoint: number): EagleFlightState {
  return {
    phase: "flying",
    bet,
    crashPoint,
    currentMultiplier: 1,
    roundOutcome: null,
    flightStartedAt: Date.now(),
  };
}

export function updateEagleFlightMultiplier(
  state: EagleFlightState,
  now = Date.now(),
): EagleFlightState {
  if (state.phase !== "flying" || state.flightStartedAt === null) return state;

  const elapsed = now - state.flightStartedAt;
  const currentMultiplier = clampEagleFlightMultiplier(multiplierAtElapsed(elapsed));
  const maxWin = eagleFlightMaxWin();

  if (currentMultiplier >= maxWin) {
    return {
      ...state,
      currentMultiplier: maxWin,
      phase: "finished",
      roundOutcome: "won",
    };
  }

  if (currentMultiplier >= state.crashPoint) {
    return {
      ...state,
      currentMultiplier: state.crashPoint,
      phase: "crashed",
    };
  }

  return {
    ...state,
    currentMultiplier,
  };
}

export function cashOutEagleFlight(state: EagleFlightState): EagleFlightState {
  if (state.phase !== "flying") {
    throw new Error("Invalid eagle flight cash out state");
  }

  return {
    ...state,
    currentMultiplier: clampEagleFlightMultiplier(state.currentMultiplier),
    phase: "finished",
    roundOutcome: "won",
  };
}

export function finishEagleFlightCrash(state: EagleFlightState): EagleFlightState {
  return {
    ...state,
    phase: "finished",
    roundOutcome: "lost",
  };
}

export function getEagleFlightPayout(state: EagleFlightState): number {
  if (state.phase !== "finished" || state.roundOutcome !== "won") return 0;
  return roundLiberty(state.bet * state.currentMultiplier);
}

export function getEagleFlightMissedPayout(state: EagleFlightState): number {
  const lost = state.roundOutcome === "lost" || state.phase === "crashed";
  if (!lost) return 0;
  if (state.currentMultiplier <= 1) return 0;
  return roundLiberty(state.bet * state.currentMultiplier);
}

export function getEagleFlightProfit(state: EagleFlightState): number {
  const payout = getEagleFlightPayout(state);
  if (payout <= 0) return 0;
  return roundLiberty(payout - state.bet);
}

export function getEagleFlightDisplayMultiplier(state: EagleFlightState): number {
  if (state.phase === "betting") return 1;
  return state.currentMultiplier;
}
