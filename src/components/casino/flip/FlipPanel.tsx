"use client";

import { BlackjackBetRow } from "@/components/casino/blackjack/BlackjackBetRow";
import { IntegerCountInput } from "@/components/casino/IntegerCountInput";
import { FlipSideButtons } from "@/components/casino/flip/FlipSideVisuals";
import { FlipStatsBlock } from "@/components/casino/flip/FlipStatsBlock";
import { PlinkoSelect } from "@/components/casino/plinko/PlinkoSelect";
import { FLIP_MAX_AUTO_FLIPS } from "@/lib/casino/flip/config";
import type { CoinSide, FlipPhase } from "@/lib/casino/flip/types";
import type { GamePayoutDisplayAmounts, GameProfitDisplayAmounts } from "@/lib/casino/gameProfitDisplay";

export type FlipAutoSide = CoinSide | "random";

interface FlipPanelProps {
  mode: "manual" | "auto";
  onModeChange: (mode: "manual" | "auto") => void;
  betAmount: number;
  onBetAmountChange: (value: number) => void;
  selectedSide: CoinSide;
  onSideChange: (side: CoinSide) => void;
  autoSide: FlipAutoSide;
  onAutoSideChange: (side: FlipAutoSide) => void;
  autoFlipCount: number;
  onAutoFlipCountChange: (value: number) => void;
  phase: FlipPhase;
  streak: number;
  cumulativeMultiplier: number;
  payoutDisplay: GamePayoutDisplayAmounts;
  profitDisplay: GameProfitDisplayAmounts;
  roundOutcome: "won" | "lost" | null;
  nextMultiplier: string | null;
  nextPotentialPayout: string | null;
  controlsLocked: boolean;
  autoRunning: boolean;
  onBet: () => void;
  onFlip: () => void;
  onCashOut: () => void;
  setMaxBet: () => void;
  labels: {
    manual: string;
    auto: string;
    betAmount: string;
    bet: string;
    flip: string;
    cashOut: string;
    multiplier: string;
    payout: string;
    gain: string;
    potentialPayout: string;
    profit: string;
    nextMultiplier: string;
    nextPayout: string;
    eagle: string;
    snake: string;
    randomOption: string;
    autoFlips: string;
    randomSide: string;
    autoCancel: string;
  };
}

