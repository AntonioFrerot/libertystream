"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/components/providers/AuthProvider";
import { useAppUI } from "@/components/providers/AppUIProvider";
import { useGameWallet } from "@/lib/wallet/useGameWallet";
import { LIBERTY_MIN_BET, roundLiberty } from "@/lib/wallet/types";
import { BlackjackPanel, type HandCount } from "@/components/casino/blackjack/BlackjackPanel";
import { BlackjackTable } from "@/components/casino/blackjack/BlackjackTable";
import { GameShellHeader } from "@/components/casino/GameShellHeader";
import { scoreHand } from "@/lib/casino/blackjack/hand";
import { amountToastMessage } from "@/components/wallet/AmountToastMessage";
import { formatBetLossAmount, getBetOutcome } from "@/lib/casino/betOutcome";
import {
  canDouble,
  canHit,
  canSplit,
  canStand,
  createInitialState,
  dealTo,
  dealerHitStep,
  declineInsurance,
  doubleDown,
  buildInitialDealSteps,
  hit,
  needsDealerTurn,
  prepareRound,
  resolveInitialDeal,
  resolvePayouts,
  resolvePlayerHandsAgainstDealer,
  revealDealer,
  split,
  stand,
  takeInsurance,
} from "@/lib/casino/blackjack/engine";
import type { GameState } from "@/lib/casino/blackjack/types";
import type { TranslationKey } from "@/lib/i18n/translations";
import {
  CARD_DEAL_MS,
  CARD_HIT_MS,
  CARD_REVEAL_MS,
  CARD_SETTLE_MS,
  DEALER_STEP_MS,
  initialDealVariant,
  type CardDealVariant,
} from "@/lib/casino/blackjack/motion";
import { useBlackjackSounds } from "@/lib/casino/blackjack/useBlackjackSounds";

