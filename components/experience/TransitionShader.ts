import * as THREE from 'three';

export const dualTransitionVertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const dualTransitionFragmentShader = `
precision highp float;

uniform sampler2D uTextureA;
uniform sampler2D uTextureB;
uniform float uHasTextureA;
uniform float uHasTextureB;
uniform vec2 uImageResA;
uniform vec2 uImageResB;
uniform float uProgress;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform int uTransitionType;
uniform vec3 uColorBridge;
uniform vec2 uAlignA;
uniform vec2 uAlignB;
uniform float uIsMobile;

varying vec2 vUv;

// Deterministic 2D Simplex Noise for smooth, non-flickering organic reveal boundaries
vec3 mod289v3(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289v2(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute3(vec3 x) { return mod289v3(((x * 34.0) + 1.0) * x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187,
                      0.366025403784439,
                     -0.577350269189626,
                      0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289v2(i);
  vec3 p = permute3(permute3(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x_ = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x_) - 0.5;
  vec3 ox = floor(x_ + 0.5);
  vec3 a0 = x_ - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.y = a0.y * x12.x + h.y * x12.y;
  g.z = a0.z * x12.z + h.z * x12.w;
  return 130.0 * dot(m, g);
}

// True object-fit: cover mapping preserving exact source aspect ratio without stretching
vec2 getCoverUv(vec2 uv, vec2 screenRes, vec2 imageRes, vec2 align) {
  float sAspect = screenRes.x / max(1.0, screenRes.y);
  float iAspect = max(0.01, imageRes.x) / max(0.01, imageRes.y);
  vec2 scale = vec2(1.0);
  vec2 offset = vec2(0.0);

  if (sAspect > iAspect) {
    // Screen is wider than image: fit width, crop height
    scale.y = iAspect / sAspect;
    offset.y = (1.0 - scale.y) * align.y;
  } else {
    // Screen is taller than image (Mobile Portrait): fit height, crop width
    scale.x = sAspect / iAspect;
    offset.x = (1.0 - scale.x) * align.x;
  }
  return clamp(uv * scale + offset, 0.0, 1.0);
}

void main() {
  vec3 maroonBg = vec3(0.165, 0.047, 0.067); // #2A0C11

  // Aspect-corrected radial vignette for cinematic contrast
  float aspect = uResolution.x / max(1.0, uResolution.y);
  vec2 centerVec = (vUv - 0.5) * vec2(aspect, 1.0);
  float dist = length(centerVec);
  float vignette = smoothstep(1.08, 0.38, dist);

  // -------------------------------------------------------------
  // RESTING STATE A: p <= 0.001
  // Exactly ONE image sampled. Zero distortion. Zero chromatic aberration.
  // -------------------------------------------------------------
  if (uProgress <= 0.001) {
    if (uHasTextureA < 0.5) {
      gl_FragColor = vec4(maroonBg, 1.0);
      return;
    }
    vec2 uvA = getCoverUv(vUv, uResolution, uImageResA, uAlignA);
    vec3 colorA = texture2D(uTextureA, uvA).rgb;
    vec3 finalColor = mix(maroonBg, colorA, vignette);
    gl_FragColor = vec4(finalColor, 1.0);
    return;
  }

  // -------------------------------------------------------------
  // RESTING STATE B: p >= 0.999
  // Exactly ONE image sampled. Zero distortion. Zero chromatic aberration.
  // -------------------------------------------------------------
  if (uProgress >= 0.999) {
    if (uHasTextureB < 0.5) {
      gl_FragColor = vec4(maroonBg, 1.0);
      return;
    }
    vec2 uvB = getCoverUv(vUv, uResolution, uImageResB, uAlignB);
    vec3 colorB = texture2D(uTextureB, uvB).rgb;
    vec3 finalColor = mix(maroonBg, colorB, vignette);
    gl_FragColor = vec4(finalColor, 1.0);
    return;
  }

  // -------------------------------------------------------------
  // ACTIVE TRANSITION (0.001 < uProgress < 0.999)
  // Layer A (Outgoing) -> Layer B (Veil) -> Layer C (Incoming) -> Layer D (Atmosphere)
  // -------------------------------------------------------------

  // Mobile adjustment: 50% displacement on mobile (Section 15)
  float mobileStrength = uIsMobile > 0.5 ? 0.50 : 1.0;

  // 1. Transition Veil envelope peaking at 0.45-0.55
  float veil = smoothstep(0.15, 0.45, uProgress) * (1.0 - smoothstep(0.55, 0.82, uProgress));

  // 2. Chromatic Aberration: subtle on desktop (0.0015), nearly invisible on mobile (0.0004)
  float chromaWindow = smoothstep(0.40, 0.50, uProgress) * (1.0 - smoothstep(0.50, 0.60, uProgress));
  float chromaOffset = chromaWindow * (uIsMobile > 0.5 ? 0.0004 : 0.0015);

  // 3. Fluid Boundary Displacement strictly near the reveal boundary
  float noise = snoise(vUv * 3.2);
  vec2 boundaryDisplacement = vec2(
    sin(vUv.y * 5.0 + uTime * 1.0),
    cos(vUv.x * 5.0 + uTime * 0.8)
  ) * (0.016 * veil * mobileStrength);

  // 4. Directional Soft Reveal Mask for Incoming Scene
  float reveal = 0.0;
  float progressNorm = clamp((uProgress - 0.20) / 0.65, 0.0, 1.0);

  if (uTransitionType == 0) {
    reveal = smoothstep(0.0, 1.0, (progressNorm - vUv.y * 0.20 + noise * 0.12) / 0.5);
  } else if (uTransitionType == 1) {
    reveal = smoothstep(0.0, 1.0, (progressNorm - (vUv.x * 0.45 + vUv.y * 0.45) * 0.35 + noise * 0.14) / 0.5);
  } else if (uTransitionType == 2) {
    reveal = smoothstep(0.0, 1.0, (progressNorm - vUv.x * 0.35 + noise * 0.15) / 0.5);
  } else if (uTransitionType == 3) {
    float pillar = abs(sin(vUv.x * 3.14159265 * 4.0));
    reveal = smoothstep(0.0, 1.0, (progressNorm + pillar * 0.12 + noise * 0.10 - vUv.y * 0.18) / 0.5);
  } else if (uTransitionType == 4) {
    float distLamps = length(vUv - vec2(0.5, 0.55));
    reveal = smoothstep(0.0, 1.0, (progressNorm * 1.35 - distLamps * 0.55 + noise * 0.12) / 0.5);
  } else if (uTransitionType == 5) {
    reveal = smoothstep(0.0, 1.0, (progressNorm - vUv.y * 0.25 + noise * 0.14) / 0.5);
  } else {
    float edge = smoothstep(0.15, 0.85, length(vUv - 0.5));
    reveal = smoothstep(0.15, 0.85, uProgress * 1.25 + edge * 0.3);
  }

  reveal = clamp(reveal, 0.0, 1.0);

  // Sample Layer A (Outgoing Photograph)
  vec3 colorA = maroonBg;
  if (uHasTextureA > 0.5) {
    vec2 uvA = getCoverUv(vUv + boundaryDisplacement * (1.0 - reveal), uResolution, uImageResA, uAlignA);
    if (chromaOffset > 0.0001) {
      colorA.r = texture2D(uTextureA, uvA + vec2(chromaOffset, 0.0)).r;
      colorA.g = texture2D(uTextureA, uvA).g;
      colorA.b = texture2D(uTextureA, uvA - vec2(chromaOffset, 0.0)).b;
    } else {
      colorA = texture2D(uTextureA, uvA).rgb;
    }
  }

  // Sample Layer C (Incoming Photograph)
  vec3 colorC = maroonBg;
  if (uHasTextureB > 0.5) {
    vec2 uvB = getCoverUv(vUv + boundaryDisplacement * reveal, uResolution, uImageResB, uAlignB);
    if (chromaOffset > 0.0001) {
      colorC.r = texture2D(uTextureB, uvB + vec2(chromaOffset, 0.0)).r;
      colorC.g = texture2D(uTextureB, uvB).g;
      colorC.b = texture2D(uTextureB, uvB - vec2(chromaOffset, 0.0)).b;
    } else {
      colorC = texture2D(uTextureB, uvB).rgb;
    }
  }

  // Composite Layer A & Layer C via reveal mask
  vec3 composite = mix(colorA, colorC, reveal);

  // Layer B (Transition Veil)
  vec3 veilColor = uColorBridge * 1.25;
  composite = mix(composite, composite + veilColor * 0.35, veil * 0.38);

  // Layer D (Atmospheric Edge Vignette)
  composite = mix(maroonBg, composite, vignette);

  gl_FragColor = vec4(composite, 1.0);
}
`;

