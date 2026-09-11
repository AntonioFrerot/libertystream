"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { BlackjackBetRow } from "@/components/casino/blackjack/BlackjackBetRow";
import { GameProfitStatRow } from "@/components/casino/GameProfitStatRow";
import { GamePayoutStatRow } from "@/components/casino/GamePayoutStatRow";
import { HiloGuessControls } from "@/components/casino/hilo/HiloGuessControls";
import { LibertyAmountValue } from "@/components/wallet/LibertyAmountValue";
import { formatMultiplier } from "@/lib/casino/plinko/multipliers";
import type { Card } from "@/lib/casino/blackjack/types";
import type { HiloGuess, HiloRoundOutcome } from "@/lib/casino/hilo/types";
import type { GamePayoutDisplayAmounts, GameProfitDisplayAmounts } from "@/lib/casino/gameProfitDisplay";
import { formatStatMultiplier } from "@/lib/casino/gameProfitDisplay";

interface HiloPanelProps {
  betAmount: number;
  onBetAmountChange: (value: number) => void;
  currentCard: Card | null;
  cumulativeMultiplier: number;
  payoutDisplay: GamePayoutDisplayAmounts;
  profitDisplay: GameProfitDisplayAmounts;
  roundOutcome: HiloRoundOutcome | null;
  nextMultipliers: { higher: string; lower: string } | null;
  phase: "betting" | "playing" | "finished";
  winStreak: number;
  controlsLocked: boolean;
  cardAnimating: boolean;
  onBet: () => void;
  onCashOut: () => void;
  onGuess: (guess: HiloGuess) => void;
  onSkip: () => void;
  setMaxBet: () => void;
  labels: {
    betAmount: string;
    bet: string;
    cashOut: string;
    multiplier: string;
    gain: string;
    potentialPayout: string;
    nextMultiplier: string;
    profit: string;
    higher: string;
    lower: string;
    skip: string;
  };
}

export function HiloPanel({
  betAmount,
  onBetAmountChange,
  currentCard,
  cumulativeMultiplier,
  payoutDisplay,
  profitDisplay,
  roundOutcome,
  nextMultipliers,
  phase,
  winStreak,
  controlsLocked,
  cardAnimating,
  onBet,
  onCashOut,
  onGuess,
  onSkip,
  setMaxBet,
  labels,
}: HiloPanelProps) {
  const inRound = phase === "playing";
  const finished = phase === "finished";
  const gameLaunched = phase !== "betting";
  const betControlsDisabled = controlsLocked || inRound;
  const guessDisabled = !inRound || controlsLocked;
  const showNext = inRound && nextMultipliers != null;

  const primaryAction = (
    <div className="hilo-panel-primary plinko-panel-full">
      {inRound ? (
        <button
          type="button"
          className="plinko-bet-btn hilo-cashout-btn"
          disabled={controlsLocked || winStreak === 0}
          onClick={onCashOut}
        >
          {labels.cashOut}
        </button>
      ) : (
        <button type="button" className="plinko-bet-btn" disabled={controlsLocked} onClick={onBet}>
          {labels.bet}
        </button>
      )}
    </div>
  );

  return (
    <aside className={`plinko-panel hilo-panel${gameLaunched ? " hilo-panel-launched" : ""}`}>
      <div className="hilo-bet-block plinko-panel-full">
        <BlackjackBetRow
          label={labels.betAmount}
          value={betAmount}
          onChange={onBetAmountChange}
          disabled={betControlsDisabled}
          showMax
          onHalf={() => onBetAmountChange(Math.max(0, betAmount / 2))}
          onDouble={() => onBetAmountChange(betAmount * 2)}
          onMax={setMaxBet}
        />
      </div>

      <HiloGuessControls
        layout="panel"
        currentCard={currentCard}
        disabled={guessDisabled}
        cardAnimating={cardAnimating}
        onGuess={onGuess}
        onSkip={onSkip}
        labels={{
          higher: labels.higher,
          lower: labels.lower,
          skip: labels.skip,
        }}
      />

      {primaryAction}

      {(inRound || finished) && (
        <div className="hilo-panel-stats plinko-panel-full plinko-order-result">
          <div className="hilo-stat-row">
            <span>{labels.multiplier}</span>
            <strong>{formatStatMultiplier(cumulativeMultiplier, roundOutcome, formatMultiplier)}</strong>
          </div>
          <GamePayoutStatRow
            gainLabel={labels.gain}
            potentialPayoutLabel={labels.potentialPayout}
            gainAmount={payoutDisplay.gainAmount}
            potentialAmount={payoutDisplay.potentialAmount}
            roundOutcome={roundOutcome}
            variant="hilo"
          />
          {showNext && (
            <>
              <div className="hilo-stat-row hilo-stat-next hilo-stat-next-higher">
                <span className="hilo-stat-next-label">
                  {labels.nextMultiplier}
                  <ArrowUp className="hilo-stat-next-arrow" strokeWidth={2.75} aria-hidden />
                </span>
                <strong>{nextMultipliers.higher}</strong>
              </div>
              <div className="hilo-stat-row hilo-stat-next hilo-stat-next-lower">
                <span className="hilo-stat-next-label">
                  {labels.nextMultiplier}
                  <ArrowDown className="hilo-stat-next-arrow" strokeWidth={2.75} aria-hidden />
                </span>
                <strong>{nextMultipliers.lower}</strong>
              </div>
            </>
          )}
          <GameProfitStatRow
            label={labels.profit}
            zeroAmount={profitDisplay.zeroAmount}
            liveAmount={profitDisplay.liveAmount}
            winAmount={profitDisplay.winAmount}
            lossAmount={profitDisplay.lossAmount}
            inRound={phase === "playing"}
            roundOutcome={roundOutcome}
            variant="hilo"
          />
        </div>
      )}
    </aside>
  );
}
