import { CRASH_CAR_DURATION_MS } from "./crash";

export interface ChickenRoadLayout {
  laneWidth: number;
  sidewalkWidth: number;
  trackHeight: number;
  manholeSize: number;
  chickenWidth: number;
  trackEndPad: number;
  finishZoneWidth: number;
  manholeLabelSize: number;
  manholeLabelCurrentSize: number;
  scale: number;
}

/** Largeur fixe de la zone dorée d'arrivée (hors damier). */
export const FINISH_GOLD_WIDTH_MOBILE = 168;
export const FINISH_GOLD_WIDTH_DESKTOP = 300;

/** Décalage horizontal danse / WIN — desktop (mobile via fonction). */
export const ARRIVAL_DANCE_OFFSET_X_DESKTOP = 30;

/** Décalage multiplicateur depuis le bord droit — desktop (mobile via fonction). */
export const ARRIVAL_MULT_OFFSET_X_DESKTOP = 300;

export function isMobileChickenRoadLayout(layout: ChickenRoadLayout): boolean {
  return layout.scale <= 1;
}

/** Décalage horizontal de la zone danse / poulet / WIN sur la grille dorée. */
export function arrivalDanceOffsetX(layout: ChickenRoadLayout): number {
  return isMobileChickenRoadLayout(layout) ? 12 : ARRIVAL_DANCE_OFFSET_X_DESKTOP;
}

/** Décalage du multiplicateur depuis le bord droit (vers la gauche). */
export function arrivalMultOffsetX(
  layout: ChickenRoadLayout,
  scrollPadWidth: number,
): number {
  const goldW = finishArrivalGoldWidth(layout, scrollPadWidth);
  if (isMobileChickenRoadLayout(layout)) {
    return Math.round(Math.max(56, goldW * 0.34)) + 20;
  }
  return ARRIVAL_MULT_OFFSET_X_DESKTOP;
}

/** Taille du gros multiplicateur d'arrivée. */
export function arrivalMultFontSize(layout: ChickenRoadLayout): number {
  return isMobileChickenRoadLayout(layout) ? 30 : Math.round(44 * layout.scale);
}

/** Rythme de la musique victoire (~98 BPM). */
export const VICTORY_BEAT_MS = 612;

/** Cycle de pulsation du multiplicateur (plus lent et fluide que le beat). */
export const VICTORY_MULT_BEAT_MS = 1224;

export const MOBILE_CHICKEN_ROAD_LAYOUT: ChickenRoadLayout = {
  laneWidth: 84,
  sidewalkWidth: 82,
  trackHeight: 125,
  manholeSize: 46,
  chickenWidth: 50,
  trackEndPad: 40,
  finishZoneWidth: FINISH_GOLD_WIDTH_MOBILE,
  manholeLabelSize: 9,
  manholeLabelCurrentSize: 10,
  scale: 1,
};

/** Voies plus larges sur PC — piste plus haute, éléments agrandis proportionnellement */
export const DESKTOP_CHICKEN_ROAD_LAYOUT: ChickenRoadLayout = {
  laneWidth: 122,
  sidewalkWidth: 120,
  trackHeight: 325,
  manholeSize: 96,
  chickenWidth: 82,
  trackEndPad: 48,
  finishZoneWidth: FINISH_GOLD_WIDTH_DESKTOP,
  manholeLabelSize: 12,
  manholeLabelCurrentSize: 14,
  scale: 1.6,
};

export function laneCenterX(lane: number, layout: ChickenRoadLayout): number {
  return layout.sidewalkWidth + (lane - 1) * layout.laneWidth + layout.laneWidth / 2;
}

/** Centre vertical des bouches d'égout (= milieu de la piste) */
function manholeCenterY(layout: ChickenRoadLayout): number {
  return layout.trackHeight / 2;
}

/** step 0 : centre du trottoir ; step ≥ 1 : centré sur la voie — pieds au centre de la bouche */
export function chickenAnchor(
  step: number,
  layout: ChickenRoadLayout,
): { x: number; centerY: number } {
  const centerY = manholeCenterY(layout) + layout.manholeSize * 0.36;

  if (step <= 0) {
    return {
      x: layout.sidewalkWidth / 2 + Math.round(10 * layout.scale),
      centerY,
    };
  }

  return {
    x: laneCenterX(step, layout),
    centerY,
  };
}

export function trackWidth(maxSteps: number, layout: ChickenRoadLayout): number {
  return layout.sidewalkWidth + maxSteps * layout.laneWidth + layout.finishZoneWidth;
}

export function finishCheckerWidth(layout: ChickenRoadLayout): number {
  return Math.round(18 * layout.scale);
}

