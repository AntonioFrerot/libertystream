"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { CardSuitIcon } from "@/components/casino/blackjack/CardSuitIcon";
import { isRedSuit } from "@/lib/casino/blackjack/hand";
import { displayRank } from "@/lib/casino/blackjack/cardLayout";
import {
  CARD_DEAL_DURATION,
  CARD_FLIP_DURATION,
  CARD_HIT_DURATION,
  CARD_REVEAL_DURATION,
  DEAL_EASE,
  FLIP_EASE,
  type CardDealVariant,
} from "@/lib/casino/blackjack/motion";
import type { Card } from "@/lib/casino/blackjack/types";

interface BlackjackCardProps {
  card?: Card;
  hidden?: boolean;
  index?: number;
  dealVariant?: CardDealVariant | "idle";
  revealHole?: boolean;
}

function rankClass(rank: Card["rank"]): string {
  if (rank === "10") return " wide";
  if (rank === "J" || rank === "Q" || rank === "K") return " face";
  return "";
}

function CardIndex({ rank, suit, red }: { rank: Card["rank"]; suit: Card["suit"]; red: boolean }) {
  return (
    <div className={`blackjack-card-index ${red ? "red" : "black"}`}>
      <span className={`blackjack-card-rank${rankClass(rank)}`}>{displayRank(rank)}</span>
      <CardSuitIcon suit={suit} className="blackjack-card-index-suit" />
    </div>
  );
}

function CardFront({ card }: { card: Card }) {
  const red = isRedSuit(card.suit);

  return (
    <div className="blackjack-card-side blackjack-card-front">
      <CardIndex rank={card.rank} suit={card.suit} red={red} />
    </div>
  );
}

function CardBack({ shineDelay = 0 }: { shineDelay?: number }) {
  return (
    <div className="blackjack-card-side blackjack-card-back">
      <div className="blackjack-card-back-pattern" aria-hidden />
      <div
        className="blackjack-card-back-shine"
        style={{ animationDelay: `${shineDelay}s` }}
        aria-hidden
      />
      <div className="blackjack-card-back-logo-wrap">
        <Image
          src="/logo.png"
          alt=""
          width={72}
          height={72}
          className="blackjack-card-back-logo-img"
          aria-hidden
        />
      </div>
    </div>
  );
}

function dealMotion(variant: CardDealVariant, index: number) {
  const stagger = index * 0.04;
  const isPlayer = variant === "deal-player" || variant === "hit-player";
  const fromShoeX = isPlayer ? 72 : 48;
  const fromShoeY = isPlayer ? -148 : -72;

  return {
    initial: {
      opacity: 0,
      x: fromShoeX,
      y: fromShoeY,
      scale: 0.68,
      rotateZ: isPlayer ? -6 : 5,
    },
    animate: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      rotateZ: 0,
    },
    transition: {
      duration: variant.startsWith("hit") ? CARD_HIT_DURATION : CARD_DEAL_DURATION,
      delay: stagger,
      ease: DEAL_EASE,
    },
  };
}

export function BlackjackCard({
  card,
  hidden = false,
  index = 0,
  dealVariant = "idle",
  revealHole = false,
}: BlackjackCardProps) {
  const isDealing = dealVariant !== "idle";
  const deal = isDealing ? dealMotion(dealVariant, index) : null;
  const flipOnLand = isDealing && dealVariant !== "deal-dealer-down";
  const showBack = hidden || !card || (isDealing && dealVariant === "deal-dealer-down");

  const flipDuration = revealHole ? CARD_REVEAL_DURATION : CARD_FLIP_DURATION;
  const flipDelay = flipOnLand
    ? (dealVariant.startsWith("hit") ? CARD_HIT_DURATION : CARD_DEAL_DURATION) * 0.52
    : 0;

  return (
    <motion.div
      className={`blackjack-card blackjack-card-3d${isDealing ? " blackjack-card-dealing" : ""}`}
      initial={deal?.initial ?? false}
      animate={deal?.animate ?? { opacity: 1, x: 0, y: 0, scale: 1, rotateZ: 0 }}
      transition={deal?.transition ?? { duration: 0.2 }}
      style={{ perspective: 900, zIndex: index + 1 }}
    >
      <div className="blackjack-card-scale">
        <motion.div
          className="blackjack-card-flipper"
          initial={flipOnLand ? { rotateY: 180 } : false}
          animate={{ rotateY: showBack ? 180 : 0 }}
          transition={{
            duration: flipDuration,
            delay: flipDelay,
            ease: FLIP_EASE,
          }}
        >
          <CardBack shineDelay={index * 1.4} />
          {card && <CardFront card={card} />}
        </motion.div>
      </div>
    </motion.div>
  );
}
