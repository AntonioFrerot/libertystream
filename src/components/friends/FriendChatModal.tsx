"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Send } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { FriendEntry } from "@/lib/friends/types";
import { friendAvatar } from "@/lib/friends/searchUsers";
import {
  formatMessageTime,
  getConversationMessages,
  markConversationRead,
} from "@/lib/messages/directMessages";
import type { TranslationKey } from "@/lib/i18n/translations";

interface FriendChatModalProps {
  open: boolean;
  friend: FriendEntry | null;
  friendAvatarUrl?: string;
  onClose: () => void;
}

export function FriendChatModal({ open, friend, friendAvatarUrl, onClose }: FriendChatModalProps) {
  const { t } = useLanguage();
  const { user, sendFriendMessage } = useAuth();
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !user || !friend) return;
    markConversationRead(user.id, friend.userId);
    const onUpdate = () => setTick((value) => value + 1);
    window.addEventListener("libertystream-messages-updated", onUpdate);
    return () => window.removeEventListener("libertystream-messages-updated", onUpdate);
  }, [open, user, friend]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [open, friend, tick]);

  if (!friend || !user) return null;

  const messages = getConversationMessages(user.id, friend.userId);
  const avatar = friendAvatarUrl ?? friendAvatar(friend);

  const handleSend = () => {
    setError(null);
    const errKey = sendFriendMessage(friend, draft);
    if (errKey) {
      setError(t(errKey as TranslationKey));
      return;
    }
    setDraft("");
    setTick((value) => value + 1);
  };

  return (
    <Modal open={open} onClose={onClose} title={t("friendsChatWith", { name: friend.username })}>
      <div className="friends-chat-thread">
        {messages.length === 0 ? (
          <p className="text-sm text-white/45 text-center py-8">{t("friendsChatEmpty")}</p>
        ) : (
          <ul className="friends-chat-messages">
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
        <div ref={bottomRef} />
      </div>

      {error && (
        <p className="text-sm text-red-400 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 mb-3">
          {error}
        </p>
      )}

      <div className="friends-chat-compose">
        <Image
          src={avatar}
          alt={friend.username}
          width={36}
          height={36}
          className="rounded-full object-cover flex-shrink-0"
        />
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
          className="friends-chat-input"
        />
        <button type="button" className="friends-chat-send" onClick={handleSend} aria-label={t("friendsSendMessage")}>
          <Send className="w-4 h-4" />
        </button>
      </div>
    </Modal>
  );
}
