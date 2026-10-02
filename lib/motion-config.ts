/**
 * Global Motion & WebGL Configuration
 * Single source of truth for 3D spatial world parameters, camera travel,
 * image planes, shaders, and particle dynamics.
 */

export const SCENE_DEPTH = {
  HERO: 0,
  HILLS: -14,
  ENTRANCE: -28,
  MANDAPAM: -42,
  TEMPLE: -56,
  DEEPAM: -70,
  PENUGONDA: -84,
  CLOSING: -98,
} as const;

export const CAMERA_TRAVEL = {
  INITIAL_Z: 7.2,
  FINAL_Z: -98.0,
  FOV: 48,
  NEAR: 0.1,
  FAR: 180,
  MAX_SWAY_X_DESKTOP: 0.45,
  MAX_SWAY_X_MOBILE: 0.20,
  MAX_SWAY_Y_DESKTOP: 0.25,
  MAX_SWAY_Y_MOBILE: 0.12,
  MAX_ROTATION_RAD: 0.025, // ~1.4 degrees
} as const;

export const IMAGE_SCALE = {
  PLANE_WIDTH: 14.0,
  PLANE_HEIGHT: 8.4,
  ASPECT_RATIO: 16 / 9,
} as const;

export const DISTORTION_STRENGTH = {
  DEFAULT: 0.0,
  MAX_TRANSITION: 0.055,
  HEAT_HAZE: 0.035,
  BLOOM_SPREAD: 0.045,
} as const;

export const RGB_SHIFT = {
  DEFAULT: 0.0,
  MAX_CHROMA: 0.0045,
} as const;

export const PARTICLE_COUNT = {
  DESKTOP: 850,
  MOBILE: 280,
} as const;

export const PARTICLE_SPEED = {
  BASE: 0.25,
  ENTRANCE_FAST: 0.45,
  CALM: 0.12,
} as const;

export const CAMERA_ROTATION = {
  MAX_DEGREE: 1.5,
  MAX_RADIAN: (1.5 * Math.PI) / 180,
} as const;

export const TRANSITION_DURATION = {
  FAST: 0.35,
  MEDIUM: 0.8,
  LONG: 1.2,
  CINEMATIC: 1.6,
} as const;

export const MOUSE_PARALLAX = {
  DESKTOP_X: 0.4,
  DESKTOP_Y: 0.25,
  MOBILE_FACTOR: 0.2,
  LERP_SPEED: 0.04,
} as const;

export const SCENE_IMAGES = [
  { id: 'hero', path: '/images/hero.webp', depth: SCENE_DEPTH.HERO, name: 'Hero' },
  { id: 'hills', path: '/images/seshachalam-hills.webp', depth: SCENE_DEPTH.HILLS, name: 'Hills' },
  { id: 'entrance', path: '/images/wedding-entrance.webp', depth: SCENE_DEPTH.ENTRANCE, name: 'Entrance' },
  { id: 'mandapam', path: '/images/wedding-mandapam.webp', depth: SCENE_DEPTH.MANDAPAM, name: 'Mandapam' },
  { id: 'temple', path: '/images/tirumala-gopuram.webp', depth: SCENE_DEPTH.TEMPLE, name: 'Temple' },
  { id: 'deepam', path: '/images/deepam.webp', depth: SCENE_DEPTH.DEEPAM, name: 'Deepam' },
  { id: 'penugonda', path: '/images/penugonda-home.webp', depth: SCENE_DEPTH.PENUGONDA, name: 'Penugonda' },
] as const;

export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
};
