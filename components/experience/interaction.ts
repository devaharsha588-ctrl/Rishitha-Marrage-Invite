import gsap from 'gsap';
import { prefersReducedMotion } from '@/lib/motion-config';

/**
 * Text Mode 3: Subtle Glyph/Scramble Reveal for Small Metadata & Chapter Tags
 * Does NOT scramble couple names.
 */
export function scrambleText(
  element: HTMLElement | null,
  finalText: string,
  duration: number = 0.45
) {
  if (!element || prefersReducedMotion()) {
    if (element) element.textContent = finalText;
    return;
  }

  const glyphs = '·✦◊∆+*○';
  const length = finalText.length;
  const startTime = performance.now();

  const update = () => {
    const elapsed = (performance.now() - startTime) / (duration * 1000);
    const progress = Math.min(1, Math.max(0, elapsed));

    // Number of resolved characters from left to right
    const resolvedCount = Math.floor(progress * length);

    let output = finalText.slice(0, resolvedCount);
    for (let i = resolvedCount; i < length; i++) {
      if (finalText[i] === ' ' || finalText[i] === '·') {
        output += finalText[i];
      } else {
        output += glyphs[Math.floor(Math.random() * glyphs.length)];
      }
    }

    element.textContent = output;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = finalText;
    }
  };

  requestAnimationFrame(update);
}

/**
 * Micro-Interaction: Magnetic Button Hover
 * Translates element 2-4px towards mouse on hover without bouncing
 */
export function setupMagneticElement(element: HTMLElement | null, maxOffset: number = 3) {
  if (!element || prefersReducedMotion()) return () => {};

  const onMouseMove = (e: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - centerX) / (rect.width / 2);
    const deltaY = (e.clientY - centerY) / (rect.height / 2);

    const targetX = Math.max(-maxOffset, Math.min(maxOffset, deltaX * maxOffset));
    const targetY = Math.max(-maxOffset, Math.min(maxOffset, deltaY * maxOffset));

    gsap.to(element, {
      x: targetX,
      y: targetY,
      duration: 0.25,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  };

  const onMouseLeave = () => {
    gsap.to(element, {
      x: 0,
      y: 0,
      duration: 0.35,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  };

  element.addEventListener('mousemove', onMouseMove);
  element.addEventListener('mouseleave', onMouseLeave);

  return () => {
    element.removeEventListener('mousemove', onMouseMove);
    element.removeEventListener('mouseleave', onMouseLeave);
  };
}

/**
 * Text Mode 1: Masked Reveal
 */
export function revealMasked(element: HTMLElement | null, duration: number = 0.9) {
  if (!element) return;
  if (prefersReducedMotion()) {
    element.style.opacity = '1';
    return;
  }

  gsap.fromTo(
    element,
    { clipPath: 'inset(100% 0 0 0)', opacity: 0 },
    {
      clipPath: 'inset(0% 0 0 0)',
      opacity: 1,
      duration,
      ease: 'power3.out',
    }
  );
}

/**
 * Text Mode 2: Soft Opacity + 12-20px Vertical Settle
 */
export function revealSoft(element: HTMLElement | null, yOffset: number = 18, duration: number = 0.8) {
  if (!element) return;
  if (prefersReducedMotion()) {
    element.style.opacity = '1';
    return;
  }

  gsap.fromTo(
    element,
    { opacity: 0, y: yOffset },
    {
      opacity: 1,
      y: 0,
      duration,
      ease: 'power3.out',
    }
  );
}
