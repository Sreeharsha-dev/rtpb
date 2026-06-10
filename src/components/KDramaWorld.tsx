"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ChevronRight, Award } from "lucide-react";
import confetti from "canvas-confetti";

interface KDramaWorldProps {
  onComplete: () => void;
  playMagicalSound: (type: 'tap' | 'success' | 'failure' | 'sparkle' | 'type') => void;
}

interface Scenario {
  id: number;
  title: string;
  story: string;
  options: {
    key: string;
    text: string;
    isCorrect: boolean;
    funnyFeedback: string;
  }[];
}

const SCENARIOS: Scenario[] = [
  {
    id: 1,
    title: "Scenario I: The Rain Sharing ☔",
    story: "Under the sudden heavy summer rain, you and your favorite character share one small yellow umbrella. You notice his left shoulder is completely drenched. He notices you staring, looks down with a warm smile, and says...",
    options: [
      {
        key: "A",
        text: "\"Aish, my expensive designer coat is ruined because of you!\" 🤦",
        isCorrect: false,
        funnyFeedback: "Too harsh! This is a romantic K-Drama, not a comedy roast. Try again! 😄",
      },
      {
        key: "B",
        text: "\"Don't worry about it. As long as you are safe under the shade, my shoulder doesn't matter.\" 💖",
        isCorrect: true,
        funnyFeedback: "Perfection! Swoon-worthy and extremely romantic.",
      },
      {
        key: "C",
        text: "\"Hey, let's sprint to the nearest bus stop! Run for your life!\" 🏃",
        isCorrect: false,
        funnyFeedback: "Practical, yes, but where is the romance? Stand in the rain and try again! 😉",
      },
    ],
  },
  {
    id: 2,
    title: "Scenario II: The Shivering Hands ❄️",
    story: "Sitting on a bench under a glowing streetlamp during a snowy winter night, you shiver and blow warm air onto your frozen hands. Without saying a word, he...",
    options: [
      {
        key: "A",
        text: "Tells you: \"Didn't you check the weather forecast before leaving home?\" 🥶",
        isCorrect: false,
        funnyFeedback: "Too cold! A true K-drama lead would never scold you for shivering. Try again!",
      },
      {
        key: "B",
        text: "Says: \"Let's do some squats! It generates natural body heat!\" 🏋️",
        isCorrect: false,
        funnyFeedback: "A gym bro ending! Hilarious, but absolutely non-romantic. Try again! 🏋️",
      },
      {
        key: "C",
        text: "Gently reaches out, takes your hands in his, slides them into his warm coat pocket, and smiles. 🧤",
        isCorrect: true,
        funnyFeedback: "Swoon! The ultimate classic warm coat pocket gesture. Spot on!",
      },
    ],
  },
];

