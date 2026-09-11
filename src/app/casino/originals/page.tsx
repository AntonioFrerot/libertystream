"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { OriginalGameCard } from "@/components/casino/OriginalGameCard";
import { ORIGINAL_GAMES } from "@/lib/casino/originals";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function CasinoOriginalsPage() {
  const { t } = useLanguage();

  return (
    <MainLayout>
      <div className="px-4 lg:px-6 py-6 max-w-[1400px] mx-auto">
        <Link
          href="/casino"
          className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-kick-green transition-colors mb-5"
        >
          <ChevronLeft className="w-4 h-4" />
          {t("casinoTitle")}
        </Link>

        <div className="mb-6">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mb-1">{t("casinoOriginals")}</h1>
          <p className="text-sm text-white/50">{t("originalsDesc")}</p>
        </div>

        <div className="original-games-grid">
          {ORIGINAL_GAMES.map((game) => (
            <OriginalGameCard key={game.id} game={game} href={`/jeux/solo/${game.id}`} />
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
