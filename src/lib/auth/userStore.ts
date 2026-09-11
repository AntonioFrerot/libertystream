import { DEMO_USERS, USERS_KEY, type StoredUser } from "@/lib/auth/types";
import { normalizeChannelSlug } from "@/lib/channel/userChannel";

export function withChannelSlug(user: StoredUser): StoredUser {
  return {
    ...user,
    channelSlug: user.channelSlug ?? normalizeChannelSlug(user.username),
    friends: user.friends ?? [],
  };
}

export function loadStoredUsers(): StoredUser[] {
  if (typeof window === "undefined") return DEMO_USERS.map(withChannelSlug);
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return DEMO_USERS.map(withChannelSlug);
    return (JSON.parse(raw) as StoredUser[]).map(withChannelSlug);
  } catch {
    return DEMO_USERS.map(withChannelSlug);
  }
}

export function findStoredUserBySlug(slug: string): StoredUser | undefined {
  const normalized = slug.toLowerCase();
  return loadStoredUsers().find((user) => user.channelSlug === normalized);
}

export function findStoredUserById(userId: string): StoredUser | undefined {
  return loadStoredUsers().find((user) => user.id === userId);
}
