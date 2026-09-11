import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "imagedelivery.net" },
      { protocol: "https", hostname: "s2.coinmarketcap.com" },
    ],
  },
  async redirects() {
    return [
      { source: "/casino", destination: "/jeux", permanent: false },
      { source: "/casino/originals", destination: "/jeux", permanent: false },
      { source: "/casino/originals/:slug", destination: "/jeux/solo/:slug", permanent: false },
      { source: "/jeux/solo/chicken", destination: "/jeux/solo/chicken-road", permanent: false },
      { source: "/jeux/solo/road", destination: "/jeux/solo/chicken-road", permanent: false },
    ];
  },
};

export default nextConfig;
