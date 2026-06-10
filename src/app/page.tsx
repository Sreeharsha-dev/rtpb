"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, 
  Lock, 
  Unlock, 
  Sparkles, 
  RotateCcw, 
  Star 
} from "lucide-react";
import confetti from "canvas-confetti";

// Local components
import ThreeGiftBox from "@/components/ThreeGiftBox";
import ThreeCake from "@/components/ThreeCake";
import Fireworks from "@/components/Fireworks";
import MusicPlayer from "@/components/MusicPlayer";
import JigsawPuzzle from "@/components/JigsawPuzzle";
import MemoryMatch from "@/components/MemoryMatch";
import BalloonChallenge from "@/components/BalloonChallenge";
import HiddenHeartsQuest from "@/components/HiddenHeartsQuest";
import BirthdayLetter from "@/components/BirthdayLetter";

// Upgraded Audio Synth Feedback Helper
const playMagicalSound = (type: 'tap' | 'success' | 'failure' | 'sparkle' | 'type') => {
  if (typeof window === "undefined") return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;
    
    if (type === 'tap') {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(523.25, now);
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(659.25, now); // Major third interval chime
      
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
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
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
      const notes = [329.63, 392.00, 523.25, 659.25, 783.99, 1046.50, 1318.51]; // E4, G4, C5, E5, G5, C6, E6
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
    console.error("Audio error", e);
  }
};

// Haptic feedback helper
const triggerHaptic = (ms: number | number[] = 35) => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(ms);
  }
};

// Global premium spring config
const premiumSpring = {
  type: "spring" as const,
  stiffness: 85,
  damping: 17,
  mass: 1
};

