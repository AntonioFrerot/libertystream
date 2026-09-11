"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PlinkoGame } from "@/components/casino/plinko/PlinkoGame";
import { BlackjackGame } from "@/components/casino/blackjack/BlackjackGame";
import { WheelGame } from "@/components/wheel/WheelGame";
import { HiloGame } from "@/components/casino/hilo/HiloGame";
import { ChickenRoadGame } from "@/components/casino/chicken-road/ChickenRoadGame";
import { MinesGame } from "@/components/casino/mines/MinesGame";
import { FlipGame } from "@/components/casino/flip/FlipGame";
import { EagleFlightGame } from "@/components/casino/eagle-flight/EagleFlightGame";
import { getOriginalGame } from "@/lib/casino/originals";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

interface OriginalGameScreenProps {
  slug: string;
  backHref: string;
  backLabelKey: "gamesPageTitle" | "gamesSolo" | "gamesMulti";
}

export function OriginalGameScreen({ slug, backHref, backLabelKey }: OriginalGameScreenProps) {
  const { t } = useLanguage();
  const game = getOriginalGame(slug);

  if (!game) {
    return (
      <MainLayout>
        <div className="px-4 py-12 text-center text-white/50">Jeu introuvable</div>
      </MainLayout>
    );
  }

  if (slug === "plinko") {
    return (
      <MainLayout>
        <div className="plinko-page px-2 sm:px-4 lg:px-8 py-2 sm:py-3 max-w-5xl mx-auto">
          <PlinkoGame backHref={backHref} />
        </div>
      </MainLayout>
    );
  }

  if (slug === "blackjack") {
    return (
      <MainLayout>
        <div className="blackjack-page plinko-page px-2 sm:px-4 lg:px-8 py-2 sm:py-3 max-w-5xl mx-auto">
          <BlackjackGame backHref={backHref} />
        </div>
      </MainLayout>
    );
  }

  if (slug === "wheel") {
    return (
      <MainLayout>
        <div className="wheel-page plinko-page px-2 sm:px-4 lg:px-8 py-2 sm:py-3 max-w-5xl mx-auto">
          <WheelGame backHref={backHref} />
        </div>
      </MainLayout>
    );
  }

  if (slug === "hilo") {
    return (
      <MainLayout>
        <div className="blackjack-page plinko-page px-2 sm:px-4 lg:px-8 py-2 sm:py-3 max-w-5xl mx-auto">
          <HiloGame backHref={backHref} />
        </div>
      </MainLayout>
    );
  }

  if (slug === "chicken-road") {
    return (
      <MainLayout>
        <div className="blackjack-page plinko-page px-2 sm:px-4 lg:px-8 py-2 sm:py-3 max-w-5xl mx-auto">
          <ChickenRoadGame backHref={backHref} />
        </div>
      </MainLayout>
    );
  }

  if (slug === "mines") {
    return (
      <MainLayout>
        <div className="mines-page plinko-page px-2 sm:px-4 lg:px-8 py-2 sm:py-3 max-w-5xl mx-auto">
          <MinesGame backHref={backHref} />
        </div>
      </MainLayout>
    );
  }

  if (slug === "flip") {
    return (
      <MainLayout>
        <div className="flip-page plinko-page px-2 sm:px-4 lg:px-8 py-2 sm:py-3 max-w-5xl mx-auto">
          <FlipGame backHref={backHref} />
        </div>
      </MainLayout>
    );
  }

  if (slug === "eagle-flight") {
    return (
      <MainLayout>
        <div className="eagle-flight-page plinko-page px-2 sm:px-4 lg:px-8 py-2 sm:py-3 max-w-5xl mx-auto">
          <EagleFlightGame backHref={backHref} />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="px-4 lg:px-6 py-6 max-w-3xl mx-auto">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-kick-green transition-colors mb-5"
        >
          <ChevronLeft className="w-4 h-4" />
          {t(backLabelKey)}
        </Link>

        <div className={`rounded-2xl overflow-hidden border border-kick-border bg-gradient-to-b ${game.gradient} p-8 text-center mb-6`}>
          <span className="text-6xl block mb-4">{game.icon}</span>
          <h1 className="font-display text-3xl font-bold uppercase">{t(game.labelKey)}</h1>
        </div>

        <p className="text-center text-white/50 text-sm">{t("originalComingSoon")}</p>
      </div>
    </MainLayout>
  );
}
