"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { MultiplayerIcon } from "@/components/casino/MultiplayerIcon";
import type { OriginalGame } from "@/lib/casino/originals";

export function OriginalGameCard({
  game,
  href,
  multiplayer = false,
}: {
  game: OriginalGame;
  href: string;
  multiplayer?: boolean;
}) {
  const { t } = useLanguage();

  return (
    <Link
      href={href}
      className="original-game-card group"
      style={{ "--game-glow": game.glow } as React.CSSProperties}
    >
      <div className={`original-game-art bg-gradient-to-b ${game.gradient}`}>
        {multiplayer && (
          <span className="original-game-multi-badge" title={t("gamesMulti")} aria-label={t("gamesMulti")}>
            <MultiplayerIcon />
          </span>
        )}
        <span className="original-game-emoji" aria-hidden>
          {game.icon}
        </span>
      </div>
      <div className="original-game-footer">
        <p className="original-game-title">{t(game.labelKey)}</p>
      </div>
    </Link>
  );
}
