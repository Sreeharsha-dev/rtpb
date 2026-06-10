"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ShieldAlert } from "lucide-react";
import confetti from "canvas-confetti";

interface NinjaTrialProps {
  onComplete: () => void;
  playMagicalSound: (type: 'tap' | 'success' | 'failure' | 'sparkle' | 'type') => void;
}

interface Item {
  id: number;
  type: "scroll" | "shuriken";
  x: number; // percentage width (0-100)
  y: number; // pixels from top (0-320)
  speed: number;
}

export default function NinjaTrial({ onComplete, playMagicalSound }: NinjaTrialProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ninjaX, setNinjaX] = useState<number>(50); // percentage (0-100)
  const [score, setScore] = useState<number>(0);
  const [items, setItems] = useState<Item[]>([]);
  const [completed, setCompleted] = useState<boolean>(false);
  const gameActiveRef = useRef<boolean>(true);
  const itemCounterRef = useRef<number>(0);

  // Dragging handler for ninja headband
  const handleDrag = (event: any, info: any) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((info.point.x - rect.left) / rect.width) * 100;
      setNinjaX(Math.max(5, Math.min(95, x)));
    }
  };

  // Spawn falling objects
  useEffect(() => {
    if (completed) return;

    const interval = setInterval(() => {
      if (!gameActiveRef.current) return;
      const isScroll = Math.random() > 0.35;
      itemCounterRef.current += 1;

      const newItem: Item = {
        id: itemCounterRef.current,
        type: isScroll ? "scroll" : "shuriken",
        x: Math.random() * 90 + 5,
        y: 0,
        speed: 3 + Math.random() * 3,
      };

      setItems((prev) => [...prev, newItem]);
    }, 900);

    return () => clearInterval(interval);
  }, [completed]);

  // Physics game loop
  useEffect(() => {
    if (completed) return;

    let animFrameId: number;

    const updatePhysics = () => {
      setItems((prevItems) => {
        const nextItems: Item[] = [];
        
        for (let item of prevItems) {
          const nextY = item.y + item.speed;

          // Check collision at bottom (approx y: 260 to 290)
          if (nextY >= 250 && nextY <= 290) {
            const distance = Math.abs(item.x - ninjaX);
            if (distance < 15) {
              // Collision!
              if (item.type === "scroll") {
                playMagicalSound("tap");
                setScore((s) => {
                  const newScore = s + 1;
                  if (newScore >= 5 && gameActiveRef.current) {
                    gameActiveRef.current = false;
                    setCompleted(true);
                    playMagicalSound("success");
                    confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
                  }
                  return newScore;
                });
              } else {
                playMagicalSound("failure");
                setScore((s) => Math.max(0, s - 1));
              }
              continue; // Skip adding to nextItems (destroys item)
            }
          }

          // Keep item if it hasn't fallen off screen
          if (nextY < 320) {
            nextItems.push({ ...item, y: nextY });
          }
        }
        return nextItems;
      });

      if (gameActiveRef.current) {
        animFrameId = requestAnimationFrame(updatePhysics);
      }
    };

    animFrameId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animFrameId);
  }, [ninjaX, completed, playMagicalSound]);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full p-4 glassmorphic rounded-2xl glow-pink border-pink-500/20 mb-4 text-center">
        <span className="px-3 py-1 rounded-full bg-violet-950/60 border border-violet-500/30 text-pink-400 text-xs font-semibold uppercase tracking-wider">
          Level 1: The Ninja Trial 🍥
        </span>
        <p className="text-xs text-violet-300 mt-2">
          Drag the Hidden Leaf Headband left & right. Collect 5 scrolls (📜/🍥) and avoid shurikens (💥)!
        </p>
      </div>

      <div
        ref={containerRef}
        className="relative w-full h-[320px] bg-slate-950/60 rounded-2xl border border-violet-500/20 overflow-hidden shadow-inner flex flex-col justify-between"
      >
        {/* Score indicator */}
        <div className="absolute top-3 right-4 flex items-center gap-1.5 bg-violet-950/80 border border-violet-500/30 px-3 py-1 rounded-full text-pink-300 font-mono text-sm z-20">
          <Star className="w-3.5 h-3.5 fill-pink-500 text-pink-400" />
          Scrolls: {score}/5
        </div>

        {/* Falling objects */}
        <div className="relative w-full h-full pointer-events-none">
          {items.map((item) => (
            <div
              key={item.id}
              className="absolute text-2xl flex items-center justify-center w-8 h-8 select-none"
              style={{
                left: `${item.x}%`,
                top: `${item.y}px`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {item.type === "scroll" ? (Math.random() > 0.5 ? "📜" : "🍥") : "💥"}
            </div>
          ))}
        </div>

        {/* Catcher ninja headband */}
        <div className="w-full h-16 relative flex items-center justify-center border-t border-violet-500/10 bg-slate-900/30">
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.0}
            onDrag={handleDrag}
            className="absolute h-8 w-24 bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900 border-2 border-slate-300 rounded-md flex items-center justify-center cursor-grab active:cursor-grabbing shadow-[0_0_15px_rgba(30,144,255,0.4)] z-30"
            style={{ left: `${ninjaX}%`, transform: "translateX(-50%)" }}
          >
            {/* Metal plate in center */}
            <div className="w-12 h-5 bg-slate-300 rounded-sm flex items-center justify-center text-[10px] font-bold text-slate-800 font-mono tracking-widest relative">
              🍥
              {/* Rivets */}
              <span className="absolute left-1 w-1 h-1 bg-slate-500 rounded-full" />
              <span className="absolute right-1 w-1 h-1 bg-slate-500 rounded-full" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Rewards modal on completion */}
      <AnimatePresence>
        {completed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full mt-4 p-5 glassmorphic rounded-2xl glow-gold border-amber-500/40 text-center flex flex-col items-center"
          >
            <div className="w-12 h-12 rounded-full bg-amber-950/60 border border-amber-500/40 flex items-center justify-center mb-3">
              <Star className="w-6 h-6 text-amber-400 fill-amber-500" />
            </div>
            <h4 className="text-md font-bold text-amber-200">Level Reward Unlocked!</h4>
            <p className="text-sm italic font-serif text-violet-100 mt-2 mb-4 px-2">
              &ldquo;Believe it! Just like Naruto never gave up, your determination inspires everyone around you.&rdquo;
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