const DEFAULT_BET = 1;

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export function BlackjackGame({ backHref = "/jeux" }: { backHref?: string }) {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { user } = useAuth();
  const { openAuth } = useAppUI();
  const { getLibertyBalance, spendLiberty, creditLiberty, formatLiberty } = useGameWallet();
  const { play, playWin, playLose, playForDealVariant } = useBlackjackSounds();

  const [handCount, setHandCount] = useState<HandCount>(1);
  const [betAmount, setBetAmount] = useState(DEFAULT_BET);
  const [perfectPairsBet, setPerfectPairsBet] = useState(0);
  const [twentyOnePlusThreeBet, setTwentyOnePlusThreeBet] = useState(0);
  const [gameState, setGameState] = useState<GameState>(createInitialState);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showDealerScore, setShowDealerScore] = useState(false);
  const [animatedCard, setAnimatedCard] = useState<{ id: string; variant: CardDealVariant } | null>(null);
  const [shoeDealing, setShoeDealing] = useState(false);
  const [revealDealerHole, setRevealDealerHole] = useState(false);
  const dealerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const phase = gameState.phase;
  const inActiveRound = phase !== "betting" && phase !== "finished";
  const controlsLocked = isAnimating || phase === "dealer";

  useEffect(() => {
    return () => {
      if (dealerTimerRef.current) clearTimeout(dealerTimerRef.current);
    };
  }, []);

  const animateDeal = useCallback(
    async (
      cardId: string,
      variant: CardDealVariant,
      nextState: GameState,
      durationMs = CARD_DEAL_MS
    ) => {
      playForDealVariant(variant);
      setAnimatedCard({ id: cardId, variant });
      setShoeDealing(true);
      setGameState(nextState);
      await delay(durationMs);
      setAnimatedCard(null);
      setShoeDealing(false);
      await delay(CARD_SETTLE_MS);
    },
    [playForDealVariant]
  );

  const dealInitialCards = useCallback(
    async (
      baseState: GameState,
      bet: number,
      spots: HandCount,
      sideBets: { perfectPairsPerHand: number; twentyOnePlusThreePerHand: number },
    ): Promise<GameState> => {
      let state = prepareRound(baseState, bet, spots, sideBets);
      setGameState(state);

      for (const step of buildInitialDealSteps(spots)) {
        const dealerCount = state.dealerCards.length;
        state =
          step.target === "player"
            ? dealTo(state, "player", step.handIndex)
            : dealTo(state, "dealer");

        const card =
          step.target === "player"
            ? state.playerHands[step.handIndex]?.cards.at(-1)
            : state.dealerCards.at(-1);
        if (!card) continue;

        await animateDeal(
          card.id,
          initialDealVariant(step.target, dealerCount),
          state,
          CARD_DEAL_MS
        );
      }

      return resolveInitialDeal(state);
    },
    [animateDeal]
  );

  const playDealerHoleReveal = useCallback(async (state: GameState): Promise<GameState> => {
    setGameState({ ...state, dealerHoleHidden: true });
    setRevealDealerHole(true);
    await delay(32);

    const revealed = revealDealer(state);
    play("flip");
    setGameState(revealed);
    await delay(CARD_REVEAL_MS);
    setRevealDealerHole(false);
    return revealed;
  }, [play]);

  const finishRound = useCallback(
    (state: GameState) => {
      let resolved = state;
      if (
        resolved.playerHands.some(
          (hand) => hand.outcome === "stand" || hand.outcome === "bust"
        )
      ) {
        resolved = resolvePlayerHandsAgainstDealer(resolved);
      }

      const results = resolvePayouts(resolved);
      const totalPayout = roundLiberty(results.reduce((sum, r) => sum + r.payout, 0));
      const totalNet = roundLiberty(results.reduce((sum, r) => sum + r.net, 0));

      if (totalPayout > 0) {
        creditLiberty(totalPayout);
      }

      setShowDealerScore(true);

      const outcome = getBetOutcome(totalNet);

      if (outcome === "win") {
        playWin();
        showToast(
          amountToastMessage(t("blackjackWin"), { amount: formatLiberty(totalNet) }),
        );
      } else if (outcome === "loss") {
        playLose();
        showToast(
          amountToastMessage(t("blackjackLoss"), {
            amount: formatLiberty(formatBetLossAmount(totalNet)),
          }),
        );
      } else {
        showToast(t("blackjackPush"));
      }

      setGameState({ ...resolved, phase: "finished" });
      setIsAnimating(false);
    },
    [creditLiberty, formatLiberty, playWin, playLose, showToast, t]
  );

  const runDealerTurn = useCallback(
    async (state: GameState) => {
      setIsAnimating(true);
      setShowDealerScore(false);

      try {
        let current = await playDealerHoleReveal(state);

        if (!needsDealerTurn(current)) {
          current = dealerHitStep(current);
          setGameState(current);
          await delay(DEALER_STEP_MS);
          finishRound(current);
          return;
        }

        while (current.phase === "dealer") {
          const prevDealerCount = current.dealerCards.length;
          current = dealerHitStep(current);

          if (current.dealerCards.length > prevDealerCount) {
            const newCard = current.dealerCards.at(-1);
            if (newCard) {
              await animateDeal(newCard.id, "hit-dealer", current, DEALER_STEP_MS);
            } else {
              setGameState(current);
              await delay(DEALER_STEP_MS);
            }
          } else {
            setGameState(current);
            await delay(DEALER_STEP_MS);
          }

          if (current.phase === "finished") {
            finishRound(current);
            return;
          }
        }

        if (current.phase !== "finished") {
          finishRound(current);
        }
      } catch {
        setIsAnimating(false);
      }
    },
    [animateDeal, finishRound, playDealerHoleReveal]
  );

  const afterPlayerAction = useCallback(
    async (nextState: GameState) => {
      if (nextState.phase === "dealer") {
        await runDealerTurn(nextState);
      } else if (nextState.phase === "finished") {
        await delay(CARD_SETTLE_MS);
        finishRound(nextState);
      } else {
        setIsAnimating(false);
      }
    },
    [finishRound, runDealerTurn]
  );

  const animatePlayerCard = useCallback(
    async (nextState: GameState) => {
      const hand = nextState.playerHands[nextState.activeHandIndex];
      const newCard = hand?.cards.at(-1);
      if (newCard) {
        await animateDeal(newCard.id, "hit-player", nextState, CARD_HIT_MS);
      } else {
        setGameState(nextState);
        await delay(CARD_HIT_MS);
      }
    },
    [animateDeal]
  );

  const setMaxBet = () => {
    const perHand = roundLiberty(getLibertyBalance() / handCount);
    setBetAmount(Math.max(LIBERTY_MIN_BET, perHand));
  };

  const handleHandCountChange = (count: HandCount) => {
    if (inActiveRound) return;
    setHandCount(count);
  };

  const totalMainBet = roundLiberty(betAmount * handCount);
  const totalSideBets = roundLiberty((perfectPairsBet + twentyOnePlusThreeBet) * handCount);
  const totalWager = roundLiberty(totalMainBet + totalSideBets);

  const handleDeal = async () => {
    if (!user) {
      openAuth("login");
      return;
    }
    if (betAmount < LIBERTY_MIN_BET) {
      showToast(t("walletInvalidAmount"));
      return;
    }
    const available = getLibertyBalance();
    if (available < totalWager) {
      showToast(t("walletInsufficient"));
      return;
    }

    const err = spendLiberty(totalWager);
    if (err) {
      showToast(t(err as TranslationKey));
      return;
    }

    play("bet");
    setIsAnimating(true);
    setShowDealerScore(false);

    const baseState =
      gameState.phase === "betting"
        ? gameState
        : { ...createInitialState(), shoe: gameState.shoe };

    const next = await dealInitialCards(baseState, betAmount, handCount, {
      perfectPairsPerHand: perfectPairsBet,
      twentyOnePlusThreePerHand: twentyOnePlusThreeBet,
    });
    setGameState(next);

    if (next.phase === "insurance") {
      setIsAnimating(false);
      return;
    }

    if (next.phase === "finished") {
      await delay(CARD_SETTLE_MS);
      finishRound(next);
      return;
    }

    setIsAnimating(false);
  };

  const handleInsurance = async (accept: boolean) => {
    const insuranceAmount = roundLiberty((betAmount / 2) * handCount);
    if (accept) {
      if (getLibertyBalance() < insuranceAmount) {
        showToast(t("walletInsufficient"));
        return;
      }
      const err = spendLiberty(insuranceAmount);
      if (err) {
        showToast(t(err as TranslationKey));
        return;
      }
      play("bet");
    }

    setIsAnimating(true);
    await delay(120);
    const next = accept ? takeInsurance(gameState, insuranceAmount) : declineInsurance(gameState);

    if (scoreHand(next.dealerCards).isBlackjack) {
      const revealed = await playDealerHoleReveal(next);
      await delay(CARD_SETTLE_MS);
      finishRound(revealed);
      return;
    }

    setGameState(next);

    if (next.phase === "finished") {
      await delay(500);
      finishRound(next);
      return;
    }

    setIsAnimating(false);
  };

  const handleHit = async () => {
    if (!canHit(gameState) || isAnimating) return;
    setIsAnimating(true);
    const next = hit(gameState);
    await animatePlayerCard(next);
    await afterPlayerAction(next);
  };

  const handleStand = async () => {
    if (!canStand(gameState) || isAnimating) return;
    setIsAnimating(true);
    const next = stand(gameState);
    setGameState(next);
    await delay(220);
    await afterPlayerAction(next);
  };

  const handleDouble = async () => {
    if (!canDouble(gameState) || isAnimating) return;
    const hand = gameState.playerHands[gameState.activeHandIndex];
    if (!hand || getLibertyBalance() < hand.bet) {
      showToast(t("walletInsufficient"));
      return;
    }
    const err = spendLiberty(hand.bet);
    if (err) {
      showToast(t(err as TranslationKey));
      return;
    }
    play("bet");
    setIsAnimating(true);
    const next = doubleDown(gameState);
    await animatePlayerCard(next);
    await afterPlayerAction(next);
  };

  const handleSplit = async () => {
    if (!canSplit(gameState) || isAnimating) return;
    const hand = gameState.playerHands[gameState.activeHandIndex];
    if (!hand || getLibertyBalance() < hand.bet) {
      showToast(t("walletInsufficient"));
      return;
    }
    const err = spendLiberty(hand.bet);
    if (err) {
      showToast(t(err as TranslationKey));
      return;
    }
    play("bet");
    setIsAnimating(true);
    const next = split(gameState);
    const splitIndex = gameState.activeHandIndex;
    const cardA = next.playerHands[splitIndex]?.cards.at(-1);
    const cardB = next.playerHands[splitIndex + 1]?.cards.at(-1);

    if (cardA) {
      const interim: GameState = {
        ...next,
        playerHands: next.playerHands.map((hand, index) =>
          index === splitIndex + 1
            ? { ...hand, cards: hand.cards.slice(0, 1) }
            : hand
        ),
      };
      await animateDeal(cardA.id, "hit-player", interim, CARD_HIT_MS);
    }

    if (cardB) {
      await animateDeal(cardB.id, "hit-player", next, CARD_HIT_MS);
    } else {
      setGameState(next);
    }

    await afterPlayerAction(next);
  };

  const handlePrimaryAction = () => {
    if (phase === "betting" || phase === "finished") void handleDeal();
  };

  const insuranceAmount = formatLiberty(roundLiberty((betAmount / 2) * handCount));
  const betLabel = t("plinkoBetBtn");

  return (
    <div
      className={`plinko-game blackjack-game${inActiveRound ? " blackjack-in-round" : ""}${
        phase === "finished" ? " blackjack-round-finished" : ""
      }`}
    >
      <div className="plinko-shell">
        <GameShellHeader
          backHref={backHref}
          title={t("originalBlackjack")}
          rulesTitleKey="blackjackRulesTitle"
          rulesBodyKey="blackjackRulesBody"
        />

        <div className="plinko-layout">
          <BlackjackTable
            state={gameState}
            phase={phase}
            showDealerScore={showDealerScore || !gameState.dealerHoleHidden}
            animatedCard={animatedCard}
            revealDealerHole={revealDealerHole}
            shoeDealing={shoeDealing}
            formatAmount={formatLiberty}
            labels={{
              dealer: t("blackjackDealer"),
              player: t("blackjackPlayer"),
              hand: t("blackjackHand"),
              blackjack: t("blackjackNatural"),
              bust: t("blackjackBust"),
              win: t("blackjackWinLabel"),
              lose: t("blackjackLoseLabel"),
              push: t("blackjackPushLabel"),
              tableBanner: t("blackjackTableBanner"),
              perfectPairs: t("blackjackPerfectPairs"),
              twentyOnePlus3: t("blackjack21Plus3"),
            }}
          />

          <BlackjackPanel
            handCount={handCount}
            onHandCountChange={handleHandCountChange}
            betAmount={betAmount}
            onBetAmountChange={setBetAmount}
            perfectPairsBet={perfectPairsBet}
            onPerfectPairsChange={setPerfectPairsBet}
            twentyOnePlusThreeBet={twentyOnePlusThreeBet}
            onTwentyOnePlusThreeChange={setTwentyOnePlusThreeBet}
            disabled={inActiveRound}
            controlsLocked={controlsLocked}
            phaseInsurance={phase === "insurance"}
            insuranceAmount={insuranceAmount}
            onInsuranceYes={() => void handleInsurance(true)}
            onInsuranceNo={() => void handleInsurance(false)}
            canHit={canHit(gameState)}
            canStand={canStand(gameState)}
            canDouble={canDouble(gameState)}
            canSplit={canSplit(gameState)}
            onHit={() => void handleHit()}
            onStand={() => void handleStand()}
            onDouble={() => void handleDouble()}
            onSplit={() => void handleSplit()}
            onBet={handlePrimaryAction}
            betLabel={betLabel}
            primaryDisabled={
              (phase !== "betting" && phase !== "finished") ||
              (phase === "betting" && controlsLocked)
            }
            setMaxBet={setMaxBet}
            labels={{
              hand1: t("blackjackHand1"),
              hand2: t("blackjackHand2"),
              hand3: t("blackjackHand3"),
              betAmount: t("plinkoBetAmount"),
              perfectPairs: t("blackjackPerfectPairs"),
              perfectPairsInfoTitle: t("blackjackPerfectPairsInfoTitle"),
              perfectPairsInfoBody: t("blackjackPerfectPairsInfoBody"),
              twentyOnePlus3: t("blackjack21Plus3"),
              twentyOnePlus3InfoTitle: t("blackjack21Plus3InfoTitle"),
              twentyOnePlus3InfoBody: t("blackjack21Plus3InfoBody"),
              hit: t("blackjackHit"),
              stand: t("blackjackStand"),
              split: t("blackjackSplit"),
              double: t("blackjackDouble"),
              insuranceOffer: t("blackjackInsuranceOffer"),
              insuranceYes: t("blackjackInsuranceYes"),
              insuranceNo: t("blackjackInsuranceNo"),
            }}
          />
        </div>
      </div>
    </div>
  );
}
