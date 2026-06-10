"use client";

import React, { useEffect, useRef } from "react";

interface FireworksProps {
  active: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  decay: number;
  size: number;
  gravity: number;
  friction: number;
}

interface Sparkler {
  x: number;
  y: number;
  tx: number;
  ty: number;
  vx: number;
  vy: number;
  color: string;
  speed: number;
  angle: number;
  reached: boolean;
}

const COLORS = [
  "#ff2a6d", // Hot pink
  "#05d9e8", // Cyan
  "#01012b", // Dark violet (glow base)
  "#f5a623", // Gold
  "#b10dc9", // Purple
  "#00ff66", // Neon green
];

export default function Fireworks({ active }: FireworksProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const sparklersRef = useRef<Sparkler[]>([]);

  useEffect(() => {
    if (!active) {
      particlesRef.current = [];
      sparklersRef.current = [];
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let animationFrameId: number;

    const createExplosion = (x: number, y: number, color: string) => {
      const particleCount = 60 + Math.floor(Math.random() * 40);
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6 + 2;
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color,
          alpha: 1,
          decay: Math.random() * 0.015 + 0.01,
          size: Math.random() * 2.5 + 1.5,
          gravity: 0.06,
          friction: 0.96,
        });
      }
    };

    const launchSparkler = () => {
      const startX = Math.random() * canvas.width;
      const startY = canvas.height;
      const targetX = Math.random() * canvas.width * 0.8 + canvas.width * 0.1;
      const targetY = Math.random() * canvas.height * 0.4 + canvas.height * 0.15;
      
      const angle = Math.atan2(targetY - startY, targetX - startX);
      const speed = Math.random() * 5 + 10;
      
      sparklersRef.current.push({
        x: startX,
        y: startY,
        tx: targetX,
        ty: targetY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        speed,
        angle,
        reached: false,
      });
    };

    let launchTimer = 0;

    const animate = () => {
      ctx.fillStyle = "rgba(10, 5, 27, 0.15)"; // Soft trails
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Launch new sparklers
      launchTimer++;
      if (launchTimer % 40 === 0) {
        launchSparkler();
      }

      // Update and draw sparklers
      for (let i = sparklersRef.current.length - 1; i >= 0; i--) {
        const s = sparklersRef.current[i];
        s.x += s.vx;
        s.y += s.vy;

        // Draw trail
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Check if reached destination
        const distToTarget = Math.hypot(s.tx - s.x, s.ty - s.y);
        // If close enough or heading downwards (overshot target)
        if (distToTarget < 20 || s.vy >= 0) {
          createExplosion(s.x, s.y, s.color);
          sparklersRef.current.splice(i, 1);
        }
      }

      // Update and draw particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.vx *= p.friction;
        p.vy *= p.friction;
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        
        // Add subtle neon glow
        ctx.shadowBlur = 6;
        ctx.shadowColor = p.color;
        
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    // Spawn a couple right away
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        if (active) launchSparkler();
      }, i * 400);
    }

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-30"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
