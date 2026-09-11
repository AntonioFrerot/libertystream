"use client";

import Link from "next/link";
import { categories } from "@/lib/data";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { MainLayout } from "@/components/layout/MainLayout";
import { CategoryCard } from "@/components/home/CategoryCover";

export default function CategoriesPage() {
  const { t } = useLanguage();

  return (
    <MainLayout>
      <div className="p-4 lg:p-6 max-w-[1400px]">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold mb-1">{t("categoriesTitle")}</h1>
          <p className="text-sm text-white/50">{t("categoriesDesc")}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} href={`/browse?category=${cat.id}`} />
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
