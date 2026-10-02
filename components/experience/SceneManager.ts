import * as THREE from 'three';
import { createDualTransitionMaterial } from './TransitionShader';
import { ParticleSystem } from './ParticleSystem';
import { CANONICAL_SCENES, CanonicalScene, getSceneAlignment } from '@/lib/scene-manifest';
import { updateAssetDiagnostic, updateSystemDiagnostic } from './AssetDebugPanel';

const isDev = process.env.NODE_ENV !== 'production';
const logDev = (...args: unknown[]) => {
  if (isDev) {
    console.log(...args);
  }
};

export interface CompositorState {
  currentSceneName: string;
  nextSceneName: string | null;
  transitionIndex: number;
  progress: number;
  renderedTextures: number;
  imageA: string | null;
  imageB: string | null;
}

export class SceneManager {
  public scene: THREE.Scene;
  public stageMesh: THREE.Mesh;
  public stageMaterial: THREE.ShaderMaterial;
  public particles: ParticleSystem;

  private textureMap: Map<string, THREE.Texture> = new Map();
  private imageDimensions: Map<string, { width: number; height: number }> = new Map();
  private isLoaded: boolean = false;
  private width: number;
  private height: number;
  private isMobileViewport: boolean = false;
  private lastLoggedScene: string = '';

  // Active compositor snapshot for Debug HUD and transitions
  private currentState: CompositorState = {
    currentSceneName: 'BEGINNING',
    nextSceneName: null,
    transitionIndex: -1,
    progress: 0,
    renderedTextures: 1,
    imageA: '/images/hero.webp',
    imageB: null,
  };

  constructor(width: number, height: number, onLoaded?: () => void) {
    this.width = width;
    this.height = height;
    this.isMobileViewport = width < 640;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x2a0c11); // Rich deep maroon

    // 1. Dual-Texture Stage Plane (Unit geometry, scaled accurately in resize)
    const planeGeo = new THREE.PlaneGeometry(1, 1, 1, 1);
    this.stageMaterial = createDualTransitionMaterial(width, height);
    this.stageMesh = new THREE.Mesh(planeGeo, this.stageMaterial);
    this.stageMesh.position.set(0, 0, 0);
    this.scene.add(this.stageMesh);

    // 2. Persistent Golden Atmosphere Particle Field
    this.particles = new ParticleSystem();
    this.particles.points.position.set(0, 0, 0);
    this.scene.add(this.particles.points);

    updateSystemDiagnostic({ webglReady: true, rendererReady: true });

