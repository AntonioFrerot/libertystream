import { getRankInfo, type RankId } from "@/lib/user/ranks";

export interface UserProfileStats {
  rankId: RankId;
  rankTier: 0 | 1 | 2 | 3;
  rankLabel: string;
  progress: number;
  currentXp: number;
  targetXp: number;
  isMaxRank: boolean;
}

export function getUserProfileStats(xp: number): UserProfileStats {
  const rank = getRankInfo(xp);

  return {
    rankId: rank.id,
    rankTier: rank.tier,
    rankLabel: rank.label,
    progress: rank.progress,
    currentXp: rank.currentXp,
    targetXp: rank.nextThreshold ?? rank.currentThreshold,
    isMaxRank: rank.isMax,
  };
}

export function formatXp(value: number, locale = "fr-FR") {
  if (value >= 1_000_000) {
    const compact = value / 1_000_000;
    const formatted = new Intl.NumberFormat(locale === "en" ? "en-US" : "fr-FR", {
      maximumFractionDigits: compact >= 100 ? 0 : 1,
    }).format(compact);
    return `${formatted.replace(/[\u202f\u00a0]/g, ",")}M`;
  }
  if (value >= 1_000) {
    const compact = value / 1_000;
    const formatted = new Intl.NumberFormat(locale === "en" ? "en-US" : "fr-FR", {
      maximumFractionDigits: compact >= 100 ? 0 : 1,
    }).format(compact);
    return `${formatted.replace(/[\u202f\u00a0]/g, ",")}K`;
  }
  return value.toLocaleString(locale === "en" ? "en-US" : "fr-FR").replace(/[\u202f\u00a0]/g, ",");
}
