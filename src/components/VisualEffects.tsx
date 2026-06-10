"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Award, CheckCircle2 } from "lucide-react";
import {
  useScreenShake,
  useScreenFlash,
  useScorePopups,
  useToasts,
} from "@/lib/game-utils";

export default function VisualEffects() {
  const shaking = useScreenShake();
  const flash = useScreenFlash();
  const popups = useScorePopups();
  const toasts = useToasts();

  return (
    <>
      {/* Screen Shake */}
      {shaking && (
        <style jsx global>{`
          .app-container {
            animation: screen-shake 0.4s ease-in-out;
          }
        `}</style>
      )}

      {/* Screen Flash Overlay */}
      <AnimatePresence>
        {flash && (
          <motion.div
            key={flash.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="fixed inset-0 pointer-events-none z-[999]"
            style={{ backgroundColor: flash.color }}
          />
        )}
      </AnimatePresence>

      {/* Score Popups */}
      {popups.map((popup) => (
        <div
          key={popup.id}
          className="score-popup"
          style={{
            left: popup.x,
            top: popup.y,
            color: popup.color || "#f59e0b",
          }}
        >
          {popup.text}
        </div>
      ))}

      {/* Toast Notifications */}
      <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -30, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
              className={`game-toast ${toast.type}`}
            >
              {toast.type === "achievement" && <Award className="w-4 h-4 text-yellow-400" />}
              {toast.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              {toast.type === "error" && <span className="text-red-400 text-sm">⚠</span>}
              {toast.type === "info" && <Star className="w-4 h-4 text-violet-400" />}
              {toast.icon && <span>{toast.icon}</span>}
              <span>{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