    // 3. Preload all canonical environmental textures with HTML/browser verification first
    this.loadTextures(onLoaded);
  }

  /**
   * Preload every required image using HTML Image() first,
   * then create WebGL textures only after browser confirms asset exists.
   */
  private loadTextures(onComplete?: () => void) {
    const scenesWithImages = CANONICAL_SCENES.filter((s) => s.image !== null);
    let loadedCount = 0;
    const total = scenesWithImages.length;

    logDev(`[SceneManager] Preloading and verifying ${total} scene images...`);

    scenesWithImages.forEach((scene) => {
      const src = scene.image!;

      // Step 1: Browser Image Preload Verification
      const img = new Image();

      img.onload = () => {
        logDev(`[IMAGE OK] ${src} (${img.naturalWidth}x${img.naturalHeight})`);
        this.imageDimensions.set(scene.id, {
          width: img.naturalWidth,
          height: img.naturalHeight,
        });

        updateAssetDiagnostic(src, {
          status: 'PRELOADED',
          width: img.naturalWidth,
          height: img.naturalHeight,
        });

        // Step 2: Initialize WebGL Texture directly from preloaded HTMLImageElement
        try {
          const tex = new THREE.Texture(img);
          tex.minFilter = THREE.LinearFilter;
          tex.magFilter = THREE.LinearFilter;
          tex.generateMipmaps = false;
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.needsUpdate = true;

          this.textureMap.set(scene.id, tex);
          loadedCount++;

          logDev(`[TEXTURE OK] ${scene.id} <- ${src} (${loadedCount}/${total})`);
          updateAssetDiagnostic(src, { status: 'TEXTURE_READY' });

          if (loadedCount === total) {
            this.isLoaded = true;
            logDev(`[SceneManager] All ${total} textures loaded and ready.`);

            // Set initial resting state on Hero (Scene 01)
            const heroTex = this.textureMap.get('beginning');
            const heroDim = this.imageDimensions.get('beginning');

            if (heroTex) {
              const align = getSceneAlignment(scene, this.isMobileViewport);
              this.stageMaterial.uniforms.uTextureA.value = heroTex;
              this.stageMaterial.uniforms.uHasTextureA.value = 1.0;
              this.stageMaterial.uniforms.uProgress.value = 0.0;
              this.stageMaterial.uniforms.uAlignA.value.set(align[0], align[1]);
              if (heroDim) {
                this.stageMaterial.uniforms.uImageResA.value.set(heroDim.width, heroDim.height);
              }
              logDev('[SceneManager] Hero texture bound to uTextureA, ready to render');
            } else {
              console.error('[SceneManager] Hero texture missing from textureMap!');
            }

            if (onComplete) onComplete();
          }
        } catch (texErr) {
          console.error(`[TEXTURE FAILED] Three.js texture creation error for ${src}:`, texErr);
          updateAssetDiagnostic(src, { status: 'FAILED', error: String(texErr) });
        }
      };

      img.onerror = (err) => {
        console.error(`[IMAGE FAILED] Browser failed to load asset ${src}:`, err);
        updateAssetDiagnostic(src, { status: 'FAILED', error: 'Network/Decode error' });
      };

      img.src = src;
    });
  }

  public getCurrentState(): CompositorState {
    return this.currentState;
  }

  /**
   * Deterministic DOM-Driven Scene Evaluation:
   * Maps actual DOM container positions to exact scene ownership and transition state.
   */
  public update(
    time: number,
    velocity: number,
    mouse: THREE.Vector2
  ) {
    if (!this.isLoaded || !this.stageMaterial.uniforms || typeof window === 'undefined') {
      return;
    }

    const vh = window.innerHeight;
    const startThreshold = vh * 0.72; // Transition starts when incoming section enters 72% from top
    const endThreshold = vh * 0.16;   // Transition completes when incoming section reaches 16% from top
    const thresholdSpan = Math.max(1, startThreshold - endThreshold);

    // Evaluate the 7 transition boundaries (between Scene i and Scene i+1)
    let activeTransitionIdx = -1;
    let completedTransitionIdx = -1;
    let localProgress = 0.0;

    for (let i = CANONICAL_SCENES.length - 2; i >= 0; i--) {
      const incomingScene = CANONICAL_SCENES[i + 1];
      const targetEl = document.getElementById(incomingScene.domId);

      if (targetEl) {
        const rect = targetEl.getBoundingClientRect();

        if (rect.top <= startThreshold) {
          if (rect.top <= endThreshold) {
            completedTransitionIdx = i;
            break;
          } else {
            activeTransitionIdx = i;
            localProgress = THREE.MathUtils.clamp(
              (startThreshold - rect.top) / thresholdSpan,
              0.0,
              1.0
            );
            break;
          }
        }
      }
    }

    let sceneA: CanonicalScene;
    let sceneB: CanonicalScene | null = null;
    let transitionProgress = 0.0;
    let activeBridgeColor = 0xd4af37;
    let transitionType = 0;

    if (activeTransitionIdx >= 0) {
      // -----------------------------------------------------------
      // ACTIVE TRANSITION WINDOW: Exactly TWO scenes bound
      // -----------------------------------------------------------
      sceneA = CANONICAL_SCENES[activeTransitionIdx];
      sceneB = CANONICAL_SCENES[activeTransitionIdx + 1];
      transitionProgress = localProgress;
      transitionType = activeTransitionIdx;
      activeBridgeColor = sceneA.colorBridge;

      this.currentState = {
        currentSceneName: sceneA.name,
        nextSceneName: sceneB.name,
        transitionIndex: activeTransitionIdx,
        progress: localProgress,
        renderedTextures: (sceneA.image ? 1 : 0) + (sceneB.image ? 1 : 0),
        imageA: sceneA.image,
        imageB: sceneB.image,
      };
    } else {
      // -----------------------------------------------------------
      // RESTING WINDOW: Exactly ONE scene visible (or 0 for closing)
      // -----------------------------------------------------------
      const restingSceneIdx = completedTransitionIdx >= 0 ? completedTransitionIdx + 1 : 0;
      sceneA = CANONICAL_SCENES[restingSceneIdx];
      sceneB = null;
      transitionProgress = 0.0;
      transitionType = completedTransitionIdx >= 0 ? completedTransitionIdx : 0;
      activeBridgeColor = sceneA.colorBridge;

      this.currentState = {
        currentSceneName: sceneA.name,
        nextSceneName: null,
        transitionIndex: -1,
        progress: 0.0,
        renderedTextures: sceneA.image ? 1 : 0,
        imageA: sceneA.image,
        imageB: null,
      };
    }

    // Responsive alignment per scene
    const alignA = getSceneAlignment(sceneA, this.isMobileViewport);

    // Bind Outgoing Texture (Layer A)
    const texA = sceneA.image ? this.textureMap.get(sceneA.id) || null : null;
    const dimA = sceneA.image ? this.imageDimensions.get(sceneA.id) : null;
    this.stageMaterial.uniforms.uHasTextureA.value = texA ? 1.0 : 0.0;
    this.stageMaterial.uniforms.uTextureA.value = texA;
    this.stageMaterial.uniforms.uAlignA.value.set(alignA[0], alignA[1]);
    if (dimA) {
      this.stageMaterial.uniforms.uImageResA.value.set(dimA.width, dimA.height);
    }

    // Bind Incoming Texture (Layer C)
    const texB = sceneB && sceneB.image ? this.textureMap.get(sceneB.id) || null : null;
    const dimB = sceneB && sceneB.image ? this.imageDimensions.get(sceneB.id) : null;
    this.stageMaterial.uniforms.uHasTextureB.value = texB ? 1.0 : 0.0;
    this.stageMaterial.uniforms.uTextureB.value = texB;
    if (sceneB) {
      const alignB = getSceneAlignment(sceneB, this.isMobileViewport);
      this.stageMaterial.uniforms.uAlignB.value.set(alignB[0], alignB[1]);
      if (dimB) {
        this.stageMaterial.uniforms.uImageResB.value.set(dimB.width, dimB.height);
      }
    }

    // Uniform Updates
    this.stageMaterial.uniforms.uProgress.value = transitionProgress;
    this.stageMaterial.uniforms.uTime.value = time;
    this.stageMaterial.uniforms.uTransitionType.value = transitionType;
    this.stageMaterial.uniforms.uColorBridge.value.setHex(activeBridgeColor);
    this.stageMaterial.uniforms.uMouse.value.copy(mouse);

    // Logging on scene transitions (item 10 requirement)
    if (this.lastLoggedScene !== sceneA.id + (sceneB ? '->' + sceneB.id : '')) {
      this.lastLoggedScene = sceneA.id + (sceneB ? '->' + sceneB.id : '');
      logDev(
        `[SCENE BIND] CURRENT: ${sceneA.id} (${sceneA.image}) | NEXT: ${sceneB ? sceneB.id + ' (' + sceneB.image + ')' : 'NONE'} | TEX A: ${texA ? 'loaded' : 'missing'} | TEX B: ${texB ? 'loaded' : 'unused'}`
      );
    }

    // Particle Atmospheric Dynamics (Layer D)
    const transitionPeak = Math.sin(transitionProgress * Math.PI);
    const particleSpeed = 1.0 + transitionPeak * 0.7 + Math.min(1.0, Math.abs(velocity) * 0.0015);

    this.particles.update(time, 0, sceneA.id);
    if (this.particles.points.material instanceof THREE.ShaderMaterial) {
      this.particles.points.material.uniforms.uParticleSpeed.value = particleSpeed;
    }
  }

  public resize(width: number, height: number, cameraFov: number, cameraDistance: number) {
    this.width = width;
    this.height = height;
    this.isMobileViewport = width < 640;

    if (this.stageMaterial.uniforms) {
      this.stageMaterial.uniforms.uResolution.value.set(width, height);
      this.stageMaterial.uniforms.uIsMobile.value = this.isMobileViewport ? 1.0 : 0.0;
    }

    // Scale stage mesh to match visible frustum + 4% margin for camera sway/parallax
    const vFov = (cameraFov * Math.PI) / 180;
    const visibleHeight = 2 * Math.tan(vFov / 2) * cameraDistance;
    const visibleWidth = visibleHeight * (width / Math.max(1, height));

    this.stageMesh.scale.set(visibleWidth * 1.04, visibleHeight * 1.04, 1);

    logDev(
      `[DIMENSIONS] viewport: ${width}x${height} | frustum: ${visibleWidth.toFixed(2)}x${visibleHeight.toFixed(2)} | plane: ${(visibleWidth * 1.04).toFixed(2)}x${(visibleHeight * 1.04).toFixed(2)}`
    );
  }

  public dispose() {
    this.stageMesh.geometry.dispose();
    this.stageMaterial.dispose();
    this.textureMap.forEach((t) => t.dispose());
    this.textureMap.clear();
    this.imageDimensions.clear();
    this.particles.dispose();
  }
}
