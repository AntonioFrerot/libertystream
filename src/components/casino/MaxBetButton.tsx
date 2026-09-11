"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

interface MaxBetButtonProps {
  onConfirm: () => void;
  disabled?: boolean;
}

export function MaxBetButton({ onConfirm, disabled = false }: MaxBetButtonProps) {
  const { t } = useLanguage();
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!confirming) return;
    const timer = window.setTimeout(() => setConfirming(false), 4000);
    return () => window.clearTimeout(timer);
  }, [confirming]);

  useEffect(() => {
    if (disabled) setConfirming(false);
  }, [disabled]);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        if (!confirming) {
          setConfirming(true);
          return;
        }
        setConfirming(false);
        onConfirm();
      }}
    >
      {confirming ? t("betMaxConfirm") : "Max"}
    </button>
  );
}
