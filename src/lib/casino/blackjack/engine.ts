import { createShoe, drawCard } from "./deck";
import { canSplitHand, compareHands, dealerShouldHit, scoreHand } from "./hand";
import { resolveAllSideBets } from "./sideBets";
import type { GameState, Hand, HandOutcome, RoundResult } from "./types";

export function createInitialState(): GameState {
  return {
    phase: "betting",
    shoe: [],
    dealerCards: [],
    dealerHoleHidden: false,
    playerHands: [],
    activeHandIndex: 0,
    insuranceBet: 0,
    totalWagered: 0,
    perfectPairsBetPerHand: 0,
    twentyOnePlusThreeBetPerHand: 0,
    sideBetResults: [],
  };
}

function createHand(cards: Hand["cards"], bet: number, isSplitHand = false): Hand {
  return {
    cards,
    bet,
    outcome: "playing",
    isDoubled: false,
    isSplitHand,
  };
}

function activeHand(state: GameState): Hand | undefined {
  return state.playerHands[state.activeHandIndex];
}

function cloneState(state: GameState): GameState {
  return {
    ...state,
    shoe: [...state.shoe],
    dealerCards: [...state.dealerCards],
    playerHands: state.playerHands.map((hand) => ({
      ...hand,
      cards: [...hand.cards],
    })),
    sideBetResults: state.sideBetResults.map((result) => ({ ...result })),
  };
}

function advanceToNextHand(state: GameState): GameState {
  const next = cloneState(state);
  for (let i = next.activeHandIndex + 1; i < next.playerHands.length; i++) {
    const hand = next.playerHands[i];
    if (hand.outcome === "playing") {
      next.activeHandIndex = i;
      next.phase = "playing";
      return next;
    }
  }
  next.phase = "dealer";
  return next;
}

function finalizeIfHandComplete(state: GameState): GameState {
  const hand = state.playerHands[state.activeHandIndex];
  if (!hand) return state;
  const score = scoreHand(hand.cards);
  if (score.isBust) return finalizePlayerHand(state, "bust");
  if (score.total === 21) return finalizePlayerHand(state, "stand");
  return state;
}

function finalizePlayerHand(state: GameState, outcome: HandOutcome): GameState {
  const next = cloneState(state);
  const hand = next.playerHands[next.activeHandIndex];
  if (!hand) return next;
  hand.outcome = outcome;
  if (outcome === "bust" || outcome === "stand" || outcome === "blackjack") {
    return advanceToNextHand(next);
  }
  return next;
}

function allPlayerHandsResolved(state: GameState): boolean {
  return state.playerHands.every(
    (hand) => hand.outcome !== "playing" && hand.outcome !== "pending"
  );
}

/** Prépare une manche vide (sabot prêt, mains vides). */
export function prepareRound(
  state: GameState,
  bet: number,
  handCount = 1,
  sideBets: { perfectPairsPerHand: number; twentyOnePlusThreePerHand: number } = {
    perfectPairsPerHand: 0,
    twentyOnePlusThreePerHand: 0,
  },
): GameState {
  const spots = Math.max(1, Math.min(3, handCount));
  const next = cloneState(state);
  next.shoe = next.shoe.length > 0 ? next.shoe : createShoe();
  next.dealerCards = [];
  next.dealerHoleHidden = true;
  next.playerHands = Array.from({ length: spots }, () => createHand([], bet));
  next.activeHandIndex = 0;
  next.insuranceBet = 0;
  next.perfectPairsBetPerHand = sideBets.perfectPairsPerHand;
  next.twentyOnePlusThreeBetPerHand = sideBets.twentyOnePlusThreePerHand;
  next.sideBetResults = [];
  next.totalWagered =
    bet * spots +
    (sideBets.perfectPairsPerHand + sideBets.twentyOnePlusThreePerHand) * spots;
  next.phase = "betting";
  return next;
}

function applySideBetResults(state: GameState): GameState {
  const next = cloneState(state);
  next.sideBetResults = resolveAllSideBets(
    next.playerHands,
    next.dealerCards[0],
    next.perfectPairsBetPerHand,
    next.twentyOnePlusThreeBetPerHand,
  );
  return next;
}

