"use client";

import { useEffect, useRef, useState } from "react";
import { VICTORY_MULT_BEAT_MS } from "@/lib/casino/chicken-road/layout";

type CarVariant = "police" | "sedan" | "taxi";

const VARIANTS: CarVariant[] = [
  "police",
  "sedan",
  "taxi",
  "sedan",
  "police",
  "sedan",
  "taxi",
  "sedan",
  "police",
  "sedan",
  "taxi",
  "sedan",
];

export function getTrafficCarVariant(lane: number): number {
  const pattern = [1, 0, 2, 4, 6, 3, 8, 5, 10, 7, 9, 11];
  return pattern[(lane - 1) % pattern.length];
}

/** Face supérieure + ombre latérale pour un bloc voxel */
function Block({
  x,
  y,
  w,
  h,
  top,
  side,
  front,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  top: string;
  side?: string;
  front?: string;
}) {
  const depth = Math.min(w, h) * 0.22;
  return (
    <g>
      {front && (
        <rect x={x} y={y + h} width={w} height={depth} fill={front} />
      )}
      {side && (
        <rect x={x + w} y={y} width={depth} height={h} fill={side} />
      )}
      <rect x={x} y={y} width={w} height={h} fill={top} stroke="rgba(0,0,0,0.18)" strokeWidth="0.6" />
    </g>
  );
}

export function RoadCar({ variant, className }: { variant: number; className?: string }) {
  const type = VARIANTS[variant % VARIANTS.length];

  if (type === "police") return <PoliceCar className={className} />;
  if (type === "taxi") return <TaxiCar className={className} />;
  return <SedanCar className={className} colorIndex={variant} />;
}

function PoliceCar({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <Block x={8} y={14} w={32} h={48} top="#f4f6fa" side="#d8dce4" front="#bcc2cc" />
      <Block x={8} y={14} w={32} h={10} top="#252530" side="#1a1a22" front="#121218" />
      <Block x={12} y={28} w={24} h={12} top="#7a8494" side="#5c6470" front="#454b56" />
      <Block x={12} y={42} w={24} h={8} top="#7a8494" side="#5c6470" front="#454b56" />
      <Block x={10} y={4} w={28} h={8} top="#353540" side="#252530" front="#1a1a22" />
      <Block x={12} y={5} w={10} h={6} top="#ff1744" side="#c4102f" front="#8f0b22" />
      <Block x={24} y={5} w={10} h={6} top="#2979ff" side="#1565d8" front="#0d47a1" />
      <Block x={4} y={20} w={6} h={10} top="#1a1a22" side="#0f0f14" front="#08080c" />
      <Block x={38} y={20} w={6} h={10} top="#1a1a22" side="#0f0f14" front="#08080c" />
      <Block x={4} y={44} w={6} h={10} top="#1a1a22" side="#0f0f14" front="#08080c" />
      <Block x={38} y={44} w={6} h={10} top="#1a1a22" side="#0f0f14" front="#08080c" />
      <Block x={10} y={12} w={8} h={4} top="#fff59d" side="#f9e04a" front="#e6c200" />
      <Block x={30} y={12} w={8} h={4} top="#fff59d" side="#f9e04a" front="#e6c200" />
      <g className="cr2-car-bumper">
        <Block x={8} y={52} w={32} h={10} top="#252530" side="#1a1a22" front="#121218" />
        <Block x={6} y={62} w={36} h={8} top="#1a1a22" side="#0f0f14" front="#08080c" />
      </g>
    </svg>
  );
}

const SEDAN_PALETTES = [
  { body: "#42a5f5", side: "#2196f3", front: "#1976d2", dark: "#1565c0", darker: "#0d47a1" },
  { body: "#ef5350", side: "#f44336", front: "#d32f2f", dark: "#c62828", darker: "#b71c1c" },
  { body: "#66bb6a", side: "#4caf50", front: "#388e3c", dark: "#2e7d32", darker: "#1b5e20" },
  { body: "#ffa726", side: "#fb8c00", front: "#ef6c00", dark: "#e65100", darker: "#bf360c" },
  { body: "#ab47bc", side: "#9c27b0", front: "#8e24aa", dark: "#7b1fa2", darker: "#6a1b9a" },
  { body: "#eceff1", side: "#cfd8dc", front: "#b0bec5", dark: "#90a4ae", darker: "#78909c" },
];

