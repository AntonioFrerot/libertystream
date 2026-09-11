import { NextResponse } from "next/server";
import { normalizeUsernameKey } from "@/lib/auth/username";
import { searchRegisteredUsers } from "@/lib/auth/usernameRegistry.server";
import { streamers } from "@/lib/data";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";
  const excludeUserId = searchParams.get("excludeUserId")?.trim();

  if (query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const needle = query.toLowerCase();
  const slugNeedle = normalizeUsernameKey(query);
  const seen = new Set<string>();
  const results: {
    userId: string;
    username: string;
    slug: string;
    avatar: string;
    displayName?: string;
    source: "registry" | "streamer";
  }[] = [];

  const pushResult = (entry: {
    userId: string;
    username: string;
    slug: string;
    avatar: string;
    displayName?: string;
    source: "registry" | "streamer";
  }) => {
    if (excludeUserId && entry.userId === excludeUserId) return;
    if (seen.has(entry.slug)) return;
    seen.add(entry.slug);
    results.push(entry);
  };

  const registryMatches = await searchRegisteredUsers(query, 12);
  for (const entry of registryMatches) {
    pushResult({
      userId: entry.userId,
      username: entry.username,
      slug: entry.slug,
      avatar: `https://picsum.photos/seed/${entry.username}/200/200`,
      source: "registry",
    });
  }

  for (const streamer of streamers) {
    const slug = streamer.username.toLowerCase();
    if (
      streamer.username.toLowerCase().includes(needle) ||
      streamer.displayName.toLowerCase().includes(needle) ||
      slug.includes(slugNeedle)
    ) {
      pushResult({
        userId: `streamer-${slug}`,
        username: streamer.username,
        slug,
        avatar: streamer.avatar,
        displayName: streamer.displayName,
        source: "streamer",
      });
    }
  }

  return NextResponse.json({ results: results.slice(0, 12) });
}
