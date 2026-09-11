"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { WheelPanel } from "@/components/wheel/WheelPanel";
import { GameShellHeader } from "@/components/casino/GameShellHeader";

export function WheelGame({ backHref = "/jeux" }: { backHref?: string }) {
  const { t } = useLanguage();

  return (
    <div className="plinko-game wheel-game blackjack-game">
      <div className="plinko-shell wheel-shell">
        <GameShellHeader
          backHref={backHref}
          title={t("wheelTitle")}
          rulesTitleKey="wheelRulesTitle"
          rulesBodyKey="wheelRulesBody"
        />

        <WheelPanel />
      </div>
    </div>
  );
}
