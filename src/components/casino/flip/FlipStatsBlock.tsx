"use client";

import { GameProfitStatRow } from "@/components/casino/GameProfitStatRow";
import { GamePayoutStatRow } from "@/components/casino/GamePayoutStatRow";
import { LibertyAmountValue } from "@/components/wallet/LibertyAmountValue";
import { formatFlipMultiplier } from "@/lib/casino/flip/config";
import type { GamePayoutDisplayAmounts, GameProfitDisplayAmounts } from "@/lib/casino/gameProfitDisplay";
import { formatStatMultiplier } from "@/lib/casino/gameProfitDisplay";
import type { FlipRoundOutcome } from "@/lib/casino/flip/types";

interface FlipStatsBlockProps {
  cumulativeMultiplier: number;
  payoutDisplay: GamePayoutDisplayAmounts;
  profitDisplay: GameProfitDisplayAmounts;
  inRound: boolean;
  roundOutcome: FlipRoundOutcome | null;
  nextMultiplier?: string | null;
  nextPotentialPayout?: string | null;
  className?: string;
  labels: {
    multiplier: string;
    payout: string;
    gain: string;
    potentialPayout: string;
    nextMultiplier: string;
    nextPayout: string;
    profit: string;
  };
}

export function FlipStatsBlock({
  cumulativeMultiplier,
  payoutDisplay,
  profitDisplay,
  inRound,
  roundOutcome,
  nextMultiplier,
  nextPotentialPayout,
  className = "",
  labels,
}: FlipStatsBlockProps) {
  const showNext = nextMultiplier != null && nextPotentialPayout != null;

  return (
    <div className={`mines-panel-stats flip-stats-block${className ? ` ${className}` : ""}`}>
      <div className="mines-stat-row">
        <span>{labels.multiplier}</span>
        <strong>{formatStatMultiplier(cumulativeMultiplier, roundOutcome, formatFlipMultiplier)}</strong>
      </div>
      <GamePayoutStatRow
        gainLabel={labels.gain}
        potentialPayoutLabel={labels.potentialPayout}
        gainAmount={payoutDisplay.gainAmount}
        potentialAmount={payoutDisplay.potentialAmount}
        roundOutcome={roundOutcome}
      />
      {showNext && (
        <>
          <div className="mines-stat-row mines-stat-next">
            <span>{labels.nextMultiplier}</span>
            <strong>{nextMultiplier}</strong>
          </div>
          <div className="mines-stat-row mines-stat-next">
            <span>{labels.nextPayout}</span>
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
  );
}
