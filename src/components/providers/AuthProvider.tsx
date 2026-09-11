"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { normalizeChannelSlug } from "@/lib/channel/userChannel";
import {
  isReservedUsername,
  normalizeUsernameKey,
  validateUsernameFormat,
} from "@/lib/auth/username";
import {
  DEMO_USERS,
  SESSION_KEY,
  USERS_KEY,
  toPublicUser,
  type PublicUser,
  type StoredUser,
} from "@/lib/auth/types";
import type { TranslationKey } from "@/lib/i18n/translations";
import type { FriendEntry } from "@/lib/friends/types";
import { sendDirectMessage } from "@/lib/messages/directMessages";
import { pushUserNotification } from "@/lib/messages/userNotifications";
import { findStoredUserById } from "@/lib/auth/userStore";

interface AuthContextValue {
  user: PublicUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => string | null;
  register: (username: string, email: string, password: string) => Promise<string | null>;
  logout: () => void;
  subscribe: (streamerUsername: string) => void;
  follow: (streamerUsername: string) => void;
  sendTip: (recipientUsername: string, amount: string, recipientUserId?: string) => void;
  addFriend: (friend: FriendEntry) => TranslationKey | null;
  removeFriend: (friendSlug: string) => void;
  sendFriendMessage: (friend: FriendEntry, text: string) => TranslationKey | null;
  isFriend: (friendSlug: string) => boolean;
  isSubscribed: (streamerUsername: string) => boolean;
  isFollowing: (streamerUsername: string) => boolean;
  updateAvatar: (avatar: string) => void;
  updateProfile: (data: { displayName?: string; bio?: string; banner?: string }) => void;
  changePassword: (currentPassword: string, newPassword: string) => TranslationKey | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function withChannelSlug(user: StoredUser): StoredUser {
  return {
    ...user,
    channelSlug: user.channelSlug ?? normalizeChannelSlug(user.username),
    friends: user.friends ?? [],
  };
}

function loadUsers(): StoredUser[] {
  if (typeof window === "undefined") return DEMO_USERS;
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) {
    localStorage.setItem(USERS_KEY, JSON.stringify(DEMO_USERS));
    return DEMO_USERS;
  }
  return JSON.parse(raw).map((u: StoredUser) => withChannelSlug(u)) as StoredUser[];
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function updateUser(userId: string, updater: (u: StoredUser) => StoredUser): PublicUser | null {
  const users = loadUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return null;
  users[idx] = updater(users[idx]);
  saveUsers(users);
  return toPublicUser(users[idx]);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsers();
    const sessionId = localStorage.getItem(SESSION_KEY);
    if (sessionId) {
      const found = loadUsers().find((u) => u.id === sessionId);
      if (found) setUser(toPublicUser(found));
      else localStorage.removeItem(SESSION_KEY);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((email: string, password: string): string | null => {
    const found = loadUsers().find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) return "authErrorInvalid";
    localStorage.setItem(SESSION_KEY, found.id);
    setUser(toPublicUser(found));
    return null;
  }, []);

  const register = useCallback(
    async (username: string, email: string, password: string): Promise<string | null> => {
      const trimmedUsername = username.trim();
      const trimmedEmail = email.trim();

      const formatError = validateUsernameFormat(trimmedUsername);
      if (formatError) return formatError;
      if (password.length < 6) return "authErrorPasswordShort";
      if (isReservedUsername(trimmedUsername)) return "authErrorUsernameTaken";

      const users = loadUsers();
      if (users.some((u) => u.email.toLowerCase() === trimmedEmail.toLowerCase())) {
        return "authErrorEmailTaken";
      }

      const slug = normalizeUsernameKey(trimmedUsername);
      if (
        users.some(
          (u) =>
            u.username.toLowerCase() === trimmedUsername.toLowerCase() ||
            normalizeUsernameKey(u.username) === slug,
        )
      ) {
        return "authErrorUsernameTaken";
      }

      const userId = `user-${Date.now()}`;

      try {
        const response = await fetch("/api/auth/username/reserve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            username: trimmedUsername,
            email: trimmedEmail,
          }),
        });

        const payload = (await response.json()) as { error?: TranslationKey };
        if (!response.ok) {
          return payload.error ?? "authErrorUsernameTaken";
        }
      } catch {
        return "authErrorServer";
      }

      const newUser: StoredUser = {
        id: userId,
        username: trimmedUsername,
        email: trimmedEmail,
        password,
        avatar: `https://picsum.photos/seed/${trimmedUsername}/200/200`,
        channelSlug: normalizeChannelSlug(trimmedUsername),
        subscriptions: [],
        follows: [],
        friends: [],
        tips: [],
      };
      users.push(newUser);
      saveUsers(users);
      localStorage.setItem(SESSION_KEY, newUser.id);
      setUser(toPublicUser(newUser));
      return null;
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  const subscribe = useCallback(
    (streamerUsername: string) => {
      if (!user) return;
      const updated = updateUser(user.id, (u) => ({
        ...u,
        subscriptions: u.subscriptions.includes(streamerUsername)
          ? u.subscriptions
          : [...u.subscriptions, streamerUsername],
      }));
      if (updated) setUser(updated);
    },
    [user]
  );

