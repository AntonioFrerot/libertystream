"use client";

import Image from "next/image";
import { Bell, Mail } from "lucide-react";
import { InboxThreadView } from "@/components/inbox/InboxThreadView";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { InboxThreadTarget } from "@/lib/inbox/types";
import type { useInbox } from "@/lib/inbox/useInbox";

interface InboxPanelProps {
  inbox: ReturnType<typeof useInbox>;
  variant?: "dropdown" | "page";
  thread?: InboxThreadTarget | null;
  onThreadChange?: (thread: InboxThreadTarget | null) => void;
}

export function InboxPanel({
  inbox,
  variant = "dropdown",
  thread = null,
  onThreadChange,
}: InboxPanelProps) {
  const { t } = useLanguage();
  const { tab, messages, notifications, unreadMessages, unreadNotifications, setTab } = inbox;

  const panelClass = variant === "page" ? "inbox-panel inbox-panel-page" : "inbox-panel";

  if (thread) {
    return (
      <InboxThreadView
        target={thread}
        variant={variant}
        onBack={() => onThreadChange?.(null)}
      />
    );
  }

  return (
    <>
      <div className={`inbox-tabs ${variant === "page" ? "inbox-tabs-page" : ""}`}>
        <button
          type="button"
          onClick={() => setTab("messages")}
          className={`inbox-tab ${tab === "messages" ? "inbox-tab-active" : ""}`}
        >
          <Mail className="w-4 h-4" strokeWidth={1.75} />
          <span>{t("inboxMessages")}</span>
          {unreadMessages > 0 && <span className="inbox-tab-count">{unreadMessages}</span>}
        </button>
        <button
          type="button"
          onClick={() => setTab("notifications")}
          className={`inbox-tab ${tab === "notifications" ? "inbox-tab-active" : ""}`}
        >
          <Bell className="w-4 h-4" strokeWidth={1.75} />
          <span>{t("inboxNotifications")}</span>
          {unreadNotifications > 0 && (
            <span className="inbox-tab-count">{unreadNotifications}</span>
          )}
        </button>
      </div>

      <div className={panelClass}>
        {tab === "messages" ? (
          messages.length > 0 ? (
            <ul className="inbox-list">
              {messages.map((message) => (
                <li key={message.id}>
                  <button
                    type="button"
                    className="inbox-item"
                    onClick={() => {
                      if (!message.partnerSlug) return;
                      onThreadChange?.({
                        userId: message.partnerUserId ?? message.id,
                        username: message.from,
                        slug: message.partnerSlug,
                        avatar: message.avatar,
                      });
                    }}
                  >
                    <Image
                      src={message.avatar}
                      alt={message.from}
                      width={40}
                      height={40}
                      className="rounded-full flex-shrink-0 object-cover"
                    />
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-white truncate">{message.from}</span>
                        <span className="text-[11px] text-white/35 flex-shrink-0">{message.time}</span>
                      </div>
                      <p className="text-xs text-white/50 truncate mt-0.5">{message.preview}</p>
                    </div>
                    {message.unread && <span className="inbox-item-dot" aria-hidden />}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="inbox-empty">
              <Mail className="w-8 h-8 text-white/20 mb-2" />
              <p className="text-sm text-white/50">{t("inboxNoMessages")}</p>
            </div>
          )
        ) : notifications.length > 0 ? (
          <ul className="inbox-list">
            {notifications.map((notification) => (
              <li key={notification.id}>
                <button type="button" className="inbox-item">
                  <div className="inbox-notif-icon">
                    <Bell className="w-4 h-4 text-kick-green" strokeWidth={1.75} />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-white truncate">{notification.title}</span>
                      <span className="text-[11px] text-white/35 flex-shrink-0">{notification.time}</span>
                    </div>
                    <p className="text-xs text-white/50 mt-0.5">{notification.body}</p>
                  </div>
                  {notification.unread && <span className="inbox-item-dot" aria-hidden />}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="inbox-empty">
            <Bell className="w-8 h-8 text-white/20 mb-2" />
            <p className="text-sm text-white/50">{t("inboxNoNotifications")}</p>
          </div>
        )}
      </div>
    </>
  );
}
