'use client';

import React from 'react';
import { Home, Compass, Heart } from 'lucide-react';

interface TabBarProps {
  activeTab: 'home' | 'discover' | 'matches';
  onTabChange: (tab: 'home' | 'discover' | 'matches') => void;
  matchesCount: number;
}

export const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange, matchesCount }) => {
  return (
    <nav className="fixed bottom-0 max-w-md w-full bg-white border-t-2 border-[#1C1C1E] z-40 px-6 py-2.5 flex justify-around items-center shadow-lg">
      {/* Home Tab */}
      <button
        onClick={() => onTabChange('home')}
        className={`flex flex-col items-center gap-1 transition-all ${
          activeTab === 'home' ? 'text-[#1C1C1E] scale-105' : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        <div className={`p-1.5 rounded-xl ${activeTab === 'home' ? 'bg-gray-100' : ''}`}>
          <Home className="w-5 h-5 stroke-[2.3]" />
        </div>
        <span className="text-[10px] font-bold tracking-tight">Home</span>
      </button>

      {/* Discover Tab (Highlighted) */}
      <button
        onClick={() => onTabChange('discover')}
        className={`flex flex-col items-center gap-1 transition-all relative ${
          activeTab === 'discover' ? 'text-coy-pink scale-105' : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        <div className={`p-1.5 rounded-xl ${activeTab === 'discover' ? 'bg-[#FFE8F0]' : ''}`}>
          <Compass className="w-5 h-5 stroke-[2.5]" />
        </div>
        <span className="text-[10px] font-bold tracking-tight">Discover</span>
      </button>

      {/* Matches Tab */}
      <button
        onClick={() => onTabChange('matches')}
        className={`flex flex-col items-center gap-1 transition-all relative ${
          activeTab === 'matches' ? 'text-coy-pink scale-105' : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        <div className={`p-1.5 rounded-xl relative ${activeTab === 'matches' ? 'bg-[#FFE8F0]' : ''}`}>
          <Heart className={`w-5 h-5 stroke-[2.3] ${activeTab === 'matches' ? 'fill-coy-pink' : ''}`} />
          {matchesCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-coy-pink text-white text-[9px] font-black rounded-full flex items-center justify-center border border-white">
              {matchesCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-bold tracking-tight">Matches</span>
      </button>
    </nav>
  );
};
