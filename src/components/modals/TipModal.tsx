"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { CryptoIcon } from "@/components/wallet/CryptoIcon";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/components/providers/AuthProvider";
import { useWallet } from "@/components/providers/WalletProvider";
import { useCurrency } from "@/lib/wallet/useCurrency";
import {
  CRYPTO_TOKENS,
  TIP_MIN_USD,
  formatCrypto,
  getToken,
  toFiatUsd,
  type CryptoId,
} from "@/lib/wallet/types";
import type { TranslationKey } from "@/lib/i18n/translations";

interface TipModalProps {
  open: boolean;
  onClose: () => void;
  streamerName: string;
  streamerUsername: string;
  recipientUserId?: string;
  editableRecipient?: boolean;
}

function formatTipCryptoBalance(balance: number, id: CryptoId): string {
  if (id === "usdt" || id === "usdc") return balance.toFixed(8);
  return formatCrypto(balance, id);
}

function formatTipCryptoAmount(amount: number, id: CryptoId): string {
  if (id === "usdt" || id === "usdc") return amount.toFixed(8);
  return formatCrypto(amount, id);
}

function PublicToggle({ on, onChange }: { on: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative w-9 h-5 rounded-full transition-colors ${on ? "bg-kick-green" : "bg-kick-bg border border-kick-border"}`}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${on ? "left-[18px]" : "left-0.5"}`}
      />
    </button>
  );
}

