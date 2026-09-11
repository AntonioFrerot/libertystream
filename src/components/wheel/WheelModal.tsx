"use client";

import { useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/components/providers/AuthProvider";
import { useAppUI } from "@/components/providers/AppUIProvider";
import { useGameWallet } from "@/lib/wallet/useGameWallet";
import {
  PromoFortuneWheel,
  usePromoFortuneWheel,
  type PromoWheelSegment,
} from "@/components/wheel/PromoFortuneWheel";

interface WheelModalProps {
  open: boolean;
  onClose: () => void;
}

/** 8 segments — valeurs et teintes violettes comme la maquette popup. */
const PROMO_SEGMENTS: PromoWheelSegment[] = [
  { amount: 5, color: "#b57bff" },
  { amount: 10, color: "#9333ea" },
  { amount: 15, color: "#c4a8f5" },
  { amount: 20, color: "#7c3aed" },
  { amount: 25, color: "#b57bff" },
  { amount: 50, color: "#6d28d9" },
  { amount: 75, color: "#9333ea" },
  { amount: 100, color: "#5b21b6" },
];

export function WheelModal({ open, onClose }: WheelModalProps) {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { user } = useAuth();
  const { openAuth } = useAppUI();
  const { creditLiberty, formatLiberty } = useGameWallet();

  const segments = useMemo(() => PROMO_SEGMENTS, []);
  const { rotation, spinning, spin } = usePromoFortuneWheel(segments.length);

  const handleSpin = async () => {
    if (!user) {
      openAuth("login");
      return;
    }

    const pending = spin();
    if (!pending) return;

    const idx = await pending;
    const segment = segments[idx];
    creditLiberty(segment.amount);
    showToast(
      t("wheelResult", {
        prize: t("wheelPrizeEagle", { amount: formatLiberty(segment.amount) }),
      }),
    );
  };

  return (
    <Modal open={open} onClose={onClose} title={t("wheelTitle")}>
      <div className="wheel-modal">
        <p className="wheel-modal-desc">{t("wheelDesc")}</p>

        <PromoFortuneWheel segments={segments} spinning={spinning} rotation={rotation} />

        <button type="button" className="wheel-modal-spin" onClick={handleSpin} disabled={spinning}>
          {spinning ? t("wheelSpinning") : t("wheelSpin")}
        </button>
      </div>
    </Modal>
  );
}
