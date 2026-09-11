"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { ClipsReelsFeed } from "@/components/clips/ClipsReelsFeed";

export default function ClipsPage() {
  return (
    <MainLayout>
      <div className="clips-page-offset">
        <ClipsReelsFeed />
      </div>
    </MainLayout>
  );
}
