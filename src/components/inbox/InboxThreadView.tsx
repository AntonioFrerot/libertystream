"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, Send } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { friendAvatar } from "@/lib/friends/searchUsers";
import type { InboxThreadTarget } from "@/lib/inbox/types";
import {
  formatMessageTime,
  getConversationMessages,
  markConversationRead,
} from "@/lib/messages/directMessages";
import type { TranslationKey } from "@/lib/i18n/translations";

interface InboxThreadViewProps {
  target: InboxThreadTarget;
  variant?: "dropdown" | "page";
  onBack: () => void;
}

export function InboxThreadView({ target, variant = "dropdown", onBack }: InboxThreadViewProps) {
  const { t } = useLanguage();
  const { user, sendFriendMessage } = useAuth();
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const bodyRef = useRef<HTMLDivElement>(null);

  const avatar = target.avatar ?? friendAvatar(target);

  const scrollThreadToBottom = () => {
    const body = bodyRef.current;
    if (!body) return;
    body.scrollTop = body.scrollHeight;
  };

  useEffect(() => {
    if (!user) return;
    markConversationRead(user.id, target.userId);
    const onUpdate = () => setTick((value) => value + 1);
    window.addEventListener("libertystream-messages-updated", onUpdate);
    return () => window.removeEventListener("libertystream-messages-updated", onUpdate);
  }, [user, target.userId]);

  useEffect(() => {
    scrollThreadToBottom();
  }, [target.userId, tick]);

  if (!user) return null;

  const messages = getConversationMessages(user.id, target.userId);

  const handleSend = () => {
    setError(null);
    const errKey = sendFriendMessage(
      { userId: target.userId, username: target.username, slug: target.slug },
      draft,
    );
    if (errKey) {
      setError(t(errKey as TranslationKey));
      return;
    }
    setDraft("");
    setTick((value) => value + 1);
  };

  const rootClass =
    variant === "page" ? "inbox-thread inbox-thread-page" : "inbox-thread inbox-thread-dropdown";

  return (
    <div className={rootClass}>
      {variant === "dropdown" && (
        <div className="inbox-thread-header">
          <button type="button" className="inbox-thread-back" onClick={onBack}>
            <ChevronLeft className="w-4 h-4" />
            <span>{t("inboxMessages")}</span>
          </button>
          <div className="inbox-thread-peer">
            <Image
              src={avatar}
              alt={target.username}
              width={32}
              height={32}
              className="rounded-full object-cover flex-shrink-0"
            />
            <span className="truncate">{target.username}</span>
          </div>
        </div>
      )}

      <div className="inbox-thread-body" ref={bodyRef}>
        {messages.length === 0 ? (
          <p className="inbox-thread-empty">{t("friendsChatEmpty")}</p>
        ) : (
          <ul className="friends-chat-messages inbox-thread-messages">
            {messages.map((message) => {
              const mine = message.fromUserId === user.id;
              return (
                <li
                  key={message.id}
                  className={`friends-chat-bubble-row${mine ? " friends-chat-bubble-row-mine" : ""}`}
                >
                  <div className={`friends-chat-bubble${mine ? " friends-chat-bubble-mine" : ""}`}>
                    <p>{message.text}</p>
                    <span>{formatMessageTime(message.createdAt)}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {error && <p className="inbox-thread-error">{error}</p>}

      <div className="inbox-thread-compose">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={t("friendsMessagePlaceholder")}
          className="inbox-thread-input"
        />
        <button
          type="button"
          className="inbox-thread-send"
          onClick={handleSend}
          aria-label={t("friendsSendMessage")}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
