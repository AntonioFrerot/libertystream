"use client";

import { useMemo, useState } from "react";

export interface PromoWheelSegment {
  amount: number;
  color: string;
}

interface PromoFortuneWheelProps {
  segments: PromoWheelSegment[];
  spinning: boolean;
  rotation: number;
}

function PromoWheelPointer() {
  return (
    <svg
      className="promo-fortune-wheel-pointer"
      viewBox="0 0 24 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M2 4 L22 4 L12 26 Z"
        fill="#fff"
        stroke="#1a1525"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PromoFortuneWheel({ segments, spinning, rotation }: PromoFortuneWheelProps) {
  const count = segments.length;
  const slice = 360 / count;
  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 6;

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
      const tx = cx + r * 0.64 * Math.cos(mid);
      const ty = cy + r * 0.64 * Math.sin(mid);
      const rot = i * slice + slice / 2;

      return { seg, d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`, tx, ty, rot };
    });
  }, [segments, slice, cx, cy, r]);

  return (
    <div className="promo-fortune-wheel-wrap">
      <PromoWheelPointer />

      <div
        className={`promo-fortune-wheel-spinner ${spinning ? "promo-fortune-wheel-spinning" : ""}`}
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="promo-fortune-wheel-svg">
          <circle cx={cx} cy={cy} r={r + 4} className="promo-fortune-wheel-ring" />
          {paths.map(({ seg, d, tx, ty, rot }, i) => (
            <g key={i}>
              <path d={d} fill={seg.color} stroke="rgba(0,0,0,0.35)" strokeWidth="1.5" />
              <g transform={`rotate(${rot}, ${tx}, ${ty})`}>
                <text
                  x={tx}
                  y={ty - 10}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="promo-fortune-wheel-label-main"
                >
                  {seg.amount}
                </text>
                <image
                  href="/logo.png"
                  x={tx - 10}
                  y={ty + 2}
                  width={20}
                  height={20}
                  className="promo-fortune-wheel-segment-logo"
                />
              </g>
            </g>
          ))}
          <circle cx={cx} cy={cy} r={34} className="promo-fortune-wheel-hub" />
          <image
            href="/logo.png"
            x={cx - 22}
            y={cy - 22}
            width={44}
            height={44}
            className="promo-fortune-wheel-hub-logo"
          />
        </svg>
      </div>
    </div>
  );
}

export function usePromoFortuneWheel(segmentCount: number) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [resultIndex, setResultIndex] = useState<number | null>(null);
  const slice = 360 / segmentCount;

  const spin = () => {
    if (spinning) return null;

    const idx = Math.floor(Math.random() * segmentCount);
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

  return { rotation, spinning, resultIndex, spin };
}
