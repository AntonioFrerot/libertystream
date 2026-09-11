"use client";

import { useEffect, useState } from "react";
import { Shield, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const STORAGE_KEY = "libertystream-age-verified";

export function AgeGate({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    setVerified(localStorage.getItem(STORAGE_KEY) === "true");
    setMounted(true);
  }, []);

  const handleConfirm = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setVerified(true);
  };

  const handleDeny = () => {
    window.location.href = "https://www.google.com";
  };

  if (!mounted) return <div className="min-h-screen bg-void" />;

  if (!verified) {
    return (
      <div className="fixed inset-0 z-[100] bg-void flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-mesh-gradient opacity-60 pointer-events-none" />
        <div className="relative glass-panel max-w-md w-full p-8 text-center border-neon-purple/20">
          <div className="w-16 h-16 rounded-2xl bg-neon-purple/10 border border-neon-purple/30 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-neon-purple" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <AlertTriangle className="w-3.5 h-3.5" />
            {t("ageOnly")}
          </div>
          <h1 className="font-display text-2xl font-bold mb-3">{t("ageTitle")}</h1>
          <p className="text-sm text-white/50 leading-relaxed mb-8">{t("ageDesc")}</p>
          <div className="space-y-3">
            <button type="button" onClick={handleConfirm} className="w-full btn-primary !py-3">
              {t("ageConfirm")}
            </button>
            <button type="button" onClick={handleDeny} className="w-full py-3 rounded-xl text-sm text-white/40 hover:text-white/60 transition-colors">
              {t("ageDeny")}
            </button>
          </div>
          <p className="text-xs text-white/25 mt-6">{t("ageRules")}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