export default function KDramaWorld({ onComplete, playMagicalSound }: KDramaWorldProps) {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCorrectChoice, setIsCorrectChoice] = useState<boolean>(false);
  const [completed, setCompleted] = useState<boolean>(false);

  const scenario = SCENARIOS[currentIdx];

  const handleOptionSelect = (opt: typeof SCENARIOS[0]["options"][0]) => {
    if (isCorrectChoice) return; // wait for next

    setSelectedKey(opt.key);
    setIsCorrectChoice(opt.isCorrect);
    setFeedback(opt.funnyFeedback);

    if (opt.isCorrect) {
      playMagicalSound("success");
      confetti({ particleCount: 30, spread: 40, origin: { y: 0.7 } });
    } else {
      playMagicalSound("failure");
    }
  };

  const handleNext = () => {
    setSelectedKey(null);
    setFeedback(null);
    setIsCorrectChoice(false);
    
    if (currentIdx < SCENARIOS.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setCompleted(true);
      playMagicalSound("sparkle");
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Level Header */}
      <div className="w-full p-4 glassmorphic rounded-2xl glow-pink border-pink-500/20 mb-4 text-center">
        <span className="px-3 py-1 rounded-full bg-violet-950/60 border border-violet-500/30 text-pink-400 text-xs font-semibold uppercase tracking-wider">
          Level 4: K-Drama World 🎬
        </span>
        <p className="text-xs text-violet-300 mt-2">
          &ldquo;Welcome to the world of emotional stories and unforgettable characters.&rdquo;
        </p>
        <p className="text-[10px] text-violet-400/80 mt-1">
          Pick the most romantic ending to unlock the final gate!
        </p>
      </div>

      {/* Main card */}
      {!completed && (
        <div className="w-full p-5 glassmorphic rounded-2xl glow-indigo border-violet-500/20 flex flex-col text-left">
          {/* Scenario title */}
          <span className="text-xs font-bold text-pink-400 uppercase tracking-widest font-mono mb-2">
            {scenario.title}
          </span>

          {/* Story text */}
          <p className="text-sm text-violet-100 leading-relaxed font-medium mb-5 bg-slate-900/30 p-3.5 rounded-xl border border-violet-500/5">
            {scenario.story}
          </p>

          {/* Options */}
          <div className="flex flex-col gap-3">
            {scenario.options.map((opt) => {
              const isSelected = selectedKey === opt.key;
              let btnClass = "border-violet-500/20 bg-violet-950/30 text-violet-200 hover:bg-violet-900/20";
              if (isSelected) {
                btnClass = opt.isCorrect 
                  ? "border-emerald-500 bg-emerald-950/40 text-emerald-200 glow-emerald"
                  : "border-red-500 bg-red-950/40 text-red-200 glow-red";
              }

              return (
                <motion.button
                  key={opt.key}
                  whileHover={!isCorrectChoice ? { scale: 1.02 } : {}}
                  whileTap={!isCorrectChoice ? { scale: 0.98 } : {}}
                  onClick={() => handleOptionSelect(opt)}
                  disabled={isCorrectChoice && !isSelected}
                  className={`w-full p-3.5 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer flex gap-3 items-center ${btnClass} disabled:opacity-30`}
                >
                  <span className="w-6 h-6 rounded-full bg-violet-900/60 flex items-center justify-center text-xs font-mono font-bold text-pink-300">
                    {opt.key}
                  </span>
                  <span className="flex-1">{opt.text}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Feedback banner */}
          <AnimatePresence mode="wait">
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mt-4 p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                  isCorrectChoice 
                    ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-300"
                    : "bg-red-950/30 border-red-500/30 text-red-300"
                }`}
              >
                {isCorrectChoice ? (
                  <Heart className="w-4 h-4 fill-emerald-500 text-emerald-400" />
                ) : (
                  <span className="text-sm">⚠️</span>
                )}
                <span className="flex-1">{feedback}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Continue button */}
          {isCorrectChoice && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              className="mt-5 self-end flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-md shadow-violet-900/30 transition-all cursor-pointer"
            >
              {currentIdx < SCENARIOS.length - 1 ? "Next Scene" : "Reveal Reward"}
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      )}

      {/* Completion reward */}
      <AnimatePresence>
        {completed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full p-5 glassmorphic rounded-2xl glow-gold border-amber-500/40 text-center flex flex-col items-center"
          >
            <div className="w-12 h-12 rounded-full bg-violet-950/80 border border-violet-500/40 flex items-center justify-center mb-3">
              <Award className="w-6 h-6 text-amber-400" />
            </div>
            <h4 className="text-md font-bold text-amber-200">K-Drama World Completed!</h4>
            <p className="text-sm italic font-serif text-violet-100 mt-2 mb-5 px-3 leading-relaxed">
              &ldquo;Some people watch love stories. <br />
              Some people become the reason for beautiful stories.&rdquo;
            </p>
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onComplete}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold text-xs shadow-md shadow-pink-500/20 cursor-pointer"
            >
              Continue Journey 🌸
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
