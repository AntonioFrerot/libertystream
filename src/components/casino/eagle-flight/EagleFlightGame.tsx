"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EagleFlightArena } from "@/components/casino/eagle-flight/EagleFlightArena";
import { EagleFlightPanel } from "@/components/casino/eagle-flight/EagleFlightPanel";
import { GameShellHeader } from "@/components/casino/GameShellHeader";
import { amountToastMessage } from "@/components/wallet/AmountToastMessage";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/components/providers/AuthProvider";
import { useAppUI } from "@/components/providers/AppUIProvider";
import { useGameWallet } from "@/lib/wallet/useGameWallet";
import { LIBERTY_MIN_BET, roundLiberty } from "@/lib/wallet/types";
import { EAGLE_FLIGHT_AUTO_GAP_MS, EAGLE_FLIGHT_DEFAULT_TARGET_MULTIPLIER, EAGLE_FLIGHT_MIN_AUTO_CASHOUT, EAGLE_FLIGHT_TICK_MS, clampEagleFlightMultiplier, eagleFlightMaxWin, rollCrashPoint, multiplierAtElapsed } from "@/lib/casino/eagle-flight/config";
import {
  cashOutEagleFlight,
  createInitialEagleFlightState,
  finishEagleFlightCrash,
  getEagleFlightDisplayMultiplier,
  getEagleFlightPayout,
  getEagleFlightMissedPayout,
  getEagleFlightProfit,
  startEagleFlightRound,
  updateEagleFlightMultiplier,
} from "@/lib/casino/eagle-flight/engine";
import { computeBetNet, formatBetLossAmount, getBetOutcome } from "@/lib/casino/betOutcome";
import {
  buildGameProfitDisplayAmounts,
  buildGamePayoutDisplayAmounts,
  resolveSettledWinProfit,
} from "@/lib/casino/gameProfitDisplay";
import type { EagleFlightState } from "@/lib/casino/eagle-flight/types";
import type { TranslationKey } from "@/lib/i18n/translations";
import { useGameSounds } from "@/lib/casino/sounds/useGameSounds";

const DEFAULT_BET = 1;
const CRASH_ANIM_MS = 600;
const DEFAULT_AUTO_BETS = 10;

