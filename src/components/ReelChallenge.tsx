"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Film, Award } from "lucide-react";
import confetti from "canvas-confetti";

interface ReelChallengeProps {
  onComplete: () => void;
  playMagicalSound: (type: 'tap' | 'success' | 'failure' | 'sparkle' | 'type') => void;
}

interface Bubble {
  id: number;
  type: "reel" | "distraction";
  content: string;
  x: number; // percentage (5-95)
  y: number; // percentage (100 -> 0)
  size: number;
  speed: number;
}

export default function ReelChallenge({ onComplete, playMagicalSound }: ReelChallengeProps) {
  const [score, setScore] = useState<number>(0);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [completed, setCompleted] = useState<boolean>(false);
  const gameActiveRef = useRef<boolean>(true);
  const bubbleCounterRef = useRef<number>(0);

  // Spawn bubbles rising from bottom
  useEffect(() => {
    if (completed) return;

    const interval = setInterval(() => {
      if (!gameActiveRef.current) return;
      
      const isReel = Math.random() > 0.4;
      const reelContents = ["📱", "🎥", "🎬", "💜", "👑"];
      const distractionContents = ["⏰", "📚", "💻", "🚨"];

      bubbleCounterRef.current += 1;

      const newBubble: Bubble = {
        id: bubbleCounterRef.current,
        type: isReel ? "reel" : "distraction",
        content: isReel 
          ? reelContents[Math.floor(Math.random() * reelContents.length)]
          : distractionContents[Math.floor(Math.random() * distractionContents.length)],
        x: Math.random() * 80 + 10,
        y: 100, // starts at bottom
        size: 45 + Math.random() * 15,
        speed: 1.2 + Math.random() * 1.5,
      };

      setBubbles((prev) => [...prev, newBubble]);
    }, 700);

    return () => clearInterval(interval);
  }, [completed]);

  // Bubble floating loop
  useEffect(() => {
    if (completed) return;

    let animFrameId: number;

    const updateBubbles = () => {
      setBubbles((prevBubbles) => {
        const nextBubbles: Bubble[] = [];

        for (let b of prevBubbles) {
          const nextY = b.y - b.speed;
          if (nextY > -10) {
            nextBubbles.push({ ...b, y: nextY });
          }
        }
        return nextBubbles;
      });

      if (gameActiveRef.current) {
        animFrameId = requestAnimationFrame(updateBubbles);
      }
    };

    animFrameId = requestAnimationFrame(updateBubbles);
    return () => cancelAnimationFrame(animFrameId);
  }, [completed]);

  // Handle tapping a bubble
  const handleBubbleTap = (id: number, type: "reel" | "distraction") => {
    if (completed) return;

    // Pop bubble
    setBubbles((prev) => prev.filter((b) => b.id !== id));

    if (type === "reel") {
      playMagicalSound("tap");
      setScore((s) => {
        const nextScore = s + 1;
        if (nextScore >= 5 && gameActiveRef.current) {
          gameActiveRef.current = false;
          setCompleted(true);
          playMagicalSound("success");
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 }
          });
        }
        return nextScore;
      });
    } else {
      playMagicalSound("failure");
      setScore((s) => Math.max(0, s - 1));
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full p-4 glassmorphic rounded-2xl glow-pink border-pink-500/20 mb-4 text-center">
        <span className="px-3 py-1 rounded-full bg-violet-950/60 border border-violet-500/30 text-pink-400 text-xs font-semibold uppercase tracking-wider">
          Level 2: Reel Queen Challenge 🎥
        </span>
        <p className="text-xs text-violet-300 mt-2">
          &ldquo;Someone spends a little too much time scrolling reels 😄&rdquo;
        </p>
        <p className="text-[10px] text-violet-400/80 mt-1">
          Tap the rising reels (📱/🎥/🎬/💜) to catch them. Avoid popping work distractions (⏰/📚/🚨)!
        </p>
      </div>

      <div className="relative w-full max-w-[280px] h-[340px] bg-gradient-to-b from-[#1c0828] to-[#0c0314] rounded-[2.5rem] border-4 border-violet-900/60 overflow-hidden shadow-2xl flex flex-col items-center justify-between p-3 select-none">
        
        {/* Phone Notch */}
        <div className="absolute top-1 w-24 h-4 bg-violet-950/80 rounded-full border border-violet-900/20 z-20 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
        </div>

        {/* Score Display (Insta-style) */}
        <div className="w-full flex justify-between items-center px-4 mt-3 z-10">
          <span className="text-xs font-bold text-white tracking-wide">Queen_Ramya</span>
          <div className="flex items-center gap-1.5 bg-pink-600/90 border border-pink-400/30 px-3 py-1 rounded-full text-white font-mono text-xs shadow-md">
            <Film className="w-3.5 h-3.5" />
            Reels: {score}/5
          </div>
        </div>

        {/* Bubble stream area */}
        <div className="relative w-full h-full overflow-hidden mt-2">
          {bubbles.map((b) => (
            <motion.button
              key={b.id}
              onClick={() => handleBubbleTap(b.id, b.type)}
              whileTap={{ scale: 0.8 }}
              className={`absolute rounded-full flex items-center justify-center bg-violet-950/40 backdrop-blur-xs border cursor-pointer select-none active:bg-violet-900/50 shadow-md ${
                b.type === "reel" ? "border-pink-500/30 glow-pink" : "border-red-500/20"
              }`}
              style={{
                left: `${b.x}%`,
                bottom: `${100 - b.y}%`,
                transform: "translateX(-50%)",
                width: `${b.size}px`,
                height: `${b.size}px`,
                fontSize: `${b.size * 0.48}px`,
              }}
            >
              {b.content}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Level Complete Reward */}
      <AnimatePresence>
        {completed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full mt-4 p-5 glassmorphic rounded-2xl glow-gold border-amber-500/40 text-center flex flex-col items-center"
          >
            <div className="w-12 h-12 rounded-full bg-amber-950/60 border border-amber-500/40 flex items-center justify-center mb-3">
              <Award className="w-6 h-6 text-amber-400" />
            </div>
            <h4 className="text-md font-bold text-amber-200">Level Reward Unlocked!</h4>
            <p className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-violet-300 to-amber-300 mt-2 mb-4">
              &ldquo;Hobby unlocked: Endless Reels Watching Champion 👑&rdquo;
            </p>
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onComplete}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-pink-500 text-white font-bold text-xs shadow-md shadow-pink-500/20 cursor-pointer"
            >
              Continue Journey 🌸
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
