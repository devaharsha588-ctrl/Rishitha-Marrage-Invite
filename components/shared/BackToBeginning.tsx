'use client';

import React, { useEffect, useState } from 'react';
import { scrollToSection } from '@/lib/motion';

/**
 * Fixed "BACK TO BEGINNING ↑" navigation button (Section 27 & 29)
 *
 * Requirements:
 * - Hidden near top (scrollY < 400px)
 * - Fades in smoothly after scrolling past the hero section
 * - Smoothly scrolls back to #beginning
 * - Safe-area inset aware positioning
 * - Minimum 44px touch target
 * - No collision with top HUD (Music & Chapter navigation)
 */
export const BackToBeginning: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsVisible(scrollY > 450);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleClick = () => {
    scrollToSection('beginning');
  };

  return (
    <div
      className={`fixed z-40 select-none transition-all duration-300 ${
        isVisible ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none translate-y-2'
      }`}
      style={{
        bottom: 'calc(20px + env(safe-area-inset-bottom, 0px))',
        right: 'calc(16px + env(safe-area-inset-right, 0px))',
      }}
    >
      <button
        type="button"
        onClick={handleClick}
        aria-label="Back to beginning of invitation"
        className="min-h-[44px] px-3.5 py-2 rounded-full backdrop-blur-md border bg-[#2A0C11]/75 text-[#F7F0DF] border-[#C89B3C]/40 hover:border-[#C89B3C] hover:bg-[#2A0C11]/90 shadow-lg flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C89B3C] active:scale-95 transition-all duration-200"
      >
        <span className="font-sans text-[10px] sm:text-[11px] font-medium tracking-[0.18em] uppercase">
          Back to Beginning
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#C89B3C"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M18 15l-6-6-6 6" />
        </svg>
      </button>
    </div>
  );
};

export default BackToBeginning;
