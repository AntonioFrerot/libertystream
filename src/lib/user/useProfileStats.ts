"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useWallet } from "@/components/providers/WalletProvider";
import { getLocalizedRankLabel } from "@/lib/user/rankLabel";
import { getRankColor } from "@/lib/user/ranks";
import { getUserProfileStats } from "@/lib/user/profileStats";

export function useProfileStats() {
  const { xp } = useWallet();
  const { t } = useLanguage();
  const stats = getUserProfileStats(xp);

  return {
    ...stats,
    rankLabel: getLocalizedRankLabel(stats.rankId, stats.rankTier, t),
    rankColor: getRankColor(stats.rankId),
  };
}