/** Distribue une carte au joueur (main donnée) ou au croupier. */
export function dealTo(
  state: GameState,
  target: "player" | "dealer",
  playerHandIndex = 0
): GameState {
  const next = cloneState(state);
  const [card, shoe] = drawCard(next.shoe);
  next.shoe = shoe;

  if (target === "player") {
    const hand = next.playerHands[playerHandIndex];
    if (hand) hand.cards = [...hand.cards, card];
  } else {
    next.dealerCards = [...next.dealerCards, card];
  }

  return next;
}

function resolveBlackjackHands(next: GameState, dealerBlackjack: boolean): GameState {
  next.playerHands = next.playerHands.map((hand) => {
    const playerScore = scoreHand(hand.cards);
    if (!playerScore.isBlackjack) {
      if (dealerBlackjack) return { ...hand, outcome: "lose" as HandOutcome };
      return { ...hand, outcome: "playing" as HandOutcome };
    }
    if (dealerBlackjack) return { ...hand, outcome: "push" as HandOutcome };
    return { ...hand, outcome: "blackjack" as HandOutcome };
  });

  const firstPlaying = next.playerHands.findIndex((hand) => hand.outcome === "playing");
  if (firstPlaying === -1) {
    next.dealerHoleHidden = false;
    next.phase = "finished";
    return next;
  }

  if (dealerBlackjack) {
    next.dealerHoleHidden = false;
  }

  next.activeHandIndex = firstPlaying;
  next.phase = "playing";
  return next;
}

/** Résout l'état après la distribution initiale (assurance, blackjack, playing). */
export function resolveInitialDeal(state: GameState): GameState {
  const next = cloneState(state);
  const dealerCards = next.dealerCards;
  const dealerUpcard = dealerCards[0];
  const dealerBlackjack = scoreHand(dealerCards).isBlackjack;
  const anyNonBlackjack = next.playerHands.some((hand) => !scoreHand(hand.cards).isBlackjack);

  let resolved = next;

  if (dealerUpcard?.rank === "A" && anyNonBlackjack) {
    resolved.phase = "insurance";
  } else if (dealerBlackjack || next.playerHands.some((hand) => scoreHand(hand.cards).isBlackjack)) {
    resolved = resolveBlackjackHands(next, dealerBlackjack);
  } else {
    resolved.playerHands = resolved.playerHands.map((hand) => ({
      ...hand,
      outcome: "playing" as HandOutcome,
    }));
    resolved.activeHandIndex = 0;
    resolved.phase = "playing";
  }

  return applySideBetResults(resolved);
}

export function startRound(state: GameState, bet: number, handCount = 1): GameState {
  const sequence = buildInitialDealSteps(handCount);
  let next = prepareRound(state, bet, handCount);
  for (const step of sequence) {
    next =
      step.target === "player"
        ? dealTo(next, "player", step.handIndex)
        : dealTo(next, "dealer");
  }
  return resolveInitialDeal(next);
}

export function buildInitialDealSteps(handCount: number): Array<{
  target: "player" | "dealer";
  handIndex: number;
}> {
  const spots = Math.max(1, Math.min(3, handCount));
  const steps: Array<{ target: "player" | "dealer"; handIndex: number }> = [];

  for (let cardRound = 0; cardRound < 2; cardRound += 1) {
    for (let handIndex = 0; handIndex < spots; handIndex += 1) {
      steps.push({ target: "player", handIndex });
    }
    steps.push({ target: "dealer", handIndex: 0 });
  }

  return steps;
}

export function declineInsurance(state: GameState): GameState {
  const next = cloneState(state);
  const dealerBlackjack = scoreHand(next.dealerCards).isBlackjack;
  if (dealerBlackjack) {
    return resolveBlackjackHands(next, true);
  }

  next.playerHands = next.playerHands.map((hand) => {
    if (hand.outcome !== "playing" && hand.outcome !== "pending") return hand;
    const playerScore = scoreHand(hand.cards);
    if (playerScore.isBlackjack) return { ...hand, outcome: "blackjack" as HandOutcome };
    return { ...hand, outcome: "playing" as HandOutcome };
  });

  const firstPlaying = next.playerHands.findIndex((hand) => hand.outcome === "playing");
  if (firstPlaying === -1) {
    next.dealerHoleHidden = false;
    next.phase = "finished";
    return next;
  }

  next.activeHandIndex = firstPlaying;
  next.phase = "playing";
  return next;
}

