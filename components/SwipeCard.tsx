'use client';

import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { MapPin, Heart, X, Sparkles, Music, Info, GraduationCap, ChevronDown } from 'lucide-react';
import { Profile } from '../types';

interface SwipeCardProps {
  profile: Profile;
  isFront: boolean;
  onSwipe: (action: 'like' | 'pass') => void;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({ profile, isFront, onSwipe }) => {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [exitX, setExitX] = useState<number | null>(null);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-250, 250], [-22, 22]);

  // Opacity of LIKE vs PASS stamps
  const likeOpacity = useTransform(x, [20, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, -20], [1, 0]);

  const handleDragEnd = (_: any, info: any) => {
    if (showDetails) return;
    const threshold = 85;
    const velocity = info.velocity.x;

    if (info.offset.x > threshold || velocity > 400) {
      setExitX(400);
      onSwipe('like');
    } else if (info.offset.x < -threshold || velocity < -400) {
      setExitX(-400);
      onSwipe('pass');
    }
  };

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (photoIndex < (profile.photos?.length || 1) - 1) {
      setPhotoIndex(photoIndex + 1);
    }
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (photoIndex > 0) {
      setPhotoIndex(photoIndex - 1);
    }
  };

  const currentPhoto = profile.photos && profile.photos.length > 0 ? profile.photos[photoIndex] : '';

  if (!isFront) {
    return (
      <div className="absolute inset-0 w-full h-[540px] rounded-3xl bg-[#FFF9F6] border-2 border-[#1C1C1E] shadow-coy overflow-hidden select-none pointer-events-none scale-[0.94] translate-y-3 opacity-90 transition-all duration-300">
        <div className="relative w-full h-full flex flex-col">
          <div className="relative h-[65%] w-full overflow-hidden bg-gray-100">
            <img
              src={profile.photos?.[0]}
              alt={profile.name}
              className="w-full h-full object-cover pointer-events-none"
            />
          </div>
          <div className="p-4 bg-white flex-1 flex flex-col justify-between">
            <div className="flex items-baseline gap-2">
              <h3 className="text-xl font-bold text-[#1C1C1E]">{profile.name}</h3>
              <span className="text-lg font-semibold text-gray-500">{profile.age}</span>
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-coy-pink" />
              {profile.location}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      style={{ x: showDetails ? 0 : x, rotate: showDetails ? 0 : rotate }}
      drag={showDetails ? false : "x"}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: showDetails ? 'default' : 'grabbing' }}
      className="absolute inset-0 w-full h-[540px] rounded-3xl bg-white border-2 border-[#1C1C1E] shadow-coy-lg overflow-hidden cursor-grab active:cursor-grabbing select-none touch-none z-10 flex flex-col"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{
        x: exitX !== null ? exitX : 0,
        opacity: 0,
        scale: 0.85,
        transition: { duration: 0.25, ease: 'easeOut' }
      }}
    >
      <div className="relative w-full h-full flex flex-col overflow-y-auto">
        {/* Swipe Feedback Badges */}
        <motion.div
          style={{ opacity: likeOpacity }}
          className="absolute top-6 left-6 z-30 pointer-events-none rotate-[-15deg] border-4 border-[#10B981] bg-emerald-500/10 backdrop-blur-sm px-4 py-1.5 rounded-xl flex items-center gap-1.5"
        >
          <Heart className="w-6 h-6 text-[#10B981] fill-[#10B981]" />
          <span className="text-2xl font-black text-[#10B981] tracking-wider uppercase">LIKE</span>
        </motion.div>

        <motion.div
          style={{ opacity: nopeOpacity }}
          className="absolute top-6 right-6 z-30 pointer-events-none rotate-[15deg] border-4 border-[#EF4444] bg-red-500/10 backdrop-blur-sm px-4 py-1.5 rounded-xl flex items-center gap-1.5"
        >
          <X className="w-6 h-6 text-[#EF4444] stroke-[3]" />
          <span className="text-2xl font-black text-[#EF4444] tracking-wider uppercase">PASS</span>
        </motion.div>

        {/* Profile Image with Instagram Story Tap Zones */}
        <div className="relative h-[65%] w-full min-h-[350px] shrink-0 overflow-hidden bg-gray-100">
          <img
            src={currentPhoto}
            alt={profile.name}
            className="w-full h-full object-cover pointer-events-none transition-all duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

          {/* Story Bar Segments */}
          {profile.photos && profile.photos.length > 1 && (
            <div className="absolute top-3 inset-x-3 z-20 flex gap-1.5 pointer-events-none">
              {profile.photos.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    idx === photoIndex ? 'bg-white' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Left / Right Tap zones for photo navigation */}
          {profile.photos && profile.photos.length > 1 && (
            <>
              <button
                onClick={prevPhoto}
                className="absolute inset-y-0 left-0 w-1/3 z-20 opacity-0 cursor-pointer"
                aria-label="Previous photo"
              />
              <button
                onClick={nextPhoto}
                className="absolute inset-y-0 right-0 w-1/3 z-20 opacity-0 cursor-pointer"
                aria-label="Next photo"
              />
            </>
          )}

          {/* Main Card Info Overlay */}
          <div className="absolute bottom-3 left-4 right-4 z-20 text-white flex items-end justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <h2 className="text-2xl font-black drop-shadow-md">{profile.name}</h2>
                <span className="text-xl font-bold opacity-90">{profile.age}</span>
              </div>
              <p className="text-xs font-semibold text-gray-200 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-coy-pink" />
                {profile.location}
              </p>
              {profile.majorOrWork && (
                <p className="text-[11px] font-medium text-gray-300 flex items-center gap-1 mt-0.5">
                  <GraduationCap className="w-3.5 h-3.5 text-yellow-300" />
                  {profile.majorOrWork}
                </p>
              )}
            </div>

            {/* Expand / Details Toggle Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDetails(!showDetails);
              }}
              className="p-2 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-white hover:bg-white/30 transition-all cursor-pointer"
              title="View full profile"
            >
              {showDetails ? <ChevronDown className="w-4 h-4" /> : <Info className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Bio & Extended Details Sheet */}
        <div className="p-4 bg-white flex-1 flex flex-col justify-between">
          <p className="text-xs text-gray-700 leading-relaxed font-medium">
            {profile.bio}
          </p>

          {/* Spotify Anthem if present */}
          {profile.spotifyAnthem && (
            <div className="my-2 p-2.5 rounded-xl bg-[#1DB954]/10 border border-[#1DB954]/30 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#1DB954] flex items-center justify-center shrink-0">
                <Music className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="truncate">
                <p className="text-[10px] uppercase font-bold text-[#1DB954] tracking-wider">Anthem</p>
                <p className="text-xs font-bold text-gray-900 truncate">
                  {profile.spotifyAnthem.song} <span className="font-normal text-gray-500">· {profile.spotifyAnthem.artist}</span>
                </p>
              </div>
            </div>
          )}

          {/* Prompts Q&A when expanded */}
          {showDetails && profile.prompts && profile.prompts.length > 0 && (
            <div className="space-y-2 my-2">
              {profile.prompts.map((p, i) => (
                <div key={i} className="p-3 bg-[#FAF8F5] rounded-xl border border-gray-200">
                  <p className="text-[10px] font-bold uppercase text-gray-400">{p.question}</p>
                  <p className="text-xs font-semibold text-gray-800 mt-0.5">{p.answer}</p>
                </div>
              ))}
            </div>
          )}

          {/* Interests Tags */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {profile.interests.map((interest) => (
              <span
                key={interest}
                className="text-[11px] font-semibold bg-[#F4F4F6] text-gray-800 px-2.5 py-1 rounded-full border border-gray-200 flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-coy-pink" />
                {interest}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
