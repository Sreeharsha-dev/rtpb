"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Heart, CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";

interface MemoryMatchProps {
  onComplete: () => void;
  playMagicalSound: (type: 'tap' | 'success' | 'failure' | 'sparkle' | 'type') => void;
}

interface CardType {
  id: number;
  pairId: number;
  label: string;
  emoji: string;
  text: string;
  image: string;
}

const SHUFFLED_CARDS: Omit<CardType, "id">[] = [
  { pairId: 1, label: "Elegant Grace", emoji: "🌸", text: "Traditional yet Modern", image: "/1.png" },
  { pairId: 1, label: "Elegant Grace", emoji: "🌸", text: "Traditional yet Modern", image: "/1.png" },
  { pairId: 2, label: "Quiet Strength", emoji: "💪", text: "Calm yet Bold", image: "/2.png" },
  { pairId: 2, label: "Quiet Strength", emoji: "💪", text: "Calm yet Bold", image: "/2.png" },
  { pairId: 3, label: "Sensitive Heart", emoji: "💖", text: "Deep & Empathetic", image: "/3.png" },
  { pairId: 3, label: "Sensitive Heart", emoji: "💖", text: "Deep & Empathetic", image: "/3.png" },
  { pairId: 4, label: "Always Genuine", emoji: "✨", text: "Honest & Direct", image: "/4.png" },
  { pairId: 4, label: "Always Genuine", emoji: "✨", text: "Honest & Direct", image: "/4.png" },
  { pairId: 5, label: "Bright Smile", emoji: "☀️", text: "Spreads Happiness", image: "/5.png" },
  { pairId: 5, label: "Bright Smile", emoji: "☀️", text: "Spreads Happiness", image: "/5.png" },
  { pairId: 6, label: "Kind Soul", emoji: "💜", text: "Pure & Caring", image: "/6.jpg" },
  { pairId: 6, label: "Kind Soul", emoji: "💜", text: "Pure & Caring", image: "/6.jpg" },
  { pairId: 7, label: "Strong Minded", emoji: "🛡️", text: "Fearless & Independent", image: "/7.png" },
  { pairId: 7, label: "Strong Minded", emoji: "🛡️", text: "Fearless & Independent", image: "/7.png" },
  { pairId: 8, label: "Rare & Precious", emoji: "💎", text: "One in a Million", image: "/8.jpg" },
  { pairId: 8, label: "Rare & Precious", emoji: "💎", text: "One in a Million", image: "/8.jpg" },
  { pairId: 9, label: "Warm & Loving", emoji: "❤️", text: "Brings Warmth to All", image: "/9.png" },
  { pairId: 9, label: "Warm & Loving", emoji: "❤️", text: "Brings Warmth to All", image: "/9.png" },
  { pairId: 10, label: "Dream Chaser", emoji: "🍥", text: "Never Gives Up", image: "/10.png" },
  { pairId: 10, label: "Dream Chaser", emoji: "🍥", text: "Never Gives Up", image: "/10.png" },
];

