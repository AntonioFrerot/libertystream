"use client";

import { BlackjackBetRow } from "@/components/casino/blackjack/BlackjackBetRow";
import { GameProfitStatRow } from "@/components/casino/GameProfitStatRow";
import { GamePayoutStatRow } from "@/components/casino/GamePayoutStatRow";
import { LibertyAmountValue } from "@/components/wallet/LibertyAmountValue";
import { CHICKEN_ROAD_DIFFICULTIES, formatChickenRoadMultiplier } from "@/lib/casino/chicken-road/config";
import type { ChickenRoadDifficulty, ChickenRoadPhase, ChickenRoadRoundOutcome } from "@/lib/casino/chicken-road/types";
import type { GamePayoutDisplayAmounts, GameProfitDisplayAmounts } from "@/lib/casino/gameProfitDisplay";
import { formatStatMultiplier } from "@/lib/casino/gameProfitDisplay";

interface ChickenRoadPanelProps {
  betAmount: number;
  onBetAmountChange: (value: number) => void;
  difficulty: ChickenRoadDifficulty;
  onDifficultyChange: (value: ChickenRoadDifficulty) => void;
  cumulativeMultiplier: number;
  payoutDisplay: GamePayoutDisplayAmounts;
  profitDisplay: GameProfitDisplayAmounts;
  roundOutcome: ChickenRoadRoundOutcome | null;
  phase: ChickenRoadPhase;
  currentStep: number;
  controlsLocked: boolean;
  onBet: () => void;
  onAdvance: () => void;
  onCashOut: () => void;
  setMaxBet: () => void;
  labels: {
    betAmount: string;
    bet: string;
    advance: string;
    cashOut: string;
    multiplier: string;
    payout: string;
    gain: string;
    potentialPayout: string;
    profit: string;
    difficulty: string;
    difficultyEasy: string;
    difficultyMedium: string;
    difficultyHard: string;
    difficultyHardcore: string;
  };
}

const DIFFICULTY_LABELS: Record<
  ChickenRoadDifficulty,
  keyof ChickenRoadPanelProps["labels"]
> = {
  easy: "difficultyEasy",
  medium: "difficultyMedium",
  hard: "difficultyHard",
  hardcore: "difficultyHardcore",
};

export function ChickenRoadPanel({
  betAmount,
  onBetAmountChange,
  difficulty,
  onDifficultyChange,
  cumulativeMultiplier,
  payoutDisplay,
  profitDisplay,
  roundOutcome,
  phase,
  currentStep,
  controlsLocked,
  onBet,
  onAdvance,
  onCashOut,
  setMaxBet,
  labels,
}: ChickenRoadPanelProps) {
  const inRound = phase === "playing";
  const finished = phase === "finished";
  const gameLaunched = phase !== "betting";
  const betControlsDisabled = controlsLocked || inRound;
  const canCashOut = inRound && currentStep > 0;

  const roundActions = (
    <div className="chicken-road-action-row">
      <button
        type="button"
        className="plinko-bet-btn chicken-road-cashout-btn"
        disabled={controlsLocked || !canCashOut}
        onClick={onCashOut}
      >
        {labels.cashOut}
      </button>
      <button
        type="button"
        className="plinko-bet-btn"
        disabled={controlsLocked}
        onClick={onAdvance}
      >
        {labels.advance}
      </button>
    </div>
  );

  return (
    <aside
      className={`plinko-panel chicken-road-panel${gameLaunched ? " chicken-road-panel-launched" : ""}`}
    >
      <div className="chicken-road-bet-block plinko-panel-full">
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

      {!inRound && (
        <div className="chicken-road-mobile-bet plinko-panel-full">
          <button type="button" className="plinko-bet-btn" disabled={controlsLocked} onClick={onBet}>
            {labels.bet}
          </button>
        </div>
      )}

      {inRound && (
        <div className="chicken-road-mobile-actions plinko-panel-full">{roundActions}</div>
      )}

      <div className="chicken-road-difficulty plinko-panel-full">
        <span className="chicken-road-difficulty-label">{labels.difficulty}</span>
        <div className="chicken-road-difficulty-grid">
          {CHICKEN_ROAD_DIFFICULTIES.map((level) => (
            <button
              key={level}
              type="button"
              className={`chicken-road-difficulty-btn chicken-road-difficulty-${level}${
                difficulty === level ? " chicken-road-difficulty-active" : ""
              }`}
              disabled={betControlsDisabled}
              onClick={() => onDifficultyChange(level)}
            >
              {labels[DIFFICULTY_LABELS[level]]}
            </button>
          ))}
        </div>
      </div>

      <div className="chicken-road-panel-primary chicken-road-panel-primary-desktop plinko-panel-full">
        {inRound ? (
          roundActions
        ) : (
          <button type="button" className="plinko-bet-btn" disabled={controlsLocked} onClick={onBet}>
            {labels.bet}
          </button>
        )}
      </div>

      {(inRound || finished) && (
        <div className="chicken-road-panel-stats plinko-panel-full plinko-order-result">
          <div className="chicken-road-stat-row">
            <span>{labels.multiplier}</span>
            <strong>{formatStatMultiplier(cumulativeMultiplier, roundOutcome, formatChickenRoadMultiplier)}</strong>
          </div>
          <GamePayoutStatRow
            gainLabel={labels.gain}
            potentialPayoutLabel={labels.potentialPayout}
            gainAmount={payoutDisplay.gainAmount}
            potentialAmount={payoutDisplay.potentialAmount}
            roundOutcome={roundOutcome}
            variant="chicken-road"
          />
          <GameProfitStatRow
            label={labels.profit}
            zeroAmount={profitDisplay.zeroAmount}
            liveAmount={profitDisplay.liveAmount}
            winAmount={profitDisplay.winAmount}
            lossAmount={profitDisplay.lossAmount}
            inRound={inRound}
            roundOutcome={roundOutcome}
            variant="chicken-road"
          />
        </div>
      )}
    </aside>
  );
}
