export type MinesPhase = "betting" | "playing" | "finished";

export type MinesRoundOutcome = "won" | "lost";

export type MinesTileStatus = "hidden" | "gem" | "mine";

export interface MinesState {
  phase: MinesPhase;
  bet: number;
  mineCount: number;
  /** Positions des mines (indices 0–24), fixées au début de la manche. */
  minePositions: number[];
  revealedTiles: number[];
  cumulativeMultiplier: number;
  roundOutcome: MinesRoundOutcome | null;
}
