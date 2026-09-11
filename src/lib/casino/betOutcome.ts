import { roundLiberty } from "@/lib/wallet/types";

/** Profit net = remboursement − mise (0 = égalité, >0 = gain, <0 = perte). */
export function computeBetNet(payout: number, bet: number): number {
  return roundLiberty(payout - bet);
}

export type BetOutcome = "win" | "breakEven" | "loss";

export function getBetOutcome(net: number): BetOutcome {
  if (net > 0) return "win";
  if (net === 0) return "breakEven";
  return "loss";
}

export function formatBetLossAmount(net: number): number {
  return Math.abs(net);
}