export function takeInsurance(state: GameState, amount: number): GameState {
  const next = cloneState(state);
  next.insuranceBet = amount;
  next.totalWagered += amount;
  const dealerBlackjack = scoreHand(next.dealerCards).isBlackjack;
  if (dealerBlackjack) {
    return resolveBlackjackHands(next, true);
  }

  next.playerHands = next.playerHands.map((hand) => {
    if (hand.outcome !== "playing" && hand.outcome !== "pending") return hand;
    const playerScore = scoreHand(hand.cards);
    if (playerScore.isBlackjack) return { ...hand, outcome: "blackjack" as HandOutcome };
    return { ...hand, outcome: "playing" as HandOutcome };
  });

  const firstPlaying = next.playerHands.findIndex((hand) => hand.outcome === "playing");
  if (firstPlaying === -1) {
    next.dealerHoleHidden = false;
    next.phase = "finished";
    return next;
  }

  next.activeHandIndex = firstPlaying;
  next.phase = "playing";
  return next;
}

export function hit(state: GameState): GameState {
  const hand = activeHand(state);
  if (!hand || state.phase !== "playing") return state;

  const next = cloneState(state);
  const current = next.playerHands[next.activeHandIndex];
  const [card, shoe] = drawCard(next.shoe);
  next.shoe = shoe;
  current.cards.push(card);

  return finalizeIfHandComplete(next);
}

export function stand(state: GameState): GameState {
  if (state.phase !== "playing") return state;
  return finalizePlayerHand(cloneState(state), "stand");
}

export function doubleDown(state: GameState): GameState {
  const hand = activeHand(state);
  if (!hand || state.phase !== "playing" || hand.cards.length !== 2) return state;

  const next = cloneState(state);
  const current = next.playerHands[next.activeHandIndex];
  current.isDoubled = true;
  next.totalWagered += current.bet;
  current.bet *= 2;

  const [card, shoe] = drawCard(next.shoe);
  next.shoe = shoe;
  current.cards.push(card);

  const score = scoreHand(current.cards);
  return finalizePlayerHand(next, score.isBust ? "bust" : "stand");
}

export function split(state: GameState): GameState {
  const hand = activeHand(state);
  if (!hand || state.phase !== "playing" || !canSplitHand(hand)) return state;

  const splitIndex = state.activeHandIndex;
  const next = cloneState(state);
  const current = next.playerHands[splitIndex];
  const [first, second] = current.cards;
  const bet = current.bet;

  const [cardA, shoeA] = drawCard(next.shoe);
  const [cardB, shoeB] = drawCard(shoeA);
  next.shoe = shoeB;

  const splitHands = [
    createHand([first, cardA], bet, true),
    createHand([second, cardB], bet, true),
  ];

  next.playerHands = [
    ...next.playerHands.slice(0, splitIndex),
    splitHands[0],
    splitHands[1],
    ...next.playerHands.slice(splitIndex + 1),
  ];
  next.activeHandIndex = splitIndex;
  next.totalWagered += bet;

  const firstScore = scoreHand(next.playerHands[splitIndex].cards);
  const secondScore = scoreHand(next.playerHands[splitIndex + 1].cards);

  if (firstScore.isBlackjack) {
    next.playerHands[splitIndex].outcome = "blackjack";
  }
  if (secondScore.isBlackjack) {
    next.playerHands[splitIndex + 1].outcome = "blackjack";
  }

  if (next.playerHands.every((h) => h.outcome !== "playing")) {
    next.phase = "dealer";
    return next;
  }

  next.activeHandIndex = next.playerHands.findIndex((h) => h.outcome === "playing");
  return next;
}

export function revealDealer(state: GameState): GameState {
  const next = cloneState(state);
  next.dealerHoleHidden = false;
  return next;
}

export function resolvePlayerHandsAgainstDealer(state: GameState): GameState {
  const next = cloneState(state);
  next.dealerHoleHidden = false;

  next.playerHands = next.playerHands.map((hand) => {
    if (hand.outcome === "bust") {
      return { ...hand, outcome: "lose" as HandOutcome };
    }
    if (hand.outcome === "blackjack") {
      const dealerScore = scoreHand(next.dealerCards);
      if (dealerScore.isBlackjack) return { ...hand, outcome: "push" as HandOutcome };
      return { ...hand, outcome: "blackjack" as HandOutcome };
    }
    const result = compareHands(hand.cards, next.dealerCards);
    return { ...hand, outcome: result as HandOutcome };
  });

  next.phase = "finished";
  return next;
}

