# Design Specification — Krishna & Rishitha Wedding

## Reference Analysis

Based on inspection of the Riwaaz Rameswaram demo (design-quality reference only).

### Opening / Loading Behavior
- Full-screen dark loader with subtle progress bar and percentage counter
- Gold progress fill on dark track (2px height)
- Uppercase label "Preparing your journey…" in small sans-serif
- Loader fades out with opacity + visibility transition (420ms, smooth easing)
- Skip link provided for accessibility

### Cinematic Reveal Behavior
- Content appears in chapters that transition with opacity fades
- Each chapter occupies the full viewport with scroll-triggered transitions
- Background media plays continuously while text chapters overlay
- Gradient overlays ensure text legibility over imagery
- Hero chapter starts with couple names at the top, later chapters position text at bottom

### Visual Hierarchy
- Clear 4-tier structural hierarchy:
  1. Eyebrow metadata (tiny uppercase sans-serif, high letter-spacing)
  2. Hero headline / Couple names (massive high-contrast display serif)
  3. Poetic narrative copy (medium serif / sans italic with generous line-height)
  4. Contextual details (dates, venues, actions, subtle secondary color)
- Intentional whitespace creates an uncluttered, high-end editorial feel
- Dominant focal point per screen ensures zero visual competition

### Typography Scale
- **Display serif**: Cormorant Garamond (400–600 weight, normal + italic)
- **UI sans-serif**: DM Sans (400–600 weight)
- Extreme size contrast: 8px labels → 10rem couple names
- Uppercase labels: 8–10px, letter-spacing 0.13–0.18em
- Serif headings: negative tracking (-0.035 to -0.055em)
- Body copy: 12–13px sans-serif, line-height 1.9
- Copy-note text uses serif at larger sizes (1rem–1.3rem)
- Responsive scaling with CSS clamp() throughout

### Spacing & Section Structure
- **Mobile**: 64px vertical padding, 20–24px horizontal gutters
- **Tablet (700px+)**: 90px vertical, 32–48px horizontal gutters
- **Desktop (1100px+)**: 110px vertical, max(6vw, calc((100vw-1300px)/2)) horizontal gutters
- Content gaps: 30–65px between logical blocks
- Generous breathing room gives a stately, unhurried cadence

### Image Treatment
- Single primary background visual treated as a continuous cinematic backdrop
- Controlled aspect ratios (9:16 portrait on mobile, full-screen cover on desktop)
- Subtle dark vignettes and linear/radial gradients overlay images for contrast
- Sharp, natural image clarity without artificial plastic filters or heavy blurs
- Couple artwork remains central and fully recognizable

### Section Transitions
- Chapters advance using smooth opacity (fade) and subtle vertical translates
- CSS transition curves: `cubic-bezier(0.23, 1, 0.32, 1)` for organic, human deceleration
- Inactive chapters marked with `pointer-events: none` and `aria-hidden="true"`
- Reduced-motion media query disables animations cleanly for accessibility

### Scroll Behavior
- Fixed sticky stage (`100svh`) pinned during the narrative unfolding
- Scroll distance mapped smoothly to story progression
- Subtle scroll indicator cues ("Scroll to unfold") with animated arrows
- Seamless hand-off from pinned narrative to standard document flow

### Navigation Style
- Minimalist, non-intrusive navigation:
  - Top header: discrete location tag and direct jump link
  - Desktop edge: vertical chapter indicators with numbered steps
  - Footer bar: current chapter counter and quick-scroll triggers
- Avoids dense app-like hamburger menus; preserves the invitation aesthetic

### Background Treatment
- Rich, earthy dark ink palette (`#211f1a`) paired with warm parchment/paper tones
- Layered radial and linear gradients create depth without flat digital harshness
- Soft lighting highlights focus attention on center typography

### Decorative Elements
- Highly restrained, elegant ornamentation:
  - Thin 1px gold/sand rules and hairline dividers
  - Traditional motifs (asterisks, floral ornaments, geometric emblems)
  - Monogram stamp subtly framing key milestones
- Avoids kitsch or generic wedding clipart; every ornament feels carved and architectural

### Mobile Layout Behavior
- Single-column vertical stack with 100% viewport awareness (`100svh`)
- Type clamp scales down gracefully to prevent text wrapping awkwardly
- Touch targets kept at accessible 44px minimum
- Fixed UI elements placed safely within standard safe-area insets

### Desktop Layout Behavior
- Expansive two-column / asymmetrical editorial grids
- Visual and text comfortably decoupled (side-by-side or layered depth)
- Side navigation and persistent headers appear without clutter
- Maximum content width capped (~1300px) with centered alignment

---

## Our Tirupati-Inspired Visual Direction

### Color System
| Token | Hex | Usage |
|-------|-----|-------|
| Deep Maroon | `#4A1018` | Primary brand, headings, dark backgrounds |
| Dark Maroon | `#2A0C11` | Deepest dark (hero overlays, theme-color) |
| Temple Gold | `#C89B3C` | Accent color (labels, highlights, interactive) |
| Antique Gold | `#9C7628` | Secondary gold (muted accents, borders) |
| Ivory | `#F7F0DF` | Surface backgrounds, cards |
| Warm White | `#FFFDF7` | Page background |
| Dark Brown | `#241815` | Body text |

### Typography Scale
| Name | Size | Usage |
|------|------|-------|
| hero | clamp(3.5rem–9rem) | Couple names |
| display | clamp(3rem–5.5rem) | Section titles |
| heading-lg | clamp(2.5rem–4.5rem) | Large section headings |
| heading | clamp(1.75rem–2.75rem) | Section headings |
| heading-sm | clamp(1.25rem–1.75rem) | Event titles |
| copy-note | clamp(1rem–1.3rem) | Serif body paragraphs |
| body-lg | clamp(0.875rem–1rem) | Intro paragraphs |
| body | clamp(0.75rem–0.813rem) | Body copy |
| meta | clamp(0.625rem–0.688rem) | Small UI text |
| label | clamp(0.5rem–0.563rem) | Uppercase labels |

### Animation Principles
- Primary easing: cubic-bezier(0.23, 1, 0.32, 1) — smooth deceleration
- Duration: 180ms (fast) → 420ms (normal) → 800ms (slow) → 1200ms (reveal)
- GSAP for scroll-triggered reveals (architecture-ready)
- Respect prefers-reduced-motion
- No autoplaying video
- No unnecessary animation loops

### Decorative System
8 original SVG assets, all using `currentColor` for CSS theming:
1. `temple-border.svg` — Repeating arch pattern
2. `temple-divider.svg` — Gopuram center divider
3. `lotus.svg` — Multi-petal temple ceiling lotus
4. `deepam.svg` — Brass lamp silhouette
5. `ornament.svg` — Kolam/tilaka accent mark
6. `mandala.svg` — Radial pattern for watermarks
7. `floral-divider.svg` — Organic vine divider
8. `gold-frame.svg` — Corner-flourish content frame

### Responsive Breakpoints
| Breakpoint | Target |
|-----------|--------|
| 375px | iPhone SE, small phones |
| 768px | iPad portrait, tablets |
| 1024px | iPad landscape |
| 1366px | Laptop displays |
| 1440px | Desktop displays |
| 1920px | Full HD displays |

Mobile-first approach. Primary audience: WhatsApp-shared invitations.
