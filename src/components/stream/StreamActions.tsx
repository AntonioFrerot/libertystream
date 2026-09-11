"use client";

import { useState } from "react";
import { Heart, Bell, Share2, DollarSign } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useToast } from "@/components/ui/Toast";
import { TipModal } from "@/components/modals/TipModal";
import { SubscribeModal } from "@/components/modals/SubscribeModal";

export function StreamActions({ displayName, streamerUsername }: { displayName: string; streamerUsername: string }) {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [tipOpen, setTipOpen] = useState(false);
  const [subOpen, setSubOpen] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast(t("linkCopied"));
    } catch {
      showToast(t("linkCopyFail"));
    }
  };

  return (
    <>
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setSubOpen(true)}
          className="w-full btn-primary flex items-center justify-center gap-2"
        >
          <Heart className="w-4 h-4" />
          {t("subscribe")}
        </button>
        <button
          type="button"
          onClick={() => setTipOpen(true)}
          className="w-full btn-gold flex items-center justify-center gap-2"
        >
          <DollarSign className="w-4 h-4" />
          {t("sendTip")}
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => showToast(t("followSuccess", { name: displayName }))}
            className="flex-1 py-2.5 rounded-xl bg-glass border border-glass-border hover:border-white/20 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Bell className="w-4 h-4" />
            {t("follow")}
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="flex-1 py-2.5 rounded-xl bg-glass border border-glass-border hover:border-white/20 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Share2 className="w-4 h-4" />
            {t("share")}
          </button>
        </div>
      </div>
      <TipModal open={tipOpen} onClose={() => setTipOpen(false)} streamerName={displayName} streamerUsername={streamerUsername} />
      <SubscribeModal open={subOpen} onClose={() => setSubOpen(false)} streamerName={displayName} streamerUsername={streamerUsername} />
    </>
  );
}
