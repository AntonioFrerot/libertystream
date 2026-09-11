"use client";

import type { CoinSide } from "@/lib/casino/flip/types";

interface FlipSideIconProps {
  side: CoinSide;
  variant?: "coin" | "button" | "chip" | "history";
}

export function FlipSideIcon({ side, variant = "coin" }: FlipSideIconProps) {
  if (side === "eagle") {
    return (
      <img
        src="/logo.png"
        alt=""
        aria-hidden
        className={`flip-side-logo flip-side-logo-${variant}`}
      />
    );
  }

  return (
    <img
      src="/flip/snake.png"
      alt=""
      aria-hidden
      className={`flip-side-snake-img flip-side-snake-img-${variant}`}
    />
  );
}

interface FlipSideButtonsProps {
  selectedSide: CoinSide;
  disabled: boolean;
  eagleLabel: string;
  snakeLabel: string;
  onSideChange: (side: CoinSide) => void;
}

export function FlipSideButtons({
  selectedSide,
  disabled,
  eagleLabel,
  snakeLabel,
  onSideChange,
}: FlipSideButtonsProps) {
  return (
    <div className="flip-side-grid">
      <button
        type="button"
        className={`flip-side-btn flip-side-btn-eagle${selectedSide === "eagle" ? " flip-side-btn-active" : ""}`}
        onClick={() => onSideChange("eagle")}
        disabled={disabled}
      >
        <span className="flip-side-icon">
          <FlipSideIcon side="eagle" variant="button" />
        </span>
        {eagleLabel}
      </button>
      <button
        type="button"
        className={`flip-side-btn flip-side-btn-snake${selectedSide === "snake" ? " flip-side-btn-active" : ""}`}
        onClick={() => onSideChange("snake")}
        disabled={disabled}
      >
        <span className="flip-side-icon">
          <FlipSideIcon side="snake" variant="button" />
        </span>
        {snakeLabel}
      </button>
    </div>
  );
}

interface FlipCoinFaceProps {
  side: CoinSide;
}

export function FlipCoinFace({ side }: FlipCoinFaceProps) {
  return (
    <div className={`flip-coin-face flip-coin-face-${side}`}>
      <span className="flip-coin-face-shine" aria-hidden />
      <span className="flip-coin-face-ring" aria-hidden />
      <span className="flip-coin-icon" aria-hidden>
        <FlipSideIcon side={side} variant="coin" />
      </span>
    </div>
  );
}
