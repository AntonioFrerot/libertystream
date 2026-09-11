"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { dispatchOpenInbox } from "@/lib/inbox/openInbox";
import type { InboxThreadTarget } from "@/lib/inbox/types";
import type { InboxTab } from "@/lib/inbox/useInbox";

export function useOpenInbox() {
  const router = useRouter();

  return useCallback(
    (tab: InboxTab = "messages", thread?: InboxThreadTarget) => {
      if (typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches) {
        const query = thread ? `?chat=${encodeURIComponent(thread.slug)}` : "";
        router.push(`/inbox${query}`);
        return;
      }
      dispatchOpenInbox({ tab, thread });
    },
    [router],
  );
}
