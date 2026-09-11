import { PLINKO_START_PINS } from "./layout";
import type { PlinkoLayout, PlinkoPeg } from "./layout";

export interface BallAnimation {
  xPath: number[];
  yPath: number[];
  scalePath: number[];
  rotatePath: number[];
  times: number[];
  pegHits: number[];
  duration: number;
}

function pegAtCol(pegs: PlinkoPeg[], row: number, col: number): PlinkoPeg | null {
  const rowPegs = pegs.filter((p) => p.row === row).sort((a, b) => a.x - b.x);
  if (rowPegs.length === 0) return null;
  const idx = Math.min(Math.max(col, 0), rowPegs.length - 1);
  return rowPegs[idx];
}

/** Courbe de chute accélérée (effet gravité) */
function buildTimes(count: number): number[] {
  if (count <= 1) return [0];
  const steps = count - 1;
  const weights = Array.from({ length: steps }, (_, i) => Math.pow(i + 1, 0.72));
  const sum = weights.reduce((a, b) => a + b, 0);
  const times = [0];
  let acc = 0;
  for (let i = 0; i < steps; i++) {
    acc += weights[i] / sum;
    times.push(Math.min(1, acc));
  }
  times[times.length - 1] = 1;
  return times;
}

/** Animation avec rebonds sur plots alignés sur la grille */
export function buildBallAnimation(path: number[], layout: PlinkoLayout, rows: number): BallAnimation | null {
  if (path.length !== rows) return null;

  const { pegs, pinGap, ballOriginX, ballOriginY, buckets } = layout;

  const xPath: number[] = [0];
  const yPath: number[] = [0];
  const scalePath: number[] = [1];
  const rotatePath: number[] = [0];
  const pegHits: number[] = [];

  let col = (PLINKO_START_PINS - 1) / 2;
  let rotation = 0;

  for (let row = 0; row < rows; row++) {
    const peg = pegAtCol(pegs, row, col);
    if (!peg) return null;
    pegHits.push(pegs.indexOf(peg));

    const rx = peg.x - ballOriginX;
    const ry = peg.y - ballOriginY;
    const dir = path[row];
    rotation += dir * 18;

    // Approche
    xPath.push(rx + dir * pinGap * 0.04);
    yPath.push(ry - pinGap * 0.28);
    scalePath.push(1.06);
    rotatePath.push(rotation * 0.6);

    // Impact
    xPath.push(rx);
    yPath.push(ry + pinGap * 0.07);
    scalePath.push(0.82);
    rotatePath.push(rotation);

    // Rebond vers la rangée suivante
    xPath.push(rx + dir * pinGap * 0.2);
    yPath.push(ry - pinGap * 0.12);
    scalePath.push(1.04);
    rotatePath.push(rotation * 0.85);

    if (dir === 1) col += 1;
  }

  const bucketIdx = path.filter((p) => p === 1).length;
  const bucket = buckets[bucketIdx] ?? buckets[Math.floor(buckets.length / 2)];
  const bx = bucket.x - ballOriginX;
  const by = bucket.y - ballOriginY;

  // Chute dans le seau
  xPath.push(bx);
  yPath.push(by - pinGap * 0.22);
  scalePath.push(1.08);
  rotatePath.push(rotation);

  // Atterrissage
  xPath.push(bx);
  yPath.push(by + pinGap * 0.06);
  scalePath.push(0.88);
  rotatePath.push(rotation * 0.5);

  // Stabilisation
  xPath.push(bx);
  yPath.push(by);
  scalePath.push(1);
  rotatePath.push(0);

  const duration = 0.85 + rows * 0.058;

  return {
    xPath,
    yPath,
    scalePath,
    rotatePath,
    times: buildTimes(xPath.length),
    pegHits,
    duration,
  };
}

export function getPlinkoAnimationDuration(rows: number): number {
  return (0.85 + rows * 0.058) * 1000;
}
