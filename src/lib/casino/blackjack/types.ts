export type Suit = "hearts" | "diamonds" | "clubs" | "spades";

export type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
}

export type HandOutcome =
  | "pending"
  | "playing"
  | "stand"
  | "bust"
  | "blackjack"
  | "win"
  | "lose"
  | "push";

export interface Hand {
  cards: Card[];
  bet: number;
  outcome: HandOutcome;
  isDoubled: boolean;
  isSplitHand: boolean;
}

export type PerfectPairTier = "none" | "mixed" | "colored" | "perfect";

export type TwentyOnePlusThreeTier =
  | "none"
  | "flush"
  | "straight"
  | "three_kind"
  | "straight_flush"
  | "suited_trips";

export interface SideBetSpotResult {
  handIndex: number;
  perfectPairsBet: number;
  perfectPairsTier: PerfectPairTier;
  perfectPairsPayout: number;
  twentyOnePlusThreeBet: number;
  twentyOnePlusThreeTier: TwentyOnePlusThreeTier;
  twentyOnePlusThreePayout: number;
}

export type GamePhase = "betting" | "insurance" | "playing" | "dealer" | "finished";

export type RoundResultKind = "hand" | "insurance" | "perfect_pairs" | "twenty_one_plus_three";

export interface RoundResult {
  handIndex: number;
  kind: RoundResultKind;
  payout: number;
  net: number;
  outcome: HandOutcome | "win" | "lose";
}

export interface GameState {
  phase: GamePhase;
  shoe: Card[];
  dealerCards: Card[];
  dealerHoleHidden: boolean;
  playerHands: Hand[];
  activeHandIndex: number;
  insuranceBet: number;
  totalWagered: number;
  perfectPairsBetPerHand: number;
  twentyOnePlusThreeBetPerHand: number;
  sideBetResults: SideBetSpotResult[];
}

export interface HandScore {
  total: number;
  isSoft: boolean;
  isBlackjack: boolean;
  isBust: boolean;
}
