import * as THREE from 'three';
import { MOUSE_PARALLAX, prefersReducedMotion } from '@/lib/motion-config';

export interface CameraSettings {
  fov: number;
  baseZ: number;
  maxSwayX: number;
  maxSwayY: number;
  movementScale: number;
}

/**
 * Calculates adaptive camera parameters based on viewport geometry and orientation.
 * Ensures portrait phones feel spacious rather than claustrophobic or squeezed.
 */
export function getResponsiveCameraSettings(width: number, height: number): CameraSettings {
  const aspect = width / Math.max(1, height);
  const isPortrait = aspect < 1.0;
  const isMobile = width < 640 || (isPortrait && width < 768);
  const isTablet = !isMobile && (width < 1024 || (isPortrait && width < 900));

  if (isMobile) {
    if (isPortrait) {
      // Portrait mobile (e.g. 375x812, 390x844, 412x915)
      return {
        fov: 52,
        baseZ: 5.4,
        maxSwayX: 0.05,
        maxSwayY: 0.04,
        movementScale: 0.50, // 50% movement on mobile per Section 15
      };
    } else {
      // Landscape mobile (e.g. 844x390, 915x412)
      return {
        fov: 46,
        baseZ: 5.4,
        maxSwayX: 0.06,
        maxSwayY: 0.04,
        movementScale: 0.55,
      };
    }
  } else if (isTablet) {
    return {
      fov: isPortrait ? 50 : 46,
      baseZ: 5.4,
      maxSwayX: 0.10,
      maxSwayY: 0.08,
      movementScale: 0.75,
    };
  } else {
    // Desktop (>= 1024px)
    return {
      fov: 46,
      baseZ: 5.4,
      maxSwayX: 0.18,
      maxSwayY: 0.12,
      movementScale: 1.0,
    };
  }
}

export class CameraController {
  public camera: THREE.PerspectiveCamera;
  private baseZ: number = 5.4;
  private currentZ: number = 5.4;
  private currentFov: number = 46;
  private currentSettings: CameraSettings;
  private mouseCurrent: THREE.Vector2 = new THREE.Vector2(0, 0);
  private mouseTarget: THREE.Vector2 = new THREE.Vector2(0, 0);
  private scrollProgress: number = 0;
  private velocity: number = 0;

  constructor(width: number = 1920, height: number = 1080) {
    this.currentSettings = getResponsiveCameraSettings(width, height);
    this.currentFov = this.currentSettings.fov;
    this.baseZ = this.currentSettings.baseZ;
    this.currentZ = this.baseZ;

    const aspect = width / Math.max(1, height);
    this.camera = new THREE.PerspectiveCamera(this.currentFov, aspect, 0.1, 100);
    this.camera.position.set(0, 0, this.baseZ);
  }

  public setScrollProgress(progress: number, velocity: number = 0) {
    this.scrollProgress = THREE.MathUtils.clamp(progress, 0, 1);
    this.velocity = velocity;
  }

  public setMouse(normalizedX: number, normalizedY: number) {
    this.mouseTarget.set(normalizedX, normalizedY);
  }

  public update(_deltaTime: number) {
    const isReduced = prefersReducedMotion();

    // Mouse parallax smoothing
    this.mouseCurrent.lerp(this.mouseTarget, MOUSE_PARALLAX.LERP_SPEED);

    if (isReduced) {
      this.camera.position.set(0, 0, this.baseZ);
      this.camera.rotation.set(0, 0, 0);
      return;
    }

    const p = this.scrollProgress;
    const { maxSwayX, maxSwayY, movementScale } = this.currentSettings;

    // Camera moves forward during transition waves, scaled for mobile
    const wave = Math.sin(p * Math.PI * 6.0);
    const forwardSurge = (Math.abs(wave) * 0.28 + Math.min(0.2, Math.abs(this.velocity) * 0.0003)) * movementScale;
    const targetZ = this.baseZ - forwardSurge;
    this.currentZ = THREE.MathUtils.lerp(this.currentZ, targetZ, 0.08);

    // Lateral and vertical micro-movements
    let swayX = Math.sin(p * Math.PI * 4.0) * maxSwayX;
    let swayY = Math.cos(p * Math.PI * 3.0) * maxSwayY;

    // Mouse parallax offset
    const mouseX = this.mouseCurrent.x * (maxSwayX * 0.6);
    const mouseY = -this.mouseCurrent.y * (maxSwayY * 0.6);

    swayX += mouseX;
    swayY += mouseY;

    // Roll rotation scaled for mobile
    const rollZ = Math.sin(p * Math.PI * 3.5) * (0.012 * movementScale);

    this.camera.position.set(swayX, swayY, this.currentZ);
    this.camera.rotation.z = rollZ;
    this.camera.rotation.y = -swayX * 0.035;
    this.camera.rotation.x = swayY * 0.035;
  }

  public getZ(): number {
    return this.camera.position.z;
  }

  public getBaseZ(): number {
    return this.baseZ;
  }

  public getFov(): number {
    return this.currentFov;
  }

  public resize(width: number, height: number) {
    this.currentSettings = getResponsiveCameraSettings(width, height);
    this.currentFov = this.currentSettings.fov;
    this.baseZ = this.currentSettings.baseZ;

    const aspect = width / Math.max(1, height);
    this.camera.aspect = aspect;
    this.camera.fov = this.currentFov;
    this.camera.updateProjectionMatrix();
  }
}
