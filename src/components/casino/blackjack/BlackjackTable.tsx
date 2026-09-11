"use client";

import { useRef, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BlackjackCard } from "@/components/casino/blackjack/BlackjackCard";
import { useAdaptiveCardLayout } from "@/components/casino/blackjack/useAdaptiveCardLayout";
import { BlackjackShoe } from "@/components/casino/blackjack/BlackjackShoe";
import { LibertyCoinIcon } from "@/components/wallet/LibertyCoinIcon";
import { formatHandScore, scoreHand } from "@/lib/casino/blackjack/hand";
import type { CardDealVariant } from "@/lib/casino/blackjack/motion";
import type { GamePhase, GameState, HandOutcome, SideBetSpotResult } from "@/lib/casino/blackjack/types";

interface BlackjackTableProps {
  state: GameState;
  phase: GamePhase;
  showDealerScore: boolean;
  animatedCard?: { id: string; variant: CardDealVariant } | null;
  revealDealerHole?: boolean;
  shoeDealing?: boolean;
  labels: {
    dealer: string;
    player: string;
    hand: string;
    blackjack: string;
    bust: string;
    win: string;
    lose: string;
    push: string;
    tableBanner: string;
    perfectPairs: string;
    twentyOnePlus3: string;
  };
  formatAmount: (amount: number) => string;
}

function outcomeClass(outcome: HandOutcome): string {
  switch (outcome) {
    case "win":
    case "blackjack":
      return "blackjack-outcome-win";
    case "lose":
    case "bust":
      return "blackjack-outcome-lose";
    case "push":
      return "blackjack-outcome-push";
    default:
      return "";
  }
}

function cardVariant(
  cardId: string,
  animatedCard: BlackjackTableProps["animatedCard"]
): CardDealVariant | "idle" {
  if (animatedCard?.id === cardId) return animatedCard.variant;
  return "idle";
}

function hasOutcomeBadge(outcome: HandOutcome): boolean {
  return outcome !== "playing" && outcome !== "pending" && outcome !== "stand";
}

function outcomeLabel(
  outcome: HandOutcome,
  labels: BlackjackTableProps["labels"],
): string {
  switch (outcome) {
    case "blackjack":
      return labels.blackjack;
    case "bust":
      return labels.bust;
    case "win":
      return labels.win;
    case "lose":
      return labels.lose;
    case "push":
      return labels.push;
    default:
      return "";
  }
}

type SideBetBadge = {
  key: string;
  label: string;
  net: number;
};

function winningSideBetBadges(
  sideBet: SideBetSpotResult | undefined,
  labels: BlackjackTableProps["labels"],
): SideBetBadge[] {
  if (!sideBet) return [];

  const badges: SideBetBadge[] = [];

  if (sideBet.perfectPairsBet > 0 && sideBet.perfectPairsPayout > 0) {
    badges.push({
      key: "perfect_pairs",
      label: labels.perfectPairs,
      net: sideBet.perfectPairsPayout - sideBet.perfectPairsBet,
    });
  }

  if (sideBet.twentyOnePlusThreeBet > 0 && sideBet.twentyOnePlusThreePayout > 0) {
    badges.push({
      key: "twenty_one_plus_three",
      label: labels.twentyOnePlus3,
      net: sideBet.twentyOnePlusThreePayout - sideBet.twentyOnePlusThreeBet,
    });
  }

  return badges;
}

