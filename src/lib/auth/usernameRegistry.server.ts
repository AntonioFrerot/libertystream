import { promises as fs } from "fs";
import path from "path";
import {
  getReservedUsernameSlugs,
  normalizeUsernameKey,
  validateUsernameFormat,
} from "@/lib/auth/username";
import type { TranslationKey } from "@/lib/i18n/translations";

export interface UsernameRegistryEntry {
  userId: string;
  username: string;
  slug: string;
  email: string;
  createdAt: string;
}

interface UsernameRegistryFile {
  entries: UsernameRegistryEntry[];
}

const REGISTRY_DIR = path.join(process.cwd(), "data");
const REGISTRY_PATH = path.join(REGISTRY_DIR, "username-registry.json");

let writeQueue: Promise<void> = Promise.resolve();

async function withRegistryLock<T>(operation: () => Promise<T>): Promise<T> {
  const run = writeQueue.then(operation);
  writeQueue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function ensureRegistryFile(): Promise<UsernameRegistryFile> {
  await fs.mkdir(REGISTRY_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(REGISTRY_PATH, "utf8");
    const parsed = JSON.parse(raw) as UsernameRegistryFile;
    if (!Array.isArray(parsed.entries)) return { entries: [] };
    return parsed;
  } catch {
    const empty: UsernameRegistryFile = { entries: [] };
    await fs.writeFile(REGISTRY_PATH, JSON.stringify(empty, null, 2), "utf8");
    return empty;
  }
}

async function saveRegistry(registry: UsernameRegistryFile): Promise<void> {
  await fs.mkdir(REGISTRY_DIR, { recursive: true });
  await fs.writeFile(REGISTRY_PATH, JSON.stringify(registry, null, 2), "utf8");
}

function findSlugConflict(
  registry: UsernameRegistryFile,
  slug: string,
  ignoreUserId?: string,
): boolean {
  return registry.entries.some(
    (entry) => entry.slug === slug && entry.userId !== ignoreUserId,
  );
}

function findEmailConflict(
  registry: UsernameRegistryFile,
  email: string,
  ignoreUserId?: string,
): boolean {
  const normalized = email.trim().toLowerCase();
  return registry.entries.some(
    (entry) => entry.email.toLowerCase() === normalized && entry.userId !== ignoreUserId,
  );
}

export async function checkUsernameAvailability(
  username: string,
  email?: string,
): Promise<{ available: boolean; error: TranslationKey | null }> {
  const formatError = validateUsernameFormat(username);
  if (formatError) return { available: false, error: formatError };

  const slug = normalizeUsernameKey(username);
  if (getReservedUsernameSlugs().has(slug)) {
    return { available: false, error: "authErrorUsernameTaken" };
  }

  const registry = await ensureRegistryFile();
  if (findSlugConflict(registry, slug)) {
    return { available: false, error: "authErrorUsernameTaken" };
  }

  if (email && findEmailConflict(registry, email)) {
    return { available: false, error: "authErrorEmailTaken" };
  }

  return { available: true, error: null };
}

export async function reserveUsername(input: {
  userId: string;
  username: string;
  email: string;
}): Promise<{ ok: true } | { ok: false; error: TranslationKey }> {
  const trimmedUsername = input.username.trim();
  const trimmedEmail = input.email.trim();

  const formatError = validateUsernameFormat(trimmedUsername);
  if (formatError) return { ok: false, error: formatError };

  const slug = normalizeUsernameKey(trimmedUsername);
  if (getReservedUsernameSlugs().has(slug)) {
    return { ok: false, error: "authErrorUsernameTaken" };
  }

  return withRegistryLock(async () => {
    const registry = await ensureRegistryFile();

    if (findSlugConflict(registry, slug)) {
      return { ok: false, error: "authErrorUsernameTaken" as const };
    }
    if (findEmailConflict(registry, trimmedEmail)) {
      return { ok: false, error: "authErrorEmailTaken" as const };
    }

    registry.entries.push({
      userId: input.userId,
      username: trimmedUsername,
      slug,
      email: trimmedEmail,
      createdAt: new Date().toISOString(),
    });

    await saveRegistry(registry);
    return { ok: true as const };
  });
}

export async function releaseUsername(userId: string): Promise<void> {
  await withRegistryLock(async () => {
    const registry = await ensureRegistryFile();
    const nextEntries = registry.entries.filter((entry) => entry.userId !== userId);
    if (nextEntries.length === registry.entries.length) return;
    await saveRegistry({ entries: nextEntries });
  });
}

export async function searchRegisteredUsers(
  query: string,
  limit = 10,
): Promise<UsernameRegistryEntry[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const needle = trimmed.toLowerCase();
  const slugNeedle = normalizeUsernameKey(trimmed);
  const registry = await ensureRegistryFile();

  return registry.entries
    .filter(
      (entry) =>
        entry.username.toLowerCase().includes(needle) ||
        entry.slug.includes(slugNeedle) ||
        entry.slug.startsWith(slugNeedle),
    )
    .slice(0, limit);
}
