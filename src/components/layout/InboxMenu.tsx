"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useInbox } from "@/lib/inbox/useInbox";
import { INBOX_OPEN_EVENT, type InboxOpenDetail } from "@/lib/inbox/openInbox";
import type { InboxThreadTarget } from "@/lib/inbox/types";
import { InboxPanel } from "@/components/inbox/InboxPanel";

interface InboxMenuProps {
  placement?: "navbar" | "profile";
  onNavigate?: () => void;
}

export function InboxMenu({ placement = "navbar", onNavigate }: InboxMenuProps) {
  const { t } = useLanguage();
  const inbox = useInbox();
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [thread, setThread] = useState<InboxThreadTarget | null>(null);

  useEffect(() => {
    if (placement === "profile") return;
    const handler = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
        setThread(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [placement]);

  const { tab, markMessagesRead, markNotificationsRead, hasUnread, setTab } = inbox;

  useEffect(() => {
    if (placement !== "navbar") return;
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<InboxOpenDetail>).detail;
      if (detail?.tab) setTab(detail.tab);
      setThread(detail?.thread ?? null);
      setOpen(true);
    };
    window.addEventListener(INBOX_OPEN_EVENT, handler);
    return () => window.removeEventListener(INBOX_OPEN_EVENT, handler);
  }, [placement, setTab]);

  useEffect(() => {
    if (!open) return;
    if (tab === "messages") markMessagesRead();
    else markNotificationsRead();
  }, [open, tab, markMessagesRead, markNotificationsRead]);

  if (placement === "profile") {
    return (
      <Link
        href="/inbox"
        onClick={onNavigate}
        aria-label={t("inboxTitle")}
        className="inbox-trigger inbox-trigger-profile"
      >
        <span className="relative flex items-center justify-center">
          <Mail className="w-[18px] h-[18px] text-white/75" strokeWidth={1.75} />
          {hasUnread && <span className="inbox-trigger-badge" aria-hidden />}
        </span>
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((value) => {
            const next = !value;
            if (!next) setThread(null);
            return next;
          });
        }}
        aria-expanded={open}
        aria-label={t("inboxTitle")}
        className={`inbox-trigger ${open ? "inbox-trigger-open" : ""}`}
      >
        <span className="relative flex items-center justify-center">
          <Mail className="w-[18px] h-[18px] text-white/75" strokeWidth={1.75} />
          {hasUnread && <span className="inbox-trigger-badge" aria-hidden />}
        </span>
      </button>

      {open && (
        <div className="inbox-dropdown">
          <InboxPanel inbox={inbox} variant="dropdown" thread={thread} onThreadChange={setThread} />
        </div>
      )}
    </div>
  );
}
