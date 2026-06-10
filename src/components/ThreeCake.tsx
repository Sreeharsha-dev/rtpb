"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface ThreeCakeProps {
  candlesBlown: boolean;
  onBlowOut: () => void;
}

export default function ThreeCake({ candlesBlown, onBlowOut }: ThreeCakeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Track candlesBlown using a Ref so the animation loop can check it continuously 
  // without rebuilding/restarting the Three.js scene.
  const candlesBlownRef = useRef(candlesBlown);
  useEffect(() => {
    candlesBlownRef.current = candlesBlown;
  }, [candlesBlown]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // Dimensions
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2.5, 5.5);
    camera.lookAt(0, 0.2, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xff79c6, 1.3); // Pink light
    dirLight1.position.set(5, 5, 2);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x8be9fd, 1.1); // Cyan light
    dirLight2.position.set(-5, 4, 3);
    scene.add(dirLight2);

    const cakeGroup = new THREE.Group();
    cakeGroup.position.y = -0.6; // center it nicely
    scene.add(cakeGroup);

    // Materials
    const pinkCreamMaterial = new THREE.MeshStandardMaterial({
      color: 0xffa3d1, // Pastel pink frosting
      roughness: 0.4,
      metalness: 0.05,
    });

    const whiteCreamMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff, // White icing/details
      roughness: 0.3,
      metalness: 0.05,
    });

    const goldTrimMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd700, // Gold details
      roughness: 0.2,
      metalness: 0.8,
    });

    const candleMaterial = new THREE.MeshStandardMaterial({
      color: 0x8be9fd, // Striped cyan candles
      roughness: 0.4,
      metalness: 0.1,
    });

    const flameMaterial = new THREE.MeshBasicMaterial({
      color: 0xffb86c, // Glowing warm flame
      transparent: true,
    });

    // 1. Stand/Plate
    const plateGeo = new THREE.CylinderGeometry(1.6, 1.7, 0.15, 32);
    const plate = new THREE.Mesh(plateGeo, goldTrimMaterial);
    plate.position.y = 0.075;
    cakeGroup.add(plate);

    // 2. Bottom Tier (Pastel Pink)
    const bottomTierGeo = new THREE.CylinderGeometry(1.3, 1.3, 0.7, 32);
    const bottomTier = new THREE.Mesh(bottomTierGeo, pinkCreamMaterial);
    bottomTier.position.y = 0.5;
    cakeGroup.add(bottomTier);

    // Bottom tier decoration (piping creams on base)
    const pipingCount = 20;
    const pipingGeo = new THREE.SphereGeometry(0.08, 8, 8);
    for (let i = 0; i < pipingCount; i++) {
      const angle = (i / pipingCount) * Math.PI * 2;
      const pipe = new THREE.Mesh(pipingGeo, whiteCreamMaterial);
      pipe.position.set(Math.cos(angle) * 1.32, 0.85, Math.sin(angle) * 1.32);
      cakeGroup.add(pipe);
    }

    // 3. Top Tier (White/Cream)
    const topTierGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.6, 32);
    const topTier = new THREE.Mesh(topTierGeo, whiteCreamMaterial);
    topTier.position.y = 1.15;
    cakeGroup.add(topTier);

    // Top tier decorations (cherries)
    const cherryGeo = new THREE.SphereGeometry(0.06, 8, 8);
    const cherryMat = new THREE.MeshStandardMaterial({ color: 0xff5555, roughness: 0.1 });
    const cherryCount = 8;
    for (let i = 0; i < cherryCount; i++) {
      const angle = (i / cherryCount) * Math.PI * 2;
      const cherry = new THREE.Mesh(cherryGeo, cherryMat);
      cherry.position.set(Math.cos(angle) * 0.8, 1.48, Math.sin(angle) * 0.8);
      cakeGroup.add(cherry);
    }

    // 4. Candles & Flames
    const candles: THREE.Mesh[] = [];
    const flames: THREE.Mesh[] = [];
    const candleCount = 5;

    const candleGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.4, 8);
    const flameGeo = new THREE.ConeGeometry(0.05, 0.18, 8);
    // Offset standard pivot of cone to its base
    flameGeo.translate(0, 0.09, 0);

    for (let i = 0; i < candleCount; i++) {
      const angle = (i / candleCount) * Math.PI * 2;
      const radius = 0.55;

      const candle = new THREE.Mesh(candleGeo, candleMaterial);
      candle.position.set(Math.cos(angle) * 0.85 * radius, 1.65, Math.sin(angle) * 0.85 * radius); // cluster slightly
      cakeGroup.add(candle);
      candles.push(candle);

      const flame = new THREE.Mesh(flameGeo, flameMaterial.clone());
      flame.position.set(Math.cos(angle) * 0.85 * radius, 1.85, Math.sin(angle) * 0.85 * radius);
      cakeGroup.add(flame);
      flames.push(flame);
    }

    // 5. Smoke Particles Group
    const smokeParticles: THREE.Mesh[] = [];
    const smokeGeo = new THREE.SphereGeometry(0.05, 8, 8);
    const smokeMat = new THREE.MeshBasicMaterial({
      color: 0xdddddd,
      transparent: true,
      opacity: 0,
    });

    for (let i = 0; i < 18; i++) {
      const smoke = new THREE.Mesh(smokeGeo, smokeMat.clone());
      smoke.visible = false;
      cakeGroup.add(smoke);
      smokeParticles.push(smoke);
    }

    // Interactive mouse rotation tracking
    let mouse = { x: 0, y: 0 };
    let targetRotation = { x: 0, y: 0 };
    let isMouseOver = false;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      
      targetRotation.y = mouse.x * 0.45;
      targetRotation.x = -mouse.y * 0.25;
      isMouseOver = true;
    };

    const handlePointerLeave = () => {
      isMouseOver = false;
      targetRotation.x = 0;
      targetRotation.y = 0;
    };

    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerleave", handlePointerLeave);

    // Animation variables
    let clock = new THREE.Clock();
    let isBlown = candlesBlownRef.current;
    let blowoutTime = isBlown ? 0 : -1;
    let smokeTimer = 0;

    const animate = () => {
      const time = clock.getElapsedTime();

      // Smooth cake rotation & float
      const floatOffset = Math.sin(time * 1.2) * 0.06 + Math.cos(time * 0.6) * 0.02;
      cakeGroup.position.y = -0.6 + floatOffset;
      
      cakeGroup.rotation.y += (targetRotation.y - cakeGroup.rotation.y) * 0.06 + 0.003;
      cakeGroup.rotation.x += (targetRotation.x - cakeGroup.rotation.x) * 0.06;

      // Check for blowout state transition in active loop
      if (candlesBlownRef.current && !isBlown) {
        isBlown = true;
        blowoutTime = time;
      }

      if (!isBlown) {
        // Normal flickering animation
        flames.forEach((flame, index) => {
          flame.visible = true;
          const scale = 1.0 + Math.sin(time * 22 + index * 4) * 0.16;
          flame.scale.set(scale, scale * 1.25, scale);
          flame.position.y = 1.85 + Math.sin(time * 14 + index) * 0.008;
        });
      } else {
        const elapsed = time - blowoutTime;
        
        // 1. Recoil bounce effect (cake squashes down slightly when blown)
        if (elapsed < 0.35) {
          const ratio = elapsed / 0.35;
          const squash = 1 - Math.sin(ratio * Math.PI) * 0.06;
          const stretch = 1 + Math.sin(ratio * Math.PI) * 0.02;
          cakeGroup.scale.set(stretch, squash, stretch);
        } else {
          cakeGroup.scale.set(1, 1, 1);
        }

        // 2. Wind-delayed flame extinguish (individual flame scale-out)
        flames.forEach((flame, index) => {
          const flameDelay = index * 0.06; // sequential wind propagation
          if (elapsed > flameDelay) {
            const flameT = Math.min(1.0, (elapsed - flameDelay) / 0.22);
            const scale = 1.0 - flameT;
            const flicker = scale * (1.0 + Math.sin(time * 35 + index) * 0.15);
            flame.scale.set(flicker, flicker * 1.2, flicker);
            
            if (scale <= 0) {
              flame.visible = false;
            }
          } else {
            // normal flickering before wind reaches it
            const scale = 1.0 + Math.sin(time * 22 + index * 4) * 0.16;
            flame.scale.set(scale, scale * 1.25, scale);
          }
        });

        // 3. Smoke Drift Particle physics
        if (smokeTimer < 75) {
          smokeTimer++;
          smokeParticles.forEach((smoke, idx) => {
            if (!smoke.visible) {
              smoke.visible = true;
              const c = candles[Math.floor(Math.random() * candleCount)];
              smoke.position.set(c.position.x, 1.9, c.position.z);
              (smoke.material as THREE.MeshBasicMaterial).opacity = 0.85;
              smoke.scale.setScalar(1);
            }

            smoke.position.y += 0.025 + Math.sin(time * 2 + idx) * 0.006;
            smoke.position.x += Math.sin(time * 2.8 + idx) * 0.012;
            smoke.position.z += Math.cos(time * 2.8 + idx) * 0.012;
            smoke.scale.multiplyScalar(1.012);
            
            const mat = smoke.material as THREE.MeshBasicMaterial;
            mat.opacity = Math.max(0, mat.opacity - 0.015);
            if (mat.opacity <= 0) {
              smoke.visible = false;
            }
          });
        }
      }

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    // Resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    const handleCakeClick = () => {
      if (candlesBlownRef.current) return;
      onBlowOut();
    };

    container.addEventListener("click", handleCakeClick);

    // Clean up
    return () => {
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("resize", handleResize);
      if (container) {
        container.removeEventListener("click", handleCakeClick);
      }

      // Dispose
      plateGeo.dispose();
      bottomTierGeo.dispose();
      pipingGeo.dispose();
      topTierGeo.dispose();
      cherryGeo.dispose();
      candleGeo.dispose();
      flameGeo.dispose();
      smokeGeo.dispose();

      pinkCreamMaterial.dispose();
      whiteCreamMaterial.dispose();
      goldTrimMaterial.dispose();
      candleMaterial.dispose();
      flameMaterial.dispose();
      cherryMat.dispose();
      smokeMat.dispose();
      
      renderer.dispose();
    };
  }, [onBlowOut]);

  return (
    <div
      ref={containerRef}
      className="w-full h-64 max-w-xs mx-auto cursor-pointer relative group flex items-center justify-center"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
      {!candlesBlown && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-violet-950/80 backdrop-blur-md border border-violet-500/40 text-violet-200 text-xs font-semibold uppercase tracking-wider animate-pulse group-hover:scale-105 transition-all">
          Tap Cake to Blow Candles! 🎂💨
        </div>
      )}
    </div>
  );
}
