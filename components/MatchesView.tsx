'use client';

import React from 'react';
import { Match } from '../types';
import { MapPin, Heart, Clock } from 'lucide-react';

interface MatchesViewProps {
  matches: Match[];
  onStartSwiping: () => void;
}

export const MatchesView: React.FC<MatchesViewProps> = ({ matches, onStartSwiping }) => {
  if (matches.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-[#FFE8F0] border-2 border-[#1C1C1E] flex items-center justify-center shadow-coy mb-4">
          <Heart className="w-10 h-10 text-coy-pink fill-coy-pink/20" />
        </div>
        <h3 className="text-xl font-black text-[#1C1C1E]">No matches yet</h3>
        <p className="text-xs text-gray-500 mt-2 max-w-xs leading-relaxed">
          When someone you like also likes you back, your mutual match will appear right here.
        </p>
        <button
          onClick={onStartSwiping}
          className="mt-6 px-6 py-2.5 bg-coy-pink text-white font-bold rounded-full border-2 border-[#1C1C1E] shadow-coy hover:bg-coy-pinkHover active:shadow-coy-active active:translate-y-0.5 text-xs transition-all"
        >
          Discover people
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-4 overflow-y-auto pb-24">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-black text-[#1C1C1E] tracking-tight">Your Matches</h2>
          <p className="text-xs text-gray-500 font-medium">
            {matches.length} mutual {matches.length === 1 ? 'connection' : 'connections'}
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-[11px] font-bold text-emerald-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Mutual</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        {matches.map(({ id, profile, matchedAt }) => {
          const dateStr = new Date(matchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          return (
            <div
              key={id}
              className="bg-white rounded-2xl border-2 border-[#1C1C1E] shadow-coy overflow-hidden flex flex-col transition-all hover:-translate-y-0.5"
            >
              {/* Photo */}
              <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
                <img
                  src={profile.photo}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-coy-pink text-white p-1 rounded-full shadow-sm">
                  <Heart className="w-3.5 h-3.5 fill-white" />
                </div>
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2 text-white">
                  <span className="text-sm font-black drop-shadow">{profile.name}, {profile.age}</span>
                </div>
              </div>

              {/* Details */}
              <div className="p-3 flex-1 flex flex-col justify-between bg-[#FFFDFB]">
                <div>
                  <p className="text-[11px] text-gray-500 font-semibold flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 text-coy-pink shrink-0" />
                    {profile.location}
                  </p>
                  <p className="text-[11px] text-gray-600 font-medium line-clamp-2 mt-1">
                    {profile.bio}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {dateStr}
                  </span>
                  <span className="text-coy-pink font-bold flex items-center gap-0.5">
                    Match <Heart className="w-2.5 h-2.5 fill-coy-pink" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
