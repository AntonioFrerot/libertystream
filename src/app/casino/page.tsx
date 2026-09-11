"use client";

import Link from "next/link";
import Image from "next/image";
import { Dices, Flame } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { streamers } from "@/lib/data";
import { formatNumber } from "@/lib/utils";

const CASINO_GAMES = [
  { id: "slots", icon: Dices, labelKey: "casinoSlots" as const, color: "from-neon-purple/30 to-neon-cyan/10" },
  { id: "originals", icon: Flame, labelKey: "casinoOriginals" as const, color: "from-orange-500/20 to-amber-500/10" },
];

export default function CasinoPage() {
  const { t } = useLanguage();
  const casinoStreamers = streamers.filter((s) => s.category === "casino" || s.tags.some((tag) => /slot|casino|poker/i.test(tag)));

  return (
    <MainLayout>
      <div className="px-4 lg:px-6 py-6 max-w-[1200px] mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2">{t("casinoTitle")}</h1>
          <p className="text-sm text-white/50 max-w-xl">{t("casinoDesc")}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-10 max-w-md">
          {CASINO_GAMES.map((game) => {
            const className = `group relative overflow-hidden rounded-xl border border-kick-border bg-gradient-to-br ${game.color} p-4 text-left hover:border-kick-green/40 transition-all block`;
            if (game.id === "originals") {
              return (
                <Link key={game.id} href="/casino/originals" className={className}>
                  <game.icon className="w-6 h-6 text-white/80 mb-3 group-hover:text-kick-green transition-colors" />
                  <p className="text-sm font-semibold text-white">{t(game.labelKey)}</p>
                </Link>
              );
            }
            return (
              <button key={game.id} type="button" className={className}>
                <game.icon className="w-6 h-6 text-white/80 mb-3 group-hover:text-kick-green transition-colors" />
                <p className="text-sm font-semibold text-white">{t(game.labelKey)}</p>
              </button>
            );
          })}
        </div>

        <section className="mb-10">
          <h2 className="font-display text-lg font-bold text-white mb-4">{t("casinoPopular")}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {["Mega Fortune", "Liberty Slots", "Neon Roulette", "Gold Blackjack"].map((name) => (
              <div
                key={name}
                className="rounded-xl overflow-hidden border border-kick-border bg-kick-surface hover:border-kick-green/30 transition-colors cursor-pointer group"
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-kick-bg to-neon-purple/20 flex items-center justify-center">
                  <Dices className="w-10 h-10 text-kick-green/40 group-hover:text-kick-green/70 transition-colors" />
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold truncate">{name}</p>
                  <p className="text-[10px] text-white/40 mt-0.5">{t("casinoPlay")}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {casinoStreamers.length > 0 && (
          <section>
            <h2 className="font-display text-lg font-bold text-white mb-4">{t("casinoLiveStreams")}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {casinoStreamers.slice(0, 6).map((s) => (
                <Link
                  key={s.id}
                  href={`/${s.username}`}
                  className="flex items-center gap-3 p-3 rounded-xl border border-kick-border bg-kick-surface hover:border-kick-green/30 transition-colors"
                >
                  <div className="relative flex-shrink-0">
                    <Image src={s.avatar} alt={s.displayName} width={48} height={48} className="rounded-lg object-cover" />
                    {s.isLive && (
                      <span className="absolute -bottom-1 -right-1 px-1 py-0.5 rounded text-[8px] font-bold bg-red-600 text-white uppercase">
                        {t("live")}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{s.displayName}</p>
                    <p className="text-xs text-white/40 truncate">{s.title}</p>
                  </div>
                  {s.isLive && (
                    <span className="text-xs text-kick-green font-medium flex-shrink-0">{formatNumber(s.viewers)}</span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </MainLayout>
  );
}