function SedanCar({ className, colorIndex = 0 }: { className?: string; colorIndex?: number }) {
  const p = SEDAN_PALETTES[colorIndex % SEDAN_PALETTES.length];
  return (
    <svg
      className={className}
      viewBox="0 0 48 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <Block x={8} y={14} w={32} h={48} top={p.body} side={p.side} front={p.front} />
      <Block x={8} y={14} w={32} h={10} top={p.dark} side={p.darker} front={p.darker} />
      <Block x={12} y={28} w={24} h={12} top="#90caf9" side="#64b5f6" front="#42a5f5" />
      <Block x={12} y={42} w={24} h={8} top="#90caf9" side="#64b5f6" front="#42a5f5" />
      <Block x={4} y={20} w={6} h={10} top="#1a1a22" side="#0f0f14" front="#08080c" />
      <Block x={38} y={20} w={6} h={10} top="#1a1a22" side="#0f0f14" front="#08080c" />
      <Block x={4} y={44} w={6} h={10} top="#1a1a22" side="#0f0f14" front="#08080c" />
      <Block x={38} y={44} w={6} h={10} top="#1a1a22" side="#0f0f14" front="#08080c" />
      <Block x={10} y={10} w={8} h={4} top="#fff59d" side="#f9e04a" front="#e6c200" />
      <Block x={30} y={10} w={8} h={4} top="#fff59d" side="#f9e04a" front="#e6c200" />
      <g className="cr2-car-bumper">
        <Block x={8} y={52} w={32} h={10} top={p.dark} side={p.darker} front={p.darker} />
        <Block x={6} y={62} w={36} h={8} top={p.darker} side={p.dark} front={p.front} />
      </g>
    </svg>
  );
}

function TaxiCar({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <Block x={8} y={14} w={32} h={48} top="#ffca28" side="#ffb300" front="#ff8f00" />
      <Block x={8} y={14} w={32} h={10} top="#e6a800" side="#c49000" front="#9a7000" />
      <Block x={12} y={28} w={24} h={12} top="#ffe082" side="#ffd54f" front="#ffca28" />
      <Block x={14} y={4} w={20} h={8} top="#1a1a22" side="#0f0f14" front="#08080c" />
      <Block x={16} y={5} w={16} h={6} top="#ffca28" side="#ffb300" front="#ff8f00" />
      <Block x={4} y={20} w={6} h={10} top="#1a1a22" side="#0f0f14" front="#08080c" />
      <Block x={38} y={20} w={6} h={10} top="#1a1a22" side="#0f0f14" front="#08080c" />
      <Block x={4} y={44} w={6} h={10} top="#1a1a22" side="#0f0f14" front="#08080c" />
      <Block x={38} y={44} w={6} h={10} top="#1a1a22" side="#0f0f14" front="#08080c" />
      <Block x={10} y={10} w={8} h={4} top="#fff59d" side="#f9e04a" front="#e6c200" />
      <Block x={30} y={10} w={8} h={4} top="#fff59d" side="#f9e04a" front="#e6c200" />
      <g className="cr2-car-bumper">
        <Block x={8} y={52} w={32} h={10} top="#e6a800" side="#c49000" front="#9a7000" />
        <Block x={6} y={62} w={36} h={8} top="#c49000" side="#9a7000" front="#705200" />
      </g>
    </svg>
  );
}

