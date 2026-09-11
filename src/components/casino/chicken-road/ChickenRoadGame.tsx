"use client";

import { useState, useEffect } from "react";
import { ChickenRoadArena } from "@/components/casino/chicken-road/ChickenRoadArena";
import { ChickenRoadPanel } from "@/components/casino/chicken-road/ChickenRoadPanel";
import { GameShellHeader } from "@/components/casino/GameShellHeader";
import { amountToastMessage } from "@/components/wallet/AmountToastMessage";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/components/providers/AuthProvider";
import { useAppUI } from "@/components/providers/AppUIProvider";
import { useGameWallet } from "@/lib/wallet/useGameWallet";
import { LIBERTY_MIN_BET, roundLiberty } from "@/lib/wallet/types";
import {
  advanceChickenRoad,
  createInitialChickenRoadState,
  getChickenRoadDisplayMultiplier,
  getChickenRoadPayout,
  getChickenRoadMissedPayout,
  getChickenRoadProfit,
  startChickenRoadRound,
} from "@/lib/casino/chicken-road/engine";
import { DIFFICULTY_CONFIG, formatChickenRoadMultiplier } from "@/lib/casino/chicken-road/config";
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
import type { ChickenRoadDifficulty, ChickenRoadState } from "@/lib/casino/chicken-road/types";
import type { TranslationKey } from "@/lib/i18n/translations";
import { useGameSounds } from "@/lib/casino/sounds/useGameSounds";

const DEFAULT_BET = 1;
const STEP_ANIM_MS = 720;
import { CRASH_TOTAL_MS } from "@/lib/casino/chicken-road/crash";
import { CR2_VICTORY_ROLL_MS } from "@/lib/casino/chicken-road/scrollTrack";

