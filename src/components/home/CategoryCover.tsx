"use client";

import Image from "next/image";
import Link from "next/link";
import { formatNumber } from "@/lib/utils";
import { useLanguage, getCategoryLabel } from "@/lib/i18n/LanguageProvider";
import type { Category } from "@/lib/data";

interface CategoryCoverProps {
  category: Category;
  href?: string;
  size?: "sm" | "md" | "lg";
  showLiveBadge?: boolean;
  linked?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "aspect-[3/4]",
  md: "aspect-[16/10]",
  lg: "aspect-[16/9]",
};

export function CategoryCover({
  category,
  href = "#",
  size = "sm",
  showLiveBadge = false,
  linked = true,
  className = "",
}: CategoryCoverProps) {
  const { t } = useLanguage();

  const content = (
    <div className={`relative overflow-hidden rounded-xl bg-kick-hover border border-kick-border ${size === "sm" ? "mb-2" : ""} ${sizeClasses[size]} ${className}`}>
      <Image
        src={category.image}
        alt={getCategoryLabel(t, category.id)}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
      {showLiveBadge && (
        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-red-500/80 text-[9px] font-bold uppercase">
          {t("live")}
        </div>
      )}
      {size === "sm" && (
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-sm font-semibold truncate">{getCategoryLabel(t, category.id)}</p>
          <p className="text-[10px] text-white/50">
            {formatNumber(category.streamCount)} {t("live").toLowerCase()}
          </p>
        </div>
      )}
    </div>
  );

  if (!linked) return content;

  return (
    <Link href={href} className="block group">
      {content}
    </Link>
  );
}

interface CategoryCardProps {
  category: Category;
  href: string;
}

export function CategoryCard({ category, href }: CategoryCardProps) {
  const { t } = useLanguage();

  return (
    <Link
      href={href}
      className="rounded-xl bg-kick-surface border border-kick-border hover:border-kick-green/30 transition-colors group overflow-hidden block"
    >
      <CategoryCover category={category} size="md" linked={false} className="rounded-none border-0" />
      <div className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">{category.icon}</span>
          <h2 className="font-display text-lg font-bold group-hover:text-kick-green transition-colors">
            {getCategoryLabel(t, category.id)}
          </h2>
        </div>
        <p className="text-sm text-white/50 mb-3 leading-relaxed line-clamp-2">{category.description}</p>
        <span className="text-xs text-white/30">
          {formatNumber(category.streamCount)} {t("activeStreamers")}
        </span>
      </div>
    </Link>
  );
}
