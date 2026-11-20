'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Heart, X, Sparkles, RotateCcw, Flame } from 'lucide-react';
import { Profile, Match } from '@/types';
import { SwipeCard } from '@/components/SwipeCard';
import { MatchModal } from '@/components/MatchModal';
import { MatchesView } from '@/components/MatchesView';
import { EmptyFeed } from '@/components/EmptyFeed';
import { HomePlaceholder } from '@/components/HomePlaceholder';
import { TabBar } from '@/components/TabBar';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'discover' | 'matches'>('discover');
  const [feed, setFeed] = useState<Profile[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newMatchProfile, setNewMatchProfile] = useState<Profile | null>(null);
  const [isSwiping, setIsSwiping] = useState<boolean>(false);

  // Initial data fetch
  const fetchData = async () => {
    try {
      setLoading(true);
      const [feedRes, matchesRes] = await Promise.all([
        fetch('/api/feed'),
        fetch('/api/matches')
      ]);

      const feedData = await feedRes.json();
      const matchesData = await matchesRes.json();

      if (feedData.success) {
        setFeed(feedData.profiles || []);
      }
      if (matchesData.success) {
        setMatches(matchesData.matches || []);
      }
    } catch (err) {
      console.error('Failed to load Coy data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Swipe Action (Like or Pass)
  const handleSwipe = async (action: 'like' | 'pass') => {
    if (feed.length === 0 || isSwiping) return;

    setIsSwiping(true);
    const swipedProfile = feed[0];
    const remaining = feed.slice(1);
    setFeed(remaining);

    try {
      const res = await fetch('/api/swipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId: swipedProfile.id, action })
      });

      const data = await res.json();

      if (data.success && data.isMatch) {
        // Trigger match modal and refresh matches state
        setNewMatchProfile(data.profile || swipedProfile);
        const matchesRes = await fetch('/api/matches');
        const matchesData = await matchesRes.json();
        if (matchesData.success) {
          setMatches(matchesData.matches || []);
        }
      }
    } catch (err) {
      console.error('Error recording swipe:', err);
    } finally {
      setTimeout(() => {
        setIsSwiping(false);
      }, 250);
    }
  };

  // Reset database demo
  const handleReset = async () => {
    try {
      setLoading(true);
      await fetch('/api/matches', { method: 'POST' });
      await fetchData();
    } catch (err) {
      console.error('Failed to reset', err);
    } finally {
      setLoading(false);
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

          <button
            onClick={handleReset}
            title="Reset demo data"
            className="p-1.5 rounded-xl border border-gray-200 text-gray-500 hover:text-black hover:bg-gray-100 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
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
                onReset={handleReset}
                matchesCount={matches.length}
                onViewMatches={() => setActiveTab('matches')}
              />
            ) : (
              <>
                {/* Card Stack Container */}
                <div className="relative w-full h-[520px] max-w-sm mx-auto mt-2">
                  <AnimatePresence>
                    {/* Render next card underneath for smooth depth */}
                    {feed.length > 1 && (
                      <SwipeCard
                        key={feed[1].id}
                        profile={feed[1]}
                        isFront={false}
                        onSwipe={() => {}}
                      />
                    )}

                    {/* Active Front Card */}
                    <SwipeCard
                      key={feed[0].id}
                      profile={feed[0]}
                      isFront={true}
                      onSwipe={handleSwipe}
                    />
                  </AnimatePresence>
                </div>

                {/* Bottom Desktop/Tap Action Buttons */}
                <div className="flex justify-center items-center gap-6 mt-4">
                  {/* Pass Button */}
                  <button
                    onClick={() => handleSwipe('pass')}
                    disabled={isSwiping}
                    className="w-14 h-14 rounded-full bg-white border-2 border-[#1C1C1E] shadow-coy hover:bg-red-50 hover:border-red-500 text-red-500 flex items-center justify-center active:shadow-coy-active active:translate-y-0.5 transition-all group disabled:opacity-50"
                    aria-label="Pass"
                  >
                    <X className="w-7 h-7 stroke-[2.7] group-hover:scale-110 transition-transform" />
                  </button>

                  {/* Like Button */}
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

      {/* Bottom Navigation */}
      <TabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        matchesCount={matches.length}
      />
    </div>
  );
}
