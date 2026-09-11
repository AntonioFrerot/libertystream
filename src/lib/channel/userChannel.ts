import type { Streamer } from "@/lib/data";
import type { StoredUser } from "@/lib/auth/types";

/** Slug URL style Kick — kick.com/{username} */
export function normalizeChannelSlug(username: string): string {
  return username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
}

export function getUserChannelPath(user: { username: string; channelSlug?: string }): string {
  return `/${user.channelSlug ?? normalizeChannelSlug(user.username)}`;
}

export function streamerFromUser(
  user: Pick<StoredUser, "username" | "avatar" | "channelSlug" | "displayName" | "bio" | "banner">
): Streamer {
  const slug = user.channelSlug ?? normalizeChannelSlug(user.username);
  return {
    id: `channel-${slug}`,
    username: slug,
    displayName: user.displayName ?? user.username,
    avatar: user.avatar,
    banner: user.banner ?? `https://picsum.photos/seed/${slug}-banner/1200/400`,
    category: "gaming",
    isLive: false,
    viewers: 0,
    followers: 0,
    title: user.bio?.trim() || `${user.displayName ?? user.username}, Hors ligne`,
    tags: ["LibertyPlace"],
    verified: false,
  };
}

export function isOwnChannel(
  viewer: { username: string; channelSlug?: string } | null | undefined,
  streamerUsername: string
): boolean {
  if (!viewer) return false;
  const slug = viewer.channelSlug ?? normalizeChannelSlug(viewer.username);
  return slug === streamerUsername.toLowerCase();
}