export interface DualTransitionUniforms {
  uTextureA: { value: THREE.Texture | null };
  uTextureB: { value: THREE.Texture | null };
  uHasTextureA: { value: number };
  uHasTextureB: { value: number };
  uImageResA: { value: THREE.Vector2 };
  uImageResB: { value: THREE.Vector2 };
  uProgress: { value: number };
  uTime: { value: number };
  uResolution: { value: THREE.Vector2 };
  uMouse: { value: THREE.Vector2 };
  uTransitionType: { value: number };
  uColorBridge: { value: THREE.Color };
  uAlignA: { value: THREE.Vector2 };
  uAlignB: { value: THREE.Vector2 };
  uIsMobile: { value: number };
}

export function createDualTransitionMaterial(
  width: number,
  height: number
): THREE.ShaderMaterial {
  const isMobileInitial = typeof window !== 'undefined' && window.innerWidth < 640 ? 1.0 : 0.0;

  const uniforms: DualTransitionUniforms = {
    uTextureA: { value: null },
    uTextureB: { value: null },
    uHasTextureA: { value: 0.0 },
    uHasTextureB: { value: 0.0 },
    uImageResA: { value: new THREE.Vector2(16.0, 9.0) },
    uImageResB: { value: new THREE.Vector2(16.0, 9.0) },
    uProgress: { value: 0.0 },
    uTime: { value: 0.0 },
    uResolution: { value: new THREE.Vector2(width, height) },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uTransitionType: { value: 0 },
    uColorBridge: { value: new THREE.Color(0xd4af37) },
    uAlignA: { value: new THREE.Vector2(0.5, 0.5) },
    uAlignB: { value: new THREE.Vector2(0.5, 0.5) },
    uIsMobile: { value: isMobileInitial },
  };

  return new THREE.ShaderMaterial({
    vertexShader: dualTransitionVertexShader,
    fragmentShader: dualTransitionFragmentShader,
    uniforms: uniforms as unknown as Record<string, THREE.IUniform>,
    transparent: false,
    depthWrite: false,
    depthTest: false,
  });
}

export const createTransitionMaterial = createDualTransitionMaterial;
