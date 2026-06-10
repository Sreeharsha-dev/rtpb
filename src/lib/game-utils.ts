"use client";

import { useCallback, useState, useEffect } from "react";

// ============ SCREEN SHAKE ============

const shakeListeners: Set<(intensity: number) => void> = new Set();

export const triggerScreenShake = (intensity = 1) => {
  shakeListeners.forEach((fn) => fn(intensity));
};

export function useScreenShake() {
  const [shaking, setShaking] = useState(false);

  useEffect(() => {
    const handler = (intensity: number) => {
      setShaking(true);
      const duration = Math.min(400, 150 + intensity * 80);
      setTimeout(() => setShaking(false), duration);
    };
    shakeListeners.add(handler);
    return () => { shakeListeners.delete(handler); };
  }, []);

  return shaking;
}

// ============ SCREEN FLASH ============

let flashCounter = 0;
const flashListeners: Set<(color: string, duration: number) => void> = new Set();

export const triggerScreenFlash = (color = "rgba(255,255,255,0.3)", duration = 200) => {
  flashCounter++;
  flashListeners.forEach((fn) => fn(color, duration));
};

export function useScreenFlash() {
  const [flash, setFlash] = useState<{ color: string; id: number } | null>(null);

  useEffect(() => {
    const handler = (color: string, duration: number) => {
      const id = flashCounter;
      setFlash({ color, id });
      setTimeout(() => {
        setFlash((prev) => (prev?.id === id ? null : prev));
      }, duration);
    };
    flashListeners.add(handler);
    return () => { flashListeners.delete(handler); };
  }, []);

  return flash;
}

// ============ SCORE POPUPS ============

interface ScorePopupData {
  id: number;
  x: number;
  y: number;
  text: string;
  color?: string;
}

let popupIdCounter = 0;
const popupListeners: Set<(popup: ScorePopupData) => void> = new Set();

export const showScorePopup = (x: number, y: number, text: string, color?: string) => {
  const popup: ScorePopupData = { id: ++popupIdCounter, x, y, text, color };
  popupListeners.forEach((fn) => fn(popup));
};

export function useScorePopups() {
  const [popups, setPopups] = useState<ScorePopupData[]>([]);

  useEffect(() => {
    const handler = (popup: ScorePopupData) => {
      setPopups((prev) => [...prev, popup]);
      setTimeout(() => {
        setPopups((prev) => prev.filter((p) => p.id !== popup.id));
      }, 1000);
    };
    popupListeners.add(handler);
    return () => { popupListeners.delete(handler); };
  }, []);

  return popups;
}

// ============ TOAST SYSTEM ============

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info" | "achievement";
  icon?: string;
}

let toastIdCounter = 0;
const toastListeners: Set<(toast: Toast) => void> = new Set();

export const showToast = (message: string, type: Toast["type"] = "info", icon?: string) => {
  const toast: Toast = { id: ++toastIdCounter, message, type, icon };
  toastListeners.forEach((fn) => fn(toast));
};

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handler = (toast: Toast) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 3000);
    };
    toastListeners.add(handler);
    return () => { toastListeners.delete(handler); };
  }, []);

  return toasts;
}

// ============ HAPTIC FEEDBACK ============

export const triggerHaptic = (ms: number | number[] = 35) => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(ms);
  }
};

// ============ COINS / STARS ============

const STORAGE_KEY = "birthday_game_stars";

export function getStars(): number {
  if (typeof window === "undefined") return 0;
  try {
    return parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10) || 0;
  } catch {
    return 0;
  }
}

export function addStars(amount: number): number {
  const current = getStars();
  const updated = current + amount;
  try {
    localStorage.setItem(STORAGE_KEY, String(updated));
  } catch {}
  return updated;
}

export function useStars() {
  const [stars, setStars] = useState(() => getStars());
  const [justAdded, setJustAdded] = useState(0);

  useEffect(() => {
    const handler = () => setStars(getStars());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const add = useCallback((amount: number) => {
    const updated = addStars(amount);
    setStars(updated);
    setJustAdded(amount);
    setTimeout(() => setJustAdded(0), 1200);
    return updated;
  }, []);

  return { stars, add, justAdded };
}

// ============ LEVEL PROGRESS ============

const LEVEL_NAMES: Record<number, string> = {
  1: "Secret PIN Portal",
  2: "Naruto Jigsaw",
  3: "Memory Match",
  4: "Heart Balloon",
  5: "Hidden Hearts",
  6: "3D Gift Box",
  7: "Birthday Letter",
  8: "Grand Finale",
};

const LEVEL_ICONS: Record<number, string> = {
  1: "🔐",
  2: "🧩",
  3: "🃏",
  4: "🎈",
  5: "💖",
  6: "🎁",
  7: "💌",
  8: "🎂",
};

export function getLevelName(level: number): string {
  return LEVEL_NAMES[level] || `Level ${level}`;
}

export function getLevelIcon(level: number): string {
  return LEVEL_ICONS[level] || "⭐";
}

// ============ AUDIO ============

export const playMagicalSound = (type: 'tap' | 'success' | 'failure' | 'sparkle' | 'type') => {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as Record<string, new () => AudioContext>)["webkitAudioContext"];
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    
    if (type === 'tap') {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(523.25, now);
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(659.25, now);
      
      gainNode.gain.setValueAtTime(0.28, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc1.start();
      osc2.start();
      osc1.stop(now + 0.12);
      osc2.stop(now + 0.12);
    } else if (type === 'success') {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + index * 0.08);
        
        gainNode.gain.setValueAtTime(0.0, now);
        gainNode.gain.linearRampToValueAtTime(0.35, now + index * 0.08);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.28);
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start(now + index * 0.08);
        osc.stop(now + index * 0.08 + 0.28);
      });
    } else if (type === 'failure') {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.35);
      
      gainNode.gain.setValueAtTime(0.32, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start();
      osc.stop(now + 0.35);
    } else if (type === 'sparkle') {
      const notes = [329.63, 392.00, 523.25, 659.25, 783.99, 1046.50, 1318.51];
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + index * 0.06);
        
        gainNode.gain.setValueAtTime(0.0, now);
        gainNode.gain.linearRampToValueAtTime(0.38, now + index * 0.06);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + index * 0.06 + 0.32);
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start(now + index * 0.06);
        osc.stop(now + index * 0.06 + 0.32);
      });
    } else if (type === 'type') {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(500 + Math.random() * 200, now);
      
      gainNode.gain.setValueAtTime(0.03, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start();
      osc.stop(now + 0.03);
    }
  } catch (e) {
    // Silently fail
  }
};

// ============ CONFETTI ============

export function burstConfetti(density = 1) {
  if (typeof window === "undefined") return;
  const colors = ["#ec4899", "#a78bfa", "#f59e0b", "#10b981", "#f472b6"];
  const opts = {
    particleCount: Math.floor(80 * density),
    spread: 80 * density,
    origin: { y: 0.6 } as const,
    colors,
  };
  try {
    const confettiModule = (window as unknown as Record<string, (opts: Record<string, unknown>) => void>)["confetti"];
    if (confettiModule) {
      confettiModule(opts);
    } else {
      import("canvas-confetti").then((mod) => {
        (mod.default || mod)(opts);
      });
    }
  } catch {
    // Silently fail
  }
}
