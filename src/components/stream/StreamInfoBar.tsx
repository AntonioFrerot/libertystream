"use client";

import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { BadgeCheck, Crown, DollarSign, Heart, Star, Users, Share2, Settings } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { useLanguage, getCategoryLabel } from "@/lib/i18n/LanguageProvider";
import { useToast } from "@/components/ui/Toast";
import { useRequireAuth } from "@/components/providers/AuthProvider";
import { useAppUI } from "@/components/providers/AppUIProvider";
import { isOwnChannel } from "@/lib/channel/userChannel";
import { TipModal } from "@/components/modals/TipModal";
import { SubscribeModal } from "@/components/modals/SubscribeModal";
import { GiftSubModal, GiftSubButton } from "@/components/modals/GiftSubModal";
import type { Streamer } from "@/lib/data";

export function StreamInfoBar({ streamer }: { streamer: Streamer }) {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { user, follow, isFollowing, isSubscribed, requireAuth } = useRequireAuth();
  const { openAuth } = useAppUI();
  const [subOpen, setSubOpen] = useState(false);
  const [giftSubOpen, setGiftSubOpen] = useState(false);
  const [tipOpen, setTipOpen] = useState(false);

  const following = isFollowing(streamer.username);
  const subscribed = isSubscribed(streamer.username);
  const ownChannel = isOwnChannel(user, streamer.username);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast(t("linkCopied"));
    } catch {
      showToast(t("linkCopyFail"));
    }
  };

  const handleFollow = () => {
    requireAuth(() => {
      const wasFollowing = following;
      follow(streamer.username);
      showToast(
        wasFollowing
          ? t("unfollowSuccess", { name: streamer.displayName })
          : t("followSuccess", { name: streamer.displayName })
      );
    }, () => openAuth("login"));
  };

  const handleSubscribe = () => {
    requireAuth(() => setSubOpen(true), () => openAuth("login"));
  };

  const handleGiftSub = () => {
    requireAuth(() => setGiftSubOpen(true), () => openAuth("login"));
  };

  const handleTip = () => {
    requireAuth(() => setTipOpen(true), () => openAuth("login"));
  };

  return (
    <>
      <div className="px-4 lg:px-6 py-4 border-b border-glass-border bg-void-100/80">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <div className={`rounded-full p-0.5 ${streamer.isLive ? "bg-gradient-to-br from-neon-cyan to-neon-purple" : "bg-glass-border"}`}>
                <Image src={streamer.avatar} alt={streamer.displayName} width={64} height={64} className="rounded-full border-2 border-void-100" />
              </div>
              {streamer.isLive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-red-600 text-white whitespace-nowrap">{t("live")}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display font-bold text-lg">{streamer.displayName}</h1>
                {streamer.verified && <BadgeCheck className="w-5 h-5 text-neon-cyan flex-shrink-0" />}
                {streamer.vip && <Crown className="w-4 h-4 text-neon-gold flex-shrink-0" />}
              </div>
              <p className="text-sm text-white/80 mt-1 leading-snug">{streamer.title}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="px-2.5 py-1 rounded-md bg-neon-cyan/10 border border-neon-cyan/20 text-xs font-medium text-neon-cyan">{getCategoryLabel(t, streamer.category)}</span>
                {streamer.tags.map((tag) => (
                  <span key={tag} className="px-2.5 py-1 rounded-md bg-glass border border-glass-border text-xs text-white/60">{tag}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="stream-info-actions flex flex-col gap-2 flex-shrink-0 w-full sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:w-auto sm:gap-2">
            {ownChannel ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-kick-green text-white text-sm font-semibold hover:bg-kick-green-dim transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  {t("menuCreatorDashboard")}
                </Link>
              </>
            ) : (
              <>
                <div className="stream-info-actions-primary flex gap-2 w-full sm:contents">
                  <button
                    type="button"
                    onClick={handleFollow}
                    className={`flex items-center gap-2 px-3 sm:px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors flex-1 sm:flex-none justify-center min-w-0 sm:min-w-0 ${
                      following ? "bg-glass border border-glass-border text-white/60" : "bg-kick-green text-white hover:bg-kick-green/90"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${following ? "fill-current" : ""}`} />
                    <span className="truncate">{following ? t("alreadyFollowing") : t("follow")}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSubscribe}
                    className={`flex items-center gap-2 px-3 sm:px-5 py-2.5 rounded-lg border text-sm font-semibold transition-colors flex-1 sm:flex-none justify-center min-w-0 sm:min-w-0 ${
                      subscribed ? "bg-kick-green/10 border-kick-green/30 text-kick-green" : "bg-kick-bg border-kick-border hover:border-white/20"
                    }`}
                  >
                    <Star className={`w-4 h-4 ${subscribed ? "fill-neon-cyan" : ""}`} />
                    <span className="truncate">{subscribed ? t("alreadySubscribed") : t("subscribeShort")}</span>
                  </button>
                </div>
                <div className="stream-info-actions-secondary flex gap-2 w-full sm:contents">
                  <GiftSubButton onClick={handleGiftSub} className="stream-info-gift-btn flex-1 sm:flex-none !px-3 sm:!px-4" />
                  <button
                    type="button"
                    onClick={handleTip}
                    className="stream-info-tip-btn flex items-center gap-2 flex-1 sm:flex-none justify-center px-3 sm:px-4 py-2.5 rounded-lg bg-void-200 border border-neon-gold/30 text-neon-gold text-sm font-semibold hover:border-neon-gold/50 transition-colors"
                    aria-label={t("sendTip")}
                  >
                    <DollarSign className="w-4 h-4 stream-info-tip-icon" />
                    <span>{t("sendTip")}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 mt-3 pt-3 border-t border-glass-border/50">
          {streamer.isLive && (
            <div className="flex items-center gap-1.5 text-sm text-white/50 mr-auto">
              <Users className="w-4 h-4" />
              <span>{formatNumber(streamer.viewers)} {t("spectators")}</span>
            </div>
          )}
          {user && (
            <span className="text-xs text-neon-cyan/60 hidden sm:inline">Connecté : {user.username}</span>
          )}
          <span className="text-xs text-white/30 hidden sm:inline">{formatNumber(streamer.followers)} {t("followers")}</span>
          <button type="button" onClick={handleShare} className="p-2 rounded-lg hover:bg-glass-hover transition-colors text-white/50 hover:text-white">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <TipModal open={tipOpen} onClose={() => setTipOpen(false)} streamerName={streamer.displayName} streamerUsername={streamer.username} />
      <SubscribeModal open={subOpen} onClose={() => setSubOpen(false)} streamerName={streamer.displayName} streamerUsername={streamer.username} />
      <GiftSubModal open={giftSubOpen} onClose={() => setGiftSubOpen(false)} streamerName={streamer.displayName} streamerUsername={streamer.username} />
    </>
  );
}
