"use client";

import { useRef, useState } from "react";
import { FlipArena } from "@/components/casino/flip/FlipArena";
import { FlipPanel, type FlipAutoSide } from "@/components/casino/flip/FlipPanel";
import { GameShellHeader } from "@/components/casino/GameShellHeader";
import { amountToastMessage } from "@/components/wallet/AmountToastMessage";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/components/providers/AuthProvider";
import { useAppUI } from "@/components/providers/AppUIProvider";
import { useGameWallet } from "@/lib/wallet/useGameWallet";
import { LIBERTY_MIN_BET, roundLiberty } from "@/lib/wallet/types";
import { FLIP_ANIM_MS, FLIP_MAX_STREAK, computeFlipTargetRotation, formatFlipMultiplier, getCoinRestRotation, getFlipMultiplier, getNextFlipMultiplier } from "@/lib/casino/flip/config";
import {
  applyAutoFlip,
  applyFlip,
  createInitialFlipState,
  getFlipDisplayMultiplier,
  getFlipPayout,
  getFlipMissedPayout,
  getFlipProfit,
  pickRandomSide,
  startFlipRound,
} from "@/lib/casino/flip/engine";
import {
  computeBetNet,
  formatBetLossAmount,
  getBetOutcome,
} from "@/lib/casino/betOutcome";
import {
  buildGameProfitDisplayAmounts,
  buildGamePayoutDisplayAmounts,
  resolveSettledWinProfit,
} from "@/lib/casino/gameProfitDisplay";
import type { CoinSide, FlipHistoryEntry, FlipState } from "@/lib/casino/flip/types";
import type { TranslationKey } from "@/lib/i18n/translations";
import { useGameSounds } from "@/lib/casino/sounds/useGameSounds";

const DEFAULT_BET = 1;
const FLIP_SETTLE_MS = 280;
const FLIP_AUTO_ROUND_DELAY_MS = 320;

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function resolveAutoSide(autoSide: FlipAutoSide): CoinSide {
  return autoSide === "random" ? pickRandomSide() : autoSide;
}

