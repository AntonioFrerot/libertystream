import type { Card, Rank, Suit } from "./types";

const SUITS: Suit[] = ["hearts", "diamonds", "clubs", "spades"];
const RANKS: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const DECK_COUNT = 8;
const RESHUFFLE_THRESHOLD = 52;

let cardCounter = 0;

function createCardId() {
  cardCounter += 1;
  return `card-${Date.now()}-${cardCounter}`;
}

export function createCard(suit: Suit, rank: Rank): Card {
  return { id: createCardId(), suit, rank };
}

export function createShoe(): Card[] {
  const shoe: Card[] = [];
  for (let d = 0; d < DECK_COUNT; d++) {
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        shoe.push(createCard(suit, rank));
      }
    }
  }
  return shuffle(shoe);
}

export function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function drawCard(shoe: Card[]): [Card, Card[]] {
  if (shoe.length <= RESHUFFLE_THRESHOLD) {
    const fresh = createShoe();
    const card = fresh.pop()!;
    return [card, fresh];
  }
  const nextShoe = [...shoe];
  const card = nextShoe.pop()!;
  return [card, nextShoe];
}

export function drawCards(shoe: Card[], count: number): [Card[], Card[]] {
  let currentShoe = shoe;
  const drawn: Card[] = [];
  for (let i = 0; i < count; i++) {
    const [card, nextShoe] = drawCard(currentShoe);
    drawn.push(card);
    currentShoe = nextShoe;
  }
  return [drawn, currentShoe];
}
