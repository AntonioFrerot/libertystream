"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { TranslationKey } from "@/lib/i18n/translations";

interface GameRulesInfoButtonProps {
  rulesTitleKey: TranslationKey;
  rulesBodyKey: TranslationKey;
}

export function GameRulesInfoButton({ rulesTitleKey, rulesBodyKey }: GameRulesInfoButtonProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const steps = t(rulesBodyKey)
    .split("\n")
    .map((step) => step.trim())
    .filter(Boolean);

  return (
    <>
      <button
        type="button"
        className="game-rules-info-btn"
        onClick={() => setOpen(true)}
        aria-label={t(rulesTitleKey)}
      >
        <Info className="game-rules-info-icon" aria-hidden />
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={t(rulesTitleKey)}>
        <ul className="game-rules-list">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ul>
      </Modal>
    </>
  );
}