type CelebrationPhase = "none" | "rolling" | "dancing";

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export function ChickenRoadGame({ backHref = "/jeux" }: { backHref?: string }) {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { play, playWin, playLose, playVictoryDance, stopVictoryDance } = useGameSounds();
  const { user } = useAuth();
  const { openAuth } = useAppUI();
  const { getLibertyBalance, spendLiberty, creditLiberty, formatLiberty } = useGameWallet();

  const [betAmount, setBetAmount] = useState(DEFAULT_BET);
  const [difficulty, setDifficulty] = useState<ChickenRoadDifficulty>("easy");
  const [gameState, setGameState] = useState<ChickenRoadState>(() =>
    createInitialChickenRoadState("easy"),
  );
  const [animating, setAnimating] = useState(false);
  const [crashAnimating, setCrashAnimating] = useState(false);
  const [returningHome, setReturningHome] = useState(false);
  const [celebrationPhase, setCelebrationPhase] = useState<CelebrationPhase>("none");

  const controlsLocked =
    animating || crashAnimating || returningHome || celebrationPhase === "rolling";

  useEffect(() => {
    if (celebrationPhase === "dancing") {
      playVictoryDance();
    } else {
      stopVictoryDance();
    }

    return () => stopVictoryDance();
  }, [celebrationPhase, playVictoryDance, stopVictoryDance]);

  const setMaxBet = () => setBetAmount(Math.max(LIBERTY_MIN_BET, roundLiberty(getLibertyBalance())));

  const handleDifficultyChange = (next: ChickenRoadDifficulty) => {
    setDifficulty(next);
    if (gameState.phase === "betting") {
      setGameState(createInitialChickenRoadState(next));
    }
  };

  const handleBet = () => {
    if (!user) {
      openAuth("login");
      return;
    }

    if (betAmount < LIBERTY_MIN_BET) {
      showToast(t("walletInvalidAmount"));
      return;
    }

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
    setCelebrationPhase("none");
    setGameState(startChickenRoadRound(betAmount, difficulty));
  };

  const finishCashOut = (state: ChickenRoadState, options?: { keepChickenAtFinish?: boolean }) => {
    const payout = getChickenRoadPayout(state);
    const profit = getChickenRoadProfit(state);
    creditLiberty(payout);

    const outcome = getBetOutcome(profit);
    const multLabel = formatChickenRoadMultiplier(state.cumulativeMultiplier);

    if (outcome === "win") {
      playWin();
      showToast(
        amountToastMessage(t("chickenRoadWin"), {
          amount: formatLiberty(profit),
          mult: multLabel,
        }),
      );
    } else {
      showToast(
        amountToastMessage(t("chickenRoadWin"), {
          amount: formatLiberty(0),
          mult: multLabel,
        }),
      );
    }

    setGameState({
      ...state,
      phase: "finished",
      roundOutcome: "won",
      currentStep: options?.keepChickenAtFinish ? state.currentStep : 0,
    });
  };

  const handleCashOut = async () => {
    if (gameState.phase !== "playing" || gameState.currentStep === 0 || controlsLocked) return;

    const winState = gameState;
    setReturningHome(true);
    setAnimating(true);
    setGameState({ ...gameState, currentStep: 0 });

    await delay(STEP_ANIM_MS);
    setAnimating(false);
    setReturningHome(false);
    finishCashOut(winState);
  };

  const handleAdvance = async () => {
    if (gameState.phase !== "playing" || controlsLocked) return;

    const { maxSteps } = DIFFICULTY_CONFIG[gameState.difficulty];
    if (gameState.currentStep >= maxSteps) return;

    setAnimating(true);
    play("hit");

    const result = advanceChickenRoad(gameState);
    setGameState(result.state);

    if (result.crashed) {
      await delay(STEP_ANIM_MS);
      setAnimating(false);
      setCrashAnimating(true);
      await delay(CRASH_TOTAL_MS);
      setCrashAnimating(false);
      showToast(
        amountToastMessage(t("chickenRoadLoss"), {
          amount: formatLiberty(formatBetLossAmount(computeBetNet(0, gameState.bet))),
        }),
      );
      return;
    }

    await delay(STEP_ANIM_MS);
    setAnimating(false);

    if (result.reachedMax) {
      finishCashOut(result.state, { keepChickenAtFinish: true });
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setCelebrationPhase("rolling");
            resolve();
          });
        });
      });
      await delay(CR2_VICTORY_ROLL_MS);
      setCelebrationPhase("dancing");
    }
  };

  const livePayout = getChickenRoadPayout(gameState);
  const payoutDisplay = buildGamePayoutDisplayAmounts(
    formatLiberty,
    gameState.roundOutcome,
    livePayout,
    getChickenRoadMissedPayout(gameState),
  );
  const finished = gameState.phase === "finished";
  const profitDisplay = buildGameProfitDisplayAmounts(
    formatLiberty,
    gameState.bet,
    gameState.phase === "playing" ? getChickenRoadProfit(gameState) : 0,
    resolveSettledWinProfit(finished, gameState.roundOutcome, getChickenRoadProfit(gameState)),
  );

  return (
    <div className="plinko-game chicken-road-game blackjack-game">
      <div className="plinko-shell chicken-road-shell">
        <GameShellHeader
          backHref={backHref}
          title={t("originalChickenRoad")}
          rulesTitleKey="chickenRoadRulesTitle"
          rulesBodyKey="chickenRoadRulesBody"
        />

        <div className="plinko-layout chicken-road-layout">
          <ChickenRoadArena
            gameState={gameState}
            animating={animating}
            crashAnimating={crashAnimating}
            returningHome={returningHome}
            celebrationPhase={celebrationPhase}
            onCrashImpact={playLose}
          />

          <ChickenRoadPanel
            betAmount={betAmount}
            onBetAmountChange={setBetAmount}
            difficulty={difficulty}
            onDifficultyChange={handleDifficultyChange}
            cumulativeMultiplier={getChickenRoadDisplayMultiplier(gameState)}
            payoutDisplay={payoutDisplay}
            profitDisplay={profitDisplay}
            roundOutcome={gameState.roundOutcome}
            phase={gameState.phase}
            currentStep={gameState.currentStep}
            controlsLocked={controlsLocked}
            onBet={handleBet}
            onAdvance={handleAdvance}
            onCashOut={handleCashOut}
            setMaxBet={setMaxBet}
            labels={{
              betAmount: t("plinkoBetAmount"),
              bet: t("chickenRoadBet"),
              advance: t("chickenRoadAdvance"),
              cashOut: t("chickenRoadCashOut"),
              multiplier: t("chickenRoadMultiplier"),
              payout: t("chickenRoadPayout"),
              gain: t("gamesStatGain"),
              potentialPayout: t("gamesStatPotentialPayout"),
              profit: t("chickenRoadProfit"),
              difficulty: t("chickenRoadDifficulty"),
              difficultyEasy: t("chickenRoadDifficultyEasy"),
              difficultyMedium: t("chickenRoadDifficultyMedium"),
              difficultyHard: t("chickenRoadDifficultyHard"),
              difficultyHardcore: t("chickenRoadDifficultyHardcore"),
            }}
          />
        </div>
      </div>
    </div>
  );
}
