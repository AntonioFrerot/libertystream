"use client";

import { LibertyAmountValue } from "@/components/wallet/LibertyAmountValue";

export type GameProfitStatVariant = "mines" | "hilo" | "chicken-road";

interface GameProfitStatRowProps {
  label: string;
  zeroAmount: string;
  liveAmount: string;
  winAmount: string;
  lossAmount: string;
  inRound: boolean;
  roundOutcome?: "won" | "lost" | null;
  /** Manche en cours mais résultat pas encore affiché (ex. animation crash). */
  pending?: boolean;
  variant?: GameProfitStatVariant;
}

export function GameProfitStatRow({
  label,
  zeroAmount,
  liveAmount,
  winAmount,
  lossAmount,
  inRound,
  roundOutcome = null,
  pending = false,
  variant = "mines",
}: GameProfitStatRowProps) {
  const roundSettled = !inRound && !pending && roundOutcome != null;
  const roundLost = roundOutcome === "lost";
  const roundWon = roundSettled && roundOutcome === "won";
  const displayAmount = roundLost ? null : roundWon ? winAmount : liveAmount;

  const rowClass = [
    `${variant}-stat-row`,
    roundLost ? `${variant}-stat-loss` : `${variant}-stat-profit`,
  ].join(" ");

  return (
    <div className={rowClass}>
      <span>{label}</span>
      {roundLost ? (
        <LibertyAmountValue amount={lossAmount} negative />
      ) : (
        <LibertyAmountValue amount={displayAmount ?? zeroAmount} />
      )}
    </div>
  );
}
