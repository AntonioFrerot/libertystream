"use client";

import { FlipHistoryStrip } from "@/components/casino/flip/FlipHistoryStrip";
import { FlipCoinFace, FlipSideButtons } from "@/components/casino/flip/FlipSideVisuals";
import type { CoinSide, FlipHistoryEntry, FlipPhase } from "@/lib/casino/flip/types";

interface FlipArenaProps {
  flipping: boolean;
  coinRotation: number;
  showResult: boolean;
  phase: FlipPhase;
  history: FlipHistoryEntry[];
  startHint: string;
  historyLabel: string;
  historyEmpty: string;
  eagleLabel: string;
  snakeLabel: string;
  selectedSide: CoinSide;
  sideDisabled: boolean;
  onSideChange: (side: CoinSide) => void;
  showSidePicker?: boolean;
  showNextMultiplierBadge?: boolean;
  nextMultiplier?: string | null;
  nextMultiplierLabel?: string;
  historyAutoMode?: boolean;
}

export function FlipArena({
  flipping,
  coinRotation,
  showResult,
  phase,
  history,
  startHint,
  historyLabel,
  historyEmpty,
  eagleLabel,
  snakeLabel,
  selectedSide,
  sideDisabled,
  onSideChange,
  showSidePicker = true,
  showNextMultiplierBadge = true,
  nextMultiplier = null,
  nextMultiplierLabel = "",
  historyAutoMode = false,
}: FlipArenaProps) {
  const lastEntry = history[history.length - 1];
  const inRound = phase !== "betting";
  const showNextMultiplier =
    showNextMultiplierBadge && phase === "playing" && nextMultiplier != null;

  return (
    <div className="flip-arena-stack">
      <div className="blackjack-table-wrap hilo-table-wrap">
        <div className="blackjack-table hilo-table">
          <div className="hilo-main">
            <div className="hilo-stage flip-stage">
              {showNextMultiplier && (
                <div className="hilo-multiplier-badge flip-next-multiplier-badge">
                  <span className="hilo-multiplier-label">{nextMultiplierLabel}</span>
                  <strong>{nextMultiplier}</strong>
                </div>
              )}

              <div
                className={`flip-coin-ambient${flipping ? " flip-coin-ambient-flipping" : ""}${showResult && lastEntry ? (lastEntry.won ? " flip-coin-ambient-win" : " flip-coin-ambient-loss") : ""}`}
              >
                <div className="flip-coin-glow flip-coin-glow-outer" aria-hidden />
                <div className="flip-coin-glow flip-coin-glow-inner" aria-hidden />
                <div className="flip-coin-scene">
                  <div
                    className={`flip-coin${flipping ? " flip-coin-flipping" : ""}`}
                    style={{ transform: `rotateY(${coinRotation}deg)` }}
                  >
                    <FlipCoinFace side="eagle" />
                    <FlipCoinFace side="snake" />
                  </div>
                </div>
              </div>

              {showSidePicker && (
                <div className="flip-side-picker flip-side-picker-arena">
                  <FlipSideButtons
                    selectedSide={selectedSide}
                    disabled={sideDisabled}
                    eagleLabel={eagleLabel}
                    snakeLabel={snakeLabel}
                    onSideChange={onSideChange}
                  />
                </div>
              )}

              {history.length === 0 && !flipping && (
                <p className="flip-start-hint">{startHint}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {inRound && (
        <section className="hilo-history-section flip-history-section" aria-label={historyLabel}>
          <div className="hilo-history-section-head">
            <span>{historyLabel}</span>
          </div>
          {history.length > 0 ? (
            <FlipHistoryStrip history={history} autoMode={historyAutoMode} />
          ) : (
            <p className="hilo-history-empty">{historyEmpty}</p>
          )}
        </section>
      )}
    </div>
  );
}
