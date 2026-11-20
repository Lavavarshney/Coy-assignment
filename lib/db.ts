import fs from 'fs';
import path from 'path';
import { DbSchema, Match, Profile } from '../types';
import { INITIAL_PROFILES } from '../data/profiles';

const DB_FILE = path.join(process.cwd(), 'data', 'db.json');

function ensureDbFile(): DbSchema {
  if (!fs.existsSync(DB_FILE)) {
    const initialData: DbSchema = {
      profiles: INITIAL_PROFILES,
      swipes: {},
      matches: []
    };
    fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf8');
    return initialData;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading DB, resetting to defaults:', err);
    const initialData: DbSchema = {
      profiles: INITIAL_PROFILES,
      swipes: {},
      matches: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf8');
    return initialData;
  }
}

function saveDb(data: DbSchema): void {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

/**
 * Returns profiles that have NOT been swiped yet.
 * Core privacy rule: We strip `hasLikedUser` so the client can never inspect who liked them.
 */
export function getFeedProfiles(): Omit<Profile, 'hasLikedUser'>[] {
  const db = ensureDbFile();
  const swipedIds = new Set(Object.keys(db.swipes));

  return db.profiles
    .filter(p => !swipedIds.has(p.id))
    .map(({ hasLikedUser, ...safeProfile }) => safeProfile);
}

/**
 * Records a swipe (like or pass).
 * Returns whether a match was formed.
 */
export function recordSwipe(profileId: string, action: 'like' | 'pass'): { isMatch: boolean; profile?: Profile } {
  const db = ensureDbFile();
  const profile = db.profiles.find(p => p.id === profileId);

  if (!profile) {
    throw new Error(`Profile with id ${profileId} not found`);
  }

  // Record the swipe to persist across reloads
  db.swipes[profileId] = action;

  let isMatch = false;

  // Match happens strictly if user liked AND the profile already liked user
  if (action === 'like' && profile.hasLikedUser) {
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

/**
 * Returns all mutual matches.
 */
export function getMatches(): Match[] {
  const db = ensureDbFile();
  return db.matches;
}

/**
 * Reset helper for testing/demoing repeatedly.
 */
export function resetDatabase(): void {
  const freshData: DbSchema = {
    profiles: INITIAL_PROFILES,
    swipes: {},
    matches: []
  };
  saveDb(freshData);
}
