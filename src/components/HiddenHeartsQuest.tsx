"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";

interface HiddenHeartsQuestProps {
  onComplete: () => void;
  playMagicalSound: (type: 'tap' | 'success' | 'failure' | 'sparkle' | 'type') => void;
}

interface QuestHeart {
  id: number;
  message: string;
  x: number; // percentage
  y: number; // percentage
  found: boolean;
}

const INITIAL_QUEST_HEARTS: QuestHeart[] = [
  { id: 1, message: "Sensitive but Strong", x: 12, y: 32, found: false },
  { id: 2, message: "Always Honest", x: 48, y: 15, found: false },
  { id: 3, message: "Traditional at Heart", x: 88, y: 28, found: false },
  { id: 4, message: "Maroon Vibes Forever", x: 26, y: 48, found: false },
  { id: 5, message: "Bright & Positive", x: 74, y: 45, found: false },
  { id: 6, message: "Graceful & Loving", x: 15, y: 72, found: false },
  { id: 7, message: "Rare Personality", x: 52, y: 65, found: false },
  { id: 8, message: "Kind Soul", x: 84, y: 78, found: false },
  { id: 9, message: "Fearlessly Straight Forward", x: 34, y: 22, found: false },
  { id: 10, message: "Someone Truly Special", x: 68, y: 82, found: false },
];

export default function HiddenHeartsQuest({ onComplete, playMagicalSound }: HiddenHeartsQuestProps) {
  const [hearts, setHearts] = useState<QuestHeart[]>(INITIAL_QUEST_HEARTS);
  const [lastMessage, setLastMessage] = useState<string | null>(null);

  const foundCount = hearts.filter((h) => h.found).length;
  const completed = foundCount === 10;

  const handleHeartClick = (id: number) => {
    const target = hearts.find((h) => h.id === id);
    if (!target || target.found) return;

    playMagicalSound("tap");
    setHearts((prev) =>
      prev.map((h) => (h.id === id ? { ...h, found: true } : h))
    );
    setLastMessage(`Heart ${id}: ${target.message}`);

    // Confetti pop on finding the last one
    if (foundCount + 1 === 10) {
      playMagicalSound("success");
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.65 },
        colors: ["#ec4899", "#a78bfa", "#f59e0b", "#10b981"],
      });
    } else {
      // Small burst on each heart found
      confetti({
        particleCount: 15,
        spread: 30,
        origin: { x: target.x / 100, y: 0.3 + (target.y / 100) * 0.4 }
      });
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Title */}
      <div className="w-full p-2.5 glassmorphic rounded-xl glow-pink border-pink-500/20 mb-2 text-center">
        <h3 className="text-xs font-bold text-pink-400 uppercase tracking-wider font-mono">
          Hidden Hearts Quest ⭐
        </h3>
        <p className="text-[10px] text-violet-300 mt-1">
          Find 10 glowing hearts hidden in the Starry Night Scene!
        </p>
      </div>

      {/* Starry night canvas board */}
      <div
        className="relative w-full h-[260px] rounded-2xl border border-violet-500/30 overflow-hidden shadow-2xl flex flex-col items-center justify-between p-2.5 select-none"
        style={{
          background: "linear-gradient(to bottom, #07021c 0%, #150638 60%, #060212 100%)",
        }}
      >
        {/* Floating background stars */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          {[...Array(25)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-white rounded-full animate-twinkle"
              style={{
                width: `${1 + Math.random() * 2}px`,
                height: `${1 + Math.random() * 2}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        {/* Large Glowing Crescent Moon */}
        <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-transparent shadow-[8px_-8px_0_0_#fef3c7] pointer-events-none opacity-80 filter drop-shadow-[0_0_8px_rgba(254,243,199,0.3)]" />

        {/* Landscape Hills Silhouette */}
        <div className="absolute bottom-0 inset-x-0 h-11 pointer-events-none opacity-40">
          <svg className="w-full h-full text-slate-950 fill-current" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 80 Q 25 60, 50 85 T 100 70 L 100 100 L 0 100 Z" />
          </svg>
        </div>

        {/* HUD Header */}
        <div className="w-full flex justify-between items-center z-10">
          <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest font-mono">Starry Night</span>
          <div className="px-3 py-0.5 rounded-full bg-violet-950/70 border border-violet-500/30 text-pink-300 font-mono text-xs font-bold shadow-md">
            Hearts: {foundCount}/10
          </div>
        </div>

        {/* Quest Hearts Grid */}
        <div className="relative w-full h-full">
          {hearts.map((h) => (
            <div
              key={h.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
              style={{ left: `${h.x}%`, top: `${h.y}%` }}
            >
              <AnimatePresence>
                {!h.found ? (
                  <motion.button
                    type="button"
                    onClick={() => handleHeartClick(h.id)}
                    whileHover={{ scale: 1.3, rotate: [0, 5, -5, 0] }}
                    whileTap={{ scale: 0.8 }}
                    className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer select-none relative"
                    style={{
                      background: "rgba(236, 72, 153, 0.12)",
                    }}
                  >
                    <Heart className="w-3.5 h-3.5 text-pink-500/40 fill-pink-500/25 filter drop-shadow-[0_0_4px_rgba(236,72,153,0.3)] hover:text-pink-500 hover:fill-pink-500" />
                  </motion.button>
                ) : (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1.1, opacity: 1 }}
                    className="w-4 h-4 rounded-full bg-pink-500/90 flex items-center justify-center shadow-lg"
                  >
                    <Heart className="w-2.5 h-2.5 text-white fill-white" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Live unlocked trait Banner */}
        <div className="w-full text-center py-1.5 border-t border-violet-500/10 z-10">
          <AnimatePresence mode="wait">
            {lastMessage && !completed && (
              <motion.p
                key={lastMessage}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-[10px] font-bold text-amber-300 flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3 h-3 text-amber-400 fill-amber-500" />
                Unlocked: {lastMessage}
              </motion.p>
            )}
            {!lastMessage && !completed && (
              <p className="text-[10px] text-violet-400/80 font-mono">Scan the starry canvas to search...</p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Completion Modal */}
      <AnimatePresence>
        {completed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full mt-4 p-5 glassmorphic rounded-2xl glow-gold border-amber-500/40 text-center flex flex-col items-center max-w-sm"
          >
            <div className="w-12 h-12 rounded-full bg-amber-950/60 border border-amber-500/40 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6 text-amber-400" />
            </div>
            <h4 className="text-md font-bold text-amber-200">Quest Completed!</h4>

            <p className="text-sm italic font-serif text-violet-100 my-4 px-2 leading-relaxed">
              &ldquo;You found every piece of what makes Ramya special.&rdquo;
            </p>
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onComplete}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-pink-500 text-white font-extrabold text-xs shadow-md shadow-pink-500/20 cursor-pointer"
            >
              Continue Journey 🌸
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
