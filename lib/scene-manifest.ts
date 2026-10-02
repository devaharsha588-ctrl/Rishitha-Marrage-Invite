/**
 * Canonical Wedding Scene Manifest
 * Single Source of Truth for Scene Ownership, Visual Assets, and Responsive Alignments.
 *
 * Rules:
 * - Exactly ONE primary visual owner for every section.
 * - NO IMAGE REUSE across sections.
 * - pushkarini.webp is NOT used in the primary scene sequence.
 * - Scene 08 (Closing) has NO IMAGE (renders pure deep maroon #2A0C11).
 * - Per-breakpoint focal alignments (desktop vs mobile portrait) preserve framing.
 */

export interface CanonicalScene {
  id: string;
  name: string;
  domId: string;
  image: string | null;
  alignDesktop: [number, number]; // [x, y] UV cover alignment on desktop
  alignMobile: [number, number];  // [x, y] UV cover alignment on mobile portrait
  align: [number, number];        // Default / backward-compatible alignment
  title: string;
  colorBridge: number;            // Hex color for transition veil
}

export const CANONICAL_SCENES: CanonicalScene[] = [
  {
    id: 'beginning',
    name: 'BEGINNING',
    domId: 'beginning',
    image: '/images/hero.webp',
    alignDesktop: [0.50, 0.50],
    alignMobile: [0.50, 0.48], // Natural framing: both Krishna and Rishitha visible, faces safe
    align: [0.50, 0.50],
    title: 'Krishna & Rishitha',
    colorBridge: 0xd4af37, // Antique gold
  },
  {
    id: 'countdown',
    name: 'COUNTDOWN',
    domId: 'countdown',
    image: '/images/seshachalam-hills.webp',
    alignDesktop: [0.50, 0.50],
    alignMobile: [0.50, 0.52], // Seshachalam ridgeline in mobile view
    align: [0.50, 0.50],
    title: 'Until The Wedding',
    colorBridge: 0xffae33, // Warm sunlight
  },
  {
    id: 'haldi',
    name: 'HALDI & SANGEETH',
    domId: 'event-haldi',
    image: '/images/wedding-entrance.webp',
    alignDesktop: [0.50, 0.50],
    alignMobile: [0.50, 0.50], // Floral archway centered
    align: [0.50, 0.50],
    title: 'Haldi & Sangeeth',
    colorBridge: 0xd97c83, // Floral rose gold
  },
  {
    id: 'pellikuthuru',
    name: 'BRIDE-TO-BE CELEBRATION',
    domId: 'event-pellikuthuru',
    image: '/images/wedding-mandapam.webp',
    alignDesktop: [0.50, 0.50],
    alignMobile: [0.50, 0.48], // Mandapam canopy framed
    align: [0.50, 0.50],
    title: 'Bride-to-be Celebration',
    colorBridge: 0xc89b3c, // Sacred gold
  },
  {
    id: 'ceremony',
    name: 'WEDDING CEREMONY',
    domId: 'event-ceremony',
    image: '/images/tirumala-gopuram.webp',
    alignDesktop: [0.58, 0.50],
    alignMobile: [0.55, 0.50], // Gopuram architectural spire centered on mobile
    align: [0.58, 0.50],
    title: 'Wedding Ceremony',
    colorBridge: 0xff9e2c, // Temple lantern glow
  },
  {
    id: 'join',
    name: 'JOIN',
    domId: 'join',
    image: '/images/deepam.webp',
    alignDesktop: [0.50, 0.50],
    alignMobile: [0.50, 0.50], // Deepam oil lamps visible under glass card
    align: [0.50, 0.50],
    title: 'Join Us',
    colorBridge: 0xc89b3c, // Warm lamp amber
  },
  {
    id: 'venue',
    name: 'VENUE',
    domId: 'venue',
    image: '/images/penugonda-home.webp',
    alignDesktop: [0.50, 0.50],
    alignMobile: [0.50, 0.50], // Penugonda residence setting
    align: [0.50, 0.50],
    title: 'Penugonda',
    colorBridge: 0x4a1018, // Deep maroon velvet
  },
  {
    id: 'closing',
    name: 'CLOSING',
    domId: 'closing',
    image: null, // NO IMAGE as specified
    alignDesktop: [0.50, 0.50],
    alignMobile: [0.50, 0.50],
    align: [0.50, 0.50],
    title: 'With Love & Blessings',
    colorBridge: 0x2a0c11, // Pure deep maroon
  },
];

/** Total unique image assets loaded for scenes (excluding null closing) */
export const SCENE_IMAGE_PATHS: string[] = CANONICAL_SCENES
  .map((s) => s.image)
  .filter((img): img is string => img !== null);

/**
 * Resolves the appropriate focal alignment for a scene based on viewport orientation.
 */
export function getSceneAlignment(scene: CanonicalScene, isMobileViewport: boolean): [number, number] {
  return isMobileViewport ? scene.alignMobile : scene.alignDesktop;
}
