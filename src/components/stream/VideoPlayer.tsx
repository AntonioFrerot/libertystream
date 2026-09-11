"use client";

import Image from "next/image";
import { useState } from "react";
import {
  Play, Pause, Volume2, VolumeX, Maximize, Settings, PictureInPicture2,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

interface VideoPlayerProps {
  banner: string;
  title: string;
  isLive: boolean;
  viewers?: number;
  videoUrl?: string;
}

export function VideoPlayer({ banner, title, isLive, viewers, videoUrl }: VideoPlayerProps) {
  const { t } = useLanguage();
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);

  return (
    <div
      className="relative w-full aspect-video bg-black flex-shrink-0 group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {videoUrl ? (
        <video
          src={videoUrl}
          poster={banner}
          autoPlay
          loop
          playsInline
          muted={muted}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <Image src={banner} alt={title} fill className="object-cover" priority />
      )}

      {!isLive && !videoUrl && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <p className="text-white/50 text-sm">{t("lastStream")}</p>
        </div>
      )}

      {/* Center play/pause */}
      <button
        type="button"
        onClick={() => setPlaying(!playing)}
        className={`absolute inset-0 flex items-center justify-center transition-opacity ${showControls || !playing ? "opacity-100" : "opacity-0"}`}
      >
        {!playing && (
          <div className="w-16 h-16 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-sm">
            <Play className="w-8 h-8 text-white ml-1" fill="white" />
          </div>
        )}
      </button>

      {/* Live badge */}
      {isLive && (
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-red-600 text-[11px] font-bold uppercase">
            <span className="live-dot !w-1.5 !h-1.5" />{t("live")}
          </span>
          {viewers !== undefined && (
            <span className="px-2 py-0.5 rounded bg-black/70 text-[11px] font-medium">
              {formatNumber(viewers)} {t("spectators")}
            </span>
          )}
        </div>
      )}

      {/* Bottom controls bar — style Kick */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-3 pb-3 pt-8 transition-opacity ${showControls ? "opacity-100" : "opacity-0"}`}>
        <div className="h-0.5 bg-white/20 rounded-full mb-3 relative">
          <div className="absolute left-0 top-0 h-full w-2/3 bg-kick-green rounded-full" />
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setPlaying(!playing)} className="p-1 hover:text-kick-green transition-colors">
            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button type="button" onClick={() => setMuted(!muted)} className="p-1 hover:text-kick-green transition-colors">
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <span className="text-[11px] text-white/60 flex-1">1:24:08 / LIVE</span>
          <button type="button" className="p-1 hover:text-kick-green transition-colors"><Settings className="w-4 h-4" /></button>
          <button type="button" className="p-1 hover:text-kick-green transition-colors"><PictureInPicture2 className="w-4 h-4" /></button>
          <button type="button" className="p-1 hover:text-kick-green transition-colors"><Maximize className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
}
