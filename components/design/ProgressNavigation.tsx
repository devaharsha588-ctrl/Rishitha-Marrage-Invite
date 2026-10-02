'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { wedding, WeddingChapter } from '@/lib/wedding-config';
import { TIMING, EASING, prefersReducedMotion, scrollToSection } from '@/lib/motion';
import { scrambleText, setupMagneticElement } from '@/components/experience/interaction';

interface ProgressNavigationProps {
  currentSection?: string;
}

export const ProgressNavigation: React.FC<ProgressNavigationProps> = ({
  currentSection = 'beginning',
}) => {
  const [activeId, setActiveId] = useState<string>(currentSection);
  const [displayedChapter, setDisplayedChapter] = useState<WeddingChapter>(
    () => wedding.chapters.find((c) => c.id === currentSection) || wedding.chapters[0]
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const labelContainerRef = useRef<HTMLDivElement>(null);
  const labelTextRef = useRef<HTMLSpanElement>(null);
  const pillBtnRef = useRef<HTMLButtonElement>(null);
  const isTransitioningRef = useRef(false);

  // Register ScrollTrigger for active section detection
  useEffect(() => {
    if (typeof window === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    const triggers: ScrollTrigger[] = [];

    const sectionSelectors: Record<string, string[]> = {
      beginning: ['beginning', 'hero'],
      countdown: ['countdown'],
      events: ['events'],
      join: ['join', 'rsvp'],
      venue: ['venue'],
      closing: ['closing'],
    };

    wedding.chapters.forEach((chapter) => {
      const candidates = sectionSelectors[chapter.id] || [chapter.id];
      let targetEl: HTMLElement | null = null;

      for (const id of candidates) {
        const el = document.getElementById(id);
        if (el) {
          targetEl = el;
          break;
        }
      }

      if (targetEl) {
        const trigger = ScrollTrigger.create({
          trigger: targetEl,
          start: 'top 50%',
          end: 'bottom 50%',
          onEnter: () => {
            setActiveId(chapter.id);
          },
          onEnterBack: () => {
            setActiveId(chapter.id);
          },
        });
        triggers.push(trigger);
      }
    });

    const cleanupMagnetic = setupMagneticElement(pillBtnRef.current, 2);

    return () => {
      triggers.forEach((t) => t.kill());
      cleanupMagnetic();
    };
  }, []);

  // Animate chapter transition inside HUD pill
  useEffect(() => {
    const nextChapter = wedding.chapters.find((c) => c.id === activeId);
    if (!nextChapter || nextChapter.id === displayedChapter.id) return;

    if (prefersReducedMotion() || !labelContainerRef.current) {
      setDisplayedChapter(nextChapter);
      return;
    }

    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    const container = labelContainerRef.current;

    gsap.to(container, {
      opacity: 0,
      y: -6,
      duration: TIMING.FAST,
      ease: EASING.IMAGE_MOVE,
      onComplete: () => {
        setDisplayedChapter(nextChapter);
        scrambleText(labelTextRef.current, nextChapter.label, 0.35);

        gsap.fromTo(
          container,
          { opacity: 0, y: 6 },
          {
            opacity: 1,
            y: 0,
            duration: TIMING.FAST,
            ease: EASING.PRIMARY_REVEAL,
            onComplete: () => {
              isTransitioningRef.current = false;
            },
          }
        );
      },
    });
  }, [activeId, displayedChapter]);

  const handleChapterClick = (chapter: WeddingChapter, e: React.MouseEvent) => {
    e.preventDefault();
    setIsMenuOpen(false);

    const targetEl =
      document.getElementById(chapter.id) ||
      (chapter.id === 'beginning' ? document.getElementById('hero') : null) ||
      (chapter.id === 'join' ? document.getElementById('rsvp') : null);

    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth' });
    } else {
      scrollToSection(chapter.id);
    }
  };

  return (
    <>
      {/* Fixed Top-Right Spatial HUD Pill (Section 8 & 9) */}
      <div
        className="fixed z-40 select-none"
        style={{
          top: 'calc(14px + env(safe-area-inset-top, 0px))',
          right: 'calc(16px + env(safe-area-inset-right, 0px))',
        }}
      >
        <button
          ref={pillBtnRef}
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-expanded={isMenuOpen}
          aria-label={`Current scene: ${displayedChapter.number} · ${displayedChapter.label}. Click to choose chapter.`}
          className="min-h-[44px] group px-3.5 sm:px-4 py-2 rounded-full backdrop-blur-md transition-all duration-300 border bg-[#2A0C11]/70 text-[#F7F0DF] border-[#C89B3C]/40 hover:border-[#C89B3C] shadow-lg flex items-center gap-2 cursor-pointer active:scale-98"
        >
          {/* Animated label track inside pill */}
          <div ref={labelContainerRef} className="will-change-transform">
            <span className="font-sans text-[10px] sm:text-[11px] font-medium tracking-[0.18em] uppercase flex items-center gap-1.5">
              <span className="text-[#C89B3C] font-semibold">
                {displayedChapter.number}
              </span>
              <span className="text-[#C89B3C]/60">·</span>
              <span ref={labelTextRef} className="tracking-[0.16em]">
                {displayedChapter.label}
              </span>
            </span>
          </div>

          {/* Minimal dropdown chevron */}
          <svg
            width="10"
            height="6"
            viewBox="0 0 10 6"
            fill="none"
            aria-hidden="true"
            className={`text-[#C89B3C] transition-transform duration-300 ${
              isMenuOpen ? 'rotate-180' : ''
            }`}
          >
            <path
              d="M1 1L5 5L9 1"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Chapter Selection Dropdown Panel */}
        {isMenuOpen && (
          <div
            className="absolute right-0 mt-2 w-48 py-2 rounded-2xl backdrop-blur-xl border border-[#C89B3C]/35 bg-[#2A0C11]/95 shadow-2xl flex flex-col gap-1 transition-all duration-300 z-50 animate-in fade-in zoom-in-95"
            role="menu"
            aria-orientation="vertical"
          >
            {wedding.chapters.map((chapter) => {
              const isActive = chapter.id === activeId;
              return (
                <button
                  key={chapter.id}
                  type="button"
                  role="menuitem"
                  onClick={(e) => handleChapterClick(chapter, e)}
                  className={`w-full min-h-[40px] px-4 py-2 text-left font-sans text-[10px] tracking-[0.18em] uppercase transition-colors duration-200 flex items-center justify-between cursor-pointer rounded-lg mx-auto ${
                    isActive
                      ? 'text-[#C89B3C] font-semibold bg-[#C89B3C]/15'
                      : 'text-[#F7F0DF]/80 hover:text-[#F7F0DF] hover:bg-[#C89B3C]/10'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-[#C89B3C]/70 text-[9px]">
                      {chapter.number}
                    </span>
                    <span>{chapter.label}</span>
                  </span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C89B3C]" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Desktop Edge Track Navigation — Strictly hidden on mobile per Section 9 */}
      <nav
        aria-label="Story chapters"
        className="hidden lg:flex fixed right-8 top-1/2 -translate-y-1/2 z-30 flex-col items-end gap-5 select-none pointer-events-auto"
      >
        {wedding.chapters.map((chapter) => {
          const isActive = chapter.id === activeId;

          return (
            <button
              key={chapter.id}
              type="button"
              onClick={(e) => handleChapterClick(chapter, e)}
              aria-label={`Go to chapter ${chapter.number}: ${chapter.label}`}
              aria-current={isActive ? 'step' : undefined}
              className="group flex items-center gap-3 transition-all duration-300 py-1 cursor-pointer"
            >
              <span
                className={`font-sans text-[8px] font-medium tracking-[0.18em] uppercase transition-all duration-300 ${
                  isActive
                    ? 'text-[#C89B3C] opacity-100 font-semibold'
                    : 'opacity-0 group-hover:opacity-80 text-[#C89B3C]/70'
                }`}
              >
                {chapter.label}
              </span>

              <span
                className={`font-sans text-[9px] tracking-wider transition-colors duration-300 ${
                  isActive
                    ? 'text-[#C89B3C] font-bold'
                    : 'text-[#F7F0DF]/40 group-hover:text-[#F7F0DF]/80'
                }`}
              >
                {chapter.number}
              </span>

              <span
                className={`h-[1px] transition-all duration-300 ${
                  isActive
                    ? 'w-6 bg-[#C89B3C] shadow-[0_0_8px_rgba(200,155,60,0.6)]'
                    : 'w-2 bg-[#F7F0DF]/30 group-hover:w-3'
                }`}
              />
            </button>
          );
        })}
      </nav>
    </>
  );
};

export default ProgressNavigation;
