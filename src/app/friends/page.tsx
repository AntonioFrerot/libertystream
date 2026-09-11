"use client";

import { Suspense } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { FriendsScreen } from "@/components/friends/FriendsScreen";

function FriendsPageContent() {
  return (
    <MainLayout>
      <div className="friends-page-wrap max-w-3xl mx-auto px-4 py-8">
        <FriendsScreen />
      </div>
    </MainLayout>
  );
}

export default function FriendsPage() {
  return (
    <Suspense
      fallback={
        <MainLayout>
          <div className="friends-page-wrap max-w-3xl mx-auto px-4 py-8">
            <div className="w-8 h-8 rounded-full border-2 border-kick-green/30 border-t-kick-green animate-spin" />
          </div>
        </MainLayout>
      }
    >
      <FriendsPageContent />
    </Suspense>
  );
}
