"use client";

import { useEffect, useRef } from "react";
import { formatEagleFlightMultiplier } from "@/lib/casino/eagle-flight/config";
import type { EagleFlightPhase, EagleFlightRoundOutcome } from "@/lib/casino/eagle-flight/types";

const EAGLE_FLIGHT_BG_VIDEO = "/eagle-flight/sky-bg.mp4";

interface EagleFlightArenaProps {
  phase: EagleFlightPhase;
  roundOutcome: EagleFlightRoundOutcome | null;
  currentMultiplier: number;
  crashPoint: number;
}

function BackgroundVideo({ phase }: { phase: EagleFlightPhase }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (phase === "flying") {
      video.currentTime = 0;
      void video.play().catch(() => {});
      return;
    }

    if (phase === "betting") {
      video.pause();
      video.currentTime = 0;
      return;
    }

    video.pause();
  }, [phase]);

  return (
    <video
      ref={videoRef}
      className="eagle-flight-bg-video"
      src={EAGLE_FLIGHT_BG_VIDEO}
      autoPlay
      muted
      playsInline
      preload="metadata"
      aria-hidden
    />
  );
}

const CONFETTI_COLORS = ["#ef4444", "#a855f7", "#4ade80", "#60a5fa", "#fbbf24", "#fb7185", "#38bdf8"];

const CONFETTI_PIECES = Array.from({ length: 80 }, (_, index) => {
  const col = index % 10;
  const row = Math.floor(index / 10);
  return {
    id: index,
    delay: `${((index * 0.012) % 0.22).toFixed(2)}s`,
    duration: `${(0.7 + (index % 7) * 0.12).toFixed(2)}s`,
    color: CONFETTI_COLORS[index % CONFETTI_COLORS.length]!,
    width: 6 + (index % 4),
    height: 8 + (index % 5),
    left: -10 + col * 13 + (index % 3) * 1.8,
    top: -10 + row * 15 + ((index * 3) % 5) * 1.2,
    rotate: 160 + (index % 13) * 70,
  };
});

function MaxWinConfetti() {
  return (
    <div className="eagle-flight-confetti" aria-hidden>
      {CONFETTI_PIECES.map((piece) => (
        <span
          key={piece.id}
          className="eagle-flight-confetti-piece"
          style={{
            width: piece.width,
            height: piece.height,
            background: piece.color,
            animationDelay: piece.delay,
            animationDuration: piece.duration,
            ["--ef-confetti-left" as string]: `${piece.left}%`,
            ["--ef-confetti-top" as string]: `${piece.top}%`,
            ["--ef-confetti-rotate" as string]: `${piece.rotate}deg`,
          }}
        />
      ))}
    </div>
  );
}

