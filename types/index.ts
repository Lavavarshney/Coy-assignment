export interface Profile {
  id: string;
  name: string;
  age: number;
  photo: string; // 1 reliable photo per profile
  bio: string;
  location: string;
  majorOrWork?: string;
  interests: string[];
  prompts?: { question: string; answer: string }[];
  spotifyAnthem?: { song: string; artist: string };
  hasLikedUser: boolean; // Server-only, stripped before sending to client
  isBlocked?: boolean;   // Ghost / Anti-stalker registry flag
}

export interface SwipeAction {
  profileId: string;
  action: 'like' | 'pass';
  timestamp: string;
}

export interface Match {
  id: string;
  profile: Profile;
  matchedAt: string;
}

export interface DbSchema {
  profiles: Profile[];
  swipes: Record<string, 'like' | 'pass'>;
  matches: Match[];
  blockedUserIds: string[]; // Ghost / Silent Block Registry
  history?: string[];
}
