import type { PlinkoRows } from "./multipliers";

/** Formule Stake / Gamba : 3 plots en haut, +1 par rangée, espacement uniforme */
export const PLINKO_START_PINS = 3;

export interface PlinkoPeg {
  x: number;
  y: number;
  row: number;
}

export interface PlinkoBucketSlot {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PlinkoLayout {
  playfieldWidth: number;
  playfieldHeight: number;
  pegSize: number;
  pinGap: number;
  startY: number;
  pegs: PlinkoPeg[];
  buckets: PlinkoBucketSlot[];
  ballOriginX: number;
  ballOriginY: number;
}

/** Hauteur totale estimée pour un pinGap donné */
function estimateHeight(rows: number, pinGap: number, bottomPadding = 4): number {
  const startY = pinGap * 0.45;
  const bucketHeight = Math.max(20, pinGap * 0.72);
  const lastPegY = startY + (rows - 1) * pinGap;
  const bucketY = lastPegY + pinGap * 0.42;
  return bucketY + bucketHeight + bottomPadding;
}

export interface PlinkoLayoutOptions {
  /** Réduit le pinGap pour tenir dans la hauteur (PC) */
  constrainByHeight?: boolean;
  /** Marge basse pour l'estimation de hauteur */
  heightPadding?: number;
}

export function computePlinkoLayout(
  rows: PlinkoRows,
  boardWidth: number,
  boardHeight: number,
  centeredPegs = true,
  contentScale = 1,
  options: PlinkoLayoutOptions = {}
): PlinkoLayout {
  const { constrainByHeight = true, heightPadding = 4 } = options;
  const lastLinePins = PLINKO_START_PINS + rows - 1;
  const maxWidth = Math.min(Math.max(boardWidth, centeredPegs ? 240 : 280), 620);

  const pinGapFromWidth = maxWidth / lastLinePins;

  let pinGapFromHeight = pinGapFromWidth;
  if (constrainByHeight && boardHeight > 80) {
    let lo = 12;
    let hi = pinGapFromWidth;
    while (hi - lo > 0.5) {
      const mid = (lo + hi) / 2;
      if (estimateHeight(rows, mid, heightPadding) <= boardHeight) lo = mid;
      else hi = mid;
    }
    pinGapFromHeight = lo;
  }

  const pinGap = Math.min(pinGapFromWidth, pinGapFromHeight) * contentScale;
  const playfieldWidth = pinGap * lastLinePins;
  const pegSize = Math.min(10, Math.max(5, pinGap * 0.48));
  const startY = pinGap * 0.45;
  const bucketHeight = Math.max(20, pinGap * 0.72);
  const bucketGap = pinGap * 0.06;

  const pegs: PlinkoPeg[] = [];

  for (let row = 0; row < rows; row++) {
    const linePins = PLINKO_START_PINS + row;
    const rowStartX = centeredPegs
      ? (playfieldWidth - (linePins - 1) * pinGap) / 2
      : playfieldWidth / 2 - (linePins * pinGap) / 2;

    for (let col = 0; col < linePins; col++) {
      pegs.push({
        x: rowStartX + col * pinGap,
        y: startY + row * pinGap,
        row,
      });
    }
  }

  const lastRowPegs = pegs.filter((p) => p.row === rows - 1).sort((a, b) => a.x - b.x);
  const bucketWidth = pinGap - bucketGap;
  const bucketY = lastRowPegs[0].y + pinGap * 0.42;

  const buckets: PlinkoBucketSlot[] = lastRowPegs.slice(0, -1).map((peg, i) => ({
    x: (peg.x + lastRowPegs[i + 1].x) / 2,
    y: bucketY,
    width: bucketWidth,
    height: bucketHeight,
  }));

  const playfieldHeight = bucketY + bucketHeight + heightPadding;

  return {
    playfieldWidth,
    playfieldHeight,
    pegSize,
    pinGap,
    startY,
    pegs,
    buckets,
    ballOriginX: playfieldWidth / 2,
    ballOriginY: 8,
  };
}
