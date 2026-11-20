'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, MessageCircle, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Profile } from '../types';

interface MatchModalProps {
  matchedProfile: Profile | null;
  onClose: () => void;
  onViewMatches: () => void;
}

export const MatchModal: React.FC<MatchModalProps> = ({
  matchedProfile,
  onClose,
  onViewMatches,
}) => {
  useEffect(() => {
    if (matchedProfile) {
      // Fire vibrant confetti bursts
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF2B6D', '#FF6584', '#6C5CE7', '#FFAA00', '#00C897']
      });

      const timer = setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#FF2B6D', '#FFB4D6']
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#FF2B6D', '#6C5CE7']
        });
      }, 250);

      return () => clearTimeout(timer);
    }
  }, [matchedProfile]);

  if (!matchedProfile) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.8, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-sm bg-[#FFF9F6] border-2 border-[#1C1C1E] rounded-3xl p-6 shadow-coy-lg text-center overflow-hidden"
        >
          {/* Decorative tag */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFE8F0] border border-coy-pink/40 rounded-full text-xs font-bold text-coy-pink mb-4">
            <Sparkles className="w-3.5 h-3.5 fill-coy-pink" />
            <span>IT&apos;S MUTUAL!</span>
          </div>

          <h2 className="text-3xl font-black text-[#1C1C1E] tracking-tight">
            It&apos;s a match!
          </h2>
          <p className="text-sm font-medium text-gray-600 mt-1">
            You and <span className="font-bold text-[#1C1C1E]">{matchedProfile.name}</span> both swiped right on each other.
          </p>

          {/* Overlapping Avatar Rings - Exactly matches Coy's aesthetic */}
          <div className="relative flex justify-center items-center my-6 h-28">
            {/* User Circle */}
            <div className="relative -mr-4 w-24 h-24 rounded-full border-3 border-[#1C1C1E] bg-[#E9E4F7] flex items-center justify-center shadow-coy z-10">
              <span className="text-2xl font-black text-[#1C1C1E]">YOU</span>
            </div>

            {/* Heart Intersection Badge */}
            <div className="absolute z-30 w-10 h-10 rounded-full bg-coy-pink border-2 border-white shadow-md flex items-center justify-center animate-bounce">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>

            {/* Matched Profile Circle */}
            <div className="relative -ml-4 w-24 h-24 rounded-full border-3 border-[#1C1C1E] overflow-hidden shadow-coy z-20">
              <img
                src={matchedProfile.photos?.[0]}
                alt={matchedProfile.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <p className="text-xs text-gray-500 mb-6 px-4">
            Coy&apos;s core promise: Neither of you knew until it was 100% mutual.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-2.5">
            <button
              onClick={onViewMatches}
              className="w-full py-3.5 px-4 bg-coy-pink text-white font-bold rounded-2xl border-2 border-[#1C1C1E] shadow-coy hover:bg-coy-pinkHover active:shadow-coy-active active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <span>View In Matches</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>

            <button
              onClick={onClose}
              className="w-full py-3 px-4 bg-white text-gray-700 font-bold rounded-2xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-sm"
            >
              Keep Swiping
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
