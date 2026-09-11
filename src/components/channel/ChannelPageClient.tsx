"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/home/Sidebar";
import { StreamPageClient } from "@/components/stream/StreamPageClient";
import { getCategoryById } from "@/lib/data";
import { loadStoredUsers } from "@/lib/auth/userStore";
import { streamerFromUser } from "@/lib/channel/userChannel";
import type { Streamer } from "@/lib/data";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

function resolveUserChannel(slug: string): Streamer | undefined {
  const user = loadStoredUsers().find((u) => u.channelSlug === slug);
  return user ? streamerFromUser(user) : undefined;
}

function ChannelNotFound({ slug }: { slug: string }) {
  const { t } = useLanguage();
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      <Sidebar />
      <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-kick-bg px-4 text-center">
        <p className="text-5xl">📺</p>
        <h1 className="font-display text-xl font-bold text-white">Chaîne introuvable</h1>
        <p className="text-sm text-white/50 max-w-md">
          Aucune chaîne <span className="text-kick-green font-medium">/{slug}</span> n&apos;existe sur LibertyPlace.
        </p>
        <Link href="/" className="btn-kick px-5 py-2 text-sm">
          {t("home")}
        </Link>
      </div>
    </div>
  );
}

export function ChannelPageClient({ slug }: { slug: string }) {
  const [streamer, setStreamer] = useState<Streamer | null | undefined>(undefined);

  useEffect(() => {
    setStreamer(resolveUserChannel(slug.toLowerCase()) ?? null);
  }, [slug]);

  useEffect(() => {
    const refresh = () => setStreamer(resolveUserChannel(slug.toLowerCase()) ?? null);
    window.addEventListener("libertystream-profile-updated", refresh);
    return () => window.removeEventListener("libertystream-profile-updated", refresh);
  }, [slug]);

  if (streamer === undefined) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)]">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center bg-kick-bg">
          <div className="w-8 h-8 rounded-full border-2 border-kick-green/30 border-t-kick-green animate-spin" />
        </div>
      </div>
    );
  }

  if (streamer === null) {
    return <ChannelNotFound slug={slug} />;
  }

  return <StreamPageClient streamer={streamer} category={getCategoryById(streamer.category)} />;
}
