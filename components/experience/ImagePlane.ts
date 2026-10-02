import * as THREE from 'three';
import { createTransitionMaterial } from './TransitionShader';
import { IMAGE_SCALE } from '@/lib/motion-config';

export interface ImageSceneConfig {
  id: string;
  path: string;
  depth: number;
  name: string;
}

export class ImagePlane {
  public id: string;
  public depth: number;
  public mesh: THREE.Mesh;
  public material: THREE.ShaderMaterial;
  private texture: THREE.Texture | null = null;
  public isLoaded: boolean = false;

  constructor(
    config: ImageSceneConfig,
    viewportWidth: number,
    viewportHeight: number
  ) {
    this.id = config.id;
    this.depth = config.depth;

    // Plane geometry with modest subdivisions for smooth spatial wave
    const geometry = new THREE.PlaneGeometry(
      IMAGE_SCALE.PLANE_WIDTH,
      IMAGE_SCALE.PLANE_HEIGHT,
      32,
      20
    );

    this.material = createTransitionMaterial(viewportWidth, viewportHeight);
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.position.set(0, 0, this.depth);

    // Initial opacity
    this.material.uniforms.uOpacity.value = 1.0;
  }

  public loadTexture(loader: THREE.TextureLoader, onLoaded?: () => void) {
    loader.load(
      this.getPathForId(this.id),
      (tex) => {
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;
        tex.colorSpace = THREE.SRGBColorSpace;
        this.texture = tex;
        this.material.uniforms.uTexture.value = tex;
        this.isLoaded = true;
        if (onLoaded) onLoaded();
      },
      undefined,
      (err) => {
        console.warn(`Could not load texture for scene ${this.id}:`, err);
      }
    );
  }

  private getPathForId(id: string): string {
    const map: Record<string, string> = {
      hero: '/images/hero.webp',
      hills: '/images/seshachalam-hills.webp',
      entrance: '/images/wedding-entrance.webp',
      mandapam: '/images/wedding-mandapam.webp',
      temple: '/images/tirumala-gopuram.webp',
      deepam: '/images/deepam.webp',
      penugonda: '/images/penugonda-home.webp',
    };
    return map[id] || '/images/hero.webp';
  }

  public update(time: number, mouse: THREE.Vector2) {
    if (this.material.uniforms) {
      this.material.uniforms.uTime.value = time;
      this.material.uniforms.uMouse.value.copy(mouse);
    }
  }

  public setProgress(progress: number) {
    if (this.material.uniforms) {
      this.material.uniforms.uProgress.value = progress;
    }
  }

  public setIntensity(intensity: number) {
    if (this.material.uniforms) {
      this.material.uniforms.uIntensity.value = intensity;
    }
  }

  public setOpacity(opacity: number) {
    if (this.material.uniforms) {
      this.material.uniforms.uOpacity.value = opacity;
    }
  }

  public setExposure(exposure: number) {
    if (this.material.uniforms) {
      this.material.uniforms.uExposure.value = exposure;
    }
  }

  public setRgbShift(shift: number) {
    if (this.material.uniforms) {
      this.material.uniforms.uRgbShift.value = shift;
    }
  }

  public setPosition(x: number, y: number, z: number) {
    this.mesh.position.set(x, y, z);
  }

  public setScale(scale: number) {
    this.mesh.scale.set(scale, scale, 1);
  }

  public resize(width: number, height: number, cameraFov: number, cameraDistance: number) {
    this.material.uniforms.uResolution.value.set(width, height);

    // Compute visible height and width at the plane's resting camera distance
    const vFov = (cameraFov * Math.PI) / 180;
    const planeDistance = cameraDistance;
    const visibleHeight = 2 * Math.tan(vFov / 2) * planeDistance;
    const visibleWidth = visibleHeight * (width / height);

    // Scale plane to cover the viewport comfortably without black borders
    const targetScale = Math.max(
      visibleWidth / IMAGE_SCALE.PLANE_WIDTH,
      visibleHeight / IMAGE_SCALE.PLANE_HEIGHT
    ) * 1.05;

    this.mesh.scale.set(targetScale, targetScale, 1);
  }

  public dispose() {
    this.mesh.geometry.dispose();
    this.material.dispose();
    if (this.texture) {
      this.texture.dispose();
    }
  }
}
