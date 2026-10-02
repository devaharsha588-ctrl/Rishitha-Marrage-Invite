/**
 * Centralized Design Tokens — Krishna & Rishitha Wedding
 *
 * Tirupati-inspired luxury wedding identity.
 * All visual values are defined here to prevent scattering
 * hard-coded values throughout the project.
 */

export const tokens = {
  colors: {
    // Core palette
    deepMaroon: '#4A1018',
    darkMaroon: '#2A0C11',
    templeGold: '#C89B3C',
    antiqueGold: '#9C7628',
    ivory: '#F7F0DF',
    warmWhite: '#FFFDF7',
    darkBrown: '#241815',

    // Semantic aliases
    primary: '#4A1018',
    accent: '#C89B3C',
    background: '#FFFDF7',
    surface: '#F7F0DF',
    text: '#241815',
    textMuted: '#6B5A4E',
    textLight: '#8A7A6D',
    border: '#D4C4A8',
    borderLight: '#E8DFD0',
  },

  fonts: {
    serif: "'Cormorant Garamond', Georgia, serif",
    sans: "'DM Sans', Arial, sans-serif",
  },

  /**
   * Responsive type scale using CSS clamp().
   * Each value smoothly transitions between mobile and desktop sizes.
   */
  fontSize: {
    /** 8–9px — Uppercase labels, metadata tags */
    xs: 'clamp(0.5rem, 0.45rem + 0.2vw, 0.5625rem)',
    /** 10–11px — Small UI text, dates, captions */
    sm: 'clamp(0.625rem, 0.575rem + 0.2vw, 0.6875rem)',
    /** 12–13px — Body copy */
    base: 'clamp(0.75rem, 0.7rem + 0.25vw, 0.8125rem)',
    /** 14–16px — Large body, intro paragraphs */
    md: 'clamp(0.875rem, 0.8rem + 0.35vw, 1rem)',
    /** 16–21px — Serif body, copy-note text */
    lg: 'clamp(1rem, 0.85rem + 0.7vw, 1.3125rem)',
    /** 20–28px — Small headings, event titles */
    xl: 'clamp(1.25rem, 1rem + 1.2vw, 1.75rem)',
    /** 28–44px — Section headings */
    '2xl': 'clamp(1.75rem, 1.2rem + 2.5vw, 2.75rem)',
    /** 40–72px — Large display headings */
    '3xl': 'clamp(2.5rem, 1.5rem + 5vw, 4.5rem)',
    /** 48–88px — Hero sub-display */
    '4xl': 'clamp(3rem, 1.8rem + 6vw, 5.5rem)',
    /** 56–144px — Couple names, hero display */
    hero: 'clamp(3.5rem, 2rem + 8vw, 9rem)',
  },

  spacing: {
    /** Section padding by breakpoint */
    sectionMobile: '64px',
    sectionTablet: '90px',
    sectionDesktop: '110px',
    /** Horizontal gutters */
    gutterMobile: '20px',
    gutterTablet: '32px',
    gutterDesktop: '48px',
    /** Content gaps (responsive) */
    contentGap: 'clamp(30px, 4vw, 65px)',
  },

  borderRadius: {
    none: '0',
    sm: '2px',
    md: '4px',
  },

  animation: {
    duration: {
      fast: '180ms',
      normal: '420ms',
      slow: '800ms',
      reveal: '1200ms',
    },
    easing: {
      /** Primary easing — smooth deceleration */
      smooth: 'cubic-bezier(0.23, 1, 0.32, 1)',
      /** Gentle ease-out */
      gentle: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      /** Playful overshoot — use sparingly */
      bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
  },

  maxWidth: {
    /** Main content container */
    content: '1300px',
    /** Readable text column */
    text: '36em',
    /** Narrow content (dialogs, forms) */
    narrow: '640px',
  },

  breakpoints: {
    sm: '375px',
    md: '768px',
    lg: '1024px',
    xl: '1366px',
    '2xl': '1440px',
    '3xl': '1920px',
  },

  shadows: {
    /** Text legibility over images */
    text: '0 2px 24px rgba(42, 12, 17, 0.45)',
    textSubtle: '0 1px 12px rgba(0, 0, 0, 0.5)',
    /** Card elevation */
    card: '0 4px 24px rgba(42, 12, 17, 0.08)',
    /** Gold glow accent */
    glow: '0 0 40px rgba(200, 155, 60, 0.15)',
  },

  opacity: {
    /** Dark overlay on images */
    overlay: 0.7,
    /** Muted text/elements */
    muted: 0.6,
    /** Subtle background patterns */
    subtle: 0.3,
    /** Ghost/watermark decorations */
    ghost: 0.1,
  },
} as const;

/** Type helper for accessing nested token values */
export type Tokens = typeof tokens;
