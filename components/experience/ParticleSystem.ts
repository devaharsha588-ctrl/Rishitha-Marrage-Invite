import * as THREE from 'three';
import { PARTICLE_COUNT, isMobile } from '@/lib/motion-config';

export class ParticleSystem {
  public points: THREE.Points;
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private count: number;
  private velocities: Float32Array;

  constructor() {
    this.count = isMobile() ? PARTICLE_COUNT.MOBILE : PARTICLE_COUNT.DESKTOP;

    const positions = new Float32Array(this.count * 3);
    const colors = new Float32Array(this.count * 3);
    const scales = new Float32Array(this.count);
    this.velocities = new Float32Array(this.count * 3);

    const goldColor = new THREE.Color(0xd4af37);
    const warmAmber = new THREE.Color(0xffb852);
    const petalRose = new THREE.Color(0xd97c83);

    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3;

      // Spread in 3D volume in front of stage plane (z between 0.5 and 4.6)
      positions[i3] = (Math.random() - 0.5) * 16.0;
      positions[i3 + 1] = (Math.random() - 0.5) * 10.0;
      positions[i3 + 2] = 0.5 + Math.random() * 4.1;

      // Color themes: predominantly antique gold, with warm amber and petal rose
      const r = Math.random();
      const chosenColor = r < 0.65 ? goldColor : r < 0.85 ? warmAmber : petalRose;

      colors[i3] = chosenColor.r;
      colors[i3 + 1] = chosenColor.g;
      colors[i3 + 2] = chosenColor.b;

      // Scale variation
      scales[i] = 2.0 + Math.random() * 3.5;

      // Gentle individual velocities (drifting upward and slightly forward)
      this.velocities[i3] = (Math.random() - 0.5) * 0.006;
      this.velocities[i3 + 1] = 0.004 + Math.random() * 0.009;
      this.velocities[i3 + 2] = 0.003 + Math.random() * 0.007; // drift toward camera
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    this.geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uParticleSpeed: { value: 1.0 },
      },
      vertexShader: `
        attribute vec3 aColor;
        attribute float aScale;
        varying vec3 vColor;
        varying float vAlpha;
        uniform float uTime;
        uniform float uParticleSpeed;

        void main() {
          vColor = aColor;
          vec3 pos = position;

          // Gentle ambient oscillation
          pos.x += sin(uTime * 0.6 + position.y * 0.5) * 0.18;
          pos.y += cos(uTime * 0.4 + position.x * 0.5) * 0.15;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;

          // Soft depth fade near camera and near plane
          float camDist = abs(mvPosition.z);
          vAlpha = smoothstep(0.4, 1.2, camDist) * smoothstep(7.0, 3.5, camDist);

          // Size attenuation
          gl_PointSize = aScale * (95.0 / max(0.5, -mvPosition.z));
          gl_PointSize = clamp(gl_PointSize, 1.5, 18.0);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          vec2 coord = gl_PointCoord - vec2(0.5);
          float dist = length(coord);
          if (dist > 0.5) discard;

          // Soft circular falloff
          float strength = smoothstep(0.5, 0.04, dist);
          gl_FragColor = vec4(vColor, strength * vAlpha * 0.85);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.points = new THREE.Points(this.geometry, this.material);
  }

  public update(time: number, _cameraZ: number, activeZone: string) {
    if (!this.material.uniforms) return;

    this.material.uniforms.uTime.value = time;

    // Adapt speed according to current spatial zone
    let speed = 1.0;
    if (activeZone === 'entrance' || activeZone === 'mandapam') {
      speed = 1.35; // floral motes
    } else if (activeZone === 'deepam') {
      speed = 0.85; // warm glowing motes
    } else if (activeZone === 'closing') {
      speed = 0.45; // calm stillness
    }
    this.material.uniforms.uParticleSpeed.value = speed;

    const posAttr = this.geometry.attributes.position as THREE.BufferAttribute;
    const array = posAttr.array as Float32Array;

    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3;
      array[i3 + 1] += this.velocities[i3 + 1] * speed;
      array[i3 + 2] += this.velocities[i3 + 2] * speed;

      // Wrap vertically
      if (array[i3 + 1] > 5.5) {
        array[i3 + 1] = -5.5;
      }

      // Wrap depth in front of image plane
      if (array[i3 + 2] > 4.6) {
        array[i3 + 2] = 0.5;
      }
    }
    posAttr.needsUpdate = true;
  }

  public dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}
