"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  DEMO_MESSAGES,
  DEMO_NOTIFICATIONS,
  type InboxMessage,
  type InboxNotification,
} from "@/lib/inbox/demoData";
import {
  formatMessageTime,
  getInboxThreadsForUser,
} from "@/lib/messages/directMessages";
import {
  formatNotificationTime,
  getNotificationsForUser,
  markAllNotificationsRead,
} from "@/lib/messages/userNotifications";

export type InboxTab = "messages" | "notifications";

const STORAGE_KEY = "libertystream-inbox-read";

interface ReadState {
  messages: string[];
  notifications: string[];
}

function loadReadState(): ReadState {
  if (typeof window === "undefined") {
    return { messages: [], notifications: [] };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { messages: [], notifications: [] };
    const parsed = JSON.parse(raw) as ReadState;
    return {
      messages: Array.isArray(parsed.messages) ? parsed.messages : [],
      notifications: Array.isArray(parsed.notifications) ? parsed.notifications : [],
    };
  } catch {
    return { messages: [], notifications: [] };
  }
}

function saveReadState(state: ReadState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function applyReadState(
  messages: InboxMessage[],
  notifications: InboxNotification[],
  read: ReadState,
) {
  return {
    messages: messages.map((m) => ({ ...m, unread: !read.messages.includes(m.id) })),
    notifications: notifications.map((n) => ({ ...n, unread: !read.notifications.includes(n.id) })),
  };
}

function buildLiveMessages(userId: string): InboxMessage[] {
  return getInboxThreadsForUser(userId).map((thread) => ({
    id: thread.partnerId,
    from: thread.partnerUsername,
    avatar: thread.partnerAvatar,
    preview: thread.preview,
    time: formatMessageTime(thread.createdAt),
    unread: thread.unread,
    partnerUserId: thread.partnerId,
    partnerSlug: thread.partnerSlug,
  }));
}

function buildLiveNotifications(userId: string): InboxNotification[] {
  return getNotificationsForUser(userId).map((notification) => ({
    id: notification.id,
    title: notification.title,
    body: notification.body,
    time: formatNotificationTime(notification.createdAt),
    unread: !notification.read,
  }));
}

export function useInbox(initialTab: InboxTab = "messages") {
  const { user } = useAuth();
  const [tab, setTab] = useState<InboxTab>(initialTab);
  const [messages, setMessages] = useState<InboxMessage[]>(DEMO_MESSAGES);
  const [notifications, setNotifications] = useState<InboxNotification[]>(DEMO_NOTIFICATIONS);
  const [ready, setReady] = useState(false);

  const refreshInbox = useCallback(() => {
    const read = loadReadState();
    if (user) {
      const next = applyReadState(buildLiveMessages(user.id), buildLiveNotifications(user.id), read);
      setMessages(next.messages);
      setNotifications(next.notifications);
      return;
    }
    const next = applyReadState(DEMO_MESSAGES, DEMO_NOTIFICATIONS, read);
    setMessages(next.messages);
    setNotifications(next.notifications);
  }, [user]);

  useEffect(() => {
    refreshInbox();
    setReady(true);
  }, [refreshInbox]);

  useEffect(() => {
    const onMessages = () => refreshInbox();
    const onNotifications = () => refreshInbox();
    window.addEventListener("libertystream-messages-updated", onMessages);
    window.addEventListener("libertystream-notifications-updated", onNotifications);
    return () => {
      window.removeEventListener("libertystream-messages-updated", onMessages);
      window.removeEventListener("libertystream-notifications-updated", onNotifications);
    };
  }, [refreshInbox]);

  const markMessagesRead = useCallback(() => {
    setMessages((items) => {
      const read = loadReadState();
      const ids = items.map((m) => m.id);
      saveReadState({ ...read, messages: [...new Set([...read.messages, ...ids])] });
      return items.map((item) => ({ ...item, unread: false }));
    });
  }, []);

  const markNotificationsRead = useCallback(() => {
    if (user) markAllNotificationsRead(user.id);
    setNotifications((items) => {
      const read = loadReadState();
      const ids = items.map((n) => n.id);
      saveReadState({ ...read, notifications: [...new Set([...read.notifications, ...ids])] });
      return items.map((item) => ({ ...item, unread: false }));
    });
  }, [user]);

  const handleTabChange = useCallback(
    (next: InboxTab) => {
      setTab(next);
      if (next === "messages") markMessagesRead();
      else markNotificationsRead();
    },
    [markMessagesRead, markNotificationsRead],
  );

  const unreadMessages = messages.filter((m) => m.unread).length;
  const unreadNotifications = notifications.filter((n) => n.unread).length;
  const hasUnread = unreadMessages + unreadNotifications > 0;

  return {
    ready,
    tab,
    messages,
    notifications,
    unreadMessages,
    unreadNotifications,
    hasUnread,
    setTab: handleTabChange,
    markMessagesRead,
    markNotificationsRead,
  };
}
