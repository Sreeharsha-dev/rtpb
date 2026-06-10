"use client";

import React, { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Play, Pause, Music } from "lucide-react";

interface MusicPlayerProps {
  isPlaying: boolean;
  onTogglePlay: (playing: boolean) => void;
  audioUrl?: string;
}

export default function MusicPlayer({
  isPlaying,
  onTogglePlay,
  audioUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3", // Nice ambient synth/piano instrumental track
}: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  useEffect(() => {
    // Create audio element
    const audio = new Audio(audioUrl);
    audio.loop = true;
    audio.volume = volume;
    audioRef.current = audio;

    // Handle user gestures (browsers require user gesture to play)
    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.log("Audio play failed, waiting for user gesture:", error);
          onTogglePlay(false);
        });
      }
    }

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [audioUrl]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(() => {
        onTogglePlay(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (vol > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div 
      className="fixed bottom-6 left-6 z-50 flex items-center gap-3 px-4 py-2.5 rounded-full bg-slate-950/45 backdrop-blur-xl border border-violet-500/30 text-white shadow-lg shadow-violet-950/20 transition-all hover:scale-105"
      onMouseEnter={() => setShowVolumeSlider(true)}
      onMouseLeave={() => setShowVolumeSlider(false)}
    >
      <button
        type="button"
        aria-label={isPlaying ? "Pause Music" : "Play Music"}
        onClick={() => onTogglePlay(!isPlaying)}
        className="relative flex items-center justify-center w-8 h-8 rounded-full bg-violet-600 hover:bg-violet-500 text-white transition-colors"
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
      </button>

      {/* Visualizer bars */}
      <div className="flex items-end gap-[3px] h-4 w-6">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={`w-[3px] bg-pink-500 rounded-full transition-all duration-300 ${
              isPlaying ? "animate-soundwave" : "h-1"
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
          className="text-violet-300 hover:text-white transition-colors"
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
            aria-label="Volume"
            className="w-16 h-1 bg-violet-900 rounded-lg appearance-none cursor-pointer accent-pink-500"
          />
        </div>
      </div>
    </div>
  );
}
