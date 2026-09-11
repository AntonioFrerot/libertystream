"use client";

import { GameRulesInfoButton } from "@/components/casino/GameRulesInfoButton";
import type { TranslationKey } from "@/lib/i18n/translations";

interface GameShellTitleProps {
  title: string;
  rulesTitleKey: TranslationKey;
  rulesBodyKey: TranslationKey;
  showRulesInfo?: boolean;
}

export function GameShellTitle({
  title,
  rulesTitleKey,
  rulesBodyKey,
  showRulesInfo = true,
}: GameShellTitleProps) {
  return (
    <div className="plinko-shell-title">
      {showRulesInfo && (
        <GameRulesInfoButton rulesTitleKey={rulesTitleKey} rulesBodyKey={rulesBodyKey} />
      )}
      <h1>{title}</h1>
    </div>
  );
}
