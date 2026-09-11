/** Durée totale de la voiture de crash (doit correspondre au CSS). */
export const CRASH_CAR_DURATION_MS = 900;

/** Délai total avant de débloquer l'UI après un crash. */
export const CRASH_TOTAL_MS = CRASH_CAR_DURATION_MS + 160;

/** Position Y du haut de la voiture au moment de l'impact (px dans la voie). */
export function crashCarHitTop(layout: {
  trackHeight: number;
  manholeSize: number;
  scale: number;
  chickenWidth: number;
}): number {
  const chickenFeetY = layout.trackHeight / 2 + layout.manholeSize * 0.36;
  const carHeight = Math.round(30 * layout.scale * (80 / 48));
  const chickenHeight = Math.round(layout.chickenWidth * (96 / 88));
  const chickenTop = chickenFeetY - chickenHeight;
  // Le poulet s'écrase quand le bas de la voiture atteint le haut du corps.
  return Math.round(chickenTop - carHeight);
}

/** Progression (0–1) de l'animation au moment du contact voiture/poulet. */
export function crashCarHitProgress(layout: {
  trackHeight: number;
  manholeSize: number;
  scale: number;
  chickenWidth: number;
}): number {
  const scale = layout.scale;
  const startTop = -54 * scale;
  const endTop = layout.trackHeight + 8 * scale;
  const hitTop = crashCarHitTop(layout);
  const progress = (hitTop - startTop) / (endTop - startTop);
  return Math.min(0.88, Math.max(0.4, progress));
}

export function getCrashHitDelayMs(layout: {
  trackHeight: number;
  manholeSize: number;
  scale: number;
  chickenWidth: number;
}): number {
  return Math.round(CRASH_CAR_DURATION_MS * crashCarHitProgress(layout));
}
