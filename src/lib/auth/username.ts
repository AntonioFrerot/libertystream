import { DEMO_USERS } from "@/lib/auth/types";
import { normalizeChannelSlug } from "@/lib/channel/userChannel";
import { streamers } from "@/lib/data";
import type { TranslationKey } from "@/lib/i18n/translations";

export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 25;
export const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/;

export function normalizeUsernameKey(username: string): string {
  return normalizeChannelSlug(username);
}

export function getReservedUsernameSlugs(): ReadonlySet<string> {
  const slugs = new Set<string>();
  for (const streamer of streamers) {
    slugs.add(normalizeUsernameKey(streamer.username));
  }
  for (const user of DEMO_USERS) {
    slugs.add(normalizeUsernameKey(user.username));
  }
  return slugs;
}

export function validateUsernameFormat(username: string): TranslationKey | null {
  const trimmed = username.trim();
  if (trimmed.length < USERNAME_MIN_LENGTH) return "authErrorUsernameInvalid";
  if (trimmed.length > USERNAME_MAX_LENGTH) return "authErrorUsernameInvalid";
  if (!USERNAME_PATTERN.test(trimmed)) return "authErrorUsernameInvalid";

  const slug = normalizeUsernameKey(trimmed);
  if (slug.length < USERNAME_MIN_LENGTH) return "authErrorUsernameInvalid";

  return null;
}

export function isReservedUsername(username: string): boolean {
  const slug = normalizeUsernameKey(username);
  return getReservedUsernameSlugs().has(slug);
}
