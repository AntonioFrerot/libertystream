"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PlinkoGame } from "@/components/casino/plinko/PlinkoGame";
import { BlackjackGame } from "@/components/casino/blackjack/BlackjackGame";
import { WheelGame } from "@/components/wheel/WheelGame";
import { HiloGame } from "@/components/casino/hilo/HiloGame";
import { ChickenRoadGame } from "@/components/casino/chicken-road/ChickenRoadGame";
import { MinesGame } from "@/components/casino/mines/MinesGame";
import { EagleFlightGame } from "@/components/casino/eagle-flight/EagleFlightGame";
import { getOriginalGame } from "@/lib/casino/originals";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function OriginalGamePage() {
  const params = useParams<{ slug: string }>();
  const { t } = useLanguage();
  const game = getOriginalGame(params.slug);

  if (!game) {
    return (
      <MainLayout>
        <div className="px-4 py-12 text-center text-white/50">Jeu introuvable</div>
      </MainLayout>
    );
  }

  if (params.slug === "plinko") {
    return (
      <MainLayout>
        <div className="plinko-page px-2 sm:px-4 lg:px-8 py-2 sm:py-3 max-w-5xl mx-auto">
          <PlinkoGame />
        </div>
      </MainLayout>
    );
  }

  if (params.slug === "blackjack") {
    return (
      <MainLayout>
        <div className="blackjack-page plinko-page px-2 sm:px-4 lg:px-8 py-2 sm:py-3 max-w-5xl mx-auto">
          <BlackjackGame backHref="/casino/originals" />
        </div>
      </MainLayout>
    );
  }

  if (params.slug === "wheel") {
    return (
      <MainLayout>
        <div className="wheel-page plinko-page px-2 sm:px-4 lg:px-8 py-2 sm:py-3 max-w-5xl mx-auto">
          <WheelGame backHref="/casino/originals" />
        </div>
      </MainLayout>
    );
  }

  if (params.slug === "hilo") {
    return (
      <MainLayout>
        <div className="hilo-page plinko-page px-2 sm:px-4 lg:px-8 py-2 sm:py-3 max-w-5xl mx-auto">
          <HiloGame backHref="/casino/originals" />
        </div>
      </MainLayout>
    );
  }

  if (params.slug === "chicken-road") {
    return (
      <MainLayout>
        <div className="chicken-road-page plinko-page px-2 sm:px-4 lg:px-8 py-2 sm:py-3 max-w-5xl mx-auto">
          <ChickenRoadGame backHref="/casino/originals" />
        </div>
      </MainLayout>
    );
  }

  if (params.slug === "mines") {
    return (
      <MainLayout>
        <div className="mines-page plinko-page px-2 sm:px-4 lg:px-8 py-2 sm:py-3 max-w-5xl mx-auto">
          <MinesGame backHref="/casino/originals" />
        </div>
      </MainLayout>
    );
  }

  if (params.slug === "eagle-flight") {
    return (
      <MainLayout>
        <div className="eagle-flight-page plinko-page px-2 sm:px-4 lg:px-8 py-2 sm:py-3 max-w-5xl mx-auto">
          <EagleFlightGame backHref="/casino/originals" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="px-4 lg:px-6 py-6 max-w-3xl mx-auto">
        <Link
          href="/casino/originals"
          className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-kick-green transition-colors mb-5"
        >
          <ChevronLeft className="w-4 h-4" />
          {t("casinoOriginals")}
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
