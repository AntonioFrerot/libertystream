"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MobileInboxScreen } from "@/components/inbox/MobileInboxScreen";

function InboxPageContent() {
  const router = useRouter();

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");

    const redirectDesktop = () => {
      if (media.matches) router.replace("/");
    };

    redirectDesktop();
    media.addEventListener("change", redirectDesktop);
    return () => media.removeEventListener("change", redirectDesktop);
  }, [router]);

  return <MobileInboxScreen />;
}

export default function InboxPage() {
  return (
    <Suspense fallback={<div className="mobile-inbox-page lg:hidden" />}>
      <InboxPageContent />
    </Suspense>
  );
}
