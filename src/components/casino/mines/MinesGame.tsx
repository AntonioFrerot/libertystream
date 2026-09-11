"use client";

import { useRef, useState } from "react";
import { MinesGrid } from "@/components/casino/mines/MinesGrid";
import { MinesPanel } from "@/components/casino/mines/MinesPanel";
import { GameShellHeader } from "@/components/casino/GameShellHeader";
import { amountToastMessage } from "@/components/wallet/AmountToastMessage";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/components/providers/AuthProvider";
import { useAppUI } from "@/components/providers/AppUIProvider";
import { useGameWallet } from "@/lib/wallet/useGameWallet";
import { LIBERTY_MIN_BET, roundLiberty } from "@/lib/wallet/types";
import {
  MINES_AUTO_GAP_MS,
  MINES_DEFAULT_AUTO_GEMS,
  MINES_DEFAULT_COUNT,
  MINES_GRID_SIZE,
  formatMinesMultiplier,
  getNextMinesMultiplier,
} from "@/lib/casino/mines/config";
import {
  createInitialMinesState,
  getMinesDisplayMultiplier,
  getMinesGemsFound,
  getMinesPayout,
  getMinesMissedPayout,
  getMinesProfit,
  isMineAt,
  pickRandomHiddenTile,
  revealMinesTile,
  startMinesRound,
} from "@/lib/casino/mines/engine";
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
import type { MinesState } from "@/lib/casino/mines/types";
import type { TranslationKey } from "@/lib/i18n/translations";
import { useGameSounds } from "@/lib/casino/sounds/useGameSounds";

const DEFAULT_BET = 1;
const DEFAULT_AUTO_BETS = 10;
const REVEAL_ANIM_MS = 320;

type PlayMode = "manual" | "auto";

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function maxGemsForMineCount(mineCount: number) {
  return MINES_GRID_SIZE - mineCount;
}

