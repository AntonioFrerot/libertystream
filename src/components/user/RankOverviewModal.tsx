"use client";

import { Check, Lock, Trophy } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { formatXp } from "@/lib/user/profileStats";
import { getLocalizedRankLabel } from "@/lib/user/rankLabel";
import {
  RANK_TIERS,
  XP_PER_LIBERTY_WAGER,
  getRankColor,
  getRankInfo,
} from "@/lib/user/ranks";

interface RankOverviewModalProps {
  open: boolean;
  onClose: () => void;
  currentXp: number;
}

export function RankOverviewModal({ open, onClose, currentXp }: RankOverviewModalProps) {
  const { t, locale } = useLanguage();
  const current = getRankInfo(currentXp);
  const currentIndex = RANK_TIERS.findIndex(
    (tier) => tier.id === current.id && tier.tier === current.tier
  );
  const nextTier = RANK_TIERS[currentIndex + 1] ?? null;

  return (
    <Modal open={open} onClose={onClose} title={t("rankOverviewTitle")}>
      <div className="space-y-4">
        <p className="text-sm text-white/55 leading-relaxed">{t("rankOverviewDesc")}</p>

        <div className="rounded-xl border border-kick-border bg-kick-bg/80 px-3 py-2.5">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="text-white/45">{t("rankOverviewYourXp")}</span>
            <span className="font-bold tabular-nums text-kick-green">
              {formatXp(currentXp, locale)} XP
            </span>
          </div>
          {nextTier && (
            <p className="mt-1.5 text-[11px] text-white/40">
              {t("rankOverviewNextRank", {
                xp: formatXp(nextTier.xpRequired - currentXp, locale),
                rank: getLocalizedRankLabel(nextTier.id, nextTier.tier, t),
              })}
            </p>
          )}
        </div>

        <ul className="rank-overview-list max-h-[min(52dvh,420px)] overflow-y-auto -mx-1 px-1 space-y-1.5">
          {RANK_TIERS.map((tier, index) => {
            const isCurrent = tier.id === current.id && tier.tier === current.tier;
            const isUnlocked = currentXp >= tier.xpRequired;
            const color = getRankColor(tier.id);
            const label = getLocalizedRankLabel(tier.id, tier.tier, t);

            return (
              <li
                key={`${tier.id}-${tier.tier}-${index}`}
                className={`rank-overview-item ${isCurrent ? "rank-overview-item-current" : ""} ${isUnlocked ? "rank-overview-item-unlocked" : ""}`}
                style={
                  isCurrent
                    ? {
                        borderColor: `${color}66`,
                        backgroundColor: `${color}14`,
                      }
                    : undefined
                }
              >
                <span
                  className="rank-overview-item-icon"
                  style={{
                    color,
                    backgroundColor: `${color}22`,
                    borderColor: `${color}44`,
                  }}
                >
                  {isUnlocked ? (
                    isCurrent ? (
                      <Trophy className="w-3.5 h-3.5" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )
                  ) : (
                    <Lock className="w-3 h-3 opacity-70" />
                  )}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-semibold truncate ${!isUnlocked ? "text-white/55" : ""}`}
                      style={isUnlocked ? { color } : undefined}
                    >
                      {label}
                    </span>
                    {isCurrent && (
                      <span
                        className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded"
                        style={{ color, backgroundColor: `${color}22` }}
                      >
                        {t("rankOverviewCurrent")}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-white/40 mt-0.5">
                    {tier.xpRequired === 0
                      ? t("rankOverviewStart")
                      : t("rankOverviewXpRequired", { xp: formatXp(tier.xpRequired, locale) })}
                  </p>
                </div>

                {!isUnlocked && tier.xpRequired > 0 && (
                  <span className="text-[10px] font-semibold text-white/30 tabular-nums flex-shrink-0">
                    +{formatXp(tier.xpRequired - currentXp, locale)}
                  </span>
                )}
              </li>
            );
          })}
        </ul>

        <p className="text-[11px] text-white/35 leading-relaxed border-t border-kick-border pt-3">
          {t("rankOverviewHint", { rate: String(XP_PER_LIBERTY_WAGER) })}
        </p>
      </div>
    </Modal>
  );
}
