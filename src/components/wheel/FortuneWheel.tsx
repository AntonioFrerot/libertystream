"use client";

import { useMemo, useState } from "react";
import { formatMultiplier } from "@/lib/casino/plinko/multipliers";
import { WheelPointer } from "@/components/wheel/WheelPointer";

export interface WheelSegment {
  index: number;
  multiplier: number;
  color: string;
  accent: string;
  textColor: string;
}

interface FortuneWheelProps {
  segments: WheelSegment[];
  spinning: boolean;
  rotation: number;
  highlightIndex?: number | null;
  size?: number;
}

/** Plus de segments → labels plus près du bord (plus d’arc disponible). */
function getLabelRadiusFactor(segmentCount: number): number {
  if (segmentCount >= 50) return 0.87;
  if (segmentCount >= 40) return 0.85;
  if (segmentCount >= 30) return 0.76;
  if (segmentCount >= 20) return 0.71;
  return 0.68;
}

function getLabelFontSize(segmentCount: number, slice: number, labelR: number, size: number): number {
  const arcPx = labelR * ((slice * Math.PI) / 180);
  const maxByArc = Math.floor(arcPx / 3.2);
  const base =
    segmentCount >= 50 ? 7 :
    segmentCount >= 40 ? 8 :
    slice < 13 ? 8 :
    slice < 17 ? 9 : 11;
  const scaled = Math.round(base * (size / 420));
  return Math.max(5, Math.min(scaled, maxByArc, 12));
}

export function FortuneWheel({
  segments,
  spinning,
  rotation,
  highlightIndex = null,
  size = 320,
}: FortuneWheelProps) {
  const count = segments.length;
  const slice = 360 / count;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 10;
  const labelRadiusFactor = getLabelRadiusFactor(count);
  const hubSize = Math.round(size * 0.22);
  const logoSize = Math.round(hubSize * 0.72);

  const paths = useMemo(() => {
    return segments.map((seg, i) => {
      const start = (i * slice - 90) * (Math.PI / 180);
      const end = ((i + 1) * slice - 90) * (Math.PI / 180);
      const x1 = cx + r * Math.cos(start);
      const y1 = cy + r * Math.sin(start);
      const x2 = cx + r * Math.cos(end);
      const y2 = cy + r * Math.sin(end);
      const large = slice > 180 ? 1 : 0;
      const mid = (start + end) / 2;
      const labelR = r * labelRadiusFactor;
      const tx = cx + labelR * Math.cos(mid);
      const ty = cy + labelR * Math.sin(mid);
      const rot = i * slice + slice / 2;
      const fontSize = getLabelFontSize(count, slice, labelR, size);

      return { seg, d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`, tx, ty, rot, fontSize };
    });
  }, [segments, slice, cx, cy, r, labelRadiusFactor, count, size]);

  return (
    <div className="fortune-wheel-wrap" style={{ width: size, height: size }}>
      <WheelPointer />

      <div
        className={`fortune-wheel-spinner ${spinning ? "fortune-wheel-spinning" : ""}`}
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="fortune-wheel-svg">
          <circle cx={cx} cy={cy} r={r + 3} className="fortune-wheel-ring" />
          {paths.map(({ seg, d, tx, ty, rot, fontSize }, i) => (
            <g key={i}>
              <path
                d={d}
                fill={seg.color}
                stroke="rgba(0, 0, 0, 0.25)"
                strokeWidth="1"
                className={
                  highlightIndex === i && !spinning ? "fortune-wheel-segment-highlight" : undefined
                }
              />
              <g transform={`rotate(${rot}, ${tx}, ${ty})`}>
                <text
                  x={tx}
                  y={ty + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fortune-wheel-label-main"
                  fill={seg.textColor}
                  fontSize={fontSize}
                >
                  {formatMultiplier(seg.multiplier)}
                </text>
              </g>
            </g>
          ))}
        </svg>
      </div>

      <div
        className="fortune-wheel-hub"
        style={{ width: hubSize, height: hubSize, marginLeft: -hubSize / 2, marginTop: -hubSize / 2 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" width={logoSize} height={logoSize} className="fortune-wheel-hub-logo" />
      </div>
    </div>
  );
}

export function useFortuneWheel(segmentCount: number) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [resultIndex, setResultIndex] = useState<number | null>(null);
  const slice = 360 / segmentCount;

  const spinToIndex = (idx: number) => {
    if (spinning) return null;

    const extraSpins = 360 * (5 + Math.floor(Math.random() * 4));
    const segmentCenter = idx * slice + slice / 2;
    const targetMod = (360 - segmentCenter) % 360;
    const currentMod = ((rotation % 360) + 360) % 360;
    const align = (targetMod - currentMod + 360) % 360;
    const nextRotation = rotation + extraSpins + align;

    setSpinning(true);
    setResultIndex(null);
    setRotation(nextRotation);

    return new Promise<number>((resolve) => {
      window.setTimeout(() => {
        setSpinning(false);
        setResultIndex(idx);
        resolve(idx);
      }, 4200);
    });
  };

  return { rotation, spinning, resultIndex, spinToIndex };
}
