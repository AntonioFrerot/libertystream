export type CryptoId = "eth" | "btc" | "ltc" | "sol" | "usdt" | "usdc";

export type FiatCurrency = "USD" | "EUR" | "CAD" | "GBP";

export type WalletTab = "deposit" | "withdraw" | "swap";

export interface CryptoToken {
  id: CryptoId;
  symbol: string;
  name: string;
  color: string;
  fiatRate: number;
  network: string;
  minDeposit: string;
  minWithdraw: string;
}

export const CRYPTO_TOKENS: CryptoToken[] = [
  { id: "eth", symbol: "ETH", name: "Ethereum", color: "#627EEA", fiatRate: 3200, network: "ERC-20", minDeposit: "0.001 ETH", minWithdraw: "0.002 ETH" },
  { id: "btc", symbol: "BTC", name: "Bitcoin", color: "#F7931A", fiatRate: 95000, network: "Bitcoin", minDeposit: "0.0001 BTC", minWithdraw: "0.0002 BTC" },
  { id: "ltc", symbol: "LTC", name: "Litecoin", color: "#345D9D", fiatRate: 85, network: "Litecoin", minDeposit: "0.01 LTC", minWithdraw: "0.02 LTC" },
  { id: "sol", symbol: "SOL", name: "Solana", color: "#9945FF", fiatRate: 180, network: "Solana", minDeposit: "0.05 SOL", minWithdraw: "0.1 SOL" },
  { id: "usdt", symbol: "USDT", name: "Tether", color: "#26A17B", fiatRate: 1, network: "TRC-20", minDeposit: "5 USDT", minWithdraw: "10 USDT" },
  { id: "usdc", symbol: "USDC", name: "USD Coin", color: "#2775CA", fiatRate: 1, network: "ERC-20", minDeposit: "5 USDC", minWithdraw: "10 USDC" },
];

export const FIAT_CURRENCIES: { code: FiatCurrency; label: string; symbol: string; rate: number }[] = [
  { code: "USD", label: "USD", symbol: "$", rate: 1 },
  { code: "EUR", label: "EUR", symbol: "€", rate: 0.92 },
  { code: "GBP", label: "GBP", symbol: "£", rate: 0.79 },
  { code: "CAD", label: "CAD", symbol: "C$", rate: 1.36 },
];

export const SWAP_FEE = 0.03;

export interface WalletBalances {
  liberty: number;
  eth: number;
  btc: number;
  ltc: number;
  sol: number;
  usdt: number;
  usdc: number;
}

export const DEFAULT_BALANCES: WalletBalances = {
  liberty: 0,
  eth: 0,
  btc: 0,
  ltc: 0,
  sol: 0,
  usdt: 0,
  usdc: 0,
};

export const LIBERTY_MIN_BET = 0;

/** L'espace insécable du format fr-FR s'affiche souvent comme un tiret. */
function withCommaThousands(formatted: string): string {
  return formatted.replace(/[\u202f\u00a0]/g, ",");
}

export function formatLiberty(amount: number, locale = "fr"): string {
  return withCommaThousands(
    new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount),
  );
}

export function roundLiberty(amount: number): number {
  return Math.round(amount * 100) / 100;
}

export const WALLET_SETTINGS_KEY = "libertystream-wallet-settings";

export function walletStorageKey(userId: string) {
  return `libertystream-wallet-${userId}`;
}

export function getToken(id: CryptoId): CryptoToken {
  return CRYPTO_TOKENS.find((t) => t.id === id)!;
}

export function getFiat(code: FiatCurrency) {
  return FIAT_CURRENCIES.find((f) => f.code === code)!;
}

export function formatFiat(amountUsd: number, locale: string, fiat: FiatCurrency): string {
  const { symbol, rate } = getFiat(fiat);
  const converted = amountUsd * rate;
  const formatted = new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(converted);
  return `${symbol}${formatted.replace(/[\u202f\u00a0]/g, ",")}`;
}

export function fiatToUsd(amount: number, fiat: FiatCurrency): number {
  return amount / getFiat(fiat).rate;
}

export const SUB_PRICE_USD = 4.99;

export const TIP_AMOUNTS_USD = [5, 10, 25, 50, 100] as const;

export const TIP_MIN_USD = 1;

export function toFiatUsd(balance: number, token: CryptoToken): number {
  return balance * token.fiatRate;
}

export function formatCrypto(balance: number, id: CryptoId): string {
  const decimals = id === "btc" ? 8 : id === "usdt" || id === "usdc" ? 2 : 6;
  return balance.toFixed(decimals).replace(".", ",");
}

export function mockDepositAddress(id: CryptoId): string {
  const prefixes: Record<CryptoId, string> = {
    eth: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    btc: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    ltc: "ltc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfj",
    sol: "So11111111111111111111111111111111111111112",
    usdt: "TXYZopYRdj2D9XRtbG411XZZ3kZ5tAoR4",
    usdc: "0x742d35Cc6634C0532925a3b844Bc454e4438f44f",
  };
  return prefixes[id];
}

export function calcSwapReceive(fromAmount: number, from: CryptoToken, to: CryptoToken): number {
  if (fromAmount <= 0) return 0;
  const usd = fromAmount * from.fiatRate;
  const afterFee = usd * (1 - SWAP_FEE);
  return afterFee / to.fiatRate;
}
