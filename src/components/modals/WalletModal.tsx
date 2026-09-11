"use client";

import { useState, useEffect } from "react";
import { Copy, Check, ArrowDownUp, ChevronDown } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useToast } from "@/components/ui/Toast";
import { useWallet } from "@/components/providers/WalletProvider";
import {
  CRYPTO_TOKENS,
  SWAP_FEE,
  calcSwapReceive,
  formatCrypto,
  getToken,
  mockDepositAddress,
  toFiatUsd,
  type CryptoId,
  type WalletTab,
} from "@/lib/wallet/types";
import type { TranslationKey } from "@/lib/i18n/translations";
import { CryptoIcon } from "@/components/wallet/CryptoIcon";
import { useCurrency } from "@/lib/wallet/useCurrency";

function CryptoSelect({ value, onChange }: { value: CryptoId; onChange: (id: CryptoId) => void }) {
  const [open, setOpen] = useState(false);
  const token = getToken(value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-kick-bg border border-kick-border hover:border-kick-green/30 transition-colors"
      >
        <CryptoIcon id={value} size="md" />
        <div className="flex-1 text-left">
          <p className="text-sm font-bold">{token.symbol}</p>
          <p className="text-[10px] text-white/40">{token.network}</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-10 top-full mt-1 w-full rounded-lg bg-kick-surface border border-kick-border shadow-xl overflow-hidden">
          {CRYPTO_TOKENS.map((tok) => (
            <button
              key={tok.id}
              type="button"
              onClick={() => { onChange(tok.id); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-kick-hover transition-colors ${value === tok.id ? "bg-kick-hover" : ""}`}
            >
              <CryptoIcon id={tok.id} size="sm" />
              <span className="text-sm font-medium">{tok.symbol}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DepositTab({ cryptoId }: { cryptoId: CryptoId }) {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { creditDemo } = useWallet();
  const [selected, setSelected] = useState(cryptoId);
  const [copied, setCopied] = useState(false);
  const token = getToken(selected);
  const address = mockDepositAddress(selected);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      showToast(t("walletAddressCopied"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast(t("linkCopyFail"));
    }
  };

  const demoCredit = () => {
    const amounts: Record<CryptoId, number> = { eth: 0.01, btc: 0.001, ltc: 0.5, sol: 1, usdt: 50, usdc: 50 };
    creditDemo(selected, amounts[selected]);
    showToast(t("walletDemoCredited", { symbol: token.symbol }));
  };

  return (
    <div className="space-y-4">
      <CryptoSelect value={selected} onChange={setSelected} />

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-36 h-36 mx-auto sm:mx-0 rounded-xl bg-white p-2 flex items-center justify-center flex-shrink-0">
          <div className="w-full h-full bg-[repeating-linear-gradient(45deg,#000_0,#000_2px,transparent_2px,transparent_6px)] opacity-80 rounded-lg" />
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <p className="text-xs text-white/40 mb-1">{t("walletNetwork")}</p>
            <span className="inline-block px-2 py-0.5 rounded bg-kick-green/10 border border-kick-green/30 text-xs text-kick-green font-medium">{token.network}</span>
          </div>
          <div>
            <p className="text-xs text-white/40 mb-1">{t("walletDepositAddress", { symbol: token.symbol })}</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs text-kick-green break-all bg-kick-bg rounded-lg px-3 py-2 border border-kick-border">{address}</code>
              <button type="button" onClick={handleCopy} className="p-2 rounded-lg bg-kick-hover border border-kick-border hover:border-kick-green/30">
                {copied ? <Check className="w-4 h-4 text-kick-green" /> : <Copy className="w-4 h-4 text-white/60" />}
              </button>
            </div>
          </div>
          <p className="text-[11px] text-white/40">{t("walletMinDeposit")}: {token.minDeposit}</p>
        </div>
      </div>

      <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-3">
        <p className="text-xs text-white/50 leading-relaxed">{t("walletDepositWarning")}</p>
      </div>

      <button type="button" onClick={demoCredit} className="w-full py-2.5 rounded-lg border border-dashed border-kick-green/30 text-kick-green text-xs font-medium hover:bg-kick-green/5 transition-colors">
        {t("walletDemoDeposit")}
      </button>
    </div>
  );
}

function WithdrawTab({ cryptoId }: { cryptoId: CryptoId }) {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { withdraw, balances } = useWallet();
  const [selected, setSelected] = useState(cryptoId);
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const token = getToken(selected);
  const bal = balances[selected];

  const setMax = () => setAmount(formatCrypto(bal, selected));

  const handleWithdraw = () => {
    const num = parseFloat(amount);
    const err = withdraw(selected, num, address);
    if (err) {
      showToast(t(err as TranslationKey));
      return;
    }
    showToast(t("walletWithdrawSuccess", { symbol: token.symbol }));
    setAmount("");
    setAddress("");
  };

  return (
    <div className="space-y-4">
      <CryptoSelect value={selected} onChange={setSelected} />

      <div className="rounded-lg bg-kick-bg border border-kick-border p-3 flex justify-between items-center">
        <span className="text-xs text-white/40">{t("walletAvailable")}</span>
        <span className="text-sm font-bold text-kick-green">{formatCrypto(bal, selected)} {token.symbol}</span>
      </div>

      <div>
        <label className="text-xs text-white/40 mb-1 block">{t("walletWithdrawAddress")}</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder={t("walletWithdrawAddressPlaceholder")}
          className="w-full px-3 py-2.5 rounded-lg bg-kick-bg border border-kick-border text-sm focus:outline-none focus:border-kick-green/40"
        />
      </div>

      <div>
        <label className="text-xs text-white/40 mb-1 block">{t("walletAmount")}</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="flex-1 px-3 py-2.5 rounded-lg bg-kick-bg border border-kick-border text-sm focus:outline-none focus:border-kick-green/40"
          />
          <button type="button" onClick={setMax} className="px-3 py-2 rounded-lg bg-kick-hover border border-kick-border text-xs font-bold text-kick-green hover:bg-kick-border transition-colors">
            MAX
          </button>
        </div>
        <p className="text-[11px] text-white/40 mt-1">{t("walletMinWithdraw")}: {token.minWithdraw}</p>
      </div>

      <button type="button" onClick={handleWithdraw} className="w-full btn-kick py-3">
        {t("walletWithdrawBtn")}
      </button>
    </div>
  );
}

function SwapTab({ cryptoId }: { cryptoId: CryptoId }) {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { balances, swap } = useWallet();
  const [from, setFrom] = useState(cryptoId);
  const [to, setTo] = useState<CryptoId>("btc");
  const [amount, setAmount] = useState("");

  const fromToken = getToken(from);
  const toToken = getToken(to);
  const num = parseFloat(amount) || 0;
  const receive = calcSwapReceive(num, fromToken, toToken);

  const flip = () => {
    setFrom(to);
    setTo(from);
    setAmount("");
  };

  const handleSwap = () => {
    const err = swap(from, to, num);
    if (err) {
      showToast(t(err as TranslationKey));
      return;
    }
    showToast(t("walletSwapSuccess"));
    setAmount("");
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-white/40 mb-1 block">{t("walletSwapFrom")}</label>
        <CryptoSelect value={from} onChange={setFrom} />
        <div className="mt-2 flex gap-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="flex-1 px-3 py-2.5 rounded-lg bg-kick-bg border border-kick-border text-sm focus:outline-none focus:border-kick-green/40"
          />
          <span className="px-3 py-2.5 text-xs text-white/40">{formatCrypto(balances[from], from)} {fromToken.symbol}</span>
        </div>
      </div>

      <div className="flex justify-center">
        <button type="button" onClick={flip} className="p-2 rounded-full bg-kick-hover border border-kick-border hover:border-kick-green/30 transition-colors">
          <ArrowDownUp className="w-4 h-4 text-kick-green" />
        </button>
      </div>

      <div>
        <label className="text-xs text-white/40 mb-1 block">{t("walletSwapTo")}</label>
        <CryptoSelect value={to} onChange={setTo} />
        <div className="mt-2 px-3 py-2.5 rounded-lg bg-kick-bg border border-kick-border">
          <span className="text-sm font-bold text-kick-green">{formatCrypto(receive, to)} {toToken.symbol}</span>
        </div>
      </div>

      <div className="rounded-lg bg-kick-bg border border-kick-border p-3 text-xs text-white/40 space-y-1">
        <div className="flex justify-between"><span>{t("walletSwapFee")}</span><span>{SWAP_FEE * 100}%</span></div>
        <div className="flex justify-between"><span>{t("walletSwapRate")}</span><span>1 {fromToken.symbol} ≈ {formatCrypto(calcSwapReceive(1, fromToken, toToken), to)} {toToken.symbol}</span></div>
      </div>

      <button type="button" onClick={handleSwap} className="w-full btn-kick py-3">
        {t("walletSwapBtn")}
      </button>
    </div>
  );
}

export function WalletModal() {
  const { t } = useLanguage();
  const { formatMoney } = useCurrency();
  const { walletOpen, closeWallet, walletTab, setWalletTab, settings, balances } = useWallet();
  const [activeCrypto, setActiveCrypto] = useState(settings.selectedCrypto);

  useEffect(() => {
    if (walletOpen) setActiveCrypto(settings.selectedCrypto);
  }, [walletOpen, settings.selectedCrypto]);

  const token = getToken(activeCrypto);
  const bal = balances[activeCrypto];
  const fiatVal = toFiatUsd(bal, token);

  const tabs: { id: WalletTab; label: string }[] = [
    { id: "deposit", label: t("walletTabDeposit") },
    { id: "withdraw", label: t("walletTabWithdraw") },
    { id: "swap", label: t("walletTabSwap") },
  ];

  if (!walletOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeWallet} />
      <div className="relative w-full max-w-lg rounded-2xl bg-[#1a2035] border border-kick-border shadow-2xl overflow-hidden">
        <div className="px-5 pt-5 pb-3 border-b border-kick-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold">{t("wallet")}</h2>
            <button type="button" onClick={closeWallet} className="text-white/40 hover:text-white text-xl leading-none">×</button>
          </div>

          <div className="flex gap-1 p-1 rounded-lg bg-kick-bg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setWalletTab(tab.id)}
                className={`flex-1 py-2 rounded-md text-xs font-bold transition-colors ${
                  walletTab === tab.id ? "bg-kick-green text-white shadow-sm" : "text-white/50 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 max-h-[70vh] overflow-y-auto">
          {walletTab === "deposit" && <DepositTab cryptoId={activeCrypto} />}
          {walletTab === "withdraw" && <WithdrawTab cryptoId={activeCrypto} />}
          {walletTab === "swap" && <SwapTab cryptoId={activeCrypto} />}
        </div>

        <div className="px-5 py-3 border-t border-kick-border bg-kick-bg flex items-center justify-between">
          <div>
            <p className="text-[10px] text-white/40 uppercase tracking-wider">{t("walletSelectedBalance")}</p>
            <p className="text-base font-bold text-kick-green tabular-nums">
              {settings.displayInFiat
                ? formatMoney(fiatVal)
                : `${formatCrypto(bal, activeCrypto)} ${token.symbol}`}
            </p>
            <p className="text-[10px] text-white/40 tabular-nums mt-0.5">
              {settings.displayInFiat
                ? `${formatCrypto(bal, activeCrypto)} ${token.symbol}`
                : formatMoney(fiatVal)}
            </p>
          </div>
          <CryptoIcon id={activeCrypto} size="md" />
        </div>
      </div>
    </div>
  );
}
