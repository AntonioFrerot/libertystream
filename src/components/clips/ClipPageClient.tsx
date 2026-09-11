"use client";

import Image from "next/image";
import Link from "next/link";
import { Eye, Share2, ArrowLeft } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { VideoPlayer } from "@/components/stream/VideoPlayer";
import { formatNumber } from "@/lib/utils";
import { useLanguage, getCategoryLabel } from "@/lib/i18n/LanguageProvider";
import { useToast } from "@/components/ui/Toast";
import type { Clip } from "@/lib/data";

export function ClipPageClient({ clip }: { clip: Clip }) {
  const { t } = useLanguage();
  const { showToast } = useToast();

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast(t("linkCopied"));
    } catch {
      showToast(t("linkCopyFail"));
    }
  };

  return (
    <MainLayout>
      <div className="p-4 lg:p-6 max-w-4xl">
        <Link href="/clips" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" />{t("topClips")}
        </Link>

        <VideoPlayer banner={clip.thumbnail} videoUrl={clip.videoUrl} title={clip.title} isLive={false} />

        <div className="mt-4">
          <h1 className="font-display text-xl font-bold mb-2">{clip.title}</h1>
          <div className="flex items-center gap-4 text-sm text-white/50 mb-4">
            <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{formatNumber(clip.views)} {t("views")}</span>
            <span>{clip.duration}</span>
            <span>{getCategoryLabel(t, clip.category)}</span>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-kick-surface border border-kick-border">
            <Link href={`/stream/${clip.streamerUsername}`} className="flex items-center gap-3 group">
              <Image src={clip.streamerAvatar} alt={clip.streamerName} width={48} height={48} className="rounded-full" />
              <div>
                <p className="font-semibold group-hover:text-kick-green transition-colors">{clip.streamerName}</p>
                <p className="text-xs text-white/40">{t("backToStream")}</p>
              </div>
            </Link>
            <button type="button" onClick={handleShare} className="p-2.5 rounded-lg bg-kick-bg border border-kick-border hover:border-kick-green/30 transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
