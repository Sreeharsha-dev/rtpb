"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, Star } from "lucide-react";
import confetti from "canvas-confetti";

interface BalloonChallengeProps {
  onComplete: () => void;
  playMagicalSound: (type: 'tap' | 'success' | 'failure' | 'sparkle' | 'type') => void;
}

interface Balloon {
  id: number;
  x: number; // percentage (10-90)
  y: number; // percentage (100 -> -20)
  size: number;
  speed: number;
  color: string;
  delay: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  tx: number; // target x
  ty: number; // target y
}

const BALLOON_COLORS = [
  "rgba(128, 0, 32, 0.75)", // Maroon
  "rgba(176, 48, 96, 0.75)", // Medium Violet Red
  "rgba(139, 92, 246, 0.75)", // Violet
  "rgba(236, 72, 153, 0.75)", // Pink
];

export default function BalloonChallenge({ onComplete, playMagicalSound }: BalloonChallengeProps) {
  const [progress, setProgress] = useState<number>(0); // 0 to 100
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [completed, setCompleted] = useState<boolean>(false);
  const balloonCounterRef = useRef<number>(0);
  const particleCounterRef = useRef<number>(0);
  const gameActiveRef = useRef<boolean>(true);

  // Spawn balloons
  useEffect(() => {
    if (completed) return;

    const interval = setInterval(() => {
      if (!gameActiveRef.current) return;
      balloonCounterRef.current += 1;

      const newBalloon: Balloon = {
        id: balloonCounterRef.current,
        x: Math.random() * 80 + 10,
        y: 110, // starts off-screen bottom
        size: 38 + Math.random() * 14,
        speed: 1.0 + Math.random() * 1.2,
        color: BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)],
        delay: Math.random() * 0.5,
      };

      setBalloons((prev) => [...prev, newBalloon]);
    }, 750);

    return () => clearInterval(interval);
  }, [completed]);

  // Balloon rise animation physics
  useEffect(() => {
    if (completed) return;

    let animFrameId: number;

    const updatePhysics = () => {
      setBalloons((prev) => {
        const nextBalloons: Balloon[] = [];
        for (let b of prev) {
          const nextY = b.y - b.speed;
          if (nextY > -20) {
            nextBalloons.push({ ...b, y: nextY });
          }
        }
        return nextBalloons;
      });

      // Update particle physics (flying towards the central heart)
      setParticles((prev) => {
        const nextParticles: Particle[] = [];
        for (let p of prev) {
          // move 8% closer to target each frame
          const dx = p.tx - p.x;
          const dy = p.ty - p.y;
          const dist = Math.hypot(dx, dy);

          if (dist > 8) {
            nextParticles.push({
              ...p,
              x: p.x + dx * 0.09,
              y: p.y + dy * 0.09,
            });
          } else {
            // Arrived! Add to heart liquid
            setProgress((s) => {
              const nextVal = Math.min(100, s + 1.25); // increment liquid fill
              if (nextVal >= 100 && gameActiveRef.current) {
                gameActiveRef.current = false;
                setCompleted(true);
                playMagicalSound("success");
                confetti({
                  particleCount: 100,
                  spread: 80,
                  origin: { y: 0.65 }
                });
              }
              return nextVal;
            });
          }
        }
        return nextParticles;
      });

      if (gameActiveRef.current) {
        animFrameId = requestAnimationFrame(updatePhysics);
      }
    };

    animFrameId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animFrameId);
  }, [completed, playMagicalSound]);

  // Handle popping a balloon
  const handlePop = (balloon: Balloon, e: React.MouseEvent<HTMLButtonElement>) => {
    if (completed) return;

    // Pop sound & haptic
    playMagicalSound("tap");
    
    // Remove popped balloon
    setBalloons((prev) => prev.filter((b) => b.id !== balloon.id));

    // Spawn 8-10 particles flying towards the central heart (approx x: 50%, y: 120px)
    const rect = e.currentTarget.getBoundingClientRect();
    const parentRect = e.currentTarget.parentElement?.getBoundingClientRect();
    if (parentRect) {
      const startX = rect.left - parentRect.left + rect.width / 2;
      const startY = rect.top - parentRect.top + rect.height / 2;

      // Target coordinate: center of heart (130, 113)
      const targetX = 130;
      const targetY = 113;

      const newParticles: Particle[] = [];
      for (let i = 0; i < 8; i++) {
        particleCounterRef.current += 1;
        newParticles.push({
          id: particleCounterRef.current,
          x: startX + (Math.random() - 0.5) * 15,
          y: startY + (Math.random() - 0.5) * 15,
          color: balloon.color,
          tx: targetX,
          ty: targetY,
        });
      }
      setParticles((prev) => [...prev, ...newParticles]);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Title */}
      <div className="w-full p-2.5 glassmorphic rounded-xl glow-pink border-pink-500/20 mb-2 text-center">
        <h3 className="text-xs font-bold text-pink-400 uppercase tracking-wider font-mono">
          Heart Balloon Challenge 🎈
        </h3>
        <p className="text-[10px] text-violet-300 mt-1">
          Pop balloons to fill the crystal heart to 100%!
        </p>
      </div>

      {/* Game area container */}
      <div
        className="relative w-full max-w-[260px] h-[290px] bg-gradient-to-b from-[#0c051a] to-[#040108] rounded-3xl border border-violet-500/25 overflow-hidden shadow-2xl flex flex-col items-center justify-between p-2 select-none"
      >
        {/* Sky Background Twinkling Stars */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <Star className="absolute top-8 left-8 w-2 h-2 text-white animate-twinkle" />
          <Star className="absolute top-20 right-10 w-2.5 h-2.5 text-pink-300 animate-twinkle" style={{ animationDelay: '1.5s' }} />
          <Star className="absolute bottom-24 left-12 w-2 h-2 text-violet-300 animate-twinkle" style={{ animationDelay: '0.8s' }} />
        </div>

        {/* Progress percent display */}
        <div className="w-full flex justify-between items-center px-3 mt-1 z-10">
          <span className="text-[10px] font-bold text-violet-400 tracking-wider uppercase font-mono">Crystal Core</span>
          <div className="text-pink-300 font-mono text-xs font-bold bg-violet-950/70 border border-pink-500/30 rounded-full px-2.5 py-0.5">
            Fill: {Math.round(progress)}%
          </div>
        </div>

        {/* Centered Liquid Fill Heart */}
        <div className="absolute top-[65px] left-1/2 -translate-x-1/2 w-24 h-24 flex items-center justify-center z-15">
          {/* Heart masking clip-path */}
          <svg className="w-full h-full relative" viewBox="0 0 24 24" fill="none">
            <defs>
              <clipPath id="heart-clip">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </clipPath>
            </defs>

            {/* Glowing Shadow Background */}
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill="rgba(10, 5, 28, 0.45)"
              stroke="rgba(139, 92, 246, 0.35)"
              strokeWidth="0.8"
              className="filter drop-shadow-[0_0_15px_rgba(128,0,32,0.4)]"
            />

            {/* Liquid Fill Area (Masked by Heart) */}
            <g clipPath="url(#heart-clip)">
              {/* Maroon Liquid block */}
              <motion.rect
                x="0"
                y={24 - (24 * progress) / 100}
                width="24"
                height="24"
                fill="url(#liquid-grad)"
                transition={{ type: "spring", stiffness: 45 }}
              />

              {/* Animated wave path on liquid edge */}
              <motion.path
                animate={{
                  x: [0, -4, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2.2,
                  ease: "easeInOut",
                }}
                d={`M -4,${24 - (24 * progress) / 100} Q 2,${24 - (24 * progress) / 100 - 0.7} 8,${24 - (24 * progress) / 100} T 20,${24 - (24 * progress) / 100} T 32,${24 - (24 * progress) / 100} L 32,24 L -4,24 Z`}
                fill="rgba(128, 0, 32, 0.95)"
              />
            </g>

            {/* Glass Highlights */}
            <path
              d="M6.5 4.5 C5.2 4.8 4.2 5.8 4.2 7.2"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="0.8"
              strokeLinecap="round"
            />

            {/* Gradients */}
            <defs>
              <linearGradient id="liquid-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#b03060" /> {/* Fuchsia Rose */}
                <stop offset="100%" stopColor="#400010" /> {/* Dark Maroon */}
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Flying Balloons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-auto">
          {balloons.map((b) => (
            <motion.button
              key={b.id}
              onClick={(e) => handlePop(b, e)}
              whileTap={{ scale: 0.8 }}
              className="absolute select-none cursor-pointer flex items-center justify-center"
              style={{
                left: `${b.x}%`,
                top: `${b.y}%`,
                transform: "translate(-50%, -50%)",
                width: `${b.size}px`,
                height: `${b.size}px`,
              }}
            >
              <Heart
                className="w-full h-full animate-pulse filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.3)]"
                style={{
                  color: b.color,
                  fill: b.color,
                  animationDuration: `${1.5 + Math.random()}s`,
                }}
              />
            </motion.button>
          ))}

          {/* Flying Particles */}
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute w-2 h-2 rounded-full z-25 pointer-events-none"
              style={{
                left: `${p.x}px`,
                top: `${p.y}px`,
                backgroundColor: p.color,
                boxShadow: `0 0 8px ${p.color}`,
              }}
            />
          ))}
        </div>

        {/* Core Heart shadow mask indicator */}
        <div className="w-full text-center py-2 border-t border-violet-500/10 z-10">
          <p className="text-[10px] text-violet-400/70 font-mono tracking-widest uppercase">
            {progress >= 100 ? "Heart Charged ✨" : "Tap balloons to pop!"}
          </p>
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
              <Heart className="w-6 h-6 text-red-500 fill-red-500 animate-[bounce_0.6s_ease_infinite]" />
            </div>
            <h4 className="text-md font-bold text-amber-200">Crystal Heart Fully Charged!</h4>
            <p className="text-sm italic font-serif text-violet-100 mt-2 mb-4 px-2 leading-relaxed">
              &ldquo;Every little moment adds up to something beautiful.&rdquo;
            </p>
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onComplete}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-amber-500 text-white font-bold text-xs shadow-md shadow-pink-500/20 cursor-pointer"
            >
              Continue Journey 🌸
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
