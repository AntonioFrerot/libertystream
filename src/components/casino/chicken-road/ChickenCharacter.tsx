export function ChickenCharacter({ className }: { className?: string }) {
  return (
    <svg
      className={className ? `cr2-chicken-svg ${className}` : "cr2-chicken-svg"}
      viewBox="0 0 88 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* Ombre */}
      <ellipse cx="44" cy="92" rx="24" ry="4" fill="rgba(0,0,0,0.14)" />

      {/* Pattes */}
      <g stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M30 86 L26 92" />
        <path d="M34 86 L32 94" />
        <path d="M36 86 L38 94" />
        <path d="M40 86 L44 92" />
      </g>
      <path
        d="M26 86 C26 84 30 83 34 84 C36 83 38 83 40 84 C42 83 44 84 44 86"
        fill="#ffb300"
        stroke="#1a1a1a"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Corps */}
      <circle cx="42" cy="56" r="30" fill="#f5f5f5" stroke="#1a1a1a" strokeWidth="2.5" />
      <ellipse cx="42" cy="62" rx="24" ry="20" fill="#e6e6e6" />
      <circle cx="42" cy="54" r="30" fill="#fff" stroke="#1a1a1a" strokeWidth="2.5" />

      {/* Aile */}
      <path
        d="M18 54 C14 58 13 66 16 72 C20 68 22 62 24 56"
        fill="#fff"
        stroke="#1a1a1a"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />

      {/* Queue */}
      <path
        d="M14 48 C10 42 8 36 12 32 C16 36 16 42 18 46"
        fill="#fff"
        stroke="#1a1a1a"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />

      {/* Crête */}
      <g className="cr-chicken-comb">
        <path
          d="M34 28 C36 18 40 16 42 22 C44 14 48 14 50 22 C52 16 56 18 54 28"
          fill="#ef4444"
          stroke="#1a1a1a"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
      </g>

      {/* Joues */}
      <ellipse cx="36" cy="52" rx="5" ry="3.2" fill="#ffb3ba" opacity="0.75" />
      <ellipse cx="58" cy="54" rx="5" ry="3.2" fill="#ffb3ba" opacity="0.75" />

      {/* Yeux */}
      <g className="cr-chicken-eye">
        <circle cx="36" cy="42" r="11" fill="#fffef0" stroke="#1a1a1a" strokeWidth="2.2" />
        <circle cx="38" cy="44" r="2.8" fill="#1a1a1a" />
      </g>
      <g className="cr-chicken-eye">
        <circle cx="54" cy="40" r="13" fill="#fffef0" stroke="#1a1a1a" strokeWidth="2.2" />
        <circle cx="56" cy="43" r="3.2" fill="#1a1a1a" />
      </g>

      {/* Bec */}
      <path
        d="M62 46 C70 48 70 54 62 56 C64 52 64 50 62 46 Z"
        fill="#ffb300"
        stroke="#1a1a1a"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path d="M62 50 L68 52 L62 54" fill="#ff8f00" stroke="#1a1a1a" strokeWidth="1.2" />

      {/* Barbillon */}
      <path
        d="M58 58 C56 64 60 68 62 64 C64 68 68 64 66 58 C64 56 60 56 58 58 Z"
        fill="#ef4444"
        stroke="#1a1a1a"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChickenSquashed({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* Corps aplati — remplit la bouche d&apos;égout */}
      <circle cx="50" cy="50" r="46" fill="#fff8ef" stroke="#1a1a1a" strokeWidth="2.4" />
      <circle cx="50" cy="52" r="42" fill="#fff" stroke="#1a1a1a" strokeWidth="1.8" />
      <ellipse cx="50" cy="54" rx="38" ry="36" fill="#f3f3f3" />

      {/* Ailes écrasées */}
      <ellipse cx="22" cy="50" rx="11" ry="18" fill="#ececec" stroke="#1a1a1a" strokeWidth="1.6" />
      <ellipse cx="78" cy="50" rx="11" ry="18" fill="#ececec" stroke="#1a1a1a" strokeWidth="1.6" />

      {/* Crête éclatée */}
      <path
        d="M28 24 C34 16 42 14 50 18 C58 12 68 16 72 26 C66 22 58 20 50 22 C42 20 34 22 28 24 Z"
        fill="#ef4444"
        stroke="#1a1a1a"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M36 20 L38 14 L40 20 M46 18 L50 12 L54 18 M58 20 L62 14 L64 20"
        stroke="#b91c1c"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Yeux face caméra */}
      <circle cx="38" cy="44" r="9" fill="#fffef0" stroke="#1a1a1a" strokeWidth="2" />
      <circle cx="62" cy="44" r="9" fill="#fffef0" stroke="#1a1a1a" strokeWidth="2" />
      <circle cx="38" cy="45" r="3.2" fill="#1a1a1a" />
      <circle cx="62" cy="45" r="3.2" fill="#1a1a1a" />
      <circle cx="36.5" cy="43" r="1.1" fill="#fff" />
      <circle cx="60.5" cy="43" r="1.1" fill="#fff" />

      {/* Bec écrasé */}
      <path
        d="M66 52 C74 50 76 56 68 58 C72 56 72 54 66 52 Z"
        fill="#ffb300"
        stroke="#1a1a1a"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />

      {/* Barbillon */}
      <ellipse cx="58" cy="62" rx="6" ry="4" fill="#ef4444" stroke="#1a1a1a" strokeWidth="1.4" />

      {/* Pattes qui dépassent */}
      <path
        d="M24 72 L18 82 M30 74 L28 86 M70 74 L72 86 M76 72 L82 82"
        stroke="#ffb300"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M18 82 L14 84 M28 86 L26 90 M72 86 L74 90 M82 82 L86 84"
        stroke="#1a1a1a"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Éclaboussure / impact */}
      <ellipse cx="50" cy="50" rx="44" ry="44" fill="url(#cr2-squash-sheen)" opacity="0.35" />
      <defs>
        <radialGradient id="cr2-squash-sheen" cx="0.35" cy="0.3" r="0.75">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}
