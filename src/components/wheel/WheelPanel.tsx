"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/components/providers/AuthProvider";
import { useAppUI } from "@/components/providers/AppUIProvider";
import { useGameWallet } from "@/lib/wallet/useGameWallet";
import { LIBERTY_MIN_BET, roundLiberty } from "@/lib/wallet/types";
import { LibertyCoinIcon } from "@/components/wallet/LibertyCoinIcon";
import { amountToastMessage } from "@/components/wallet/AmountToastMessage";
import { BetAmountInput } from "@/components/casino/BetAmountInput";
import { MaxBetButton } from "@/components/casino/MaxBetButton";
import { PlinkoSelect } from "@/components/casino/plinko/PlinkoSelect";
import { formatMultiplier } from "@/lib/casino/plinko/multipliers";
import { computeBetNet, formatBetLossAmount, getBetOutcome } from "@/lib/casino/betOutcome";
import {
  pickWheelSegmentIndex,
  WHEEL_SEGMENT_OPTIONS,
  type WheelRisk,
  type WheelSegmentCount,
} from "@/lib/casino/wheel/config";
import { FortuneWheel, useFortuneWheel } from "@/components/wheel/FortuneWheel";
import { useWheelSegments } from "@/components/wheel/useWheelSegments";
import type { TranslationKey } from "@/lib/i18n/translations";
import { useGameSounds } from "@/lib/casino/sounds/useGameSounds";

const DEFAULT_BET = 1;
const DEFAULT_RISK: WheelRisk = "medium";
const DEFAULT_SEGMENTS: WheelSegmentCount = 10;
const WHEEL_SIZE_MOBILE = 320;
const WHEEL_SIZE_DESKTOP = 420;
const DESKTOP_WHEEL_QUERY = "(min-width: 900px)";

interface WheelPanelProps {
  active?: boolean;
}

export function WheelPanel({ active = true }: WheelPanelProps) {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { play, playWin, playLose } = useGameSounds();
  const { user } = useAuth();
  const { openAuth } = useAppUI();
  const { getLibertyBalance, spendLiberty, creditLiberty, formatLiberty } = useGameWallet();
  const balance = getLibertyBalance();

  const [mode, setMode] = useState<"manual" | "auto">("manual");
  const [betAmount, setBetAmount] = useState(DEFAULT_BET);
  const [risk, setRisk] = useState<WheelRisk>(DEFAULT_RISK);
  const [segmentCount, setSegmentCount] = useState<WheelSegmentCount>(DEFAULT_SEGMENTS);
  const [autoCount, setAutoCount] = useState(10);
  const [autoRunning, setAutoRunning] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);

  const autoCancelRef = useRef(false);

  const { segments } = useWheelSegments(risk, segmentCount);
  const { rotation, spinning, resultIndex, spinToIndex } = useFortuneWheel(segments.length);

  const controlsLocked = spinning || autoRunning;
  const [wheelSize, setWheelSize] = useState(WHEEL_SIZE_MOBILE);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_WHEEL_QUERY);
    const update = () => setWheelSize(mq.matches ? WHEEL_SIZE_DESKTOP : WHEEL_SIZE_MOBILE);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const riskOptions = [
    { value: "low" as const, label: t("plinkoLow") },
    { value: "medium" as const, label: t("plinkoMedium") },
    { value: "high" as const, label: t("plinkoHigh") },
  ];

  const segmentOptions = WHEEL_SEGMENT_OPTIONS.map((value) => ({
    value,
    label: String(value),
  }));

  const setMaxBet = () => setBetAmount(Math.max(LIBERTY_MIN_BET, roundLiberty(balance)));

  const spinOnce = async (showResultToast = true) => {
    const spendErr = spendLiberty(betAmount);
    if (spendErr) {
      showToast(t(spendErr as TranslationKey));
      return false;
    }

    play("bet");
    if (!hasPlayed) setHasPlayed(true);

    const idx = pickWheelSegmentIndex(segments.length);
    const pending = spinToIndex(idx);
    if (!pending) {
      creditLiberty(betAmount);
      return false;
    }

    play("wheelSpin");

    const resultIdx = await pending;
    play("wheelStop");
    const multiplier = segments[resultIdx].multiplier;
    const payout = roundLiberty(betAmount * multiplier);
    const net = computeBetNet(payout, betAmount);

    creditLiberty(payout);

    if (!showResultToast) return true;

    const outcome = getBetOutcome(net);
    const multLabel = formatMultiplier(multiplier);

    if (outcome === "win") {
      playWin();
      showToast(
        amountToastMessage(t("wheelWin"), {
          amount: formatLiberty(net),
          mult: multLabel,
        }),
      );
    } else if (outcome === "breakEven") {
      showToast(
        amountToastMessage(t("wheelWin"), {
          amount: formatLiberty(0),
          mult: multLabel,
        }),
      );
    } else {
      playLose();
      showToast(
        amountToastMessage(t("wheelLoss"), {
          amount: formatLiberty(formatBetLossAmount(net)),
          mult: multLabel,
        }),
      );
    }

    return true;
  };

  const handleBet = async () => {
    if (!active) return;

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

    if (mode === "auto") {
      if (autoCount < 1) return;

      setAutoRunning(true);
      autoCancelRef.current = false;
      let remaining = autoCount;

      while (remaining > 0 && !autoCancelRef.current) {
        if (getLibertyBalance() < betAmount) {
          showToast(t("walletInsufficient"));
          break;
        }

        const ok = await spinOnce(false);
        if (!ok) break;

        remaining -= 1;
        setAutoCount(remaining);
      }

      setAutoRunning(false);
      return;
    }

    if (balance < betAmount) {
      showToast(t("walletInsufficient"));
      return;
    }

    await spinOnce(true);
  };

  const stage = (
    <div className="wheel-table-wrap">
      <div className="wheel-table">
        <div className="wheel-arena">
          <FortuneWheel
            segments={segments}
            spinning={spinning}
            rotation={rotation}
            highlightIndex={resultIndex}
            size={wheelSize}
          />
        </div>
      </div>
    </div>
  );

  const controls = (
    <aside className={`plinko-panel wheel-panel-controls${hasPlayed ? " wheel-panel-launched" : ""}`}>
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
              onClick={() => setBetAmount((value) => Math.max(0, value / 2))}
              disabled={controlsLocked}
            >
              ½
            </button>
            <button
              type="button"
              onClick={() => setBetAmount((value) => value * 2)}
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
          <span>{t("wheelSegments")}</span>
          <PlinkoSelect
            value={segmentCount}
            options={segmentOptions}
            onChange={setSegmentCount}
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
            max={100}
            value={autoCount}
            onChange={(e) => setAutoCount(Math.max(0, parseInt(e.target.value, 10) || 0))}
            disabled={controlsLocked}
          />
        </label>
      )}

      <button
        type="button"
        className={`plinko-bet-btn plinko-panel-full plinko-order-bet-btn wheel-bet-btn${autoRunning ? " plinko-bet-btn-cancel" : ""}`}
        onClick={handleBet}
        disabled={!autoRunning && controlsLocked}
      >
        {autoRunning ? t("plinkoAutoCancel") : spinning ? t("wheelSpinning") : t("plinkoBetBtn")}
      </button>
    </aside>
  );

  return (
    <div className="plinko-layout wheel-layout">
      {stage}
      {controls}
    </div>
  );
}
