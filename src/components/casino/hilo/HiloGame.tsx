"use client";

import { useState } from "react";
import { HiloArena } from "@/components/casino/hilo/HiloArena";
import { HiloPanel } from "@/components/casino/hilo/HiloPanel";
import { GameShellHeader } from "@/components/casino/GameShellHeader";
import { amountToastMessage } from "@/components/wallet/AmountToastMessage";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/components/providers/AuthProvider";
import { useAppUI } from "@/components/providers/AppUIProvider";
import { useGameWallet } from "@/lib/wallet/useGameWallet";
import { LIBERTY_MIN_BET, roundLiberty } from "@/lib/wallet/types";
import { formatMultiplier } from "@/lib/casino/plinko/multipliers";
import {
  applyHiloGuess,
  createInitialHiloState,
  getHiloDisplayMultiplier,
  getHiloNextMultipliersByGuess,
  getHiloPayout,
  getHiloMissedPayout,
  getHiloProfit,
  skipHiloCard,
  startHiloRound,
} from "@/lib/casino/hilo/engine";
import { getBetOutcome } from "@/lib/casino/betOutcome";
import {
  buildGameProfitDisplayAmounts,
  buildGamePayoutDisplayAmounts,
  resolveSettledWinProfit,
} from "@/lib/casino/gameProfitDisplay";
import type { HiloGuess, HiloState } from "@/lib/casino/hilo/types";
import type { TranslationKey } from "@/lib/i18n/translations";
import { CARD_HIT_MS, CARD_SETTLE_MS } from "@/lib/casino/blackjack/motion";
import { useGameSounds } from "@/lib/casino/sounds/useGameSounds";

