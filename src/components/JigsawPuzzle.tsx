"use client";

import React, { useState, useEffect, useRef } from "react";
import { Eye, RefreshCw, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

interface JigsawPuzzleProps {
  onComplete: () => void;
}

interface Piece {
  id: number;
  correctCol: number;
  correctRow: number;
  x: number; // current absolute x relative to container
  y: number; // current absolute y relative to container
  isLocked: boolean;
}

const BOARD_SIZE = 270;
const GRID_SIZE = 3;
const PIECE_SIZE = BOARD_SIZE / GRID_SIZE; // 90px

export default function JigsawPuzzle({ onComplete }: JigsawPuzzleProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageUrl, setImageUrl] = useState<string>("/naruto_puzzle_bg.png");
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [progress, setProgress] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  const previewTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current);
      }
    };
  }, []);

  // Initialize and shuffle pieces
  const initializePuzzle = (imgUrl: string = imageUrl) => {
    const newPieces: Piece[] = [];
    
    // Scatter the pieces in the tray area (y: 320 to 400)
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const id = r * GRID_SIZE + c;
        
        // Random placement in the tray below the board
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
  };

  // Run on mount
  useEffect(() => {
    initializePuzzle();
  }, [imageUrl]);

  // Handle showing the full image preview overlay for 4 seconds
  const handleShowPreview = () => {
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current);
    }
    setShowPreview(true);
    previewTimeoutRef.current = setTimeout(() => {
      setShowPreview(false);
    }, 4000);
  };

  // Pointer Down
  const handlePointerDown = (id: number, e: React.PointerEvent<HTMLDivElement>) => {
    const piece = pieces.find(p => p.id === id);
    if (!piece || piece.isLocked || gameCompleted) return;

    setDraggingId(id);
    
    // Calculate offset of pointer from piece top-left
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  // Pointer Move
  const handlePointerMove = (id: number, e: React.PointerEvent<HTMLDivElement>) => {
    if (draggingId !== id || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - containerRect.left - dragOffset.x;
    const y = e.clientY - containerRect.top - dragOffset.y;

    // Constrain inside container bounds
    const maxX = containerRect.width - PIECE_SIZE;
    const maxY = containerRect.height - PIECE_SIZE;
    const boundedX = Math.max(0, Math.min(x, maxX));
    const boundedY = Math.max(0, Math.min(y, maxY));

    setPieces(prev =>
      prev.map(p => (p.id === id ? { ...p, x: boundedX, y: boundedY } : p))
    );
  };

  // Pointer Up (Snapping Logic)
  const handlePointerUp = (id: number, e: React.PointerEvent<HTMLDivElement>) => {
    if (draggingId !== id) return;
    setDraggingId(null);
    e.currentTarget.releasePointerCapture(e.pointerId);

    const piece = pieces.find(p => p.id === id);
    if (!piece) return;

    // Calculate correct position on board (top: 0, left: 0 relative to board)
    const targetX = piece.correctCol * PIECE_SIZE;
    const targetY = piece.correctRow * PIECE_SIZE;

    // Calculate distance to target
    const distance = Math.hypot(piece.x - targetX, piece.y - targetY);

    // If within 35px threshold, snap and lock
    if (distance < 35) {
      setPieces(prev => {
        const updated = prev.map(p =>
          p.id === id ? { ...p, x: targetX, y: targetY, isLocked: true } : p
        );

        // Check overall completion
        const lockedCount = updated.filter(p => p.isLocked).length;
        const newProgress = Math.round((lockedCount / 9) * 100);
        setProgress(newProgress);

        if (lockedCount === 9) {
          setGameCompleted(true);
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 }
          });
        }

        return updated;
      });
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      
      {/* Title */}
      <div className="w-full p-2.5 glassmorphic rounded-xl glow-pink border-pink-500/20 mb-2 text-center">
        <h3 className="text-xs font-bold text-pink-400 uppercase tracking-wider font-mono">
          Naruto Jigsaw Challenge 🍥
        </h3>
        <p className="text-[10px] text-violet-300 mt-1">
          Drag scrambled pieces from the tray and snap them into correct slots!
        </p>
      </div>

      {/* View Full Image and Reset */}
      <div className="flex justify-between items-center w-full mb-4 px-2">
        <button
          type="button"
          onClick={handleShowPreview}
          disabled={showPreview || gameCompleted}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-pink-900/50 hover:bg-pink-800/50 text-pink-200 border border-pink-500/30 text-xs font-semibold cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Eye className="w-3.5 h-3.5" />
          {showPreview ? "Viewing Image..." : "View Full Image"}
        </button>

        <button
          type="button"
          onClick={() => initializePuzzle()}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/50 hover:bg-slate-800/50 text-violet-200 border border-violet-500/30 text-xs font-semibold cursor-pointer transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset Game
        </button>
      </div>

      {/* Main Drag-and-Drop Container */}
      {!gameCompleted && (
        <div
          ref={containerRef}
          className="relative w-[270px] h-[420px] bg-slate-950/40 backdrop-blur-xl border border-violet-500/20 rounded-2xl overflow-hidden shadow-2xl shadow-violet-950/30 mb-2"
        >
          {/* Full Image Overlay for Preview */}
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

          {/* The Grid Board Area (Top 270x270) */}
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

          {/* Shuffled/Draggable Pieces */}
          {pieces.map(piece => {
            const isDragging = draggingId === piece.id;

            return (
              <div
                key={piece.id}
                onPointerDown={(e) => handlePointerDown(piece.id, e)}
                onPointerMove={(e) => handlePointerMove(piece.id, e)}
                onPointerUp={(e) => handlePointerUp(piece.id, e)}
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
                  <div className="absolute top-1 right-1 bg-emerald-500/90 text-white rounded-full p-0.5 shadow-sm scale-100 transition-all duration-300">
                    <CheckCircle2 className="w-3.5 h-3.5 animate-[bounce_0.4s_ease]" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Shuffled Tray Background Title */}
          <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none select-none">
            <p className="text-[10px] uppercase tracking-wider text-violet-400/40 font-semibold">
              Pieces Tray
            </p>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {!gameCompleted && (
        <div className="w-full mt-2 px-2">
          <div className="flex justify-between items-center text-xs font-semibold text-violet-300 mb-1">
            <span>Puzzle Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-violet-950/65 border border-violet-500/20 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-600 to-pink-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Completed Success Prompt */}
      {gameCompleted && (
        <div className="w-full p-5 glassmorphic rounded-2xl glow-gold border-amber-500/40 text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-amber-950/60 border border-amber-500/40 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>
          <h4 className="text-md font-bold text-amber-200">Naruto Challenge Completed!</h4>
          <p className="text-sm italic font-serif text-violet-100 mt-2 mb-4 px-2 leading-relaxed">
            &ldquo;Just like Naruto never gave up, may you always chase your dreams fearlessly.&rdquo;
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
