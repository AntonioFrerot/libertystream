"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useWallet } from "@/components/providers/WalletProvider";
import { CryptoIcon } from "@/components/wallet/CryptoIcon";
import { useCurrency } from "@/lib/wallet/useCurrency";
import { formatCrypto, getToken } from "@/lib/wallet/types";

interface WalletPaymentPanelProps {
  costUsd: number;
}

export function useCanAfford(costUsd: number): boolean {
  const { getAvailableUsd } = useWallet();
  return getAvailableUsd() >= costUsd;
}

export function WalletPaymentPanel({ costUsd }: WalletPaymentPanelProps) {
  const { t } = useLanguage();
  const { balances, settings, openWallet, getAvailableUsd } = useWallet();
  const { formatMoney } = useCurrency();

  const cryptoId = settings.selectedCrypto;
  const token = getToken(cryptoId);
  const availableUsd = getAvailableUsd(cryptoId);
  const canAfford = availableUsd >= costUsd;
  const remainingUsd = availableUsd - costUsd;
  const cryptoCost = costUsd / token.fiatRate;

  return (
    <div
      className={`rounded-lg border p-3 mb-4 space-y-2 ${
        canAfford ? "border-kick-border bg-kick-bg" : "border-red-500/30 bg-red-500/5"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <CryptoIcon id={cryptoId} size="sm" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white">{token.symbol}</p>
            <p className="text-[10px] text-white/40 truncate">{t("walletPayFrom")}</p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[10px] text-white/40">{t("walletPayAvailable")}</p>
          <p className="text-sm font-bold text-kick-green tabular-nums">{formatMoney(availableUsd)}</p>
          <p className="text-[10px] text-white/30 tabular-nums">
            {formatCrypto(balances[cryptoId], cryptoId)} {token.symbol}
          </p>
        </div>
      </div>

      <div className="h-px bg-kick-border" />

      <div className="flex items-center justify-between text-xs">
        <span className="text-white/50">{t("walletPayCost")}</span>
        <span className="font-semibold tabular-nums">{formatMoney(costUsd)}</span>
      </div>

      {canAfford ? (
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/50">{t("walletPayRemaining")}</span>
          <span className="font-semibold tabular-nums text-white/70">{formatMoney(remainingUsd)}</span>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-red-400">{t("walletPayInsufficient")}</p>
          <button
            type="button"
            onClick={() => openWallet("deposit")}
            className="text-xs font-semibold text-kick-green hover:underline flex-shrink-0"
          >
            {t("walletRecharge")}
          </button>
        </div>
      )}

      <p className="text-[10px] text-white/30 tabular-nums">
        ≈ {formatCrypto(cryptoCost, cryptoId)} {token.symbol}
      </p>
    </div>
  );
}
