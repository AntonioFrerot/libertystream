"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Eye, LogIn, BadgeCheck, Volume2, VolumeX, Play } from "lucide-react";
import { streamers } from "@/lib/data";
import { formatNumber } from "@/lib/utils";
import { useLanguage, getCategoryLabel } from "@/lib/i18n/LanguageProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { useAppUI } from "@/components/providers/AppUIProvider";

const liveStreamers = streamers
  .filter((s) => s.isLive)
  .sort((a, b) => b.viewers - a.viewers);

const defaultChat = [
  { user: "CyberFan42", msg: "Lets gooo 🔥", color: "text-kick-green" },
  { user: "NeonGirl", msg: "Sub sent!", color: "text-pink-400" },
  { user: "LibertyMax", msg: "100% to streamer 💪", color: "text-emerald-400" },
  { user: "DarkPulse", msg: "GG WP", color: "text-purple-400" },
];

export function FeaturedStream() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { openAuth } = useAppUI();
  const [current, setCurrent] = useState(0);
  const [chatMessages, setChatMessages] = useState(defaultChat);
  const [chatInput, setChatInput] = useState("");
  const [muted, setMuted] = useState(true);
  const streamer = liveStreamers[current];

  const next = useCallback(() => setCurrent((c) => (c + 1) % liveStreamers.length), []);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + liveStreamers.length) % liveStreamers.length), []);

  useEffect(() => {
    const timer = setInterval(next, 10000);
    return () => clearInterval(timer);
  }, [next]);

  const sendChat = () => {
    if (!user) { openAuth("login"); return; }
    const msg = chatInput.trim();
    if (!msg) return;
    setChatMessages((prev) => [...prev, { user: user.username, msg, color: "text-kick-green" }]);
    setChatInput("");
  };

  if (!streamer) return null;

  return (
    <section className="mb-6">
      <div className="flex flex-col xl:flex-row gap-0 xl:h-[480px] rounded-xl overflow-hidden border border-kick-border bg-kick-surface">
        {/* Stream preview — grand format */}
        <div className="relative flex-1 min-h-[260px] sm:min-h-[320px] xl:min-h-0 group">
          <Link href={`/stream/${streamer.username}`} className="block absolute inset-0">
            <Image
              src={streamer.banner}
              alt={streamer.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              priority
            />
          </Link>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none" />

          {/* Badges haut */}
          <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-red-600 text-[11px] font-bold uppercase">
              <span className="live-dot !w-1.5 !h-1.5" />{t("live")}
            </span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-xs font-medium">
              <Eye className="w-3 h-3" />{formatNumber(streamer.viewers)}
            </span>
          </div>

          {/* Contrôles haut droite */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); setMuted(!muted); }}
              className="p-2 rounded-lg bg-black/60 hover:bg-black/80 backdrop-blur-sm transition-colors"
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button type="button" onClick={prev} className="p-2 rounded-lg bg-black/60 hover:bg-black/80 backdrop-blur-sm transition-colors hidden sm:block">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button type="button" onClick={next} className="p-2 rounded-lg bg-black/60 hover:bg-black/80 backdrop-blur-sm transition-colors hidden sm:block">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Play overlay au centre */}
          <Link
            href={`/stream/${streamer.username}`}
            className="absolute inset-0 flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <div className="w-16 h-16 rounded-full bg-kick-green/90 flex items-center justify-center shadow-lg">
              <Play className="w-7 h-7 text-white ml-1" fill="white" />
            </div>
          </Link>

          {/* Infos streamer en bas */}
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 z-10">
            <div className="flex items-end justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <Link href={`/stream/${streamer.username}`}>
                  <Image
                    src={streamer.avatar}
                    alt={streamer.displayName}
                    width={52}
                    height={52}
                    className="rounded-full border-2 border-kick-green/50 flex-shrink-0 hover:border-kick-green transition-colors"
                  />
                </Link>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Link href={`/stream/${streamer.username}`} className="font-display font-bold text-lg sm:text-xl truncate hover:text-kick-green transition-colors">
                      {streamer.displayName}
                    </Link>
                    {streamer.verified && <BadgeCheck className="w-4 h-4 text-kick-green flex-shrink-0" />}
                  </div>
                  <p className="text-sm text-white/70 truncate max-w-lg mt-0.5">{streamer.title}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="px-2 py-0.5 rounded-md bg-kick-green/15 border border-kick-green/30 text-[11px] font-medium text-kick-green">
                      {getCategoryLabel(t, streamer.category)}
                    </span>
                    {streamer.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded-md bg-white/10 text-[11px] text-white/60">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
              <Link
                href={`/stream/${streamer.username}`}
                className="btn-kick px-5 py-2.5 text-sm whitespace-nowrap flex-shrink-0 hidden sm:inline-flex"
              >
                {t("watchNow")}
              </Link>
            </div>

            {/* Indicateurs carousel */}
            <div className="flex items-center gap-1.5 mt-4">
              {liveStreamers.slice(0, 8).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrent(i)}
                  className={`h-1 rounded-full transition-all duration-300 ${i === current ? "w-6 bg-kick-green" : "w-1.5 bg-white/30 hover:bg-white/50"}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Mini chat à droite — style Kick */}
        <div className="w-full xl:w-[300px] flex-shrink-0 bg-kick-bg border-t xl:border-t-0 xl:border-l border-kick-border flex flex-col h-[260px] xl:h-auto">
          <div className="px-4 py-3 border-b border-kick-border flex items-center justify-between">
            <h3 className="text-sm font-semibold">{t("chat")}</h3>
            <span className="text-[10px] text-kick-green font-medium uppercase">{t("live")}</span>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5 min-h-0">
            {chatMessages.map((msg, i) => (
              <div key={i} className="text-xs leading-relaxed">
                <span className={`font-semibold ${msg.color}`}>{msg.user}</span>
                <span className="text-white/30 mx-1">:</span>
                <span className="text-white/70">{msg.msg}</span>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-kick-border">
            {user ? (
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendChat()}
                placeholder={t("sendMessage")}
                className="w-full px-3 py-2 rounded-lg bg-kick-surface border border-kick-border text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-kick-green/40"
              />
            ) : (
              <button
                type="button"
                onClick={() => openAuth("login")}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-kick-green/10 border border-kick-green/30 text-kick-green text-xs font-medium hover:bg-kick-green/20"
              >
                <LogIn className="w-3.5 h-3.5" />
                {t("chatLoginRequired")}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
