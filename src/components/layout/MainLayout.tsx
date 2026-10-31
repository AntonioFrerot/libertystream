"use client";

import { Sidebar } from "@/components/home/Sidebar";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="main-layout flex min-h-[calc(100dvh-3.5rem)] max-lg:min-h-0">
      <Sidebar />
      <div className="main-layout-content min-w-0 flex-1 overflow-y-auto max-lg:overflow-y-visible">
        {children}
      </div>
    </div>
  );
}
