import { roundLiberty } from "@/lib/wallet/types";
import { getMinesMultiplier, MINES_GRID_SIZE, MINES_MAX_COUNT, MINES_MIN_COUNT } from "./config";
import type { MinesState } from "./types";

export function createInitialMinesState(mineCount = 3): MinesState {
  return {
    phase: "betting",
    bet: 0,
    mineCount,
    minePositions: [],
    revealedTiles: [],
    cumulativeMultiplier: 1,
    roundOutcome: null,
  };
}

function shuffleMinePositions(mineCount: number): number[] {
  const indices = Array.from({ length: MINES_GRID_SIZE }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices.slice(0, mineCount).sort((a, b) => a - b);
}

export function startMinesRound(bet: number, mineCount: number): MinesState {
  const clamped = Math.min(MINES_MAX_COUNT, Math.max(MINES_MIN_COUNT, mineCount));
  return {
    phase: "playing",
    bet,
    mineCount: clamped,
    minePositions: shuffleMinePositions(clamped),
    revealedTiles: [],
    cumulativeMultiplier: 1,
    roundOutcome: null,
  };
}

export interface RevealResult {
  state: MinesState;
  hitMine: boolean;
  clearedBoard: boolean;
}

export function revealMinesTile(state: MinesState, tileIndex: number): RevealResult {
  if (state.phase !== "playing") {
    throw new Error("Invalid mines reveal state");
  }
  if (tileIndex < 0 || tileIndex >= MINES_GRID_SIZE) {
    throw new Error("Invalid tile index");
  }
  if (state.revealedTiles.includes(tileIndex)) {
    throw new Error("Tile already revealed");
  }

  const hitMine = state.minePositions.includes(tileIndex);

  if (hitMine) {
    return {
      hitMine: true,
      clearedBoard: false,
      state: {
        ...state,
        revealedTiles: [...state.revealedTiles, tileIndex],
        phase: "finished",
        roundOutcome: "lost",
      },
    };
  }

  const revealedTiles = [...state.revealedTiles, tileIndex];
  const gems = revealedTiles.length;
  const cumulativeMultiplier = getMinesMultiplier(state.mineCount, gems);
  const maxGems = MINES_GRID_SIZE - state.mineCount;
  const clearedBoard = gems >= maxGems;

  return {
    hitMine: false,
    clearedBoard,
    state: {
      ...state,
      revealedTiles,
      cumulativeMultiplier,
      ...(clearedBoard
        ? { phase: "finished" as const, roundOutcome: "won" as const }
        : {}),
    },
  };
}

export function getMinesGemsFound(state: MinesState): number {
  return state.revealedTiles.filter((i) => !state.minePositions.includes(i)).length;
}

export function getMinesPayout(state: MinesState): number {
  if (getMinesGemsFound(state) === 0) return 0;
  return roundLiberty(state.bet * state.cumulativeMultiplier);
}

export function getMinesMissedPayout(state: MinesState): number {
  if (state.roundOutcome !== "lost") return 0;
  return getMinesPayout(state);
}

export function getMinesDisplayMultiplier(state: MinesState): number {
  if (getMinesGemsFound(state) === 0) return 0;
  return state.cumulativeMultiplier;
}

export function getMinesProfit(state: MinesState): number {
  if (getMinesGemsFound(state) === 0) return 0;
  return roundLiberty(getMinesPayout(state) - state.bet);
}

export function isMineAt(state: MinesState, tileIndex: number): boolean {
  return state.minePositions.includes(tileIndex);
}

export function pickRandomHiddenTile(state: MinesState): number | null {
  const hidden = Array.from({ length: MINES_GRID_SIZE }, (_, index) => index).filter(
    (index) => !state.revealedTiles.includes(index),
  );
  if (hidden.length === 0) return null;
  return hidden[Math.floor(Math.random() * hidden.length)] ?? null;
}
