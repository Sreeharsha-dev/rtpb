"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Eye, RefreshCw, CheckCircle2, Timer } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

interface JigsawPuzzleProps {
  onComplete: () => void;
}

interface Piece {
  id: number;
  correctCol: number;
  correctRow: number;
  x: number;
  y: number;
  isLocked: boolean;
}

const BOARD_SIZE = 270;
const GRID_SIZE = 3;
const PIECE_SIZE = BOARD_SIZE / GRID_SIZE;

export default function JigsawPuzzle({ onComplete }: JigsawPuzzleProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageUrl] = useState<string>("/naruto_puzzle_bg.png");
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [progress, setProgress] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [moves, setMoves] = useState(0);
  const startTimeRef = useRef(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [shakePieceIds, setShakePieceIds] = useState<number[]>([]);

  const previewTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Timer
  useEffect(() => {
    if (gameCompleted) return;
    const start = startTimeRef.current;
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameCompleted]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const initializePuzzle = () => {
    const newPieces: Piece[] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const id = r * GRID_SIZE + c;
        const randomX = Math.random() * (BOARD_SIZE - PIECE_SIZE);
        const randomY = 285 + Math.random() * 45;
        newPieces.push({
          id,
          correctCol: c,
          correctRow: r,
          x: randomX,
          y: randomY,
          isLocked: false,
        });
      }
    }
    setPieces(newPieces);
    setGameCompleted(false);
    setProgress(0);
    setMoves(0);
  };

  useEffect(() => {
    initializePuzzle();
  }, []);

  const handleShowPreview = () => {
    if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current);
    setShowPreview(true);
    previewTimeoutRef.current = setTimeout(() => {
      setShowPreview(false);
    }, 4000);
  };

  const handlePointerDown = (id: number, e: React.PointerEvent<HTMLDivElement>) => {
    const piece = pieces.find((p) => p.id === id);
    if (!piece || piece.isLocked || gameCompleted) return;

    setDraggingId(id);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (id: number, e: React.PointerEvent<HTMLDivElement>) => {
    if (draggingId !== id || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - containerRect.left - dragOffset.x;
    const y = e.clientY - containerRect.top - dragOffset.y;
    const maxX = containerRect.width - PIECE_SIZE;
    const maxY = containerRect.height - PIECE_SIZE;
    const boundedX = Math.max(0, Math.min(x, maxX));
    const boundedY = Math.max(0, Math.min(y, maxY));

    setPieces((prev) =>
      prev.map((p) => (p.id === id ? { ...p, x: boundedX, y: boundedY } : p))
    );
  };

  const handlePointerUp = (id: number, e: React.PointerEvent<HTMLDivElement>) => {
    if (draggingId !== id) return;
    setDraggingId(null);
    e.currentTarget.releasePointerCapture(e.pointerId);

    const piece = pieces.find((p) => p.id === id);
    if (!piece) return;

    const targetX = piece.correctCol * PIECE_SIZE;
    const targetY = piece.correctRow * PIECE_SIZE;
    const distance = Math.hypot(piece.x - targetX, piece.y - targetY);

    if (distance < 35) {
      setMoves((m) => m + 1);
      setPieces((prev) => {
        const updated = prev.map((p) =>
          p.id === id ? { ...p, x: targetX, y: targetY, isLocked: true } : p
        );
        const lockedCount = updated.filter((p) => p.isLocked).length;
        const newProgress = Math.round((lockedCount / 9) * 100);
        setProgress(newProgress);

        if (lockedCount === 9) {
          setGameCompleted(true);
          confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.5 },
            colors: ["#f59e0b", "#ec4899", "#a78bfa", "#10b981"],
          });
          setTimeout(() => {
            confetti({ particleCount: 80, spread: 60, origin: { x: 0.3, y: 0.4 } });
          }, 300);
        }
        return updated;
      });
    } else {
      // Shake on fail
      setShakePieceIds((prev) => [...prev, id]);
      setTimeout(() => {
        setShakePieceIds((prev) => prev.filter((pid) => pid !== id));
      }, 400);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      <div className="w-full p-2.5 glassmorphic rounded-xl glow-pink border-pink-500/20 mb-2 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
        <h3 className="text-xs font-bold text-pink-400 uppercase tracking-wider font-mono relative z-10">
          Naruto Jigsaw Challenge 🍥
        </h3>
        <p className="text-[10px] text-violet-300 mt-1 relative z-10">
          Drag scrambled pieces and snap them into correct slots!
        </p>
      </div>

      {/* Stats bar */}
      {!gameCompleted && (
        <div className="flex justify-between items-center w-full mb-2 px-1 max-w-[270px]">
          <div className="flex items-center gap-1 text-[9px] text-violet-400 font-mono">
            <Timer className="w-2.5 h-2.5" />
            {formatTime(elapsed)}
          </div>
          <div className="text-[9px] text-violet-400 font-mono">
            Moves: {moves}
          </div>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={handleShowPreview}
              disabled={showPreview || gameCompleted}
              className="p-1.5 rounded-lg bg-pink-900/50 hover:bg-pink-800/50 text-pink-200 border border-pink-500/30 text-[9px] cursor-pointer transition-all disabled:opacity-50"
            >
              <Eye className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={initializePuzzle}
              className="p-1.5 rounded-lg bg-slate-900/50 hover:bg-slate-800/50 text-violet-200 border border-violet-500/30 text-[9px] cursor-pointer transition-all"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {!gameCompleted && (
        <div
          ref={containerRef}
          className="relative w-[270px] h-[420px] bg-slate-950/40 backdrop-blur-xl border border-violet-500/20 rounded-2xl overflow-hidden shadow-2xl shadow-violet-950/30 mb-2"
        >
          <AnimatePresence>
            {showPreview && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute top-0 left-0 w-[270px] h-[270px] z-40 pointer-events-none rounded-t-2xl border-b border-violet-500/20"
                style={{
                  backgroundImage: `url(${imageUrl})`,
                  backgroundSize: `${BOARD_SIZE}px ${BOARD_SIZE}px`,
                }}
              />
            )}
          </AnimatePresence>

          <div className="absolute top-0 left-0 w-[270px] h-[270px] bg-slate-950/50 grid grid-cols-3 grid-rows-3 border-b border-violet-500/10">
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                className="border border-violet-500/10 flex items-center justify-center bg-violet-950/5"
              >
                <span className="text-[10px] text-violet-500/20 font-mono">
                  Slot {i + 1}
                </span>
              </div>
            ))}
          </div>

          {pieces.map((piece) => {
            const isDragging = draggingId === piece.id;
            const isShaking = shakePieceIds.includes(piece.id);

            return (
              <motion.div
                key={piece.id}
                onPointerDown={(e) => handlePointerDown(piece.id, e)}
                onPointerMove={(e) => handlePointerMove(piece.id, e)}
                onPointerUp={(e) => handlePointerUp(piece.id, e)}
                animate={isShaking ? { x: [0, -5, 5, -3, 3, 0] } : {}}
                transition={isShaking ? { duration: 0.3 } : {}}
                className={`absolute w-[90px] h-[90px] cursor-grab active:cursor-grabbing rounded-sm transition-shadow duration-200 select-none touch-none ${
                  piece.isLocked
                    ? "border border-emerald-500/40 shadow-none pointer-events-none"
                    : "border border-violet-500/35 hover:border-pink-500/50 shadow-md shadow-violet-950/40 hover:shadow-lg hover:shadow-pink-500/15"
                }`}
                style={{
                  left: `${piece.x}px`,
                  top: `${piece.y}px`,
                  backgroundImage: `url(${imageUrl})`,
                  backgroundSize: `${BOARD_SIZE}px ${BOARD_SIZE}px`,
                  backgroundPosition: `${-piece.correctCol * PIECE_SIZE}px ${-piece.correctRow * PIECE_SIZE}px`,
                  boxSizing: "border-box",
                  zIndex: isDragging ? 50 : piece.isLocked ? 10 : 20,
                  transform: isDragging
                    ? "scale(1.08) rotate(3deg)"
                    : "scale(1) rotate(0deg)",
                  boxShadow: isDragging
                    ? "0 15px 25px rgba(0, 0, 0, 0.45), 0 0 10px rgba(139, 92, 246, 0.2)"
                    : "",
                  transition: isDragging
                    ? "transform 0.15s ease-out, box-shadow 0.15s ease-out"
                    : "top 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), left 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.25s ease",
                }}
              >
                {piece.isLocked && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 right-1 bg-emerald-500/90 text-white rounded-full p-0.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </motion.div>
                )}
              </motion.div>
            );
          })}

          <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none select-none">
            <p className="text-[10px] uppercase tracking-wider text-violet-400/40 font-semibold">
              Pieces Tray
            </p>
          </div>
        </div>
      )}

      {!gameCompleted && (
        <div className="w-full max-w-[270px] mt-1">
          <div className="w-full h-1.5 rounded-full bg-violet-950/65 border border-violet-500/20 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-600 to-pink-500 rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 50, damping: 15 }}
            />
          </div>
        </div>
      )}

      {gameCompleted && (
        <div className="w-full p-5 glassmorphic rounded-2xl glow-gold border-amber-500/40 text-center flex flex-col items-center">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 rounded-full bg-amber-950/60 border border-amber-500/40 flex items-center justify-center mb-3"
          >
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </motion.div>
          <h4 className="text-md font-bold text-amber-200">Naruto Challenge Completed!</h4>
          <p className="text-[10px] text-violet-400 font-mono mb-1">Moves: {moves} | Time: {formatTime(elapsed)}</p>
          <p className="text-sm italic font-serif text-violet-100 mt-2 mb-4 px-2 leading-relaxed">
            &ldquo;Just like Naruto never gave up, may you always chase your dreams fearlessly.&rdquo;
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
        </div>
      )}
    </div>
  );
}