type PlayMode = "manual" | "auto";

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export function EagleFlightGame({ backHref = "/jeux" }: { backHref?: string }) {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { play, playWin, playLose } = useGameSounds();
  const { user } = useAuth();
  const { openAuth } = useAppUI();
  const { getLibertyBalance, spendLiberty, creditLiberty, formatLiberty } = useGameWallet();

  const [betAmount, setBetAmount] = useState(DEFAULT_BET);
  const [autoCashoutAt, setAutoCashoutAt] = useState(EAGLE_FLIGHT_DEFAULT_TARGET_MULTIPLIER);
  const [mode, setMode] = useState<PlayMode>("manual");
  const [autoBetCount, setAutoBetCount] = useState(DEFAULT_AUTO_BETS);
  const [autoRunning, setAutoRunning] = useState(false);
  const [gameState, setGameState] = useState<EagleFlightState>(createInitialEagleFlightState);
  const [controlsLocked, setControlsLocked] = useState(false);

  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;
  const autoCashoutTargetRef = useRef<number | null>(null);
  const settlingRef = useRef(false);
  const autoCancelRef = useRef(false);
  const autoRunningRef = useRef(false);
  const roundEndResolverRef = useRef<(() => void) | null>(null);
  const betAmountRef = useRef(betAmount);
  betAmountRef.current = betAmount;
  const autoCashoutAtRef = useRef(autoCashoutAt);
  autoCashoutAtRef.current = autoCashoutAt;

  const resolveRoundEnd = useCallback(() => {
    const resolve = roundEndResolverRef.current;
    roundEndResolverRef.current = null;
    resolve?.();
  }, []);

  const waitForRoundEnd = () =>
    new Promise<void>((resolve) => {
      roundEndResolverRef.current = resolve;
    });

  const setMaxBet = () => setBetAmount(Math.max(LIBERTY_MIN_BET, roundLiberty(getLibertyBalance())));

  const finishCashOut = useCallback(
    (state: EagleFlightState) => {
      const cashed = cashOutEagleFlight(state);
      const payout = getEagleFlightPayout(cashed);
      const profit = getEagleFlightProfit(cashed);
      creditLiberty(payout);

      if (!autoRunningRef.current) {
        const outcome = getBetOutcome(profit);
        if (outcome === "win") {
          playWin();
          showToast(
            amountToastMessage(t("eagleFlightWin"), {
              amount: formatLiberty(profit),
              mult: `${cashed.currentMultiplier.toFixed(2)}×`,
            }),
          );
        } else {
          showToast(
            amountToastMessage(t("eagleFlightWin"), {
              amount: formatLiberty(0),
              mult: `${cashed.currentMultiplier.toFixed(2)}×`,
            }),
          );
        }
      } else {
        playWin();
      }

      setGameState(cashed);
      resolveRoundEnd();
    },
    [creditLiberty, formatLiberty, playWin, resolveRoundEnd, showToast, t],
  );

  const handleCrash = useCallback(
    async (state: EagleFlightState) => {
      setControlsLocked(true);
      playLose();
      await delay(CRASH_ANIM_MS);
      const finished = finishEagleFlightCrash(state);
      if (!autoRunningRef.current) {
        showToast(
          amountToastMessage(t("eagleFlightLoss"), {
            amount: formatLiberty(formatBetLossAmount(computeBetNet(0, state.bet))),
            mult: `${state.crashPoint.toFixed(2)}×`,
          }),
        );
      }
      setGameState(finished);
      setControlsLocked(false);
      resolveRoundEnd();
    },
    [formatLiberty, playLose, resolveRoundEnd, showToast, t],
  );

  useEffect(() => {
    if (gameState.phase !== "flying") return;

    const tick = () => {
      const current = gameStateRef.current;
      if (settlingRef.current) return;
      if (current.phase !== "flying" || current.flightStartedAt === null) return;

      const elapsed = Date.now() - current.flightStartedAt;
      const currentMultiplier = clampEagleFlightMultiplier(multiplierAtElapsed(elapsed));
      const target = autoCashoutTargetRef.current;
      const maxWin = eagleFlightMaxWin();

      if (
        target != null &&
        target >= EAGLE_FLIGHT_MIN_AUTO_CASHOUT &&
        currentMultiplier >= target
      ) {
        settlingRef.current = true;
        const cashedState = {
          ...current,
          currentMultiplier: clampEagleFlightMultiplier(Math.min(currentMultiplier, target)),
        };
        finishCashOut(cashedState);
        return;
      }

      if (currentMultiplier >= maxWin) {
        settlingRef.current = true;
        finishCashOut({ ...current, currentMultiplier: maxWin });
        return;
      }

      const next = updateEagleFlightMultiplier(current);
      if (next.phase === "finished" && next.roundOutcome === "won") {
        settlingRef.current = true;
        finishCashOut({ ...current, currentMultiplier: next.currentMultiplier });
        return;
      }

      if (next.phase === "crashed") {
        settlingRef.current = true;
        setGameState(next);
        void handleCrash(next);
        return;
      }

      setGameState(next);
    };

    const intervalId = window.setInterval(tick, EAGLE_FLIGHT_TICK_MS);
    return () => window.clearInterval(intervalId);
  }, [gameState.phase, handleCrash, finishCashOut]);

  const startFlightRound = useCallback((): boolean => {
    const amount = betAmountRef.current;
    const cashoutAt = autoCashoutAtRef.current;

    if (amount < LIBERTY_MIN_BET) {
      showToast(t("walletInvalidAmount"));
      return false;
    }

    if (getLibertyBalance() < amount) {
      showToast(t("walletInsufficient"));
      return false;
    }

    if (cashoutAt < EAGLE_FLIGHT_MIN_AUTO_CASHOUT) {
      showToast(t("eagleFlightCashoutAtMin", { amount: EAGLE_FLIGHT_MIN_AUTO_CASHOUT.toFixed(2) }));
      return false;
    }

    const err = spendLiberty(amount);
    if (err) {
      showToast(t(err as TranslationKey));
      return false;
    }

    play("bet");
    settlingRef.current = false;
    autoCashoutTargetRef.current = Math.min(cashoutAt, eagleFlightMaxWin());
    setGameState(startEagleFlightRound(amount, rollCrashPoint()));
    return true;
  }, [getLibertyBalance, play, showToast, spendLiberty, t]);

  const handleBet = async () => {
    if (!user) {
      openAuth("login");
      return;
    }

    if (mode === "auto" && autoRunning) {
      autoCancelRef.current = true;
      return;
    }

    if (gameState.phase === "flying") return;

    if (mode === "auto") {
      if (autoBetCount < 1) return;
      if (autoCashoutAt < EAGLE_FLIGHT_MIN_AUTO_CASHOUT) {
        showToast(t("eagleFlightAutoCashoutRequired"));
        return;
      }

      setAutoRunning(true);
      autoRunningRef.current = true;
      autoCancelRef.current = false;
      let remaining = autoBetCount;

      while (remaining > 0 && !autoCancelRef.current) {
        if (!startFlightRound()) break;
        await waitForRoundEnd();
        remaining -= 1;
        setAutoBetCount(remaining);
        if (remaining > 0 && !autoCancelRef.current) {
          await delay(EAGLE_FLIGHT_AUTO_GAP_MS);
        }
      }

      autoRunningRef.current = false;
      setAutoRunning(false);
      return;
    }

    startFlightRound();
  };

  const handleCashOut = () => {
    if (gameState.phase !== "flying" || controlsLocked || settlingRef.current) return;
    settlingRef.current = true;
    finishCashOut(gameState);
  };

  const displayMultiplier = getEagleFlightDisplayMultiplier(gameState);
  const livePayout = roundLiberty(gameState.bet * displayMultiplier);
  const displayRoundOutcome =
    gameState.phase === "crashed" ? "lost" : gameState.roundOutcome;
  const payoutDisplay = buildGamePayoutDisplayAmounts(
    formatLiberty,
    displayRoundOutcome,
    livePayout,
    getEagleFlightMissedPayout(gameState),
  );
  const inFlight = gameState.phase === "flying";
  const finished = gameState.phase === "finished";
  const liveProfit = inFlight ? roundLiberty(livePayout - gameState.bet) : 0;
  const profitDisplay = buildGameProfitDisplayAmounts(
    formatLiberty,
    gameState.bet,
    liveProfit,
    resolveSettledWinProfit(finished, gameState.roundOutcome, getEagleFlightProfit(gameState)),
  );

  return (
    <div className="plinko-game eagle-flight-game blackjack-game">
      <div className="plinko-shell eagle-flight-shell">
        <GameShellHeader
          backHref={backHref}
          title={t("originalEagleFlight")}
          rulesTitleKey="eagleFlightRulesTitle"
          rulesBodyKey="eagleFlightRulesBody"
        />

        <div className="plinko-layout eagle-flight-layout">
          <EagleFlightPanel
            betAmount={betAmount}
            onBetAmountChange={setBetAmount}
            autoCashoutAt={autoCashoutAt}
            onAutoCashoutAtChange={setAutoCashoutAt}
            mode={mode}
            onModeChange={setMode}
            autoBetCount={autoBetCount}
            onAutoBetCountChange={setAutoBetCount}
            autoRunning={autoRunning}
            currentMultiplier={displayMultiplier}
            payoutDisplay={payoutDisplay}
            profitDisplay={profitDisplay}
            roundOutcome={gameState.roundOutcome}
            phase={gameState.phase}
            controlsLocked={controlsLocked}
            onBet={() => void handleBet()}
            onCashOut={handleCashOut}
            setMaxBet={setMaxBet}
            labels={{
              betAmount: t("plinkoBetAmount"),
              bet: t("eagleFlightBet"),
              cashOut: t("eagleFlightCashOut"),
              cashoutAt: t("eagleFlightCashoutAt"),
              multiplier: t("eagleFlightMultiplier"),
              payout: t("eagleFlightPayout"),
              gain: t("gamesStatGain"),
              potentialPayout: t("gamesStatPotentialPayout"),
              profit: t("eagleFlightProfit"),
              manual: t("plinkoManual"),
              auto: t("plinkoAuto"),
              autoCount: t("plinkoAutoCount"),
              autoCancel: t("plinkoAutoCancel"),
            }}
          />

          <EagleFlightArena
            phase={gameState.phase}
            roundOutcome={gameState.roundOutcome}
            currentMultiplier={displayMultiplier}
            crashPoint={gameState.crashPoint}
          />
        </div>
      </div>
    </div>
  );
}
