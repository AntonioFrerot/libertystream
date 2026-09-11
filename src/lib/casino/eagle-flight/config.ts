export const EAGLE_FLIGHT_RTP = 0.98;
export const EAGLE_FLIGHT_MAX_CRASH = 10_000;
export const EAGLE_FLIGHT_MIN_AUTO_CASHOUT = 1.01;
export const EAGLE_FLIGHT_DEFAULT_TARGET_MULTIPLIER = 2;
export const EAGLE_FLIGHT_MAX_AUTO_BETS = 100;
export const EAGLE_FLIGHT_AUTO_GAP_MS = 700;
export const EAGLE_FLIGHT_GROWTH = 0.35;
export const EAGLE_FLIGHT_TICK_MS = 50;

/** TEMPORAIRE — true = crash forcé au max (tests). */
export const EAGLE_FLIGHT_DEV_ALWAYS_MAX_CRASH = false;
export const EAGLE_FLIGHT_DEV_MAX_CRASH = EAGLE_FLIGHT_MAX_CRASH;

/** Plafond de victoire / auto cash-out. */
export const EAGLE_FLIGHT_MAX_WIN = EAGLE_FLIGHT_MAX_CRASH;

export function eagleFlightMaxWin(): number {
  return EAGLE_FLIGHT_MAX_WIN;
}

export function clampEagleFlightMultiplier(value: number): number {
  return Math.min(value, eagleFlightMaxWin());
}

export function multiplierAtElapsed(elapsedMs: number): number {
  const seconds = elapsedMs / 1000;
  const mult = Math.exp(EAGLE_FLIGHT_GROWTH * seconds);
  return clampEagleFlightMultiplier(Math.floor(mult * 100) / 100);
}

export function rollCrashPoint(): number {
  if (EAGLE_FLIGHT_DEV_ALWAYS_MAX_CRASH) {
    return EAGLE_FLIGHT_DEV_MAX_CRASH;
  }
  const random = Math.random();
  const raw = EAGLE_FLIGHT_RTP / (1 - random);
  const point = Math.floor(raw * 100) / 100;
  return Math.min(Math.max(1, point), EAGLE_FLIGHT_MAX_CRASH);
}

export function formatEagleFlightMultiplier(value: number): string {
  if (value >= 10_000) return `${Math.round(value).toLocaleString("fr-FR").replace(/[\u202f\u00a0]/g, ",")}×`;
  if (value >= 100) return `${Math.round(value)}×`;
  if (value >= 10) return `${value.toFixed(2)}×`;
  return `${value.toFixed(2)}×`;
}

/** Vitesse du décor (nuages, vent) — liée au multiplicateur, jamais au crash point. */
export function eagleFlightDecorSpeed(multiplier: number): number {
  const m = Math.max(1, multiplier);
  return 0.26 + Math.log(m) * 0.58;
}

/** Progression du défilement (0 → 1) de 1× jusqu'au multiplicateur cible. */
export function eagleFlightScrollProgress(multiplier: number, targetMultiplier: number): number {
  const m = Math.max(1, multiplier);
  const target = Math.max(1.01, targetMultiplier);
  if (m <= 1) return 0;
  return Math.min(1, Math.log(m) / Math.log(target));
}

/** Nombre de « étages » verticaux dans la bande de décor (sans boucle). */
export const EAGLE_FLIGHT_STRIP_UNITS = 72;

/** Fin zone basse altitude (nuages denses). */
export const EAGLE_FLIGHT_LOW_ALTITUDE_MULTIPLIER = 10;

/** Fin zone haute altitude (nuages rares, montgolfières). */
export const EAGLE_FLIGHT_HIGH_ALTITUDE_MULTIPLIER = 30;

/** Fondu basse → haute altitude, linéaire et court (9×–11×). */
export const EAGLE_FLIGHT_ZONE_BLEND_START = 9;
export const EAGLE_FLIGHT_ZONE_BLEND_END = 11;

/** Fondu de sortie haute altitude (28×–30×). */
export const EAGLE_FLIGHT_HIGH_ZONE_FADE_START = 28;

export function eagleFlightZoneBlend(multiplier: number): number {
  const m = Math.max(1, multiplier);
  if (m <= EAGLE_FLIGHT_ZONE_BLEND_START) return 0;
  if (m >= EAGLE_FLIGHT_ZONE_BLEND_END) return 1;
  return (m - EAGLE_FLIGHT_ZONE_BLEND_START) / (EAGLE_FLIGHT_ZONE_BLEND_END - EAGLE_FLIGHT_ZONE_BLEND_START);
}

export function eagleFlightHighZoneFade(multiplier: number): number {
  const m = Math.max(1, multiplier);
  if (m <= EAGLE_FLIGHT_HIGH_ZONE_FADE_START) return 1;
  if (m >= EAGLE_FLIGHT_HIGH_ALTITUDE_MULTIPLIER) return 0;
  return (
    1 -
    (m - EAGLE_FLIGHT_HIGH_ZONE_FADE_START) /
      (EAGLE_FLIGHT_HIGH_ALTITUDE_MULTIPLIER - EAGLE_FLIGHT_HIGH_ZONE_FADE_START)
  );
}

/** Cible de défilement pour la répartition du décor sur la bande. */
export function eagleFlightStripScrollTarget(): number {
  return EAGLE_FLIGHT_DEV_ALWAYS_MAX_CRASH ? EAGLE_FLIGHT_DEV_MAX_CRASH : EAGLE_FLIGHT_MAX_CRASH;
}

/** Part de la bande (0 → 1) parcourue de 1× à {@link EAGLE_FLIGHT_LOW_ALTITUDE_MULTIPLIER}. */
export function eagleFlightLowAltitudeZoneFraction(): number {
  return eagleFlightScrollProgress(
    EAGLE_FLIGHT_LOW_ALTITUDE_MULTIPLIER,
    eagleFlightStripScrollTarget(),
  );
}

/** Hauteur de la couche nuageuse = exactement le parcours 1× → 10× (coupure nette à 10×). */
export function eagleFlightCloudZoneFraction(): number {
  return eagleFlightLowAltitudeZoneFraction();
}

/** Rattrapage du défilement (0–1) — fluide mais réactif. */
export function eagleFlightScrollLerp(multiplier: number): number {
  const speed = eagleFlightDecorSpeed(multiplier);
  return Math.min(0.48, 0.16 + speed * 0.1);
}
