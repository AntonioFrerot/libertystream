export type ChickenRoadDifficulty = "easy" | "medium" | "hard" | "hardcore";

export type ChickenRoadPhase = "betting" | "playing" | "finished";

export type ChickenRoadRoundOutcome = "won" | "lost";

export interface ChickenRoadState {
  phase: ChickenRoadPhase;
  bet: number;
  difficulty: ChickenRoadDifficulty;
  /** Lane actuelle (0 = trottoir de départ). */
  currentStep: number;
  cumulativeMultiplier: number;
  /** Première voie mortelle (1-indexée), null = traversée complète possible. */
  fatalStep: number | null;
  roundOutcome: ChickenRoadRoundOutcome | null;
}

export interface ChickenRoadDifficultyOption {
  id: ChickenRoadDifficulty;
  labelKey: string;
  maxSteps: number;
  crashChance: number;
}
