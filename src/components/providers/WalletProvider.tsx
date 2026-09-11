"use client";

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  DEFAULT_BALANCES,
  WALLET_SETTINGS_KEY,
  calcSwapReceive,
  getToken,
  toFiatUsd,
  walletStorageKey,
  type CryptoId,
  type FiatCurrency,
  type WalletBalances,
  type WalletTab,
} from "@/lib/wallet/types";
import { applyLibertyGrants } from "@/lib/wallet/grants";
import { XP_PER_LIBERTY_WAGER, xpStorageKey } from "@/lib/user/ranks";

interface WalletSettings {
  selectedCrypto: CryptoId;
  displayInFiat: boolean;
  hideZeroBalances: boolean;
  fiatCurrency: FiatCurrency;
}

interface WalletContextValue {
  balances: WalletBalances;
  settings: WalletSettings;
  walletOpen: boolean;
  walletTab: WalletTab;
  settingsOpen: boolean;
  setSelectedCrypto: (id: CryptoId) => void;
  setDisplayInFiat: (v: boolean) => void;
  setHideZeroBalances: (v: boolean) => void;
  setFiatCurrency: (c: FiatCurrency) => void;
  openWallet: (tab?: WalletTab) => void;
  closeWallet: () => void;
  setWalletTab: (tab: WalletTab) => void;
  openSettings: () => void;
  closeSettings: () => void;
  swap: (from: CryptoId, to: CryptoId, amount: number) => string | null;
  withdraw: (id: CryptoId, amount: number, address: string) => string | null;
  creditDemo: (id: CryptoId, amount: number) => void;
  spend: (amountUsd: number, cryptoId?: CryptoId) => string | null;
  creditUsd: (amountUsd: number, cryptoId?: CryptoId) => void;
  getAvailableUsd: (cryptoId?: CryptoId) => number;
  getLibertyBalance: () => number;
  spendLiberty: (amount: number) => string | null;
  creditLiberty: (amount: number) => void;
  xp: number;
  getXp: () => number;
}

const defaultSettings: WalletSettings = {
  selectedCrypto: "usdt",
  displayInFiat: true,
  hideZeroBalances: false,
  fiatCurrency: "USD",
};

const WalletContext = createContext<WalletContextValue | null>(null);

