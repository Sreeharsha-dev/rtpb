"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronRight } from "lucide-react";

interface MemoryRoomProps {
  onComplete: () => void;
  playMagicalSound: (type: 'tap' | 'success' | 'failure' | 'sparkle' | 'type') => void;
}

interface MemoryCard {
  id: number;
  title: string;
  emoji: string;
  silhouette: string; // inline SVG or symbol representing the theme
  description: string;
  colorClass: string;
}

const CARDS: MemoryCard[] = [
  {
    id: 1,
    title: "Traditional Values",
    emoji: "🌸",
    silhouette: "⛩️",
    description: "Deeply rooted in respect and values, bringing grace and traditional elegance to a modern world.",
    colorClass: "from-pink-900/40 to-violet-950/40 border-pink-500/20",
  },
  {
    id: 2,
    title: "Passion for Stories",
    emoji: "🎥",
    silhouette: "🎬",
    description: "Whether it is reels, K-Dramas, or short films, you find beauty in narratives and the magic of storytelling.",
    colorClass: "from-violet-900/40 to-indigo-950/40 border-violet-500/20",
  },
  {
    id: 3,
    title: "Maroon Vibes",
    emoji: "💜",
    silhouette: "🌺",
    description: "Your favorite color reflecting your personality: deep, warm, elegant, and filled with quiet strength.",
    colorClass: "from-red-950/40 to-pink-950/40 border-red-500/20",
  },
  {
    id: 4,
    title: "Naruto Fan",
    emoji: "🍥",
    silhouette: "🥷",
    description: "Inspired by the Leaf Village, carrying that endless Naruto-level determination to never give up on dreams.",
    colorClass: "from-amber-900/40 to-red-950/40 border-amber-500/20",
  },
  {
    id: 5,
    title: "Rare & Precious",
    emoji: "✨",
    silhouette: "💎",
    description: "Calm yet bold, sensitive yet strong. A truly rare, honest, and precious person to have in life.",
    colorClass: "from-indigo-900/40 to-fuchsia-950/40 border-fuchsia-500/20",
  },
];

export default function MemoryRoom({ onComplete, playMagicalSound }: MemoryRoomProps) {
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number>(0);

  const handleCardClick = (id: number) => {
    playMagicalSound("tap");
    if (!flippedIds.includes(id)) {
      const nextFlipped = [...flippedIds, id];
      setFlippedIds(nextFlipped);
      if (nextFlipped.length === 5) {
        setTimeout(() => {
          playMagicalSound("success");
        }, 600);
      }
    }
  };

  const completed = flippedIds.length === 5;

  return (
    <div className="w-full flex flex-col items-center">
      {/* Header */}
      <div className="w-full p-4 glassmorphic rounded-2xl glow-pink border-pink-500/20 mb-4 text-center">
        <span className="px-3 py-1 rounded-full bg-violet-950/60 border border-violet-500/30 text-pink-400 text-xs font-semibold uppercase tracking-wider">
          Level 5: Short Film Memory Room 📺
        </span>
        <p className="text-xs text-violet-300 mt-2">
          Flip all 5 aesthetic cards to step into Ramya's silhouette memory deck!
        </p>
      </div>

      {/* Main card deck area */}
      <div className="w-full flex flex-col items-center gap-4">
        
        {/* Active card showcase with 3D Flip */}
        <div className="w-64 h-80 perspective-1000 cursor-pointer" onClick={() => handleCardClick(CARDS[selectedIdx].id)}>
          <motion.div
            animate={{ rotateY: flippedIds.includes(CARDS[selectedIdx].id) ? 180 : 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="w-full h-full relative transform-style-3d duration-500"
          >
            {/* Front Card Face */}
            <div className={`absolute inset-0 backface-hidden rounded-2xl border bg-gradient-to-b ${CARDS[selectedIdx].colorClass} p-6 flex flex-col items-center justify-between text-center shadow-xl`}>
              <div className="w-full flex justify-between items-center text-xs font-bold text-violet-400 font-mono">
                <span>Memory card</span>
                <span>{selectedIdx + 1}/5</span>
              </div>

              {/* Large Silhouette Icon inside aura */}
              <div className="w-24 h-24 rounded-full bg-violet-950/80 border border-violet-500/20 flex items-center justify-center relative shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                <span className="text-5xl animate-float">{CARDS[selectedIdx].silhouette}</span>
                <div className="absolute inset-0 rounded-full border border-violet-500/10 scale-110 animate-pulse" />
              </div>

              <div className="flex flex-col items-center">
                <h4 className="text-lg font-extrabold text-violet-100 flex items-center gap-1.5 leading-none mb-1">
                  {CARDS[selectedIdx].title}
                </h4>
                <p className="text-[10px] uppercase font-mono tracking-widest text-pink-400/80 animate-pulse">
                  Tap to Reveal
                </p>
              </div>
            </div>

            {/* Back Card Face */}
            <div
              className={`absolute inset-0 backface-hidden rounded-2xl border bg-gradient-to-b ${CARDS[selectedIdx].colorClass} p-6 flex flex-col items-center justify-between text-center shadow-xl rotate-y-180`}
              style={{
                background: "radial-gradient(circle at center, #11052c 0%, #050117 100%)",
              }}
            >
              {/* Top Label */}
              <div className="flex justify-between items-center w-full border-b border-violet-500/10 pb-2 mb-2">
                <h4 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-amber-300 flex items-center gap-1">
                  {CARDS[selectedIdx].emoji} {CARDS[selectedIdx].title}
                </h4>
                <span className="text-[10px] text-pink-400 font-mono">REVEALED</span>
              </div>

              {/* Aesthetic Illustration Overlay Silhouette */}
              <div className="flex-1 flex items-center justify-center p-3 relative">
                {/* Silhouette Shadow Backdrop */}
                <div className="absolute text-7xl font-bold opacity-10 filter blur-[1px]">
                  {CARDS[selectedIdx].silhouette}
                </div>
                <p className="text-xs font-serif leading-relaxed text-violet-200 z-10 italic">
                  &ldquo;{CARDS[selectedIdx].description}&rdquo;
                </p>
              </div>

              {/* Sparkles */}
              <div className="flex items-center gap-1 text-[10px] text-amber-300 font-mono tracking-widest uppercase">
                <Sparkles className="w-3 h-3 animate-spin text-amber-400" />
                Rare Soul
              </div>
            </div>
          </motion.div>
        </div>

        {/* Card selectors */}
        <div className="flex gap-2.5 mt-2 justify-center">
          {CARDS.map((card, idx) => {
            const isSelected = selectedIdx === idx;
            const isFlipped = flippedIds.includes(card.id);

            return (
              <motion.button
                key={card.id}
                type="button"
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  playMagicalSound("tap");
                  setSelectedIdx(idx);
                }}
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold border cursor-pointer transition-all ${
                  isSelected
                    ? "bg-pink-600 border-pink-400 text-white shadow-lg shadow-pink-500/30 scale-110"
                    : isFlipped
                    ? "bg-violet-950/60 border-violet-500/40 text-violet-300"
                    : "bg-slate-900/40 border-violet-950/80 text-violet-500 hover:text-violet-300"
                }`}
              >
                {isFlipped ? card.emoji : idx + 1}
              </motion.button>
            );
          })}
        </div>

        {/* Action Button */}
        {completed && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-[280px]"
          >
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onComplete}
              className="w-full mt-4 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-pink-500 text-white font-extrabold text-xs shadow-lg shadow-pink-500/20 cursor-pointer"
            >
              Enter the Mystery Gift Box 🎁
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
