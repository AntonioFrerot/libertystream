"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Film, Gamepad2 } from "lucide-react";
import { WheelNavIcon } from "@/components/wheel/WheelNavIcon";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useAppUI } from "@/components/providers/AppUIProvider";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { openWheel } = useAppUI();

  const items = [
    { href: "/", label: t("home"), icon: Home, match: (p: string) => p === "/" },
    { href: "/browse", label: t("browse"), icon: Compass, match: (p: string) => p.startsWith("/browse") },
    { href: "/clips", label: t("clips"), icon: Film, match: (p: string) => p.startsWith("/clips") || p.startsWith("/clip/") },
    { href: "/jeux", label: t("sectionCasino"), icon: Gamepad2, match: (p: string) => p.startsWith("/jeux") || p.startsWith("/casino") },
  ];

  return (
    <nav className="mobile-bottom-nav lg:hidden" aria-label={t("menu")}>
      {items.map((item) => {
        const active = item.match(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`mobile-bottom-nav-item ${active ? "mobile-bottom-nav-item-active" : ""}`}
          >
            <item.icon className="w-5 h-5" strokeWidth={active ? 2.25 : 1.75} />
            <span>{item.label}</span>
          </Link>
        );
      })}
      <button
        type="button"
        onClick={openWheel}
        className="mobile-bottom-nav-item mobile-bottom-nav-wheel"
        aria-label={t("wheel")}
      >
        <WheelNavIcon />
        <span>{t("wheel")}</span>
      </button>
    </nav>
  );
}
