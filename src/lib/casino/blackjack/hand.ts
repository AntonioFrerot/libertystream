import type { Card, Hand, HandScore, Rank } from "./types";

const FACE_RANKS: Rank[] = ["J", "Q", "K"];

export function rankValue(rank: Rank): number {
  if (rank === "A") return 11;
  if (FACE_RANKS.includes(rank)) return 10;
  return Number(rank);
}

export function scoreHand(cards: Card[]): HandScore {
  let total = 0;
  let aces = 0;

  for (const card of cards) {
    if (card.rank === "A") {
      aces += 1;
      total += 11;
    } else {
      total += rankValue(card.rank);
    }
  }

  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }

  const isSoft = aces > 0 && total <= 21;
  const isBlackjack = cards.length === 2 && total === 21;
  const isBust = total > 21;

  return { total, isSoft, isBlackjack, isBust };
}

export function canSplitHand(hand: Hand): boolean {
  if (hand.cards.length !== 2 || hand.isSplitHand) return false;
  return rankValue(hand.cards[0].rank) === rankValue(hand.cards[1].rank);
}

export function dealerShouldHit(cards: Card[]): boolean {
  const score = scoreHand(cards);
  if (score.total < 17) return true;
  if (score.total === 17 && score.isSoft) return false;
  return false;
}

export function compareHands(playerCards: Card[], dealerCards: Card[]): "win" | "lose" | "push" {
  const player = scoreHand(playerCards);
  const dealer = scoreHand(dealerCards);

  if (player.isBust) return "lose";
  if (dealer.isBust) return "win";
  if (player.total > dealer.total) return "win";
  if (player.total < dealer.total) return "lose";
  return "push";
}

export function formatHandScore(cards: Card[]): string {
  const { total, isSoft, isBust, isBlackjack } = scoreHand(cards);
  if (isBust) return String(total);
  if (isBlackjack) return "21";
  if (isSoft && total < 21) {
    const softTotal = total - 10;
    if (softTotal > 0 && softTotal !== total) {
      return `${softTotal}/${total}`;
    }
  }
  return String(total);
}

export function suitSymbol(suit: Card["suit"]): string {
  switch (suit) {
    case "hearts":
      return "♥";
    case "diamonds":
      return "♦";
    case "clubs":
      return "♣";
    case "spades":
      return "♠";
  }
}

export function isRedSuit(suit: Card["suit"]): boolean {
  return suit === "hearts" || suit === "diamonds";
}
