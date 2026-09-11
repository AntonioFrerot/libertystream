"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { SiteLogo } from "@/components/layout/SiteLogo";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useAppUI } from "@/components/providers/AppUIProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { ProfileMenu } from "@/components/layout/ProfileMenu";
import { InboxMenu } from "@/components/layout/InboxMenu";
import { CryptoWalletBar } from "@/components/wallet/CryptoWalletBar";

export function Navbar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useLanguage();
  const { openAuth } = useAppUI();
  const { user } = useAuth();

  const handleSearch = () => {
    const q = searchQuery.trim();
    if (!q) return;
    router.push(`/browse?q=${encodeURIComponent(q)}`);
  };

  return (
    <>
      <header className="sticky top-0 z-50 h-14 bg-kick-surface border-b border-kick-border safe-top">
        <div className="relative flex items-center gap-1.5 sm:gap-3 h-full pl-2 pr-2 sm:pl-2.5 sm:pr-4 lg:pl-2.5 lg:pr-5">
          <SiteLogo size="md" className="-ml-0.5 flex-shrink-0 max-lg:translate-y-1 lg:translate-y-1" />

          <div className="flex-1 max-w-lg mx-auto hidden sm:block min-w-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("search")}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-kick-bg border border-kick-border text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-kick-green/40 transition-colors"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 ml-auto min-w-0">
            {user ? (
              <>
                <div className="navbar-wallet-center">
                  <CryptoWalletBar />
                </div>
                <div className="hidden lg:block">
                  <InboxMenu />
                </div>
                <ProfileMenu user={user} />
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => openAuth("login")}
                  className="px-3 sm:px-4 py-2 text-sm font-semibold text-white hover:text-kick-green transition-colors hidden sm:block"
                >
                  {t("login")}
                </button>
                <button type="button" onClick={() => openAuth("signup")} className="btn-kick px-3 sm:px-4 py-2 text-sm whitespace-nowrap">
                  {t("signup")}
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <MobileBottomNav />
    </>
  );
}
