"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Home, Compass, Film, Gamepad2, PanelLeftClose, PanelLeft, Video } from "lucide-react";
import { streamers } from "@/lib/data";
import { formatNumber } from "@/lib/utils";
import { useLanguage, getCategoryLabel } from "@/lib/i18n/LanguageProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { SidebarFooter } from "@/components/home/SidebarFooter";
import { WheelNavIcon } from "@/components/wheel/WheelNavIcon";
import { useAppUI } from "@/components/providers/AppUIProvider";

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { openWheel, sidebarCollapsed: collapsed, setSidebarCollapsed: setCollapsed } = useAppUI();

  const followedUsernames = user?.follows ?? ["neonwolf", "goldencards", "ironfist"];
  const followed = streamers.filter((s) => followedUsernames.includes(s.username) && s.isLive);
  const recommended = streamers.filter((s) => s.isLive && !followedUsernames.includes(s.username)).slice(0, 6);

  const navItems = [
    { href: "/", label: t("home"), icon: Home },
    { href: "/browse", label: t("browse"), icon: Compass },
    { href: "/clips", label: t("clips"), icon: Film },
    { href: "/jeux", label: t("sectionCasino"), icon: Gamepad2 },
  ];

  const w = collapsed ? "w-[68px]" : "w-[240px]";

  const navLinkClass = (active: boolean) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      active ? "bg-kick-hover text-kick-green" : "text-white/60 hover:text-white hover:bg-kick-hover"
    } ${collapsed ? "justify-center px-2" : ""}`;

  return (
    <aside className={`hidden lg:flex flex-col ${w} flex-shrink-0 border-r border-kick-border bg-kick-surface h-[calc(100vh-3.5rem)] sticky top-14 overflow-hidden transition-all duration-200`}>
      <div className="flex-1 overflow-y-auto min-h-0">
      <nav className="p-2 space-y-0.5">
        {collapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            className={`${navLinkClass(false)} w-full`}
            title="Expand"
            aria-label="Expand"
          >
            <PanelLeft className="w-5 h-5 flex-shrink-0" />
          </button>
        )}

        <div className={collapsed ? "" : "relative"}>
          <Link
            href="/"
            title={t("home")}
            className={`${navLinkClass(pathname === "/")} ${collapsed ? "" : "pr-9"}`}
          >
            <Home className="w-5 h-5 flex-shrink-0" />
            {!collapsed && t("home")}
          </Link>
          {!collapsed && (
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 z-10 p-1 rounded-md bg-kick-surface/90 hover:bg-kick-hover transition-colors border border-kick-border/60 shadow-sm"
              title="Collapse"
              aria-label="Collapse"
            >
              <PanelLeftClose className="w-3.5 h-3.5 text-white/60" />
            </button>
          )}
        </div>

        {navItems.slice(1).map((item) => {
          const active =
            item.href === "/jeux"
              ? pathname.startsWith("/jeux") || pathname.startsWith("/casino")
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={navLinkClass(active)}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && item.label}
            </Link>
          );
        })}

        <button
          type="button"
          title={t("wheel")}
          onClick={() => openWheel()}
          className={`sidebar-wheel-btn group ${collapsed ? "sidebar-wheel-btn-collapsed" : ""}`}
        >
          <span className="sidebar-wheel-btn-icon">
            <WheelNavIcon />
          </span>
          {!collapsed && (
            <span className="sidebar-wheel-btn-label">
              <span>{t("wheel")}</span>
              <span className="sidebar-wheel-btn-badge">{t("wheelBadge")}</span>
            </span>
          )}
        </button>
      </nav>

      {collapsed ? (
        (followed.length > 0 || recommended.length > 0) && (
          <div className="px-2 pt-3 pb-2 flex flex-col items-center gap-2.5">
            {followed.map((s) => (
              <CollapsedChannelAvatar key={s.id} streamer={s} pathname={pathname} />
            ))}
            {followed.length > 0 && recommended.length > 0 && (
              <div className="py-1.5 flex items-center justify-center" title={t("recommended")}>
                <Video className="w-5 h-5 text-white/40" strokeWidth={1.75} aria-hidden />
              </div>
            )}
            {recommended.map((s) => (
              <CollapsedChannelAvatar key={s.id} streamer={s} pathname={pathname} />
            ))}
          </div>
        )
      ) : (
        <>
          {followed.length > 0 && (
            <div className="px-2 pt-2 pb-1">
              <h3 className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-white/30">{t("following")}</h3>
              <div className="space-y-0.5">
                {followed.map((s) => (
                  <ChannelItem key={s.id} streamer={s} pathname={pathname} />
                ))}
              </div>
            </div>
          )}

          <div className="px-2 pt-2 pb-4">
            <h3 className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-white/30">{t("recommended")}</h3>
            <div className="space-y-0.5">
              {recommended.map((s) => (
                <ChannelItem key={s.id} streamer={s} pathname={pathname} />
              ))}
            </div>
          </div>
        </>
      )}
      </div>

      <div className="flex-shrink-0">
        <SidebarFooter collapsed={collapsed} />
      </div>
    </aside>
  );
}

function CollapsedChannelAvatar({
  streamer: s,
  pathname,
}: {
  streamer: typeof streamers[0];
  pathname: string;
}) {
  const isActive = pathname === `/${s.username}` || pathname === `/stream/${s.username}`;
  return (
    <Link
      href={`/${s.username}`}
      title={s.displayName}
      className={`relative flex-shrink-0 rounded-full transition-transform hover:scale-105 ${
        isActive ? "ring-2 ring-kick-green ring-offset-2 ring-offset-kick-surface" : ""
      }`}
    >
      <Image src={s.avatar} alt={s.displayName} width={36} height={36} className="rounded-full object-cover" />
      {s.isLive && (
        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-kick-surface" />
      )}
    </Link>
  );
}

function ChannelItem({ streamer: s, pathname }: { streamer: typeof streamers[0]; pathname: string }) {
  const { t } = useLanguage();
  const isActive = pathname === `/${s.username}` || pathname === `/stream/${s.username}`;
  return (
    <Link
      href={`/${s.username}`}
      className={`flex items-center gap-2.5 px-2 py-2 rounded-lg transition-colors group ${isActive ? "bg-kick-hover" : "hover:bg-kick-hover"}`}
    >
      <div className="relative flex-shrink-0">
        <Image src={s.avatar} alt={s.displayName} width={28} height={28} className="rounded-full" />
        {s.isLive && <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-kick-surface" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate group-hover:text-kick-green transition-colors">{s.displayName}</p>
        <p className="text-[10px] text-white/30 truncate">{getCategoryLabel(t, s.category)}</p>
      </div>
      {s.isLive && (
        <span className="text-[10px] text-kick-green font-medium flex-shrink-0">{formatNumber(s.viewers)}</span>
      )}
    </Link>
  );
}
