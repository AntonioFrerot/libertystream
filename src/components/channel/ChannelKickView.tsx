"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  Pencil,
  Share2,
  UserPlus,
  FileSearch,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useToast } from "@/components/ui/Toast";
import { useRequireAuth } from "@/components/providers/AuthProvider";
import { useAppUI } from "@/components/providers/AppUIProvider";
import { isOwnChannel } from "@/lib/channel/userChannel";
import type { Streamer } from "@/lib/data";

type ChannelTab = "home" | "about" | "videos" | "clips";

interface ChannelKickViewProps {
  streamer: Streamer;
}

export function ChannelKickView({ streamer }: ChannelKickViewProps) {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { user, follow, isFollowing, requireAuth } = useRequireAuth();
  const { openAuth } = useAppUI();
  const [tab, setTab] = useState<ChannelTab>("home");
  const ownChannel = isOwnChannel(user, streamer.username);
  const following = isFollowing(streamer.username);

  const tabs: { id: ChannelTab; label: string }[] = [
    { id: "home", label: t("channelTabHome") },
    { id: "about", label: t("channelTabAbout") },
    { id: "videos", label: t("channelTabVideos") },
    { id: "clips", label: t("channelTabClips") },
  ];

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

  return (
    <div className="flex flex-col min-w-0 bg-kick-bg">
      {/* Bannière style Kick — damier + hors ligne */}
      <div className="relative w-full aspect-[5/1] min-h-[120px] max-h-[220px] overflow-hidden bg-kick-bg">
        <div
          className="absolute inset-0 opacity-90"
          style={{
            backgroundImage: `
              linear-gradient(45deg, #1a3d2e 25%, transparent 25%),
              linear-gradient(-45deg, #1a3d2e 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, #1a3d2e 75%),
              linear-gradient(-45deg, transparent 75%, #1a3d2e 75%),
              linear-gradient(45deg, #0d9488 25%, transparent 25%),
              linear-gradient(-45deg, #0d9488 25%, transparent 25%)
            `,
            backgroundSize: "24px 24px",
            backgroundPosition: "0 0, 0 12px, 12px -12px, -12px 0, 12px 0, 0 12px",
          }}
        />
        <Image src={streamer.banner} alt="" fill className="object-cover mix-blend-overlay opacity-40" priority />

        {ownChannel && (
          <Link
            href="/settings/stream"
            className="absolute top-3 right-3 p-2 rounded-md bg-black/50 border border-white/10 hover:bg-black/70 transition-colors"
            aria-label={t("channelEditBanner")}
          >
            <Pencil className="w-4 h-4 text-white/80" />
          </Link>
        )}

        <div className="absolute inset-0 flex items-center justify-center px-4">
          <div className="flex items-center gap-3 px-5 py-3 rounded-lg bg-black/55 border border-white/10 backdrop-blur-sm">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-white/10 text-white/90 tracking-wide">
              {t("offline").toUpperCase()}
            </span>
            <span className="text-sm font-medium text-white/90">
              {t("channelOfflineMsg", { name: streamer.displayName })}
            </span>
          </div>
        </div>
      </div>

      {/* Profil sous bannière */}
      <div className="px-4 lg:px-6 py-4 border-b border-kick-border bg-kick-surface">
        <div className="flex items-center gap-4">
          <Image
            src={streamer.avatar}
            alt={streamer.displayName}
            width={56}
            height={56}
            unoptimized={streamer.avatar.startsWith("data:")}
            className="rounded-full border-2 border-kick-border flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h1 className="font-display font-bold text-lg text-white truncate">{streamer.displayName}</h1>
            <p className="text-sm text-white/45 mt-0.5">
              {t("channelFollowerCount", { count: String(streamer.followers) })}
            </p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              type="button"
              onClick={handleShare}
              className="p-2.5 rounded-lg hover:bg-kick-hover text-white/50 hover:text-white transition-colors"
              aria-label={t("share")}
            >
              <Share2 className="w-5 h-5" />
            </button>
            {!ownChannel && (
              <button
                type="button"
                onClick={handleFollow}
                className={`p-2.5 rounded-lg transition-colors ${
                  following ? "text-kick-green bg-kick-green/10" : "text-white/50 hover:text-white hover:bg-kick-hover"
                }`}
                aria-label={t("follow")}
              >
                <UserPlus className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="border-b border-kick-border bg-kick-surface px-4 lg:px-6">
        <div className="flex gap-6 overflow-x-auto scrollbar-hide">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`relative py-3.5 text-sm font-semibold whitespace-nowrap transition-colors ${
                tab === item.id ? "text-kick-green" : "text-white/45 hover:text-white/70"
              }`}
            >
              {item.label}
              {tab === item.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-kick-green rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu onglet */}
      <div className="flex-1 px-4 lg:px-6 py-16">
        {tab === "home" && (
          <div className="flex flex-col items-center justify-center text-center max-w-sm mx-auto">
            <div className="w-16 h-16 rounded-xl bg-kick-hover border border-kick-border flex items-center justify-center mb-4">
              <FileSearch className="w-8 h-8 text-white/25" />
            </div>
            <p className="font-semibold text-white/80 mb-1">{t("channelNoContent")}</p>
            <p className="text-sm text-white/40">{t("channelNoContentDesc")}</p>
          </div>
        )}
        {tab === "about" && (
          <p className="text-sm text-white/50 max-w-xl">{streamer.title}</p>
        )}
        {(tab === "videos" || tab === "clips") && (
          <div className="flex flex-col items-center justify-center text-center py-8">
            <p className="text-sm text-white/40">{t("channelNoContent")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
