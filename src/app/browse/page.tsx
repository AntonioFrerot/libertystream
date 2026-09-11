"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { Search } from "lucide-react";
import { CategoryNav } from "@/components/home/CategoryNav";
import { StreamGrid } from "@/components/stream/StreamCard";
import { MainLayout } from "@/components/layout/MainLayout";
import { parseCategoryParam } from "@/lib/categories";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { MobileScrollTopButton } from "@/components/ui/MobileScrollTopButton";
import type { CategoryId } from "@/lib/data";

function BrowseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useLanguage();
  const paramCategory = parseCategoryParam(searchParams.get("category"));
  const searchQuery = searchParams.get("q") ?? "";
  const [category, setCategory] = useState<CategoryId | "all">(paramCategory);
  const [input, setInput] = useState(searchQuery);

  useEffect(() => {
    setCategory(parseCategoryParam(searchParams.get("category")));
  }, [searchParams]);

  useEffect(() => {
    setInput(searchQuery);
  }, [searchQuery]);

  const handleSearch = () => {
    const q = input.trim();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category !== "all") params.set("category", category);
    const query = params.toString();
    router.push(query ? `/browse?${query}` : "/browse");
  };

  return (
    <>
      <div className="p-4 lg:p-6 max-w-[1400px]">
      <div className="relative mb-4 sm:hidden">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
        <input
          type="search"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("search")}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-kick-surface border border-kick-border text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-kick-green/40 transition-colors"
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
      </div>

      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold mb-1">{t("explore")}</h1>
        <p className="text-sm text-white/50">
          {searchQuery ? `${t("searchResults")} "${searchQuery}"` : t("exploreDesc")}
        </p>
      </div>
      <CategoryNav activeCategory={category} onCategoryChange={setCategory} />
      <StreamGrid filter={category} search={searchQuery} />
      </div>
      <MobileScrollTopButton />
    </>
  );
}

export default function BrowsePage() {
  const { t } = useLanguage();
  return (
    <MainLayout>
      <Suspense fallback={<div className="p-6 text-white/50">{t("loading")}</div>}>
        <BrowseContent />
      </Suspense>
    </MainLayout>
  );
}