export function TipModal({
  open,
  onClose,
  streamerName,
  streamerUsername,
  recipientUserId,
  editableRecipient = false,
}: TipModalProps) {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { user, sendTip } = useAuth();
  const { spend, balances, settings, setSelectedCrypto, getAvailableUsd } = useWallet();
  const { formatMoney, symbol } = useCurrency();
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState(streamerUsername);
  const [isPublic, setIsPublic] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const currencyRef = useRef<HTMLDivElement>(null);

  const selected = settings.selectedCrypto;
  const token = getToken(selected);
  const balance = balances[selected];
  const balanceFiat = toFiatUsd(balance, token);

  const costUsd = parseFloat(amount) || 0;
  const cryptoCost = costUsd / token.fiatRate;
  const canAfford = getAvailableUsd(selected) >= costUsd;
  const meetsMinimum = costUsd >= TIP_MIN_USD;
  const minDisplay = formatMoney(TIP_MIN_USD);
  const displayAmount = formatMoney(costUsd);

  useEffect(() => {
    if (!open) return;
    setRecipient(streamerUsername);
  }, [open, streamerUsername]);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (currencyRef.current && !currencyRef.current.contains(event.target as Node)) {
        setCurrencyOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const resetForm = () => {
    setAmount("");
    setRecipient(streamerUsername);
    setIsPublic(false);
    setCurrencyOpen(false);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const handleSend = () => {
    if (!user || costUsd <= 0) return;
    const targetUsername = (editableRecipient ? recipient : streamerUsername).trim().toLowerCase();
    if (!targetUsername) {
      showToast(t("tipRecipientRequired"));
      return;
    }
    if (costUsd < TIP_MIN_USD) {
      showToast(t("tipMinAmount", { amount: minDisplay }));
      return;
    }
    const err = spend(costUsd, selected);
    if (err) {
      showToast(t(err as TranslationKey));
      return;
    }
    const friend = user.friends.find((entry) => entry.slug === targetUsername);
    sendTip(targetUsername, costUsd.toFixed(2), recipientUserId ?? friend?.userId);
    showToast(t("tipSuccess", { amount: displayAmount }));
    handleClose();
  };

  const selectToken = (id: CryptoId) => {
    setSelectedCrypto(id);
    setCurrencyOpen(false);
  };

  const fieldClass =
    "w-full px-4 py-2.5 rounded-xl bg-glass border border-glass-border text-sm text-white focus:outline-none focus:border-neon-gold/40 transition-colors";

  return (
    <Modal open={open} onClose={handleClose} title={t("tipTitle")}>
      <div className="mb-4">
        <div className="flex items-center justify-between gap-3 mb-1.5">
          <span className="text-xs text-white/40">{t("tipCurrency")}</span>
          <span className="text-xs text-white/40">{t("tipBalance")}</span>
        </div>

        <div ref={currencyRef} className="relative">
          <button
            type="button"
            onClick={() => setCurrencyOpen((value) => !value)}
            aria-expanded={currencyOpen}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-glass border border-glass-border hover:border-white/20 transition-colors"
          >
            <CryptoIcon id={selected} size="md" />
            <div className="min-w-0 text-left">
              <p className="text-sm font-semibold text-white">{token.symbol}</p>
              <p className="text-[11px] text-white/40 truncate">{token.name}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-sm font-bold text-kick-green tabular-nums">{formatMoney(balanceFiat)}</p>
              <p className="text-[10px] text-white/35 tabular-nums">
                {formatTipCryptoBalance(balance, selected)}
              </p>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-white/35 flex-shrink-0 transition-transform ${currencyOpen ? "rotate-180" : ""}`}
            />
          </button>

          {currencyOpen && (
            <ul className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 m-0 list-none p-1.5 rounded-xl bg-kick-surface border border-kick-border shadow-[0_16px_48px_rgba(26,21,37,0.55)] max-h-52 overflow-y-auto">
              {CRYPTO_TOKENS.map((entry) => {
                const entryBalance = balances[entry.id];
                const entryFiat = toFiatUsd(entryBalance, entry);
                return (
                  <li key={entry.id}>
                    <button
                      type="button"
                      onClick={() => selectToken(entry.id)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors ${
                        entry.id === selected
                          ? "bg-kick-green/10 border border-kick-green/25"
                          : "hover:bg-kick-hover border border-transparent"
                      }`}
                    >
                      <CryptoIcon id={entry.id} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white">{entry.symbol}</p>
                        <p className="text-[11px] text-white/40 truncate">{entry.name}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-bold text-white tabular-nums">{formatMoney(entryFiat)}</p>
                        <p className="text-[10px] text-white/35 tabular-nums">
                          {formatTipCryptoBalance(entryBalance, entry.id)}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="mb-4">
        <label className="text-xs text-white/40 mb-1.5 block" htmlFor="tip-username">
          {t("tipUsername")}
        </label>
        <input
          id="tip-username"
          type="text"
          value={editableRecipient ? recipient : streamerUsername}
          readOnly={!editableRecipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder={editableRecipient ? t("tipRecipientPlaceholder") : undefined}
          className={`${fieldClass} ${editableRecipient ? "" : "text-white/80"}`}
        />
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between gap-3 mb-1.5">
          <label className="text-xs text-white/40" htmlFor="tip-amount">
            {t("tipAmountLabel")}
          </label>
          <span className="text-[11px] text-white/35 tabular-nums">
            {formatTipCryptoAmount(cryptoCost, selected)} {token.symbol}
          </span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-glass border border-glass-border focus-within:border-neon-gold/40 transition-colors">
          <span className="text-sm font-bold text-white">{symbol}</span>
          <input
            id="tip-amount"
            type="number"
            min={TIP_MIN_USD}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            inputMode="decimal"
            className="flex-1 min-w-0 bg-transparent border-none text-sm font-semibold text-white placeholder:text-white/35 focus:outline-none"
          />
          <CryptoIcon id={selected} size="sm" />
        </div>
        <div className="flex items-center justify-between gap-3 mt-1.5 mb-4">
          <p className="text-[11px] text-white/35">{t("tipMinAmount", { amount: minDisplay })}</p>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-white/50">{t("tipPublic")}</span>
            <PublicToggle on={isPublic} onChange={setIsPublic} />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSend}
        disabled={!canAfford || !meetsMinimum}
        className="w-full btn-gold !py-3 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {costUsd > 0 ? `${t("tipSendButton")} ${displayAmount}` : t("tipSendButton")}
      </button>
    </Modal>
  );
}
