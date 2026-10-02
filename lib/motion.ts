import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

/**
 * Global Motion System — Constants & Design Language
 * Based on step 4 motion guidelines:
 * - Single continuous cinematic wedding film feeling
 * - Standardized easing curves
 * - Precise movement limits
 * - Lenis smooth scrolling with ScrollTrigger synchronization
 */

export const TIMING = {
  FAST: 0.35,
  SHORT: 0.55,
  MEDIUM: 0.8,
  LONG: 1.2,
  CINEMATIC: 1.6,
  VERY_SLOW: 2.2,
} as const;

export const EASING = {
  PRIMARY_REVEAL: 'power3.out',
  IMAGE_MOVE: 'power2.inOut',
  CROSSFADE: 'power1.inOut',
  CLOSING: 'expo.out',
  BUTTON: 'power2.out',
} as const;

export const MOVEMENT = {
  TEXT_Y_DESKTOP: 32,
  TEXT_Y_MOBILE: 18,
  IMAGE_SCALE_START: 1.04,
  IMAGE_SCALE_SETTLED: 1.0,
  IMAGE_SCALE_MAX: 1.06,
} as const;

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Check if viewport is mobile sized (< 768px)
 */
export const isMobileViewport = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
};

/**
 * Initialize Lenis smooth scroll coordinated with GSAP ScrollTrigger
 * - Disabled on mobile devices to preserve natural touch physics
 * - Disabled if prefers-reduced-motion is true
 */
export const initSmoothScroll = (): (() => void) => {
  if (typeof window === 'undefined') return () => {};

  if (prefersReducedMotion()) {
    return () => {};
  }

  // Preserve native touch scrolling on mobile
  if (isMobileViewport()) {
    return () => {};
  }

  gsap.registerPlugin(ScrollTrigger);

  let lenisInstance: Lenis | null = null;

  try {
    lenisInstance = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // smooth exponential curve
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.0,
      infinite: false,
    });

    const updateScrollTrigger = () => {
      ScrollTrigger.update();
    };

    lenisInstance.on('scroll', updateScrollTrigger);

    const tickerHandler = (time: number) => {
      if (lenisInstance) {
        lenisInstance.raf(time * 1000);
      }
    };

    gsap.ticker.add(tickerHandler);
    gsap.ticker.lagSmoothing(0);

    return () => {
      if (lenisInstance) {
        lenisInstance.off('scroll', updateScrollTrigger);
        lenisInstance.destroy();
        lenisInstance = null;
      }
      gsap.ticker.remove(tickerHandler);
    };
  } catch (err) {
    console.warn('Lenis smooth scroll initialization skipped:', err);
    return () => {};
  }
};

/**
 * Smoothly scroll to a section by target element ID
 */
export const scrollToSection = (targetId: string) => {
  if (typeof window === 'undefined') return;

  const target = document.getElementById(targetId);
  if (!target) return;

  target.scrollIntoView({ behavior: 'smooth' });
};
