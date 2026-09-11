import { MainLayout } from "@/components/layout/MainLayout";

import { TwitchFeaturedCarousel } from "@/components/home/TwitchFeaturedCarousel";

import { CategoryCarousel } from "@/components/home/CategoryCarousel";

import { HomeCategoryRows, TopClipsRow } from "@/components/home/CategoryStreamRow";



export default function HomePage() {

  return (

    <MainLayout>
      <TwitchFeaturedCarousel />

      <div className="home-page px-4 lg:px-6 pt-0 md:pt-2 pb-0 md:pb-6 max-w-[1200px] mx-auto">
        <CategoryCarousel />
        <div className="[&>section:first-child]:mt-3 md:[&>section:first-child]:mt-6">
          <HomeCategoryRows />
        </div>
        <TopClipsRow />
      </div>
    </MainLayout>

  );

}

