import {
  EAGLE_FLIGHT_STRIP_UNITS,
  eagleFlightScrollProgress,
  eagleFlightStripScrollTarget,
} from "./config";

export type CloudDepth = "far" | "mid" | "near";

export type CloudSpec = {
  id: string;
  top: string;
  left?: string;
  right?: string;
  width: number;
  height: number;
  opacity?: number;
  puff?: boolean;
  depth: CloudDepth;
};

export type BirdSpec = { id: string; top: string; left: string; scale?: number; delay?: number };
export type BalloonSpec = { id: string; top: string; left: string; color: string; delay?: number };

const CLASSIC_SKY_CLOUDS: Omit<CloudSpec, "id">[] = [
  { top: "1%", left: "10%", width: 76, height: 26, puff: true, depth: "near" },
  { top: "5%", right: "12%", width: 92, height: 30, opacity: 0.65, puff: true, depth: "mid" },
  { top: "9%", left: "38%", width: 52, height: 18, opacity: 0.45, depth: "far" },
  { top: "13%", left: "4%", width: 88, height: 32, puff: true, depth: "near" },
  { top: "17%", right: "22%", width: 68, height: 24, depth: "mid" },
  { top: "21%", left: "22%", width: 104, height: 34, puff: true, opacity: 0.72, depth: "near" },
  { top: "25%", right: "6%", width: 58, height: 20, depth: "far" },
  { top: "29%", left: "58%", width: 82, height: 28, puff: true, depth: "near" },
  { top: "33%", left: "8%", width: 64, height: 22, opacity: 0.55, depth: "mid" },
  { top: "37%", right: "18%", width: 96, height: 32, puff: true, depth: "near" },
  { top: "41%", left: "32%", width: 70, height: 24, depth: "mid" },
  { top: "45%", right: "4%", width: 110, height: 36, puff: true, opacity: 0.68, depth: "near" },
  { top: "49%", left: "14%", width: 56, height: 18, opacity: 0.5, depth: "far" },
  { top: "53%", left: "48%", width: 86, height: 30, puff: true, depth: "near" },
  { top: "57%", right: "28%", width: 74, height: 26, depth: "mid" },
  { top: "61%", left: "6%", width: 98, height: 32, puff: true, opacity: 0.7, depth: "near" },
  { top: "65%", right: "10%", width: 62, height: 22, depth: "far" },
  { top: "69%", left: "26%", width: 80, height: 28, puff: true, depth: "near" },
  { top: "73%", left: "62%", width: 54, height: 18, opacity: 0.48, depth: "far" },
  { top: "77%", right: "16%", width: 102, height: 34, puff: true, depth: "near" },
  { top: "81%", left: "12%", width: 66, height: 22, depth: "mid" },
  { top: "85%", left: "42%", width: 90, height: 30, puff: true, opacity: 0.62, depth: "mid" },
  { top: "89%", right: "8%", width: 72, height: 24, depth: "mid" },
  { top: "93%", left: "20%", width: 84, height: 28, puff: true, depth: "near" },
  { top: "97%", right: "24%", width: 60, height: 20, opacity: 0.5, depth: "far" },
];

const CLASSIC_SKY_BIRDS: Omit<BirdSpec, "id">[] = [
  { top: "7%", left: "68%", scale: 0.85, delay: 0 },
  { top: "19%", left: "16%", scale: 0.72, delay: 1.1 },
  { top: "31%", left: "78%", scale: 0.9, delay: 0.5 },
  { top: "43%", left: "36%", scale: 0.78, delay: 1.8 },
  { top: "55%", left: "82%", scale: 0.68, delay: 2.2 },
  { top: "67%", left: "10%", scale: 0.82, delay: 0.9 },
  { top: "79%", left: "54%", scale: 0.75, delay: 1.5 },
  { top: "91%", left: "72%", scale: 0.7, delay: 2.6 },
];

const BALLOON_COLORS = ["#f472b6", "#38bdf8", "#fbbf24", "#a78bfa", "#34d399", "#fb7185", "#60a5fa"];

const SPARSE_CLOUDS: Omit<CloudSpec, "id">[] = [
  { top: "8%", left: "15%", width: 64, height: 22, depth: "far", opacity: 0.35 },
  { top: "22%", right: "20%", width: 48, height: 16, depth: "far", opacity: 0.28 },
  { top: "38%", left: "55%", width: 72, height: 24, puff: true, depth: "mid", opacity: 0.4 },
  { top: "55%", right: "8%", width: 56, height: 18, depth: "far", opacity: 0.25 },
  { top: "72%", left: "30%", width: 80, height: 26, puff: true, depth: "mid", opacity: 0.32 },
  { top: "88%", right: "35%", width: 44, height: 14, depth: "far", opacity: 0.2 },
];

function parsePercent(value: string): number {
  return parseFloat(value) / 100;
}

