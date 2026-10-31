"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useToast } from "@/components/ui/Toast";
import { isAdminEmail } from "@/lib/auth/admin";
import { DEMO_USERS, USERS_KEY, type StoredUser } from "@/lib/auth/types";

interface ServerAccount {
  userId: string;
  username: string;
  slug: string;
  email: string;
  createdAt: string;
}

function loadLocalUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return DEMO_USERS;
    return JSON.parse(raw) as StoredUser[];
  } catch {
    return DEMO_USERS;
  }
}

function saveLocalUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function randomPassword() {
  return `Lp${Math.random().toString(36).slice(2, 8)}A1`;
}

export function AdminScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [query, setQuery] = useState("");
  const [localUsers, setLocalUsers] = useState<StoredUser[]>([]);
  const [serverAccounts, setServerAccounts] = useState<ServerAccount[]>([]);

  const allowed = isAdminEmail(user?.email);

  const refreshLocal = useCallback(() => {
    setLocalUsers(loadLocalUsers());
  }, []);

  const refreshServer = useCallback(async () => {
    if (!user?.email) return;
    try {
      const response = await fetch("/api/admin/accounts", {
        headers: { "x-admin-email": user.email },
      });
      if (!response.ok) return;
      const payload = (await response.json()) as { accounts?: ServerAccount[] };
      setServerAccounts(payload.accounts ?? []);
    } catch {
      setServerAccounts([]);
    }
  }, [user?.email]);

  useEffect(() => {
    if (isLoading) return;
    if (!allowed) {
      router.replace("/");
      return;
    }
    refreshLocal();
    void refreshServer();
  }, [allowed, isLoading, refreshLocal, refreshServer, router]);

  const filteredLocal = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return localUsers;
    return localUsers.filter(
      (entry) =>
        entry.username.toLowerCase().includes(needle) ||
        entry.email.toLowerCase().includes(needle),
    );
  }, [localUsers, query]);

  const filteredServer = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return serverAccounts;
    return serverAccounts.filter(
      (entry) =>
        entry.username.toLowerCase().includes(needle) ||
        entry.email.toLowerCase().includes(needle) ||
        entry.slug.includes(needle),
    );
  }, [query, serverAccounts]);

  const deleteLocal = (userId: string, email: string) => {
    if (isAdminEmail(email)) {
      showToast(t("adminCannotDeleteSelf"));
      return;
    }
    saveLocalUsers(loadLocalUsers().filter((entry) => entry.id !== userId));
    refreshLocal();
    showToast(t("adminDeleted"));
  };

  const resetPassword = (userId: string) => {
    const nextPassword = randomPassword();
    const users = loadLocalUsers().map((entry) =>
      entry.id === userId ? { ...entry, password: nextPassword } : entry,
    );
    saveLocalUsers(users);
    refreshLocal();
    showToast(t("adminPasswordResetDone", { password: nextPassword }));
  };

  const deleteServer = async (userId: string, email: string) => {
    if (!user?.email) return;
    if (isAdminEmail(email)) {
      showToast(t("adminCannotDeleteSelf"));
      return;
    }
    await fetch("/api/admin/accounts", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "x-admin-email": user.email,
      },
      body: JSON.stringify({ userId }),
    });
    deleteLocal(userId, email);
    await refreshServer();
  };

  if (isLoading || !allowed) {
    return (
      <MainLayout>
        <div className="px-4 py-16 text-center text-white/40 text-sm">{t("adminDenied")}</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-[1100px] mx-auto px-4 lg:px-6 py-8">
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-white">{t("adminTitle")}</h1>
        <p className="mt-2 text-sm text-white/50">{t("adminDesc")}</p>

        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("adminSearch")}
          className="mt-6 w-full max-w-md rounded-xl border border-white/10 bg-[#12151c] px-4 py-2.5 text-sm text-white outline-none focus:border-red-500/60"
        />

        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/70">{t("adminLocalAccounts")}</h2>
          <div className="mt-3 overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-white/5 text-xs uppercase tracking-wider text-white/40">
                <tr>
                  <th className="px-4 py-3">{t("username")}</th>
                  <th className="px-4 py-3">{t("email")}</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filteredLocal.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-white/40">
                      {t("adminNoAccounts")}
                    </td>
                  </tr>
                ) : (
                  filteredLocal.map((entry) => (
                    <tr key={entry.id} className="border-t border-white/8">
                      <td className="px-4 py-3 text-white">{entry.username}</td>
                      <td className="px-4 py-3 text-white/70">{entry.email}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          className="mr-2 rounded-md bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20"
                          onClick={() => resetPassword(entry.id)}
                        >
                          {t("adminResetPassword")}
                        </button>
                        <button
                          type="button"
                          className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500"
                          onClick={() => deleteLocal(entry.id, entry.email)}
                        >
                          {t("adminDelete")}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/70">{t("adminServerAccounts")}</h2>
          <div className="mt-3 overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-white/5 text-xs uppercase tracking-wider text-white/40">
                <tr>
                  <th className="px-4 py-3">{t("username")}</th>
                  <th className="px-4 py-3">{t("email")}</th>
                  <th className="px-4 py-3">{t("adminCreatedAt")}</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filteredServer.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-white/40">
                      {t("adminNoAccounts")}
                    </td>
                  </tr>
                ) : (
                  filteredServer.map((entry) => (
                    <tr key={entry.userId} className="border-t border-white/8">
                      <td className="px-4 py-3 text-white">{entry.username}</td>
                      <td className="px-4 py-3 text-white/70">{entry.email}</td>
                      <td className="px-4 py-3 text-white/50">
                        {new Date(entry.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500"
                          onClick={() => void deleteServer(entry.userId, entry.email)}
                        >
                          {t("adminDelete")}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
