"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Eye, LogIn } from "lucide-react";
import { streamers } from "@/lib/data";
import { formatNumber } from "@/lib/utils";
import { useLanguage, getCategoryLabel } from "@/lib/i18n/LanguageProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { useAppUI } from "@/components/providers/AppUIProvider";

const liveStreamers = streamers.filter((s) => s.isLive);

const defaultChat = [
  { user: "CyberFan42", msg: "Lets gooo 🔥", color: "text-neon-cyan" },
  { user: "NeonGirl", msg: "Sub sent!", color: "text-neon-gold" },
  { user: "LibertyMax", msg: "100% to streamer 💪", color: "text-neon-purple" },
];

export function FeaturedHero() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { openAuth } = useAppUI();
  const [current, setCurrent] = useState(0);
  const [chatMessages, setChatMessages] = useState(defaultChat);
  const [chatInput, setChatInput] = useState("");
  const streamer = liveStreamers[current];

  const next = useCallback(() => setCurrent((c) => (c + 1) % liveStreamers.length), []);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + liveStreamers.length) % liveStreamers.length), []);

  useEffect(() => {
    const timer = setInterval(next, 8000);
    return () => clearInterval(timer);
  }, [next]);

  const sendChat = () => {
    if (!user) {
      openAuth("login");
      return;
    }
    const msg = chatInput.trim();
    if (!msg) return;
    setChatMessages((prev) => [...prev, { user: user.username, msg, color: "text-neon-cyan" }]);
    setChatInput("");
  };

  return (
    <section className="flex flex-col xl:flex-row gap-0 xl:h-[420px]">
      <div className="relative flex-1 min-h-[240px] xl:min-h-0 rounded-t-xl xl:rounded-t-none xl:rounded-l-xl overflow-hidden bg-void-200 group">
        <Image src={streamer.banner} alt={streamer.title} fill className="object-cover transition-transform duration-700 group-hover:scale-[1.02]" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30" />

        <div className="absolute top-4 left-4 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-sm text-xs font-medium">
          <span className="live-dot !w-1.5 !h-1.5" />
          <Eye className="w-3 h-3" />
          {formatNumber(streamer.viewers)}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
          <div className="flex items-end justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Image src={streamer.avatar} alt={streamer.displayName} width={44} height={44} className="rounded-full border-2 border-white/20 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-display font-bold text-base sm:text-lg truncate">{streamer.displayName}</p>
                <p className="text-xs sm:text-sm text-white/60 truncate max-w-md">{streamer.title}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="px-2 py-0.5 rounded-md bg-white/10 text-[11px] font-medium">
                    {getCategoryLabel(t, streamer.category)}
                  </span>
                  {streamer.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded-md bg-white/10 text-[11px] text-white/60">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link href={`/stream/${streamer.username}`} className="px-4 py-2 rounded-lg bg-neon-cyan text-void text-sm font-semibold hover:bg-neon-cyan/90 transition-colors whitespace-nowrap">
                {t("watchNow")}
              </Link>
              <button type="button" onClick={prev} className="p-2 rounded-lg bg-black/50 hover:bg-black/70 transition-colors hidden sm:block">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button type="button" onClick={next} className="p-2 rounded-lg bg-black/50 hover:bg-black/70 transition-colors hidden sm:block">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-4">
            {liveStreamers.map((_, i) => (
              <button key={i} type="button" onClick={() => setCurrent(i)} className={`h-1 rounded-full transition-all duration-300 ${i === current ? "w-6 bg-white" : "w-1.5 bg-white/30 hover:bg-white/50"}`} />
            ))}
          </div>
        </div>
      </div>

      <div className="w-full xl:w-[280px] flex-shrink-0 bg-void-200 border-t xl:border-t-0 xl:border-l border-glass-border rounded-b-xl xl:rounded-b-none xl:rounded-r-xl flex flex-col h-[280px] xl:h-auto">
        <div className="px-4 py-3 border-b border-glass-border">
          <h3 className="text-sm font-semibold text-white/80">{t("chat")}</h3>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
          {chatMessages.map((msg, i) => (
            <div key={i} className="text-xs leading-relaxed">
              <span className={`font-semibold ${msg.color}`}>{msg.user}</span>
              <span className="text-white/30 mx-1">:</span>
              <span className="text-white/70">{msg.msg}</span>
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-glass-border">
          {user ? (
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendChat()}
              placeholder={t("sendMessage")}
              className="w-full px-3 py-2 rounded-lg bg-void-100 border border-glass-border text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-neon-cyan/40"
            />
          ) : (
            <button
              type="button"
              onClick={() => openAuth("login")}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-xs font-medium hover:bg-neon-cyan/20"
            >
              <LogIn className="w-3.5 h-3.5" />
              {t("chatLoginRequired")}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
