'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CameraController } from './CameraController';
import { SceneManager, CompositorState } from './SceneManager';

interface WeddingWebGLProps {
  onLoaded?: () => void;
  stateRef?: React.MutableRefObject<CompositorState | null>;
}

function checkWebGLSupport(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const testCanvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
        (testCanvas.getContext('webgl2') ||
          testCanvas.getContext('webgl') ||
          testCanvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

export const WeddingWebGL: React.FC<WeddingWebGLProps> = ({ onLoaded, stateRef }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isInitializedRef = useRef(false);
  const [hasWebGLError, setHasWebGLError] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !canvasRef.current || !containerRef.current) return;
    if (isInitializedRef.current) return;

    if (!checkWebGLSupport()) {
      setHasWebGLError(true);
      if (onLoaded) onLoaded();
      return;
    }

    isInitializedRef.current = true;

    gsap.registerPlugin(ScrollTrigger);

    const container = containerRef.current;
    const canvas = canvasRef.current;

    const initialWidth = container.clientWidth || window.innerWidth;
    const initialHeight = container.clientHeight || window.innerHeight;
    const isMobileInitial = initialWidth < 640;

    // 1. WebGL Renderer with controlled DPR and graceful fallback
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: !isMobileInitial,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[WeddingWebGL] WebGLRenderer initialization failed:', err);
      }
      setHasWebGLError(true);
      if (onLoaded) onLoaded();
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, isMobileInitial ? 1.5 : 2.0);
    renderer.setPixelRatio(dpr);
    renderer.setSize(initialWidth, initialHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // 2. Camera Controller & 3D Scene Manager
    const cameraController = new CameraController(initialWidth, initialHeight);
    const sceneManager = new SceneManager(initialWidth, initialHeight, onLoaded);

    sceneManager.resize(
      initialWidth,
      initialHeight,
      cameraController.getFov(),
      cameraController.getBaseZ()
    );

    // Context loss / restoration & visibility management
    let isPaused = false;

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      isPaused = true;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };

    const handleContextRestored = () => {
      isPaused = false;
      lastRenderTime = performance.now();
      animationFrameId = requestAnimationFrame(render);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isPaused = true;
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
      } else {
        if (isPaused) {
          isPaused = false;
          lastRenderTime = performance.now();
          animationFrameId = requestAnimationFrame(render);
        }
      }
    };

    canvas.addEventListener('webglcontextlost', handleContextLost, false);
    canvas.addEventListener('webglcontextrestored', handleContextRestored, false);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 3. Map Page Scroll Progress to 3D Camera Depth Travel & Velocity
    let lastScrollY = window.scrollY;
    let lastScrollTime = performance.now();
    let currentVelocity = 0;

    const updateScrollProgress = () => {
      const scrollY = window.scrollY;
      const now = performance.now();
      const dt = Math.max(1, now - lastScrollTime);
      const deltaY = scrollY - lastScrollY;
      const instantVelocity = (deltaY / dt) * 1000;
      currentVelocity = THREE.MathUtils.lerp(currentVelocity, instantVelocity, 0.25);
      lastScrollY = scrollY;
      lastScrollTime = now;

      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      const progress = THREE.MathUtils.clamp(scrollY / maxScroll, 0, 1);
      cameraController.setScrollProgress(progress, currentVelocity);
    };

    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    updateScrollProgress();

    // 4. Mouse Pointer Tracking for Subtle 3D Parallax
    const mouseVector = new THREE.Vector2(0, 0);
    const handleMouseMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      mouseVector.set(nx, ny);
      cameraController.setMouse(nx, ny);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // 5. Responsive ResizeObserver on Container
    const applyResize = (w: number, h: number) => {
      if (w <= 0 || h <= 0) return;
      const isMob = w < 640;
      const newDpr = Math.min(window.devicePixelRatio || 1, isMob ? 1.5 : 2.0);
      renderer.setPixelRatio(newDpr);
      renderer.setSize(w, h, false);
      cameraController.resize(w, h);
      sceneManager.resize(w, h, cameraController.getFov(), cameraController.getBaseZ());
      updateScrollProgress();
    };

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        applyResize(Math.round(width), Math.round(height));
      }
    });

    resizeObserver.observe(container);

    // Fallback orientationchange & resize event listener
    const handleWindowResize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      applyResize(w, h);
    };

    window.addEventListener('resize', handleWindowResize, { passive: true });
    window.addEventListener('orientationchange', handleWindowResize, { passive: true });

    // 6. Main 60 FPS Render Loop with visibility & pause check
    let animationFrameId: number;
    let lastRenderTime = performance.now();
    const startTime = performance.now();

    const render = () => {
      if (isPaused) return;

      const now = performance.now();
      const delta = Math.min(0.1, (now - lastRenderTime) / 1000);
      lastRenderTime = now;
      const time = (now - startTime) / 1000;

      // Smooth decay of velocity when idle
      currentVelocity = THREE.MathUtils.lerp(currentVelocity, 0, 0.05);

      // Update camera smooth travel & parallax
      cameraController.update(delta);

      // Read current scroll progress
      const scrollY = window.scrollY;
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      const progress = THREE.MathUtils.clamp(scrollY / maxScroll, 0, 1);
      cameraController.setScrollProgress(progress, currentVelocity);

      // Update canonical scene compositor, shaders, and particle bridge
      sceneManager.update(time, currentVelocity, mouseVector);

      // Forward active state to Debug HUD if requested
      if (stateRef) {
        stateRef.current = sceneManager.getCurrentState();
      }

      // Render persistent single WebGL stage
      renderer.render(sceneManager.scene, cameraController.camera);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // 7. Cleanup
    return () => {
      isInitializedRef.current = false;
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('scroll', updateScrollProgress);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleWindowResize);
      window.removeEventListener('orientationchange', handleWindowResize);
      sceneManager.dispose();
      renderer.dispose();
    };
  }, [onLoaded, stateRef]);

  if (hasWebGLError) {
    return (
      <div
        aria-hidden="true"
        className="fixed inset-0 w-full h-[100svh] min-h-[100svh] pointer-events-none z-0 overflow-hidden bg-[#2A0C11]"
        style={{
          backgroundImage:
            'radial-gradient(ellipse at 50% 30%, rgba(200, 155, 60, 0.15) 0%, rgba(42, 12, 17, 0.95) 70%)',
        }}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="fixed inset-0 w-full h-[100svh] min-h-[100svh] pointer-events-none z-0 overflow-hidden select-none"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
};

export default WeddingWebGL;