function loadSettings(): WalletSettings {
  if (typeof window === "undefined") return defaultSettings;
  try {
    const raw = localStorage.getItem(WALLET_SETTINGS_KEY);
    return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

function loadBalances(userId: string): WalletBalances {
  if (typeof window === "undefined") return DEFAULT_BALANCES;
  try {
    const raw = localStorage.getItem(walletStorageKey(userId));
    return raw ? { ...DEFAULT_BALANCES, ...JSON.parse(raw) } : DEFAULT_BALANCES;
  } catch {
    return DEFAULT_BALANCES;
  }
}

function loadXp(userId: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(xpStorageKey(userId));
    return raw ? Math.max(0, Number(JSON.parse(raw)) || 0) : 0;
  } catch {
    return 0;
  }
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const [settings, setSettings] = useState<WalletSettings>(defaultSettings);
  const [balances, setBalances] = useState<WalletBalances>(DEFAULT_BALANCES);
  const [xp, setXp] = useState(0);
  const [walletOpen, setWalletOpen] = useState(false);
  const [walletTab, setWalletTab] = useState<WalletTab>("deposit");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [walletReady, setWalletReady] = useState(false);

  const balancesRef = useRef(balances);
  const xpRef = useRef(xp);
  balancesRef.current = balances;
  xpRef.current = xp;

  useEffect(() => {
    setSettings(loadSettings());
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!mounted || authLoading) return;

    if (user) {
      const loaded = applyLibertyGrants(user.id, user.username, loadBalances(user.id));
      const loadedXp = loadXp(user.id);
      balancesRef.current = loaded;
      xpRef.current = loadedXp;
      setBalances(loaded);
      setXp(loadedXp);
      localStorage.setItem(walletStorageKey(user.id), JSON.stringify(loaded));
      localStorage.setItem(xpStorageKey(user.id), JSON.stringify(loadedXp));
      setWalletReady(true);
      return;
    }

    balancesRef.current = DEFAULT_BALANCES;
    xpRef.current = 0;
    setBalances(DEFAULT_BALANCES);
    setXp(0);
    setWalletReady(false);
  }, [user, mounted, authLoading]);

  useEffect(() => {
    if (user && walletReady) {
      localStorage.setItem(xpStorageKey(user.id), JSON.stringify(xp));
    }
  }, [xp, user, walletReady]);

  useEffect(() => {
    if (mounted) localStorage.setItem(WALLET_SETTINGS_KEY, JSON.stringify(settings));
  }, [settings, mounted]);

  useEffect(() => {
    if (user && walletReady) {
      localStorage.setItem(walletStorageKey(user.id), JSON.stringify(balances));
    }
  }, [balances, user, walletReady]);

  const persistBalances = useCallback((next: WalletBalances) => {
    balancesRef.current = next;
    setBalances(next);
  }, []);

  const setSelectedCrypto = useCallback((id: CryptoId) => {
    setSettings((s) => ({ ...s, selectedCrypto: id }));
  }, []);

  const setDisplayInFiat = useCallback((v: boolean) => {
    setSettings((s) => ({ ...s, displayInFiat: v }));
  }, []);

  const setHideZeroBalances = useCallback((v: boolean) => {
    setSettings((s) => ({ ...s, hideZeroBalances: v }));
  }, []);

  const setFiatCurrency = useCallback((c: FiatCurrency) => {
    setSettings((s) => ({ ...s, fiatCurrency: c }));
  }, []);

  const openWallet = useCallback((tab: WalletTab = "deposit") => {
    setWalletTab(tab);
    setWalletOpen(true);
    setSettingsOpen(false);
  }, []);

  const closeWallet = useCallback(() => setWalletOpen(false), []);

  const openSettings = useCallback(() => setSettingsOpen(true), []);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);

  const swap = useCallback(
    (from: CryptoId, to: CryptoId, amount: number): string | null => {
      if (from === to) return "walletSwapSame";
      if (amount <= 0) return "walletInvalidAmount";
      if (balances[from] < amount) return "walletInsufficient";

      const receive = calcSwapReceive(amount, getToken(from), getToken(to));
      persistBalances({
        ...balances,
        [from]: balances[from] - amount,
        [to]: balances[to] + receive,
      });
      return null;
    },
    [balances, persistBalances]
  );

  const withdraw = useCallback(
    (id: CryptoId, amount: number, address: string): string | null => {
      if (!address.trim()) return "walletAddressRequired";
      if (amount <= 0) return "walletInvalidAmount";
      if (balances[id] < amount) return "walletInsufficient";

      persistBalances({ ...balances, [id]: balances[id] - amount });
      return null;
    },
    [balances, persistBalances]
  );

  const creditDemo = useCallback(
    (id: CryptoId, amount: number) => {
      persistBalances({ ...balances, [id]: balances[id] + amount });
    },
    [balances, persistBalances]
  );

  const getAvailableUsd = useCallback(
    (cryptoId?: CryptoId): number => {
      const id = cryptoId ?? settings.selectedCrypto;
      return toFiatUsd(balances[id], getToken(id));
    },
    [balances, settings.selectedCrypto]
  );

  const spend = useCallback(
    (amountUsd: number, cryptoId?: CryptoId): string | null => {
      if (amountUsd <= 0) return "walletInvalidAmount";
      const id = cryptoId ?? settings.selectedCrypto;
      const token = getToken(id);
      const cryptoAmount = amountUsd / token.fiatRate;
      if (balances[id] < cryptoAmount) return "walletInsufficient";

      persistBalances({
        ...balances,
        [id]: balances[id] - cryptoAmount,
      });
      return null;
    },
    [balances, settings.selectedCrypto, persistBalances]
  );

  const creditUsd = useCallback(
    (amountUsd: number, cryptoId?: CryptoId) => {
      if (amountUsd <= 0) return;
      const id = cryptoId ?? settings.selectedCrypto;
      const token = getToken(id);
      const cryptoAmount = amountUsd / token.fiatRate;
      persistBalances({
        ...balances,
        [id]: balances[id] + cryptoAmount,
      });
    },
    [balances, settings.selectedCrypto, persistBalances]
  );

  const getLibertyBalance = useCallback((): number => balancesRef.current.liberty, []);

  const getXp = useCallback((): number => xpRef.current, []);

  const addXp = useCallback((amount: number) => {
    if (amount <= 0) return;
    setXp((prev) => {
      const next = prev + amount;
      xpRef.current = next;
      return next;
    });
  }, []);

  const spendLiberty = useCallback(
    (amount: number): string | null => {
      if (amount < 0) return "walletInvalidAmount";
      if (amount === 0) return null;

      let error: string | null = null;
      setBalances((prev) => {
        if (prev.liberty < amount) {
          error = "walletInsufficient";
          return prev;
        }
        const next = { ...prev, liberty: prev.liberty - amount };
        balancesRef.current = next;
        return next;
      });

      if (!error) {
        addXp(Math.floor(amount * XP_PER_LIBERTY_WAGER));
      }

      return error;
    },
    [addXp]
  );

  const creditLiberty = useCallback((amount: number) => {
    if (amount <= 0) return;
    setBalances((prev) => {
      const next = { ...prev, liberty: prev.liberty + amount };
      balancesRef.current = next;
      return next;
    });
  }, []);

  return (
    <WalletContext.Provider
      value={{
        balances: mounted && walletReady ? balances : DEFAULT_BALANCES,
        settings: mounted ? settings : defaultSettings,
        walletOpen,
        walletTab,
        settingsOpen,
        setSelectedCrypto,
        setDisplayInFiat,
        setHideZeroBalances,
        setFiatCurrency,
        openWallet,
        closeWallet,
        setWalletTab,
        openSettings,
        closeSettings,
        swap,
        withdraw,
        creditDemo,
        spend,
        creditUsd,
        getAvailableUsd,
        getLibertyBalance,
        spendLiberty,
        creditLiberty,
        xp: mounted && walletReady ? xp : 0,
        getXp,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}
