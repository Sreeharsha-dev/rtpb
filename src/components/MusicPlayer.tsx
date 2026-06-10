"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";

interface MusicPlayerProps {
  isPlaying: boolean;
  onTogglePlay: (playing: boolean) => void;
}

const FALLBACK_URLS = [
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
];

export default function MusicPlayer({
  isPlaying,
  onTogglePlay,
}: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const retryCount = useRef(0);

  // Initialize audio once
  useEffect(() => {
    let audio: HTMLAudioElement | null = null;
    let mounted = true;

    const initAudio = async () => {
      if (!mounted) return;
      setLoading(true);
      setError(false);

      audio = new Audio();
      audio.loop = true;
      audio.volume = isMuted ? 0 : volume;
      audio.preload = "auto";
      audio.crossOrigin = "anonymous";

      // Try URLs in order until one works
      const tryUrl = async (urlIndex: number): Promise<void> => {
        if (urlIndex >= FALLBACK_URLS.length || !mounted) {
          throw new Error("All audio URLs failed");
        }
        return new Promise((resolve, reject) => {
          if (!audio || !mounted) return reject(new Error("unmounted"));
          audio.src = FALLBACK_URLS[urlIndex];
          audio.load();

          const onCanPlay = () => {
            cleanup();
            resolve();
          };
          const onError = () => {
            cleanup();
            reject(new Error(`URL ${urlIndex} failed`));
          };
          const cleanup = () => {
            audio?.removeEventListener("canplaythrough", onCanPlay);
            audio?.removeEventListener("error", onError);
          };
          audio.addEventListener("canplaythrough", onCanPlay, { once: true });
          audio.addEventListener("error", onError, { once: true });

          // Timeout fallback
          setTimeout(() => {
            cleanup();
            reject(new Error("timeout"));
          }, 8000);
        });
      };

      try {
        await tryUrl(0);
        if (mounted && audio) {
          audioRef.current = audio;
          setLoading(false);
          setError(false);
          if (isPlaying) {
            audio.play().catch(() => {});
          }
        }
      } catch {
        // Try next URLs
        for (let i = 1; i < FALLBACK_URLS.length; i++) {
          try {
            await tryUrl(i);
            if (mounted && audio) {
              audioRef.current = audio;
              setLoading(false);
              setError(false);
              if (isPlaying) {
                audio.play().catch(() => {});
              }
              return;
            }
          } catch {
            continue;
          }
        }
        if (mounted) {
          setLoading(false);
          setError(true);
        }
      }
    };

    initAudio();

    return () => {
      mounted = false;
      if (audio) {
        audio.pause();
        audio.src = "";
        audio.load();
      }
      audioRef.current = null;
    };
  }, []); // Only run once on mount

  // Play/pause when isPlaying changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || loading) return;

    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise) {
        playPromise.catch(() => {
          // Browser blocked autoplay - user needs to interact
        });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, loading]);

  // Volume control
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>) => {
      const vol = parseFloat((e.target as HTMLInputElement).value);
      setVolume(vol);
      if (vol > 0) setIsMuted(false);
    },
    []
  );

  const toggleMute = useCallback(() => {
    setIsMuted((m) => !m);
  }, []);

  return (
    <div
      className="fixed bottom-4 left-4 z-50 flex items-center gap-3 px-4 py-2.5 rounded-full bg-slate-950/45 backdrop-blur-xl border border-violet-500/30 text-white shadow-lg shadow-violet-950/20 transition-all hover:scale-105 select-none"
      onMouseEnter={() => setShowVolumeSlider(true)}
      onMouseLeave={() => setShowVolumeSlider(false)}
      onTouchStart={() => setShowVolumeSlider(true)}
    >
      <button
        type="button"
        aria-label={isPlaying ? "Pause Music" : "Play Music"}
        onClick={() => {
          if (error) {
            retryCount.current += 1;
            setError(false);
            setLoading(true);
            // Quick retry by recreating the component
            window.location.reload();
            return;
          }
          onTogglePlay(!isPlaying);
        }}
        className="relative flex items-center justify-center w-8 h-8 rounded-full bg-violet-600 hover:bg-violet-500 text-white transition-colors active:scale-90"
      >
        {loading ? (
          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : error ? (
          <span className="text-[10px] font-bold">!</span>
        ) : isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4 ml-0.5" />
        )}
      </button>

      {/* Visualizer bars */}
      <div className="flex items-end gap-[3px] h-4 w-6">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={`w-[3px] bg-pink-500 rounded-full transition-all duration-300 ${
              isPlaying && !loading ? "animate-soundwave" : "h-1"
            }`}
            style={{
              animationDelay: `${i * 0.15}s`,
              height: isPlaying ? undefined : "4px",
            }}
          />
        ))}
      </div>

      <div className="flex items-center gap-2 overflow-hidden">
        <button
          type="button"
          aria-label={isMuted ? "Unmute Music" : "Mute Music"}
          onClick={toggleMute}
          className="text-violet-300 hover:text-white transition-colors active:scale-90"
        >
          {isMuted || volume === 0 ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </button>

        <div
          className={`flex items-center transition-all duration-300 ${
            showVolumeSlider ? "w-20 opacity-100" : "w-0 opacity-0"
          }`}
        >
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            onTouchMove={handleVolumeChange}
            aria-label="Volume"
            className="w-16 h-1.5 bg-violet-900 rounded-lg appearance-none cursor-pointer accent-pink-500 touch-action-none"
            style={{
              WebkitAppearance: "none",
              appearance: "none",
            }}
          />
        </div>
      </div>

      {/* Error tooltip */}
      {error && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-red-900/90 text-[9px] text-red-200 whitespace-nowrap border border-red-500/30">
          Audio unavailable - tap to retry
        </div>
      )}
    </div>
  );
}
