"use client";

import { BlackjackBetRow } from "@/components/casino/blackjack/BlackjackBetRow";
import { GameProfitStatRow } from "@/components/casino/GameProfitStatRow";
import { GamePayoutStatRow } from "@/components/casino/GamePayoutStatRow";
import { IntegerCountInput } from "@/components/casino/IntegerCountInput";
import { LibertyAmountValue } from "@/components/wallet/LibertyAmountValue";
import {
  formatMinesMultiplier,
  MINES_GRID_SIZE,
  MINES_MAX_AUTO_BETS,
  MINES_MAX_COUNT,
  MINES_MIN_COUNT,
} from "@/lib/casino/mines/config";
import type { MinesPhase, MinesRoundOutcome } from "@/lib/casino/mines/types";
import type { GamePayoutDisplayAmounts, GameProfitDisplayAmounts } from "@/lib/casino/gameProfitDisplay";
import { formatStatMultiplier } from "@/lib/casino/gameProfitDisplay";

type PlayMode = "manual" | "auto";

interface MinesPanelProps {
  betAmount: number;
  onBetAmountChange: (value: number) => void;
  mineCount: number;
  onMineCountChange: (value: number) => void;
  mode: PlayMode;
  onModeChange: (mode: PlayMode) => void;
  autoBetCount: number;
  onAutoBetCountChange: (value: number) => void;
  autoGemCount: number;
  onAutoGemCountChange: (value: number) => void;
  autoRunning: boolean;
  cumulativeMultiplier: number;
  payoutDisplay: GamePayoutDisplayAmounts;
  profitDisplay: GameProfitDisplayAmounts;
  roundOutcome: MinesRoundOutcome | null;
  nextMultiplier: string | null;
  nextPotentialPayout: string | null;
  phase: MinesPhase;
  gemsFound: number;
  controlsLocked: boolean;
  onBet: () => void;
  onCashOut: () => void;
  onPickRandom: () => void;
  setMaxBet: () => void;
  labels: {
    betAmount: string;
    bet: string;
    cashOut: string;
    pickRandom: string;
    multiplier: string;
    payout: string;
    gain: string;
    potentialPayout: string;
    nextPayout: string;
    nextGain: string;
    profit: string;
    mines: string;
    gems: string;
    gemsFound: string;
    manual: string;
    auto: string;
    autoCount: string;
    autoGems: string;
    autoCancel: string;
  };
}

