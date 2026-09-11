"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

interface MobileScrollTopButtonProps {
  threshold?: number;
}

export function MobileScrollTopButton({ threshold = 280 }: MobileScrollTopButtonProps) {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  if (!visible) return null;

  return (
    <button
      type="button"
      className="scroll-top-btn lg:hidden"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label={t("scrollToTop")}
    >
      <ChevronUp className="w-5 h-5" strokeWidth={2.25} />
    </button>
  );
}
