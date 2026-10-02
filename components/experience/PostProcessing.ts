import * as THREE from 'three';
import { RGB_SHIFT } from '@/lib/motion-config';

/**
 * Lightweight Post-Processing & Cinematic Light Sweep Overlay
 * Designed for 60fps mobile & desktop without heavy multi-pass render targets.
 */
export class PostProcessing {
  public mesh: THREE.Mesh;
  private material: THREE.ShaderMaterial;

  constructor() {
    const geometry = new THREE.PlaneGeometry(2, 2);

    this.material = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uLightSweep;
        uniform float uChroma;
        uniform vec3 uSweepColor;
        varying vec2 vUv;

        void main() {
          vec2 uv = vUv;
          vec4 color = vec4(0.0);

          // Subtle diagonal gold/maroon light sweep during transition 03/04
          if (uLightSweep > 0.001) {
            float sweepPos = sin(uTime * 1.5) * 0.5 + 0.5;
            float line = smoothstep(0.18, 0.0, abs((uv.x + uv.y * 0.5) - sweepPos * 1.5));
            color.rgb += uSweepColor * line * uLightSweep * 0.4;
            color.a += line * uLightSweep * 0.25;
          }

          gl_FragColor = color;
        }
      `,
      uniforms: {
        uTime: { value: 0 },
        uLightSweep: { value: 0 },
        uChroma: { value: 0 },
        uSweepColor: { value: new THREE.Color(0xd4af37) },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.frustumCulled = false;
  }

  public update(time: number, lightSweepIntensity: number = 0, chroma: number = 0) {
    if (!this.material.uniforms) return;
    this.material.uniforms.uTime.value = time;
    this.material.uniforms.uLightSweep.value = lightSweepIntensity;
    this.material.uniforms.uChroma.value = chroma * RGB_SHIFT.MAX_CHROMA;
  }

  public dispose() {
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}
