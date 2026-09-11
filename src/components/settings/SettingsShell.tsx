"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Radio,
  Bell,
  Shield,
  MessageSquare,
  Wallet,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const NAV_ITEMS = [
  { href: "/settings/profile", icon: User, labelKey: "settingsNavProfile" as const },
  { href: "/settings/preferences", icon: Wallet, labelKey: "settingsNavPreferences" as const },
  { href: "/settings/stream", icon: Radio, labelKey: "settingsNavStream" as const },
  { href: "/settings/notifications", icon: Bell, labelKey: "settingsNavNotifications" as const },
  { href: "/settings/security", icon: Shield, labelKey: "settingsNavSecurity" as const },
  { href: "/settings/chat", icon: MessageSquare, labelKey: "settingsNavChat" as const },
];

export function SettingsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-kick-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-display text-2xl font-bold text-white mb-6">{t("settingsPageTitle")}</h1>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <nav className="lg:w-56 flex-shrink-0">
            <ul className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-hide">
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.href} className="flex-shrink-0">
                    <Link
                      href={item.href}
                      className={`settings-nav-item ${active ? "settings-nav-item-active" : ""}`}
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} />
                      <span>{t(item.labelKey)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="settings-panel">
      <div className="settings-panel-header">
        <h2 className="settings-panel-title">{title}</h2>
        {description && <p className="settings-panel-desc">{description}</p>}
      </div>
      <div className="settings-panel-body">{children}</div>
    </section>
  );
}

export function SettingsField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="settings-field">
      <label className="settings-field-label">{label}</label>
      {children}
      {hint && <p className="settings-field-hint">{hint}</p>}
    </div>
  );
}

export function SettingsInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`settings-input ${props.className ?? ""}`} />;
}

export function SettingsTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`settings-textarea ${props.className ?? ""}`} />;
}

export function SettingsSaveButton({
  onClick,
  disabled,
  label,
}: {
  onClick: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="btn-kick px-6 py-2.5 text-sm mt-2">
      {label}
    </button>
  );
}

export function SettingsToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="settings-toggle-row">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{label}</p>
        {description && <p className="text-xs text-white/40 mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`settings-toggle ${checked ? "settings-toggle-on" : ""}`}
      >
        <span className="settings-toggle-knob" />
      </button>
    </div>
  );
}