export function FlipGame({ backHref = "/jeux" }: { backHref?: string }) {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { play, playWin, playLose } = useGameSounds();
  const { user } = useAuth();
  const { openAuth } = useAppUI();
  const { getLibertyBalance, spendLiberty, creditLiberty, formatLiberty } = useGameWallet();

  const [mode, setMode] = useState<"manual" | "auto">("manual");
  const [betAmount, setBetAmount] = useState(DEFAULT_BET);
  const [selectedSide, setSelectedSide] = useState<CoinSide>("eagle");
  const [autoSide, setAutoSide] = useState<FlipAutoSide>("random");
  const [autoFlipCount, setAutoFlipCount] = useState(5);
  const [gameState, setGameState] = useState<FlipState>(createInitialFlipState);
  const [flipping, setFlipping] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [coinRotation, setCoinRotation] = useState(0);
  const [autoRunning, setAutoRunning] = useState(false);

  const autoCancelRef = useRef(false);
  const coinRotationRef = useRef(0);
  const autoHistoryRef = useRef<FlipState["history"]>([]);

  const controlsLocked = flipping || autoRunning;

  const setMaxBet = () => setBetAmount(Math.max(LIBERTY_MIN_BET, roundLiberty(getLibertyBalance())));

  const finishCashOut = (state: FlipState) => {
    const payout = getFlipPayout(state);
    const profit = getFlipProfit(state);
    creditLiberty(payout);

    const outcome = getBetOutcome(profit);
    const multLabel = formatFlipMultiplier(state.cumulativeMultiplier);

    if (outcome === "win") {
      playWin();
      showToast(
        amountToastMessage(t("flipWin"), {
          amount: formatLiberty(profit),
          mult: multLabel,
        }),
      );
    } else {
      showToast(
        amountToastMessage(t("flipWin"), {
          amount: formatLiberty(0),
          mult: multLabel,
        }),
      );
    }

    setGameState({ ...state, phase: "finished", roundOutcome: "won" });
  };

  const handleLoss = (state: FlipState) => {
    playLose();
    showToast(
      amountToastMessage(t("flipLoss"), {
        amount: formatLiberty(formatBetLossAmount(computeBetNet(0, state.bet))),
      }),
    );
    setGameState(state);
  };

  const resetCoinRotation = () => {
    coinRotationRef.current = 0;
    setCoinRotation(0);
  };

  const animateCoinTo = (targetSide: CoinSide) =>
    new Promise<void>((resolve) => {
      const nextRotation = computeFlipTargetRotation(coinRotationRef.current, targetSide);
      coinRotationRef.current = nextRotation;
      setFlipping(true);
      setShowResult(false);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setCoinRotation(nextRotation);
        });
      });

      window.setTimeout(resolve, FLIP_ANIM_MS);
    });

  const runFlipAnimation = async (side: CoinSide, state: FlipState, autoRound = false) => {
    const result = autoRound ? applyAutoFlip(state, side) : applyFlip(state, side);
    play("flip");

    await animateCoinTo(result.result);

    const restRotation = getCoinRestRotation(result.result);
    coinRotationRef.current = restRotation;
    setFlipping(false);
    setCoinRotation(restRotation);

    setShowResult(true);
    setGameState(result.state);

    await delay(FLIP_SETTLE_MS);

    if (!result.won) {
      handleLoss(result.state);
      return result;
    }

    if (autoRound || (result.state.phase === "finished" && result.state.roundOutcome === "won")) {
      finishCashOut(result.state);
    }

    return result;
  };

  const handleBet = async () => {
    if (!user) {
      openAuth("login");
      return;
    }

    if (mode === "auto" && autoRunning) {
      autoCancelRef.current = true;
      return;
    }

    if (betAmount < LIBERTY_MIN_BET) {
      showToast(t("walletInvalidAmount"));
      return;
    }

    if (mode === "auto") {
      if (autoFlipCount < 1) {
        return;
      }

      setAutoRunning(true);
      autoCancelRef.current = false;
      autoHistoryRef.current = [];

      let remaining = autoFlipCount;

      while (remaining > 0 && !autoCancelRef.current) {
        if (getLibertyBalance() < betAmount) {
          showToast(t("walletInsufficient"));
          break;
        }

        const spendErr = spendLiberty(betAmount);
        if (spendErr) {
          showToast(t(spendErr as TranslationKey));
          break;
        }

        play("bet");
        setShowResult(false);
        resetCoinRotation();

        const roundState = {
          ...startFlipRound(betAmount),
          history: [...autoHistoryRef.current],
        };
        setGameState(roundState);

        const side = resolveAutoSide(autoSide);
        const result = await runFlipAnimation(side, roundState, true);
        autoHistoryRef.current = result.state.history;

        remaining -= 1;
        setAutoFlipCount(remaining);
        if (remaining > 0 && !autoCancelRef.current) {
          await delay(FLIP_AUTO_ROUND_DELAY_MS);
        }
      }

      setAutoRunning(false);
      return;
    }

    autoHistoryRef.current = [];

    if (getLibertyBalance() < betAmount) {
      showToast(t("walletInsufficient"));
      return;
    }

    const err = spendLiberty(betAmount);
    if (err) {
      showToast(t(err as TranslationKey));
      return;
    }

    play("bet");
    setShowResult(false);
    resetCoinRotation();

    const nextState = startFlipRound(betAmount);
    setGameState(nextState);

    await runFlipAnimation(selectedSide, nextState);
  };

  const handleFlip = async () => {
    if (gameState.phase !== "playing" || controlsLocked || gameState.streak <= 0) return;
    await runFlipAnimation(selectedSide, gameState);
  };

  const handleCashOut = () => {
    if (gameState.phase !== "playing" || gameState.streak <= 0 || controlsLocked) return;
    finishCashOut(gameState);
  };

  const livePayout = getFlipPayout(gameState);
  const payoutDisplay = buildGamePayoutDisplayAmounts(
    formatLiberty,
    gameState.roundOutcome,
    livePayout,
    getFlipMissedPayout(gameState),
  );
  const finished = gameState.phase === "finished";
  const profitDisplay = buildGameProfitDisplayAmounts(
    formatLiberty,
    gameState.bet,
    gameState.phase === "playing" ? getFlipProfit(gameState) : 0,
    resolveSettledWinProfit(finished, gameState.roundOutcome, getFlipProfit(gameState)),
  );
  const canShowNext =
    gameState.phase === "playing" && gameState.streak < FLIP_MAX_STREAK;
  const nextMultiplier = canShowNext
    ? formatFlipMultiplier(getNextFlipMultiplier(gameState.streak))
    : null;
  const nextPotentialPayout = canShowNext
    ? formatLiberty(roundLiberty(gameState.bet * getFlipMultiplier(gameState.streak + 1)))
    : null;

  return (
    <div className={`plinko-game flip-game hilo-game blackjack-game${mode === "auto" ? " flip-mode-auto" : ""}`}>
      <div className="plinko-shell flip-shell hilo-shell">
        <GameShellHeader
          backHref={backHref}
          title={t("originalFlip")}
          rulesTitleKey="flipRulesTitle"
          rulesBodyKey="flipRulesBody"
        />

        <div className="plinko-layout flip-layout hilo-layout">
          <FlipPanel
            mode={mode}
            onModeChange={setMode}
            betAmount={betAmount}
            onBetAmountChange={setBetAmount}
            selectedSide={selectedSide}
            onSideChange={setSelectedSide}
            autoSide={autoSide}
            onAutoSideChange={setAutoSide}
            autoFlipCount={autoFlipCount}
            onAutoFlipCountChange={setAutoFlipCount}
            phase={gameState.phase}
            streak={gameState.streak}
            cumulativeMultiplier={getFlipDisplayMultiplier(gameState)}
            payoutDisplay={payoutDisplay}
            profitDisplay={profitDisplay}
            roundOutcome={gameState.roundOutcome}
            nextMultiplier={nextMultiplier}
            nextPotentialPayout={nextPotentialPayout}
            controlsLocked={controlsLocked}
            autoRunning={autoRunning}
            onBet={handleBet}
            onFlip={handleFlip}
            onCashOut={handleCashOut}
            setMaxBet={setMaxBet}
            labels={{
              manual: t("plinkoManual"),
              auto: t("plinkoAuto"),
              betAmount: t("plinkoBetAmount"),
              bet: t("flipBet"),
              flip: t("flipFlip"),
              cashOut: t("flipCashOut"),
              multiplier: t("flipMultiplier"),
              payout: t("flipPayout"),
              gain: t("gamesStatGain"),
              potentialPayout: t("gamesStatPotentialPayout"),
              profit: t("flipProfit"),
              nextMultiplier: t("flipNextMultiplier"),
              nextPayout: t("flipNextGain"),
              eagle: t("flipEagle"),
              snake: t("flipSnake"),
              randomOption: t("flipPickRandom"),
              autoFlips: t("flipAutoFlips"),
              randomSide: t("flipRandomSide"),
              autoCancel: t("plinkoAutoCancel"),
            }}
          />

          <FlipArena
            flipping={flipping}
            coinRotation={coinRotation}
            showResult={showResult}
            phase={gameState.phase}
            history={gameState.history}
            startHint={t("flipStartHint")}
            historyLabel={t("flipHistory")}
            historyEmpty={t("flipHistoryEmpty")}
            eagleLabel={t("flipEagle")}
            snakeLabel={t("flipSnake")}
            selectedSide={selectedSide}
            sideDisabled={controlsLocked || autoRunning}
            onSideChange={setSelectedSide}
            showSidePicker={mode === "manual"}
            showNextMultiplierBadge={mode === "manual"}
            nextMultiplier={nextMultiplier}
            nextMultiplierLabel={t("flipNextMultiplier")}
            historyAutoMode={mode === "auto"}
          />
        </div>
      </div>
    </div>
  );
}
