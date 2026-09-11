"use client";

import { useState } from "react";
import { Gift } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/components/providers/AuthProvider";
import { useWallet } from "@/components/providers/WalletProvider";
import { WalletPaymentPanel, useCanAfford } from "@/components/wallet/WalletPaymentPanel";
import { useCurrency } from "@/lib/wallet/useCurrency";
import { SUB_PRICE_USD } from "@/lib/wallet/types";
import type { TranslationKey } from "@/lib/i18n/translations";

interface GiftSubModalProps {
  open: boolean;
  onClose: () => void;
  streamerName: string;
  streamerUsername: string;
}

const GIFT_COUNTS = [1, 5, 10, 25];

export function GiftSubModal({ open, onClose, streamerName, streamerUsername }: GiftSubModalProps) {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { user } = useAuth();
  const { spend } = useWallet();
  const { formatMoney } = useCurrency();
  const [count, setCount] = useState(5);

  const costUsd = count * SUB_PRICE_USD;
  const canAfford = useCanAfford(costUsd);
  const displayTotal = formatMoney(costUsd);

  const handleGift = () => {
    if (!user) return;
    const err = spend(costUsd);
    if (err) {
      showToast(t(err as TranslationKey));
      return;
    }
    showToast(t("giftSubSuccess", { count: String(count), name: streamerName }));
    onClose();
    setCount(5);
  };

  return (
    <Modal open={open} onClose={onClose} title={t("giftSubTitle")}>
      <p className="text-sm text-white/50 mb-1">{t("giftSubDesc", { name: streamerName })}</p>
      {user && <p className="text-xs text-neon-cyan/60 mb-5">Compte : {user.username}</p>}

      <div className="grid grid-cols-4 gap-2 mb-4">
        {GIFT_COUNTS.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setCount(n)}
            className={`py-3 rounded-lg text-sm font-semibold border transition-colors ${
              count === n
                ? "bg-kick-green/15 border-kick-green/40 text-kick-green"
                : "bg-kick-bg border-kick-border text-white/70 hover:border-white/20"
            }`}
          >
            {n}
          </button>
        ))}
      </div>

      <div className="glass-panel p-4 mb-4 border-neon-cyan/20">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/50">{t("giftSubTotal")}</span>
          <span className="font-display font-bold text-neon-cyan">{displayTotal}</span>
        </div>
        <p className="text-xs text-white/40 mt-2">{t("giftSubNote")}</p>
      </div>

      <WalletPaymentPanel costUsd={costUsd} />

      <button
        type="button"
        onClick={handleGift}
        disabled={!canAfford}
        className="w-full btn-primary !py-3 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {t("giftSubConfirm", { count: String(count) })}
      </button>
    </Modal>
  );
}

export function GiftSubButton({
  onClick,
  className = "",
}: {
  onClick: () => void;
  className?: string;
}) {
  const { t } = useLanguage();

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-kick-border bg-kick-bg text-sm font-semibold text-white/80 hover:border-kick-green/40 hover:text-kick-green transition-colors ${className}`}
    >
      <Gift className="w-4 h-4 stream-info-gift-icon" />
      <span className="stream-info-gift-label">{t("giftSub")}</span>
    </button>
  );
}