export function BlackjackTable({
  state,
  phase,
  showDealerScore,
  animatedCard = null,
  revealDealerHole = false,
  shoeDealing = false,
  labels,
  formatAmount,
}: BlackjackTableProps) {
  const hasCards = state.dealerCards.length > 0 || state.playerHands.some((h) => h.cards.length > 0);
  const dealerScore = showDealerScore
    ? formatHandScore(state.dealerCards)
    : state.dealerCards[0]
      ? formatHandScore([state.dealerCards[0]])
      : "0";
  const playerHandCount = state.playerHands.length;
  const handsLayoutClass =
    playerHandCount >= 4
      ? `hands-many hands-${Math.min(playerHandCount, 6)}`
      : `hands-${playerHandCount}`;
  const multiHand = playerHandCount > 1;
  const playerHandsRef = useRef<HTMLDivElement>(null);
  const handCardCounts = state.playerHands.map((hand) => hand.cards.length);
  const adaptiveCardWidth = useAdaptiveCardLayout(
    playerHandsRef,
    playerHandCount,
    handCardCounts,
    multiHand,
  );
  const playerHandsStyle: CSSProperties | undefined =
    adaptiveCardWidth != null
      ? ({ "--bj-card-display-w": `${adaptiveCardWidth}px` } as CSSProperties)
      : undefined;
  const tableStyle: CSSProperties | undefined =
    playerHandCount === 2 && adaptiveCardWidth != null
      ? ({ "--bj-shared-card-w": `${adaptiveCardWidth}px` } as CSSProperties)
      : undefined;

  return (
    <div className="blackjack-table-wrap">
      <div className="blackjack-table" style={tableStyle}>
        <BlackjackShoe dealing={shoeDealing} />

        {!hasCards && (
          <>
            <img
              src="/logo.png"
              alt=""
              aria-hidden
              className="blackjack-rules-logo"
            />
            <div className="blackjack-rules-banner">
              <div className="blackjack-rules-ribbon">{labels.tableBanner}</div>
            </div>
          </>
        )}

        {hasCards && (
          <>
            <div className="blackjack-hand-row dealer">
              {state.dealerCards.length > 0 && (
                <motion.span
                  key={`dealer-score-${dealerScore}-${state.dealerCards.length}`}
                  className="blackjack-hand-score dealer-score"
                  initial={{ opacity: 0, scale: 0.88, y: 4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  {dealerScore}
                </motion.span>
              )}
              <div className="blackjack-cards dealer-cards">
                <AnimatePresence mode="popLayout">
                  {state.dealerCards.map((card, index) => (
                    <BlackjackCard
                      key={card.id}
                      card={card}
                      hidden={state.dealerHoleHidden && index === 1}
                      index={index}
                      dealVariant={cardVariant(card.id, animatedCard)}
                      revealHole={revealDealerHole && index === 1}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <div
              ref={playerHandsRef}
              style={playerHandsStyle}
              className={`blackjack-player-hands ${handsLayoutClass}${
                multiHand ? " split-layout multi-hand-layout" : ""
              }`}
            >
              {state.playerHands.map((hand, handIndex) => {
                const score = scoreHand(hand.cards);
                const scoreLabel =
                  hand.cards.length > 0 ? formatHandScore(hand.cards) : "0";

                const showOutcomeBadge = hasOutcomeBadge(hand.outcome);
                const sideBetBadges = showOutcomeBadge
                  ? []
                  : winningSideBetBadges(state.sideBetResults[handIndex], labels);

                return (
                  <div
                    key={`hand-${handIndex}`}
                    className={`blackjack-hand-row player ${outcomeClass(hand.outcome)} ${
                      phase === "playing" && state.activeHandIndex === handIndex ? "active" : ""
                    }`}
                  >
                    <div
                      className={`blackjack-hand-badge-slot${
                        !showOutcomeBadge && sideBetBadges.length > 0
                          ? " blackjack-hand-badge-slot-sidebet"
                          : ""
                      }`}
                      aria-live="polite"
                    >
                      {showOutcomeBadge ? (
                        <span className={`blackjack-hand-badge ${outcomeClass(hand.outcome)}`}>
                          {outcomeLabel(hand.outcome, labels)}
                        </span>
                      ) : sideBetBadges.length > 0 ? (
                        sideBetBadges.map((badge) => (
                          <span
                            key={badge.key}
                            className="blackjack-hand-badge blackjack-sidebet-badge blackjack-outcome-win"
                          >
                            <span className="blackjack-sidebet-badge-label">{badge.label}</span>
                            <span className="blackjack-sidebet-badge-amount">
                              <LibertyCoinIcon size="sm" />
                              {formatAmount(badge.net)}
                            </span>
                          </span>
                        ))
                      ) : (
                        playerHandCount > 1 && (
                          <span className="blackjack-hand-seat-label">
                            {labels.hand} {handIndex + 1}
                          </span>
                        )
                      )}
                    </div>
                    <div className="blackjack-cards player-cards">
                      <AnimatePresence mode="popLayout">
                        {hand.cards.map((card, index) => (
                          <BlackjackCard
                            key={card.id}
                            card={card}
                            index={index}
                            dealVariant={cardVariant(card.id, animatedCard)}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                    {hand.cards.length > 0 && (
                      <motion.span
                        key={`player-score-${handIndex}-${scoreLabel}`}
                        className={`blackjack-hand-score player-score ${score.isBust ? "bust" : ""}`}
                        initial={{ opacity: 0, scale: 0.88, y: 4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                      >
                        {scoreLabel}
                      </motion.span>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
