"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { isAdminEmail } from "@/lib/auth/admin";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function AdminHomeButton() {
  const { user } = useAuth();
  const { t } = useLanguage();

  if (!isAdminEmail(user?.email)) return null;

  return (
    <div className="flex justify-center px-4 pb-8 pt-4">
      <Link
        href="/admin"
        className="inline-flex items-center justify-center rounded-lg bg-red-600 px-5 py-2.5 text-sm font-extrabold tracking-widest text-white shadow-lg shadow-red-900/40 transition hover:bg-red-500"
      >
        {t("adminButton")}
      </Link>
    </div>
  );
}
