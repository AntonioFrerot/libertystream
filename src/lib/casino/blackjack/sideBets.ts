import { isRedSuit } from "./hand";
import type {
  Card,
  PerfectPairTier,
  Rank,
  SideBetSpotResult,
  TwentyOnePlusThreeTier,
} from "./types";

export type { PerfectPairTier, SideBetSpotResult, TwentyOnePlusThreeTier } from "./types";

const PERFECT_PAIR_ODDS: Record<Exclude<PerfectPairTier, "none">, number> = {
  mixed: 6,
  colored: 12,
  perfect: 25,
};

const TWENTY_ONE_PLUS_THREE_ODDS: Record<Exclude<TwentyOnePlusThreeTier, "none">, number> = {
  flush: 5,
  straight: 10,
  three_kind: 30,
  straight_flush: 40,
  suited_trips: 100,
};

function straightRankValues(rank: Rank): number[] {
  if (rank === "A") return [1, 14];
  if (rank === "J") return [11];
  if (rank === "Q") return [12];
  if (rank === "K") return [13];
  return [Number(rank)];
}

function isStraightThree(cards: Card[]): boolean {
  const valueLists = cards.map((card) => straightRankValues(card.rank));

  for (const a of valueLists[0]!) {
    for (const b of valueLists[1]!) {
      for (const c of valueLists[2]!) {
        const sorted = [a, b, c].sort((left, right) => left - right);
        if (sorted[1] === sorted[0] + 1 && sorted[2] === sorted[1] + 1) {
          return true;
        }
      }
    }
  }

  return false;
}

function isFlushThree(cards: Card[]): boolean {
  return cards.every((card) => card.suit === cards[0]!.suit);
}

export function evaluatePerfectPairs(cardA: Card, cardB: Card): PerfectPairTier {
  if (cardA.rank !== cardB.rank) return "none";
  if (cardA.suit === cardB.suit) return "perfect";

  const sameColor = isRedSuit(cardA.suit) === isRedSuit(cardB.suit);
  return sameColor ? "colored" : "mixed";
}

export function evaluateTwentyOnePlusThree(
  playerCards: Card[],
  dealerUpcard: Card | undefined,
): TwentyOnePlusThreeTier {
  if (playerCards.length < 2 || !dealerUpcard) return "none";

  const cards = [playerCards[0]!, playerCards[1]!, dealerUpcard];
  const sameRank = cards.every((card) => card.rank === cards[0]!.rank);
  const flush = isFlushThree(cards);
  const straight = isStraightThree(cards);

  if (sameRank && flush) return "suited_trips";
  if (straight && flush) return "straight_flush";
  if (sameRank) return "three_kind";
  if (straight) return "straight";
  if (flush) return "flush";
  return "none";
}

function sideBetReturn(bet: number, odds: number): number {
  if (bet <= 0) return 0;
  return bet * (odds + 1);
}

export function resolveSideBetSpot(
  handIndex: number,
  playerCards: Card[],
  dealerUpcard: Card | undefined,
  perfectPairsBet: number,
  twentyOnePlusThreeBet: number,
): SideBetSpotResult {
  const perfectPairsTier =
    playerCards.length >= 2 && perfectPairsBet > 0
      ? evaluatePerfectPairs(playerCards[0]!, playerCards[1]!)
      : "none";

  const twentyOnePlusThreeTier =
    twentyOnePlusThreeBet > 0
      ? evaluateTwentyOnePlusThree(playerCards, dealerUpcard)
      : "none";

  return {
    handIndex,
    perfectPairsBet,
    perfectPairsTier,
    perfectPairsPayout:
      perfectPairsTier === "none"
        ? 0
        : sideBetReturn(perfectPairsBet, PERFECT_PAIR_ODDS[perfectPairsTier]),
    twentyOnePlusThreeBet,
    twentyOnePlusThreeTier,
    twentyOnePlusThreePayout:
      twentyOnePlusThreeTier === "none"
        ? 0
        : sideBetReturn(twentyOnePlusThreeBet, TWENTY_ONE_PLUS_THREE_ODDS[twentyOnePlusThreeTier]),
  };
}

export function resolveAllSideBets(
  playerHands: { cards: Card[] }[],
  dealerUpcard: Card | undefined,
  perfectPairsBetPerHand: number,
  twentyOnePlusThreeBetPerHand: number,
): SideBetSpotResult[] {
  return playerHands.map((hand, handIndex) =>
    resolveSideBetSpot(
      handIndex,
      hand.cards,
      dealerUpcard,
      perfectPairsBetPerHand,
      twentyOnePlusThreeBetPerHand,
    ),
  );
}
