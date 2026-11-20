import {
  getFeedProfiles,
  recordSwipe,
  rewindLastSwipe,
  getMatches,
  resetDatabase,
  ensureDbFile
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

  test('Rewind / Undo Rule: Can undo the last swipe and restore profile to feed', () => {
    const initialFeed = getFeedProfiles();
    const firstProfile = initialFeed[0];

    recordSwipe(firstProfile.id, 'like');
    expect(getFeedProfiles().find(p => p.id === firstProfile.id)).toBeUndefined();

    const rewindRes = rewindLastSwipe();
    expect(rewindRes.success).toBe(true);
    expect(rewindRes.unswipedProfile?.id).toBe(firstProfile.id);

    // Profile should now be back in the feed
    const restoredFeed = getFeedProfiles();
    expect(restoredFeed.find(p => p.id === firstProfile.id)).toBeDefined();
  });
});