export function MinesGame({ backHref = "/jeux" }: { backHref?: string }) {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { play, playWin, playLose } = useGameSounds();
  const { user } = useAuth();
  const { openAuth } = useAppUI();
  const { getLibertyBalance, spendLiberty, creditLiberty, formatLiberty } = useGameWallet();

  const [betAmount, setBetAmount] = useState(DEFAULT_BET);
  const [mineCount, setMineCount] = useState(MINES_DEFAULT_COUNT);
  const [mode, setMode] = useState<PlayMode>("manual");
  const [autoBetCount, setAutoBetCount] = useState(DEFAULT_AUTO_BETS);
  const [autoGemCount, setAutoGemCount] = useState(MINES_DEFAULT_AUTO_GEMS);
  const [autoRunning, setAutoRunning] = useState(false);
  const [gameState, setGameState] = useState<MinesState>(() =>
    createInitialMinesState(MINES_DEFAULT_COUNT),
  );
  const [revealing, setRevealing] = useState(false);

  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;
  const revealingRef = useRef(false);
  const settlingRef = useRef(false);
  const autoCancelRef = useRef(false);
  const autoRunningRef = useRef(false);
  const autoCashOutRef = useRef(false);
  const betAmountRef = useRef(betAmount);
  betAmountRef.current = betAmount;
  const mineCountRef = useRef(mineCount);
  mineCountRef.current = mineCount;
  const autoGemCountRef = useRef(autoGemCount);
  autoGemCountRef.current = autoGemCount;

  const controlsLocked = revealing;
  const gemsFound = gameState.revealedTiles.filter((i) => !isMineAt(gameState, i)).length;

  const setMaxBet = () => setBetAmount(Math.max(LIBERTY_MIN_BET, roundLiberty(getLibertyBalance())));

  const handleMineCountChange = (next: number) => {
    setMineCount(next);
    setAutoGemCount((prev) => Math.min(Math.max(1, prev), maxGemsForMineCount(next)));
    if (gameState.phase === "betting" || gameState.phase === "finished") {
      setGameState(createInitialMinesState(next));
    }
  };

  const finishCashOut = (state: MinesState, silent = false) => {
    if (settlingRef.current || state.roundOutcome === "lost") return;
    settlingRef.current = true;
    const payout = getMinesPayout(state);
    const profit = getMinesProfit(state);
    creditLiberty(payout);

    if (!silent) {
      const outcome = getBetOutcome(profit);
      const multLabel = formatMinesMultiplier(state.cumulativeMultiplier);

      if (outcome === "win") {
        playWin();
        showToast(
          amountToastMessage(t("minesWin"), {
            amount: formatLiberty(profit),
            mult: multLabel,
          }),
        );
      } else {
        showToast(
          amountToastMessage(t("minesWin"), {
            amount: formatLiberty(0),
            mult: multLabel,
          }),
        );
      }
    } else {
      playWin();
    }

    setGameState({ ...state, phase: "finished", roundOutcome: "won" });
  };

  const startRound = (): MinesState | null => {
    const amount = betAmountRef.current;
    const mines = mineCountRef.current;

    if (amount < LIBERTY_MIN_BET) {
      showToast(t("walletInvalidAmount"));
      return null;
    }

    if (getLibertyBalance() < amount) {
      showToast(t("walletInsufficient"));
      return null;
    }

    const err = spendLiberty(amount);
    if (err) {
      showToast(t(err as TranslationKey));
      return null;
    }

    play("bet");
    autoCashOutRef.current = false;
    settlingRef.current = false;
    const next = startMinesRound(amount, mines);
    setGameState(next);
    return next;
  };

  const revealTile = async (state: MinesState, tileIndex: number, silent: boolean) => {
    revealingRef.current = true;
    setRevealing(true);
    play("hit");

    const result = revealMinesTile(state, tileIndex);
    setGameState(result.state);
    await delay(REVEAL_ANIM_MS);

    if (result.hitMine) {
      playLose();
      if (!silent) {
        showToast(
          amountToastMessage(t("minesLoss"), {
            amount: formatLiberty(formatBetLossAmount(computeBetNet(0, state.bet))),
          }),
        );
      }
      revealingRef.current = false;
      setRevealing(false);
      return result;
    }

    if (result.clearedBoard) {
      finishCashOut(result.state, silent);
    }

    revealingRef.current = false;
    setRevealing(false);
    return result;
  };

  const playAutoRound = async (state: MinesState) => {
    let current = state;
    const target = Math.min(
      Math.max(1, autoGemCountRef.current),
      maxGemsForMineCount(current.mineCount),
    );

    while (current.phase === "playing" && getMinesGemsFound(current) < target) {
      if (autoCashOutRef.current) {
        autoCashOutRef.current = false;
        if (getMinesGemsFound(current) > 0) {
          finishCashOut(current, true);
        }
        return;
      }

      const tile = pickRandomHiddenTile(current);
      if (tile == null) break;

      const result = await revealTile(current, tile, true);
      current = result.state;
      if (result.hitMine || result.clearedBoard) return;
    }

    if (current.phase === "playing" && getMinesGemsFound(current) > 0) {
      finishCashOut(current, true);
    }
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

    if (gameState.phase === "playing") return;

    if (mode === "auto") {
      if (autoBetCount < 1) return;
      if (autoGemCount < 1) {
        showToast(t("minesAutoGemsRequired"));
        return;
      }

      setAutoRunning(true);
      autoRunningRef.current = true;
      autoCancelRef.current = false;
      autoCashOutRef.current = false;
      let remaining = autoBetCount;

      while (remaining > 0 && !autoCancelRef.current) {
        const started = startRound();
        if (!started) break;
        await playAutoRound(started);
        remaining -= 1;
        setAutoBetCount(remaining);
        if (remaining > 0 && !autoCancelRef.current) {
          await delay(MINES_AUTO_GAP_MS);
        }
      }

      autoRunningRef.current = false;
      setAutoRunning(false);
      return;
    }

    startRound();
  };

  const handleCashOut = () => {
    const state = gameStateRef.current;
    if (state.phase !== "playing" || getMinesGemsFound(state) === 0) return;

    if (autoRunningRef.current) {
      autoCashOutRef.current = true;
      return;
    }

    if (revealingRef.current) return;
    finishCashOut(state);
  };

  const handlePickRandom = () => {
    const state = gameStateRef.current;
    if (state.phase !== "playing" || revealingRef.current || autoRunningRef.current) return;

    const pick = pickRandomHiddenTile(state);
    if (pick == null) return;
    void revealTile(state, pick, false);
  };

  const handleReveal = async (tileIndex: number) => {
    const state = gameStateRef.current;
    if (state.phase !== "playing" || revealingRef.current || autoRunningRef.current) return;
    if (state.revealedTiles.includes(tileIndex)) return;
    await revealTile(state, tileIndex, false);
  };

  const livePayout = getMinesPayout(gameState);
  const payoutDisplay = buildGamePayoutDisplayAmounts(
    formatLiberty,
    gameState.roundOutcome,
    livePayout,
    getMinesMissedPayout(gameState),
  );
  const finished = gameState.phase === "finished";
  const inRound = gameState.phase === "playing";
  const profitDisplay = buildGameProfitDisplayAmounts(
    formatLiberty,
    gameState.bet,
    inRound ? getMinesProfit(gameState) : 0,
    resolveSettledWinProfit(finished, gameState.roundOutcome, getMinesProfit(gameState)),
  );
  const maxGems = maxGemsForMineCount(gameState.mineCount);
  const canRevealMore = gameState.phase === "playing" && gemsFound < maxGems;
  const nextMultiplier = canRevealMore
    ? formatMinesMultiplier(getNextMinesMultiplier(gameState.mineCount, gemsFound))
    : null;
  const nextPotentialPayout = canRevealMore
    ? formatLiberty(roundLiberty(gameState.bet * getNextMinesMultiplier(gameState.mineCount, gemsFound)))
    : null;

  return (
    <div className="plinko-game mines-game blackjack-game">
      <div className="plinko-shell mines-shell">
        <GameShellHeader
          backHref={backHref}
          title={t("originalMines")}
          rulesTitleKey="minesRulesTitle"
          rulesBodyKey="minesRulesBody"
        />

        <div className="plinko-layout mines-layout">
          <MinesPanel
            betAmount={betAmount}
            onBetAmountChange={setBetAmount}
            mineCount={mineCount}
            onMineCountChange={handleMineCountChange}
            mode={mode}
            onModeChange={setMode}
            autoBetCount={autoBetCount}
            onAutoBetCountChange={setAutoBetCount}
            autoGemCount={autoGemCount}
            onAutoGemCountChange={setAutoGemCount}
            autoRunning={autoRunning}
            cumulativeMultiplier={getMinesDisplayMultiplier(gameState)}
            payoutDisplay={payoutDisplay}
            profitDisplay={profitDisplay}
            roundOutcome={gameState.roundOutcome}
            nextMultiplier={nextMultiplier}
            nextPotentialPayout={nextPotentialPayout}
            phase={gameState.phase}
            gemsFound={gemsFound}
            controlsLocked={controlsLocked}
            onBet={() => void handleBet()}
            onCashOut={handleCashOut}
            onPickRandom={handlePickRandom}
            setMaxBet={setMaxBet}
            labels={{
              betAmount: t("plinkoBetAmount"),
              bet: t("minesBet"),
              cashOut: t("minesCashOut"),
              pickRandom: t("minesPickRandom"),
              multiplier: t("minesMultiplier"),
              payout: t("minesPayout"),
              gain: t("gamesStatGain"),
              potentialPayout: t("gamesStatPotentialPayout"),
              nextPayout: t("minesNextPayout"),
              nextGain: t("minesNextGain"),
              profit: t("minesProfit"),
              mines: t("minesCount"),
              gems: t("minesGems"),
              gemsFound: t("minesGemsFound"),
              manual: t("plinkoManual"),
              auto: t("plinkoAuto"),
              autoCount: t("plinkoAutoCount"),
              autoGems: t("minesAutoGems"),
              autoCancel: t("plinkoAutoCancel"),
            }}
          />

          <div className="mines-table-wrap plinko-board-wrap">
            <MinesGrid
              gameState={gameState}
              onReveal={handleReveal}
              controlsLocked={controlsLocked || autoRunning}
              labels={{
                gem: t("minesGem"),
                mine: t("minesMine"),
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
