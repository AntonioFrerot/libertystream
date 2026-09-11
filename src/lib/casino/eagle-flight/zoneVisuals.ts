import { band, fadeOut } from "./altitudeZones";
import { eagleFlightZoneBlend } from "./config";

/** Fin de la boucle défilante (troposphère uniquement). */
export const EAGLE_FLIGHT_LOOP_END = 30;

export type TroposphereScenery = {
  lowOpacity: number;
  highOpacity: number;
  showLoop: boolean;
};

/** Décor défilant : 1×→30× seulement, fondu de sortie 26×→32×. */
export function getTroposphereScenery(multiplier: number): TroposphereScenery {
  const m = Math.max(1, multiplier);
  const loopFade = fadeOut(m, 26, 32);
  const zoneBlend = eagleFlightZoneBlend(m);

  return {
    lowOpacity: (1 - zoneBlend) * loopFade,
    highOpacity: zoneBlend * loopFade,
    showLoop: m < EAGLE_FLIGHT_LOOP_END + 3 && loopFade > 0.02,
  };
}

/** Météorites rares (200×–500×). */
export function getMeteorOpacity(multiplier: number): number {
  return band(Math.max(1, multiplier), 180, 480, 0.18) * 0.65;
}

/** Vent visible surtout en troposphère. */
export function getWindOpacity(multiplier: number): number {
  return fadeOut(Math.max(1, multiplier), 22, 38);
}
