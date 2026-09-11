"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { friendAvatar } from "@/lib/friends/searchUsers";
import type { InboxThreadTarget } from "@/lib/inbox/types";
import { useInbox } from "@/lib/inbox/useInbox";
import { InboxPanel } from "@/components/inbox/InboxPanel";

export function MobileInboxScreen() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const inbox = useInbox("messages");
  const { ready, markMessagesRead } = inbox;
  const [thread, setThread] = useState<InboxThreadTarget | null>(null);

  const friends = user?.friends ?? [];

  const chatSlug = searchParams.get("chat");

  const chatFriend = useMemo(() => {
    if (!chatSlug) return null;
    return friends.find((friend) => friend.slug === chatSlug.toLowerCase()) ?? null;
  }, [chatSlug, friends]);

  useEffect(() => {
    if (!chatFriend) {
      setThread(null);
      return;
    }
    setThread({
      userId: chatFriend.userId,
      username: chatFriend.username,
      slug: chatFriend.slug,
      avatar: friendAvatar(chatFriend),
    });
  }, [chatFriend]);

  useEffect(() => {
    if (ready && !thread) markMessagesRead();
  }, [ready, thread, markMessagesRead]);

  const handleBack = useCallback(() => {
    if (thread) {
      setThread(null);
      if (chatSlug) {
        router.replace("/inbox", { scroll: false });
      }
      return;
    }
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/friends");
  }, [thread, chatSlug, router]);

  if (!ready) {
    return <div className="mobile-inbox-page lg:hidden" />;
  }

  return (
    <div className="mobile-inbox-page lg:hidden">
      <header className="mobile-inbox-header">
        <button type="button" className="mobile-inbox-back" onClick={handleBack} aria-label={t("back")}>
          <ChevronLeft className="w-5 h-5" />
          <span>{t("back")}</span>
        </button>
        <h1 className="mobile-inbox-title">{thread ? thread.username : t("inboxTitle")}</h1>
      </header>

      <div className="mobile-inbox-body">
        <InboxPanel
          inbox={inbox}
          variant="page"
          thread={thread}
          onThreadChange={setThread}
        />
      </div>
    </div>
  );
}