export function ManholeCover({
  multiplier,
  passed,
  current,
  laneId,
}: {
  multiplier: string;
  passed?: boolean;
  current?: boolean;
  laneId: number;
}) {
  const clipId = `manholeInner-${laneId}`;
  const sheenId = `manholeSheen-${laneId}`;
  const slotXs = [-24, -16, -8, 0, 8, 16, 24];

  return (
    <div
      className={`cr2-manhole${passed ? " cr2-manhole-passed" : ""}${
        current ? " cr2-manhole-current" : ""
      }`}
    >
      <svg viewBox="0 0 80 80" fill="none" aria-hidden className="cr2-manhole-svg">
        <defs>
          <clipPath id={clipId}>
            <circle cx="40" cy="40" r="26" />
          </clipPath>
          <linearGradient id={sheenId} x1="18" y1="14" x2="62" y2="66" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fff" stopOpacity="0" />
            <stop offset="42%" stopColor="#fff" stopOpacity="0.14" />
            <stop offset="58%" stopColor="#fff" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Ombre */}
        <circle cx="40" cy="41.5" r="34" fill="#2a2a2e" opacity="0.55" />

        {/* Anneau extérieur */}
        <circle cx="40" cy="39.5" r="34" fill="#43434a" stroke="#2f2f35" strokeWidth="1.5" />
        <circle cx="40" cy="39.5" r="30.5" fill="none" stroke="#65656e" strokeWidth="1.2" opacity="0.55" />

        {/* Plateau intérieur */}
        <circle cx="40" cy="39.5" r="27" fill="#585860" stroke="#45454c" strokeWidth="1" />

        {/* Grille : fentes haut / bas + barre centrale */}
        <g clipPath={`url(#${clipId})`}>
          {slotXs.map((offset) => (
            <g key={offset}>
              <rect
                x={40 + offset - 2.2}
                y="15"
                width="4.4"
                height="17"
                rx="2.2"
                fill="#3a3a42"
              />
              <rect
                x={40 + offset - 2.2}
                y="48"
                width="4.4"
                height="17"
                rx="2.2"
                fill="#3a3a42"
              />
            </g>
          ))}
          <rect x="13" y="33" width="54" height="14" fill="#585860" />
          <rect x="13" y="33" width="54" height="14" fill="#4e4e56" opacity="0.35" />
        </g>

        {/* Reflet diagonal */}
        <circle cx="40" cy="39.5" r="27" fill={`url(#${sheenId})`} />

        {/* Petites rayures */}
        <line x1="27" y1="53" x2="29" y2="55" stroke="#3a3a42" strokeWidth="0.9" opacity="0.45" />
        <line x1="52" y1="50" x2="54" y2="52" stroke="#3a3a42" strokeWidth="0.8" opacity="0.35" />
        <line x1="34" y1="56" x2="36" y2="57" stroke="#3a3a42" strokeWidth="0.7" opacity="0.3" />

        {/* Bord intérieur */}
        <circle cx="40" cy="39.5" r="27" fill="none" stroke="#6a6a72" strokeWidth="0.8" opacity="0.35" />
      </svg>
      <span className="cr2-manhole-label">{multiplier}</span>
    </div>
  );
}

export function Lamppost() {
  return (
    <svg viewBox="0 0 28 88" fill="none" aria-hidden className="chicken-road-lamppost">
      <Block x={10} y={72} w={8} h={6} top="#64748b" side="#475569" front="#334155" />
      <Block x={11} y={20} w={6} h={52} top="#94a3b8" side="#64748b" front="#475569" />
      <Block x={8} y={12} w={12} h={10} top="#cbd5e1" side="#94a3b8" front="#64748b" />
      <Block x={10} y={6} w={8} h={8} top="#fff59d" side="#f9e04a" front="#e6c200" />
      <rect x={4} y={4} width={20} height={14} rx="2" fill="#a855f7" opacity="0.18" />
    </svg>
  );
}

export function RoadBush() {
  return (
    <svg viewBox="0 0 52 40" fill="none" aria-hidden className="chicken-road-bush">
      <Block x={4} y={28} w={44} h={8} top="#166534" side="#14532d" front="#0f4224" />
      <Block x={8} y={18} w={14} h={12} top="#22c55e" side="#16a34a" front="#15803d" />
      <Block x={20} y={14} w={16} h={16} top="#4ade80" side="#22c55e" front="#16a34a" />
      <Block x={34} y={18} w={14} h={12} top="#22c55e" side="#16a34a" front="#15803d" />
      <Block x={14} y={8} w={12} h={10} top="#86efac" side="#4ade80" front="#22c55e" />
      <Block x={26} y={6} w={12} h={12} top="#86efac" side="#4ade80" front="#22c55e" />
    </svg>
  );
}

export function VictoryTrophy({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <Block x={6} y={42} w={28} h={5} top="#e65100" side="#bf360c" front="#8f2a00" />
      <Block x={10} y={36} w={20} h={6} top="#ff8f00" side="#e65100" front="#bf360c" />
      <Block x={13} y={30} w={14} h={6} top="#ffb300" side="#ff8f00" front="#e65100" />
      <Block x={8} y={18} w={24} h={12} top="#ffca28" side="#ffb300" front="#ff8f00" />
      <Block x={6} y={16} w={28} h={4} top="#ffe082" side="#ffca28" front="#ffb300" />
      <Block x={2} y={19} w={6} h={9} top="#ffb300" side="#ff8f00" front="#e65100" />
      <Block x={32} y={19} w={6} h={9} top="#ffb300" side="#ff8f00" front="#e65100" />
      <Block x={14} y={6} w={12} h={10} top="#fff59d" side="#ffca28" front="#ffb300" />
      <polygon
        points="20,2 22,8 28,8 23,12 25,18 20,14 15,18 17,12 12,8 18,8"
        fill="#fffde7"
        stroke="#ff8f00"
        strokeWidth="0.8"
      />
    </svg>
  );
}