export function FlipPanel({
  mode,
  onModeChange,
  betAmount,
  onBetAmountChange,
  selectedSide,
  onSideChange,
  autoSide,
  onAutoSideChange,
  autoFlipCount,
  onAutoFlipCountChange,
  phase,
  streak,
  cumulativeMultiplier,
  payoutDisplay,
  profitDisplay,
  roundOutcome,
  nextMultiplier,
  nextPotentialPayout,
  controlsLocked,
  autoRunning,
  onBet,
  onFlip,
  onCashOut,
  setMaxBet,
  labels,
}: FlipPanelProps) {
  const inRound = phase === "playing";
  const finished = phase === "finished";
  const gameLaunched = phase !== "betting";
  const betControlsDisabled = controlsLocked || inRound || autoRunning;
  const sideDisabled = controlsLocked || autoRunning;
  const canCashOut = inRound && streak > 0 && !controlsLocked;
  const showFlipAction = inRound && streak > 0 && mode === "manual";
  const autoSideOptions: { value: FlipAutoSide; label: string }[] = [
    { value: "random", label: labels.randomOption },
    { value: "eagle", label: labels.eagle },
    { value: "snake", label: labels.snake },
  ];

  const primaryAction =
    mode === "auto" ? (
      <div className="flip-panel-primary">
        <button
          type="button"
          className={`plinko-bet-btn${autoRunning ? " plinko-bet-btn-cancel" : ""}`}
          onClick={onBet}
          disabled={!autoRunning && controlsLocked}
        >
          {autoRunning ? labels.autoCancel : labels.bet}
        </button>
      </div>
    ) : (
      <div className="flip-panel-primary">
        {showFlipAction ? (
          <div className="flip-action-row">
            <button
              type="button"
              className="plinko-bet-btn flip-cashout-btn"
              disabled={!canCashOut}
              onClick={onCashOut}
            >
              {labels.cashOut}
            </button>
            <button type="button" className="plinko-bet-btn" disabled={controlsLocked} onClick={onFlip}>
              {labels.flip}
            </button>
          </div>
        ) : inRound && canCashOut ? (
          <button
            type="button"
            className="plinko-bet-btn flip-cashout-btn"
            disabled={!canCashOut}
            onClick={onCashOut}
          >
            {labels.cashOut}
          </button>
        ) : (
          <button
            type="button"
            className="plinko-bet-btn"
            disabled={controlsLocked}
            onClick={onBet}
          >
            {labels.bet}
          </button>
        )}
      </div>
    );

  return (
    <aside className={`plinko-panel flip-panel${gameLaunched ? " flip-panel-launched" : ""}`}>
      <div className="plinko-mode-tabs plinko-panel-full plinko-order-mode">
        <button
          type="button"
          className={mode === "manual" ? "plinko-mode-active" : ""}
          onClick={() => onModeChange("manual")}
          disabled={controlsLocked || autoRunning || inRound}
        >
          {labels.manual}
        </button>
        <button
          type="button"
          className={mode === "auto" ? "plinko-mode-active" : ""}
          onClick={() => onModeChange("auto")}
          disabled={controlsLocked || autoRunning || inRound}
        >
          {labels.auto}
        </button>
      </div>

      <div className="flip-bet-block hilo-bet-block plinko-panel-full plinko-order-bet">
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

      {mode === "auto" && (
        <>
          <label className="plinko-field plinko-panel-full plinko-stake-auto plinko-order-auto">
            <span>{labels.autoFlips}</span>
            <IntegerCountInput
              value={autoFlipCount}
              onChange={onAutoFlipCountChange}
              min={0}
              max={FLIP_MAX_AUTO_FLIPS}
              disabled={betControlsDisabled}
              startWithZero
            />
          </label>

          <div className="plinko-stake-settings plinko-panel-full plinko-order-settings">
            <label className="plinko-field plinko-stake-settings-item plinko-stake-select-field">
              <span>{labels.randomSide}</span>
              <PlinkoSelect
                value={autoSide}
                options={autoSideOptions}
                onChange={onAutoSideChange}
                disabled={betControlsDisabled}
                mobileOverlay
              />
            </label>
          </div>
        </>
      )}

      {mode === "manual" && (
        <div className="flip-side-picker flip-side-picker-panel plinko-panel-full plinko-order-settings">
          <FlipSideButtons
            selectedSide={selectedSide}
            disabled={sideDisabled}
            eagleLabel={labels.eagle}
            snakeLabel={labels.snake}
            onSideChange={onSideChange}
          />
        </div>
      )}

      <div className="flip-panel-primary-wrap plinko-panel-full plinko-order-bet-btn">{primaryAction}</div>

      {(inRound || finished) && (
        <FlipStatsBlock
          className="flip-panel-stats plinko-panel-full plinko-order-result"
          cumulativeMultiplier={cumulativeMultiplier}
          payoutDisplay={payoutDisplay}
          profitDisplay={profitDisplay}
          inRound={inRound}
          roundOutcome={roundOutcome}
          nextMultiplier={mode === "auto" ? null : nextMultiplier}
          nextPotentialPayout={mode === "auto" ? null : nextPotentialPayout}
          labels={{
            multiplier: labels.multiplier,
            payout: labels.payout,
            gain: labels.gain,
            potentialPayout: labels.potentialPayout,
            nextMultiplier: labels.nextMultiplier,
            nextPayout: labels.nextPayout,
            profit: labels.profit,
          }}
        />
      )}
    </aside>
  );
}
