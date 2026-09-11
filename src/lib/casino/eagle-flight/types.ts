export type EagleFlightPhase = "betting" | "flying" | "crashed" | "finished";

export type EagleFlightRoundOutcome = "won" | "lost";

export interface EagleFlightState {
  phase: EagleFlightPhase;
  bet: number;
  /** Multiplicateur de crash prédéterminé pour la manche. */
  crashPoint: number;
  currentMultiplier: number;
  roundOutcome: EagleFlightRoundOutcome | null;
  flightStartedAt: number | null;
}