function PassengerJet() {
  return (
    <div className="eagle-flight-jet" aria-hidden>
      <svg className="eagle-flight-jet-svg" viewBox="0 0 280 96" fill="none">
        <defs>
          <linearGradient id="ef-jet-body" x1="0" y1="28" x2="0" y2="66" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ffffff" />
            <stop offset="0.45" stopColor="#f1f5f9" />
            <stop offset="1" stopColor="#cbd5e1" />
          </linearGradient>
          <linearGradient id="ef-jet-wing" x1="108" y1="48" x2="214" y2="78" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f8fafc" />
            <stop offset="1" stopColor="#94a3b8" />
          </linearGradient>
          <linearGradient id="ef-jet-engine" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#94a3b8" />
            <stop offset="1" stopColor="#334155" />
          </linearGradient>
          <radialGradient id="ef-jet-exhaust" cx="50%" cy="50%" r="50%">
            <stop stopColor="rgba(186,230,253,0.7)" />
            <stop offset="1" stopColor="rgba(186,230,253,0)" />
          </radialGradient>
        </defs>

        <ellipse cx="256" cy="46" rx="20" ry="6" fill="url(#ef-jet-exhaust)" />

        <path fill="#b8c5d4" d="M118 44 L168 18 L178 20 L148 48 Z" />
        <path fill="#dbe4ee" stroke="#9aabbd" strokeWidth="0.6" d="M228 40 L258 28 L264 31 L240 46 Z" />
        <path fill="#eef3f8" stroke="#9aabbd" strokeWidth="0.6" d="M230 44 L248 6 L262 10 L250 46 Z" />
        <path fill="#7c3aed" d="M236 38 L250 10 L256 12 L246 40 Z" />

        <path
          fill="url(#ef-jet-body)"
          stroke="#b6c3d1"
          strokeWidth="0.7"
          d="M18 46 C28 32 52 28 78 29 L210 30 C232 31 248 36 258 46 C248 56 232 61 210 62 L78 63 C52 64 28 60 18 46 Z"
        />
        <path fill="#c5d0dc" opacity="0.55" d="M40 50 C56 58 90 61 140 61 C190 61 230 56 250 48 C238 58 210 64 140 64 C80 64 50 59 40 50 Z" />

        <path fill="#16325c" d="M32 40 C40 34 52 32 62 33 L62 40 C52 39 42 40 32 44 Z" />
        <rect x="72" y="48" width="132" height="3.5" rx="1.6" fill="#7c3aed" />

        {Array.from({ length: 11 }, (_, i) => (
          <rect key={i} x={76 + i * 11} y="36" width="6.5" height="5.5" rx="1.4" fill="#1d4ed8" opacity="0.78" />
        ))}

        <path fill="url(#ef-jet-wing)" stroke="#8fa0b3" strokeWidth="0.6" d="M108 50 L198 78 L214 74 L154 48 Z" />
        <path d="M118 52 L200 76" stroke="rgba(255,255,255,0.45)" strokeWidth="1.1" />

        <ellipse cx="142" cy="70" rx="16" ry="8.5" fill="url(#ef-jet-engine)" stroke="#334155" strokeWidth="0.7" />
        <ellipse cx="128" cy="70" rx="5.2" ry="6.2" fill="#0b1220" />
        <ellipse cx="129.2" cy="69" rx="2.4" ry="3" fill="#64748b" opacity="0.45" />

        <ellipse cx="176" cy="66" rx="13" ry="7" fill="url(#ef-jet-engine)" stroke="#334155" strokeWidth="0.7" />
        <ellipse cx="165" cy="66" rx="4.4" ry="5.4" fill="#0b1220" />
      </svg>
    </div>
  );
}

export function EagleFlightArena({
  phase,
  roundOutcome,
  currentMultiplier,
  crashPoint,
}: EagleFlightArenaProps) {
  const inFlight = phase === "flying";
  const crashed = phase === "crashed" || roundOutcome === "lost";
  const won = phase === "finished" && roundOutcome === "won";

  return (
    <div className="eagle-flight-arena-wrap plinko-board-wrap">
      <div
        className={`eagle-flight-arena${inFlight ? " eagle-flight-arena-active" : ""}${crashed ? " eagle-flight-arena-crashed" : ""}${won ? " eagle-flight-arena-won" : ""}`}
      >
        <BackgroundVideo phase={phase} />

        <div className="eagle-flight-multiplier-display">
          <span className="eagle-flight-multiplier-value">
            {formatEagleFlightMultiplier(currentMultiplier)}
          </span>
        </div>

        <div
          className={`eagle-flight-eagle${inFlight ? " eagle-flight-eagle-flying" : ""}${crashed ? " eagle-flight-eagle-crashed" : ""}`}
        >
          <span className="eagle-flight-eagle-glow" aria-hidden />
          <div className="eagle-flight-trail" aria-hidden>
            <span className="eagle-flight-trail-mist" />
            <span className="eagle-flight-trail-core" />
            <span className="eagle-flight-trail-spark eagle-flight-trail-spark-1" />
            <span className="eagle-flight-trail-spark eagle-flight-trail-spark-2" />
            <span className="eagle-flight-trail-spark eagle-flight-trail-spark-3" />
            <span className="eagle-flight-trail-spark eagle-flight-trail-spark-4" />
          </div>
          <img src="/logo.png" alt="" aria-hidden className="eagle-flight-eagle-logo" />
        </div>

        {won && <MaxWinConfetti />}

        {crashed && (
          <>
            <PassengerJet />
            <div className="eagle-flight-impact-flash" aria-hidden />
            <div className="eagle-flight-crash-badge">
              <span>{formatEagleFlightMultiplier(crashPoint)}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
