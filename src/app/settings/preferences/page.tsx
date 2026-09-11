"use client";

import { Wallet } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useToast } from "@/components/ui/Toast";
import { useCurrency } from "@/lib/wallet/useCurrency";
import { SettingsSection } from "@/components/settings/SettingsShell";
import type { FiatCurrency } from "@/lib/wallet/types";

export default function SettingsPreferencesPage() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { currency, setCurrency, currencies } = useCurrency();

  const handleSelect = (code: FiatCurrency) => {
    setCurrency(code);
    showToast(t("settingsCurrencySaved"));
  };

  return (
    <SettingsSection title={t("settingsCurrencyTitle")} description={t("settingsCurrencyDesc")}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {currencies.map((fiat) => (
          <button
            key={fiat.code}
            type="button"
            onClick={() => handleSelect(fiat.code)}
            className={`flex flex-col items-center gap-2 px-4 py-4 rounded-xl border transition-colors ${
              currency === fiat.code
                ? "border-kick-green/50 bg-kick-green/10 text-kick-green"
                : "border-kick-border bg-kick-bg hover:bg-kick-hover text-white/80"
            }`}
          >
            <Wallet className="w-5 h-5 opacity-70" />
            <span className="text-lg font-bold">{fiat.symbol}</span>
            <span className="text-xs font-semibold">{fiat.label}</span>
          </button>
        ))}
      </div>
      <p className="text-xs text-white/40 mt-4">{t("walletFiatHint")}</p>
    </SettingsSection>
  );
}
