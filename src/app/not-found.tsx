"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
      <div className="glass-panel max-w-md mx-auto p-10">
        <div className="mx-auto mb-6 flex justify-center">
          <Image
            src="/logo.png"
            alt="LibertyPlace"
            width={64}
            height={64}
            className="object-contain"
          />
        </div>
        <h1 className="font-display text-6xl font-bold neon-text mb-2">404</h1>
        <h2 className="font-display text-xl font-semibold mb-3">{t("notFoundTitle")}</h2>
        <p className="text-sm text-white/50 mb-8">{t("notFoundDesc")}</p>
        <Link href="/browse" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />{t("backBrowse")}
        </Link>
      </div>
    </div>
  );
}
