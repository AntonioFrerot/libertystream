/** RTP cible ~98 % (marge maison 2 %), comme Stake / Gamba progressive flip. */
export const FLIP_RTP = 0.98;

export const FLIP_MAX_STREAK = 20;

/** Nombre max de flips en mode auto (par manche). */
export const FLIP_MAX_AUTO_FLIPS = 100;

export const FLIP_ANIM_MS = 800;

/** Rotation Y cumulative pour atterrir sur la face demandée après plusieurs tours. */
export function computeFlipTargetRotation(currentDeg: number, targetSide: "eagle" | "snake"): number {
  const normalized = normalizeCoinRotation(currentDeg);
  const targetNorm = targetSide === "snake" ? 180 : 0;
  let delta = (targetNorm - normalized + 360) % 360;
  if (delta === 0) delta = 360;
  const fullSpins = (4 + Math.floor(Math.random() * 2)) * 360;
  return currentDeg + delta + fullSpins;
}

/** Rotation de repos stable (0 = eagle, 180 = snake) pour éviter les bugs 3D. */
export function getCoinRestRotation(side: "eagle" | "snake"): number {
  return side === "snake" ? 180 : 0;
}

export function normalizeCoinRotation(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

export function getFlipMultiplier(streak: number): number {
  if (streak <= 0) return 1;
  return FLIP_RTP * 2 ** streak;
}

export function formatFlipMultiplier(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M×`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(2)}k×`;
  if (value >= 100) return `${value.toFixed(2)}×`;
  if (value >= 10) return `${value.toFixed(2)}×`;
  return `${value.toFixed(2)}×`;
}

export function getNextFlipMultiplier(streak: number): number {
  return getFlipMultiplier(Math.min(streak + 1, FLIP_MAX_STREAK));
}
