import fs from 'fs';
import path from 'path';
import { DbSchema, Match, Profile } from '../types';
import { INITIAL_PROFILES } from '../data/profiles';

// On serverless environments (like Vercel / Netlify / Render), the local repo filesystem is strictly READ-ONLY.
// Writing to process.cwd()/data/db.json crashes with EROFS (Error: read-only file system) -> Status 500!
// /tmp is the standard writable scratch storage for serverless functions.
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NODE_ENV === 'production';
const DB_FILE = isServerless
  ? path.join('/tmp', 'coy_db.json')
  : path.join(process.cwd(), 'data', 'db.json');

// In-memory fallback in case of any filesystem write restrictions in container environments
let memoryDb: DbSchema | null = null;

export function ensureDbFile(): DbSchema {
  if (memoryDb) {
    return memoryDb;
  }

  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (!parsed.blockedUserIds) parsed.blockedUserIds = ['p32'];
      memoryDb = parsed;
      return parsed;
    }
  } catch (err) {
    console.warn('Unable to read from filesystem storage, falling back to memory state:', err);
  }

  const initialData: DbSchema = {
    profiles: INITIAL_PROFILES,
    swipes: {},
    matches: [],
    blockedUserIds: ['p32'],
    history: []
  };

  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf8');
  } catch (err) {
    console.warn('Filesystem write not permitted, using in-memory state:', err);
  }

  memoryDb = initialData;
  return initialData;
}

export function saveDb(data: DbSchema): void {
  memoryDb = data;
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    // Fail gracefully to in-memory state without throwing 500
    console.warn('Could not persist to disk, maintained in memory:', err);
  }
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
  db.matches = db.matches.filter(m => m.profile.id !== profileId);
  saveDb(db);
}

/**
 * Records a swipe with mutual match calculation & Ghost Shield protection.
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
        matchedAt: new Date().toISOString()
      });
    }
  }

  saveDb(db);
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
