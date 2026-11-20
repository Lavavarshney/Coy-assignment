export interface Profile {
  id: string;
  name: string;
  age: number;
  photos: string[];
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

export interface MatchMessage {
  id: string;
  sender: 'user' | 'match';
  text: string;
  timestamp: string;
}

export interface Match {
  id: string;
  profile: Profile;
  matchedAt: string;
  messages?: MatchMessage[];
}

export interface DbSchema {
  profiles: Profile[];
  swipes: Record<string, 'like' | 'pass'>;
  matches: Match[];
  blockedUserIds: string[]; // Ghost / Silent Block Registry
  history?: string[];
}
