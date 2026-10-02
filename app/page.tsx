'use client';

import React, { useEffect, useRef, useState } from 'react';
import CinematicLoader from '@/components/design/CinematicLoader';
import ProgressNavigation from '@/components/design/ProgressNavigation';
import MusicControl from '@/components/shared/MusicControl';
import Hero from '@/components/design/Hero';
import CountdownSection from '@/components/design/CountdownSection';
import EventsVisualSection from '@/components/design/EventsVisualSection';
import RSVPSection from '@/components/design/RSVPSection';
import PenugondaScene from '@/components/design/PenugondaScene';
import ClosingSection from '@/components/design/ClosingSection';
import WeddingWebGL from '@/components/experience/WeddingWebGL';
import MotionDebugHUD from '@/components/experience/MotionDebugHUD';
import AssetDebugPanel from '@/components/experience/AssetDebugPanel';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import BackToBeginning from '@/components/shared/BackToBeginning';
import { CompositorState } from '@/components/experience/SceneManager';
import { initSmoothScroll } from '@/lib/motion';

export default function Home() {
  const [isReady, setIsReady] = useState(false);
  const compositorStateRef = useRef<CompositorState | null>(null);

  // Initialize Lenis smooth scroll coordinated with GSAP ScrollTrigger
  useEffect(() => {
    const cleanup = initSmoothScroll();
    return () => {
      cleanup();
    };
  }, []);

  return (
    <ErrorBoundary>
      <main className="relative min-h-screen bg-[#2A0C11] text-[#F7F0DF] antialiased overflow-x-hidden selection:bg-[#C89B3C] selection:text-[#2A0C11]">
        {/* =========================================================
            SINGLE PERSISTENT WEBGL WORLD
            Image Planes, 3D Spatial Depth Travel, GPU Particles,
            Procedural Distortion Shaders & Continuous Camera Motion
        ========================================================= */}
        <WeddingWebGL stateRef={compositorStateRef} />

        {/* Motion Debug HUD (Active only if URL contains ?motionDebug=1) */}
        <MotionDebugHUD stateRef={compositorStateRef} />

        {/* Asset Diagnostics Panel (Active only if URL contains ?assetDebug=1) */}
        <AssetDebugPanel />

        {/* 00 PRELOADER — Cinematic Asset & Font Preparation */}
        <CinematicLoader onComplete={() => setIsReady(true)} />

        {/* Background Wedding Music Control (Muted/Off by default) */}
        <MusicControl />

        {/* Floating Return to Top Button (Appears past Hero) */}
        <BackToBeginning />

        {/* Chapter Progress Navigation (01 - 06) with Animated Chapter Transitions */}
        <ProgressNavigation currentSection="beginning" />

        {/* =========================================================
            DOM LAYER: Semantic Text, Anchors, Form, Accessibility
        ========================================================= */}
        {/* 01 BEGINNING — Cinematic Hero Spatial Anchor */}
        <Hero isReady={isReady} />

        {/* 02 COUNTDOWN — Live Timer over Seshachalam Hills Depth */}
        <CountdownSection />

        {/* 03 EVENTS — Haldi & Sangeeth, Bride-to-be Celebration, Wedding Ceremony */}
        <EventsVisualSection />

        {/* 04 JOIN — Glassmorphism RSVP Form over Deepam Atmosphere */}
        <RSVPSection />

        {/* 05 VENUE — The Wedding / Penugonda */}
        <PenugondaScene />

        {/* 06 CLOSING — Final Benediction & Names */}
        <ClosingSection />
      </main>
    </ErrorBoundary>
  );
}
