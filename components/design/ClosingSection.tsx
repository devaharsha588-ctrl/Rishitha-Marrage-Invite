'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { wedding } from '@/lib/wedding-config';
import { TIMING, EASING, prefersReducedMotion } from '@/lib/motion';

export const ClosingSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const lotusRef = useRef<HTMLDivElement>(null);
  const namesRef = useRef<HTMLHeadingElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const borderBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    const isReduced = prefersReducedMotion();

    if (isReduced) {
      if (lotusRef.current) lotusRef.current.style.opacity = '1';
      if (namesRef.current) namesRef.current.style.opacity = '1';
      if (dividerRef.current) dividerRef.current.style.opacity = '1';
      if (detailsRef.current) detailsRef.current.style.opacity = '1';
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play reverse play reverse',
        },
      });

      // Calmer, slower entry
      tl.fromTo(
        lotusRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1.0, duration: TIMING.LONG, ease: EASING.PRIMARY_REVEAL }
      )
        .fromTo(
          namesRef.current,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: TIMING.CINEMATIC, ease: EASING.CLOSING },
          '-=0.8'
        )
        .fromTo(
          dividerRef.current,
          { opacity: 0, scaleX: 0 },
          { opacity: 1, scaleX: 1, duration: TIMING.MEDIUM, ease: EASING.PRIMARY_REVEAL, transformOrigin: 'center center' },
          '-=0.6'
        )
        .fromTo(
          detailsRef.current,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: TIMING.LONG, ease: EASING.PRIMARY_REVEAL },
          '-=0.5'
        )
        .fromTo(
          borderBottomRef.current,
          { opacity: 0 },
          { opacity: 0.35, duration: TIMING.LONG, ease: EASING.PRIMARY_REVEAL },
          '-=0.4'
        );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer
      id="closing"
      ref={sectionRef}
      aria-label="Wedding Closing Benediction"
      className="relative w-full h-[100svh] min-h-[100svh] flex flex-col justify-between items-center text-center select-none overflow-hidden bg-[#2A0C11]"
      style={{
        paddingLeft: '20px',
        paddingRight: '20px',
        paddingTop: 'calc(20px + env(safe-area-inset-top, 0px))',
        paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
        background:
          'radial-gradient(ellipse at 50% 45%, #421118 0%, #2A0C11 70%, #1A070B 100%)',
      }}
    >
      {/* Top Blend from Venue */}
      <div
        className="absolute inset-x-0 top-0 h-28 md:h-40 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(42, 12, 17, 0.98) 0%, rgba(42, 12, 17, 0.35) 60%, transparent 100%)',
        }}
        aria-hidden="true"
      />

      {/* Subtle Grain Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-screen"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
        aria-hidden="true"
      />

      {/* Top Spacer */}
      <div className="relative z-10 w-full h-8 sm:h-12 shrink-0" />

      {/* Center Calm Composition */}
      <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center my-auto w-full">
        {/* Sacred Lotus / Temple Emblem */}
        <div
          ref={lotusRef}
          className="opacity-0 w-10 h-10 sm:w-14 sm:h-14 mb-4 sm:mb-7 text-[#C89B3C] filter drop-shadow-[0_0_16px_rgba(200,155,60,0.3)]"
          aria-hidden="true"
        >
          <Image
            src="/decorations/lotus.svg"
            alt=""
            width={56}
            height={56}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Final Couple Names */}
        <h2
          ref={namesRef}
          className="opacity-0 font-serif font-normal text-white leading-[0.95] tracking-[-0.03em] drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)] max-w-[90vw]"
          style={{
            fontSize: 'clamp(2.25rem, 6.5vw, 5rem)',
          }}
        >
          <span>{wedding.groom.name}</span>
          <em
            className="block text-[#C89B3C] font-normal italic my-1.5 sm:my-3 tracking-normal"
            style={{
              fontSize: 'clamp(16px, 3.5vw, 28px)',
              textShadow: '0 2px 14px rgba(0,0,0,0.9)',
            }}
          >
            &amp;
          </em>
          <span>{wedding.bride.name}</span>
        </h2>

        {/* Delicate Gold Divider */}
        <div
          ref={dividerRef}
          className="opacity-0 w-24 sm:w-40 my-4 sm:my-6 flex items-center justify-center gap-2"
        >
          <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#C89B3C]" />
          <span className="w-1.5 h-1.5 rotate-45 bg-[#C89B3C]" />
          <span className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#C89B3C]" />
        </div>

        {/* Date & Destination in Penugonda */}
        <div
          ref={detailsRef}
          className="opacity-0 flex flex-col items-center gap-1.5"
        >
          <p
            className="font-sans font-medium tracking-[0.24em] uppercase text-[#F7F0DF]"
            style={{
              fontSize: 'clamp(10px, 2.4vw, 13px)',
              textShadow: '0 2px 12px rgba(0,0,0,0.8)',
            }}
          >
            13 DECEMBER 2026
          </p>
          <p
            className="font-sans font-normal tracking-[0.2em] uppercase text-[#C89B3C]"
            style={{
              fontSize: 'clamp(9px, 2vw, 11px)',
              textShadow: '0 2px 10px rgba(0,0,0,0.8)',
            }}
          >
            PENUGONDA · ANDHRA PRADESH
          </p>
        </div>
      </div>

      {/* Bottom Footer Credits & Auspicious Finish */}
      <div
        ref={borderBottomRef}
        className="relative z-10 w-full flex flex-col items-center pb-2 opacity-0 shrink-0"
      >
        <div className="w-16 sm:w-20 h-[1px] bg-gradient-to-r from-transparent via-[#C89B3C]/50 to-transparent mb-2.5" />
        <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-[#F7F0DF]/40">
          With Love &amp; Blessings
        </p>
      </div>
    </footer>
  );
};

export default ClosingSection;
