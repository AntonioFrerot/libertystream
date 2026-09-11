"use client";

import { useId } from "react";
const SEGMENTS = 8;
const COLORS = ["#b57bff", "#6d28d9", "#9333ea", "#7c3aed", "#b57bff", "#6d28d9", "#9333ea", "#7c3aed"];

function wedgePath(cx: number, cy: number, r: number, index: number, total: number) {
  const a1 = ((index * 360) / total - 90) * (Math.PI / 180);
  const a2 = (((index + 1) * 360) / total - 90) * (Math.PI / 180);
  const x1 = cx + r * Math.cos(a1);
  const y1 = cy + r * Math.sin(a1);
  const x2 = cx + r * Math.cos(a2);
  const y2 = cy + r * Math.sin(a2);
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;
}

export function WheelNavIcon({ className = "w-5 h-5" }: { className?: string }) {
  const hubId = useId();
  const cx = 12;
  const cy = 13;
  const r = 7.5;

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <radialGradient id={hubId} cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="45%" stopColor="#d4a8ff" />
          <stop offset="100%" stopColor="#7c3aed" />
        </radialGradient>
      </defs>

      <g transform="translate(12 13) scale(1.2) translate(-12 -13)">
        <circle cx={cx} cy={cy} r={r + 1.1} fill="#1a1525" stroke="#b57bff" strokeWidth={1.1} />

        {Array.from({ length: SEGMENTS }, (_, i) => (
          <path key={i} d={wedgePath(cx, cy, r, i, SEGMENTS)} fill={COLORS[i]} />
        ))}

        <circle cx={cx} cy={cy} r={r + 1.1} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={0.55} />

        <circle cx={cx} cy={cy} r={3} fill={`url(#${hubId})`} stroke="#b57bff" strokeWidth={0.75} />
      </g>
    </svg>
  );
}
