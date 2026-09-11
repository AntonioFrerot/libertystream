export interface FriendEntry {
  userId: string;
  username: string;
  slug: string;
}

export interface UserSearchResult {
  userId: string;
  username: string;
  slug: string;
  avatar: string;
  displayName?: string;
  source: "local" | "registry" | "streamer";
}
