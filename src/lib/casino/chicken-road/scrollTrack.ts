import type { ChickenRoadLayout } from "./layout";
import { finishCheckerWidth, laneCenterX } from "./layout";

export const CR2_STEP_SCROLL_MS = 680;
export const CR2_VICTORY_ROLL_MS = 920;
export const CR2_FOCUS_RATIO = 0.36;

/** Point le plus à droite que le poulet peut atteindre (dernière voie + zone victoire). */
export function getMaxFollowAnchorX(
  maxSteps: number,
  layout: ChickenRoadLayout,
  trackWidth: number,
): number {
  const lastLaneX = laneCenterX(maxSteps, layout);
  const checker = finishCheckerWidth(layout);
  const finishStart = layout.sidewalkWidth + maxSteps * layout.laneWidth + checker;
  const finishMaxX = finishStart + layout.finishZoneWidth * 0.75;
  return Math.max(lastLaneX, finishMaxX);
}

/** Largeur utile de scroll pour garder le poulet centré jusqu'à l'arrivée. */
export function getScrollExtentWidth(
  trackWidth: number,
  viewportWidth: number,
  maxAnchorX: number,
  focusRatio = CR2_FOCUS_RATIO,
): number {
  if (viewportWidth <= 0) return trackWidth;
  const minExtent = maxAnchorX + viewportWidth * (1 - focusRatio);
  return Math.max(trackWidth, minExtent);
}

/** Décalage horizontal de la piste pour garder le poulet visible. */
export function getTrackOffset(
  viewportWidth: number,
  anchorX: number,
  trackWidth: number,
  scrollExtentWidth?: number,
  focusRatio = CR2_FOCUS_RATIO,
): number {
  const extent = scrollExtentWidth ?? trackWidth;
  const max = Math.max(0, extent - viewportWidth);
  const followOffset = anchorX - viewportWidth * focusRatio;
  return Math.max(0, Math.min(followOffset, max));
}
