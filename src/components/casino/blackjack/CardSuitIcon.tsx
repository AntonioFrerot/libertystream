import type { Suit } from "@/lib/casino/blackjack/types";

interface CardSuitIconProps {
  suit: Suit;
  size?: number;
  className?: string;
}

const SUIT_VERSION = "1";

const SUIT_SRC: Record<Suit, string> = {
  hearts: `/blackjack/suits/heart.png?v=${SUIT_VERSION}`,
  diamonds: `/blackjack/suits/diamond.png?v=${SUIT_VERSION}`,
  spades: `/blackjack/suits/spade.png?v=${SUIT_VERSION}`,
  clubs: `/blackjack/suits/club.png?v=${SUIT_VERSION}`,
};

export function CardSuitIcon({ suit, size = 16, className = "" }: CardSuitIconProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={SUIT_SRC[suit]}
      alt=""
      width={size}
      height={size}
      style={{ width: size, height: size, maxWidth: size, maxHeight: size }}
      className={`blackjack-suit-icon${className ? ` ${className}` : ""}`}
      aria-hidden
      draggable={false}
    />
  );
}
