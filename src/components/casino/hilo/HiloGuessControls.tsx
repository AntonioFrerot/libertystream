"use client";

import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, ChevronsRight } from "lucide-react";
import { formatProbability, getHiloOptions } from "@/lib/casino/hilo/ranks";
import type { Card } from "@/lib/casino/blackjack/types";
import type { HiloGuess } from "@/lib/casino/hilo/types";

interface HiloGuessControlsProps {
  currentCard: Card | null;
  disabled: boolean;
  cardAnimating: boolean;
  layout: "panel" | "card";
  nextMultipliers?: { higher: string; lower: string } | null;
  onGuess: (guess: HiloGuess) => void;
  onSkip: () => void;
  labels: {
    higher: string;
    lower: string;
    skip: string;
  };
  children?: ReactNode;
}

export function HiloGuessControls({
  currentCard,
  disabled,
  cardAnimating,
  layout,
  nextMultipliers = null,
  onGuess,
  onSkip,
  labels,
  children,
}: HiloGuessControlsProps) {
  const options = currentCard ? getHiloOptions(currentCard.rank) : [];
  const higher = options.find((option) => option.guess === "higher");
  const lower = options.find((option) => option.guess === "lower");
  const locked = disabled || !currentCard || cardAnimating;

  if (layout === "card") {
    return (
      <div className="hilo-guess-controls hilo-guess-controls-card">
        <button
          type="button"
          className="hilo-card-side-btn hilo-card-side-higher"
          disabled={locked || !higher}
          aria-label={labels.higher}
          onClick={() => onGuess("higher")}
        >
          <ArrowUp className="hilo-card-side-icon" aria-hidden />
          {nextMultipliers?.higher && (
            <span className="hilo-card-side-mult">{nextMultipliers.higher}</span>
          )}
        </button>

        <div className="hilo-current-card-wrap">
          <div className="hilo-current-card">{children}</div>
          <button
            type="button"
            className="hilo-skip-corner-btn"
            disabled={locked}
            aria-label={labels.skip}
            onClick={onSkip}
          >
            <ChevronsRight aria-hidden />
          </button>
        </div>

        <button
          type="button"
          className="hilo-card-side-btn hilo-card-side-lower"
          disabled={locked || !lower}
          aria-label={labels.lower}
          onClick={() => onGuess("lower")}
        >
          <ArrowDown className="hilo-card-side-icon" aria-hidden />
          {nextMultipliers?.lower && (
            <span className="hilo-card-side-mult">{nextMultipliers.lower}</span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="hilo-guess-controls hilo-guess-controls-panel">
      <button
        type="button"
        className="hilo-guess-btn hilo-guess-higher"
        disabled={locked || !higher}
        onClick={() => onGuess("higher")}
      >
        <span className="hilo-guess-title">{labels.higher}</span>
        <span className="hilo-guess-meta">
          <ArrowUp className="hilo-guess-icon" aria-hidden />
          {higher && <span className="hilo-guess-prob">{formatProbability(higher.probability)}</span>}
        </span>
      </button>

      <button
        type="button"
        className="hilo-guess-btn hilo-guess-lower"
        disabled={locked || !lower}
        onClick={() => onGuess("lower")}
      >
        <span className="hilo-guess-title">{labels.lower}</span>
        <span className="hilo-guess-meta">
          <ArrowDown className="hilo-guess-icon" aria-hidden />
          {lower && <span className="hilo-guess-prob">{formatProbability(lower.probability)}</span>}
        </span>
      </button>

      <button
        type="button"
        className="hilo-guess-btn hilo-skip-btn"
        disabled={locked}
        onClick={onSkip}
      >
        <span className="hilo-guess-title">{labels.skip}</span>
        <span className="hilo-guess-meta">
          <ChevronsRight className="hilo-guess-icon" aria-hidden />
        </span>
      </button>
    </div>
  );
}
