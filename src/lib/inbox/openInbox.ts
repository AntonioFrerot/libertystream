import type { InboxTab } from "@/lib/inbox/useInbox";
import type { InboxThreadTarget } from "@/lib/inbox/types";

export const INBOX_OPEN_EVENT = "libertystream-open-inbox";

export interface InboxOpenDetail {
  tab?: InboxTab;
  thread?: InboxThreadTarget;
}

export function dispatchOpenInbox(detail: InboxOpenDetail = {}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<InboxOpenDetail>(INBOX_OPEN_EVENT, { detail }));
}