function shiftHorizontal(
  spec: { left?: string; right?: string },
  index: number,
): { left?: string; right?: string } {
  const offset = (index % 4) * 7 - 10;
  if (spec.left) {
    const base = parseFloat(spec.left);
    return { left: `${Math.min(88, Math.max(2, base + offset)).toFixed(1)}%` };
  }
  if (spec.right) {
    const base = parseFloat(spec.right);
    return { right: `${Math.min(88, Math.max(2, base - offset)).toFixed(1)}%` };
  }
  return spec;
}

function fillUnit(
  clouds: CloudSpec[],
  birds: BirdSpec[],
  balloons: BalloonSpec[],
  unit: number,
  unitHeight: number,
  mode: "dense" | "sparse" | "minimal",
) {
  const base = unit * unitHeight;
  const templates =
    mode === "dense" ? CLASSIC_SKY_CLOUDS : mode === "sparse" ? SPARSE_CLOUDS : SPARSE_CLOUDS.slice(0, 3);
  const duplicate = mode === "dense";

  templates.forEach((cloud, index) => {
    const topBase = (base + parsePercent(cloud.top) * unitHeight) * 100;
    clouds.push({
      ...cloud,
      ...shiftHorizontal(cloud, unit),
      id: `${mode}-c-${unit}-${index}`,
      top: `${topBase.toFixed(4)}%`,
      width: Math.round(cloud.width * (mode === "dense" ? 1.35 : 1)),
      height: Math.round(cloud.height * (mode === "dense" ? 1.35 : 1)),
    });
    if (duplicate) {
      clouds.push({
        ...cloud,
        ...shiftHorizontal(cloud, unit + 2),
        id: `${mode}-c-${unit}-${index}-b`,
        top: `${(topBase * 0.98 + unit * 0.02).toFixed(4)}%`,
        width: Math.round(cloud.width * 1.4),
        height: Math.round(cloud.height * 1.4),
        opacity: (cloud.opacity ?? 1) * 0.88,
      });
      clouds.push({
        ...cloud,
        ...shiftHorizontal(cloud, unit + 1),
        id: `${mode}-c-${unit}-${index}-c`,
        top: `${(topBase * 1.02).toFixed(4)}%`,
        width: Math.round(cloud.width * 1.15),
        height: Math.round(cloud.height * 1.15),
        opacity: (cloud.opacity ?? 1) * 0.75,
      });
    }
  });

  if (mode === "dense") {
    CLASSIC_SKY_BIRDS.forEach((bird, index) => {
      birds.push({
        ...bird,
        id: `b-${unit}-${index}`,
        top: `${((base + parsePercent(bird.top) * unitHeight) * 100).toFixed(4)}%`,
      });
    });
  }

  if (mode === "sparse" && unit % 2 === 0) {
    SPARSE_CLOUDS.forEach((_, bi) => {
      balloons.push({
        top: `${((base + (0.12 + bi * 0.14) * unitHeight) * 100).toFixed(4)}%`,
        left: `${(10 + bi * 12 + (unit % 3) * 8).toFixed(1)}%`,
        color: BALLOON_COLORS[(unit + bi) % BALLOON_COLORS.length]!,
        delay: (unit + bi) * 0.3,
        id: `n-${unit}-${bi}`,
      });
    });
  }
}

/** Bande complète alignée sur les zones d'altitude (1×→10× dense, 10×→30× sparse, etc.). */
export function buildAltitudeStrip() {
  const target = eagleFlightStripScrollTarget();
  const unitHeight = 1 / EAGLE_FLIGHT_STRIP_UNITS;

  const zoneEnds = [
    { mult: 10, mode: "dense" as const },
    { mult: 30, mode: "sparse" as const },
    { mult: 100, mode: "minimal" as const },
  ];

  let prevFraction = 0;
  const sections: { startUnit: number; endUnit: number; mode: "dense" | "sparse" | "minimal" | "clear" }[] = [];

  for (const zone of zoneEnds) {
    const fraction = eagleFlightScrollProgress(zone.mult, target);
    const startUnit = Math.floor(prevFraction * EAGLE_FLIGHT_STRIP_UNITS);
    const endUnit = Math.ceil(fraction * EAGLE_FLIGHT_STRIP_UNITS);
    sections.push({ startUnit, endUnit, mode: zone.mode });
    prevFraction = fraction;
  }
  sections.push({
    startUnit: Math.ceil(prevFraction * EAGLE_FLIGHT_STRIP_UNITS),
    endUnit: EAGLE_FLIGHT_STRIP_UNITS,
    mode: "clear",
  });

  const clouds: CloudSpec[] = [];
  const birds: BirdSpec[] = [];
  const balloons: BalloonSpec[] = [];

  for (const section of sections) {
    for (let unit = section.startUnit; unit < section.endUnit; unit += 1) {
      if (section.mode === "clear") continue;
      fillUnit(clouds, birds, balloons, unit, unitHeight, section.mode);
    }
  }

  return { clouds, birds, balloons };
}

export const STRIP_CONTENT = buildAltitudeStrip();
