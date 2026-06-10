"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronRight } from "lucide-react";

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
  const [floatingPetals, setFloatingPetals] = useState<{ id: number; left: number; delay: number }[]>([]);

  // Typewriter animation
  useEffect(() => {
    setTypedText("");
    setFinished(false);
    let index = 0;
    
    const interval = setInterval(() => {
      if (index < LETTER_TEXT.length) {
        setTypedText((prev) => prev + LETTER_TEXT.charAt(index));
        if (index % 3 === 0) {
          playMagicalSound("type");
        }
        index++;
      } else {
        setFinished(true);
        clearInterval(interval);
        playMagicalSound("sparkle");
      }
    }, 45); // typing speed

    return () => clearInterval(interval);
  }, [playMagicalSound]);

  // Floating maroon petals
  useEffect(() => {
    const interval = setInterval(() => {
      setFloatingPetals((prev) => [
        ...prev.slice(-15),
        {
          id: Date.now() + Math.random(),
          left: Math.random() * 100,
          delay: Math.random() * 2
        }
      ]);
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full p-4.5 glassmorphic rounded-2xl glow-pink text-left flex flex-col relative overflow-hidden min-h-[300px] max-h-[360px]">
      
      {/* Floating maroon petals */}
      {floatingPetals.map((petal) => (
        <div
          key={petal.id}
          className="floating-heart text-pink-500/35 text-xl"
          style={{
            left: `${petal.left}%`,
            animationDelay: `${petal.delay}s`,
            bottom: 0,
            color: "rgba(176, 48, 96, 0.4)", // maroon petal look
          }}
        >
          🌸
        </div>
      ))}

      {/* Header */}
      <div className="text-center border-b border-violet-500/10 pb-3 mb-4">
        <h3 className="text-lg font-bold text-pink-300 font-mono tracking-widest uppercase flex items-center justify-center gap-1.5">
          <Sparkles className="w-4 h-4 text-pink-400 fill-pink-500" />
          A Letter From the Heart
        </h3>
      </div>

      {/* Typing box */}
      <div className="flex-1 overflow-y-auto pr-1 font-serif text-xs leading-relaxed text-violet-100 whitespace-pre-line max-h-[170px] bg-slate-950/25 p-3.5 rounded-xl border border-violet-500/5 shadow-inner">
        {typedText}
        {!finished && (
          <span className="inline-block w-1.5 h-4 bg-pink-400 ml-0.5 animate-pulse" />
        )}
      </div>

      {/* Next Level button */}
      <AnimatePresence>
        {finished && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onComplete}
            className="mt-5 self-center flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 via-pink-400 to-violet-600 text-white font-extrabold text-xs shadow-md shadow-pink-500/20 cursor-pointer"
          >
            Unlock Grand Finale 🎂
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
