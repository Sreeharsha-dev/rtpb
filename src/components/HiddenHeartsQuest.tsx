"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, Star } from "lucide-react";
import confetti from "canvas-confetti";

interface HiddenHeartsQuestProps {
  onComplete: () => void;
  playMagicalSound: (type: 'tap' | 'success' | 'failure' | 'sparkle' | 'type') => void;
}

interface QuestHeart {
  id: number;
  message: string;
  x: number;
  y: number;
  found: boolean;
  delay: number;
}

interface SparkleBurst {
  id: number;
  x: number;
  y: number;
}

const INITIAL_QUEST_HEARTS: QuestHeart[] = [
  { id: 1, message: "Sensitive but Strong", x: 12, y: 32, found: false, delay: 0 },
  { id: 2, message: "Always Honest", x: 48, y: 15, found: false, delay: 0.1 },
  { id: 3, message: "Traditional at Heart", x: 88, y: 28, found: false, delay: 0.2 },
  { id: 4, message: "Maroon Vibes Forever", x: 26, y: 48, found: false, delay: 0.3 },
  { id: 5, message: "Bright & Positive", x: 74, y: 45, found: false, delay: 0.4 },
  { id: 6, message: "Graceful & Loving", x: 15, y: 72, found: false, delay: 0.5 },
  { id: 7, message: "Rare Personality", x: 52, y: 65, found: false, delay: 0.6 },
  { id: 8, message: "Kind Soul", x: 84, y: 78, found: false, delay: 0.7 },
  { id: 9, message: "Fearlessly Straight Forward", x: 34, y: 22, found: false, delay: 0.8 },
  { id: 10, message: "Someone Truly Special", x: 68, y: 82, found: false, delay: 0.9 },
];

