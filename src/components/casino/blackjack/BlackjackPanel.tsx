"use client";

import { BlackjackBetRow } from "@/components/casino/blackjack/BlackjackBetRow";

export type HandCount = 1 | 2 | 3;

interface BlackjackPanelProps {
  handCount: HandCount;
  onHandCountChange: (count: HandCount) => void;
  betAmount: number;
  onBetAmountChange: (value: number) => void;
  perfectPairsBet: number;
  onPerfectPairsChange: (value: number) => void;
  twentyOnePlusThreeBet: number;
  onTwentyOnePlusThreeChange: (value: number) => void;
  disabled: boolean;
  controlsLocked: boolean;
  phaseInsurance: boolean;
  insuranceAmount: string;
  onInsuranceYes: () => void;
  onInsuranceNo: () => void;
  canHit: boolean;
  canStand: boolean;
  canDouble: boolean;
  canSplit: boolean;
  onHit: () => void;
  onStand: () => void;
  onDouble: () => void;
  onSplit: () => void;
  onBet: () => void;
  betLabel: string;
  primaryDisabled: boolean;
  labels: {
    hand1: string;
    hand2: string;
    hand3: string;
    betAmount: string;
    perfectPairs: string;
    perfectPairsInfoTitle: string;
    perfectPairsInfoBody: string;
    twentyOnePlus3: string;
    twentyOnePlus3InfoTitle: string;
    twentyOnePlus3InfoBody: string;
    hit: string;
    stand: string;
    split: string;
    double: string;
    insuranceOffer: string;
    insuranceYes: string;
    insuranceNo: string;
  };
  setMaxBet: () => void;
}

export function BlackjackPanel({
  handCount,
  onHandCountChange,
  betAmount,
  onBetAmountChange,
  perfectPairsBet,
  onPerfectPairsChange,
  twentyOnePlusThreeBet,
  onTwentyOnePlusThreeChange,
  disabled,
  controlsLocked,
  phaseInsurance,
  insuranceAmount,
  onInsuranceYes,
  onInsuranceNo,
  canHit,
  canStand,
  canDouble,
  canSplit,
  onHit,
  onStand,
  onDouble,
  onSplit,
  onBet,
  betLabel,
  primaryDisabled,
  labels,
  setMaxBet,
}: BlackjackPanelProps) {
  const handTabs: { count: HandCount; label: string }[] = [
    { count: 1, label: labels.hand1 },
    { count: 2, label: labels.hand2 },
    { count: 3, label: labels.hand3 },
  ];

  const betControlsDisabled = disabled || controlsLocked;
  const actionsDisabled = controlsLocked;
  const showPlayerActions = canHit || canSplit || canDouble;

  return (
    <aside className="plinko-panel">
      <div className="plinko-mode-tabs plinko-panel-full plinko-order-mode">
        {handTabs.map(({ count, label }) => (
          <button
            key={count}
            type="button"
            className={handCount === count ? "plinko-mode-active" : ""}
            onClick={() => onHandCountChange(count)}
            disabled={betControlsDisabled}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="plinko-order-bet blackjack-main-bet">
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

      <button
        type="button"
        className="plinko-bet-btn plinko-panel-full plinko-order-bet-btn"
        onClick={onBet}
        disabled={primaryDisabled}
      >
        {betLabel}
      </button>

      <div className="blackjack-side-bets plinko-order-side">
        <BlackjackBetRow
          label={labels.perfectPairs}
          value={perfectPairsBet}
          onChange={onPerfectPairsChange}
          disabled={betControlsDisabled}
          startWithZero
          infoTitle={labels.perfectPairsInfoTitle}
          infoBody={labels.perfectPairsInfoBody}
          infoBtnClass="blackjack-bet-info-btn-perfect-pairs"
          onHalf={() => onPerfectPairsChange(Math.max(0, perfectPairsBet / 2))}
          onDouble={() => onPerfectPairsChange(perfectPairsBet * 2)}
        />

        <BlackjackBetRow
          label={labels.twentyOnePlus3}
          value={twentyOnePlusThreeBet}
          onChange={onTwentyOnePlusThreeChange}
          disabled={betControlsDisabled}
          startWithZero
          infoTitle={labels.twentyOnePlus3InfoTitle}
          infoBody={labels.twentyOnePlus3InfoBody}
          infoBtnClass="blackjack-bet-info-btn-21plus3"
          onHalf={() => onTwentyOnePlusThreeChange(Math.max(0, twentyOnePlusThreeBet / 2))}
          onDouble={() => onTwentyOnePlusThreeChange(twentyOnePlusThreeBet * 2)}
        />
      </div>

      {phaseInsurance && (
        <div className="blackjack-insurance plinko-panel-full plinko-order-settings">
          <p className="blackjack-insurance-text">{labels.insuranceOffer}</p>
          <div className="blackjack-action-grid">
            <button
              type="button"
              className="blackjack-action-btn"
              onClick={onInsuranceYes}
              disabled={controlsLocked}
            >
              {labels.insuranceYes} ({insuranceAmount})
            </button>
            <button
              type="button"
              className="blackjack-action-btn secondary"
              onClick={onInsuranceNo}
              disabled={controlsLocked}
            >
              {labels.insuranceNo}
            </button>
          </div>
        </div>
      )}

      <div
        className={`blackjack-action-grid plinko-panel-full plinko-order-actions${
          showPlayerActions ? " blackjack-action-grid-in-play" : ""
        }`}
      >
        <button
          type="button"
          className="blackjack-action-btn"
          onClick={onHit}
          disabled={!canHit || actionsDisabled}
        >
          {labels.hit}
        </button>
        <button
          type="button"
          className="blackjack-action-btn"
          onClick={onStand}
          disabled={!canStand || actionsDisabled}
        >
          {labels.stand}
        </button>
        <button
          type="button"
          className="blackjack-action-btn"
          onClick={onSplit}
          disabled={!canSplit || actionsDisabled}
        >
          {labels.split}
        </button>
        <button
          type="button"
          className="blackjack-action-btn"
          onClick={onDouble}
          disabled={!canDouble || actionsDisabled}
        >
          {labels.double}
        </button>
      </div>
    </aside>
  );
}
