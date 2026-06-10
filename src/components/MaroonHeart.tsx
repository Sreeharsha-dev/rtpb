"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles as SparklesIcon } from "lucide-react";
import confetti from "canvas-confetti";

interface MaroonHeartProps {
  onComplete: () => void;
  playMagicalSound: (type: 'tap' | 'success' | 'failure' | 'sparkle' | 'type') => void;
}

interface HiddenHeart {
  id: number;
  label: string;
  emoji: string;
  x: number; // percentage
  y: number; // percentage
  found: boolean;
}

const INITIAL_HEARTS: HiddenHeart[] = [
  { id: 1, label: "Sensitive", emoji: "❤️", x: 20, y: 35, found: false },
  { id: 2, label: "Straight Forward", emoji: "💫", x: 78, y: 25, found: false },
  { id: 3, label: "Traditional", emoji: "🌸", x: 50, y: 50, found: false },
  { id: 4, label: "Strong Minded", emoji: "✨", x: 18, y: 70, found: false },
  { id: 5, label: "Caring Soul", emoji: "🤍", x: 74, y: 72, found: false },
];

export default function MaroonHeart({ onComplete, playMagicalSound }: MaroonHeartProps) {
  const [hearts, setHearts] = useState<HiddenHeart[]>(INITIAL_HEARTS);
  const [lastFound, setLastFound] = useState<string | null>(null);
  
  const foundCount = hearts.filter((h) => h.found).length;
  const completed = foundCount === 5;

  const handleHeartClick = (id: number) => {
    const heart = hearts.find((h) => h.id === id);
    if (!heart || heart.found) return;

    playMagicalSound("tap");
    setHearts((prev) =>
      prev.map((h) => (h.id === id ? { ...h, found: true } : h))
    );
    setLastFound(`${heart.label} ${heart.emoji}`);

    // Confetti pop on finding the last one
    if (foundCount + 1 === 5) {
      playMagicalSound("success");
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.65 },
        colors: ["#800020", "#b03060", "#ffb86c", "#ff79c6"],
      });
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Level Title */}
      <div className="w-full p-4 glassmorphic rounded-2xl glow-pink border-pink-500/20 mb-4 text-center">
        <span className="px-3 py-1 rounded-full bg-red-950/60 border border-red-500/30 text-red-300 text-xs font-semibold uppercase tracking-wider">
          Level 3: The Maroon Heart 💜
        </span>
        <p className="text-xs text-red-200 mt-2">
          Maroon is Ramya's favorite color. Find the 5 hidden glowing maroon hearts in the traditional garden to reveal her true spirit.
        </p>
      </div>

      {/* Main Game Card */}
      <div className="relative w-full h-[320px] rounded-2xl border border-red-500/30 overflow-hidden shadow-2xl flex flex-col items-center justify-between p-4 select-none"
        style={{
          background: "radial-gradient(circle at center, #350116 0%, #150007 100%)",
        }}
      >
        {/* Elegant Gold Traditional Mandala SVG Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-20 flex items-center justify-center">
          <svg className="w-64 h-64 text-amber-500 animate-slow-spin" style={{ animationDuration: '60s' }} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
            <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <path d="M50 0 L50 100 M0 50 L100 50" stroke="currentColor" strokeWidth="0.3" />
            {[...Array(8)].map((_, i) => (
              <g key={i} transform={`rotate(${i * 45} 50 50)`}>
                <path d="M50 50 C45 35, 50 20, 50 10 C50 20, 55 35, 50 50" fill="none" stroke="currentColor" strokeWidth="0.4" />
              </g>
            ))}
          </svg>
        </div>

        {/* Floating Petals Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-50">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                y: -50,
                x: Math.random() * 300,
                rotate: 0,
                opacity: 0.2 + Math.random() * 0.4,
              }}
              animate={{
                y: 400,
                x: Math.random() * 300 + (Math.random() > 0.5 ? 20 : -20),
                rotate: 360,
              }}
              transition={{
                repeat: Infinity,
                duration: 6 + Math.random() * 6,
                delay: i * 0.8,
              }}
              className="absolute text-xs"
            >
              🌸
            </motion.div>
          ))}
        </div>

        {/* HUD: Found counters */}
        <div className="w-full flex justify-between items-center z-10">
          <span className="text-xs font-semibold text-red-300">Traditional patterns activated...</span>
          <div className="px-3 py-1 rounded-full bg-red-950/80 border border-red-500/30 text-red-200 font-mono text-xs shadow-md">
            Hearts: {foundCount}/5
          </div>
        </div>

        {/* Game grid for hidden hearts */}
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
                    whileHover={{ scale: 1.25 }}
                    whileTap={{ scale: 0.8 }}
                    className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer select-none relative group border border-red-500/20"
                    style={{
                      background: "rgba(128, 0, 32, 0.45)",
                      boxShadow: "0 0 10px rgba(128,0,32,0.6)",
                    }}
                  >
                    <Heart className="w-4 h-4 text-red-500 fill-red-800 animate-pulse" />
                    {/* Ring aura */}
                    <div className="absolute inset-0 rounded-full border border-red-500/30 scale-120 animate-ping opacity-30" style={{ animationDuration: '2.5s' }} />
                  </motion.button>
                ) : (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1.1, opacity: 1 }}
                    className="flex flex-col items-center bg-red-950/80 border border-red-500/40 rounded-xl px-2.5 py-1.5 shadow-md max-w-[100px] text-center"
                  >
                    <span className="text-lg mb-0.5">{h.emoji}</span>
                    <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-red-200 leading-none">
                      {h.label}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Live traits feedback banner */}
        <div className="w-full text-center py-2 border-t border-red-500/10 z-10">
          <AnimatePresence mode="wait">
            {lastFound && !completed && (
              <motion.p
                key={lastFound}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-xs font-semibold text-amber-200 flex items-center justify-center gap-1.5"
              >
                <SparklesIcon className="w-3.5 h-3.5 text-amber-400 fill-amber-500" />
                Revealed trait: {lastFound}
              </motion.p>
            )}
            {!lastFound && !completed && (
              <p className="text-[11px] text-red-300/80">Tap floating gold auric zones to search...</p>
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
            className="w-full mt-4 p-5 glassmorphic rounded-2xl glow-gold border-amber-500/40 text-center flex flex-col items-center"
          >
            <div className="w-12 h-12 rounded-full bg-red-950/80 border border-red-500/40 flex items-center justify-center mb-3">
              <Heart className="w-6 h-6 text-red-500 fill-red-500" />
            </div>
            <h4 className="text-md font-bold text-amber-200">The Maroon Seal Opened!</h4>
            <div className="grid grid-cols-2 gap-2 mt-3 mb-5 w-full max-w-xs">
              {hearts.map((h) => (
                <div key={h.id} className="p-2 bg-red-950/40 border border-red-500/20 rounded-lg text-center text-xs font-semibold text-red-200">
                  {h.emoji} {h.label}
                </div>
              ))}
            </div>
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onComplete}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 text-white font-bold text-xs shadow-md shadow-amber-500/20 cursor-pointer"
            >
              Continue Journey 🌸
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
