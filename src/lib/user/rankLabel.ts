import type { RankId } from "@/lib/user/ranks";
import type { TranslationKey } from "@/lib/i18n/translations";

const ROMAN = ["", "I", "II", "III"] as const;

const RANK_KEYS: Record<Exclude<RankId, "unranked">, TranslationKey> = {
  bronze: "rankBronze",
  silver: "rankSilver",
  gold: "rankGold",
  platinum: "rankPlatinum",
  diamond: "rankDiamond",
  master: "rankMaster",
  immortal: "rankImmortal",
};

export function getLocalizedRankLabel(
  rankId: RankId,
  tier: 0 | 1 | 2 | 3,
  t: (key: TranslationKey) => string
): string {
  if (rankId === "unranked") return t("rankUnranked");
  return `${t(RANK_KEYS[rankId])} ${ROMAN[tier]}`;
}
