export interface Streamer {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  banner: string;
  category: CategoryId;
  isLive: boolean;
  viewers: number;
  followers: number;
  title: string;
  tags: string[];
  verified: boolean;
  vip?: boolean;
}

export type CategoryId =
  | "gaming"
  | "casino"
  | "irl"
  | "combat"
  | "porno";

export interface Category {
  id: CategoryId;
  name: string;
  icon: string;
  color: string;
  description: string;
  streamCount: number;
  image: string;
}

export const categories: Category[] = [
  {
    id: "gaming",
    name: "Gaming",
    icon: "🎮",
    color: "from-neon-cyan/20 to-neon-blue/10",
    description: "Jeux vidéo, esports et compétitions",
    streamCount: 2847,
    image: "/categories/gaming.png",
  },
  {
    id: "casino",
    name: "Casino",
    icon: "🎰",
    color: "from-neon-gold/20 to-amber-600/10",
    description: "Poker, slots et jeux de hasard en direct",
    streamCount: 892,
    image: "/categories/casino.png",
  },
  {
    id: "irl",
    name: "IRL",
    icon: "🌍",
    color: "from-emerald-500/20 to-teal-500/10",
    description: "Vie réelle, voyages et aventures",
    streamCount: 1456,
    image: "/categories/irl.png",
  },
  {
    id: "combat",
    name: "Combat",
    icon: "🥊",
    color: "from-red-500/20 to-orange-500/10",
    description: "Sports de combat, MMA et boxe",
    streamCount: 634,
    image: "/categories/combat.png",
  },
  {
    id: "porno",
    name: "Porno",
    icon: "🔞",
    color: "from-neon-purple/20 to-pink-500/10",
    description: "Contenu adulte consenti 18+",
    streamCount: 1923,
    image: "/categories/porno.png",
  },
];

const extraStreamers: Omit<Streamer, "id">[] = [
  { username: "pixelstorm", displayName: "PixelStorm", avatar: "https://picsum.photos/seed/pixelstorm/200/200", banner: "https://picsum.photos/seed/pixelstorm-b/1200/400", category: "gaming", isLive: true, viewers: 8234, followers: 312000, title: "Valorant Ranked Grind,  Road to Radiant", tags: ["Valorant", "FPS"], verified: false },
  { username: "ragequit", displayName: "RageQuit", avatar: "https://picsum.photos/seed/ragequit/200/200", banner: "https://picsum.photos/seed/ragequit-b/1200/400", category: "gaming", isLive: true, viewers: 4521, followers: 189000, title: "Dark Souls,  No Hit Run Attempt #47", tags: ["Souls", "Hardcore"], verified: true },
  { username: "luckystrike", displayName: "LuckyStrike", avatar: "https://picsum.photos/seed/luckystrike/200/200", banner: "https://picsum.photos/seed/luckystrike-b/1200/400", category: "casino", isLive: true, viewers: 6234, followers: 278000, title: "Slots Marathon,  €10K Challenge", tags: ["Slots", "Casino"], verified: true },
  { username: "royalflush", displayName: "RoyalFlush", avatar: "https://picsum.photos/seed/royalflush/200/200", banner: "https://picsum.photos/seed/royalflush-b/1200/400", category: "casino", isLive: true, viewers: 2845, followers: 156000, title: "Blackjack Strategy Session", tags: ["Blackjack"], verified: false },
  { username: "blitzops", displayName: "BlitzOps", avatar: "https://picsum.photos/seed/blitzops/200/200", banner: "https://picsum.photos/seed/blitzops-b/1200/400", category: "gaming", isLive: true, viewers: 3789, followers: 142000, title: "Apex Legends Ranked,  Push Masters", tags: ["FPS", "Apex"], verified: false },
  { username: "diceking", displayName: "DiceKing", avatar: "https://picsum.photos/seed/diceking/200/200", banner: "https://picsum.photos/seed/diceking-b/1200/400", category: "casino", isLive: true, viewers: 4120, followers: 198000, title: "Roulette & Craps,  Table VIP", tags: ["Roulette", "VIP"], verified: true },
  { username: "nomadcam", displayName: "NomadCam", avatar: "https://picsum.photos/seed/nomadcam/200/200", banner: "https://picsum.photos/seed/nomadcam-b/1200/400", category: "irl", isLive: true, viewers: 2234, followers: 88000, title: "Barcelona Beach Walk,  Live", tags: ["Travel", "Spain"], verified: false },
  { username: "strikeforce", displayName: "StrikeForce", avatar: "https://picsum.photos/seed/strikeforce/200/200", banner: "https://picsum.photos/seed/strikeforce-b/1200/400", category: "combat", isLive: true, viewers: 5120, followers: 167000, title: "Muay Thai Pad Work,  Live Gym", tags: ["Muay Thai", "Training"], verified: true },
  { username: "scarlet", displayName: "Scarlet", avatar: "https://picsum.photos/seed/scarlet/200/200", banner: "https://picsum.photos/seed/scarlet-b/1200/400", category: "porno", isLive: true, viewers: 3567, followers: 201000, title: "Premium Lounge,  18+ Live", tags: ["18+", "Premium"], verified: true },
  { username: "wanderlust", displayName: "WanderLust", avatar: "https://picsum.photos/seed/wanderlust/200/200", banner: "https://picsum.photos/seed/wanderlust-b/1200/400", category: "irl", isLive: true, viewers: 2890, followers: 98000, title: "Paris Rooftops,  Sunset Live", tags: ["Travel", "France"], verified: false },
  { username: "cityvibes", displayName: "CityVibes", avatar: "https://picsum.photos/seed/cityvibes/200/200", banner: "https://picsum.photos/seed/cityvibes-b/1200/400", category: "irl", isLive: true, viewers: 1567, followers: 67000, title: "NYC Street Food Tour", tags: ["Food", "NYC"], verified: true },
  { username: "knockoutking", displayName: "KnockoutKing", avatar: "https://picsum.photos/seed/knockoutking/200/200", banner: "https://picsum.photos/seed/knockoutking-b/1200/400", category: "combat", isLive: true, viewers: 9876, followers: 445000, title: "Boxing Training,  Heavy Bag Session", tags: ["Boxing"], verified: true },
  { username: "grappler", displayName: "Grappler", avatar: "https://picsum.photos/seed/grappler/200/200", banner: "https://picsum.photos/seed/grappler-b/1200/400", category: "combat", isLive: true, viewers: 3456, followers: 123000, title: "BJJ Rolling,  Open Mat Live", tags: ["BJJ", "Grappling"], verified: false },
  { username: "midnightrose", displayName: "MidnightRose", avatar: "https://picsum.photos/seed/midnightrose/200/200", banner: "https://picsum.photos/seed/midnightrose-b/1200/400", category: "porno", isLive: true, viewers: 4321, followers: 234000, title: "Private Show,  VIP Only 18+", tags: ["18+", "VIP"], verified: true },
  { username: "velvetdream", displayName: "VelvetDream", avatar: "https://picsum.photos/seed/velvetdream/200/200", banner: "https://picsum.photos/seed/velvetdream-b/1200/400", category: "porno", isLive: true, viewers: 2987, followers: 178000, title: "Late Night Talk,  18+ Interactive", tags: ["18+", "Interactive"], verified: false },
];

