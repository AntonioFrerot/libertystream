/** Seuils de multiplicateur pour les zones d'altitude (transitions progressives entre eux). */
export const ALTITUDE_THRESHOLDS = {
  /** Basse altitude : sol, nuages denses, oiseaux. */
  low: 10,
  /** Haute altitude : montgolfières, hélicoptère, moins de nuages. */
  high: 30,
  /** Entrée atmosphère : ciel sombre, étoiles. */
  atmosphere: 100,
  /** Espace : Terre visible, étoiles nombreuses. */
  space: 200,
  /** Espace profond. */
  deepSpace: 500,
  /** Cosmos lointain (1000×+). */
  cosmos: 1000,
} as const;

export type AltitudeZoneId =
  | "ground"
  | "high"
  | "atmosphere"
  | "space"
  | "deepSpace"
  | "cosmos";

/** Interpolation douce (Hermite). */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  if (edge0 === edge1) return x >= edge1 ? 1 : 0;
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Progression 0→1 entre deux seuils avec lissage aux bords (0 en dehors). */
export function ramp(multiplier: number, start: number, end: number, fade = 0.15): number {
  const span = Math.max(end - start, 0.001);
  const fadeSpan = span * fade;
  const rise = smoothstep(start, start + fadeSpan, multiplier);
  const fall = 1 - smoothstep(end - fadeSpan, end, multiplier);
  return clamp01(rise * fall);
}

/** 1 en dessous de fadeStart, 0 après fadeEnd (visible dès le début). */
export function fadeOut(multiplier: number, fadeStart: number, fadeEnd: number): number {
  return clamp01(1 - smoothstep(fadeStart, fadeEnd, multiplier));
}

/** 0 hors plage ; montée au début, plateau, descente à la fin. */
export function band(multiplier: number, start: number, end: number, edge = 0.12): number {
  if (multiplier < start || multiplier > end) return 0;
  const span = Math.max(end - start, 0.001);
  const e = span * edge;
  if (multiplier <= start + e) return smoothstep(start, start + e, multiplier);
  if (multiplier >= end - e) return clamp01(1 - smoothstep(end - e, end, multiplier));
  return 1;
}

/** Progression monotone 0→1 à partir d'un seuil. */
export function rise(multiplier: number, start: number, end: number): number {
  return smoothstep(start, end, multiplier);
}

/** Zone dominante (informationnelle — les visuels utilisent des ramps, pas des seuils durs). */
export function getDominantAltitudeZone(multiplier: number): AltitudeZoneId {
  const m = Math.max(1, multiplier);
  if (m < ALTITUDE_THRESHOLDS.low) return "ground";
  if (m < ALTITUDE_THRESHOLDS.high) return "high";
  if (m < ALTITUDE_THRESHOLDS.atmosphere) return "atmosphere";
  if (m < ALTITUDE_THRESHOLDS.space) return "space";
  if (m < ALTITUDE_THRESHOLDS.deepSpace) return "deepSpace";
  return "cosmos";
}