/** Zone de danse du poulet (partie gauche de l'arrivée). */
export function finishDanceAreaWidth(layout: ChickenRoadLayout): number {
  const ratio = isMobileChickenRoadLayout(layout) ? 0.44 : 0.38;
  return Math.round(layout.finishZoneWidth * ratio);
}

/** Espace doré réservé au multiplicateur (à droite du cadrillage principal). */
export function finishMultPadWidth(layout: ChickenRoadLayout, scrollPadWidth: number): number {
  const minPadRatio = isMobileChickenRoadLayout(layout) ? 0.56 : 0.72;
  const minPad = Math.round(layout.finishZoneWidth * minPadRatio);
  return Math.max(scrollPadWidth, minPad);
}

/** Largeur totale de la zone dorée (contenu + pad multiplicateur). */
export function finishArrivalGoldWidth(
  layout: ChickenRoadLayout,
  scrollPadWidth: number,
): number {
  return layout.finishZoneWidth + finishMultPadWidth(layout, scrollPadWidth);
}

/** Position du trophée en avant-première (zone dorée, aligné sur les bouches d'égout). */
export function previewTrophyAnchor(
  maxSteps: number,
  layout: ChickenRoadLayout,
): { x: number; centerY: number } {
  const finishStart =
    layout.sidewalkWidth + maxSteps * layout.laneWidth + finishCheckerWidth(layout);

  return {
    x: finishStart + Math.round(finishDanceAreaWidth(layout) * 0.42) + arrivalDanceOffsetX(layout),
    centerY: manholeCenterY(layout),
  };
}

/** Position cible du poulet — centre de la zone de danse. */
export function victoryCelebrationAnchor(
  maxSteps: number,
  layout: ChickenRoadLayout,
): { x: number; centerY: number } {
  const finishStart =
    layout.sidewalkWidth + maxSteps * layout.laneWidth + finishCheckerWidth(layout);
  const centerY = layout.trackHeight / 2 + layout.manholeSize * 0.36;

  return {
    x: finishStart + Math.round(finishDanceAreaWidth(layout) * 0.42) + arrivalDanceOffsetX(layout),
    centerY,
  };
}

export function layoutCssVars(
  layout: ChickenRoadLayout,
  scrollPadWidth = 0,
): Record<string, string> {
  const danceW = finishDanceAreaWidth(layout);
  const multPadW = finishMultPadWidth(layout, scrollPadWidth);
  const danceOffsetX = arrivalDanceOffsetX(layout);
  const multOffsetX = arrivalMultOffsetX(layout, scrollPadWidth);

  return {
    "--cr2-track-h": `${layout.trackHeight}px`,
    "--cr2-manhole-size": `${layout.manholeSize}px`,
    "--cr2-scale": String(layout.scale),
    "--cr2-bush-width": `${Math.round(34 * layout.scale)}px`,
    "--cr2-lamppost-width": `${Math.round(16 * layout.scale)}px`,
    "--cr2-barrier-size": `${Math.round(34 * layout.scale)}px`,
    "--cr2-car-width": `${Math.round(30 * layout.scale)}px`,
    "--cr2-car-ambient-width": `${Math.round(28 * layout.scale)}px`,
    "--cr2-manhole-label-size": `${layout.manholeLabelSize}px`,
    "--cr2-manhole-label-current-size": `${layout.manholeLabelCurrentSize}px`,
    "--cr2-chicken-badge-top": `${Math.round(-22 * layout.scale)}px`,
    "--cr2-chicken-badge-font": `${Math.round(10 * layout.scale)}px`,
    "--cr2-finish-w": `${layout.finishZoneWidth}px`,
    "--cr2-arrival-dance-w": `${danceW}px`,
    "--cr2-arrival-mult-pad-w": `${multPadW}px`,
    "--cr2-arrival-gold-w": `${layout.finishZoneWidth + multPadW}px`,
    "--cr2-arrival-dance-offset-x": `${danceOffsetX}px`,
    "--cr2-arrival-mult-offset-x": `${multOffsetX}px`,
    "--cr2-arrival-mult-font": `${arrivalMultFontSize(layout)}px`,
    "--cr2-victory-beat-ms": `${VICTORY_BEAT_MS}ms`,
    "--cr2-victory-mult-beat-ms": `${VICTORY_MULT_BEAT_MS}ms`,
    "--cr2-step-ms": "680ms",
    "--cr2-victory-roll-ms": "920ms",
    "--cr2-crash-duration": `${CRASH_CAR_DURATION_MS}ms`,
  } as Record<string, string>;
}
