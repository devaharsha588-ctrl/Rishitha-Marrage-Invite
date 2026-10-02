'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { EASING, prefersReducedMotion } from '@/lib/motion';

export const EventsVisualSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  // Event 1 (Haldi & Sangeeth) Refs
  const e1ContainerRef = useRef<HTMLDivElement>(null);
  const e1ContentRef = useRef<HTMLDivElement>(null);
  const e1DateRef = useRef<HTMLParagraphElement>(null);
  const e1DividerRef = useRef<HTMLDivElement>(null);
  const e1TitleRef = useRef<HTMLHeadingElement>(null);

  // Event 2 (Bride-to-be Celebration) Refs
  const e2ContainerRef = useRef<HTMLDivElement>(null);
  const e2ContentRef = useRef<HTMLDivElement>(null);
  const e2DateRef = useRef<HTMLParagraphElement>(null);
  const e2DividerRef = useRef<HTMLDivElement>(null);
  const e2TitleRef = useRef<HTMLHeadingElement>(null);

  // Event 3 (Wedding Ceremony) Refs
  const e3ContainerRef = useRef<HTMLDivElement>(null);
  const e3ContentRef = useRef<HTMLDivElement>(null);
  const e3DateRef = useRef<HTMLParagraphElement>(null);
  const e3DividerRef = useRef<HTMLDivElement>(null);
  const e3TitleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    const isReduced = prefersReducedMotion();

    if (isReduced) {
      const allElements = [
        e1ContentRef.current,
        e1DateRef.current,
        e1DividerRef.current,
        e1TitleRef.current,
        e2ContentRef.current,
        e2DateRef.current,
        e2DividerRef.current,
        e2TitleRef.current,
        e3ContentRef.current,
        e3DateRef.current,
        e3DividerRef.current,
        e3TitleRef.current,
      ];
      allElements.forEach((el) => {
        if (el) el.style.opacity = '1';
      });
      return;
    }

    const ctx = gsap.context(() => {
      // -------------------------------------------------------------
      // SCENE 03: HALDI & SANGEETH
      // -------------------------------------------------------------
      if (e1ContainerRef.current) {
        const tl1 = gsap.timeline({
          scrollTrigger: {
            trigger: e1ContainerRef.current,
            start: 'top 65%',
            toggleActions: 'play none none reverse',
          },
        });

        // Date reveal: opacity 0 -> 1, y: 8px -> 0, duration: 0.6s, ease: power2.out
        tl1.fromTo(
          e1DateRef.current,
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
        )
          // Divider reveal
          .fromTo(
            e1DividerRef.current,
            { opacity: 0, scaleX: 0 },
            { opacity: 0.85, scaleX: 1, duration: 0.5, ease: 'power2.out', transformOrigin: 'center center' },
            '-=0.35'
          )
          // Title reveal: appears slightly after date so date registers first
          .fromTo(
            e1TitleRef.current,
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.7, ease: EASING.PRIMARY_REVEAL },
            '-=0.35'
          );

        gsap.to(e1ContentRef.current, {
          scrollTrigger: {
            trigger: e1ContainerRef.current,
            start: 'bottom 85%',
            end: 'bottom 40%',
            scrub: 0.3,
          },
          opacity: 0,
          y: -16,
          ease: 'none',
        });
      }

      // -------------------------------------------------------------
      // SCENE 04: BRIDE-TO-BE CELEBRATION
      // -------------------------------------------------------------
      if (e2ContainerRef.current) {
        const tl2 = gsap.timeline({
          scrollTrigger: {
            trigger: e2ContainerRef.current,
            start: 'top 55%',
            toggleActions: 'play none none reverse',
          },
        });

        tl2.fromTo(
          e2DateRef.current,
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
        )
          .fromTo(
            e2DividerRef.current,
            { opacity: 0, scaleX: 0 },
            { opacity: 0.85, scaleX: 1, duration: 0.5, ease: 'power2.out', transformOrigin: 'center center' },
            '-=0.35'
          )
          .fromTo(
            e2TitleRef.current,
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.7, ease: EASING.PRIMARY_REVEAL },
            '-=0.35'
          );

        gsap.to(e2ContentRef.current, {
          scrollTrigger: {
            trigger: e2ContainerRef.current,
            start: 'bottom 85%',
            end: 'bottom 40%',
            scrub: 0.3,
          },
          opacity: 0,
          y: -16,
          ease: 'none',
        });
      }

      // -------------------------------------------------------------
      // SCENE 05: WEDDING CEREMONY
      // -------------------------------------------------------------
      if (e3ContainerRef.current) {
        const tl3 = gsap.timeline({
          scrollTrigger: {
            trigger: e3ContainerRef.current,
            start: 'top 55%',
            toggleActions: 'play none none reverse',
          },
        });

        tl3.fromTo(
          e3DateRef.current,
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
        )
          .fromTo(
            e3DividerRef.current,
            { opacity: 0, scaleX: 0 },
            { opacity: 0.85, scaleX: 1, duration: 0.5, ease: 'power2.out', transformOrigin: 'center center' },
            '-=0.35'
          )
          .fromTo(
            e3TitleRef.current,
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.7, ease: EASING.PRIMARY_REVEAL },
            '-=0.35'
          );

        gsap.to(e3ContentRef.current, {
          scrollTrigger: {
            trigger: e3ContainerRef.current,
            start: 'bottom 85%',
            end: 'bottom 40%',
            scrub: 0.3,
          },
          opacity: 0,
          y: -16,
          ease: 'none',
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="events"
      ref={sectionRef}
      aria-label="Wedding Events"
      className="relative w-full bg-transparent text-[#F7F0DF] overflow-hidden select-none"
    >
      {/* -------------------------------------------------------------
          SCENE 03: 11 DECEMBER — HALDI & SANGEETH
      ------------------------------------------------------------- */}
      <div
        id="event-haldi"
        ref={e1ContainerRef}
        className="relative w-full h-[100svh] min-h-[100svh] overflow-hidden flex flex-col justify-between items-center text-center"
        style={{
          paddingLeft: '20px',
          paddingRight: '20px',
          paddingTop: 'calc(20px + env(safe-area-inset-top, 0px))',
          paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 50%, rgba(42, 12, 17, 0.45) 0%, rgba(42, 12, 17, 0.22) 55%, rgba(42, 12, 17, 0.75) 100%)',
          }}
        />

        <div className="relative z-10 w-full h-12 sm:h-20 shrink-0" />

        <div
          ref={e1ContentRef}
          className="relative z-10 max-w-3xl mx-auto flex flex-col items-center my-auto will-change-transform px-4"
        >
          {/* Subtle localized cinematic haze behind date for effortless readability */}
          <div className="relative flex flex-col items-center">
            <div
              className="absolute -inset-x-10 -inset-y-3 pointer-events-none rounded-full"
              style={{
                background:
                  'radial-gradient(ellipse at center, rgba(20, 6, 9, 0.40) 0%, rgba(20, 6, 9, 0.18) 50%, rgba(20, 6, 9, 0) 80%)',
              }}
            />
            <p
              ref={e1DateRef}
              className="relative z-10 opacity-0 font-sans font-semibold tracking-[0.25em] uppercase text-[#E4C979]"
              style={{
                fontSize: 'clamp(11.5px, 1.1vw, 15.5px)',
                textShadow: '0 2px 12px rgba(0, 0, 0, 0.85), 0 0 20px rgba(20, 6, 9, 0.65)',
              }}
            >
              11 DECEMBER
            </p>
          </div>

          <div
            ref={e1DividerRef}
            className="opacity-0 w-20 sm:w-32 h-[1px] bg-gradient-to-r from-transparent via-[#E4C979] to-transparent my-3 sm:my-4 origin-center"
            style={{ opacity: 0.85 }}
          />

          <h3
            ref={e1TitleRef}
            className="opacity-0 font-serif font-normal text-white leading-[1.0] tracking-[-0.02em] drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)] uppercase max-w-[90vw]"
            style={{
              fontSize: 'clamp(2rem, 6.5vw, 4.75rem)',
            }}
          >
            HALDI &amp; SANGEETH
          </h3>
        </div>

        <div className="relative z-10 w-full h-10 sm:h-16 shrink-0" />
      </div>

      {/* -------------------------------------------------------------
          SCENE 04: 12 DECEMBER — BRIDE-TO-BE CELEBRATION
      ------------------------------------------------------------- */}
      <div
        id="event-pellikuthuru"
        ref={e2ContainerRef}
        className="relative w-full h-[100svh] min-h-[100svh] overflow-hidden flex flex-col justify-between items-center text-center"
        style={{
          paddingLeft: '20px',
          paddingRight: '20px',
          paddingTop: 'calc(20px + env(safe-area-inset-top, 0px))',
          paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 50%, rgba(42, 12, 17, 0.45) 0%, rgba(42, 12, 17, 0.22) 55%, rgba(42, 12, 17, 0.75) 100%)',
          }}
        />

        <div className="relative z-10 w-full h-12 sm:h-20 shrink-0" />

        <div
          ref={e2ContentRef}
          className="relative z-10 max-w-3xl mx-auto flex flex-col items-center my-auto will-change-transform px-4"
        >
          {/* Subtle localized cinematic haze behind date for effortless readability */}
          <div className="relative flex flex-col items-center">
            <div
              className="absolute -inset-x-10 -inset-y-3 pointer-events-none rounded-full"
              style={{
                background:
                  'radial-gradient(ellipse at center, rgba(20, 6, 9, 0.40) 0%, rgba(20, 6, 9, 0.18) 50%, rgba(20, 6, 9, 0) 80%)',
              }}
            />
            <p
              ref={e2DateRef}
              className="relative z-10 opacity-0 font-sans font-semibold tracking-[0.25em] uppercase text-[#E4C979]"
              style={{
                fontSize: 'clamp(11.5px, 1.1vw, 15.5px)',
                textShadow: '0 2px 12px rgba(0, 0, 0, 0.85), 0 0 20px rgba(20, 6, 9, 0.65)',
              }}
            >
              12 DECEMBER
            </p>
          </div>

          <div
            ref={e2DividerRef}
            className="opacity-0 w-20 sm:w-32 h-[1px] bg-gradient-to-r from-transparent via-[#E4C979] to-transparent my-3 sm:my-4 origin-center"
            style={{ opacity: 0.85 }}
          />

          <h3
            ref={e2TitleRef}
            className="opacity-0 font-serif font-normal text-white leading-[1.0] tracking-[-0.02em] drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)] uppercase max-w-[90vw]"
            style={{
              fontSize: 'clamp(2rem, 6.5vw, 4.75rem)',
            }}
          >
            BRIDE-TO-BE CELEBRATION
          </h3>
        </div>

        <div className="relative z-10 w-full h-10 sm:h-16 shrink-0" />
      </div>

      {/* -------------------------------------------------------------
          SCENE 05: 13 DECEMBER — WEDDING CEREMONY
      ------------------------------------------------------------- */}
      <div
        id="event-ceremony"
        ref={e3ContainerRef}
        className="relative w-full h-[100svh] min-h-[100svh] overflow-hidden flex flex-col justify-between items-center text-center"
        style={{
          paddingLeft: '20px',
          paddingRight: '20px',
          paddingTop: 'calc(20px + env(safe-area-inset-top, 0px))',
          paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 50%, rgba(42, 12, 17, 0.45) 0%, rgba(42, 12, 17, 0.22) 55%, rgba(42, 12, 17, 0.75) 100%)',
          }}
        />

        <div className="relative z-10 w-full h-12 sm:h-20 shrink-0" />

        <div
          ref={e3ContentRef}
          className="relative z-10 max-w-3xl mx-auto flex flex-col items-center my-auto will-change-transform px-4"
        >
          {/* Subtle localized cinematic haze behind date for effortless readability */}
          <div className="relative flex flex-col items-center">
            <div
              className="absolute -inset-x-10 -inset-y-3 pointer-events-none rounded-full"
              style={{
                background:
                  'radial-gradient(ellipse at center, rgba(20, 6, 9, 0.40) 0%, rgba(20, 6, 9, 0.18) 50%, rgba(20, 6, 9, 0) 80%)',
              }}
            />
            <p
              ref={e3DateRef}
              className="relative z-10 opacity-0 font-sans font-semibold tracking-[0.25em] uppercase text-[#E4C979]"
              style={{
                fontSize: 'clamp(11.5px, 1.1vw, 15.5px)',
                textShadow: '0 2px 12px rgba(0, 0, 0, 0.85), 0 0 20px rgba(20, 6, 9, 0.65)',
              }}
            >
              13 DECEMBER
            </p>
          </div>

          <div
            ref={e3DividerRef}
            className="opacity-0 w-20 sm:w-32 h-[1px] bg-gradient-to-r from-transparent via-[#E4C979] to-transparent my-3 sm:my-4 origin-center"
            style={{ opacity: 0.85 }}
          />

          <h3
            ref={e3TitleRef}
            className="opacity-0 font-serif font-normal text-white leading-[1.0] tracking-[-0.02em] drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)] uppercase max-w-[90vw]"
            style={{
              fontSize: 'clamp(2rem, 6.5vw, 4.75rem)',
            }}
          >
            WEDDING CEREMONY
          </h3>
        </div>

        <div className="relative z-10 w-full h-10 sm:h-16 shrink-0" />
      </div>
    </section>
  );
};

export default EventsVisualSection;
