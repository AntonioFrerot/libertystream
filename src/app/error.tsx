"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useLanguage();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
      <div className="glass-panel max-w-md mx-auto p-10 border-red-500/20">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="font-display text-2xl font-bold mb-3">{t("errorTitle")}</h1>
        <p className="text-sm text-white/50 mb-8">{t("errorDesc")}</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button type="button" onClick={reset} className="btn-primary">{t("retry")}</button>
          <Link href="/" className="btn-gold inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />{t("home")}
          </Link>
        </div>
      </div>
    </div>
  );
}
