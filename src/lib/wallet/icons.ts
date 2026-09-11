import type { CryptoId } from "./types";

/** Icônes Gamba.com — mêmes assets que currencyicon/{slug}.svg */
const GAMBA_CDN =
  "https://imagedelivery.net/ud0nKgC6_aGi3aA3QSI9OA/currencyicon";

const ICON_SLUG: Record<CryptoId, string> = {
  eth: "eth",
  btc: "btc",
  ltc: "ltc",
  sol: "sol",
  usdt: "usdt",
  usdc: "usdc",
};

/** LTC absent du CDN Gamba — même source que leur API (CoinMarketCap) */
const ICON_FILE: Record<CryptoId, string> = {
  eth: "eth.svg",
  btc: "btc.svg",
  ltc: "ltc.png",
  sol: "sol.svg",
  usdt: "usdt.svg",
  usdc: "usdc.svg",
};

/** Fichiers locaux (copie des assets Gamba) — fallback CDN */
export function getCryptoIconUrl(id: CryptoId): string {
  return `/crypto/${ICON_FILE[id]}`;
}

export function getCryptoIconCdnUrl(id: CryptoId): string {
  return `${GAMBA_CDN}/${ICON_SLUG[id]}.svg/currencyicon`;
}
