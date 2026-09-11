"use client";

import { useEffect, useRef, useState } from "react";

function parseCountInput(raw: string): number | null {
  if (raw === "") return null;
  const parsed = parseInt(raw, 10);
  if (Number.isNaN(parsed)) return null;
  return parsed;
}

function clampCount(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getInitialInputText(value: number, startWithZero: boolean): string {
  if (value === 0) return startWithZero ? "0" : "";
  return String(value);
}

interface IntegerCountInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  /** Affiche 0 au départ ; une fois effacé, le 0 ne revient pas tant que l'utilisateur ne le retape pas. */
  startWithZero?: boolean;
}

export function IntegerCountInput({
  value,
  onChange,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  disabled = false,
  startWithZero = false,
}: IntegerCountInputProps) {
  const [inputText, setInputText] = useState(() => getInitialInputText(value, startWithZero));
  const lastCommittedValue = useRef(value);
  const explicitZero = useRef(startWithZero && value === 0);
  const userClearedZero = useRef(false);

  useEffect(() => {
    if (value !== lastCommittedValue.current) {
      lastCommittedValue.current = value;
      if (value === 0) {
        if (startWithZero && !userClearedZero.current) {
          explicitZero.current = true;
          setInputText("0");
        } else {
          explicitZero.current = false;
          setInputText("");
        }
      } else {
        userClearedZero.current = false;
        explicitZero.current = false;
        setInputText(String(value));
      }
    }
  }, [value, startWithZero]);

  const commitValue = (parsed: number) => {
    const clamped = clampCount(parsed, min, max);
    lastCommittedValue.current = clamped;
    onChange(clamped);
    return clamped;
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    if (raw !== "" && !/^\d+$/.test(raw)) return;

    setInputText(raw);

    if (raw === "") {
      userClearedZero.current = true;
      explicitZero.current = false;
      return;
    }

    const parsed = parseCountInput(raw);
    if (parsed === null) return;

    userClearedZero.current = false;
    explicitZero.current = parsed === 0;
    commitValue(parsed);
  };

  const handleInputBlur = () => {
    if (inputText === "") {
      userClearedZero.current = true;
      explicitZero.current = false;
      lastCommittedValue.current = 0;
      onChange(0);
      setInputText("");
      return;
    }

    const parsed = parseCountInput(inputText);
    if (parsed === null) {
      if (value === 0 && explicitZero.current) {
        setInputText("0");
      } else if (value === 0) {
        setInputText("");
      } else {
        setInputText(String(value));
      }
      return;
    }

    const clamped = commitValue(parsed);

    if (clamped === 0) {
      userClearedZero.current = false;
      explicitZero.current = true;
      setInputText("0");
      return;
    }

    userClearedZero.current = false;
    explicitZero.current = false;
    setInputText(String(clamped));
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      autoComplete="off"
      value={inputText}
      onChange={handleInputChange}
      onBlur={handleInputBlur}
      disabled={disabled}
    />
  );
}