export function dealerHitStep(state: GameState): GameState {
  const next = cloneState(state);
  next.dealerHoleHidden = false;

  if (!needsDealerTurn(next)) {
    next.playerHands = next.playerHands.map((hand) =>
      hand.outcome === "bust" ? { ...hand, outcome: "lose" as HandOutcome } : hand
    );
    next.phase = "finished";
    return next;
  }

  if (!dealerShouldHit(next.dealerCards)) {
    return resolvePlayerHandsAgainstDealer(next);
  }

  const [card, shoe] = drawCard(next.shoe);
  next.shoe = shoe;
  next.dealerCards.push(card);
  next.phase = "dealer";
  return next;
}

export function dealerTurn(state: GameState): GameState {
  let next = cloneState(state);
  next.dealerHoleHidden = false;

  while (dealerShouldHit(next.dealerCards)) {
    const [card, shoe] = drawCard(next.shoe);
    next.shoe = shoe;
    next.dealerCards.push(card);
  }

  return resolvePlayerHandsAgainstDealer(next);
}

export function resolvePayouts(state: GameState): RoundResult[] {
  const dealerScore = scoreHand(state.dealerCards);
  const results: RoundResult[] = [];

  state.playerHands.forEach((hand, handIndex) => {
    let payout = 0;

    switch (hand.outcome) {
      case "blackjack":
        payout = hand.isSplitHand ? hand.bet * 2 : hand.bet * 2.5;
        break;
      case "win":
        payout = hand.bet * 2;
        break;
      case "push":
        payout = hand.bet;
        break;
      case "lose":
      case "bust":
        payout = 0;
        break;
      default:
        payout = 0;
    }

    results.push({
      handIndex,
      kind: "hand",
      payout,
      net: payout - hand.bet,
      outcome: hand.outcome,
    });
  });

  state.sideBetResults.forEach((sideBet) => {
    if (sideBet.perfectPairsBet > 0) {
      results.push({
        handIndex: sideBet.handIndex,
        kind: "perfect_pairs",
        payout: sideBet.perfectPairsPayout,
        net: sideBet.perfectPairsPayout - sideBet.perfectPairsBet,
        outcome: sideBet.perfectPairsPayout > 0 ? "win" : "lose",
      });
    }

    if (sideBet.twentyOnePlusThreeBet > 0) {
      results.push({
        handIndex: sideBet.handIndex,
        kind: "twenty_one_plus_three",
        payout: sideBet.twentyOnePlusThreePayout,
        net: sideBet.twentyOnePlusThreePayout - sideBet.twentyOnePlusThreeBet,
        outcome: sideBet.twentyOnePlusThreePayout > 0 ? "win" : "lose",
      });
    }
  });

  if (state.insuranceBet > 0) {
    if (dealerScore.isBlackjack) {
      results.push({
        handIndex: -1,
        kind: "insurance",
        payout: state.insuranceBet * 3,
        net: state.insuranceBet * 2,
        outcome: "win",
      });
    } else {
      results.push({
        handIndex: -1,
        kind: "insurance",
        payout: 0,
        net: -state.insuranceBet,
        outcome: "lose",
      });
    }
  }

  return results;
}

export function canHit(state: GameState): boolean {
  const hand = activeHand(state);
  if (state.phase !== "playing" || hand?.outcome !== "playing") return false;
  return scoreHand(hand.cards).total < 21;
}

export function canStand(state: GameState): boolean {
  return canHit(state);
}

export function canDouble(state: GameState): boolean {
  const hand = activeHand(state);
  return (
    state.phase === "playing" &&
    Boolean(hand && hand.outcome === "playing" && hand.cards.length === 2 && !hand.isDoubled)
  );
}

export function canSplit(state: GameState): boolean {
  const hand = activeHand(state);
  return (
    state.phase === "playing" &&
    Boolean(hand && canSplitHand(hand))
  );
}

export function needsDealerTurn(state: GameState): boolean {
  if (state.phase !== "dealer") return false;
  return state.playerHands.some((hand) => hand.outcome === "stand" || hand.outcome === "blackjack");
}

export function isInstantFinish(state: GameState): boolean {
  return state.phase === "finished" && allPlayerHandsResolved(state);
}
