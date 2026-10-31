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

const LOCAL_REGISTRY_PATH = path.join(process.cwd(), "data", "username-registry.json");
const TMP_REGISTRY_PATH = path.join("/tmp", "libertystream-username-registry.json");

const memoryRegistry: UsernameRegistryFile = { entries: [] };
let memoryHydrated = false;

function registryPaths(): string[] {
  return process.env.VERCEL ? [TMP_REGISTRY_PATH] : [LOCAL_REGISTRY_PATH, TMP_REGISTRY_PATH];
}

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
  if (memoryHydrated) return memoryRegistry;

  for (const filePath of registryPaths()) {
    try {
      const raw = await fs.readFile(filePath, "utf8");
      const parsed = JSON.parse(raw) as UsernameRegistryFile;
      memoryRegistry.entries = Array.isArray(parsed.entries) ? parsed.entries : [];
      memoryHydrated = true;
      return memoryRegistry;
    } catch {
      // Fichier absent ou illisible — on tente le chemin suivant.
    }
  }

  memoryHydrated = true;
  return memoryRegistry;
}

async function saveRegistry(registry: UsernameRegistryFile): Promise<void> {
  memoryRegistry.entries = registry.entries;
  memoryHydrated = true;
  const payload = JSON.stringify(registry, null, 2);

  for (const filePath of registryPaths()) {
    try {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, payload, "utf8");
      return;
    } catch {
      // Sur Vercel le disque du projet est en lecture seule : on passe à /tmp.
    }
  }
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

export async function renameUsername(input: {
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

    if (findSlugConflict(registry, slug, input.userId)) {
      return { ok: false, error: "authErrorUsernameTaken" as const };
    }

    const index = registry.entries.findIndex((entry) => entry.userId === input.userId);
    if (index >= 0) {
      registry.entries[index] = {
        ...registry.entries[index],
        username: trimmedUsername,
        slug,
        email: trimmedEmail,
      };
    } else {
      registry.entries.push({
        userId: input.userId,
        username: trimmedUsername,
        slug,
        email: trimmedEmail,
        createdAt: new Date().toISOString(),
      });
    }

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

export async function listAllRegisteredUsers(): Promise<UsernameRegistryEntry[]> {
  const registry = await ensureRegistryFile();
  return [...registry.entries].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function deleteRegisteredUser(userId: string): Promise<boolean> {
  return withRegistryLock(async () => {
    const registry = await ensureRegistryFile();
    const nextEntries = registry.entries.filter((entry) => entry.userId !== userId);
    if (nextEntries.length === registry.entries.length) return false;
    await saveRegistry({ entries: nextEntries });
    return true;
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
