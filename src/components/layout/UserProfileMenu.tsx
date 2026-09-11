"use client";

import Link from "next/link";
import { useState } from "react";
import {
  BarChart3,
  Sparkles,
  Settings,
  LogOut,
  Headphones,
  Trophy,
  Tv,
  ChevronRight,
  Users,
  DollarSign,
  X,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { getUserChannelPath } from "@/lib/channel/userChannel";
import { formatXp } from "@/lib/user/profileStats";
import { useProfileStats } from "@/lib/user/useProfileStats";
import { AvatarUploader } from "@/components/user/AvatarUploader";
import { RankOverviewModal } from "@/components/user/RankOverviewModal";
import { InboxMenu } from "@/components/layout/InboxMenu";
import type { PublicUser } from "@/lib/auth/types";

interface UserProfileMenuProps {
  user: PublicUser;
  onClose: () => void;
  onOpenTip: () => void;
}

export function UserProfileMenu({ user, onClose, onOpenTip }: UserProfileMenuProps) {
  const { t, locale } = useLanguage();
  const { logout } = useAuth();
  const stats = useProfileStats();
  const [rankModalOpen, setRankModalOpen] = useState(false);

  const openRankOverview = () => setRankModalOpen(true);

  const menuItems = [
    {
      icon: Tv,
      label: t("menuShowChannel"),
      href: getUserChannelPath(user),
    },
    {
      icon: BarChart3,
      label: t("menuCreatorDashboard"),
      href: "/dashboard",
    },
    {
      icon: Users,
      label: t("menuFriends"),
      href: "/friends",
    },
    {
      icon: DollarSign,
      label: t("menuTip"),
      action: "tip" as const,
    },
    {
      icon: Sparkles,
      label: t("menuSubscriptions"),
      href: "/browse",
    },
    {
      icon: Settings,
      label: t("menuSettings"),
      href: "/settings",
    },
  ];

  return (
    <div className="profile-dropdown">
      <div className="relative px-4 pt-4 pb-3">
        <div className="profile-inbox-mobile lg:hidden">
          <InboxMenu placement="profile" onNavigate={onClose} />
          <button
            type="button"
            className="profile-menu-close"
            onClick={onClose}
            aria-label={t("close")}
          >
            <X className="w-[18px] h-[18px]" strokeWidth={2.25} />
          </button>
        </div>

        <div className="flex items-start gap-3 profile-dropdown-identity">
          <AvatarUploader avatar={user.avatar} alt={user.username} />

          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-[15px] font-semibold text-white truncate leading-tight">{user.username}</p>
            <button
              type="button"
              onClick={openRankOverview}
              className="mt-1.5 inline-flex items-center gap-1 px-2 py-[3px] rounded-md border transition-colors hover:brightness-110"
              style={{
                borderColor: `${stats.rankColor}55`,
                backgroundColor: `${stats.rankColor}18`,
              }}
              aria-label={t("rankOverviewTap")}
            >
              <Trophy className="w-3 h-3 flex-shrink-0" style={{ color: stats.rankColor }} />
              <span
                className="text-[10px] font-bold tracking-wide uppercase"
                style={{ color: stats.rankColor }}
              >
                {stats.rankLabel}
              </span>
              <ChevronRight className="w-3 h-3 flex-shrink-0 opacity-60" style={{ color: stats.rankColor }} />
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={openRankOverview}
          className="mt-3.5 w-full text-left rounded-lg px-1 py-1 -mx-1 hover:bg-kick-hover/60 transition-colors group"
          aria-label={t("rankOverviewTap")}
        >
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="text-white/50 font-medium">{formatXp(stats.currentXp, locale)} XP</span>
            <span className="text-white/30 group-hover:text-white/45 transition-colors">
              {stats.isMaxRank ? "MAX" : `${formatXp(stats.targetXp, locale)} XP`}
            </span>
          </div>
          <div className="profile-trigger-track mt-0">
            <span className="profile-trigger-fill" style={{ width: `${stats.progress}%` }} />
            <span className="profile-trigger-dot" style={{ left: `${stats.progress}%` }} />
          </div>
          <p className="mt-1.5 text-[10px] text-white/30 group-hover:text-kick-green/80 transition-colors">
            {t("rankOverviewTap")} →
          </p>
        </button>
      </div>

      <RankOverviewModal
        open={rankModalOpen}
        onClose={() => setRankModalOpen(false)}
        currentXp={stats.currentXp}
      />

      <div className="h-px bg-kick-border" />

      <div className="grid grid-cols-2 gap-x-0 px-1 py-1.5">
        {menuItems.map((item) =>
          "action" in item && item.action === "tip" ? (
            <button
              key={item.label}
              type="button"
              onClick={onOpenTip}
              className="flex items-center gap-2.5 px-3 py-[10px] rounded-lg text-[13px] text-white/90 hover:bg-kick-hover transition-colors text-left"
            >
              <item.icon className="w-[17px] h-[17px] text-white/40 flex-shrink-0" strokeWidth={1.75} />
              <span>{item.label}</span>
            </button>
          ) : (
            <Link
              key={item.label}
              href={item.href}
              onClick={onClose}
              className="flex items-center gap-2.5 px-3 py-[10px] rounded-lg text-[13px] text-white/90 hover:bg-kick-hover transition-colors"
            >
              <item.icon className="w-[17px] h-[17px] text-white/40 flex-shrink-0" strokeWidth={1.75} />
              <span>{item.label}</span>
            </Link>
          ),
        )}
      </div>

      <div className="h-px bg-kick-border" />

      <div className="grid grid-cols-2 gap-x-0 px-1 py-1.5">
        <button
          type="button"
          onClick={() => {
            logout();
            onClose();
          }}
          className="flex items-center gap-2.5 px-3 py-[10px] rounded-lg text-[13px] text-white/65 hover:text-white hover:bg-kick-hover transition-colors text-left"
        >
          <LogOut className="w-[17px] h-[17px] text-white/40 flex-shrink-0" strokeWidth={1.75} />
          <span>{t("logout")}</span>
        </button>
        <button
          type="button"
          className="flex items-center gap-2.5 px-3 py-[10px] rounded-lg text-[13px] text-white/65 hover:text-white hover:bg-kick-hover transition-colors text-left"
        >
          <Headphones className="w-[17px] h-[17px] text-white/40 flex-shrink-0" strokeWidth={1.75} />
          <span>{t("menuLiveSupport")}</span>
        </button>
      </div>
    </div>
  );
}
