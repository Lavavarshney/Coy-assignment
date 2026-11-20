import fs from 'fs';
import path from 'path';
import { DbSchema, Match, Profile, MatchMessage } from '../types';
import { INITIAL_PROFILES } from '../data/profiles';

const DB_FILE = path.join(process.cwd(), 'data', 'db.json');

export function ensureDbFile(): DbSchema {
  if (!fs.existsSync(DB_FILE)) {
    const initialData: DbSchema = {
      profiles: INITIAL_PROFILES,
      swipes: {},
      matches: [],
      blockedUserIds: ['p32'], // Example: p32 (Tushar) is silently blocked
      history: []
    };
    fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf8');
    return initialData;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed.blockedUserIds) parsed.blockedUserIds = ['p32'];
    return parsed;
  } catch (err) {
    const initialData: DbSchema = {
      profiles: INITIAL_PROFILES,
      swipes: {},
      matches: [],
      blockedUserIds: ['p32'],
      history: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf8');
    return initialData;
  }
}

export function saveDb(data: DbSchema): void {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

/**
 * Returns profiles that have NOT been swiped yet.
 * Ghost / Silent Block Rule: Silently excludes blocked users completely from the feed.
 * Core Privacy Rule: Strips `hasLikedUser` and `isBlocked` flags.
 */
export function getFeedProfiles(): Omit<Profile, 'hasLikedUser' | 'isBlocked'>[] {
  const db = ensureDbFile();
  const swipedIds = new Set(Object.keys(db.swipes));
  const blockedIds = new Set(db.blockedUserIds || []);

  return db.profiles
    .filter(p => !swipedIds.has(p.id) && !blockedIds.has(p.id))
    .map(({ hasLikedUser, isBlocked, ...safeProfile }) => safeProfile);
}

/**
 * Ghost / Silent Block: Block a user without alerting or confirming it.
 */
export function silentlyBlockUser(profileId: string): void {
  const db = ensureDbFile();
  if (!db.blockedUserIds) db.blockedUserIds = [];
  if (!db.blockedUserIds.includes(profileId)) {
    db.blockedUserIds.push(profileId);
  }
  // Automatically remove any existing mutual match silently
  db.matches = db.matches.filter(m => m.profile.id !== profileId);
  saveDb(db);
}

/**
 * Records a swipe with mutual match calculation & Ghost Shield protection.
 * Even if a blocked user liked the current user, or if someone likes a blocked user,
 * NO match is ever created and NO error is leaked.
 */
export function recordSwipe(profileId: string, action: 'like' | 'pass'): { isMatch: boolean; profile?: Profile } {
  const db = ensureDbFile();
  const profile = db.profiles.find(p => p.id === profileId);

  if (!profile) {
    throw new Error(`Profile with id ${profileId} not found`);
  }

  db.swipes[profileId] = action;
  const isBlocked = (db.blockedUserIds || []).includes(profileId);

  let isMatch = false;

  // Mutual match condition: action is LIKE, profile liked user, AND NOT BLOCKED
  if (action === 'like' && profile.hasLikedUser && !isBlocked) {
    isMatch = true;
    const existingMatch = db.matches.find(m => m.profile.id === profileId);
    if (!existingMatch) {
      db.matches.push({
        id: `match_${Date.now()}_${profileId}`,
        profile: profile,
        matchedAt: new Date().toISOString(),
        messages: [
          {
            id: `msg_init_${Date.now()}`,
            sender: 'match',
            text: `Hey! So glad we matched on Coy! 😊`,
            timestamp: new Date().toISOString()
          }
        ]
      });
    }
  }

  saveDb(db);
  // Returns identical neutral JSON structure: no leakage of blocked status!
  return { isMatch, profile };
}

export function getMatches(): Match[] {
  const db = ensureDbFile();
  return db.matches;
}

export function resetDatabase(): void {
  const freshData: DbSchema = {
    profiles: INITIAL_PROFILES,
    swipes: {},
    matches: [],
    blockedUserIds: ['p32'],
    history: []
  };
  saveDb(freshData);
}
