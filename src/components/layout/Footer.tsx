"use client";

import Link from "next/link";
import { SiteLogo } from "@/components/layout/SiteLogo";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function Footer({ compactTop = false }: { compactTop?: boolean }) {
  const { t } = useLanguage();

  const sections = [
    {
      title: t("footerAbout"),
      links: [
        { href: "/browse", label: t("footerAboutUs") },
        { href: "/browse", label: t("footerBrand") },
        { href: "/browse", label: t("footerNews") },
        { href: "/browse", label: t("footerDownload") },
        { href: "/browse", label: t("footerHelp") },
      ],
    },
    {
      title: t("footerCreators"),
      links: [
        { href: "/dashboard", label: t("becomeStreamer") },
        { href: "/dashboard", label: t("footerDevelopers") },
        { href: "/browse", label: t("footerBounties") },
        { href: "/browse", label: t("footerShop") },
      ],
    },
    {
      title: t("rules"),
      links: [
        { href: "/browse", label: t("terms") },
        { href: "/browse", label: t("contentPolicy") },
        { href: "/browse", label: t("privacy") },
        { href: "/browse", label: t("report") },
        { href: "/browse", label: t("footerCookies") },
      ],
    },
  ];

  return (
    <footer className={`border-t border-kick-border bg-kick-surface mt-auto ${compactTop ? "footer-home-compact" : ""}`}>
      <div
        className={`max-w-[1400px] mx-auto px-4 lg:px-6 py-10 ${compactTop ? "max-lg:pt-0 max-lg:pb-4" : ""}`}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4">
              <SiteLogo size="lg" href="/" />
            </div>
            <p className="text-xs text-white/40 leading-relaxed">{t("footerDesc")}</p>
          </div>
          {sections.map((section) => (
            <div key={section.title}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-3">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-xs text-white/40 hover:text-kick-green transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-6 border-t border-kick-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-white/30">{t("copyright")}</p>
          <p className="text-[11px] text-white/30">{t("ageRules")}</p>
        </div>
      </div>
    </footer>
  );
}