export function MinesPanel({
  betAmount,
  onBetAmountChange,
  mineCount,
  onMineCountChange,
  mode,
  onModeChange,
  autoBetCount,
  onAutoBetCountChange,
  autoGemCount,
  onAutoGemCountChange,
  autoRunning,
  cumulativeMultiplier,
  payoutDisplay,
  profitDisplay,
  roundOutcome,
  nextMultiplier,
  nextPotentialPayout,
  phase,
  gemsFound,
  controlsLocked,
  onBet,
  onCashOut,
  onPickRandom,
  setMaxBet,
  labels,
}: MinesPanelProps) {
  const inRound = phase === "playing";
  const finished = phase === "finished";
  const gameLaunched = phase !== "betting";
  const betControlsDisabled = controlsLocked || inRound || autoRunning;
  const modeLocked = controlsLocked || inRound || autoRunning;
  const canCashOut = inRound && gemsFound > 0;
  const totalGems = MINES_GRID_SIZE - mineCount;
  const isAuto = mode === "auto";
  const maxAutoGems = Math.max(1, totalGems);

  const clampMines = (value: number) =>
    Math.min(MINES_MAX_COUNT, Math.max(MINES_MIN_COUNT, value));

  const startOrCancelButton = (
    <button
      type="button"
      className={`plinko-bet-btn${autoRunning ? " plinko-bet-btn-cancel" : ""}`}
      disabled={!autoRunning && (controlsLocked || autoBetCount < 1 || autoGemCount < 1)}
      onClick={onBet}
    >
      {autoRunning ? labels.autoCancel : labels.bet}
    </button>
  );

  const cashOutButton = (
    <button
      type="button"
      className="plinko-bet-btn mines-cashout-btn"
      disabled={controlsLocked || !canCashOut}
      onClick={onCashOut}
    >
      {labels.cashOut}
    </button>
  );

  const pickRandomButton = (
    <button
      type="button"
      className="mines-pick-random-btn"
      disabled={controlsLocked}
      onClick={onPickRandom}
    >
      {labels.pickRandom}
    </button>
  );

  const manualBetButton = (
    <button type="button" className="plinko-bet-btn" disabled={controlsLocked} onClick={onBet}>
      {labels.bet}
    </button>
  );

  return (
    <aside
      className={`plinko-panel mines-panel${gameLaunched ? " mines-panel-launched" : ""}`}
    >
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

      {inRound && (
        <div className="mines-mobile-actions plinko-panel-full">
          {cashOutButton}
          {isAuto && autoRunning ? startOrCancelButton : pickRandomButton}
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

      <div className="mines-count-block plinko-panel-full plinko-order-settings">
        <span className="mines-count-label">{labels.mines}</span>
        <div className="mines-count-slider-row">
          <input
            type="range"
            className="mines-count-slider"
            min={MINES_MIN_COUNT}
            max={MINES_MAX_COUNT}
            value={mineCount}
            disabled={betControlsDisabled}
            onChange={(e) => onMineCountChange(clampMines(Number(e.target.value)))}
          />
          <span className="mines-count-value">{mineCount}</span>
        </div>
      </div>

      {isAuto && (
        <>
          <label className="plinko-field plinko-panel-full plinko-stake-auto plinko-order-auto">
            <span>{labels.autoCount}</span>
            <IntegerCountInput
              value={autoBetCount}
              onChange={onAutoBetCountChange}
              min={0}
              max={MINES_MAX_AUTO_BETS}
              disabled={betControlsDisabled}
              startWithZero
            />
          </label>
          <label className="plinko-field plinko-panel-full plinko-stake-auto plinko-order-auto">
            <span>{labels.autoGems}</span>
            <IntegerCountInput
              value={autoGemCount}
              onChange={(value) => onAutoGemCountChange(Math.min(Math.max(0, value), maxAutoGems))}
              min={0}
              max={maxAutoGems}
              disabled={betControlsDisabled}
            />
          </label>
        </>
      )}

      {!inRound && (
        <div className="mines-panel-bet-mobile plinko-panel-full plinko-order-bet-btn">
          {isAuto ? startOrCancelButton : manualBetButton}
        </div>
      )}

      <div
        className={`mines-panel-primary plinko-panel-full plinko-order-bet-btn${inRound ? " mines-panel-actions-desktop" : ""}`}
      >
        {isAuto ? (
          <div className={`mines-auto-actions${!inRound ? " mines-panel-bet-desktop" : ""}`}>
            {inRound ? cashOutButton : null}
            {startOrCancelButton}
          </div>
        ) : inRound ? (
          <>
            {cashOutButton}
            {pickRandomButton}
          </>
        ) : (
          <button
            type="button"
            className="plinko-bet-btn mines-panel-bet-desktop"
            disabled={controlsLocked}
            onClick={onBet}
          >
            {labels.bet}
          </button>
        )}
      </div>

      {(inRound || finished) && (
        <div className="mines-panel-stats plinko-panel-full plinko-order-result">
          <div className="mines-stat-row">
            <span>{labels.gemsFound}</span>
            <strong>{gemsFound}/{totalGems}</strong>
          </div>
          <div className="mines-stat-row">
            <span>{labels.multiplier}</span>
            <strong>{formatStatMultiplier(cumulativeMultiplier, roundOutcome, formatMinesMultiplier)}</strong>
          </div>
          <GamePayoutStatRow
            gainLabel={labels.gain}
            potentialPayoutLabel={labels.potentialPayout}
            gainAmount={payoutDisplay.gainAmount}
            potentialAmount={payoutDisplay.potentialAmount}
            roundOutcome={roundOutcome}
          />
          {nextMultiplier && nextPotentialPayout && (
            <>
              <div className="mines-stat-row mines-stat-next">
                <span>{labels.nextPayout}</span>
                <strong>{nextMultiplier}</strong>
              </div>
              <div className="mines-stat-row mines-stat-next">
                <span>{labels.nextGain}</span>
                <LibertyAmountValue amount={nextPotentialPayout} />
              </div>
            </>
          )}
          <GameProfitStatRow
            label={labels.profit}
            zeroAmount={profitDisplay.zeroAmount}
            liveAmount={profitDisplay.liveAmount}
            winAmount={profitDisplay.winAmount}
            lossAmount={profitDisplay.lossAmount}
            inRound={inRound}
            roundOutcome={roundOutcome}
          />
        </div>
      )}
    </aside>
  );
}
