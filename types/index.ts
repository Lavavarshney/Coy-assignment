export interface Profile {
  id: string;
  name: string;
  age: number;
  photo: string;
  bio: string;
  location: string; // city or college
  interests: string[];
  hasLikedUser: boolean; // Mock pre-seed for demo matches
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
}
