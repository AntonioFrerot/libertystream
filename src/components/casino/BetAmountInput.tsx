"use client";

import { useEffect, useRef, useState } from "react";

function parseBetInput(raw: string): number | null {
  if (raw === "" || raw === ".") return null;
  const parsed = parseFloat(raw);
  if (Number.isNaN(parsed)) return null;
  return Math.max(0, parsed);
}

function getInitialInputText(value: number, startWithZero: boolean): string {
  if (value === 0) return startWithZero ? "0" : "";
  return String(value);
}

interface BetAmountInputProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  /** Affiche 0 au départ ; une fois effacé, le 0 ne revient pas tant que l'utilisateur ne le retape pas. */
  startWithZero?: boolean;
}

export function BetAmountInput({
  value,
  onChange,
  disabled = false,
  startWithZero = false,
}: BetAmountInputProps) {
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

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    if (raw !== "" && !/^\d*\.?\d*$/.test(raw)) return;

    setInputText(raw);

    if (raw === "" || raw === ".") {
      userClearedZero.current = true;
      explicitZero.current = false;
      return;
    }

    const parsed = parseBetInput(raw);
    if (parsed === null) return;

    userClearedZero.current = false;
    explicitZero.current = parsed === 0;
    lastCommittedValue.current = parsed;
    onChange(parsed);
  };

  const handleInputBlur = () => {
    if (inputText === "" || inputText === ".") {
      userClearedZero.current = true;
      explicitZero.current = false;
      lastCommittedValue.current = 0;
      onChange(0);
      setInputText("");
      return;
    }

    const parsed = parseBetInput(inputText);
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

    lastCommittedValue.current = parsed;
    onChange(parsed);

    if (parsed === 0) {
      userClearedZero.current = false;
      explicitZero.current = true;
      setInputText("0");
      return;
    }

    userClearedZero.current = false;
    explicitZero.current = false;
    setInputText(String(parsed));
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      autoComplete="off"
      value={inputText}
      onChange={handleInputChange}
      onBlur={handleInputBlur}
      disabled={disabled}
    />
  );
}
