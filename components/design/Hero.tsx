'use client';

import React, { useEffect, useRef } from 'react';
import { wedding } from '@/lib/wedding-config';
import ScrollIndicator from '@/components/shared/ScrollIndicator';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TIMING, EASING, prefersReducedMotion } from '@/lib/motion';

interface HeroProps {
  isReady: boolean;
}

export const Hero: React.FC<HeroProps> = ({ isReady }) => {
  const containerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const blessingRef = useRef<HTMLParagraphElement>(null);
  const groomRef = useRef<HTMLSpanElement>(null);
  const ampersandRef = useRef<HTMLElement>(null);
  const brideRef = useRef<HTMLSpanElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    const isReduced = prefersReducedMotion();

    if (isReady) {
      if (isReduced) {
        gsap.to(
          [
            blessingRef.current,
            groomRef.current,
            ampersandRef.current,
            brideRef.current,
            dividerRef.current,
            detailsRef.current,
            scrollIndicatorRef.current,
          ],
          {
            opacity: 1,
            duration: TIMING.SHORT,
            stagger: 0.08,
          }
        );
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: EASING.PRIMARY_REVEAL } });

      // Blessing text reveals (opacity 0 -> 1, y 20 -> 0)
      tl.fromTo(
        blessingRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: TIMING.MEDIUM }
      )
        // KRISHNA reveals
        .fromTo(
          groomRef.current,
          { opacity: 0, y: 32 },
          { opacity: 1, y: 0, duration: TIMING.LONG },
          '-=0.6'
        )
        // "&" reveals
        .fromTo(
          ampersandRef.current,
          { opacity: 0 },
          { opacity: 1, duration: TIMING.SHORT },
          '-=0.5'
        )
        // RISHITHA reveals
        .fromTo(
          brideRef.current,
          { opacity: 0, y: 32 },
          { opacity: 1, y: 0, duration: TIMING.LONG },
          '-=0.6'
        )
        // Gold ornament scaleX 0 -> 1
        .fromTo(
          dividerRef.current,
          { opacity: 0, scaleX: 0 },
          { opacity: 1, scaleX: 1, duration: TIMING.MEDIUM, transformOrigin: 'center center' },
          '-=0.5'
        )
        // Date / location reveals
        .fromTo(
          detailsRef.current,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: TIMING.MEDIUM },
          '-=0.4'
        )
        // Scroll indicator appears last
        .fromTo(
          scrollIndicatorRef.current,
          { opacity: 0 },
          { opacity: 1, duration: TIMING.MEDIUM },
          '-=0.3'
        );
    }
  }, [isReady]);

  // Scroll exit: content subtly lifts as camera travels into Countdown
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isReduced = prefersReducedMotion();
    if (isReduced || !containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to(contentRef.current, {
        scrollTrigger: {
          trigger: containerRef.current,
          start: '10% top',
          end: '65% top',
          scrub: 0.3,
        },
        opacity: 0,
        y: -20,
        ease: 'none',
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="beginning"
      ref={containerRef}
      aria-label="Wedding Invitation of Krishna and Rishitha"
      className="relative w-full h-[100svh] min-h-[100svh] overflow-hidden flex flex-col justify-between items-center text-center select-none bg-transparent"
      style={{
        paddingLeft: '20px',
        paddingRight: '20px',
        paddingTop: 'calc(20px + env(safe-area-inset-top, 0px))',
        paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      {/* Target anchor for #hero */}
      <span id="hero" className="absolute top-0 pointer-events-none" />

      {/* Cinematic Contrast Vignette Overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(42, 12, 17, 0.42) 0%, rgba(42, 12, 17, 0.18) 55%, rgba(42, 12, 17, 0.72) 100%)',
        }}
      />

      {/* Top Spacer allowing room for Top HUD */}
      <div className="relative z-10 w-full h-14 sm:h-12 shrink-0" />

      {/* Main Center Typography Hierarchy (Section 6 & 7) */}
      <div
        ref={contentRef}
        className="relative z-10 flex flex-col items-center justify-center max-w-4xl w-full mt-auto mb-2 sm:my-auto will-change-transform"
      >
        {/* Tier 1: Blessing — clamp(10px, 2.7vw, 14px) */}
        <p
          ref={blessingRef}
          className="opacity-0 font-sans font-semibold uppercase tracking-[0.16em] sm:tracking-[0.24em] text-[#C89B3C] mb-2 sm:mb-4 max-w-[92vw]"
          style={{
            fontSize: 'clamp(9.5px, 2.6vw, 14px)',
            textShadow: '0 2px 14px rgba(0, 0, 0, 0.95)',
          }}
        >
          <span className="block sm:inline">With the blessings of </span>
          <span className="block sm:inline">Sri Venkateswara Swamy</span>
        </p>

        {/* Tier 2: Couple Names — clamp(48px, 12vw, 110px) */}
        <h1
          className="font-serif font-normal text-white leading-[0.92] tracking-[-0.035em] drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]"
          style={{
            fontSize: 'clamp(36px, min(12vw, 11.5vh), 110px)',
          }}
        >
          <span className="inline-block overflow-hidden">
            <span ref={groomRef} className="inline-block opacity-0">
              {wedding.groom.name}
            </span>
          </span>
          <em
            ref={ampersandRef}
            className="block opacity-0 text-[#C89B3C] font-normal italic my-1 sm:my-2 tracking-normal"
            style={{
              fontSize: 'clamp(16px, min(4vw, 3.8vh), 32px)',
              textShadow: '0 2px 16px rgba(0,0,0,0.95)',
            }}
          >
            &amp;
          </em>
          <span className="inline-block overflow-hidden">
            <span ref={brideRef} className="inline-block opacity-0">
              {wedding.bride.name}
            </span>
          </span>
        </h1>

        {/* Delicate Golden Ornament Divider */}
        <div
          ref={dividerRef}
          className="opacity-0 w-20 sm:w-36 my-2.5 sm:my-4 flex items-center justify-center gap-2"
        >
          <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#C89B3C]" />
          <span className="w-1.5 h-1.5 rotate-45 bg-[#C89B3C]" />
          <span className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#C89B3C]" />
        </div>

        {/* Tier 3: Date & Location Details */}
        <div ref={detailsRef} className="opacity-0 flex flex-col items-center gap-1 sm:gap-2">
          {/* Date: clamp(10px, 2.4vw, 14px) */}
          <p
            className="font-sans font-medium tracking-[0.22em] uppercase text-[#F7F0DF]"
            style={{
              fontSize: 'clamp(10px, 2.4vw, 14px)',
              textShadow: '0 2px 12px rgba(0,0,0,0.95)',
            }}
          >
            {wedding.mainDate}
          </p>

          {/* Location: clamp(8px, 2vw, 12px) */}
          <p
            className="font-sans font-normal tracking-[0.18em] uppercase text-[#C89B3C]"
            style={{
              fontSize: 'clamp(8px, 2vw, 12px)',
              textShadow: '0 2px 10px rgba(0,0,0,0.95)',
            }}
          >
            {wedding.location.fullName}
          </p>
        </div>
      </div>

      {/* Bottom Scroll Indicator well above bottom safe area (Section 7) */}
      <div
        ref={scrollIndicatorRef}
        className="relative z-10 shrink-0 opacity-0 pt-2 pb-1"
      >
        <ScrollIndicator targetId="countdown" label="SCROLL TO EXPLORE" />
      </div>
    </section>
  );
};

export default Hero;
