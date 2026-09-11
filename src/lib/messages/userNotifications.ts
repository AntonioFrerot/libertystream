export interface UserNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

const NOTIFICATIONS_KEY = "libertystream-user-notifications";

function loadNotifications(): UserNotification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as UserNotification[];
  } catch {
    return [];
  }
}

function saveNotifications(notifications: UserNotification[]) {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
}

export function getNotificationsForUser(userId: string): UserNotification[] {
  return loadNotifications()
    .filter((notification) => notification.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function pushUserNotification(input: {
  userId: string;
  title: string;
  body: string;
}) {
  const notification: UserNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    userId: input.userId,
    title: input.title,
    body: input.body,
    createdAt: new Date().toISOString(),
    read: false,
  };

  const notifications = loadNotifications();
  notifications.push(notification);
  saveNotifications(notifications);
  window.dispatchEvent(new CustomEvent("libertystream-notifications-updated"));
}

export function markAllNotificationsRead(userId: string) {
  const notifications = loadNotifications();
  let changed = false;
  const next = notifications.map((notification) => {
    if (notification.userId === userId && !notification.read) {
      changed = true;
      return { ...notification, read: true };
    }
    return notification;
  });
  if (!changed) return;
  saveNotifications(next);
  window.dispatchEvent(new CustomEvent("libertystream-notifications-updated"));
}

export function formatNotificationTime(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `${diffMin} min`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} h`;
  return `${Math.floor(diffHours / 24)} j`;
}
