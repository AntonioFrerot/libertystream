"use client";

import { useEffect, useRef, useState } from "react";
import {
  EAGLE_FLIGHT_DEFAULT_TARGET_MULTIPLIER,
  EAGLE_FLIGHT_MIN_AUTO_CASHOUT,
  eagleFlightMaxWin,
} from "@/lib/casino/eagle-flight/config";

function parseMultiplierInput(raw: string): number | null {
  const normalized = raw.trim().replace(",", ".");
  if (normalized === "" || normalized === ".") return null;
  const parsed = parseFloat(normalized);
  if (Number.isNaN(parsed)) return null;
  return Math.max(0, parsed);
}

function formatMultiplierDisplay(value: number): string {
  return value.toFixed(2);
}

function clampTargetMultiplier(value: number): number {
  return Math.min(Math.max(value, EAGLE_FLIGHT_MIN_AUTO_CASHOUT), eagleFlightMaxWin());
}

interface EagleFlightCashoutAtInputProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function EagleFlightCashoutAtInput({
  value,
  onChange,
  disabled = false,
}: EagleFlightCashoutAtInputProps) {
  const [inputText, setInputText] = useState(() => formatMultiplierDisplay(value));
  const lastCommitted = useRef(value);

  useEffect(() => {
    if (value !== lastCommitted.current) {
      lastCommitted.current = value;
      setInputText(formatMultiplierDisplay(value));
    }
  }, [value]);

  const commitValue = (next: number) => {
    const clamped = clampTargetMultiplier(next);
    lastCommitted.current = clamped;
    onChange(clamped);
    setInputText(formatMultiplierDisplay(clamped));
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    if (raw !== "" && !/^\d*[.,]?\d*$/.test(raw)) return;

    setInputText(raw);

    const parsed = parseMultiplierInput(raw);
    if (parsed === null) return;

    const clamped = clampTargetMultiplier(parsed);
    lastCommitted.current = clamped;
    onChange(clamped);
  };

  const handleBlur = () => {
    const parsed = parseMultiplierInput(inputText);
    if (parsed === null || parsed <= 0) {
      commitValue(EAGLE_FLIGHT_DEFAULT_TARGET_MULTIPLIER);
      return;
    }

    commitValue(parsed);
  };

  return (
    <div className="eagle-flight-cashout-at-input-wrap">
      <input
        type="text"
        inputMode="decimal"
        autoComplete="off"
        className="eagle-flight-cashout-at-input"
        value={inputText}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
      />
      <span className="eagle-flight-cashout-at-suffix" aria-hidden>
        ×
      </span>
    </div>
  );
}
