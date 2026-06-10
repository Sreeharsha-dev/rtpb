"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { getLevelName, getLevelIcon } from "@/lib/game-utils";

interface LevelTransitionProps {
  fromLevel: number;
  toLevel: number;
  onDone: () => void;
}

export default function LevelTransition({ fromLevel, toLevel, onDone }: LevelTransitionProps) {
  const [stage, setStage] = useState<"enter" | "show" | "exit">("enter");

  useEffect(() => {
    setStage("enter");
    const t1 = setTimeout(() => setStage("show"), 100);
    const t2 = setTimeout(() => setStage("exit"), 1800);
    const t3 = setTimeout(() => onDone(), 2400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [fromLevel, toLevel, onDone]);

  return (
    <AnimatePresence>
      {stage !== "exit" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{
            background: "radial-gradient(ellipse at center, rgba(30,10,60,0.95) 0%, rgba(5,2,18,0.98) 100%)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Stage 1: Level Complete */}
          {stage === "enter" && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.6 }}
                className="text-5xl mb-4"
              >
                {getLevelIcon(fromLevel)}
              </motion.div>
              <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-amber-300 mb-1">
                Level {fromLevel} Complete!
              </h2>
              <p className="text-xs text-violet-300/70">{getLevelName(fromLevel)}</p>
            </motion.div>
          )}

          {/* Stage 2: Arrow / Transition */}
          {stage === "show" && (
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 150, damping: 12 }}
              className="text-center"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-pink-500/30 to-violet-600/30 border border-pink-400/30 mb-4"
                >
                  <ArrowRight className="w-7 h-7 text-pink-400" />
                </motion.div>
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xs text-violet-400 mt-2 font-mono tracking-widest uppercase"
              >
                Next Level Loading...
              </motion.p>
              {/* Loading dots */}
              <div className="flex gap-1.5 justify-center mt-3">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                    className="w-2 h-2 rounded-full bg-pink-500"
                  />
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