export const streamers: Streamer[] = [
  {
    id: "1",
    username: "neonwolf",
    displayName: "NeonWolf",
    avatar: "https://picsum.photos/seed/neonwolf/200/200",
    banner: "https://picsum.photos/seed/neonwolf-banner/1200/400",
    category: "gaming",
    isLive: true,
    viewers: 12450,
    followers: 892000,
    title: "Cyberpunk 2077,  Run No Deaths | 100% Subs to Streamer",
    tags: ["FPS", "RPG", "Français"],
    verified: true,
    vip: true,
  },
  {
    id: "2",
    username: "goldencards",
    displayName: "GoldenCards",
    avatar: "https://picsum.photos/seed/goldencards/200/200",
    banner: "https://picsum.photos/seed/goldencards-banner/1200/400",
    category: "casino",
    isLive: true,
    viewers: 8934,
    followers: 456000,
    title: "High Stakes Poker,  €50K Table Live",
    tags: ["Poker", "High Stakes", "VIP"],
    verified: true,
    vip: true,
  },
  {
    id: "3",
    username: "streetpulse",
    displayName: "StreetPulse",
    avatar: "https://picsum.photos/seed/streetpulse/200/200",
    banner: "https://picsum.photos/seed/streetpulse-banner/1200/400",
    category: "irl",
    isLive: true,
    viewers: 3421,
    followers: 234000,
    title: "Tokyo Night Walk,  Live from Shibuya",
    tags: ["Travel", "Japan", "Night"],
    verified: true,
  },
  {
    id: "4",
    username: "ironfist",
    displayName: "IronFist",
    avatar: "https://picsum.photos/seed/ironfist/200/200",
    banner: "https://picsum.photos/seed/ironfist-banner/1200/400",
    category: "combat",
    isLive: true,
    viewers: 15678,
    followers: 678000,
    title: "UFC Watch Party + Training Session",
    tags: ["MMA", "Boxing", "Training"],
    verified: true,
    vip: true,
  },
  {
    id: "5",
    username: "velvetnight",
    displayName: "VelvetNight",
    avatar: "https://picsum.photos/seed/velvetnight/200/200",
    banner: "https://picsum.photos/seed/velvetnight-banner/1200/400",
    category: "porno",
    isLive: true,
    viewers: 5678,
    followers: 345000,
    title: "Late Night Lounge,  18+ Only",
    tags: ["18+", "Lounge", "Premium"],
    verified: true,
  },
  ...extraStreamers.map((s, i) => ({ ...s, id: String(i + 6) })),
];

