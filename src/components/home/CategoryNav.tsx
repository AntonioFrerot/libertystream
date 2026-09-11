"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { categories, type CategoryId } from "@/lib/data";
import { formatNumber } from "@/lib/utils";
import { useLanguage, getCategoryLabel } from "@/lib/i18n/LanguageProvider";
import { CategoryCard } from "@/components/home/CategoryCover";

interface CategoryNavProps {
  activeCategory?: CategoryId | "all";
  onCategoryChange?: (category: CategoryId | "all") => void;
}

export function CategoryNav({ activeCategory = "all", onCategoryChange }: CategoryNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();
  const [active, setActive] = useState<CategoryId | "all">(activeCategory);

  const handleClick = (cat: CategoryId | "all") => {
    setActive(cat);
    onCategoryChange?.(cat);
    if (pathname === "/") {
      router.push(cat === "all" ? "/browse" : `/browse?category=${cat}`);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        <button type="button" onClick={() => handleClick("all")} className={`category-pill ${active === "all" ? "category-pill-active" : ""}`}>
          <span>🔥</span><span>{t("all")}</span>
        </button>
        {categories.map((cat) => (
          <button type="button" key={cat.id} onClick={() => handleClick(cat.id)} className={`category-pill ${active === cat.id ? "category-pill-active" : ""}`}>
            <span>{cat.icon}</span>
            <span>{getCategoryLabel(t, cat.id)}</span>
            <span className="text-xs text-white/40 ml-1">{formatNumber(cat.streamCount)}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export function CategoryGrid() {
  const { t } = useLanguage();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold">{t("categories")}</h2>
        <Link href="/categories" className="text-sm text-neon-cyan hover:text-neon-cyan/80 transition-colors">{t("viewAll")}</Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <CategoryCard key={cat.id} category={cat} href={`/browse?category=${cat.id}`} />
        ))}
      </div>
    </section>
  );
}
