"use client";

import { useEffect, useRef, useState } from "react";
import type { EagleFlightPhase } from "@/lib/casino/eagle-flight/types";

interface EagleFlightAmbientSpawnerProps {
  phase: EagleFlightPhase;
  helicopterChance: number;
  birdOpacity: number;
  inFlight: boolean;
}

type AmbientEntity = {
  id: number;
  kind: "helicopter" | "bird";
  top: string;
  fromLeft: boolean;
  duration: number;
  scale: number;
};

let entityId = 0;

export function EagleFlightAmbientSpawner({
  phase,
  helicopterChance,
  birdOpacity,
  inFlight,
}: EagleFlightAmbientSpawnerProps) {
  const [entities, setEntities] = useState<AmbientEntity[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chanceRef = useRef(helicopterChance);
  const birdRef = useRef(birdOpacity);

  useEffect(() => {
    chanceRef.current = helicopterChance;
    birdRef.current = birdOpacity;
  }, [helicopterChance, birdOpacity]);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (!inFlight || phase !== "flying") {
      setEntities([]);
      return;
    }

    timerRef.current = setInterval(() => {
      setEntities((prev) => {
        const next = prev.length > 4 ? prev.slice(-4) : [...prev];
        const roll = Math.random();

        if (roll < chanceRef.current * 0.04 && !next.some((e) => e.kind === "helicopter")) {
          next.push({
            id: ++entityId,
            kind: "helicopter",
            top: `${18 + Math.random() * 35}%`,
            fromLeft: Math.random() > 0.5,
            duration: 9 + Math.random() * 5,
            scale: 1,
          });
        } else if (roll < birdRef.current * 0.07 && next.filter((e) => e.kind === "bird").length < 3) {
          next.push({
            id: ++entityId,
            kind: "bird",
            top: `${12 + Math.random() * 55}%`,
            fromLeft: Math.random() > 0.5,
            duration: 6 + Math.random() * 4,
            scale: 0.65 + Math.random() * 0.35,
          });
        }

        return next.slice(-5);
      });
    }, 2200);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [inFlight, phase]);

  if (!inFlight) return null;

  return (
    <div className="eagle-flight-ambient-spawner" aria-hidden>
      {entities.map((entity) => (
        <span
          key={entity.id}
          className={`eagle-flight-ambient-entity eagle-flight-ambient-${entity.kind}${entity.fromLeft ? " eagle-flight-ambient-from-left" : " eagle-flight-ambient-from-right"}`}
          style={{
            top: entity.top,
            ["--ef-entity-duration" as string]: `${entity.duration}s`,
            ["--ef-entity-scale" as string]: String(entity.scale),
          }}
          onAnimationEnd={() => setEntities((prev) => prev.filter((e) => e.id !== entity.id))}
        />
      ))}
    </div>
  );
}
