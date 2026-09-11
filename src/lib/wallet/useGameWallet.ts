"use client";

import { useCallback } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useWallet } from "@/components/providers/WalletProvider";
import { formatLiberty } from "@/lib/wallet/types";

/** Wallet dédié aux jeux — paris en LibertyCoins uniquement. */
export function useGameWallet() {
  const { locale } = useLanguage();
  const { balances, getLibertyBalance, spendLiberty, creditLiberty } = useWallet();

  const format = useCallback(
    (amount: number) => formatLiberty(amount, locale),
    [locale]
  );

  return {
    libertyBalance: balances.liberty,
    getLibertyBalance,
    spendLiberty,
    creditLiberty,
    formatLiberty: format,
  };
}
