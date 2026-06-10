"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Sparkles, RotateCcw } from "lucide-react";
import { getLevelName, getLevelIcon, useStars } from "@/lib/game-utils";

interface GameHUDProps {
  currentLevel: number;
  totalLevels: number;
  progress?: number;
  onReset: () => void;
  showReset?: boolean;
}

export default function GameHUD({
  currentLevel,
  totalLevels,
  progress,
  onReset,
  showReset = true,
}: GameHUDProps) {
  const { stars, justAdded } = useStars();
  const [showStarPop, setShowStarPop] = useState(false);

  useEffect(() => {
    if (justAdded > 0) {
      setShowStarPop(true);
      const timer = setTimeout(() => setShowStarPop(false), 800);
      return () => clearTimeout(timer);
    }
  }, [justAdded]);

  return (
    <div className="w-full max-w-sm mx-auto mb-2 select-none">
      <div className="flex items-center justify-between px-1 py-1.5">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-950/70 border border-violet-500/25 text-[10px] font-bold text-violet-200 uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-pink-400" />
            <span>Lvl {currentLevel}</span>
          </div>
          <motion.span
            key={currentLevel}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            className="text-sm"
          >
            {getLevelIcon(currentLevel)}
          </motion.span>
        </div>

        <motion.span
          key={currentLevel + "-name"}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[9px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-300 uppercase tracking-widest truncate max-w-[120px] text-center"
        >
          {getLevelName(currentLevel)}
        </motion.span>

        <div className="relative flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-950/60 border border-amber-500/25">
          <Star className={`w-3 h-3 text-amber-400 fill-amber-400 ${justAdded > 0 ? 'animate-scale-bounce' : ''}`} />
          <span className="text-[10px] font-bold text-amber-200 font-mono">{stars}</span>
          <AnimatePresence>
            {showStarPop && (
              <motion.span
                initial={{ opacity: 0, y: 0, scale: 0.5 }}
                animate={{ opacity: 1, y: -15, scale: 1.2 }}
                exit={{ opacity: 0, y: -25 }}
                className="absolute -top-3 right-0 text-[10px] font-bold text-yellow-300 font-mono"
              >
                +{justAdded}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center gap-1 px-1 mt-0.5">
        <span className="text-[8px] text-violet-500 font-mono uppercase tracking-wider">Progress</span>
        <div className="flex-1 mx-1.5 h-1.5 rounded-full bg-violet-950/60 border border-violet-500/15 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-violet-600 via-pink-500 to-amber-500"
            initial={{ width: "0%" }}
            animate={{ width: `${Math.max(0, Math.min(100, progress || ((currentLevel - 1) / (totalLevels - 1)) * 100))}%` }}
            transition={{ type: "spring", stiffness: 50, damping: 15 }}
          />
        </div>
        <span className="text-[8px] text-violet-400 font-mono tabular-nums">
          {currentLevel}/{totalLevels}
        </span>

        {showReset && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onReset}
            className="ml-1 p-1 rounded-full bg-slate-900/60 border border-violet-500/20 text-violet-400 hover:text-pink-400 hover:border-pink-500/30 transition-all cursor-pointer"
            title="Reset Journey"
          >
            <RotateCcw className="w-2.5 h-2.5" />
          </motion.button>
        )}
      </div>
    </div>
  );
}
