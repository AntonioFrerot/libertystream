"use client";

/** Couche sol : herbe, arbres, habitations (opacité pilotée par CSS vars). */
export function EagleFlightGroundLayer() {
  return (
    <div className="eagle-flight-ground-layer" aria-hidden>
      <div className="eagle-flight-ground-hills" />
      <div className="eagle-flight-ground-grass" />
      <div className="eagle-flight-ground-trees">
        <span className="eagle-flight-tree eagle-flight-tree-1" />
        <span className="eagle-flight-tree eagle-flight-tree-2" />
        <span className="eagle-flight-tree eagle-flight-tree-3" />
        <span className="eagle-flight-tree eagle-flight-tree-4" />
        <span className="eagle-flight-tree eagle-flight-tree-5" />
      </div>
      <div className="eagle-flight-ground-buildings">
        <span className="eagle-flight-house eagle-flight-house-1" />
        <span className="eagle-flight-house eagle-flight-house-2" />
        <span className="eagle-flight-house eagle-flight-house-3" />
        <span className="eagle-flight-house eagle-flight-house-4" />
      </div>
    </div>
  );
}

/** Étoiles + voile atmosphérique + Terre lointaine. */
export function EagleFlightSpaceLayer({ meteorOpacity = 0 }: { meteorOpacity?: number }) {
  return (
    <>
      <div className="eagle-flight-stars" aria-hidden>
        {Array.from({ length: 48 }, (_, i) => (
          <span
            key={i}
            className="eagle-flight-star"
            style={{
              top: `${((i * 17 + 7) % 94) + 2}%`,
              left: `${((i * 23 + 11) % 96) + 2}%`,
              ["--ef-star-size" as string]: `${1 + (i % 3)}px`,
              animationDelay: `${(i % 12) * 0.35}s`,
            }}
          />
        ))}
      </div>
      <div className="eagle-flight-atmo-veil" aria-hidden />
      <div className="eagle-flight-atmo-fog" aria-hidden />
      <div className="eagle-flight-earth" aria-hidden>
        <div className="eagle-flight-earth-surface" />
        <div className="eagle-flight-earth-glow" />
      </div>
      <div className="eagle-flight-space-particles" aria-hidden>
        {Array.from({ length: 12 }, (_, i) => (
          <span
            key={i}
            className="eagle-flight-space-particle"
            style={{
              top: `${((i * 29 + 5) % 90) + 5}%`,
              left: `${((i * 31 + 9) % 92) + 4}%`,
              animationDelay: `${i * 0.6}s`,
            }}
          />
        ))}
      </div>
      {meteorOpacity > 0.02 && (
        <div className="eagle-flight-meteors" style={{ opacity: meteorOpacity }} aria-hidden>
          <span className="eagle-flight-meteor eagle-flight-meteor-1" />
          <span className="eagle-flight-meteor eagle-flight-meteor-2" />
          <span className="eagle-flight-meteor eagle-flight-meteor-3" />
        </div>
      )}
    </>
  );
}
