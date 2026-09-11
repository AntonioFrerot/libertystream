"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./Footer";

export function ConditionalFooter() {
  const pathname = usePathname();
  if (pathname.startsWith("/stream/") || pathname.startsWith("/settings")) return null;
  return <Footer compactTop={pathname === "/"} />;
}
