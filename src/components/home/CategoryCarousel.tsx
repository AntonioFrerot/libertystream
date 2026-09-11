"use client";

import { categories } from "@/lib/data";
import { CategoryCover } from "@/components/home/CategoryCover";

export function CategoryCarousel() {
  return (
    <section className="mt-2 md:mt-8">
      <div className="category-carousel-track flex gap-3 overflow-x-auto pb-0 md:pb-2 scrollbar-hide snap-x snap-mandatory overscroll-x-contain -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap md:justify-center md:overflow-visible md:snap-none">
        {categories.map((cat) => (
          <div key={cat.id} className="w-[132px] sm:w-[148px] flex-shrink-0 snap-start md:w-[140px] lg:w-[160px]">
            <CategoryCover
              category={cat}
              href={`/browse?category=${cat.id}`}
              size="sm"
              showLiveBadge
            />
          </div>
        ))}
      </div>
    </section>
  );
}
