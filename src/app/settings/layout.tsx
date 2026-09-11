"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { SettingsShell } from "@/components/settings/SettingsShell";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-kick-bg">
        <div className="w-8 h-8 rounded-full border-2 border-kick-green/30 border-t-kick-green animate-spin" />
      </div>
    );
  }

  return <SettingsShell>{children}</SettingsShell>;
}
