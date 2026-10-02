/**
 * Global Wedding Background Music Manager
 * Single audio instance across the entire application.
 *
 * Guarantees:
 * - Exactly ONE HTMLAudioElement instance
 * - Never restarts on route or section transitions
 * - Volume fade-in (0 -> 0.35 over ~1s) and fade-out (0.35 -> 0 over ~0.65s)
 * - Seamless looping (audio.loop = true)
 * - Persistent user preference in localStorage ('wedding-music-enabled')
 * - Safe browser autoplay policy handling
 */

const AUDIO_SRC = '/audio/wedding-music.mp3';
const STORAGE_KEY = 'wedding-music-enabled';
const TARGET_VOLUME = 0.35;
const FADE_IN_MS = 1000;
const FADE_OUT_MS = 650;

type StateListener = (isPlaying: boolean) => void;

class AudioManager {
  private static instance: AudioManager | null = null;
  private audio: HTMLAudioElement | null = null;
  private isAudioPlaying = false;
  private listeners: Set<StateListener> = new Set();
  private fadeAnimId: number | null = null;
  private hasInitializedInteraction = false;

  private constructor() {
    // Lazy-initialized in browser environment
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  private initAudio(): HTMLAudioElement | null {
    if (typeof window === 'undefined') return null;

    if (!this.audio) {
      try {
        const audio = new Audio(AUDIO_SRC);
        audio.loop = true;
        audio.preload = 'auto';
        audio.volume = 0;

        audio.addEventListener('play', () => {
          this.isAudioPlaying = true;
          this.notify();
        });

        audio.addEventListener('pause', () => {
          this.isAudioPlaying = false;
          this.notify();
        });

        audio.addEventListener('ended', () => {
          // Fallback if loop attribute fails in rare browsers
          audio.currentTime = 0;
          audio.play().catch(() => {});
        });

        audio.addEventListener('error', (err) => {
          console.error('[MUSIC FAILED]', err);
          this.isAudioPlaying = false;
          this.notify();
        });

        this.audio = audio;
      } catch (err) {
        console.error('[MUSIC FAILED]', err);
        return null;
      }
    }

    return this.audio;
  }

  public getPreference(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  }

  public setPreference(enabled: boolean): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false');
    } catch {}
  }

  public isPlaying(): boolean {
    return this.isAudioPlaying;
  }

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.isAudioPlaying);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.isAudioPlaying);
      } catch (e) {
        console.error('[MUSIC NOTIFY ERROR]', e);
      }
    });
  }

  private cancelFade(): void {
    if (this.fadeAnimId !== null && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(this.fadeAnimId);
      this.fadeAnimId = null;
    }
  }

  private fadeVolume(targetVol: number, durationMs: number, onComplete?: () => void): void {
    const audio = this.initAudio();
    if (!audio) return;

    this.cancelFade();

    const startVol = audio.volume;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);

      // Smooth easeInOut curve
      const eased =
        progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      audio.volume = Math.max(0, Math.min(1, startVol + (targetVol - startVol) * eased));

      if (progress < 1) {
        this.fadeAnimId = requestAnimationFrame(step);
      } else {
        audio.volume = targetVol;
        this.fadeAnimId = null;
        if (onComplete) onComplete();
      }
    };

    this.fadeAnimId = requestAnimationFrame(step);
  }

  public async play(): Promise<boolean> {
    const audio = this.initAudio();
    if (!audio) return false;

    try {
      // If already playing, ensure target volume
      if (!audio.paused && this.isAudioPlaying) {
        this.fadeVolume(TARGET_VOLUME, FADE_IN_MS);
        this.setPreference(true);
        return true;
      }

      audio.volume = 0;
      const playPromise = audio.play();

      if (playPromise !== undefined) {
        await playPromise;
        this.isAudioPlaying = true;
        this.setPreference(true);
        this.fadeVolume(TARGET_VOLUME, FADE_IN_MS);
        this.notify();
        return true;
      }
      return false;
    } catch (err) {
      console.warn('[MUSIC AUTOPLAY PREVENTED]', err);
      this.isAudioPlaying = false;
      this.notify();
      return false;
    }
  }

  public pause(): void {
    const audio = this.initAudio();
    if (!audio) return;

    this.setPreference(false);
    this.isAudioPlaying = false;
    this.notify();

    this.fadeVolume(0, FADE_OUT_MS, () => {
      audio.pause();
    });
  }

  public async toggle(): Promise<boolean> {
    if (this.isAudioPlaying) {
      this.pause();
      return false;
    } else {
      return await this.play();
    }
  }

  /**
   * Safe One-Time Interaction Hook:
   * If user previously enabled music, attempts playback on the first legitimate interaction.
   */
  public setupInteractionAutoResume(): void {
    if (this.hasInitializedInteraction || typeof window === 'undefined') return;
    this.hasInitializedInteraction = true;

    if (!this.getPreference()) return;

    const onUserInteraction = () => {
      window.removeEventListener('click', onUserInteraction);
      window.removeEventListener('touchstart', onUserInteraction);
      window.removeEventListener('keydown', onUserInteraction);

      if (this.getPreference() && !this.isAudioPlaying) {
        this.play().catch(() => {});
      }
    };

    window.addEventListener('click', onUserInteraction, { once: true, passive: true });
    window.addEventListener('touchstart', onUserInteraction, { once: true, passive: true });
    window.addEventListener('keydown', onUserInteraction, { once: true, passive: true });
  }
}

export const audioManager = AudioManager.getInstance();