const ARRIVAL_CONFETTI_COLORS = ["#ef4444", "#a855f7", "#4ade80", "#60a5fa", "#ffca28", "#ff4081"];

const ARRIVAL_CONFETTI_RAIN = Array.from({ length: 36 }, (_, index) => ({
  id: index,
  left: `${2 + ((index * 17) % 96)}%`,
  delay: `${((index * 0.27) % 2).toFixed(2)}s`,
  duration: `${(1.4 + (index % 6) * 0.22).toFixed(2)}s`,
  color: ARRIVAL_CONFETTI_COLORS[index % ARRIVAL_CONFETTI_COLORS.length],
  width: 4 + (index % 3),
  height: 6 + (index % 4),
  drift: -22 + (index % 9) * 5,
}));

function ArrivalConfettiRain() {
  return (
    <div className="cr2-arrival-confetti-rain" aria-hidden>
      {ARRIVAL_CONFETTI_RAIN.map((piece) => (
        <span
          key={piece.id}
          className="cr2-arrival-confetti-rain-piece"
          style={{
            left: piece.left,
            width: piece.width,
            height: piece.height,
            background: piece.color,
            animationDelay: piece.delay,
            animationDuration: piece.duration,
            ["--cr2-confetti-drift" as string]: `${piece.drift}px`,
          }}
        />
      ))}
    </div>
  );
}

function randomMultTransform(scale: number): string {
  const y = -Math.round((2 + Math.random() * 9) * scale);
  const s = 1.02 + Math.random() * 0.1;
  const r = (Math.random() - 0.5) * 8;
  return `translateY(${y}px) scale(${s.toFixed(3)}) rotate(${r.toFixed(2)}deg)`;
}

function DancingMultiplierValue({
  label,
  dancing,
  scale = 1,
}: {
  label: string;
  dancing: boolean;
  scale?: number;
}) {
  const [transform, setTransform] = useState("translateY(0) scale(1) rotate(0deg)");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!dancing) {
      setTransform("translateY(0) scale(1) rotate(0deg)");
      return;
    }

    const scheduleNext = () => {
      setTransform(randomMultTransform(scale));
      const delay = VICTORY_MULT_BEAT_MS * (0.288 + Math.random() * 0.252);
      timerRef.current = setTimeout(scheduleNext, delay);
    };

    scheduleNext();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [dancing, scale]);

  return (
    <span
      className={`cr2-arrival-mult-value${dancing ? " cr2-arrival-mult-value-dancing" : ""}`}
      style={dancing ? { transform } : undefined}
      aria-label={`Multiplicateur ${label}`}
    >
      {label}
    </span>
  );
}

export function VictoryFinishArrival({
  nearGoal = false,
  dancing = false,
  multiplierLabel,
  showMultiplier = false,
  showCelebrationUi = true,
  uiScale = 1,
}: {
  nearGoal?: boolean;
  dancing?: boolean;
  multiplierLabel: string;
  showMultiplier?: boolean;
  showCelebrationUi?: boolean;
  uiScale?: number;
}) {
  return (
    <div
      className={`cr2-arrival${nearGoal ? " cr2-arrival-near" : ""}${dancing ? " cr2-arrival-dancing" : ""}`}
    >
      {showCelebrationUi && dancing && <ArrivalConfettiRain />}

      {showCelebrationUi ? (
        <div className="cr2-arrival-body">
          <div className="cr2-arrival-dance">
            <div className="cr2-arrival-banner">
              <span className="cr2-arrival-banner-star" aria-hidden>
                ★
              </span>
              <span className="cr2-arrival-banner-text">WIN</span>
              <span className="cr2-arrival-banner-star" aria-hidden>
                ★
              </span>
            </div>
          </div>
          <div className="cr2-arrival-mult">
            {showMultiplier ? (
              <DancingMultiplierValue
                label={multiplierLabel}
                dancing={dancing}
                scale={uiScale}
              />
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
