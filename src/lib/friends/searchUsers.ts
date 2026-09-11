import { loadStoredUsers } from "@/lib/auth/userStore";
import { normalizeUsernameKey } from "@/lib/auth/username";
import type { UserSearchResult } from "@/lib/friends/types";

export async function searchUsers(
  query: string,
  excludeUserId?: string,
): Promise<UserSearchResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const needle = trimmed.toLowerCase();
  const slugNeedle = normalizeUsernameKey(trimmed);
  const seen = new Set<string>();
  const results: UserSearchResult[] = [];

  const push = (entry: UserSearchResult) => {
    if (excludeUserId && entry.userId === excludeUserId) return;
    if (seen.has(entry.slug)) return;
    seen.add(entry.slug);
    results.push(entry);
  };

  for (const user of loadStoredUsers()) {
    const slug = user.channelSlug;
    if (
      user.username.toLowerCase().includes(needle) ||
      slug.includes(slugNeedle) ||
      slug.startsWith(slugNeedle)
    ) {
      push({
        userId: user.id,
        username: user.username,
        slug,
        avatar: user.avatar,
        displayName: user.displayName,
        source: "local",
      });
    }
  }

  try {
    const params = new URLSearchParams({ q: trimmed });
    if (excludeUserId) params.set("excludeUserId", excludeUserId);
    const response = await fetch(`/api/users/search?${params.toString()}`);
    if (response.ok) {
      const payload = (await response.json()) as {
        results: (Omit<UserSearchResult, "source"> & { source: "registry" | "streamer" })[];
      };
      for (const entry of payload.results) {
        push({ ...entry, source: entry.source });
      }
    }
  } catch {
    // Ignore network errors — local results still shown.
  }

  return results.slice(0, 12);
}

export function friendAvatar(friend: { username: string; slug: string }, avatar?: string) {
  return avatar ?? `https://picsum.photos/seed/${friend.username}/200/200`;
}
