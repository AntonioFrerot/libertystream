/** Timings & easing — distribution fluide, rythme accéléré (+20 % vs base). */
export const CARD_DEAL_MS = 350;
export const CARD_HIT_MS = 300;
export const CARD_SETTLE_MS = 133;
export const CARD_REVEAL_MS = 433;
export const DEALER_STEP_MS = 483;

export const CARD_DEAL_DURATION = 0.32;
export const CARD_HIT_DURATION = 0.27;
export const CARD_FLIP_DURATION = 0.35;
export const CARD_REVEAL_DURATION = 0.42;
export const DEAL_EASE = [0.22, 1, 0.32, 1] as const;
export const FLIP_EASE = [0.4, 0, 0.2, 1] as const;

export type CardDealVariant =
  | "deal-player"
  | "deal-dealer-up"
  | "deal-dealer-down"
  | "hit-player"
  | "hit-dealer";

export function initialDealVariant(
  target: "player" | "dealer",
  dealerCardCount: number
): CardDealVariant {
  if (target === "player") return "deal-player";
  return dealerCardCount === 0 ? "deal-dealer-up" : "deal-dealer-down";
}