  const follow = useCallback(
    (streamerUsername: string) => {
      if (!user) return;
      const updated = updateUser(user.id, (u) => ({
        ...u,
        follows: u.follows.includes(streamerUsername)
          ? u.follows.filter((f) => f !== streamerUsername)
          : [...u.follows, streamerUsername],
      }));
      if (updated) setUser(updated);
    },
    [user]
  );

  const sendTip = useCallback(
    (recipientUsername: string, amount: string, recipientUserId?: string) => {
      if (!user) return;
      const updated = updateUser(user.id, (u) => ({
        ...u,
        tips: [
          ...u.tips,
          { streamer: recipientUsername, amount, date: new Date().toISOString() },
        ],
      }));
      if (updated) setUser(updated);

      if (recipientUserId && recipientUserId !== user.id) {
        pushUserNotification({
          userId: recipientUserId,
          title: "Tip reçu",
          body: `${user.displayName ?? user.username} t'a envoyé ${amount} €.`,
        });
      }
    },
    [user],
  );

  const isFriend = useCallback(
    (friendSlug: string) =>
      user?.friends.some((friend) => friend.slug === friendSlug.toLowerCase()) ?? false,
    [user],
  );

  const addFriend = useCallback(
    (friend: FriendEntry): TranslationKey | null => {
      if (!user) return "authErrorInvalid";
      const slug = friend.slug.toLowerCase();
      if (slug === user.channelSlug) return "friendsCannotAddSelf";
      if (isFriend(slug)) return "friendsAlreadyAdded";

      const updated = updateUser(user.id, (u) => ({
        ...u,
        friends: [...u.friends, { ...friend, slug }],
      }));
      if (updated) setUser(updated);
      return null;
    },
    [user, isFriend],
  );

  const removeFriend = useCallback(
    (friendSlug: string) => {
      if (!user) return;
      const slug = friendSlug.toLowerCase();
      const updated = updateUser(user.id, (u) => ({
        ...u,
        friends: u.friends.filter((friend) => friend.slug !== slug),
      }));
      if (updated) setUser(updated);
    },
    [user],
  );

  const sendFriendMessage = useCallback(
    (friend: FriendEntry, text: string): TranslationKey | null => {
      if (!user) return "authErrorInvalid";
      const trimmed = text.trim();
      if (!trimmed) return "friendsMessageEmpty";

      sendDirectMessage({
        fromUserId: user.id,
        toUserId: friend.userId,
        fromSlug: user.channelSlug,
        toSlug: friend.slug,
        fromUsername: user.username,
        text: trimmed,
      });

      const recipient = findStoredUserById(friend.userId);
      if (recipient) {
        pushUserNotification({
          userId: recipient.id,
          title: "Nouveau message",
          body: `${user.displayName ?? user.username} : ${trimmed.slice(0, 80)}`,
        });
      }

      return null;
    },
    [user],
  );

  const isSubscribed = useCallback(
    (streamerUsername: string) => user?.subscriptions.includes(streamerUsername) ?? false,
    [user]
  );

  const isFollowing = useCallback(
    (streamerUsername: string) => user?.follows.includes(streamerUsername) ?? false,
    [user]
  );

  const updateAvatar = useCallback(
    (avatar: string) => {
      if (!user) return;
      const updated = updateUser(user.id, (u) => ({ ...u, avatar }));
      if (updated) {
        setUser(updated);
        window.dispatchEvent(
          new CustomEvent("libertystream-profile-updated", { detail: { userId: user.id } })
        );
      }
    },
    [user]
  );

  const updateProfile = useCallback(
    (data: { displayName?: string; bio?: string; banner?: string }) => {
      if (!user) return;
      const updated = updateUser(user.id, (u) => ({ ...u, ...data }));
      if (updated) {
        setUser(updated);
        window.dispatchEvent(
          new CustomEvent("libertystream-profile-updated", { detail: { userId: user.id } })
        );
      }
    },
    [user]
  );

  const changePassword = useCallback(
    (currentPassword: string, newPassword: string): TranslationKey | null => {
      if (!user) return "authErrorInvalid";
      if (newPassword.length < 6) return "authErrorPasswordShort";
      const users = loadUsers();
      const stored = users.find((u) => u.id === user.id);
      if (!stored || stored.password !== currentPassword) return "settingsWrongPassword";
      const updated = updateUser(user.id, (u) => ({ ...u, password: newPassword }));
      if (updated) setUser(updated);
      return null;
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        subscribe,
        follow,
        sendTip,
        addFriend,
        removeFriend,
        sendFriendMessage,
        isFriend,
        isSubscribed,
        isFollowing,
        updateAvatar,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function useRequireAuth() {
  const auth = useAuth();
  const requireAuth = useCallback(
    (action: () => void, openLogin: () => void): boolean => {
      if (!auth.user) {
        openLogin();
        return false;
      }
      action();
      return true;
    },
    [auth.user]
  );
  return { ...auth, requireAuth };
}
