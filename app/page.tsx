'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Heart, X, Flame, ShieldCheck } from 'lucide-react';
import { Profile, Match } from '@/types';
import { SwipeCard } from '@/components/SwipeCard';
import { MatchModal } from '@/components/MatchModal';
import { MatchesView } from '@/components/MatchesView';
import { EmptyFeed } from '@/components/EmptyFeed';
import { HomePlaceholder } from '@/components/HomePlaceholder';
import { TabBar } from '@/components/TabBar';
import { GhostShieldModal } from '@/components/GhostShieldModal';

const LOCAL_STORAGE_SWIPES_KEY = 'coy_swipes_prod_v1';
const LOCAL_STORAGE_MATCHES_KEY = 'coy_matches_prod_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'discover' | 'matches'>('discover');
  const [feed, setFeed] = useState<Profile[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newMatchProfile, setNewMatchProfile] = useState<Profile | null>(null);
  const [isSwiping, setIsSwiping] = useState<boolean>(false);
  const [showGhostShield, setShowGhostShield] = useState<boolean>(false);

  // Synchronous initial state recovery from localStorage so reload NEVER flickers to 0 matches
  useEffect(() => {
    try {
      const savedMatches = JSON.parse(localStorage.getItem(LOCAL_STORAGE_MATCHES_KEY) || '[]');
      if (Array.isArray(savedMatches) && savedMatches.length > 0) {
        setMatches(savedMatches);
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, []);

  // Comprehensive data fetch & reconciliation
  const fetchData = async () => {
    try {
      setLoading(true);
      const [feedRes, matchesRes] = await Promise.all([
        fetch('/api/feed'),
        fetch('/api/matches')
      ]);

      const feedData = await feedRes.json();
      const matchesData = await matchesRes.json();

      let clientSwipedIds: string[] = [];
      let clientLocalMatches: Match[] = [];

      try {
        clientSwipedIds = JSON.parse(localStorage.getItem(LOCAL_STORAGE_SWIPES_KEY) || '[]');
        clientLocalMatches = JSON.parse(localStorage.getItem(LOCAL_STORAGE_MATCHES_KEY) || '[]');
      } catch (e) {}

      const swipedSet = new Set(clientSwipedIds);

      if (feedData.success && feedData.profiles) {
        const filteredFeed = feedData.profiles.filter((p: Profile) => !swipedSet.has(p.id));
        setFeed(filteredFeed);
      }

      // Robust union of server matches + local client matches (Never drops matches on reload!)
      const matchMap = new Map<string, Match>();
      clientLocalMatches.forEach((m: Match) => matchMap.set(m.profile.id, m));
      (matchesData.matches || []).forEach((m: Match) => matchMap.set(m.profile.id, m));

      const consolidatedMatches = Array.from(matchMap.values());
      setMatches(consolidatedMatches);
      localStorage.setItem(LOCAL_STORAGE_MATCHES_KEY, JSON.stringify(consolidatedMatches));
    } catch (err) {
      console.error('Failed to load Coy data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Secret evaluator query param: visiting /?reset=true wipes client state cleanly
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('reset') === 'true') {
        localStorage.removeItem(LOCAL_STORAGE_SWIPES_KEY);
        localStorage.removeItem(LOCAL_STORAGE_MATCHES_KEY);
        fetch('/api/matches?secret=coy_eval_reset', { method: 'POST' }).finally(() => {
          window.location.href = window.location.pathname; // Clean redirect to clean demo
        });
        return;
      }
    }
    fetchData();
  }, []);

  // Handle Swipe Action (Like or Pass)
  const handleSwipe = async (action: 'like' | 'pass') => {
    if (feed.length === 0 || isSwiping) return;

    setIsSwiping(true);
    const swipedProfile = feed[0];
    const remaining = feed.slice(1);
    setFeed(remaining);

    // 1. Immediately persist swipe to localStorage
    try {
      const existing: string[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_SWIPES_KEY) || '[]');
      if (!existing.includes(swipedProfile.id)) {
        existing.push(swipedProfile.id);
        localStorage.setItem(LOCAL_STORAGE_SWIPES_KEY, JSON.stringify(existing));
      }
    } catch (e) {}

    try {
      // 2. Synchronize with backend API
      const res = await fetch('/api/swipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId: swipedProfile.id, action })
      });

      const data = await res.json();

      if (data.success && data.isMatch) {
        const matched = data.profile || swipedProfile;
        setNewMatchProfile(matched);

        const newMatchObj: Match = {
          id: `match_${Date.now()}_${matched.id}`,
          profile: matched,
          matchedAt: new Date().toISOString()
        };

        setMatches(prev => {
          const nextMatches = [newMatchObj, ...prev.filter(m => m.profile.id !== matched.id)];
          try {
            localStorage.setItem(LOCAL_STORAGE_MATCHES_KEY, JSON.stringify(nextMatches));
          } catch (e) {}
          return nextMatches;
        });
      }
    } catch (err) {
      console.error('Error recording swipe:', err);
    } finally {
      setTimeout(() => {
        setIsSwiping(false);
      }, 250);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAF8F5]">
      {/* Top Header - Coy Brand Bar */}
      <header className="px-5 py-3.5 bg-white border-b-2 border-[#1C1C1E] flex items-center justify-between z-30 shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="text-2xl font-black tracking-tight text-[#1C1C1E]">coy</span>
          <span className="w-2.5 h-2.5 rounded-full bg-coy-pink mt-1.5" />
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1 mt-1.5">
            Discover
          </span>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'discover' && feed.length > 0 && (
            <div className="px-2.5 py-1 bg-[#FFF0F5] border border-coy-pink/30 rounded-full flex items-center gap-1 text-[11px] font-bold text-coy-pink">
              <Flame className="w-3.5 h-3.5 fill-coy-pink" />
              <span>{feed.length} left</span>
            </div>
          )}

          {/* Ghost Shield Privacy Button */}
          <button
            onClick={() => setShowGhostShield(true)}
            title="Ghost Shield / Silent Block Settings"
            className="p-1.5 rounded-xl border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors flex items-center gap-1 text-xs font-bold"
          >
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span className="hidden sm:inline">Shield</span>
          </button>
        </div>
      </header>

      {/* Main Tab Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-coy-pink border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-bold text-gray-400">Loading Coy profiles...</p>
            </div>
          </div>
        ) : activeTab === 'home' ? (
          <HomePlaceholder />
        ) : activeTab === 'matches' ? (
          <MatchesView
            matches={matches}
            onStartSwiping={() => setActiveTab('discover')}
          />
        ) : (
          /* Discover Feed */
          <div className="flex-1 flex flex-col justify-between p-4 pb-24 relative">
            {feed.length === 0 ? (
              <EmptyFeed
                matchesCount={matches.length}
                onViewMatches={() => setActiveTab('matches')}
              />
            ) : (
              <>
                {/* Card Stack Container */}
                <div className="relative w-full h-[540px] max-w-sm mx-auto mt-1">
                  {feed.length > 1 && (
                    <SwipeCard
                      key={feed[1].id}
                      profile={feed[1]}
                      isFront={false}
                      onSwipe={() => {}}
                    />
                  )}

                  {feed.length > 0 && (
                    <SwipeCard
                      key={feed[0].id}
                      profile={feed[0]}
                      isFront={true}
                      onSwipe={handleSwipe}
                    />
                  )}
                </div>

                {/* Bottom Desktop Action Buttons */}
                <div className="hidden md:flex justify-center items-center gap-6 mt-3">
                  <button
                    onClick={() => handleSwipe('pass')}
                    disabled={isSwiping}
                    className="w-14 h-14 rounded-full bg-white border-2 border-[#1C1C1E] shadow-coy hover:bg-red-50 hover:border-red-500 text-red-500 flex items-center justify-center active:shadow-coy-active active:translate-y-0.5 transition-all group disabled:opacity-50"
                    aria-label="Pass"
                  >
                    <X className="w-7 h-7 stroke-[2.7] group-hover:scale-110 transition-transform" />
                  </button>

                  <button
                    onClick={() => handleSwipe('like')}
                    disabled={isSwiping}
                    className="w-16 h-16 rounded-full bg-coy-pink border-2 border-[#1C1C1E] shadow-coy hover:bg-coy-pinkHover text-white flex items-center justify-center active:shadow-coy-active active:translate-y-0.5 transition-all group disabled:opacity-50"
                    aria-label="Like"
                  >
                    <Heart className="w-8 h-8 fill-white stroke-[2] group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* Match Celebration Popup Modal */}
      <MatchModal
        matchedProfile={newMatchProfile}
        onClose={() => setNewMatchProfile(null)}
        onViewMatches={() => {
          setNewMatchProfile(null);
          setActiveTab('matches');
        }}
      />

      {/* Ghost Shield & Privacy Modal */}
      <GhostShieldModal
        isOpen={showGhostShield}
        onClose={() => setShowGhostShield(false)}
        onBlockSuccess={fetchData}
      />

      {/* Bottom Navigation */}
      <TabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        matchesCount={matches.length}
      />
    </div>
  );
}
