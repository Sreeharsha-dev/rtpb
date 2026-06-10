"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronRight, Heart } from "lucide-react";

interface BirthdayLetterProps {
  onComplete: () => void;
  playMagicalSound: (type: 'tap' | 'success' | 'failure' | 'sparkle' | 'type') => void;
}

const LETTER_TEXT = `Dearest Ramya,

On this very special day, I wanted to write you something that words can barely capture. 

You are the quiet melody in a noisy world, the traditional grace in a modern era, and the bright spark that makes everything beautiful. Your kindness, your simplicity, and your honesty are rare gifts that inspire everyone around you.

Thank you for being you. May this year bring you all the infinite joy, peace, love, and starlight you deserve.

Happy Birthday, my favorite adventure! ❤️`;

export default function BirthdayLetter({ onComplete, playMagicalSound }: BirthdayLetterProps) {
  const [typedText, setTypedText] = useState<string>("");
  const [finished, setFinished] = useState<boolean>(false);
  const [floatingPetals, setFloatingPetals] = useState<{ id: number; left: number; delay: number; emoji: string }[]>([]);
  const [showSparkle, setShowSparkle] = useState(false);

  useEffect(() => {
    setTypedText("");
    setFinished(false);
    let index = 0;

    const interval = setInterval(() => {
      if (index < LETTER_TEXT.length) {
        setTypedText((prev) => prev + LETTER_TEXT.charAt(index));
        if (index % 3 === 0 && index % 20 !== 0) {
          playMagicalSound("type");
        }
        if (index % 50 === 0 && index > 0) {
          playMagicalSound("tap");
        }
        index++;
      } else {
        setFinished(true);
        clearInterval(interval);
        playMagicalSound("sparkle");
        setShowSparkle(true);
        setTimeout(() => setShowSparkle(false), 2000);
      }
    }, 35);

    return () => clearInterval(interval);
  }, [playMagicalSound]);

  useEffect(() => {
    const emojis = ["🌸", "💜", "✨", "❤️", "🌺", "🦋"];
    const interval = setInterval(() => {
      setFloatingPetals((prev) => [
        ...prev.slice(-15),
        {
          id: Date.now() + Math.random(),
          left: Math.random() * 100,
          delay: Math.random() * 2,
          emoji: emojis[Math.floor(Math.random() * emojis.length)],
        },
      ]);
    }, 700);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full p-4 glassmorphic rounded-2xl glow-pink text-left flex flex-col relative overflow-hidden min-h-[320px] max-h-[380px]">
      {/* Floating petals */}
      {floatingPetals.map((petal) => (
        <div
          key={petal.id}
          className="floating-heart text-pink-500/35 text-xl"
          style={{
            left: `${petal.left}%`,
            animationDelay: `${petal.delay}s`,
            bottom: 0,
            color: "rgba(176, 48, 96, 0.4)",
          }}
        >
          {petal.emoji}
        </div>
      ))}

      {/* Sparkle burst on finish */}
      <AnimatePresence>
        {showSparkle && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0, 2, 3] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl pointer-events-none z-20"
          >
            ✨
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="text-center border-b border-violet-500/10 pb-3 mb-3">
        <motion.h3
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-violet-300 to-amber-200 font-mono tracking-widest uppercase flex items-center justify-center gap-1.5"
          style={{ backgroundSize: "200% 100%" }}
        >
          <Sparkles className={`w-4 h-4 text-pink-400 ${finished ? 'animate-spin' : ''}`} />
          A Letter From the Heart
        </motion.h3>
      </div>

      {/* Typing box */}
      <div className="flex-1 overflow-y-auto pr-1 font-serif text-xs leading-relaxed text-violet-100 whitespace-pre-line max-h-[180px] bg-slate-950/25 p-3.5 rounded-xl border border-violet-500/5 shadow-inner relative">
        {/* Subtle paper texture overlay */}
        <div className="absolute inset-0 opacity-[0.03] rounded-xl pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3Ccircle cx='13' cy='13' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <p className="relative z-10">
          {typedText}
          {!finished && (
            <span className="inline-block w-1.5 h-4 bg-gradient-to-b from-pink-400 to-violet-400 ml-0.5 animate-pulse rounded-sm" />
          )}
          {finished && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="inline-block w-1.5 h-4 bg-pink-400 ml-0.5 rounded-sm"
            />
          )}
        </p>
      </div>

      {/* Completion effects and button */}
      <AnimatePresence>
        {finished && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 15 }}
            className="mt-4 flex items-center justify-between"
          >
            {/* Decorative hearts */}
            <div className="flex gap-0.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  <Heart className={`w-3 h-3 text-pink-400/60 ${i === 1 ? 'fill-pink-500/80' : ''}`} />
                </motion.div>
              ))}
            </div>

            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onComplete}
              className="flex items-center gap-2 px-5 py-2 rounded-2xl bg-gradient-to-r from-pink-500 via-pink-400 to-violet-600 text-white font-extrabold text-xs shadow-md shadow-pink-500/20 cursor-pointer"
            >
              Unlock Grand Finale 🎂
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
