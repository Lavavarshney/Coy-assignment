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
      history: []
    };
    fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf8');
    return initialData;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed.history) parsed.history = [];
    return parsed;
  } catch (err) {
    const initialData: DbSchema = {
      profiles: INITIAL_PROFILES,
      swipes: {},
      matches: [],
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
 * Core privacy guarantee: Server strips `hasLikedUser` to protect against client inspection.
 */
export function getFeedProfiles(): Omit<Profile, 'hasLikedUser'>[] {
  const db = ensureDbFile();
  const swipedIds = new Set(Object.keys(db.swipes));

  return db.profiles
    .filter(p => !swipedIds.has(p.id))
    .map(({ hasLikedUser, ...safeProfile }) => safeProfile);
}

/**
 * Records a swipe with mutual match calculation & history tracking for Rewind.
 */
export function recordSwipe(profileId: string, action: 'like' | 'pass'): { isMatch: boolean; profile?: Profile } {
  const db = ensureDbFile();
  const profile = db.profiles.find(p => p.id === profileId);

  if (!profile) {
    throw new Error(`Profile with id ${profileId} not found`);
  }

  db.swipes[profileId] = action;
  if (!db.history) db.history = [];
  db.history.push(profileId);

  let isMatch = false;

  // Mutual match logic: action === 'like' AND profile pre-liked user
  if (action === 'like' && profile.hasLikedUser) {
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
  return { isMatch, profile };
}

/**
 * Rewind / Undo the very last swipe action.
 */
export function rewindLastSwipe(): { success: boolean; unswipedProfile?: Profile } {
  const db = ensureDbFile();
  if (!db.history || db.history.length === 0) {
    return { success: false };
  }

  const lastSwipedId = db.history.pop()!;
  delete db.swipes[lastSwipedId];

  // Remove from matches if it was matched
  db.matches = db.matches.filter(m => m.profile.id !== lastSwipedId);

  saveDb(db);
  const profile = db.profiles.find(p => p.id === lastSwipedId);
  return { success: true, unswipedProfile: profile };
}

/**
 * Send a message in a match conversation.
 */
export function sendMatchMessage(matchId: string, text: string): MatchMessage {
  const db = ensureDbFile();
  const match = db.matches.find(m => m.id === matchId);
  if (!match) {
    throw new Error(`Match with id ${matchId} not found`);
  }

  if (!match.messages) match.messages = [];
  const newMsg: MatchMessage = {
    id: `msg_${Date.now()}`,
    sender: 'user',
    text,
    timestamp: new Date().toISOString()
  };
  match.messages.push(newMsg);
  saveDb(db);
  return newMsg;
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
    history: []
  };
  saveDb(freshData);
}