const DEFAULT_BET = 1;

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export function HiloGame({ backHref = "/jeux" }: { backHref?: string }) {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { play, playWin, playLose } = useGameSounds();
  const { user } = useAuth();
  const { openAuth } = useAppUI();
  const { getLibertyBalance, spendLiberty, creditLiberty, formatLiberty } = useGameWallet();

  const [betAmount, setBetAmount] = useState(DEFAULT_BET);
  const [gameState, setGameState] = useState<HiloState>(createInitialHiloState);
  const [cardAnimating, setCardAnimating] = useState(false);
  const [shoeDealing, setShoeDealing] = useState(false);

  const controlsLocked = cardAnimating;

  const animateHiloCard = async (nextState: HiloState, sound: "deal" | "hit" = "hit") => {
    setShoeDealing(true);
    setCardAnimating(true);
    play(sound);
    setGameState(nextState);
    await delay(CARD_HIT_MS);
    setShoeDealing(false);
    await delay(CARD_SETTLE_MS);
    setCardAnimating(false);
  };
  const inRound = gameState.phase === "playing";

  const setMaxBet = () => setBetAmount(Math.max(LIBERTY_MIN_BET, roundLiberty(getLibertyBalance())));

  const handleBet = async () => {
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

    const keepCard = gameState.phase === "finished" ? gameState.currentCard : null;
    const nextState = startHiloRound(betAmount, keepCard);

    if (keepCard) {
      setGameState(nextState);
      return;
    }

    await animateHiloCard(nextState, "deal");
  };

  const handleCashOut = () => {
    if (gameState.phase !== "playing" || gameState.winStreak === 0) return;

    const payout = getHiloPayout(gameState);
    const profit = getHiloProfit(gameState);
    creditLiberty(payout);

    const outcome = getBetOutcome(profit);
    const multLabel = formatMultiplier(gameState.cumulativeMultiplier);

    if (outcome === "win") {
      playWin();
      showToast(
        amountToastMessage(t("hiloWin"), {
          amount: formatLiberty(profit),
          mult: multLabel,
        }),
      );
    } else {
      showToast(
        amountToastMessage(t("hiloWin"), {
          amount: formatLiberty(0),
          mult: multLabel,
        }),
      );
    }

    setGameState({ ...gameState, phase: "finished", roundOutcome: "won" });
  };

  const handleSkip = async () => {
    if (gameState.phase !== "playing" || cardAnimating) return;
    await animateHiloCard(skipHiloCard(gameState));
  };

  const handleGuess = async (guess: HiloGuess) => {
    if (gameState.phase !== "playing" || cardAnimating) return;

    const result = applyHiloGuess(gameState, guess);
    await animateHiloCard(result.state);

    if (!result.won) {
      playLose();
      showToast(
        amountToastMessage(t("hiloLoss"), {
          amount: formatLiberty(gameState.bet),
        }),
      );
      return;
    }

    if (gameState.winStreak === 0 && result.state.winStreak === 1) {
      showToast(
        t("hiloCorrect", { mult: formatMultiplier(result.stepMultiplier) }),
      );
    }
  };

  const livePayout = getHiloPayout(gameState);
  const payoutDisplay = buildGamePayoutDisplayAmounts(
    formatLiberty,
    gameState.roundOutcome,
    livePayout,
    getHiloMissedPayout(gameState),
  );
  const finished = gameState.phase === "finished";
  const profitDisplay = buildGameProfitDisplayAmounts(
    formatLiberty,
    gameState.bet,
    gameState.phase === "playing" ? getHiloProfit(gameState) : 0,
    resolveSettledWinProfit(finished, gameState.roundOutcome, getHiloProfit(gameState)),
  );
  const nextByGuess = getHiloNextMultipliersByGuess(gameState);
  const nextMultipliers =
    gameState.phase === "playing" && nextByGuess
      ? {
          higher: formatMultiplier(nextByGuess.higher),
          lower: formatMultiplier(nextByGuess.lower),
        }
      : null;

  return (
    <div className="plinko-game hilo-game blackjack-game">
      <div className="plinko-shell hilo-shell">
        <GameShellHeader
          backHref={backHref}
          title={t("originalHilo")}
          rulesTitleKey="hiloRulesTitle"
          rulesBodyKey="hiloRulesBody"
        />

        <div className="plinko-layout hilo-layout">
          <HiloPanel
            betAmount={betAmount}
            onBetAmountChange={setBetAmount}
            currentCard={gameState.currentCard}
            cumulativeMultiplier={getHiloDisplayMultiplier(gameState)}
            payoutDisplay={payoutDisplay}
            profitDisplay={profitDisplay}
            roundOutcome={gameState.roundOutcome}
            nextMultipliers={nextMultipliers}
            phase={gameState.phase}
            winStreak={gameState.winStreak}
            controlsLocked={controlsLocked}
            cardAnimating={cardAnimating}
            onBet={handleBet}
            onCashOut={handleCashOut}
            onGuess={handleGuess}
            onSkip={handleSkip}
            setMaxBet={setMaxBet}
            labels={{
              betAmount: t("plinkoBetAmount"),
              bet: t("hiloBet"),
              cashOut: t("hiloCashOut"),
              multiplier: t("hiloMultiplier"),
              gain: t("gamesStatGain"),
              potentialPayout: t("gamesStatPotentialPayout"),
              nextMultiplier: t("hiloNextMultiplier"),
              profit: t("hiloProfit"),
              higher: t("hiloHigher"),
              lower: t("hiloLower"),
              skip: t("hiloSkip"),
            }}
          />

          <HiloArena
            gameState={gameState}
            disabled={!inRound || controlsLocked}
            cardAnimating={cardAnimating}
            shoeDealing={shoeDealing}
            dealVariant={cardAnimating ? "hit-player" : "idle"}
            onGuess={handleGuess}
            onSkip={handleSkip}
            labels={{
              higher: t("hiloHigher"),
              lower: t("hiloLower"),
              skip: t("hiloSkip"),
              startHint: t("hiloStartHint"),
              tableBanner: t("hiloTableBanner"),
              multiplier: t("hiloMultiplier"),
              won: t("hiloWon"),
              lost: t("hiloLost"),
              history: t("hiloHistory"),
              historyEmpty: t("hiloHistoryEmpty"),
            }}
          />
        </div>
      </div>
    </div>
  );
}
