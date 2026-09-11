export type CoinSide = "eagle" | "snake";

export type FlipPhase = "betting" | "playing" | "finished";

export type FlipRoundOutcome = "won" | "lost" | null;

export interface FlipHistoryEntry {
  chosen: CoinSide;
  result: CoinSide;
  won: boolean;
}

export interface FlipState {
  phase: FlipPhase;
  bet: number;
  streak: number;
  cumulativeMultiplier: number;
  history: FlipHistoryEntry[];
  roundOutcome: FlipRoundOutcome;
}