export default function Home() {
  const [step, setStep] = useState<number>(0);
  const [pin, setPin] = useState<string>("");
  const [pinError, setPinError] = useState<boolean>(false);
  const [musicPlaying, setMusicPlaying] = useState<boolean>(false);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; left: number; delay: number }[]>([]);
  const [cakeBlown, setCakeBlown] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [showPinInterface, setShowPinInterface] = useState<boolean>(false);

  // Load state from localStorage on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      const savedStep = localStorage.getItem("birthday_surprise_step");
      if (savedStep) {
        const numStep = parseInt(savedStep, 10);
        // Ensure layouts map safely, max step is 8
        setStep(numStep >= 1 && numStep <= 8 ? numStep : 1);
        if (numStep > 1) {
          setMusicPlaying(true);
        }
      } else {
        setStep(1); // Start directly with PIN portal (Level 1)
      }
      setIsLoaded(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  // Update localStorage when step changes
  useEffect(() => {
    if (isLoaded && step > 0) {
      localStorage.setItem("birthday_surprise_step", step.toString());
    }
  }, [step, isLoaded]);

  // Generate floating hearts/stars (Step 8 Cake Finale)
  useEffect(() => {
    if (step !== 8) {
      setFloatingHearts([]);
      return;
    }

    const interval = setInterval(() => {
      setFloatingHearts((prev) => [
        ...prev.slice(-25),
        {
          id: Date.now() + Math.random(),
          left: Math.random() * 100,
          delay: Math.random() * 2
        }
      ]);
    }, 600);

    return () => clearInterval(interval);
  }, [step]);

  // PIN input logic
  const handleKeypadPress = (val: string) => {
    if (pin.length >= 4) return;
    triggerHaptic(20);
    playMagicalSound("tap");
    const newPin = pin + val;
    setPin(newPin);

    if (newPin.length === 4) {
      if (newPin === "2026") {
        setTimeout(() => {
          triggerHaptic([60, 40, 60]);
          playMagicalSound("success");
          setMusicPlaying(true);
          setPinError(false);
          setStep(2); // Transition to Level 2 (Jigsaw)
        }, 300);
      } else {
        setTimeout(() => {
          triggerHaptic(200);
          playMagicalSound("failure");
          setPinError(true);
          setTimeout(() => {
            setPin("");
            setPinError(false);
          }, 800);
        }, 300);
      }
    }
  };

  const handleBackspace = () => {
    triggerHaptic(15);
    playMagicalSound("tap");
    setPin(pin.slice(0, -1));
  };

  const handleClear = () => {
    triggerHaptic(30);
    playMagicalSound("tap");
    setPin("");
  };

  // Blow out cake candles (Level 8)
  const handleBlowOut = () => {
    setCakeBlown(true);
    triggerHaptic([100, 50, 100, 50, 150]);
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.55 }
    });
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 120,
        origin: { x: 0.2, y: 0.4 }
      });
    }, 400);
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 120,
        origin: { x: 0.8, y: 0.4 }
      });
    }, 800);
  };

  // Reset entire experience
  const handleReset = () => {
    triggerHaptic(80);
    localStorage.removeItem("birthday_surprise_step");
    setPin("");
    setStep(1);
    setCakeBlown(false);
    setMusicPlaying(false);
    setShowPinInterface(false);
  };

  return (
    <div className="flex-1 w-full h-screen max-h-screen relative flex flex-col items-center justify-center py-3 px-3.5 z-10 select-none overflow-hidden">
      
      {/* Stars Animated Background */}
      <div className="stars-bg" />

      {/* Ambient Glowing Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{
            x: ["-25%", "25%", "-15%", "-25%"],
            y: ["-20%", "25%", "15%", "-20%"],
          }}
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-pink-500/10 blur-[120px]"
        />
        <motion.div
          animate={{
            x: ["25%", "-20%", "15%", "25%"],
            y: ["20%", "-25%", "20%", "20%"],
          }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-indigo-500/10 blur-[140px]"
        />
        <motion.div
          animate={{
            x: ["-15%", "20%", "-25%", "-15%"],
            y: ["35%", "15%", "-15%", "35%"],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/2 left-1/3 w-72 h-72 rounded-full bg-amber-500/5 blur-[100px]"
        />
      </div>

      {/* Floating retro audio player */}
      {step >= 2 && (
        <MusicPlayer isPlaying={musicPlaying} onTogglePlay={setMusicPlaying} />
      )}

      {/* Foreground Container */}
      <div className="w-full max-w-sm relative z-10 flex flex-col items-center justify-center h-full max-h-full">
        <AnimatePresence mode="wait">
          
          {/* STATE 0: Loader View */}
          {!isLoaded && (
            <motion.div
              key="loader"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center text-center p-8 glassmorphic rounded-3xl w-full max-w-sm glow-indigo border-indigo-500/30"
            >
              <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-violet-500/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-t-pink-500 border-r-pink-400 rounded-full animate-spin" />
                <Heart className="w-8 h-8 text-pink-500 animate-pulse absolute" />
              </div>
              <h2 className="text-xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-violet-200 to-pink-300">
                Aligning Constellations
              </h2>
              <p className="text-xs text-violet-400/70 mt-2 font-mono uppercase tracking-widest animate-pulse">
                Preparing Magic...
              </p>
            </motion.div>
          )}

          {/* LEVEL 1: Secret PIN Portal / Welcome Page */}
          {isLoaded && step === 1 && (
            <motion.div
              key="pin-portal-screen"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={pinError ? {
                x: [0, -10, 10, -10, 10, -5, 5, 0],
                y: 0,
                opacity: 1,
                transition: { duration: 0.5, ease: "easeInOut" }
              } : { 
                x: 0, 
                y: 0,
                opacity: 1,
                transition: premiumSpring
              }}
              exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)", transition: { duration: 0.6 } }}
              className={`w-full p-8 glassmorphic rounded-3xl flex flex-col items-center text-center glow-pink border-pink-400/40 relative overflow-hidden`}
            >
              {/* Floating aesthetic background */}
              <div className="absolute inset-0 pointer-events-none opacity-20">
                <span className="absolute top-2 left-2 text-xl">🦄</span>
                <span className="absolute top-2 right-2 text-xl">🪄</span>
                <span className="absolute bottom-2 left-2 text-xl">🍭</span>
                <span className="absolute bottom-2 right-2 text-xl">⭐</span>
              </div>

              {/* Heart Lock Icon */}
              <div className="w-14 h-14 rounded-full bg-pink-950/80 border border-pink-500/35 flex items-center justify-center mb-4 text-pink-300">
                {pin.length === 4 && pin === "2026" ? (
                  <Unlock className="w-6 h-6 text-emerald-400 animate-pulse" />
                ) : (
                  <Lock className="w-6 h-6 text-pink-400" />
                )}
              </div>

              {/* Dynamic Content: Welcome Poem or PIN keypad */}
              <AnimatePresence mode="wait">
                {!showPinInterface ? (
                  <motion.div
                    key="welcome-poem"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col items-center"
                  >
                    <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-pink-200 to-amber-200 tracking-wide mb-3 leading-normal">
                      Welcome Ramya ❤️
                    </h2>
                    <div className="text-xs text-violet-200/90 max-w-xs mx-auto mb-6 leading-relaxed font-sans text-center space-y-2.5">
                      <p>Not everyone leaves a mark on the people around them.</p>
                      <p>Some people are calm yet bold.<br/>Traditional yet modern.<br/>Sensitive yet strong.</p>
                      <p className="font-semibold text-pink-300">This is a small journey dedicated to someone special...</p>
                    </div>

                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        triggerHaptic(20);
                        playMagicalSound("tap");
                        setShowPinInterface(true);
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-pink-400 to-violet-600 text-white font-extrabold text-xs shadow-md shadow-pink-500/20 cursor-pointer animate-float"
                    >
                      Enter the Portal 🪄
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="keypad-interface"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="w-full flex flex-col items-center"
                  >
                    <h2 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-pink-200 to-amber-200 tracking-wide mb-1 leading-normal">
                      🌸 Secret PIN Portal 🌸
                    </h2>
                    <p className="text-[10px] text-violet-300 mb-5">
                      Hint: Ask Mom or Dad for the special year! 🦄
                    </p>

                    {/* Heart indicators */}
                    <div className="flex gap-4 justify-center mb-6">
                      {[...Array(4)].map((_, i) => {
                        const isTyped = i < pin.length;
                        return (
                          <motion.div
                            key={i}
                            animate={isTyped ? { scale: [1, 1.3, 1.1] } : { scale: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Heart
                              className={`w-5 h-5 transition-all duration-300 ${
                                isTyped
                                  ? "text-pink-500 fill-pink-500 filter drop-shadow-[0_0_8px_#ec4899]"
                                  : "text-violet-500/30"
                              }`}
                            />
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Keypad */}
                    <div className="grid grid-cols-3 gap-3 w-full max-w-[240px] relative z-10">
                      {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((val) => (
                        <motion.button
                          type="button"
                          key={val}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleKeypadPress(val)}
                          disabled={pin.length >= 4}
                          className="h-10 rounded-xl bg-gradient-to-br from-pink-400 to-pink-500 text-white font-extrabold text-base shadow-[0_4px_10px_rgba(236,72,153,0.3)] hover:from-pink-300 hover:to-pink-400 hover:shadow-[0_6px_15px_rgba(236,72,153,0.5)] border border-pink-300/20 transition-all cursor-pointer select-none"
                        >
                          {val}
                        </motion.button>
                      ))}
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleClear}
                        className="h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white font-extrabold text-[9px] shadow-[0_4px_10px_rgba(139,92,246,0.3)] border border-violet-400/20 transition-all cursor-pointer"
                      >
                        CLEAR
                      </motion.button>
                      <motion.button
                        type="button"
                        key="0"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleKeypadPress("0")}
                        disabled={pin.length >= 4}
                        className="h-10 rounded-xl bg-gradient-to-br from-pink-400 to-pink-500 text-white font-extrabold text-base shadow-[0_4px_10px_rgba(236,72,153,0.3)] hover:from-pink-300 hover:to-pink-400 hover:shadow-[0_6px_15px_rgba(236,72,153,0.5)] border border-pink-300/20 transition-all cursor-pointer select-none"
                      >
                        0
                      </motion.button>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleBackspace}
                        className="h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white font-extrabold text-[9px] shadow-[0_4px_10px_rgba(139,92,246,0.3)] border border-violet-400/20 transition-all cursor-pointer"
                      >
                        DEL
                      </motion.button>
                    </div>

                    {pinError && (
                      <p className="text-pink-400 text-xs mt-4 font-semibold animate-pulse">
                        Incorrect code. Retrying...
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* LEVEL 2: Naruto Jigsaw Challenge */}
          {isLoaded && step === 2 && (
            <motion.div
              key="jigsaw-screen"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={premiumSpring}
              className="w-full"
            >
              <JigsawPuzzle onComplete={() => setStep(3)} />
            </motion.div>
          )}

          {/* LEVEL 3: Memory Match Cards */}
          {isLoaded && step === 3 && (
            <motion.div
              key="memory-match-screen"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={premiumSpring}
              className="w-full"
            >
              <MemoryMatch onComplete={() => setStep(4)} playMagicalSound={playMagicalSound} />
            </motion.div>
          )}

          {/* LEVEL 4: Heart Balloon Challenge */}
          {isLoaded && step === 4 && (
            <motion.div
              key="balloon-screen"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={premiumSpring}
              className="w-full"
            >
              <BalloonChallenge onComplete={() => setStep(5)} playMagicalSound={playMagicalSound} />
            </motion.div>
          )}

          {/* LEVEL 5: Hidden Hearts Quest */}
          {isLoaded && step === 5 && (
            <motion.div
              key="hidden-hearts-screen"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={premiumSpring}
              className="w-full"
            >
              <HiddenHeartsQuest onComplete={() => setStep(6)} playMagicalSound={playMagicalSound} />
            </motion.div>
          )}

          {/* LEVEL 6: 3D Gift Box */}
          {isLoaded && step === 6 && (
            <motion.div
              key="gift-box-screen"
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={premiumSpring}
              className="w-full text-center flex flex-col items-center"
            >
              <div className="mb-2">
                <span className="px-3 py-1 rounded-full bg-violet-950/60 border border-violet-500/30 text-pink-400 text-xs font-semibold uppercase tracking-wider">
                  3D Gift Box 🎁
                </span>
                <h3 className="text-lg font-bold text-violet-100 mt-3">
                  A Mysterious Core Appears
                </h3>
                <p className="text-xs text-violet-400 max-w-xs mx-auto mt-1">
                  Drag to inspect the gift box, then tap it to open the lock!
                </p>
              </div>

              <div className="w-full flex items-center justify-center my-2">
                <ThreeGiftBox onOpen={() => setStep(7)} />
              </div>
            </motion.div>
          )}

          {/* LEVEL 7: Birthday Letter */}
          {isLoaded && step === 7 && (
            <motion.div
              key="birthday-letter-screen"
              initial={{ opacity: 0, scale: 0.92, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={premiumSpring}
              className="w-full"
            >
              <BirthdayLetter onComplete={() => setStep(8)} playMagicalSound={playMagicalSound} />
            </motion.div>
          )}

          {/* LEVEL 8: Grand Finale (3D Cake) */}
          {isLoaded && step === 8 && (
            <motion.div
              key="finale-screen"
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 60, damping: 16 }}
              className="w-full text-center flex flex-col items-center relative"
            >
              {/* Spawning Floating Particles / Lanterns */}
              {floatingHearts.map((heart) => (
                <div
                  key={heart.id}
                  className="floating-heart text-2xl text-pink-400/40"
                  style={{
                    left: `${heart.left}%`,
                    animationDelay: `${heart.delay}s`,
                    bottom: 0,
                  }}
                >
                  ✨
                </div>
              ))}

              <Fireworks active={cakeBlown} />

              <div className="mb-2">
                <motion.span 
                  initial={{ scale: 0.8 }}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 2.5 }}
                  className="px-3 py-1 rounded-full bg-pink-950/60 border border-pink-500/30 text-pink-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 mx-auto w-max"
                >
                  <Star className="w-3.5 h-3.5 fill-pink-500" />
                  Happy Birthday!
                  <Star className="w-3.5 h-3.5 fill-pink-500" />
                </motion.span>
                
                {cakeBlown ? (
                  <motion.h1
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={premiumSpring}
                    className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-violet-300 to-amber-300 mt-4 leading-normal uppercase tracking-wide"
                  >
                    ✨ HAPPY BIRTHDAY RAMYA ✨
                  </motion.h1>
                ) : (
                  <h1 className="text-2xl font-bold text-violet-100 mt-4 leading-normal">
                    One Last Celestial Ritual
                  </h1>
                )}
                
                <p className="text-xs text-violet-300 max-w-xs mx-auto mt-2">
                  {cakeBlown 
                    ? "May every dream you wish for today become reality." 
                    : "Close your eyes, make a silent wish, and blow out the candles by tapping the cake!"}
                </p>
              </div>

              {/* 3D Cake Canvas */}
              <div className="w-full flex items-center justify-center my-2">
                <ThreeCake candlesBlown={cakeBlown} onBlowOut={handleBlowOut} />
              </div>

              {/* Replay/Start Over Section */}
              <AnimatePresence>
                {cakeBlown && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4, type: "spring" }}
                    className="mt-6 flex flex-col items-center gap-3 w-full"
                  >
                    <div className="p-5 glassmorphic rounded-2xl glow-gold w-full text-center max-w-sm mb-2 space-y-2.5">
                      <p className="text-xs font-serif leading-relaxed text-amber-200">
                        &ldquo;May your life always be filled with:&rdquo;
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-violet-200 uppercase tracking-widest text-left font-mono">
                        <span>💜 Happiness</span>
                        <span>🌸 Memories</span>
                        <span>💖 Endless Love</span>
                        <span>🍥 Dreams Coming True</span>
                      </div>
                      <p className="text-[11px] font-semibold text-pink-300 italic pt-1 border-t border-violet-500/10">
                        Happy Birthday, Ramya ❤️
                      </p>
                    </div>

                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleReset}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900/60 border border-violet-500/30 text-violet-300 text-xs font-semibold hover:text-white hover:border-violet-500/50 transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Restart Journey
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
