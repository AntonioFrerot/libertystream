"use client";

import { Sidebar } from "@/components/home/Sidebar";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)]">
      <Sidebar />
      <div className="flex-1 overflow-y-auto min-w-0">{children}</div>
    </div>
  );
}
