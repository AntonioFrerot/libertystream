"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { GameRulesInfoButton } from "@/components/casino/GameRulesInfoButton";
import { GameShellTitle } from "@/components/casino/GameShellTitle";
import { GameSoundControls } from "@/components/casino/GameSoundControls";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { TranslationKey } from "@/lib/i18n/translations";

interface GameShellHeaderProps {
  backHref?: string;
  title: string;
  rulesTitleKey: TranslationKey;
  rulesBodyKey: TranslationKey;
}

export function GameShellHeader({
  backHref = "/jeux",
  title,
  rulesTitleKey,
  rulesBodyKey,
}: GameShellHeaderProps) {
  const { t } = useLanguage();

  return (
    <header className="plinko-shell-header game-shell-header">
      <Link href={backHref} className="plinko-back-link" aria-label={t("gamesPageTitle")}>
        <ChevronLeft className="w-4 h-4" aria-hidden />
      </Link>
      <GameShellTitle
        title={title}
        rulesTitleKey={rulesTitleKey}
        rulesBodyKey={rulesBodyKey}
        showRulesInfo={false}
      />
      <div className="game-header-actions">
        <GameRulesInfoButton rulesTitleKey={rulesTitleKey} rulesBodyKey={rulesBodyKey} />
        <GameSoundControls />
      </div>
    </header>
  );
}
