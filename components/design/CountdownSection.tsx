'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { wedding } from '@/lib/wedding-config';
import { TIMING, EASING, prefersReducedMotion } from '@/lib/motion';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/**
 * Animated numeral with subtle vertical shift on value change (Section 18)
 */
const AnimatedNumber: React.FC<{ value: string }> = ({ value }) => {
  const [displayed, setDisplayed] = useState(value);
  const prevValueRef = useRef(value);
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (value !== prevValueRef.current) {
      prevValueRef.current = value;

      if (prefersReducedMotion() || !spanRef.current) {
        setDisplayed(value);
        return;
      }

      // Old number: opacity 1 -> 0, y: 0 -> -6
      gsap.to(spanRef.current, {
        y: -6,
        opacity: 0,
        duration: 0.14,
        ease: 'power2.in',
        onComplete: () => {
          setDisplayed(value);
          // New number: opacity 0 -> 1, y: 6 -> 0
          gsap.fromTo(
            spanRef.current,
            { y: 6, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.16, ease: 'power2.out' }
          );
        },
      });
    }
  }, [value]);

  return (
    <span
      ref={spanRef}
      className="inline-block font-serif font-normal text-white leading-none tracking-tight drop-shadow-[0_3px_16px_rgba(0,0,0,0.95)] will-change-transform"
      style={{
        fontSize: 'clamp(28px, 8vw, 76px)',
      }}
    >
      {displayed}
    </span>
  );
};

export const CountdownSection: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isMounted, setIsMounted] = useState<boolean>(false);

  const sectionRef = useRef<HTMLElement>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const unitsWrapperRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);

    const calculateTime = () => {
      const target = new Date(wedding.targetDate).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor(
        (difference % (1000 * 60 * 60)) / (1000 * 60)
      );
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);

    return () => clearInterval(timer);
  }, []);

  // GSAP Cinematic Entrance & Parallax
  useEffect(() => {
    if (typeof window === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    const isReduced = prefersReducedMotion();

    if (isReduced) {
      if (titleRef.current) titleRef.current.style.opacity = '1';
      if (unitsWrapperRef.current) unitsWrapperRef.current.style.opacity = '1';
      if (dividerRef.current) dividerRef.current.style.opacity = '1';
      return;
    }

    const ctx = gsap.context(() => {
      const enterTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 45%',
          toggleActions: 'play none none reverse',
        },
      });

      enterTl
        .fromTo(
          titleRef.current,
          { opacity: 0, y: 22 },
          { opacity: 1, y: 0, duration: TIMING.MEDIUM, ease: EASING.PRIMARY_REVEAL }
        )
        .fromTo(
          unitsWrapperRef.current?.children ? Array.from(unitsWrapperRef.current.children) : [],
          { opacity: 0, y: 18 },
          {
            opacity: 1,
            y: 0,
            duration: TIMING.MEDIUM,
            stagger: 0.08,
            ease: EASING.PRIMARY_REVEAL,
          },
          '-=0.5'
        )
        .fromTo(
          dividerRef.current,
          { opacity: 0, scaleX: 0 },
          { opacity: 1, scaleX: 1, duration: TIMING.SHORT, ease: EASING.PRIMARY_REVEAL },
          '-=0.4'
        );

      // Exit scrub
      gsap.to(contentWrapperRef.current, {
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

    return () => ctx.revert();
  }, []);

  const formatNumber = (num: number): string => {
    return isMounted ? String(num).padStart(2, '0') : '--';
  };

  const units = [
    { label: 'DAYS', value: formatNumber(timeLeft.days) },
    { label: 'HOURS', value: formatNumber(timeLeft.hours) },
    { label: 'MINUTES', value: formatNumber(timeLeft.minutes) },
    { label: 'SECONDS', value: formatNumber(timeLeft.seconds) },
  ];

  return (
    <section
      id="countdown"
      ref={sectionRef}
      aria-label="Wedding Countdown"
      className="relative w-full h-[100svh] min-h-[100svh] overflow-hidden flex flex-col justify-between items-center text-center select-none bg-transparent"
      style={{
        paddingLeft: '20px',
        paddingRight: '20px',
        paddingTop: 'calc(20px + env(safe-area-inset-top, 0px))',
        paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      {/* Soft Vignette Overlay for High Legibility */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(42, 12, 17, 0.45) 0%, rgba(42, 12, 17, 0.22) 50%, rgba(42, 12, 17, 0.8) 100%)',
        }}
      />

      {/* Top Spacer */}
      <div className="relative z-10 w-full h-12 sm:h-20 shrink-0" />

      {/* Center Countdown Stack (Section 18) */}
      <div
        ref={contentWrapperRef}
        className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center my-auto will-change-transform"
      >
        {/* Title */}
        <h2
          ref={titleRef}
          className="opacity-0 font-serif font-normal text-white tracking-[0.06em] uppercase mb-6 sm:mb-10 drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)] max-w-full px-2"
          style={{
            fontSize: 'clamp(22px, 5.5vw, 48px)',
          }}
        >
          UNTIL THE WEDDING
        </h2>

        {/* Live Timer Grid — 4 equal columns that fit on any mobile width */}
        <div
          ref={unitsWrapperRef}
          className="grid grid-cols-4 items-center justify-center gap-2 sm:gap-6 md:gap-10 w-full max-w-lg mx-auto"
        >
          {units.map((unit) => (
            <div
              key={unit.label}
              className="flex flex-col items-center justify-center min-w-0 opacity-0 px-0.5 sm:px-2"
            >
              {/* Cormorant Numeral with clamp(28px, 8vw, 76px) */}
              <AnimatedNumber value={unit.value} />

              {/* Small DM Sans Label */}
              <span
                className="mt-2 sm:mt-3 font-sans font-semibold tracking-[0.16em] sm:tracking-[0.24em] uppercase text-[#C89B3C] truncate w-full text-center"
                style={{
                  fontSize: 'clamp(8px, 2.2vw, 12px)',
                }}
              >
                {unit.label}
              </span>
            </div>
          ))}
        </div>

        {/* Small Antique Gold Divider */}
        <div
          ref={dividerRef}
          className="opacity-0 w-16 h-[1px] bg-gradient-to-r from-transparent via-[#C89B3C] to-transparent mt-8 sm:mt-12"
        />
      </div>

      {/* Bottom Spacer */}
      <div className="relative z-10 w-full h-10 sm:h-16 shrink-0" />
    </section>
  );
};

export default CountdownSection;
