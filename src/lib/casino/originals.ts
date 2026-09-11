export type OriginalGameId =
  | "plinko"
  | "blackjack"
  | "wheel"
  | "hilo"
  | "chicken-road"
  | "mines"
  | "flip"
  | "eagle-flight";

export interface OriginalGame {
  id: OriginalGameId;
  labelKey:
    | "originalPlinko"
    | "originalBlackjack"
    | "originalWheel"
    | "originalHilo"
    | "originalChickenRoad"
    | "originalMines"
    | "originalFlip"
    | "originalEagleFlight";
  gradient: string;
  glow: string;
  icon: string;
}

export const ORIGINAL_GAMES: OriginalGame[] = [
  {
    id: "plinko",
    labelKey: "originalPlinko",
    gradient: "from-[#1a4fd6] via-[#2563eb] to-[#1e3a8a]",
    glow: "rgba(37, 99, 235, 0.45)",
    icon: "🎯",
  },
  {
    id: "blackjack",
    labelKey: "originalBlackjack",
    gradient: "from-[#0e7490] via-[#0891b2] to-[#164e63]",
    glow: "rgba(8, 145, 178, 0.45)",
    icon: "🃏",
  },
  {
    id: "wheel",
    labelKey: "originalWheel",
    gradient: "from-[#6d28d9] via-[#7c3aed] to-[#4c1d95]",
    glow: "rgba(124, 58, 237, 0.45)",
    icon: "🎡",
  },
  {
    id: "hilo",
    labelKey: "originalHilo",
    gradient: "from-[#b91c1c] via-[#dc2626] to-[#7f1d1d]",
    glow: "rgba(220, 38, 38, 0.45)",
    icon: "📈",
  },
  {
    id: "chicken-road",
    labelKey: "originalChickenRoad",
    gradient: "from-[#ca8a04] via-[#eab308] to-[#047857]",
    glow: "rgba(234, 179, 8, 0.45)",
    icon: "🐔",
  },
  {
    id: "mines",
    labelKey: "originalMines",
    gradient: "from-[#15803d] via-[#22c55e] to-[#14532d]",
    glow: "rgba(34, 197, 94, 0.45)",
    icon: "💣",
  },
  {
    id: "flip",
    labelKey: "originalFlip",
    gradient: "from-[#db2777] via-[#ec4899] to-[#9d174d]",
    glow: "rgba(236, 72, 153, 0.45)",
    icon: "🪙",
  },
  {
    id: "eagle-flight",
    labelKey: "originalEagleFlight",
    gradient: "from-[#0369a1] via-[#0ea5e9] to-[#7dd3fc]",
    glow: "rgba(14, 165, 233, 0.45)",
    icon: "🦅",
  },
];

/** 8 jeux solo LibertyStream */
export const SOLO_GAMES: OriginalGame[] = ORIGINAL_GAMES;

/** Jeux multijoueur (Flip pour l'instant) */
export const MULTI_GAMES: OriginalGame[] = ORIGINAL_GAMES.filter((g) => g.id === "flip");

export function getOriginalGame(id: string): OriginalGame | undefined {
  return ORIGINAL_GAMES.find((g) => g.id === id);
}
