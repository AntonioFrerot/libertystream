export type RankId =
  | "unranked"
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"
  | "diamond"
  | "master"
  | "immortal";

export interface RankTierDefinition {
  id: RankId;
  tier: 0 | 1 | 2 | 3;
  xpRequired: number;
}

/** Paliers VIP Gamba — Unranked puis Bronze I → Immortal III */
export const RANK_TIERS: RankTierDefinition[] = [
  { id: "unranked", tier: 0, xpRequired: 0 },
  { id: "bronze", tier: 1, xpRequired: 5_000 },
  { id: "bronze", tier: 2, xpRequired: 10_000 },
  { id: "bronze", tier: 3, xpRequired: 15_000 },
  { id: "silver", tier: 1, xpRequired: 20_000 },
  { id: "silver", tier: 2, xpRequired: 35_000 },
  { id: "silver", tier: 3, xpRequired: 50_000 },
  { id: "gold", tier: 1, xpRequired: 75_000 },
  { id: "gold", tier: 2, xpRequired: 100_000 },
  { id: "gold", tier: 3, xpRequired: 150_000 },
  { id: "platinum", tier: 1, xpRequired: 200_000 },
  { id: "platinum", tier: 2, xpRequired: 300_000 },
  { id: "platinum", tier: 3, xpRequired: 500_000 },
  { id: "diamond", tier: 1, xpRequired: 1_000_000 },
  { id: "diamond", tier: 2, xpRequired: 2_500_000 },
  { id: "diamond", tier: 3, xpRequired: 5_000_000 },
  { id: "master", tier: 1, xpRequired: 10_000_000 },
  { id: "master", tier: 2, xpRequired: 25_000_000 },
  { id: "master", tier: 3, xpRequired: 50_000_000 },
  { id: "immortal", tier: 1, xpRequired: 100_000_000 },
  { id: "immortal", tier: 2, xpRequired: 250_000_000 },
  { id: "immortal", tier: 3, xpRequired: 500_000_000 },
];

const ROMAN = ["", "I", "II", "III"] as const;

export function formatRankTier(id: RankId, tier: 0 | 1 | 2 | 3): string {
  if (id === "unranked") return "Unranked";
  const name = id.charAt(0).toUpperCase() + id.slice(1);
  return `${name} ${ROMAN[tier]}`;
}

export interface RankInfo {
  id: RankId;
  tier: 0 | 1 | 2 | 3;
  label: string;
  currentXp: number;
  currentThreshold: number;
  nextThreshold: number | null;
  progress: number;
  isMax: boolean;
}

export function getRankInfo(xp: number): RankInfo {
  let current = RANK_TIERS[0];
  for (const tier of RANK_TIERS) {
    if (xp >= tier.xpRequired) current = tier;
    else break;
  }

  const currentIndex = RANK_TIERS.indexOf(current);
  const next = RANK_TIERS[currentIndex + 1] ?? null;
  const isMax = !next;

  let progress = 100;
  if (next) {
    const span = next.xpRequired - current.xpRequired;
    progress = span > 0 ? Math.min(100, Math.max(0, ((xp - current.xpRequired) / span) * 100)) : 0;
  }

  return {
    id: current.id,
    tier: current.tier,
    label: formatRankTier(current.id, current.tier),
    currentXp: xp,
    currentThreshold: current.xpRequired,
    nextThreshold: next?.xpRequired ?? null,
    progress,
    isMax,
  };
}

export function getRankColor(id: RankId): string {
  switch (id) {
    case "unranked":
      return "#9ca3af";
    case "bronze":
      return "#cd7f32";
    case "silver":
      return "#c0c0c0";
    case "gold":
      return "#ffd033";
    case "platinum":
      return "#67e8f9";
    case "diamond":
      return "#93c5fd";
    case "master":
      return "#b57bff";
    case "immortal":
      return "#f472b6";
    default:
      return "#b57bff";
  }
}

/** 1 jeton Liberty misé = 1 XP (comme le casino Gamba) */
export const XP_PER_LIBERTY_WAGER = 1;

export function xpStorageKey(userId: string) {
  return `libertystream-xp-${userId}`;
}
