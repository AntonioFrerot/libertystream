import { findStoredUserById } from "@/lib/auth/userStore";

export interface DirectMessage {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromSlug: string;
  toSlug: string;
  fromUsername: string;
  text: string;
  createdAt: string;
  readByRecipient: boolean;
}

const DMS_KEY = "libertystream-direct-messages";

function loadMessages(): DirectMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DMS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as DirectMessage[];
  } catch {
    return [];
  }
}

function saveMessages(messages: DirectMessage[]) {
  localStorage.setItem(DMS_KEY, JSON.stringify(messages));
}

export function getConversationMessages(userId: string, friendUserId: string): DirectMessage[] {
  return loadMessages()
    .filter(
      (message) =>
        (message.fromUserId === userId && message.toUserId === friendUserId) ||
        (message.fromUserId === friendUserId && message.toUserId === userId),
    )
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function sendDirectMessage(input: {
  fromUserId: string;
  toUserId: string;
  fromSlug: string;
  toSlug: string;
  fromUsername: string;
  text: string;
}): DirectMessage {
  const trimmed = input.text.trim();
  if (!trimmed) throw new Error("Empty message");

  const message: DirectMessage = {
    id: `dm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    fromUserId: input.fromUserId,
    toUserId: input.toUserId,
    fromSlug: input.fromSlug,
    toSlug: input.toSlug,
    fromUsername: input.fromUsername,
    text: trimmed,
    createdAt: new Date().toISOString(),
    readByRecipient: false,
  };

  const messages = loadMessages();
  messages.push(message);
  saveMessages(messages);
  window.dispatchEvent(new CustomEvent("libertystream-messages-updated"));
  return message;
}

export function markConversationRead(userId: string, friendUserId: string) {
  const messages = loadMessages();
  let changed = false;
  const next = messages.map((message) => {
    if (message.toUserId === userId && message.fromUserId === friendUserId && !message.readByRecipient) {
      changed = true;
      return { ...message, readByRecipient: true };
    }
    return message;
  });
  if (!changed) return;
  saveMessages(next);
  window.dispatchEvent(new CustomEvent("libertystream-messages-updated"));
}

export function getInboxThreadsForUser(userId: string) {
  const messages = loadMessages().filter(
    (message) => message.fromUserId === userId || message.toUserId === userId,
  );

  const byPartner = new Map<string, DirectMessage[]>();
  for (const message of messages) {
    const partnerId = message.fromUserId === userId ? message.toUserId : message.fromUserId;
    const list = byPartner.get(partnerId) ?? [];
    list.push(message);
    byPartner.set(partnerId, list);
  }

  return Array.from(byPartner.entries())
    .map(([partnerId, thread]) => {
      const latest = thread[thread.length - 1];
      const partnerUser = findStoredUserById(partnerId);
      const partnerSlug =
        latest.fromUserId === partnerId ? latest.fromSlug : latest.toSlug;
      const partnerUsername =
        latest.fromUserId === partnerId ? latest.fromUsername : partnerUser?.username ?? partnerSlug;
      const unread = thread.some(
        (message) => message.toUserId === userId && !message.readByRecipient,
      );

      return {
        partnerId,
        partnerSlug,
        partnerUsername,
        partnerAvatar:
          partnerUser?.avatar ?? `https://picsum.photos/seed/${partnerUsername}/200/200`,
        preview: latest.text,
        createdAt: latest.createdAt,
        unread,
      };
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function formatMessageTime(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `${diffMin} min`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} j`;
  return date.toLocaleDateString();
}
