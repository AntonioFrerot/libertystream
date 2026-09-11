"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, ChevronUp, Search, Settings, Wallet } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useWallet } from "@/components/providers/WalletProvider";
import { useCurrency } from "@/lib/wallet/useCurrency";
import { Modal } from "@/components/ui/Modal";
import { CryptoIcon } from "@/components/wallet/CryptoIcon";
import { LibertyCoinIcon } from "@/components/wallet/LibertyCoinIcon";
import {
  CRYPTO_TOKENS,
  FIAT_CURRENCIES,
  formatCrypto,
  formatLiberty,
  getToken,
  toFiatUsd,
  type CryptoId,
  type FiatCurrency,
} from "@/lib/wallet/types";

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative w-9 h-5 rounded-full transition-colors ${on ? "bg-kick-green" : "bg-kick-bg border border-kick-border"}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${on ? "left-[18px]" : "left-0.5"}`} />
    </button>
  );
}

export function CryptoWalletBar() {
  const { t, locale } = useLanguage();
  const { formatMoney } = useCurrency();
  const {
    balances,
    settings,
    setSelectedCrypto,
    setDisplayInFiat,
    setHideZeroBalances,
    setFiatCurrency,
    openWallet,
    settingsOpen,
    openSettings,
    closeSettings,
  } = useWallet();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const selected = settings.selectedCrypto;
  const token = getToken(selected);
  const bal = balances[selected];
  const fiatVal = toFiatUsd(bal, token);

  const totalFiat = useMemo(
    () => CRYPTO_TOKENS.reduce((sum, tok) => sum + toFiatUsd(balances[tok.id], tok), 0),
    [balances]
  );

  const displayAmount = settings.displayInFiat
    ? formatMoney(fiatVal)
    : `${formatCrypto(bal, selected)} ${token.symbol}`;

  const filteredTokens = useMemo(() => {
    const q = search.trim().toLowerCase();
    return CRYPTO_TOKENS.filter((tok) => {
      if (settings.hideZeroBalances && balances[tok.id] <= 0) return false;
      if (!q) return true;
      return tok.symbol.toLowerCase().includes(q) || tok.name.toLowerCase().includes(q);
    });
  }, [balances, settings.hideZeroBalances, search]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectToken = (id: CryptoId) => {
    setSelectedCrypto(id);
    setOpen(false);
    setSearch("");
  };

  return (
    <>
      <div ref={ref} className="relative">
        <div className="wallet-bar">
          <div className="wallet-bar-liberty" aria-label="Liberty Coins">
            <LibertyCoinIcon size="md" />
            <span className="wallet-bar-liberty-amount">{formatLiberty(balances.liberty, locale)}</span>
          </div>

          <span className="wallet-bar-divider" aria-hidden />

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className={`wallet-bar-balance ${open ? "wallet-bar-balance-open" : ""}`}
          >
            <div className="wallet-bar-amount-group">
              <span className="wallet-bar-amount">{displayAmount}</span>
              <CryptoIcon id={selected} size="sm" />
            </div>
            {open ? (
              <ChevronUp className="wallet-bar-chevron" strokeWidth={2.5} />
            ) : (
              <ChevronDown className="wallet-bar-chevron" strokeWidth={2.5} />
            )}
          </button>

          <span className="wallet-bar-divider" aria-hidden />

          <button type="button" onClick={() => openWallet("deposit")} className="wallet-bar-action">
            <Wallet strokeWidth={2} />
            <span>{t("walletRecharge")}</span>
          </button>
        </div>

        {open && (
          <div className="wallet-dropdown">
            <div className="px-4 py-3 border-b border-kick-border bg-kick-bg/50">
              <p className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">{t("walletSelectedBalance")}</p>
              <p className="text-lg font-bold text-kick-green tabular-nums">
                {formatMoney(totalFiat)}
              </p>
            </div>

            <div className="px-3 py-2 border-b border-kick-border">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("walletSearchToken")}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-kick-bg border border-kick-border text-xs focus:outline-none focus:border-kick-green/40"
                />
              </div>
            </div>

            <div className="max-h-56 overflow-y-auto">
              {filteredTokens.length === 0 ? (
                <p className="px-4 py-6 text-center text-xs text-white/40">{t("walletNoTokens")}</p>
              ) : (
                filteredTokens.map((tok) => {
                  const tokBal = balances[tok.id];
                  const tokFiat = toFiatUsd(tokBal, tok);
                  const isSelected = tok.id === selected;
                  return (
                    <button
                      key={tok.id}
                      type="button"
                      onClick={() => selectToken(tok.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-kick-hover transition-colors ${isSelected ? "bg-kick-hover" : ""}`}
                    >
                      <CryptoIcon id={tok.id} size="sm" />
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-sm font-semibold">{tok.symbol}</p>
                        <p className="text-[10px] text-white/40 truncate">{tok.name}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-bold tabular-nums">
                          {settings.displayInFiat
                            ? formatMoney(tokFiat)
                            : `${formatCrypto(tokBal, tok.id)} ${tok.symbol}`}
                        </p>
                        <p className="text-[10px] text-white/40 tabular-nums">
                          {settings.displayInFiat
                            ? `${formatCrypto(tokBal, tok.id)} ${tok.symbol}`
                            : formatMoney(tokFiat)}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <div className="px-3 py-2.5 border-t border-kick-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-white/50">{t("walletDisplayFiat")}</span>
                <Toggle on={settings.displayInFiat} onChange={setDisplayInFiat} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-white/50">{t("walletHideZero")}</span>
                <Toggle on={settings.hideZeroBalances} onChange={setHideZeroBalances} />
              </div>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  openSettings();
                }}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] text-white/50 hover:text-white hover:bg-kick-hover transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                {t("walletSettings")}
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal open={settingsOpen} onClose={closeSettings} title={t("walletSettings")}>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-white/40 mb-2">{t("walletFiatCurrency")}</p>
            <div className="grid grid-cols-2 gap-2">
              {FIAT_CURRENCIES.map((fiat) => (
                <button
                  key={fiat.code}
                  type="button"
                  onClick={() => setFiatCurrency(fiat.code as FiatCurrency)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    settings.fiatCurrency === fiat.code
                      ? "border-kick-green/50 bg-kick-green/10 text-kick-green"
                      : "border-kick-border bg-kick-bg hover:bg-kick-hover"
                  }`}
                >
                  {fiat.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-white/30 mt-2">{t("walletFiatHint")}</p>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">{t("walletDisplayFiat")}</span>
            <Toggle on={settings.displayInFiat} onChange={setDisplayInFiat} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">{t("walletHideZero")}</span>
            <Toggle on={settings.hideZeroBalances} onChange={setHideZeroBalances} />
          </div>
        </div>
      </Modal>
    </>
  );
}
