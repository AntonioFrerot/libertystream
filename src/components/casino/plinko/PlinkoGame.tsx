"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BetAmountInput } from "@/components/casino/BetAmountInput";
import { MaxBetButton } from "@/components/casino/MaxBetButton";
import { GameShellHeader } from "@/components/casino/GameShellHeader";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/components/providers/AuthProvider";
import { useAppUI } from "@/components/providers/AppUIProvider";
import { useGameWallet } from "@/lib/wallet/useGameWallet";
import { LIBERTY_MIN_BET, roundLiberty } from "@/lib/wallet/types";
import { LibertyCoinIcon } from "@/components/wallet/LibertyCoinIcon";
import { amountToastMessage } from "@/components/wallet/AmountToastMessage";
import { PlinkoBoard, type PlinkoActiveBall } from "@/components/casino/plinko/PlinkoBoard";
import { PlinkoSelect } from "@/components/casino/plinko/PlinkoSelect";
import { computeBetNet, formatBetLossAmount, getBetOutcome } from "@/lib/casino/betOutcome";
import { getPlinkoAnimationDuration } from "@/lib/casino/plinko/motion";
import {
  PLINKO_ROWS,
  formatMultiplier,
  generatePlinkoPath,
  getPlinkoMultipliers,
  pathToBucket,
  type PlinkoRisk,
  type PlinkoRows,
} from "@/lib/casino/plinko/multipliers";
import type { TranslationKey } from "@/lib/i18n/translations";
import { useGameSounds } from "@/lib/casino/sounds/useGameSounds";

