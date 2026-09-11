"use client";

import { useCallback } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useWallet } from "@/components/providers/WalletProvider";
import {
  FIAT_CURRENCIES,
  formatFiat,
  getFiat,
  type FiatCurrency,
} from "@/lib/wallet/types";

export function useCurrency() {
  const { settings, setFiatCurrency } = useWallet();
  const { locale } = useLanguage();
  const currency = settings.fiatCurrency;
  const fiat = getFiat(currency);

  const formatMoney = useCallback(
    (amountUsd: number) => formatFiat(amountUsd, locale, currency),
    [locale, currency]
  );

  const formatMoneyCompact = useCallback(
    (amountUsd: number) => {
      const converted = Math.round(amountUsd * fiat.rate);
      return `${fiat.symbol}${converted}`;
    },
    [fiat]
  );

  return {
    currency,
    setCurrency: setFiatCurrency,
    formatMoney,
    formatMoneyCompact,
    symbol: fiat.symbol,
    fiat,
    currencies: FIAT_CURRENCIES,
  };
}

export type { FiatCurrency };
