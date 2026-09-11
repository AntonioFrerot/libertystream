"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { OriginalGameCard } from "@/components/casino/OriginalGameCard";
import { MULTI_GAMES, SOLO_GAMES } from "@/lib/casino/originals";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

type JeuxMobileTab = "solo" | "multi";

export default function JeuxPage() {
  const { t } = useLanguage();
  const [mobileTab, setMobileTab] = useState<JeuxMobileTab>("solo");

  return (
    <MainLayout>
      <div className="games-list-page jeux-page max-w-[1200px] mx-auto">
        <div className="jeux-mobile-tabs">
          <button
            type="button"
            className={mobileTab === "solo" ? "jeux-mobile-tab-active" : ""}
            onClick={() => setMobileTab("solo")}
          >
            {t("gamesSolo")}
          </button>
          <button
            type="button"
            className={mobileTab === "multi" ? "jeux-mobile-tab-active" : ""}
            onClick={() => setMobileTab("multi")}
          >
            {t("gamesMulti")}
          </button>
        </div>

        <div className="jeux-page-columns">
          <section
            className={`games-list-section${mobileTab !== "solo" ? " jeux-section-mobile-hidden" : ""}`}
          >
            <div className="games-list-header games-list-section-header">
              <h2 className="font-display font-bold text-white">{t("gamesSolo")}</h2>
              <p>{t("gamesSoloDesc")}</p>
            </div>

            <div className="original-games-grid">
              {SOLO_GAMES.map((game) => (
                <OriginalGameCard key={game.id} game={game} href={`/jeux/solo/${game.id}`} />
              ))}
            </div>
          </section>

          <section
            className={`games-list-section${mobileTab !== "multi" ? " jeux-section-mobile-hidden" : ""}`}
          >
            <div className="games-list-header games-list-section-header">
              <h2 className="font-display font-bold text-white">{t("gamesMulti")}</h2>
              <p>{t("gamesMultiDesc")}</p>
            </div>

            <div className="original-games-grid">
              {MULTI_GAMES.map((game) => (
                <OriginalGameCard
                  key={game.id}
                  game={game}
                  href={`/jeux/multi/${game.id}`}
                  multiplayer
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