export default function MemoryMatch({ onComplete, playMagicalSound }: MemoryMatchProps) {
  const [cards, setCards] = useState<CardType[]>([]);
  const [flippedIdxs, setFlippedIdxs] = useState<number[]>([]);
  const [matchedPairIds, setMatchedPairIds] = useState<number[]>([]);
  const [disabled, setDisabled] = useState<boolean>(false);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});

  // Shuffle cards on mount
  useEffect(() => {
    const shuffled = SHUFFLED_CARDS
      .map((card, index) => ({ ...card, id: index }))
      .sort(() => Math.random() - 0.5);
    setCards(shuffled);
  }, []);

  const handleImgError = (cardId: number) => {
    setImgErrors((prev) => ({ ...prev, [cardId]: true }));
  };

  const handleCardClick = (idx: number) => {
    if (disabled || flippedIdxs.includes(idx) || matchedPairIds.includes(cards[idx].pairId)) return;

    playMagicalSound("tap");
    const nextFlipped = [...flippedIdxs, idx];
    setFlippedIdxs(nextFlipped);

    // If we flipped two cards
    if (nextFlipped.length === 2) {
      setDisabled(true);
      const [firstIdx, secondIdx] = nextFlipped;

      if (cards[firstIdx].pairId === cards[secondIdx].pairId) {
        // Match!
        setTimeout(() => {
          playMagicalSound("success");
          setMatchedPairIds((prev) => {
            const nextMatched = [...prev, cards[firstIdx].pairId];
            
            // Check if all matched (10 pairs)
            if (nextMatched.length === 10) {
              setGameCompleted(true);
              confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ["#800020", "#b03060", "#ffb86c", "#ff79c6"],
              });
            }
            return nextMatched;
          });
          setFlippedIdxs([]);
          setDisabled(false);
          
          // Minor match confetti pop
          confetti({
            particleCount: 20,
            spread: 30,
            origin: { y: 0.75 }
          });
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          playMagicalSound("failure");
          setFlippedIdxs([]);
          setDisabled(false);
        }, 1100);
      }
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      
      {/* Title */}
      <div className="w-full p-2.5 glassmorphic rounded-xl glow-pink border-pink-500/20 mb-2 text-center">
        <h3 className="text-xs font-bold text-red-300 uppercase tracking-wider font-mono">
          Memory Match Cards 💜
        </h3>
        <p className="text-[10px] text-red-200 mt-1">
          Match pairs in 3D to uncover Ramya's elegant traits!
        </p>
      </div>

      {/* Grid Canvas */}
      {!gameCompleted && (
        <div 
          className="grid grid-cols-4 gap-1.5 w-full mb-3"
          style={{ maxWidth: "min(285px, 35vh)" }}
        >
          {cards.map((card, idx) => {
            const isFlipped = flippedIdxs.includes(idx);
            const isMatched = matchedPairIds.includes(card.pairId);
            const hasImgError = imgErrors[card.id];

            return (
              <motion.div
                key={card.id}
                onClick={() => handleCardClick(idx)}
                whileHover={isFlipped || isMatched ? {} : { scale: 1.05, y: -3 }}
                whileTap={isFlipped || isMatched ? {} : { scale: 0.95 }}
                className="w-full aspect-[2/3] perspective-1000 cursor-pointer select-none"
              >
                <motion.div
                  animate={{ rotateY: isFlipped || isMatched ? 180 : 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 120,
                    damping: 18,
                    mass: 1
                  }}
                  className="w-full h-full transform-style-3d relative"
                >
                  {/* Card Back */}
                  <div
                    className="absolute inset-0 backface-hidden rounded-xl border border-red-500/30 shadow-md flex items-center justify-center overflow-hidden"
                    style={{
                      background: "radial-gradient(circle at center, #42001a 0%, #1c000b 100%)",
                    }}
                  >
                    {/* Gold traditional border ring */}
                    <div className="absolute w-[88%] h-[92%] border border-amber-500/20 rounded-lg flex items-center justify-center">
                      <Heart className="w-5 h-5 text-amber-500/15 fill-amber-500/5 animate-pulse" />
                    </div>
                  </div>

                  {/* Card Front */}
                  <div
                    className={`absolute inset-0 backface-hidden rounded-xl border rotate-y-180 overflow-hidden flex flex-col items-center justify-center text-center shadow-lg transition-all ${
                      isMatched 
                        ? "border-emerald-500/50 bg-emerald-950/45 glow-emerald"
                        : "border-pink-500/50 bg-pink-950/45 glow-pink"
                    }`}
                  >
                    {card.image && !hasImgError ? (
                      <div className="relative w-full h-full">
                        <img 
                          src={card.image} 
                          onError={() => handleImgError(card.id)} 
                          className="w-full h-full object-cover pointer-events-none" 
                          alt={card.text} 
                        />
                        {/* Overlay text at the bottom */}
                        <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 backdrop-blur-sm py-1.5 px-0.5 border-t border-white/10 flex flex-col items-center justify-center">
                          <span className="text-[6.5px] uppercase font-mono tracking-wider text-pink-300 font-bold leading-none scale-90">
                            {card.label}
                          </span>
                          <span className="text-[8px] text-amber-200 font-serif italic mt-0.5 leading-none scale-90">
                            {card.text}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-between p-2 h-full py-4 bg-slate-950/40">
                        <span className="text-3xl animate-float">{card.emoji}</span>
                        <div className="flex flex-col items-center">
                          <span className="text-[7.5px] uppercase font-mono tracking-widest text-red-200 font-bold leading-none scale-90">
                            {card.label}
                          </span>
                          <span className="text-[9px] text-amber-300 font-serif italic mt-1 leading-none scale-90">
                            {card.text}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Completion Reward */}
      {gameCompleted && (
        <div className="w-full p-5 glassmorphic rounded-2xl glow-gold border-amber-500/40 text-center flex flex-col items-center max-w-sm">
          <div className="w-12 h-12 rounded-full bg-amber-950/60 border border-amber-500/40 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-6 h-6 text-amber-400" />
          </div>
          <h4 className="text-md font-bold text-amber-200">Pairs Matched!</h4>

          <p className="text-sm italic font-serif text-violet-100 my-4 px-2 leading-relaxed">
            &ldquo;Some people are easy to understand. <br/>Some people are worth discovering.&rdquo;
          </p>
          <button
            type="button"
            onClick={onComplete}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-pink-500 text-white font-extrabold text-xs shadow-md shadow-pink-500/20 cursor-pointer"
          >
            Continue Journey 🌸
          </button>
        </div>
      )}
    </div>
  );
}
