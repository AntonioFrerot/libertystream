"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Eye, BadgeCheck } from "lucide-react";
import { useRef, useState } from "react";
import { streamers, topClipsOfWeek } from "@/lib/data";
import { formatNumber } from "@/lib/utils";
import { useLanguage, getCategoryLabel } from "@/lib/i18n/LanguageProvider";
import type { CategoryId } from "@/lib/data";

interface CategoryStreamRowProps {
  categoryId: CategoryId;
  title?: string;
  viewAllHref?: string;
}

export function CategoryStreamRow({ categoryId, title, viewAllHref }: CategoryStreamRowProps) {
  const { t } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const live = streamers
    .filter((s) => s.category === categoryId && s.isLive)
    .sort((a, b) => b.viewers - a.viewers);
  if (live.length === 0) return null;

  const rowTitle = title ?? getCategoryLabel(t, categoryId);
  const href = viewAllHref ?? `/browse?category=${categoryId}`;

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -400 : 400, behavior: "smooth" });
    setTimeout(() => {
      setCanLeft(el.scrollLeft > 0);
      setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    }, 300);
  };

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <Link href={href} className="font-display text-base font-bold hover:text-kick-green transition-colors">
          {rowTitle}
        </Link>
        <div className="flex items-center gap-2">
          <Link href={href} className="text-sm text-white/50 hover:text-white transition-colors mr-2">
            {t("viewAll")}
          </Link>
          <button type="button" onClick={() => scroll("left")} disabled={!canLeft} className="p-1.5 rounded-md bg-kick-surface border border-kick-border hover:bg-kick-hover disabled:opacity-30 transition-colors lg:hidden">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => scroll("right")} disabled={!canRight} className="p-1.5 rounded-md bg-kick-surface border border-kick-border hover:bg-kick-hover disabled:opacity-30 transition-colors lg:hidden">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div ref={scrollRef} className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide lg:grid lg:grid-cols-4 lg:overflow-visible">
        {live.map((s) => (
          <Link key={s.id} href={`/${s.username}`} className="flex-shrink-0 w-[280px] lg:w-auto group">
            <div className="relative aspect-video rounded-lg overflow-hidden bg-kick-surface mb-2">
              <Image src={s.banner} alt={s.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-600 text-[10px] font-bold uppercase">
                <span className="live-dot !w-1 !h-1" />{t("live")}
              </div>
              <div className="absolute top-2 right-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-black/70 text-[10px]">
                <Eye className="w-2.5 h-2.5" />{formatNumber(s.viewers)}
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Image src={s.avatar} alt={s.displayName} width={36} height={36} className="rounded-full flex-shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-sm font-semibold truncate group-hover:text-kick-green transition-colors">{s.displayName}</p>
                  {s.verified && <BadgeCheck className="w-3.5 h-3.5 text-kick-green flex-shrink-0" />}
                </div>
                <p className="text-xs text-white/40 truncate">{s.title}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function HomeCategoryRows() {
  const categoryIds: CategoryId[] = ["gaming", "casino", "irl", "combat", "porno"];
  return <>{categoryIds.map((id) => <CategoryStreamRow key={id} categoryId={id} />)}</>;
}

export function TopClipsRow() {
  const { t } = useLanguage();
  const sorted = [...topClipsOfWeek].sort((a, b) => b.views - a.views);

  return (
    <section className="mt-6 pb-0 md:pb-8">
      <div className="flex items-center justify-between mb-3 px-1">
        <Link href="/clips" className="font-display text-base font-bold hover:text-kick-green transition-colors">{t("topClips")}</Link>
        <Link href="/clips" className="text-sm text-white/50 hover:text-white transition-colors">{t("viewAll")}</Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-0 md:pb-2 scrollbar-hide">
        {sorted.map((clip, index) => (
          <Link key={clip.id} href={`/clip/${clip.id}`} className="flex-shrink-0 w-[240px] sm:w-[280px] group">
            <div className="relative aspect-video rounded-lg overflow-hidden bg-kick-surface mb-2">
              <Image src={clip.thumbnail} alt={clip.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
              {index < 3 && (
                <div className="absolute top-2 left-2 w-6 h-6 rounded-md bg-kick-green text-white text-xs font-bold flex items-center justify-center">{index + 1}</div>
              )}
              <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-medium">{clip.duration}</div>
            </div>
            <p className="text-sm font-semibold line-clamp-2 group-hover:text-kick-green transition-colors mb-1.5 leading-snug">{clip.title}</p>
            <div className="flex items-center gap-2">
              <Image src={clip.streamerAvatar} alt={clip.streamerName} width={24} height={24} className="rounded-full flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/50 truncate">{clip.streamerName}</p>
                <div className="flex items-center gap-1 text-xs text-white/40">
                  <Eye className="w-3 h-3" />{formatNumber(clip.views)} {t("views")}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
