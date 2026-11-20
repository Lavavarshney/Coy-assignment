'use client';

import React, { useState } from 'react';
import { Match, MatchMessage } from '../types';
import { MapPin, Heart, Clock, ArrowLeft, Send } from 'lucide-react';

interface MatchesViewProps {
  matches: Match[];
  onStartSwiping: () => void;
  onRefreshMatches?: () => void;
}

export const MatchesView: React.FC<MatchesViewProps> = ({ matches, onStartSwiping, onRefreshMatches }) => {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedMatch || isSending) return;

    const messageText = inputText.trim();
    setInputText('');
    setIsSending(true);

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId: selectedMatch.id, text: messageText })
      });
      const data = await res.json();
      if (data.success && data.message) {
        setSelectedMatch(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: [...(prev.messages || []), data.message]
          };
        });
        if (onRefreshMatches) onRefreshMatches();
      }
    } catch (err) {
      console.error('Failed to send message', err);
    } finally {
      setIsSending(false);
    }
  };

  // If a match is selected, show the live chat interface
  if (selectedMatch) {
    const profile = selectedMatch.profile;
    const messages = selectedMatch.messages || [];

    return (
      <div className="flex-1 flex flex-col h-full bg-[#FAF8F5]">
        {/* Chat Header */}
        <div className="px-4 py-3 bg-white border-b-2 border-[#1C1C1E] flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedMatch(null)}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="relative w-10 h-10 rounded-full border border-[#1C1C1E] overflow-hidden">
              <img
                src={profile.photos?.[0]}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1C1C1E] flex items-center gap-1.5">
                {profile.name}
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              </h3>
              <p className="text-[10px] text-gray-400 font-medium">{profile.location}</p>
            </div>
          </div>
          <div className="px-2.5 py-1 bg-[#FFE8F0] border border-coy-pink/30 rounded-full text-[10px] font-bold text-coy-pink">
            Coy Match
          </div>
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          <div className="text-center my-2">
            <span className="text-[10px] uppercase font-bold text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-200">
              You both liked each other!
            </span>
          </div>

          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-xs font-medium shadow-sm ${
                    isUser
                      ? 'bg-coy-pink text-white rounded-br-none'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                  }`}
                >
                  <p>{m.text}</p>
                  <span
                    className={`text-[9px] block text-right mt-1 opacity-70`}
                  >
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Message Input */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 bg-white border-t-2 border-[#1C1C1E] flex items-center gap-2 mb-16"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Say hello to ${profile.name}...`}
            className="flex-1 py-2.5 px-4 bg-[#FAF8F5] border border-gray-300 rounded-full text-xs text-gray-900 focus:outline-none focus:border-coy-pink"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="w-10 h-10 rounded-full bg-coy-pink text-white border border-[#1C1C1E] shadow-coy-sm flex items-center justify-center hover:bg-coy-pinkHover disabled:opacity-40 transition-all shrink-0"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
      </div>
    );
  }

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
            {matches.length} mutual {matches.length === 1 ? 'connection' : 'connections'} · Tap to chat
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-[11px] font-bold text-emerald-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Mutual</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        {matches.map((match) => {
          const { id, profile, matchedAt, messages = [] } = match;
          const dateStr = new Date(matchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const lastMsg = messages[messages.length - 1];

          return (
            <div
              key={id}
              onClick={() => setSelectedMatch(match)}
              className="bg-white rounded-2xl border-2 border-[#1C1C1E] shadow-coy overflow-hidden flex flex-col cursor-pointer transition-all hover:-translate-y-1 hover:shadow-coy-lg active:scale-95"
            >
              {/* Photo */}
              <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
                <img
                  src={profile.photos?.[0]}
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

              {/* Details & Latest Chat snippet */}
              <div className="p-3 flex-1 flex flex-col justify-between bg-[#FFFDFB]">
                <div>
                  <p className="text-[11px] text-gray-500 font-semibold flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 text-coy-pink shrink-0" />
                    {profile.location}
                  </p>
                  {lastMsg ? (
                    <p className="text-[11px] text-gray-700 font-medium line-clamp-2 mt-1 italic">
                      &quot;{lastMsg.text}&quot;
                    </p>
                  ) : (
                    <p className="text-[11px] text-gray-500 font-medium line-clamp-2 mt-1">
                      {profile.bio}
                    </p>
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {dateStr}
                  </span>
                  <span className="text-coy-pink font-bold flex items-center gap-0.5">
                    Chat &rarr;
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