export interface Clip {
  id: string;
  title: string;
  thumbnail: string;
  videoUrl: string;
  streamerUsername: string;
  streamerName: string;
  streamerAvatar: string;
  views: number;
  duration: string;
  category: CategoryId;
}

const demoClipVideos = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
];

export const topClipsOfWeek: Clip[] = [
  {
    id: "c1",
    title: "Clutch impossible au dernier second,  la foule devient folle",
    thumbnail: "https://picsum.photos/seed/clip1/1920/1080",
    videoUrl: demoClipVideos[0],
    streamerUsername: "neonwolf",
    streamerName: "NeonWolf",
    streamerAvatar: "https://picsum.photos/seed/neonwolf/200/200",
    views: 284000,
    duration: "0:47",
    category: "gaming",
  },
  {
    id: "c2",
    title: "€100K pot gagné en direct,  réaction légendaire",
    thumbnail: "https://picsum.photos/seed/clip2/1920/1080",
    videoUrl: demoClipVideos[1],
    streamerUsername: "goldencards",
    streamerName: "GoldenCards",
    streamerAvatar: "https://picsum.photos/seed/goldencards/200/200",
    views: 198000,
    duration: "1:12",
    category: "casino",
  },
  {
    id: "c3",
    title: "Knockout brutal en slow motion,  UFC watch party",
    thumbnail: "https://picsum.photos/seed/clip3/1920/1080",
    videoUrl: demoClipVideos[2],
    streamerUsername: "ironfist",
    streamerName: "IronFist",
    streamerAvatar: "https://picsum.photos/seed/ironfist/200/200",
    views: 156000,
    duration: "0:28",
    category: "combat",
  },
  {
    id: "c4",
    title: "Tokyo à 3h du matin,  moment complètement surréaliste",
    thumbnail: "https://picsum.photos/seed/clip4/1920/1080",
    videoUrl: demoClipVideos[3],
    streamerUsername: "streetpulse",
    streamerName: "StreetPulse",
    streamerAvatar: "https://picsum.photos/seed/streetpulse/200/200",
    views: 142000,
    duration: "2:05",
    category: "irl",
  },
  {
    id: "c5",
    title: "Le moment le plus drôle de la semaine,  chat en délire",
    thumbnail: "https://picsum.photos/seed/clip5/1920/1080",
    videoUrl: demoClipVideos[4],
    streamerUsername: "velvetnight",
    streamerName: "VelvetNight",
    streamerAvatar: "https://picsum.photos/seed/velvetnight/200/200",
    views: 128000,
    duration: "0:55",
    category: "porno",
  },
  {
    id: "c6",
    title: "Ace 1v5 clutch,  comment c'est possible ?!",
    thumbnail: "https://picsum.photos/seed/clip6/1920/1080",
    videoUrl: demoClipVideos[5],
    streamerUsername: "neonwolf",
    streamerName: "NeonWolf",
    streamerAvatar: "https://picsum.photos/seed/neonwolf/200/200",
    views: 115000,
    duration: "1:34",
    category: "gaming",
  },
  {
    id: "c7",
    title: "All-in au mauvais moment,  €50K perdus en 3 secondes",
    thumbnail: "https://picsum.photos/seed/clip7/1920/1080",
    videoUrl: demoClipVideos[6],
    streamerUsername: "goldencards",
    streamerName: "GoldenCards",
    streamerAvatar: "https://picsum.photos/seed/goldencards/200/200",
    views: 98000,
    duration: "0:41",
    category: "casino",
  },
  {
    id: "c8",
    title: "Entraînement MMA,  combo dévastateur filmé en 4K",
    thumbnail: "https://picsum.photos/seed/clip8/1920/1080",
    videoUrl: demoClipVideos[7],
    streamerUsername: "ironfist",
    streamerName: "IronFist",
    streamerAvatar: "https://picsum.photos/seed/ironfist/200/200",
    views: 87000,
    duration: "1:08",
    category: "combat",
  },
];

export function formatNumber(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(".", ",") + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(".", ",") + "K";
  return num.toString();
}

export function getCategoryById(id: CategoryId): Category | undefined {
  return categories.find((c) => c.id === id);
}

export function getStreamerByUsername(username: string): Streamer | undefined {
  return streamers.find((s) => s.username === username);
}

export function getStreamersByCategory(categoryId: CategoryId): Streamer[] {
  return streamers.filter((s) => s.category === categoryId && s.isLive);
}

export function getClipById(id: string): Clip | undefined {
  return topClipsOfWeek.find((c) => c.id === id);
}
