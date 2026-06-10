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
  x: number;
  y: number;
  size: number;
  speed: number;
  color: string;
  delay: number;
  wobbleOffset: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  tx: number;
  ty: number;
}

interface BurstParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  size: number;
}

const BALLOON_COLORS = [
  "rgba(128, 0, 32, 0.75)",
  "rgba(176, 48, 96, 0.75)",
  "rgba(139, 92, 246, 0.75)",
  "rgba(236, 72, 153, 0.75)",
  "rgba(245, 158, 11, 0.75)",
  "rgba(16, 185, 129, 0.75)",
];

export default function BalloonChallenge({ onComplete, playMagicalSound }: BalloonChallengeProps) {
  const [progress, setProgress] = useState<number>(0);
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [burstParticles, setBurstParticles] = useState<BurstParticle[]>([]);
  const [completed, setCompleted] = useState<boolean>(false);
  const [combo, setCombo] = useState<number>(0);
  const [lastPopTime, setLastPopTime] = useState<number>(0);
  const [popText, setPopText] = useState<string | null>(null);
  const balloonCounterRef = useRef<number>(0);
  const particleCounterRef = useRef<number>(0);
  const burstCounterRef = useRef<number>(0);
  const gameActiveRef = useRef<boolean>(true);

  useEffect(() => {
    if (completed) return;
    const interval = setInterval(() => {
      if (!gameActiveRef.current) return;
      balloonCounterRef.current += 1;
      const newBalloon: Balloon = {
        id: balloonCounterRef.current,
        x: Math.random() * 80 + 10,
        y: 110,
        size: 38 + Math.random() * 14,
        speed: 0.8 + Math.random() * 1.2,
        color: BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)],
        delay: Math.random() * 0.5,
        wobbleOffset: Math.random() * Math.PI * 2,
      };
      setBalloons((prev) => [...prev, newBalloon]);
    }, 650);
    return () => clearInterval(interval);
  }, [completed]);

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

      setBurstParticles((prev) => {
        const next: BurstParticle[] = [];
        for (let p of prev) {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.1;
          p.life -= 0.02;
          if (p.life > 0) {
            next.push({ ...p });
          }
        }
        return next;
      });

      setParticles((prev) => {
        const nextParticles: Particle[] = [];
        for (let p of prev) {
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
            setProgress((s) => {
              const nextVal = Math.min(100, s + 1.5);
              if (nextVal >= 100 && gameActiveRef.current) {
                gameActiveRef.current = false;
                setCompleted(true);
                playMagicalSound("success");
                confetti({
                  particleCount: 120,
                  spread: 90,
                  origin: { y: 0.6 },
                  colors: ["#ec4899", "#a78bfa", "#f59e0b", "#10b981"],
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

  const handlePop = (balloon: Balloon, e: React.MouseEvent<HTMLButtonElement>) => {
    if (completed) return;
    playMagicalSound("tap");

    const now = Date.now();
    if (now - lastPopTime < 1500) {
      setCombo((c) => {
        const next = c + 1;
        if (next >= 3) {
          setPopText(`${next}x Combo! 🔥`);
          setTimeout(() => setPopText(null), 800);
        }
        return next;
      });
    } else {
      setCombo(1);
    }
    setLastPopTime(now);

    setBalloons((prev) => prev.filter((b) => b.id !== balloon.id));

    const rect = e.currentTarget.getBoundingClientRect();
    const parentRect = e.currentTarget.parentElement?.getBoundingClientRect();
    if (parentRect) {
      const startX = rect.left - parentRect.left + rect.width / 2;
      const startY = rect.top - parentRect.top + rect.height / 2;

      // Burst particles
      for (let i = 0; i < 10; i++) {
        burstCounterRef.current += 1;
        const angle = (Math.PI * 2 * i) / 10;
        const speed = 1 + Math.random() * 3;
        setBurstParticles((prev) => [
          ...prev,
          {
            id: burstCounterRef.current,
            x: startX,
            y: startY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 3,
            color: balloon.color,
            life: 1,
            size: 3 + Math.random() * 3,
          },
        ]);
      }

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
      <div className="w-full p-2.5 glassmorphic rounded-xl glow-pink border-pink-500/20 mb-2 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
        <h3 className="text-xs font-bold text-pink-400 uppercase tracking-wider font-mono relative z-10">
          Heart Balloon Challenge 🎈
        </h3>
        <p className="text-[10px] text-violet-300 mt-1 relative z-10">
          Pop balloons to fill the crystal heart to 100%!
        </p>
      </div>

      <div className="relative w-full max-w-[260px] h-[300px] bg-gradient-to-b from-[#0c051a] to-[#040108] rounded-3xl border border-violet-500/25 overflow-hidden shadow-2xl flex flex-col items-center justify-between p-2 select-none">
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <Star className="absolute top-8 left-8 w-2 h-2 text-white animate-twinkle" />
          <Star className="absolute top-20 right-10 w-2.5 h-2.5 text-pink-300 animate-twinkle" style={{ animationDelay: '1.5s' }} />
          <Star className="absolute bottom-24 left-12 w-2 h-2 text-violet-300 animate-twinkle" style={{ animationDelay: '0.8s' }} />
        </div>

        {/* Combo Text */}
        <AnimatePresence>
          {popText && (
            <motion.div
              key={popText}
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.5, y: -30 }}
              className="absolute top-12 left-1/2 -translate-x-1/2 z-30 text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-amber-300 pointer-events-none"
            >
              {popText}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full flex justify-between items-center px-3 mt-1 z-10">
          <span className="text-[10px] font-bold text-violet-400 tracking-wider uppercase font-mono">Crystal Core</span>
          <div className="text-pink-300 font-mono text-xs font-bold bg-violet-950/70 border border-pink-500/30 rounded-full px-2.5 py-0.5">
            Fill: {Math.round(progress)}%
          </div>
        </div>

        <div className="absolute top-[65px] left-1/2 -translate-x-1/2 w-24 h-24 flex items-center justify-center z-15">
          <svg className="w-full h-full relative" viewBox="0 0 24 24" fill="none">
            <defs>
              <clipPath id="heart-clip">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </clipPath>
            </defs>
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill="rgba(10, 5, 28, 0.45)"
              stroke="rgba(139, 92, 246, 0.35)"
              strokeWidth="0.8"
              className="filter drop-shadow-[0_0_15px_rgba(128,0,32,0.4)]"
            />
            <g clipPath="url(#heart-clip)">
              <motion.rect
                x="0"
                y={24 - (24 * progress) / 100}
                width="24"
                height="24"
                fill="url(#liquid-grad)"
                transition={{ type: "spring", stiffness: 45 }}
              />
              <motion.path
                animate={{ x: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                d={`M -4,${24 - (24 * progress) / 100} Q 2,${24 - (24 * progress) / 100 - 0.7} 8,${24 - (24 * progress) / 100} T 20,${24 - (24 * progress) / 100} T 32,${24 - (24 * progress) / 100} L 32,24 L -4,24 Z`}
                fill="rgba(128, 0, 32, 0.95)"
              />
            </g>
            <path d="M6.5 4.5 C5.2 4.8 4.2 5.8 4.2 7.2" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" strokeLinecap="round" />
            <defs>
              <linearGradient id="liquid-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#b03060" />
                <stop offset="100%" stopColor="#400010" />
              </linearGradient>
            </defs>
          </svg>
        </div>

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
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2 + Math.random(), ease: "easeInOut" }}
              >
                <Heart
                  className="w-full h-full filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.3)]"
                  style={{
                    color: b.color,
                    fill: b.color,
                  }}
                />
              </motion.div>
            </motion.button>
          ))}

          {/* Burst particles */}
          {burstParticles.map((p) => (
            <div
              key={p.id}
              className="absolute rounded-full z-25 pointer-events-none"
              style={{
                left: `${p.x}px`,
                top: `${p.y}px`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: p.color,
                opacity: p.life,
                boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
              }}
            />
          ))}

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

        <div className="w-full text-center py-2 border-t border-violet-500/10 z-10">
          <p className="text-[10px] text-violet-400/70 font-mono tracking-widest uppercase">
            {progress >= 100 ? "⚡ Heart Fully Charged ⚡" : "Tap balloons to pop!"}
          </p>
        </div>
      </div>

      <AnimatePresence>
        {completed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full mt-4 p-5 glassmorphic rounded-2xl glow-gold border-amber-500/40 text-center flex flex-col items-center"
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-12 h-12 rounded-full bg-red-950/80 border border-red-500/40 flex items-center justify-center mb-3"
            >
              <Heart className="w-6 h-6 text-red-500 fill-red-500" />
            </motion.div>
            <h4 className="text-md font-bold text-amber-200">Crystal Heart Fully Charged!</h4>
            <p className="text-sm italic font-serif text-violet-100 mt-2 mb-4 px-2 leading-relaxed">
              &ldquo;Every little moment adds up to something beautiful.&rdquo;
            </p>
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
