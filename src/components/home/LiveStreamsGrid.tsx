"use client";



import Image from "next/image";

import Link from "next/link";

import { Eye, BadgeCheck } from "lucide-react";

import { streamers } from "@/lib/data";

import { formatNumber } from "@/lib/utils";

import { useLanguage, getCategoryLabel } from "@/lib/i18n/LanguageProvider";



interface LiveStreamsGridProps {

  title?: string;

  limit?: number;

}



export function LiveStreamsGrid({ title, limit }: LiveStreamsGridProps) {

  const { t } = useLanguage();

  const live = streamers

    .filter((s) => s.isLive)

    .sort((a, b) => b.viewers - a.viewers)

    .slice(0, limit);



  const heading = title ?? t("homeRecommendedTitle");



  return (

    <section className="mt-2 mb-6">

      <div className="flex items-center justify-between mb-3 px-0.5">

        <h2 className="font-display text-base font-bold">{heading}</h2>

        <Link href="/browse" className="text-sm text-kick-green hover:text-kick-green/80 transition-colors">

          {t("viewAll")}

        </Link>

      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">

        {live.map((s) => (

          <Link key={s.id} href={`/${s.username}`} className="group">

            <div className="relative aspect-video rounded-lg overflow-hidden bg-kick-surface mb-2 border border-transparent group-hover:border-kick-green/20 transition-colors">

              <Image src={s.banner} alt={s.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />

              <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-600/95 text-[10px] font-bold uppercase">

                <span className="live-dot !w-1 !h-1" />

                {t("live")}

              </div>

              <div className="absolute top-2 right-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-black/75 text-[10px]">

                <Eye className="w-2.5 h-2.5" />

                {formatNumber(s.viewers)}

              </div>

              <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/75 text-[10px]">

                {getCategoryLabel(t, s.category)}

              </div>

            </div>

            <div className="flex items-start gap-2 px-0.5">

              <Image src={s.avatar} alt={s.displayName} width={32} height={32} className="rounded-full flex-shrink-0" />

              <div className="min-w-0">

                <div className="flex items-center gap-1">

                  <p className="text-xs font-semibold truncate group-hover:text-kick-green transition-colors">{s.displayName}</p>

                  {s.verified && <BadgeCheck className="w-3 h-3 text-kick-green flex-shrink-0" />}

                </div>

                <p className="text-[10px] text-white/40 truncate">{s.title}</p>

              </div>

            </div>

          </Link>

        ))}

      </div>

    </section>

  );

}

