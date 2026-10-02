'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { wedding } from '@/lib/wedding-config';
import { TIMING, EASING, prefersReducedMotion } from '@/lib/motion';
import { setupMagneticElement } from '@/components/experience/interaction';

export const PenugondaScene: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const mapBtnRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    const isReduced = prefersReducedMotion();

    if (isReduced) {
      if (contentRef.current) contentRef.current.style.opacity = '1';
      return;
    }

    const ctx = gsap.context(() => {
      // Scene 07 Entry Timeline
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 22 },
        {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 55%',
            toggleActions: 'play none none reverse',
          },
          opacity: 1,
          y: 0,
          duration: TIMING.MEDIUM,
          ease: EASING.PRIMARY_REVEAL,
        }
      );

      // Transition 07 Exit
      gsap.to(contentRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'bottom 85%',
          end: 'bottom 40%',
          scrub: 0.3,
        },
        opacity: 0,
        y: -18,
        ease: 'none',
      });
    }, sectionRef);

    // Magnetic interaction on map button
    const cleanupMap = setupMagneticElement(mapBtnRef.current, 3);

    return () => {
      ctx.revert();
      cleanupMap();
    };
  }, []);

  return (
    <section
      id="venue"
      ref={sectionRef}
      aria-label="Penugonda Wedding Venue"
      className="relative w-full h-[100svh] min-h-[100svh] overflow-hidden flex flex-col justify-between items-center text-center select-none bg-transparent"
      style={{
        paddingLeft: '20px',
        paddingRight: '20px',
        paddingTop: 'calc(20px + env(safe-area-inset-top, 0px))',
        paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      {/* Soft Vignette Overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(42, 12, 17, 0.45) 0%, rgba(42, 12, 17, 0.22) 55%, rgba(42, 12, 17, 0.8) 100%)',
        }}
      />

      {/* Top Spacer */}
      <div className="relative z-10 w-full h-12 sm:h-20 shrink-0" />

      {/* Center Typography Stack */}
      <div
        ref={contentRef}
        className="opacity-0 relative z-10 max-w-3xl mx-auto flex flex-col items-center my-auto will-change-transform w-full"
      >
        {/* Eyebrow */}
        <p
          className="font-sans font-semibold tracking-[0.3em] uppercase text-[#C89B3C] mb-2 sm:mb-3"
          style={{
            fontSize: 'clamp(10px, 2.5vw, 13px)',
            textShadow: '0 2px 14px rgba(0, 0, 0, 0.95)',
          }}
        >
          THE WEDDING
        </p>

        {/* Date */}
        <h2
          className="font-serif font-normal text-white leading-[1.0] tracking-[-0.03em] mb-3 sm:mb-4 drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)] max-w-[90vw]"
          style={{
            fontSize: 'clamp(2rem, 6.5vw, 5rem)',
          }}
        >
          13 DECEMBER 2026
        </h2>

        {/* Location Block */}
        <div className="flex flex-col items-center gap-1 mb-4 sm:mb-6">
          <p
            className="font-sans font-semibold tracking-[0.28em] uppercase text-[#F7F0DF]"
            style={{
              fontSize: 'clamp(12px, 3.2vw, 16px)',
              textShadow: '0 2px 12px rgba(0,0,0,0.9)',
            }}
          >
            PENUGONDA
          </p>
          <p
            className="font-sans font-normal tracking-[0.22em] uppercase text-[#C89B3C]"
            style={{
              fontSize: 'clamp(9px, 2.2vw, 12px)',
              textShadow: '0 2px 10px rgba(0,0,0,0.9)',
            }}
          >
            ANDHRA PRADESH
          </p>
        </div>

        {/* Delicate Gold Line */}
        <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#C89B3C] to-transparent mb-5 sm:mb-6" />

        {/* Google Maps Location Button (Section 19: min-height 46px, fits viewport width) */}
        <a
          ref={mapBtnRef}
          href={wedding.location.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View wedding location on Google Maps"
          className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 rounded-full border border-[#C89B3C]/70 bg-[#2A0C11]/70 backdrop-blur-md text-[#F7F0DF] font-sans font-semibold tracking-[0.2em] uppercase transition-all duration-250 hover:bg-[#C89B3C] hover:text-[#2A0C11] hover:border-[#C89B3C] shadow-lg active:scale-98 cursor-pointer min-h-[46px] max-w-[90vw] truncate"
          style={{
            fontSize: 'clamp(10px, 2.4vw, 12px)',
          }}
        >
          <span>VIEW LOCATION</span>
          <span aria-hidden="true">&rarr;</span>
        </a>
      </div>

      {/* Bottom Spacer / Subtle Temple Finish */}
      <div className="relative z-10 w-full flex flex-col items-center h-12 sm:h-16 shrink-0">
        <div
          className="opacity-25 text-[#C89B3C] max-w-[100px] sm:max-w-[120px]"
          aria-hidden="true"
        >
          <Image
            src="/decorations/temple-border.svg"
            alt=""
            width={120}
            height={24}
            className="w-full h-auto object-contain"
          />
        </div>
      </div>
    </section>
  );
};

export default PenugondaScene;
