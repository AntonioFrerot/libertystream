"use client";

import { Sidebar } from "@/components/home/Sidebar";
import { ChannelKickChat } from "@/components/channel/ChannelKickChat";
import { ChannelKickView } from "@/components/channel/ChannelKickView";
import { StreamChat } from "@/components/stream/StreamChat";
import { StreamInfoBar } from "@/components/stream/StreamInfoBar";
import { VideoPlayer } from "@/components/stream/VideoPlayer";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { Streamer, Category } from "@/lib/data";

interface Props {
  streamer: Streamer;
  category: Category | undefined;
}

export function StreamPageClient({ streamer }: Props) {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      <Sidebar />

      {!streamer.isLive ? (
        <div className="flex-1 flex flex-col lg:flex-row min-w-0">
          <div className="flex-1 min-w-0 overflow-y-auto">
            <ChannelKickView streamer={streamer} />
          </div>
          <ChannelKickChat
            streamerName={streamer.displayName}
            streamerUsername={streamer.username}
            empty
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row min-w-0">
          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
            <VideoPlayer
              banner={streamer.banner}
              title={streamer.title}
              isLive={streamer.isLive}
              viewers={streamer.viewers}
            />
            <StreamInfoBar streamer={streamer} />
            <div className="px-4 lg:px-6 py-3 bg-kick-green/5 border-b border-kick-green/10">
              <p className="text-xs text-white/50">
                💰 {t("revenueDesc")}{" "}
                <span className="text-kick-green font-medium">{streamer.displayName}</span>.{" "}
                {t("noCommission")}
              </p>
            </div>
          </div>
          <StreamChat streamerName={streamer.displayName} streamerUsername={streamer.username} />
        </div>
      )}
    </div>
  );
}
