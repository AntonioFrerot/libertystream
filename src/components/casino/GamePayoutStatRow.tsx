"use client";

import { LibertyAmountValue } from "@/components/wallet/LibertyAmountValue";
import type { GameProfitStatVariant } from "@/components/casino/GameProfitStatRow";

interface GamePayoutStatRowProps {
  gainLabel: string;
  potentialPayoutLabel: string;
  gainAmount: string;
  potentialAmount: string;
  roundOutcome?: "won" | "lost" | null;
  variant?: GameProfitStatVariant;
  rowClassName?: string;
}

export function GamePayoutStatRow({
  gainLabel,
  potentialPayoutLabel,
  gainAmount,
  potentialAmount,
  roundOutcome = null,
  variant = "mines",
  rowClassName = "",
}: GamePayoutStatRowProps) {
  const roundLost = roundOutcome === "lost";

  const rowClass = [`${variant}-stat-row`, rowClassName].filter(Boolean).join(" ");

  return (
    <div className={rowClass}>
      <span>{roundLost ? potentialPayoutLabel : gainLabel}</span>
      <LibertyAmountValue amount={roundLost ? potentialAmount : gainAmount} />
    </div>
  );
}
