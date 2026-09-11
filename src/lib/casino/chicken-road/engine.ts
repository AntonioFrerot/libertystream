import { roundLiberty } from "@/lib/wallet/types";
import { DIFFICULTY_CONFIG, getMultiplierForStep } from "./config";
import type { ChickenRoadDifficulty, ChickenRoadState } from "./types";

export function createInitialChickenRoadState(
  difficulty: ChickenRoadDifficulty = "easy",
): ChickenRoadState {
  return {
    phase: "betting",
    bet: 0,
    difficulty,
    currentStep: 0,
    cumulativeMultiplier: 1,
    fatalStep: null,
    roundOutcome: null,
  };
}

/** Détermine la première voie mortelle au début de la manche. */
export function rollFatalStep(difficulty: ChickenRoadDifficulty): number | null {
  const { maxSteps, crashChance } = DIFFICULTY_CONFIG[difficulty];
  for (let step = 1; step <= maxSteps; step++) {
    if (Math.random() < crashChance) return step;
  }
  return null;
}

export function startChickenRoadRound(
  bet: number,
  difficulty: ChickenRoadDifficulty,
): ChickenRoadState {
  return {
    phase: "playing",
    bet,
    difficulty,
    currentStep: 0,
    cumulativeMultiplier: 1,
    fatalStep: rollFatalStep(difficulty),
    roundOutcome: null,
  };
}

export interface AdvanceResult {
  state: ChickenRoadState;
  crashed: boolean;
  reachedMax: boolean;
}

export function advanceChickenRoad(state: ChickenRoadState): AdvanceResult {
  if (state.phase !== "playing") {
    throw new Error("Invalid chicken road advance state");
  }

  const { maxSteps } = DIFFICULTY_CONFIG[state.difficulty];
  const nextStep = state.currentStep + 1;

  if (nextStep > maxSteps) {
    const multiplier = getMultiplierForStep(state.difficulty, maxSteps);
    return {
      crashed: false,
      reachedMax: true,
      state: {
        ...state,
        currentStep: maxSteps,
        cumulativeMultiplier: multiplier,
      },
    };
  }

  const multiplier = getMultiplierForStep(state.difficulty, nextStep);
  const crashed = state.fatalStep !== null && nextStep >= state.fatalStep;

  if (crashed) {
    return {
      crashed: true,
      reachedMax: false,
      state: {
        ...state,
        currentStep: nextStep,
        cumulativeMultiplier: multiplier,
        phase: "finished",
        roundOutcome: "lost",
      },
    };
  }

  return {
    crashed: false,
    reachedMax: nextStep >= maxSteps,
    state: {
      ...state,
      currentStep: nextStep,
      cumulativeMultiplier: multiplier,
    },
  };
}

export function getChickenRoadPayout(state: ChickenRoadState): number {
  if (state.currentStep === 0) return 0;
  return roundLiberty(state.bet * state.cumulativeMultiplier);
}

export function getChickenRoadMissedPayout(state: ChickenRoadState): number {
  if (state.roundOutcome !== "lost") return 0;
  const securedStep = state.currentStep - 1;
  if (securedStep <= 0) return 0;
  return roundLiberty(state.bet * getMultiplierForStep(state.difficulty, securedStep));
}

export function getChickenRoadDisplayMultiplier(state: ChickenRoadState): number {
  if (state.currentStep === 0) return 0;
  return state.cumulativeMultiplier;
}

export function getChickenRoadProfit(state: ChickenRoadState): number {
  if (state.currentStep === 0) return 0;
  return roundLiberty(getChickenRoadPayout(state) - state.bet);
}
