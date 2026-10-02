'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface CinematicLoaderProps {
  onComplete?: () => void;
}

export const CinematicLoader: React.FC<CinematicLoaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {

    // Check if user prefers reduced motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setProgress(100);
      setIsDone(true);
      if (onComplete) onComplete();
      return;
    }

    // Cinematic progress simulation: slow, measured pacing
    let current = 0;
    const interval = setInterval(() => {
      // Non-linear increments mimicking asset preparation
      const step = current < 30 ? 2 : current < 70 ? 1.5 : current < 90 ? 2.5 : 3;
      current = Math.min(100, current + step);
      setProgress(Math.floor(current));

      if (current >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsDone(true);
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 600);
        }, 350);
      }
    }, 45);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Preparing invitation"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] ${
        isDone ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        background: 'radial-gradient(ellipse at 50% 45%, #4A1018 0%, #2A0C11 75%, #18060A 100%)',
      }}
    >
      {/* Subtle background grain texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035] mix-blend-screen"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm">
        {/* Sacred temple motif ornament with gentle bloom */}
        <div
          className={`w-10 h-10 mb-8 transition-transform duration-1000 text-[#C89B3C] ${
            isDone ? 'scale-125 opacity-0' : 'scale-100 opacity-90'
          }`}
        >
          <Image
            src="/decorations/ornament.svg"
            alt=""
            width={40}
            height={40}
            className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(200,155,60,0.3)]"
            priority
          />
        </div>

        {/* Cinematic title label */}
        <p className="font-sans text-[10px] md:text-[11px] font-medium tracking-[0.22em] uppercase text-[#F7F0DF] mb-5 select-none opacity-90">
          Preparing Your Invitation
        </p>

        {/* Minimal gold progress bar */}
        <div className="w-48 sm:w-56 h-[1.5px] bg-[#4A1018] rounded-full overflow-hidden relative mb-4">
          <div
            className="h-full bg-gradient-to-r from-[#9C7628] via-[#C89B3C] to-[#FFFDF7] transition-all duration-150 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Progress percentage display in elegant serif */}
        <p className="font-serif italic text-sm text-[#C89B3C] tracking-widest select-none">
          {progress}%
        </p>
      </div>

      {/* Accessible skip link */}
      <button
        type="button"
        onClick={() => {
          setIsDone(true);
          if (onComplete) onComplete();
          if (typeof window !== 'undefined') {
            import('@/lib/audio-manager').then(({ audioManager }) => {
              if (audioManager.getPreference()) {
                audioManager.play().catch(() => {});
              }
            });
          }
        }}
        className="absolute bottom-8 text-[9px] font-sans uppercase tracking-[0.18em] text-[#C89B3C]/70 hover:text-[#C89B3C] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C89B3C] px-3 py-1"
      >
        Skip directly to invitation
      </button>
    </div>
  );
};

export default CinematicLoader;
