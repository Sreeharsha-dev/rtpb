"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface ThreeGiftBoxProps {
  onOpen: () => void;
}

export default function ThreeGiftBox({ onOpen }: ThreeGiftBoxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // Dimensions
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2.5, 6);
    camera.lookAt(0, 0, 0);

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

    const dirLight1 = new THREE.DirectionalLight(0xff79c6, 1.4); // Pink light
    dirLight1.position.set(5, 5, 2);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x8be9fd, 1.3); // Cyan light
    dirLight2.position.set(-5, 3, 3);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xffb86c, 1.5, 10); // Warm gold light inside
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    // Main Gift Box Group
    const giftGroup = new THREE.Group();
    scene.add(giftGroup);

    // Materials
    // Matte dark indigo/violet for the box base & lid
    const boxMaterial = new THREE.MeshStandardMaterial({
      color: 0x1d1145,
      roughness: 0.3,
      metalness: 0.1,
    });
    
    // Metallic gold for ribbons and bow
    const ribbonMaterial = new THREE.MeshStandardMaterial({
      color: 0xffb86c,
      roughness: 0.2,
      metalness: 0.8,
    });

    // Clone materials for the lid to enable fading without affecting the base
    const lidBoxMaterial = boxMaterial.clone();
    const lidRibbonMaterial = ribbonMaterial.clone();

    // Inner glowing core material (soft gold)
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xfff0b3,
      transparent: true,
      opacity: 0,
    });

    // 1. Box Base
    const baseGeo = new THREE.BoxGeometry(2, 2, 2);
    const boxBase = new THREE.Mesh(baseGeo, boxMaterial);
    giftGroup.add(boxBase);

    // 2. Base Ribbons (Vertical crosses)
    const ribVert1Geo = new THREE.BoxGeometry(2.05, 2.05, 0.25);
    const ribVert1 = new THREE.Mesh(ribVert1Geo, ribbonMaterial);
    giftGroup.add(ribVert1);

    const ribVert2Geo = new THREE.BoxGeometry(0.25, 2.05, 2.05);
    const ribVert2 = new THREE.Mesh(ribVert2Geo, ribbonMaterial);
    giftGroup.add(ribVert2);

    // 3. Gift Lid Group (Lid, Lid Ribbons, Bow)
    const lidGroup = new THREE.Group();
    lidGroup.position.y = 1.05; // Resting on the base
    giftGroup.add(lidGroup);

    const lidGeo = new THREE.BoxGeometry(2.2, 0.4, 2.2);
    const boxLid = new THREE.Mesh(lidGeo, lidBoxMaterial);
    boxLid.position.y = 0.2; // Pivot at center
    lidGroup.add(boxLid);

    // Lid ribbons
    const lidRib1Geo = new THREE.BoxGeometry(2.25, 0.45, 0.27);
    const lidRib1 = new THREE.Mesh(lidRib1Geo, lidRibbonMaterial);
    lidRib1.position.y = 0.2;
    lidGroup.add(lidRib1);

    const lidRib2Geo = new THREE.BoxGeometry(0.27, 0.45, 2.25);
    const lidRib2 = new THREE.Mesh(lidRib2Geo, lidRibbonMaterial);
    lidRib2.position.y = 0.2;
    lidGroup.add(lidRib2);

    // Ribbon Bow
    const bowGroup = new THREE.Group();
    bowGroup.position.set(0, 0.4, 0);
    lidGroup.add(bowGroup);

    // Bow loops (Torus)
    const bowLoopGeo = new THREE.TorusGeometry(0.3, 0.08, 8, 24);
    
    const bowLoop1 = new THREE.Mesh(bowLoopGeo, lidRibbonMaterial);
    bowLoop1.position.set(-0.25, 0.15, 0);
    bowLoop1.rotation.set(0, Math.PI / 4, Math.PI / 4);
    bowGroup.add(bowLoop1);

    const bowLoop2 = new THREE.Mesh(bowLoopGeo, lidRibbonMaterial);
    bowLoop2.position.set(0.25, 0.15, 0);
    bowLoop2.rotation.set(0, -Math.PI / 4, -Math.PI / 4);
    bowGroup.add(bowLoop2);

    // Bow tails
    const bowTailGeo = new THREE.ConeGeometry(0.08, 0.5, 4);
    const bowTail1 = new THREE.Mesh(bowTailGeo, lidRibbonMaterial);
    bowTail1.position.set(-0.15, 0, 0.2);
    bowTail1.rotation.set(Math.PI / 6, 0, Math.PI / 4);
    bowGroup.add(bowTail1);

    const bowTail2 = new THREE.Mesh(bowTailGeo, lidRibbonMaterial);
    bowTail2.position.set(0.15, 0, 0.2);
    bowTail2.rotation.set(Math.PI / 6, 0, -Math.PI / 4);
    bowGroup.add(bowTail2);

    // 4. Glow inside Box
    const glowGeo = new THREE.SphereGeometry(0.9, 16, 16);
    const innerGlow = new THREE.Mesh(glowGeo, glowMaterial);
    giftGroup.add(innerGlow);

    // 5. Rise particles (for blowout animation)
    const particleCount = 20;
    const particles: THREE.Mesh[] = [];
    const pGeo = new THREE.SphereGeometry(0.08, 8, 8);
    const pMat = new THREE.MeshBasicMaterial({ color: 0xffb86c, transparent: true });

    for (let i = 0; i < particleCount; i++) {
      const p = new THREE.Mesh(pGeo, pMat.clone());
      p.position.set(
        (Math.random() - 0.5) * 1.5,
        Math.random() * 0.5 - 0.5,
        (Math.random() - 0.5) * 1.5
      );
      p.visible = false;
      giftGroup.add(p);
      particles.push(p);
    }

    // Interactive Mouse Tracking for rotation tilt
    let mouse = { x: 0, y: 0 };
    let targetRotation = { x: 0, y: 0 };
    let isMouseOver = false;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      
      targetRotation.y = mouse.x * 0.45;
      targetRotation.x = -mouse.y * 0.35;
      isMouseOver = true;
    };

    const handlePointerLeave = () => {
      isMouseOver = false;
      targetRotation.x = 0;
      targetRotation.y = 0;
    };

    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerleave", handlePointerLeave);

    // Animation Loop
    let clock = new THREE.Clock();
    let isOpening = false;
    let clickedTime = -1;

    const animate = () => {
      const time = clock.getElapsedTime();
      
      if (!isOpening) {
        // Complex layered floating motion (slow breathing/drift)
        const floatOffset = Math.sin(time * 1.3) * 0.12 + Math.cos(time * 0.6) * 0.04;
        giftGroup.position.y = floatOffset;
        
        // Smoothly interpolate rotation to follow mouse
        giftGroup.rotation.y += (targetRotation.y - giftGroup.rotation.y) * 0.06 + 0.003;
        giftGroup.rotation.x += (targetRotation.x - giftGroup.rotation.x) * 0.06;
        giftGroup.rotation.z = Math.sin(time * 0.4) * 0.015;
      } else {
        // Opening animation sequence
        const elapsed = time - clickedTime;
        
        if (elapsed < 0.35) {
          // 1. Squash & Stretch Anticipation
          const ratio = elapsed / 0.35;
          const squashY = 1 - Math.sin(ratio * Math.PI) * 0.16;
          const stretchXZ = 1 + Math.sin(ratio * Math.PI) * 0.08;
          giftGroup.scale.set(stretchXZ, squashY, stretchXZ);
          
          // Shaking
          giftGroup.rotation.z = Math.sin(elapsed * 60) * 0.05;
          giftGroup.position.y = -Math.sin(ratio * Math.PI) * 0.08;
        } else {
          // 2. Release & Fly Off (Elastic spring)
          const t = elapsed - 0.35;
          
          // Base bounce response
          const baseScaleY = 1 + Math.exp(-t * 3.8) * Math.sin(t * 12) * 0.14;
          const baseScaleXZ = 1 - Math.exp(-t * 3.8) * Math.sin(t * 12) * 0.05;
          giftGroup.scale.set(baseScaleXZ, baseScaleY, baseScaleXZ);
          
          // Smoothly pull rotation to zero
          giftGroup.position.y += (0 - giftGroup.position.y) * 0.05;
          giftGroup.rotation.y += (0 - giftGroup.rotation.y) * 0.08;
          giftGroup.rotation.x += (0 - giftGroup.rotation.x) * 0.08;
          giftGroup.rotation.z += (0 - giftGroup.rotation.z) * 0.08;
          
          // Elastic spring lid flight
          const lidSpring = 1 - Math.exp(-t * 3.2) * Math.cos(t * 8);
          lidGroup.position.y = 1.05 + lidSpring * 3.5;
          lidGroup.position.z = lidSpring * 2.2;
          
          // Spin as it shoots off
          lidGroup.rotation.x = -lidSpring * Math.PI * 0.65;
          lidGroup.rotation.y = lidSpring * Math.PI * 0.45;
          lidGroup.rotation.z = lidSpring * Math.PI * 0.2;
          
          // Fade lid materials out
          const opacity = Math.max(0, 1 - t * 0.85);
          lidBoxMaterial.transparent = true;
          lidRibbonMaterial.transparent = true;
          lidBoxMaterial.opacity = opacity;
          lidRibbonMaterial.opacity = opacity;
          
          // Glow scaling & revealing inside
          (innerGlow.material as THREE.MeshBasicMaterial).opacity = Math.min(0.95, t * 1.6);
          const glowScale = 1.0 + Math.min(1.8, t * 2.2);
          innerGlow.scale.setScalar(glowScale);
          
          // Particle rise physics
          particles.forEach((p, idx) => {
            if (!p.visible) {
              p.visible = true;
              p.position.y = 0.5;
            }
            p.position.y += 0.045 + Math.sin(time * 1.5 + idx) * 0.012;
            p.position.x += Math.sin(time * 2.2 + idx) * 0.016;
            p.position.z += Math.cos(time * 2.2 + idx) * 0.016;
            const pMat = p.material as THREE.MeshBasicMaterial;
            pMat.opacity = Math.max(0, 1 - (p.position.y / 2.8));
          });
        }
      }

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // Click trigger opening
    const handleBoxClick = () => {
      if (isOpening) return;
      setClicked(true);
      isOpening = true;
      clickedTime = clock.getElapsedTime();
      
      // Delay transition to next page
      setTimeout(() => {
        onOpen();
      }, 2300);
    };

    container.addEventListener("click", handleBoxClick);

    // Clean up
    return () => {
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("resize", handleResize);
      if (container) {
        container.removeEventListener("click", handleBoxClick);
      }
      
      // Dispose geometry/materials
      baseGeo.dispose();
      ribVert1Geo.dispose();
      ribVert2Geo.dispose();
      lidGeo.dispose();
      lidRib1Geo.dispose();
      lidRib2Geo.dispose();
      bowLoopGeo.dispose();
      bowTailGeo.dispose();
      glowGeo.dispose();
      pGeo.dispose();

      boxMaterial.dispose();
      ribbonMaterial.dispose();
      lidBoxMaterial.dispose();
      lidRibbonMaterial.dispose();
      glowMaterial.dispose();
      pMat.dispose();
      
      renderer.dispose();
    };
  }, [onOpen]);

  return (
    <div
      ref={containerRef}
      className="w-full h-64 max-w-xs mx-auto cursor-pointer relative group flex items-center justify-center"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
      {!clicked && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-violet-950/80 backdrop-blur-md border border-violet-500/40 text-violet-200 text-xs font-semibold uppercase tracking-wider animate-pulse group-hover:scale-105 transition-all">
          Tap Box to Open ✨
        </div>
      )}
    </div>
  );
}
