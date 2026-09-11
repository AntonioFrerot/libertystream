"use client";

import { GameProfitStatRow } from "@/components/casino/GameProfitStatRow";
import { GamePayoutStatRow } from "@/components/casino/GamePayoutStatRow";
import { BlackjackBetRow } from "@/components/casino/blackjack/BlackjackBetRow";
import { IntegerCountInput } from "@/components/casino/IntegerCountInput";
import { EagleFlightCashoutAtInput } from "@/components/casino/eagle-flight/EagleFlightCashoutAtInput";
import {
  EAGLE_FLIGHT_MAX_AUTO_BETS,
  formatEagleFlightMultiplier,
} from "@/lib/casino/eagle-flight/config";
import type { GamePayoutDisplayAmounts, GameProfitDisplayAmounts } from "@/lib/casino/gameProfitDisplay";
import { formatStatMultiplier } from "@/lib/casino/gameProfitDisplay";
import type { EagleFlightPhase } from "@/lib/casino/eagle-flight/types";

type PlayMode = "manual" | "auto";

interface EagleFlightPanelProps {
  betAmount: number;
  onBetAmountChange: (value: number) => void;
  autoCashoutAt: number;
  onAutoCashoutAtChange: (value: number) => void;
  mode: PlayMode;
  onModeChange: (mode: PlayMode) => void;
  autoBetCount: number;
  onAutoBetCountChange: (value: number) => void;
  autoRunning: boolean;
  currentMultiplier: number;
  payoutDisplay: GamePayoutDisplayAmounts;
  profitDisplay: GameProfitDisplayAmounts;
  roundOutcome: "won" | "lost" | null;
  phase: EagleFlightPhase;
  controlsLocked: boolean;
  onBet: () => void;
  onCashOut: () => void;
  setMaxBet: () => void;
  labels: {
    betAmount: string;
    bet: string;
    cashOut: string;
    cashoutAt: string;
    multiplier: string;
    payout: string;
    gain: string;
    potentialPayout: string;
    profit: string;
    manual: string;
    auto: string;
    autoCount: string;
    autoCancel: string;
  };
}

export function EagleFlightPanel({
  betAmount,
  onBetAmountChange,
  autoCashoutAt,
  onAutoCashoutAtChange,
  mode,
  onModeChange,
  autoBetCount,
  onAutoBetCountChange,
  autoRunning,
  currentMultiplier,
  payoutDisplay,
  profitDisplay,
  roundOutcome,
  phase,
  controlsLocked,
  onBet,
  onCashOut,
  setMaxBet,
  labels,
}: EagleFlightPanelProps) {
  const inFlight = phase === "flying";
  const finished = phase === "finished";
  const displayRoundOutcome = phase === "crashed" ? "lost" : roundOutcome;
  const roundSettled = finished && roundOutcome != null;
  const showStats = inFlight || phase === "crashed" || roundSettled;
  const gameLaunched = phase !== "betting";
  const betControlsDisabled = controlsLocked || inFlight || autoRunning;
  const modeLocked = controlsLocked || inFlight || autoRunning;
  const isAuto = mode === "auto";

  const startOrCancelButton = (
    <button
      type="button"
      className={`plinko-bet-btn${autoRunning ? " plinko-bet-btn-cancel" : ""}`}
      disabled={!autoRunning && (controlsLocked || autoBetCount < 1)}
      onClick={onBet}
    >
      {autoRunning ? labels.autoCancel : labels.bet}
    </button>
  );

  const cashOutButton = (
    <button
      type="button"
      className="plinko-bet-btn eagle-flight-cashout-btn"
      disabled={controlsLocked}
      onClick={onCashOut}
    >
      {labels.cashOut}
    </button>
  );

  const manualBetButton = (
    <button type="button" className="plinko-bet-btn" disabled={controlsLocked} onClick={onBet}>
      {labels.bet}
    </button>
  );

  return (
    <aside className={`plinko-panel eagle-flight-panel${gameLaunched ? " eagle-flight-panel-launched" : ""}`}>
      <div className="plinko-mode-tabs plinko-panel-full plinko-order-mode">
        <button
          type="button"
          className={mode === "manual" ? "plinko-mode-active" : ""}
          onClick={() => onModeChange("manual")}
          disabled={modeLocked}
        >
          {labels.manual}
        </button>
        <button
          type="button"
          className={mode === "auto" ? "plinko-mode-active" : ""}
          onClick={() => onModeChange("auto")}
          disabled={modeLocked}
        >
          {labels.auto}
        </button>
      </div>

      {inFlight && (
        <div className="eagle-flight-mobile-actions plinko-panel-full">
          {cashOutButton}
          {isAuto && autoRunning ? startOrCancelButton : null}
        </div>
      )}

      <div className="mines-bet-block plinko-panel-full plinko-order-bet">
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

      <div className="eagle-flight-cashout-at-block plinko-panel-full plinko-order-settings">
        <span className="eagle-flight-cashout-at-label">{labels.cashoutAt}</span>
        <EagleFlightCashoutAtInput
          value={autoCashoutAt}
          onChange={onAutoCashoutAtChange}
          disabled={betControlsDisabled}
        />
      </div>

      {isAuto && (
        <label className="plinko-field plinko-panel-full plinko-stake-auto plinko-order-auto">
          <span>{labels.autoCount}</span>
          <IntegerCountInput
            value={autoBetCount}
            onChange={onAutoBetCountChange}
            min={0}
            max={EAGLE_FLIGHT_MAX_AUTO_BETS}
            disabled={betControlsDisabled}
            startWithZero
          />
        </label>
      )}

      {!inFlight && (
        <div className="eagle-flight-panel-bet-mobile plinko-panel-full plinko-order-bet-btn">
          {isAuto ? startOrCancelButton : manualBetButton}
        </div>
      )}

      <div
        className={`mines-panel-primary plinko-panel-full plinko-order-bet-btn${inFlight ? " eagle-flight-panel-actions-desktop" : ""}`}
      >
        {isAuto ? (
          <div className={`eagle-flight-auto-actions${!inFlight ? " eagle-flight-panel-bet-desktop" : ""}`}>
            {inFlight ? cashOutButton : null}
            {startOrCancelButton}
          </div>
        ) : inFlight ? (
          cashOutButton
        ) : (
          <button
            type="button"
            className="plinko-bet-btn eagle-flight-panel-bet-desktop"
            disabled={controlsLocked}
            onClick={onBet}
          >
            {labels.bet}
          </button>
        )}
      </div>

      {showStats && (
        <div className="mines-panel-stats plinko-panel-full plinko-order-result">
          <div className="mines-stat-row">
            <span>{labels.multiplier}</span>
            <strong>{formatStatMultiplier(currentMultiplier, displayRoundOutcome, formatEagleFlightMultiplier)}</strong>
          </div>
          <GamePayoutStatRow
            gainLabel={labels.gain}
            potentialPayoutLabel={labels.potentialPayout}
            gainAmount={payoutDisplay.gainAmount}
            potentialAmount={payoutDisplay.potentialAmount}
            roundOutcome={displayRoundOutcome}
          />
          <GameProfitStatRow
            label={labels.profit}
            zeroAmount={profitDisplay.zeroAmount}
            liveAmount={profitDisplay.liveAmount}
            winAmount={profitDisplay.winAmount}
            lossAmount={profitDisplay.lossAmount}
            inRound={inFlight}
            roundOutcome={displayRoundOutcome}
            pending={phase === "crashed"}
          />
        </div>
      )}
    </aside>
  );
}
