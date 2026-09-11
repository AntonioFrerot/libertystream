"use client";



import { useCallback, useEffect, useState } from "react";

import Image from "next/image";

import Link from "next/link";

import { ChevronLeft, ChevronRight, BadgeCheck } from "lucide-react";

import { streamers, type Streamer } from "@/lib/data";

import { formatNumber } from "@/lib/utils";

import { useLanguage, getCategoryLabel } from "@/lib/i18n/LanguageProvider";



const featured = streamers.filter((s) => s.isLive).sort((a, b) => b.viewers - a.viewers).slice(0, 12);



function wrap(i: number, len: number) {

  return ((i % len) + len) % len;

}



export function TwitchFeaturedCarousel() {

  const { t } = useLanguage();

  const [index, setIndex] = useState(0);



  const prev = useCallback(() => setIndex((i) => wrap(i - 1, featured.length)), []);

  const next = useCallback(() => setIndex((i) => wrap(i + 1, featured.length)), []);



  useEffect(() => {

    if (featured.length <= 1) return;

    const timer = setInterval(next, 9000);

    return () => clearInterval(timer);

  }, [next]);



  if (featured.length === 0) return null;



  const current = featured[index];

  const leftOuter = featured[wrap(index - 2, featured.length)];

  const leftInner = featured[wrap(index - 1, featured.length)];

  const rightInner = featured[wrap(index + 1, featured.length)];

  const rightOuter = featured[wrap(index + 2, featured.length)];



  return (

    <section className="featured-carousel">

      <div className="featured-carousel-wrap">

        <button type="button" onClick={prev} className="featured-carousel-nav featured-carousel-nav-left" aria-label={t("previous")}>

          <ChevronLeft className="w-6 h-6" strokeWidth={1.25} />

        </button>



        <div className="featured-carousel-stage">

          <SideCard streamer={leftOuter} variant="lo" onClick={prev} />

          <SideCard streamer={leftInner} variant="li" onClick={prev} />

          <MainFeaturedCard streamer={current} t={t} />

          <SideCard streamer={rightInner} variant="ri" onClick={next} />

          <SideCard streamer={rightOuter} variant="ro" onClick={next} />

        </div>



        <button type="button" onClick={next} className="featured-carousel-nav featured-carousel-nav-right" aria-label={t("next")}>

          <ChevronRight className="w-6 h-6" strokeWidth={1.25} />

        </button>

      </div>

    </section>

  );

}



function MainFeaturedCard({

  streamer,

  t,

}: {

  streamer: Streamer;

  t: ReturnType<typeof useLanguage>["t"];

}) {

  return (

    <div className="featured-carousel-main">

      <Link href={`/${streamer.username}`} className="featured-carousel-main-link group">

        <div className="featured-carousel-player">

          <Image src={streamer.banner} alt={streamer.title} fill className="object-cover" priority />

          <div className="featured-carousel-live">

            <span className="live-dot !w-1.5 !h-1.5" />

            {t("live")}

          </div>

        </div>



        <div className="featured-carousel-info">

          <div className="flex gap-3 items-start">

            <Image

              src={streamer.avatar}

              alt={streamer.displayName}

              width={40}

              height={40}

              className="rounded-full flex-shrink-0"

            />

            <div className="min-w-0 flex-1 pt-0.5">

              <div className="flex items-center gap-1 min-w-0">

                <p className="font-semibold text-[15px] text-[#bf94ff] truncate leading-snug group-hover:underline">

                  {streamer.displayName}

                </p>

                {streamer.verified && <BadgeCheck className="w-4 h-4 text-[#bf94ff] flex-shrink-0" />}

              </div>

              <p className="text-[14px] text-white truncate mt-0.5 leading-snug">

                {getCategoryLabel(t, streamer.category)}

              </p>

              <p className="text-[14px] text-[#adadb8] mt-1 leading-snug">

                {formatNumber(streamer.viewers)} {t("spectators")}

              </p>

            </div>

          </div>

          <div className="featured-carousel-tags hidden md:flex flex-wrap gap-2 mt-4">

            <span className="featured-carousel-tag">Français</span>

            {streamer.tags.slice(0, 2).map((tag) => (

              <span key={tag} className="featured-carousel-tag">

                {tag}

              </span>

            ))}

          </div>

        </div>

      </Link>

    </div>

  );

}



function SideCard({

  streamer,

  variant,

  onClick,

}: {

  streamer: Streamer;

  variant: "lo" | "li" | "ri" | "ro";

  onClick: () => void;

}) {

  return (

    <button type="button" onClick={onClick} className={`fc-side fc-${variant}`}>

      <div className="fc-side-thumb">

        <Image src={streamer.banner} alt="" fill className="object-cover" sizes="200px" />

        <div className="fc-side-overlay" />

      </div>

    </button>

  );

}


