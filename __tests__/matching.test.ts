import {
  getFeedProfiles,
  recordSwipe,
  getMatches,
  resetDatabase,
  silentlyBlockUser
} from '../lib/db';

describe('Coy Discover & Privacy Matching Logic', () => {
  beforeEach(() => {
    resetDatabase();
  });

  test('Privacy Rule: getFeedProfiles() never exposes hasLikedUser to the client', () => {
    const feed = getFeedProfiles();
    expect(feed.length).toBeGreaterThan(0);
    feed.forEach((profile: any) => {
      expect(profile.hasLikedUser).toBeUndefined();
      expect(profile.isBlocked).toBeUndefined();
    });
  });

  test('Matching Rule: Swipe LIKE on a profile that liked user creates a mutual match', () => {
    // p1 (Aanya Sharma) hasLikedUser: true
    const result = recordSwipe('p1', 'like');
    expect(result.isMatch).toBe(true);

    const matches = getMatches();
    const found = matches.find(m => m.profile.id === 'p1');
    expect(found).toBeDefined();
    expect(found?.profile.name).toBe('Aanya Sharma');
  });

  test('Privacy Rule: Swipe LIKE on a profile that did NOT like user does NOT create a match', () => {
    // p2 (Rohan Varma) hasLikedUser: false
    const result = recordSwipe('p2', 'like');
    expect(result.isMatch).toBe(false);

    const matches = getMatches();
    const found = matches.find(m => m.profile.id === 'p2');
    expect(found).toBeUndefined();
  });

  test('Passing Rule: Swipe PASS on a profile never creates a match even if they liked user', () => {
    // p1 hasLikedUser: true, but user passes
    const result = recordSwipe('p1', 'pass');
    expect(result.isMatch).toBe(false);

    const matches = getMatches();
    const found = matches.find(m => m.profile.id === 'p1');
    expect(found).toBeUndefined();
  });

  test('Deduplication Rule: A swiped profile never appears in getFeedProfiles() again', () => {
    const initialFeed = getFeedProfiles();
    const firstProfile = initialFeed[0];

    recordSwipe(firstProfile.id, 'pass');

    const updatedFeed = getFeedProfiles();
    const foundInFeed = updatedFeed.find(p => p.id === firstProfile.id);
    expect(foundInFeed).toBeUndefined();
    expect(updatedFeed.length).toBe(initialFeed.length - 1);
  });

  /* ====================================================================
     GHOST SHIELD & ANTI-STALKER SILENT BLOCK TESTS
     ==================================================================== */

  test('Ghost Shield Rule 1: A blocked user is completely filtered out from getFeedProfiles()', () => {
    // p32 is pre-blocked in the registry
    const feed = getFeedProfiles();
    const found = feed.find(p => p.id === 'p32');
    expect(found).toBeUndefined(); // Never presented to the user
  });

  test('Ghost Shield Rule 2: If a blocked user swipes LIKE, it succeeds neutrally with NO match and NO error', () => {
    // If p32 (blocked) attempts to swipe like on user, system returns 200 OK + isMatch: false
    const response = recordSwipe('p32', 'like');
    
    // Crucial anti-retaliation check:
    expect(response.isMatch).toBe(false); // No match formed
    // Stalker receives standard success structure so they never suspect they were blocked!
    expect(response.profile).toBeDefined();

    // Verify user's matches list was NOT polluted
    const matches = getMatches();
    expect(matches.find(m => m.profile.id === 'p32')).toBeUndefined();
  });

  test('Ghost Shield Rule 3: Silently blocking a user instantly purges any active match with zero alerts', () => {
    // 1. Create a match with Aanya (p1)
    recordSwipe('p1', 'like');
    expect(getMatches().find(m => m.profile.id === 'p1')).toBeDefined();

    // 2. User invokes silent block on p1
    silentlyBlockUser('p1');

    // 3. Match is immediately scrubbed from the database
    expect(getMatches().find(m => m.profile.id === 'p1')).toBeUndefined();

    // 4. p1 will also no longer appear in the feed
    expect(getFeedProfiles().find(p => p.id === 'p1')).toBeUndefined();
  });
});
