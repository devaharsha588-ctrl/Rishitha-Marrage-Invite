'use client';

import React, { useEffect, useState } from 'react';
import { audioManager } from '@/lib/audio-manager';

/**
 * Global Background Wedding Music Control
 *
 * Requirements:
 * - Single persistent Audio instance across all routes and sections
 * - Initial state: MUSIC OFF (no unprompted autoplay with sound)
 * - Remembers user preference in localStorage ('wedding-music-enabled')
 * - Fades volume: 0 -> 0.35 over ~1s on play, 0.35 -> 0 over ~0.65s on pause
 * - Subtle 0.3s UI transition; no bounce or spinning icon
 * - Accessible aria-labels and keyboard focus rings
 * - Safe-area inset aware positioning on mobile and desktop
 */
export const MusicControl: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    // Subscribe to global audio state
    const unsubscribe = audioManager.subscribe((playing) => {
      setIsPlaying(playing);
    });

    // If user previously opted in, listen for first user interaction to resume
    audioManager.setupInteractionAutoResume();

    return () => {
      unsubscribe();
    };
  }, []);

  const handleToggle = () => {
    audioManager.toggle().catch((err) => {
      console.error('[MUSIC FAILED]', err);
    });
  };

  return (
    <div
      className="fixed z-40 select-none"
      style={{
        top: 'calc(14px + env(safe-area-inset-top, 0px))',
        left: 'calc(16px + env(safe-area-inset-left, 0px))',
      }}
    >
      <button
        type="button"
        onClick={handleToggle}
        aria-label={isPlaying ? 'Turn music off' : 'Turn music on'}
        className="min-h-[44px] px-3.5 py-2 rounded-full backdrop-blur-md transition-all duration-300 border bg-[#2A0C11]/70 text-[#F7F0DF] border-[#C89B3C]/40 hover:border-[#C89B3C] hover:bg-[#2A0C11]/85 shadow-lg flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C89B3C]"
      >
        {/* Minimal speaker indicator */}
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-colors duration-300 ${isPlaying ? 'text-[#C89B3C]' : 'text-[#F7F0DF]/60'}`}
          aria-hidden="true"
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill={isPlaying ? 'currentColor' : 'none'} />
          {isPlaying ? (
            <>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </>
          ) : (
            <line x1="23" y1="9" x2="17" y2="15" />
          )}
        </svg>

        <span className="font-sans text-[10px] sm:text-[11px] font-medium tracking-[0.18em] uppercase">
          {isPlaying ? 'MUSIC ON' : 'MUSIC OFF'}
        </span>
      </button>
    </div>
  );
};

export default MusicControl;
