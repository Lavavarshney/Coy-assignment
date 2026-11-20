'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X, EyeOff, CheckCircle2 } from 'lucide-react';

interface GhostShieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBlockSuccess: () => void;
}

export const GhostShieldModal: React.FC<GhostShieldModalProps> = ({ isOpen, onClose, onBlockSuccess }) => {
  const [blockedIds, setBlockedIds] = useState<string[]>([]);
  const [targetId, setTargetId] = useState('p1'); // Default to Aanya to test instant match purge
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchBlocked = async () => {
    try {
      const res = await fetch('/api/block');
      const data = await res.json();
      if (data.success) {
        setBlockedIds(data.blockedUserIds || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchBlocked();
      setStatusMessage(null);
    }
  }, [isOpen]);

  const handleSilentBlock = async () => {
    try {
      const res = await fetch('/api/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId: targetId })
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage(`User "${targetId}" silently added to Ghost Shield!`);
        await fetchBlocked();
        onBlockSuccess();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-sm bg-white border-2 border-[#1C1C1E] rounded-3xl p-6 shadow-coy-lg"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center border border-purple-300">
                <ShieldCheck className="w-4 h-4 text-purple-700" />
              </div>
              <h3 className="text-base font-black text-[#1C1C1E]">Ghost Shield & Privacy</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Explanation */}
          <div className="my-4 p-3 bg-[#FAF8F5] rounded-2xl border border-gray-200">
            <div className="flex items-start gap-2">
              <EyeOff className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
              <p className="text-xs text-gray-700 leading-relaxed font-medium">
                <strong className="text-black">Zero-Exposure Rule:</strong> Silently blocks ex-partners or unwanted contacts. They are immediately scrubbed from your feed and matches, but if they swipe on you, they will <strong className="text-black">never receive an error</strong> (preventing retaliation).
              </p>
            </div>
          </div>

          {/* Test Action */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-700 block">
              Test Silent Block on Profile:
            </label>
            <div className="flex gap-2">
              <select
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="flex-1 bg-white border-2 border-[#1C1C1E] rounded-xl px-3 py-2 text-xs font-bold text-gray-800 shadow-coy-sm focus:outline-none"
              >
                <option value="p1">Aanya Sharma (p1)</option>
                <option value="p2">Rohan Varma (p2)</option>
                <option value="p3">Meera Sen (p3)</option>
                <option value="p32">Tushar Agrawal (p32 - Pre-blocked)</option>
              </select>

              <button
                onClick={handleSilentBlock}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl border-2 border-[#1C1C1E] shadow-coy-sm active:shadow-coy-active active:translate-y-0.5 transition-all"
              >
                Silent Block
              </button>
            </div>

            {statusMessage && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 animate-fadeIn">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}
          </div>

          {/* Currently Blocked IDs List */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
              Silently Blocked Registry ({blockedIds.length})
            </p>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {blockedIds.map((id) => (
                <span
                  key={id}
                  className="px-2 py-0.5 bg-gray-100 border border-gray-200 rounded-full text-[10px] font-bold text-gray-700"
                >
                  {id}
                </span>
              ))}
            </div>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className="w-full mt-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition-colors"
          >
            Done
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
