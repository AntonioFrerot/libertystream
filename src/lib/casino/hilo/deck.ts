import { createCard } from "@/lib/casino/blackjack/deck";
import type { Card, Rank, Suit } from "@/lib/casino/blackjack/types";

const SUITS: Suit[] = ["hearts", "diamonds", "clubs", "spades"];
const RANKS: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

/** Tirage uniforme sur un paquet infini (modèle Stake/Gamba). */
export function drawRandomCard(): Card {
  const suit = SUITS[Math.floor(Math.random() * SUITS.length)]!;
  const rank = RANKS[Math.floor(Math.random() * RANKS.length)]!;
  return createCard(suit, rank);
}
