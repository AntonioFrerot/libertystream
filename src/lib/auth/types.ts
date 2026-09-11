import { normalizeChannelSlug } from "@/lib/channel/userChannel";
import type { FriendEntry } from "@/lib/friends/types";

export interface StoredUser {
  id: string;
  username: string;
  email: string;
  password: string;
  avatar: string;
  channelSlug: string;
  displayName?: string;
  bio?: string;
  banner?: string;
  subscriptions: string[];
  follows: string[];
  friends: FriendEntry[];
  tips: { streamer: string; amount: string; date: string }[];
}

export interface PublicUser {
  id: string;
  username: string;
  email: string;
  avatar: string;
  channelSlug: string;
  displayName?: string;
  bio?: string;
  banner?: string;
  subscriptions: string[];
  follows: string[];
  friends: FriendEntry[];
}

export const USERS_KEY = "libertystream-users";
export const SESSION_KEY = "libertystream-session";

export const DEMO_USERS: StoredUser[] = [
  {
    id: "demo-1",
    username: "CyberFan",
    email: "demo@libertyplace.com",
    password: "demo123",
    avatar: "https://picsum.photos/seed/cyberfan/200/200",
    channelSlug: "cyberfan",
    subscriptions: ["neonwolf"],
    follows: ["neonwolf", "ironfist"],
    friends: [],
    tips: [],
  },
  {
    id: "demo-2",
    username: "NeonGirl",
    email: "neon@demo.com",
    password: "demo123",
    avatar: "https://picsum.photos/seed/neongirl/200/200",
    channelSlug: "neongirl",
    subscriptions: ["goldencards"],
    follows: ["goldencards", "velvetnight"],
    friends: [],
    tips: [{ streamer: "goldencards", amount: "25", date: new Date().toISOString() }],
  },
];

export function toPublicUser(user: StoredUser): PublicUser {
  const channelSlug = user.channelSlug ?? normalizeChannelSlug(user.username);
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    channelSlug,
    displayName: user.displayName,
    bio: user.bio,
    banner: user.banner,
    subscriptions: user.subscriptions,
    follows: user.follows,
    friends: user.friends ?? [],
  };
}
