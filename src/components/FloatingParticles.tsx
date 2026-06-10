"use client";

import React, { useEffect, useState, useCallback } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  emoji?: string;
  type: "star" | "heart" | "sparkle" | "emoji";
}

interface FloatingParticlesProps {
  count?: number;
  types?: ("star" | "heart" | "sparkle" | "emoji")[];
  emojis?: string[];
  active?: boolean;
  speed?: number;
}

const STAR_SYMBOLS = ["✦", "✧", "⋆", "☆"];
const SPARKLE_SYMBOLS = ["✨", "💫", "⭐", "🌟"];

export default function FloatingParticles({
  count = 12,
  types = ["star", "sparkle"],
  emojis = ["🌸", "💜", "✨", "🦋", "🌺"],
  active = true,
  speed = 1,
}: FloatingParticlesProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  const generateParticle = useCallback(
    (id: number): Particle => {
      const type = types[Math.floor(Math.random() * types.length)];
      return {
        id,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 6 + Math.random() * 12,
        opacity: 0.15 + Math.random() * 0.35,
        duration: (8 + Math.random() * 12) / speed,
        delay: Math.random() * 5,
        emoji: type === "emoji" ? emojis[Math.floor(Math.random() * emojis.length)] : undefined,
        type,
      };
    },
    [types, emojis, speed]
  );

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    const initial = Array.from({ length: count }, (_, i) => generateParticle(i));
    setParticles(initial);

    const interval = setInterval(() => {
      setParticles((prev) => {
        const next = [...prev];
        const replaceIdx = Math.floor(Math.random() * next.length);
        next[replaceIdx] = generateParticle(Date.now());
        return next;
      });
    }, 3000 / speed);

    return () => clearInterval(interval);
  }, [active, count, generateParticle, speed]);

  if (!active || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-float"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            fontSize: `${p.size}px`,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            color: ["#ec4899", "#a78bfa", "#f59e0b", "#f472b6", "#34d399"][
              p.id % 5
            ],
            filter: `blur(${p.size > 10 ? 0.5 : 0}px)`,
          }}
        >
          {p.type === "star" && STAR_SYMBOLS[p.id % STAR_SYMBOLS.length]}
          {p.type === "heart" && "♥"}
          {p.type === "sparkle" && SPARKLE_SYMBOLS[p.id % SPARKLE_SYMBOLS.length]}
          {p.type === "emoji" && p.emoji}
        </div>
      ))}
    </div>
  );
}
