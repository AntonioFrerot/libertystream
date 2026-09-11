"use client";

import { HiloCard } from "@/components/casino/hilo/HiloCard";
import { BlackjackShoe } from "@/components/casino/blackjack/BlackjackShoe";
import { HiloGuessControls } from "@/components/casino/hilo/HiloGuessControls";
import { HiloHistoryStrip } from "@/components/casino/hilo/HiloHistoryStrip";
import { formatMultiplier } from "@/lib/casino/plinko/multipliers";
import { getHiloNextMultipliersByGuess } from "@/lib/casino/hilo/engine";
import { buildHiloTimeline } from "@/lib/casino/hilo/types";
import type { HiloState, HiloGuess } from "@/lib/casino/hilo/types";
import type { CardDealVariant } from "@/lib/casino/blackjack/motion";

interface HiloArenaProps {
  gameState: HiloState;
  disabled: boolean;
  cardAnimating: boolean;
  shoeDealing?: boolean;
  dealVariant?: CardDealVariant | "idle";
  onGuess: (guess: HiloGuess) => void;
  onSkip: () => void;
  labels: {
    higher: string;
    lower: string;
    skip: string;
    startHint: string;
    tableBanner: string;
    multiplier: string;
    won: string;
    lost: string;
    history: string;
    historyEmpty: string;
  };
}

export function HiloArena({
  gameState,
  disabled,
  cardAnimating,
  shoeDealing = false,
  dealVariant = "idle",
  onGuess,
  onSkip,
  labels,
}: HiloArenaProps) {
  const timeline = buildHiloTimeline(gameState);
  const inRound = gameState.phase !== "betting";
  const showCardControls = gameState.phase === "playing";
  const showMultiplier = gameState.phase === "playing" && gameState.winStreak > 0;
  const nextMultipliers = getHiloNextMultipliersByGuess(gameState);
  const nextMultipliersFormatted =
    nextMultipliers != null
      ? {
          higher: formatMultiplier(nextMultipliers.higher),
          lower: formatMultiplier(nextMultipliers.lower),
        }
      : null;
  const showOutcome = gameState.phase === "finished" && gameState.roundOutcome != null;

  const showStartBanner = gameState.phase === "betting";

  return (
    <div className="blackjack-table-wrap hilo-table-wrap">
      <div className="blackjack-table hilo-table">
        <BlackjackShoe dealing={shoeDealing} />

        {showStartBanner ? (
          <>
            <img src="/logo.png" alt="" aria-hidden className="blackjack-rules-logo" />
            <div className="blackjack-rules-banner">
              <div className="blackjack-rules-ribbon">{labels.tableBanner}</div>
            </div>
          </>
        ) : (
          <>
        <div className="hilo-main">
          <div className="hilo-stage">
            {showMultiplier && (
              <div className="hilo-multiplier-badge hilo-current-multiplier-badge">
                <span className="hilo-multiplier-label">{labels.multiplier}</span>
                <strong>{formatMultiplier(gameState.cumulativeMultiplier)}</strong>
              </div>
            )}

            {showOutcome && (
              <div
                className={`hilo-outcome-badge hilo-outcome-${gameState.roundOutcome}`}
              >
                <strong>
                  {gameState.roundOutcome === "won" ? labels.won : labels.lost}
                </strong>
              </div>
            )}

            {showCardControls ? (
              <HiloGuessControls
                layout="card"
                currentCard={gameState.currentCard}
                disabled={disabled}
                cardAnimating={cardAnimating}
                nextMultipliers={nextMultipliersFormatted}
                onGuess={onGuess}
                onSkip={onSkip}
                labels={{
                  higher: labels.higher,
                  lower: labels.lower,
                  skip: labels.skip,
                }}
              >
                {gameState.currentCard ? (
                  <HiloCard
                    key={gameState.currentCard.id}
                    card={gameState.currentCard}
                    size="lg"
                    dealVariant={dealVariant}
                  />
                ) : (
                  <div className="hilo-card-placeholder">
                    <span>{labels.startHint}</span>
                  </div>
                )}
              </HiloGuessControls>
            ) : (
              <div className="hilo-current-card">
                {gameState.currentCard ? (
                  <HiloCard
                    key={gameState.currentCard.id}
                    card={gameState.currentCard}
                    size="lg"
                    dealVariant={dealVariant}
                  />
                ) : (
                  <div className="hilo-card-placeholder">
                    <span>{labels.startHint}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {inRound && (
          <section className="hilo-history-section" aria-label={labels.history}>
            <div className="hilo-history-section-head">
              <span>{labels.history}</span>
            </div>
            {timeline.length > 0 ? (
              <HiloHistoryStrip timeline={timeline} />
            ) : (
              <p className="hilo-history-empty">{labels.historyEmpty}</p>
            )}
          </section>
        )}
          </>
        )}
      </div>
    </div>
  );
}
