"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, Crown, BadgeCheck } from "lucide-react";
import { streamers, getCategoryById } from "@/lib/data";
import { formatNumber } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

interface StreamCardProps {
  streamer: (typeof streamers)[0];
  featured?: boolean;
}

export function StreamCard({ streamer, featured = false }: StreamCardProps) {
  const category = getCategoryById(streamer.category);

  return (
    <Link
      href={`/stream/${streamer.username}`}
      className={`stream-card group block ${featured ? "col-span-2 row-span-2" : ""}`}
    >
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        {/* Thumbnail */}
        <div className={`relative ${featured ? "aspect-[16/9]" : "aspect-video"} overflow-hidden`}>
          <Image
            src={streamer.banner}
            alt={streamer.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="gradient-overlay" />

          {/* Live badge */}
          {streamer.isLive && (
            <div className="absolute top-3 left-3 live-indicator">
              <span className="live-dot" />
              LIVE
            </div>
          )}

          {/* Viewers */}
          {streamer.isLive && (
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-xs">
              <Eye className="w-3 h-3" />
              {formatNumber(streamer.viewers)}
            </div>
          )}

          {/* VIP badge */}
          {streamer.vip && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-neon-gold/20 border border-neon-gold/30 text-neon-gold text-xs">
              <Crown className="w-3 h-3" />
              VIP
            </div>
          )}

          {/* Category tag */}
          <div className="absolute bottom-3 left-3">
            <span className="px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-xs">
              {category?.icon} {category?.name}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="relative flex-shrink-0">
              <Image
                src={streamer.avatar}
                alt={streamer.displayName}
                width={40}
                height={40}
                className="rounded-full border-2 border-glass-border"
              />
              {streamer.isLive && (
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-red-500 border-2 border-void-100" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-display font-semibold text-sm truncate group-hover:text-neon-cyan transition-colors">
                  {streamer.displayName}
                </h3>
                {streamer.verified && (
                  <BadgeCheck className="w-4 h-4 text-neon-cyan flex-shrink-0" />
                )}
              </div>
              <p className="text-xs text-white/50 truncate mt-0.5">{streamer.title}</p>
              <p className="text-xs text-white/30 mt-1">{formatNumber(streamer.followers)} followers</p>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export function FeaturedStreams() {
  const liveStreamers = streamers.filter((s) => s.isLive);
  const featured = liveStreamers[0];
  const rest = liveStreamers.slice(1);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold">En direct maintenant</h2>
          <p className="text-sm text-white/40 mt-1">{liveStreamers.length} streamers en live</p>
        </div>
        <Link href="/browse" className="text-sm text-neon-cyan hover:text-neon-cyan/80 transition-colors">
          Voir tout →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {featured && <StreamCard streamer={featured} featured />}
        {rest.slice(0, 5).map((streamer) => (
          <StreamCard key={streamer.id} streamer={streamer} />
        ))}
      </div>
    </section>
  );
}

export function StreamGrid({ filter, search }: { filter?: string; search?: string }) {
  const { t } = useLanguage();

  let filtered = filter && filter !== "all"
    ? streamers.filter((s) => s.category === filter)
    : streamers;

  if (search?.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (s) =>
        s.displayName.toLowerCase().includes(q) ||
        s.username.toLowerCase().includes(q) ||
        s.title.toLowerCase().includes(q) ||
        s.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }

  if (filtered.length === 0) {
    return <p className="text-center py-16 text-white/40">{t("noResults")}</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filtered.map((streamer) => (
        <StreamCard key={streamer.id} streamer={streamer} />
      ))}
    </div>
  );
}
