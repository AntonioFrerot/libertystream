import { roundLiberty } from "@/lib/wallet/types";
import { computeBetNet, formatBetLossAmount } from "@/lib/casino/betOutcome";

export interface GameProfitDisplayAmounts {
  zeroAmount: string;
  liveAmount: string;
  winAmount: string;
  lossAmount: string;
}

export function buildGameProfitDisplayAmounts(
  formatLiberty: (amount: number) => string,
  bet: number,
  liveProfit: number,
  winProfit: number,
): GameProfitDisplayAmounts {
  const zeroAmount = formatLiberty(0);
  return {
    zeroAmount,
    liveAmount: formatLiberty(Math.max(0, roundLiberty(liveProfit))),
    winAmount: formatLiberty(winProfit),
    lossAmount: formatLiberty(formatBetLossAmount(computeBetNet(0, bet))),
  };
}

export function resolveSettledWinProfit(
  finished: boolean,
  roundOutcome: "won" | "lost" | null | undefined,
  profit: number,
): number {
  if (!finished || roundOutcome !== "won") return 0;
  return roundLiberty(profit);
}

export function formatStatMultiplier(
  multiplier: number,
  roundOutcome: "won" | "lost" | null | undefined,
  format: (value: number) => string,
): string {
  if (roundOutcome === "lost") return format(0);
  return format(multiplier);
}

export interface GamePayoutDisplayAmounts {
  gainAmount: string;
  potentialAmount: string;
}

/** Montants affichés pour la ligne Gain / Gain potentiel. */
export function buildGamePayoutDisplayAmounts(
  formatLiberty: (amount: number) => string,
  roundOutcome: "won" | "lost" | null | undefined,
  livePayout: number,
  missedPayoutOnLoss: number,
): GamePayoutDisplayAmounts {
  return {
    gainAmount: formatLiberty(livePayout),
    potentialAmount: formatLiberty(roundOutcome === "lost" ? missedPayoutOnLoss : livePayout),
  };
}
