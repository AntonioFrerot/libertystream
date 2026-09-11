"use client";

import { BlackjackCard } from "@/components/casino/blackjack/BlackjackCard";
import type { Card } from "@/lib/casino/blackjack/types";
import type { CardDealVariant } from "@/lib/casino/blackjack/motion";

interface HiloCardProps {
  card: Card;
  size?: "sm" | "lg" | "history";
  dealVariant?: CardDealVariant | "idle";
  index?: number;
}

export function HiloCard({ card, size = "lg", dealVariant = "idle", index = 0 }: HiloCardProps) {
  return (
    <div className={`hilo-card-slot hilo-card-${size}`}>
      <BlackjackCard card={card} dealVariant={dealVariant} index={index} />
    </div>
  );
}