export default function HiddenHeartsQuest({ onComplete, playMagicalSound }: HiddenHeartsQuestProps) {
  const [hearts, setHearts] = useState<QuestHeart[]>(INITIAL_QUEST_HEARTS);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [sparkBursts, setSparkBursts] = useState<SparkleBurst[]>([]);
  const [pulseActive, setPulseActive] = useState(false);
  const sparkCounter = useRef(0);

  const foundCount = hearts.filter((h) => h.found).length;
  const completed = foundCount === 10;

  // Pulse hint effect for unfound hearts
  useEffect(() => {
    if (completed) return;
    const interval = setInterval(() => {
      setPulseActive((p) => !p);
    }, 3000);
    return () => clearInterval(interval);
  }, [completed]);

  const handleHeartClick = (id: number) => {
    const target = hearts.find((h) => h.id === id);
    if (!target || target.found) return;

    playMagicalSound("tap");

    // Sparkle burst at tap location
    sparkCounter.current += 1;
    setSparkBursts((prev) => [...prev, { id: sparkCounter.current, x: target.x, y: target.y }]);
    setTimeout(() => {
      setSparkBursts((prev) => prev.filter((s) => s.id !== sparkCounter.current));
    }, 800);

    setHearts((prev) =>
      prev.map((h) => (h.id === id ? { ...h, found: true } : h))
    );
    setLastMessage(`Heart ${id}: ${target.message}`);

    if (foundCount + 1 === 10) {
      playMagicalSound("success");
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 },
        colors: ["#ec4899", "#a78bfa", "#f59e0b", "#10b981"],
      });
      setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { x: 0.2, y: 0.4 },
        });
      }, 300);
      setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { x: 0.8, y: 0.4 },
        });
      }, 600);
    } else {
      confetti({
        particleCount: 15,
        spread: 30,
        origin: { x: target.x / 100, y: 0.3 + (target.y / 100) * 0.4 },
      });
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full p-2.5 glassmorphic rounded-xl glow-pink border-pink-500/20 mb-2 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
        <h3 className="text-xs font-bold text-pink-400 uppercase tracking-wider font-mono relative z-10">
          Hidden Hearts Quest ⭐
        </h3>
        <p className="text-[10px] text-violet-300 mt-1 relative z-10">
          Find 10 glowing hearts hidden in the Starry Night Scene!
        </p>
      </div>

      <div
        className="relative w-full h-[270px] rounded-2xl border border-violet-500/30 overflow-hidden shadow-2xl flex flex-col items-center justify-between p-2.5 select-none"
        style={{
          background: "linear-gradient(to bottom, #07021c 0%, #150638 60%, #060212 100%)",
        }}
      >
        {/* Shooting star */}
        <div className="absolute top-2 left-0 w-1 h-1 bg-white rounded-full animate-comet opacity-30" style={{ animationDuration: '4s', animationDelay: '2s' }} />

        <div className="absolute inset-0 pointer-events-none opacity-40">
          {[...Array(30)].map((_, i) => (
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

        <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-transparent shadow-[8px_-8px_0_0_#fef3c7] pointer-events-none opacity-80 filter drop-shadow-[0_0_8px_rgba(254,243,199,0.3)]" />

        <div className="absolute bottom-0 inset-x-0 h-11 pointer-events-none opacity-40">
          <svg className="w-full h-full text-slate-950 fill-current" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 80 Q 25 60, 50 85 T 100 70 L 100 100 L 0 100 Z" />
          </svg>
        </div>

        <div className="w-full flex justify-between items-center z-10">
          <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest font-mono">Starry Night</span>
          <div className="px-3 py-0.5 rounded-full bg-violet-950/70 border border-violet-500/30 text-pink-300 font-mono text-xs font-bold shadow-md">
            <motion.span
              key={foundCount}
              initial={{ scale: 1.5 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
            >
              Hearts: {foundCount}/10
            </motion.span>
          </div>
        </div>

        {/* Sparkle bursts */}
        {sparkBursts.map((s) => (
          <div
            key={s.id}
            className="absolute pointer-events-none z-30"
            style={{ left: `${s.x}%`, top: `${s.y}%`, transform: "translate(-50%, -50%)" }}
          >
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="text-2xl"
            >
              ✨
            </motion.div>
          </div>
        ))}

        <div className="relative w-full h-full">
          {hearts.map((h) => (
            <div
              key={h.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
              style={{ left: `${h.x}%`, top: `${h.y}%`, transitionDelay: `${h.delay}s` }}
            >
              <AnimatePresence>
                {!h.found ? (
                  <motion.button
                    type="button"
                    onClick={() => handleHeartClick(h.id)}
                    whileHover={{ scale: 1.35, rotate: [0, 5, -5, 0] }}
                    whileTap={{ scale: 0.8 }}
                    className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer select-none relative"
                    style={{
                      background: `rgba(236, 72, 153, ${pulseActive ? 0.2 : 0.1})`,
                      transition: "background 0.3s ease",
                    }}
                  >
                    <Heart
                      className={`w-4 h-4 transition-all duration-300 ${
                        pulseActive
                          ? "text-pink-400 fill-pink-500/40 filter drop-shadow-[0_0_8px_rgba(236,72,153,0.6)]"
                          : "text-pink-500/30 fill-pink-500/20 filter drop-shadow-[0_0_4px_rgba(236,72,153,0.3)]"
                      }`}
                    />
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ repeat: Infinity, duration: 2, delay: h.delay }}
                      className="absolute inset-0 rounded-full border border-pink-500/20"
                    />
                  </motion.button>
                ) : (
                  <motion.div
                    initial={{ scale: 0, opacity: 0, rotate: 180 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 12 }}
                    className="flex flex-col items-center bg-pink-950/80 border border-pink-500/40 rounded-xl px-2.5 py-1 shadow-lg shadow-pink-500/20"
                  >
                    <span className="text-base mb-0.5">💖</span>
                    <span className="text-[8px] font-sans font-bold uppercase tracking-wider text-pink-200 leading-none whitespace-nowrap">
                      {h.message}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

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

      {/* Progress indicators */}
      {!completed && (
        <div className="w-full max-w-[260px] mt-2">
          <div className="flex gap-1 justify-center">
            {hearts.map((h) => (
              <div
                key={h.id}
                className={`w-4 h-4 rounded-full transition-all duration-300 ${
                  h.found
                    ? "bg-pink-500 shadow-[0_0_6px_rgba(236,72,153,0.6)] scale-110"
                    : "bg-violet-950/60 border border-violet-500/20"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {completed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full mt-4 p-5 glassmorphic rounded-2xl glow-gold border-amber-500/40 text-center flex flex-col items-center max-w-sm"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 rounded-full bg-amber-950/60 border border-amber-500/40 flex items-center justify-center mb-3"
            >
              <Star className="w-6 h-6 text-amber-400 fill-amber-500" />
            </motion.div>
            <h4 className="text-md font-bold text-amber-200">Quest Completed!</h4>
            <p className="text-sm italic font-serif text-violet-100 my-4 px-2 leading-relaxed">
              &ldquo;You found every piece of what makes Ramya special.&rdquo;
            </p>
            <div className="grid grid-cols-2 gap-1.5 mb-4 w-full max-w-xs">
              {hearts.map((h) => (
                <div key={h.id} className="text-[8px] font-semibold text-pink-300 bg-pink-950/40 rounded-lg px-2 py-1 border border-pink-500/20">
                  💖 {h.message}
                </div>
              ))}
            </div>
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onComplete}
              className="game-button"
            >
              Continue Journey 🌸
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
