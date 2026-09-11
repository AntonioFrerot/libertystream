"use client";

import { Modal } from "@/components/ui/Modal";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/components/providers/AuthProvider";
import { useWallet } from "@/components/providers/WalletProvider";
import { WalletPaymentPanel, useCanAfford } from "@/components/wallet/WalletPaymentPanel";
import { useCurrency } from "@/lib/wallet/useCurrency";
import { Crown } from "lucide-react";
import { SUB_PRICE_USD } from "@/lib/wallet/types";
import type { TranslationKey } from "@/lib/i18n/translations";

interface SubscribeModalProps {
  open: boolean;
  onClose: () => void;
  streamerName: string;
  streamerUsername: string;
}

export function SubscribeModal({ open, onClose, streamerName, streamerUsername }: SubscribeModalProps) {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { user, subscribe, isSubscribed } = useAuth();
  const { spend } = useWallet();
  const { formatMoney } = useCurrency();

  const costUsd = SUB_PRICE_USD;
  const canAfford = useCanAfford(costUsd);
  const displayPrice = formatMoney(costUsd);
  const alreadySub = isSubscribed(streamerUsername);

  const handleSubscribe = () => {
    if (!user) return;
    if (alreadySub) {
      showToast(t("alreadySubscribed"));
      onClose();
      return;
    }
    const err = spend(costUsd);
    if (err) {
      showToast(t(err as TranslationKey));
      return;
    }
    subscribe(streamerUsername);
    showToast(t("subSuccess", { name: streamerName }));
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={t("subTitle")}>
      <p className="text-sm text-white/50 mb-1">{t("subDesc")}</p>
      {user && <p className="text-xs text-neon-cyan/60 mb-5">Compte : {user.username}</p>}

      <div className="glass-panel p-4 mb-5 border-neon-cyan/20">
        <div className="flex items-center gap-3 mb-3">
          <Crown className="w-5 h-5 text-neon-cyan" />
          <div>
            <p className="font-semibold">{t("subMonthly")}</p>
            <p className="text-xs text-white/40">100% → {streamerName}</p>
          </div>
          <span className="ml-auto font-display font-bold text-neon-cyan">{displayPrice}</span>
        </div>
        <ul className="text-xs text-white/50 space-y-1">
          <li>✓ Emotes exclusives</li>
          <li>✓ Badge abonné dans le chat</li>
          <li>✓ Chat prioritaire</li>
        </ul>
      </div>

      {!alreadySub && <WalletPaymentPanel costUsd={costUsd} />}

      <button
        type="button"
        onClick={handleSubscribe}
        disabled={!alreadySub && !canAfford}
        className="w-full btn-primary !py-3 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {alreadySub ? t("alreadySubscribed") : `${t("subConfirm")}, ${displayPrice}/mois`}
      </button>
    </Modal>
  );
}
