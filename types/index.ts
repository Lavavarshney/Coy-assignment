export interface Profile {
  id: string;
  name: string;
  age: number;
  photos: string[]; // Multi-photo Instagram story support
  bio: string;
  location: string;
  majorOrWork?: string;
  interests: string[];
  prompts?: { question: string; answer: string }[];
  spotifyAnthem?: { song: string; artist: string };
  hasLikedUser: boolean; // Server-only, stripped before sending to client
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
  history: string[]; // IDs in swipe order for Rewind/Undo capability
}
