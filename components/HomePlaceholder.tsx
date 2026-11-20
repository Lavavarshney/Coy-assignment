'use client';

import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

export const HomePlaceholder: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#FAF8F5]">
      {/* Mock Coy Home Card */}
      <div className="w-full max-w-xs bg-white border-2 border-[#1C1C1E] rounded-3xl p-6 shadow-coy mb-6">
        <div className="w-12 h-12 rounded-2xl bg-[#FFE8F0] border border-coy-pink/30 flex items-center justify-center mx-auto mb-3">
          <Heart className="w-6 h-6 text-coy-pink fill-coy-pink" />
        </div>
        <h3 className="text-xl font-black text-[#1C1C1E]">Coy Core Experience</h3>
        <p className="text-xs text-gray-500 font-medium mt-1">
          Add secret crushes via phone number or email with zero exposure.
        </p>
        <div className="mt-4 p-3 bg-gray-50 rounded-2xl border border-dashed border-gray-300 text-xs text-gray-400">
          (Placeholder tab per assignment specification)
        </div>
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#EEEBFF] border border-[#6C5CE7]/30 rounded-full text-xs font-bold text-[#6C5CE7]">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Check the &quot;Discover&quot; tab below!</span>
      </div>
    </div>
  );
};
