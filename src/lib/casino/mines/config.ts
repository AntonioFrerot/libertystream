export const MINES_GRID_SIZE = 25;
export const MINES_GRID_COLS = 5;
export const MINES_MIN_COUNT = 1;
export const MINES_MAX_COUNT = 24;
export const MINES_DEFAULT_COUNT = 3;
export const MINES_RTP = 0.99;
export const MINES_MAX_AUTO_BETS = 100;
export const MINES_AUTO_GAP_MS = 700;
export const MINES_DEFAULT_AUTO_GEMS = 1;

function comb(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  let kk = Math.min(k, n - k);
  let result = 1;
  for (let i = 0; i < kk; i++) {
    result = (result * (n - i)) / (i + 1);
  }
  return result;
}

/** Multiplicateur Stake/Gamba : 0.99 × C(25,k) / C(25−M,k) */
export function getMinesMultiplier(mineCount: number, gemsRevealed: number): number {
  if (gemsRevealed <= 0) return 1;
  const fair = comb(MINES_GRID_SIZE, gemsRevealed) / comb(MINES_GRID_SIZE - mineCount, gemsRevealed);
  return Math.floor(MINES_RTP * fair * 100) / 100;
}

export function formatMinesMultiplier(value: number): string {
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    return `${m >= 100 ? Math.round(m) : m.toFixed(2)}M×`;
  }
  if (value >= 1000) {
    if (value % 1000 === 0) return `${value / 1000}k×`;
    return `${(value / 1000).toFixed(2)}k×`;
  }
  if (value >= 100) {
    return Number.isInteger(value) ? `${value}×` : `${value.toFixed(2)}×`;
  }
  if (value >= 10) {
    return Number.isInteger(value) ? `${value}×` : `${value.toFixed(2)}×`;
  }
  return `${value.toFixed(2)}×`;
}

/** Multiplicateur affiché pour la prochaine case sûre. */
export function getNextMinesMultiplier(mineCount: number, gemsRevealed: number): number {
  return getMinesMultiplier(mineCount, gemsRevealed + 1);
}
