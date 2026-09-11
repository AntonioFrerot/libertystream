import {
  ALTITUDE_THRESHOLDS,
  band,
  clamp01,
  fadeOut,
  getDominantAltitudeZone,
  lerp,
  rise,
  type AltitudeZoneId,
} from "./altitudeZones";

/** Paramètres visuels dérivés du multiplicateur actuel. */
export type AtmosphereState = {
  zone: AltitudeZoneId;
  /** Couleur ciel (haut). */
  skyTop: string;
  skyMid: string;
  skyBottom: string;
  /** Opacités / intensités 0–1 */
  ground: number;
  buildings: number;
  trees: number;
  clouds: number;
  birds: number;
  balloons: number;
  helicopterChance: number;
  stars: number;
  atmosphereVeil: number;
  fog: number;
  sun: number;
  earth: number;
  earthScale: number;
  particles: number;
  wind: number;
  spaceDepth: number;
};

function lerpColor(from: string, to: string, t: number): string {
  const parse = (hex: string) => {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const;
  };
  const [r1, g1, b1] = parse(from);
  const [r2, g2, b2] = parse(to);
  const r = Math.round(lerp(r1, r2, t));
  const g = Math.round(lerp(g1, g2, t));
  const b = Math.round(lerp(b1, b2, t));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function skyColor(
  multiplier: number,
): Pick<AtmosphereState, "skyTop" | "skyMid" | "skyBottom"> {
  const m = Math.max(1, multiplier);

  const brightTop = "#0c4a6e";
  const brightMid = "#0369a1";
  const brightBottom = "#7dd3fc";

  const atmoTop = "#0a1628";
  const atmoMid = "#152238";
  const atmoBottom = "#2a4a6e";

  const spaceTop = "#020617";
  const spaceMid = "#0f172a";
  const spaceBottom = "#1e293b";

  const cosmosTop = "#000008";
  const cosmosMid = "#030712";
  const cosmosBottom = "#0a0f1a";

  const voidTop = "#000004";
  const voidMid = "#010208";
  const voidBottom = "#050810";

  /** Ciel lumineux jusqu'à ~30×, puis assombrissement. */
  const tAtmo = rise(m, 30, ALTITUDE_THRESHOLDS.atmosphere);
  const tSpace = rise(m, 95, ALTITUDE_THRESHOLDS.space);
  const tDeep = rise(m, ALTITUDE_THRESHOLDS.space, ALTITUDE_THRESHOLDS.deepSpace);
  const tCosmos = rise(m, ALTITUDE_THRESHOLDS.deepSpace, ALTITUDE_THRESHOLDS.cosmos);
  const tVoid = rise(m, ALTITUDE_THRESHOLDS.cosmos, 8_000);

  let top = brightTop;
  let mid = brightMid;
  let bottom = brightBottom;

  if (tAtmo > 0) {
    top = lerpColor(top, atmoTop, tAtmo);
    mid = lerpColor(mid, atmoMid, tAtmo);
    bottom = lerpColor(bottom, atmoBottom, tAtmo);
  }
  if (tSpace > 0) {
    top = lerpColor(top, spaceTop, tSpace);
    mid = lerpColor(mid, spaceMid, tSpace);
    bottom = lerpColor(bottom, spaceBottom, tSpace);
  }
  if (tDeep > 0) {
    top = lerpColor(top, cosmosTop, tDeep);
    mid = lerpColor(mid, cosmosMid, tDeep);
    bottom = lerpColor(bottom, cosmosBottom, tDeep);
  }
  if (tCosmos > 0) {
    top = lerpColor(top, voidTop, tCosmos);
    mid = lerpColor(mid, voidMid, tCosmos);
    bottom = lerpColor(bottom, voidBottom, tCosmos);
  }
  if (tVoid > 0) {
    top = lerpColor(top, "#000000", tVoid * 0.6);
    mid = lerpColor(mid, "#000002", tVoid * 0.6);
    bottom = lerpColor(bottom, "#000006", tVoid * 0.6);
  }

  return { skyTop: top, skyMid: mid, skyBottom: bottom };
}

/** Calcule l'état atmosphérique complet à partir du multiplicateur (seul input gameplay). */
export function getAtmosphereState(multiplier: number): AtmosphereState {
  const m = Math.max(1, multiplier);
  const colors = skyColor(m);

  const ground = fadeOut(m, 4, 15);
  const buildings = fadeOut(m, 3, 13);
  const trees = fadeOut(m, 5, 14);

  const birds = clamp01(fadeOut(m, 6, 24) * 0.9);
  const balloons = clamp01(band(m, 9, 28, 0.14) * 0.95);
  const helicopterChance = clamp01(band(m, 11, 28, 0.14) * 0.8);

  const stars = clamp01(
    rise(m, 32, ALTITUDE_THRESHOLDS.atmosphere) * 0.5 +
      rise(m, ALTITUDE_THRESHOLDS.atmosphere, ALTITUDE_THRESHOLDS.space) * 0.4 +
      rise(m, ALTITUDE_THRESHOLDS.space, ALTITUDE_THRESHOLDS.deepSpace) * 0.1,
  );

  const atmosphereVeil = clamp01(rise(m, 30, 90) * (1 - rise(m, 110, 260)));

  const fog = clamp01(rise(m, 28, 75) * 0.3 * (1 - rise(m, 85, 170)));

  const sun = clamp01(1 - rise(m, 20, 34));

  const earth = clamp01(rise(m, 92, 145) * (1 - rise(m, 900, 5_000) * 0.3));
  const earthScale = lerp(1.5, 0.1, rise(m, 100, ALTITUDE_THRESHOLDS.cosmos));

  const particles = clamp01(
    rise(m, ALTITUDE_THRESHOLDS.space, 600) * 0.35 +
      rise(m, ALTITUDE_THRESHOLDS.deepSpace, 3_000) * 0.2,
  );

  const wind = clamp01(0.35 + rise(m, 1, 25) * 0.45 + rise(m, 25, 80) * 0.2);

  const spaceDepth = clamp01(
    rise(m, ALTITUDE_THRESHOLDS.atmosphere, ALTITUDE_THRESHOLDS.deepSpace) * 0.85 +
      rise(m, ALTITUDE_THRESHOLDS.deepSpace, 6_000) * 0.15,
  );

  return {
    zone: getDominantAltitudeZone(m),
    ...colors,
    ground,
    buildings,
    trees,
    clouds: 0,
    birds,
    balloons,
    helicopterChance,
    stars,
    atmosphereVeil,
    fog,
    sun,
    earth,
    earthScale,
    particles,
    wind,
    spaceDepth,
  };
}

/** Convertit l'état en variables CSS pour l'arène. */
export function atmosphereToCssVars(state: AtmosphereState): Record<string, string> {
  return {
    "--ef-sky-top": state.skyTop,
    "--ef-sky-mid": state.skyMid,
    "--ef-sky-bottom": state.skyBottom,
    "--ef-ground-opacity": String(state.ground),
    "--ef-buildings-opacity": String(state.buildings),
    "--ef-trees-opacity": String(state.trees),
    "--ef-cloud-opacity": String(state.clouds),
    "--ef-bird-opacity": String(state.birds),
    "--ef-balloon-opacity": String(state.balloons),
    "--ef-star-opacity": String(state.stars),
    "--ef-atmo-veil": String(state.atmosphereVeil),
    "--ef-fog-opacity": String(state.fog),
    "--ef-sun-opacity": String(state.sun),
    "--ef-earth-opacity": String(state.earth),
    "--ef-earth-scale": String(state.earthScale),
    "--ef-particle-opacity": String(state.particles),
    "--ef-wind-intensity": String(state.wind),
    "--ef-space-depth": String(state.spaceDepth),
    "--ef-heli-chance": String(state.helicopterChance),
  };
}
