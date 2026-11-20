'use client';

import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

interface EmptyFeedProps {
  matchesCount: number;
  onViewMatches: () => void;
}

export const EmptyFeed: React.FC<EmptyFeedProps> = ({ matchesCount, onViewMatches }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fadeIn">
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-3xl bg-[#EEEBFF] border-2 border-[#1C1C1E] shadow-coy flex items-center justify-center rotate-[-4deg]">
          <CheckCircle2 className="w-12 h-12 text-[#6C5CE7]" />
        </div>
        <div className="absolute -bottom-2 -right-2 bg-coy-pink text-white text-xs font-black px-2.5 py-1 rounded-full border-2 border-[#1C1C1E] shadow-coy-sm rotate-[6deg]">
          All caught up!
        </div>
      </div>

      <h3 className="text-2xl font-black text-[#1C1C1E] tracking-tight">
        You&apos;ve swiped through everyone!
      </h3>
      
      <p className="text-xs text-gray-500 mt-2 max-w-xs leading-relaxed font-medium">
        There are no new profiles left in your area for now. You have accumulated{' '}
        <span className="font-bold text-coy-pink">{matchesCount}</span> mutual match{matchesCount === 1 ? '' : 'es'}.
      </p>

      {matchesCount > 0 && (
        <div className="mt-8 w-full max-w-xs">
          <button
            onClick={onViewMatches}
            className="w-full py-3.5 px-5 bg-coy-pink text-white font-bold rounded-2xl border-2 border-[#1C1C1E] shadow-coy hover:bg-coy-pinkHover active:shadow-coy-active active:translate-y-0.5 text-sm transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 fill-white" />
            <span>View Your Matches ({matchesCount})</span>
          </button>
        </div>
      )}
    </div>
  );
};