const DEFAULT_ROWS: PlinkoRows = 16;
const DEFAULT_RISK: PlinkoRisk = "medium";
const DEFAULT_BET = 1;
const MAX_CONCURRENT_BALLS = 10;
const PLINKO_MAX_AUTO_COUNT = 100;

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function createBallId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function PlinkoGame({ backHref = "/jeux" }: { backHref?: string }) {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { play, playWin, playLose } = useGameSounds();
  const { user } = useAuth();
  const { openAuth } = useAppUI();
  const { getLibertyBalance, spendLiberty, creditLiberty, formatLiberty } = useGameWallet();
  const balance = getLibertyBalance();

  const [mode, setMode] = useState<"manual" | "auto">("manual");
  const [betAmount, setBetAmount] = useState(DEFAULT_BET);
  const [rows, setRows] = useState<PlinkoRows>(DEFAULT_ROWS);
  const [risk, setRisk] = useState<PlinkoRisk>(DEFAULT_RISK);
  const [autoCount, setAutoCount] = useState(10);
  const [activeBalls, setActiveBalls] = useState<PlinkoActiveBall[]>([]);
  const [highlightBuckets, setHighlightBuckets] = useState<number[]>([]);
  const [autoRunning, setAutoRunning] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);

  const activeBallsRef = useRef(activeBalls);
  const highlightTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const ballTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const autoCancelRef = useRef(false);

  useEffect(() => {
    activeBallsRef.current = activeBalls;
  }, [activeBalls]);

  const multipliers = useMemo(() => getPlinkoMultipliers(rows, risk), [rows, risk]);
  const hasActiveBalls = activeBalls.length > 0;
  const slotsLeft = MAX_CONCURRENT_BALLS - activeBalls.length;

  useEffect(() => {
    return () => {
      highlightTimersRef.current.forEach(clearTimeout);
      ballTimersRef.current.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    if (hasActiveBalls) return;
    setHighlightBuckets([]);
  }, [rows, risk, hasActiveBalls]);

  const flashBucket = useCallback((bucket: number) => {
    setHighlightBuckets((prev) => (prev.includes(bucket) ? prev : [...prev, bucket]));
    const timer = setTimeout(() => {
      setHighlightBuckets((prev) => prev.filter((b) => b !== bucket));
    }, 350);
    highlightTimersRef.current.push(timer);
  }, []);

  const launchBall = useCallback(() => {
    const dropPath = generatePlinkoPath(rows);
    const id = createBallId();
    const bucket = pathToBucket(dropPath);
    const mult = multipliers[bucket];
    const payout = roundLiberty(betAmount * mult);
    const net = computeBetNet(payout, betAmount);

    if (!hasPlayed) setHasPlayed(true);
    setActiveBalls((prev) => {
      const ballIndex = prev.length;
      const spawnOffset = ballIndex === 0 ? 0 : (ballIndex - 4.5) * 4;
      const next = [...prev, { id, path: dropPath, spawnOffset }];
      activeBallsRef.current = next;
      return next;
    });

    play("plinkoDrop");

    const timer = setTimeout(() => {
      creditLiberty(payout);
      setActiveBalls((prev) => {
        const next = prev.filter((b) => b.id !== id);
        activeBallsRef.current = next;
        return next;
      });
      flashBucket(bucket);
      play("plinkoLand");

      const outcome = getBetOutcome(net);
      const multLabel = formatMultiplier(mult);

      if (outcome === "win") {
        playWin();
        showToast(
          amountToastMessage(t("plinkoWin"), {
            amount: formatLiberty(net),
            mult: multLabel,
          }),
        );
      } else if (outcome === "breakEven") {
        showToast(
          amountToastMessage(t("plinkoWin"), {
            amount: formatLiberty(0),
            mult: multLabel,
          }),
        );
      } else {
        playLose();
        showToast(
          amountToastMessage(t("plinkoLoss"), {
            amount: formatLiberty(formatBetLossAmount(net)),
            mult: multLabel,
          }),
        );
      }
    }, getPlinkoAnimationDuration(rows));

    ballTimersRef.current.push(timer);
  }, [betAmount, creditLiberty, flashBucket, formatLiberty, hasPlayed, multipliers, play, playWin, playLose, rows, showToast, t]);

  const waitForBallSlot = useCallback(async () => {
    while (activeBallsRef.current.length >= MAX_CONCURRENT_BALLS) {
      await delay(80);
    }
  }, []);

  const handleBet = async () => {
    if (!user) {
      openAuth("login");
      return;
    }

    if (autoRunning) {
      autoCancelRef.current = true;
      return;
    }

    if (betAmount < LIBERTY_MIN_BET) {
      showToast(t("walletInvalidAmount"));
      return;
    }

    if (mode === "manual" && slotsLeft <= 0) {
      showToast(t("plinkoMaxBalls"));
      return;
    }

    if (mode === "auto") {
      if (autoCount < 1) {
        return;
      }

      setAutoRunning(true);
      autoCancelRef.current = false;
      let remaining = autoCount;

      while (remaining > 0 && !autoCancelRef.current) {
        await waitForBallSlot();

        if (autoCancelRef.current) {
          break;
        }

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
        launchBall();
        remaining -= 1;
        setAutoCount(remaining);
        await delay(200);
      }

      setAutoRunning(false);
      return;
    }

    if (balance < betAmount) {
      showToast(t("walletInsufficient"));
      return;
    }

    const err = spendLiberty(betAmount);
    if (err) {
      showToast(t(err as TranslationKey));
      return;
    }

    play("bet");
    launchBall();
  };

  const riskOptions: { value: PlinkoRisk; label: string }[] = [
    { value: "low", label: t("plinkoLow") },
    { value: "medium", label: t("plinkoMedium") },
    { value: "high", label: t("plinkoHigh") },
  ];

  const controlsLocked = hasActiveBalls || autoRunning;

  const setMaxBet = () => setBetAmount(Math.max(LIBERTY_MIN_BET, roundLiberty(balance)));

  return (
    <div className="plinko-game">
      <div className="plinko-shell">
        <GameShellHeader
          backHref={backHref}
          title={t("originalPlinko")}
          rulesTitleKey="plinkoRulesTitle"
          rulesBodyKey="plinkoRulesBody"
        />

        <div className="plinko-layout">
          <PlinkoBoard
            rows={rows}
            multipliers={multipliers}
            activeBalls={activeBalls}
            highlightBuckets={highlightBuckets}
          />

          <aside className={`plinko-panel${hasPlayed ? " plinko-panel-launched" : ""}`}>
            <div className="plinko-mode-tabs plinko-panel-full plinko-order-mode">
              <button
                type="button"
                className={mode === "manual" ? "plinko-mode-active" : ""}
                onClick={() => setMode("manual")}
                disabled={controlsLocked}
              >
                {t("plinkoManual")}
              </button>
              <button
                type="button"
                className={mode === "auto" ? "plinko-mode-active" : ""}
                onClick={() => setMode("auto")}
                disabled={controlsLocked}
              >
                {t("plinkoAuto")}
              </button>
            </div>

            <div className="plinko-stake-bet plinko-panel-full plinko-order-bet">
              <span className="plinko-stake-bet-heading">{t("plinkoBetAmount")}</span>
              <div className="plinko-stake-bet-controls">
                <div className="plinko-stake-bet-input">
                  <span className="plinko-stake-bet-label">{t("plinkoBetAmount")} :</span>
                  <span className="plinko-stake-bet-icon">
                    <LibertyCoinIcon size="sm" />
                  </span>
                  <BetAmountInput
                    value={betAmount}
                    onChange={setBetAmount}
                    disabled={controlsLocked}
                  />
                </div>
                <div className="plinko-stake-bet-quick">
                  <button
                    type="button"
                    onClick={() => setBetAmount((b) => Math.max(0, b / 2))}
                    disabled={controlsLocked}
                  >
                    ½
                  </button>
                  <button
                    type="button"
                    onClick={() => setBetAmount((b) => b * 2)}
                    disabled={controlsLocked}
                  >
                    2×
                  </button>
                  <MaxBetButton onConfirm={setMaxBet} disabled={controlsLocked} />
                </div>
              </div>
            </div>

            <div className="plinko-stake-settings plinko-panel-full plinko-order-settings">
              <label className="plinko-field plinko-stake-settings-item plinko-stake-select-field">
                <span>{t("plinkoRisk")}</span>
                <PlinkoSelect
                  value={risk}
                  options={riskOptions}
                  onChange={setRisk}
                  disabled={controlsLocked}
                />
              </label>

              <label className="plinko-field plinko-stake-settings-item plinko-stake-select-field">
                <span>{t("plinkoRows")}</span>
                <PlinkoSelect
                  value={rows}
                  options={PLINKO_ROWS.map((r) => ({ value: r, label: String(r) }))}
                  onChange={setRows}
                  disabled={controlsLocked}
                  mobileOverlay
                />
              </label>
            </div>

            {mode === "auto" && (
              <label className="plinko-field plinko-panel-full plinko-stake-auto plinko-order-auto">
                <span>{t("plinkoAutoCount")}</span>
                <input
                  type="number"
                  min={0}
                  max={PLINKO_MAX_AUTO_COUNT}
                  value={autoCount}
                  onChange={(e) =>
                    setAutoCount(
                      Math.min(
                        PLINKO_MAX_AUTO_COUNT,
                        Math.max(0, parseInt(e.target.value, 10) || 0),
                      ),
                    )
                  }
                  disabled={controlsLocked}
                />
              </label>
            )}

            <button
              type="button"
              className={`plinko-bet-btn plinko-panel-full plinko-order-bet-btn${autoRunning ? " plinko-bet-btn-cancel" : ""}`}
              onClick={handleBet}
              disabled={!autoRunning && mode === "manual" && slotsLeft <= 0}
            >
              {autoRunning ? t("plinkoAutoCancel") : t("plinkoBetBtn")}
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}
