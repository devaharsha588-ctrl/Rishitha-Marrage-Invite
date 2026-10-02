uniform sampler2D uTextureA;
uniform sampler2D uTextureB;
uniform float uProgress;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uVelocity;
uniform float uIntensity;
uniform int uTransitionType;
uniform vec3 uColorBridge;

varying vec2 vUv;

// Procedural 2D Simplex/Perlin-style value noise
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                     -0.577350269189626,  // -1.0 + 2.0 * C.x
                      0.024390243902439); // 1.0 / 41.0
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
        + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec2 uv = vUv;
  vec2 toCenter = uv - 0.5;
  float dist = length(toCenter);

  // Transition curve: bell curve that peaks at p = 0.5 and is strictly 0.0 at p = 0 and p = 1
  float curve = sin(uProgress * 3.14159265);
  float velFactor = 1.0 + clamp(abs(uVelocity) * 0.0015, 0.0, 0.6);

  // Low-frequency organic noise for fluid transition mask
  float n1 = snoise(uv * 2.8 + vec2(uTime * 0.15, uTime * 0.1));
  float n2 = snoise(uv * 5.6 - vec2(uTime * 0.2, uTime * 0.15)) * 0.5;
  float organicNoise = (n1 + n2) * 0.5;

  // Calculate transition mask and displacement depending on transition type
  float mask = 0.0;
  vec2 dispA = vec2(0.0);
  vec2 dispB = vec2(0.0);
  float chroma = 0.0;

  if (uTransitionType == 0) {
    // 0: HERO -> COUNTDOWN (Hero to Hills)
    // Organic fluid mask unfolding from center with mild displacement
    float threshold = uProgress * 1.5 - 0.25;
    mask = smoothstep(threshold - 0.35, threshold + 0.35, organicNoise + (1.0 - dist * 0.8));
    
    vec2 dir = normalize(toCenter + vec2(0.0001));
    dispA = dir * curve * 0.04 * uIntensity * velFactor;
    dispB = -dir * (1.0 - uProgress) * 0.03 * uIntensity;

  } else if (uTransitionType == 1) {
    // 1: COUNTDOWN -> HALDI & SANGEETH (Hills to Entrance)
    // Sunlight expansion from horizon, downward shift on hills
    float sunlight = smoothstep(0.7, 0.1, abs(uv.y - 0.35)) * curve * 0.5;
    float threshold = uProgress * 1.4 - 0.2;
    mask = smoothstep(threshold - 0.3, threshold + 0.3, organicNoise + (1.0 - uv.y));

    dispA = vec2(0.0, curve * 0.045 * velFactor);
    dispB = vec2(snoise(uv * 4.0) * 0.02 * (1.0 - uProgress), 0.0);

  } else if (uTransitionType == 2) {
    // 2: HALDI -> PELLI KUTHURU (Entrance to Mandapam)
    // Floral organic mask that opens around floral centers with depth softness
    float flowerCenters = snoise(uv * 6.0 + organicNoise);
    float threshold = uProgress * 1.4 - 0.2;
    mask = smoothstep(threshold - 0.35, threshold + 0.35, flowerCenters * 0.4 + (1.0 - dist));

    dispA = vec2(snoise(uv * 3.0), snoise(uv * 3.0 + 1.0)) * curve * 0.035 * uIntensity;
    dispB = vec2(snoise(uv * 4.0), snoise(uv * 4.0 + 2.0)) * (1.0 - uProgress) * 0.025;

  } else if (uTransitionType == 3) {
    // 3: PELLI KUTHURU -> WEDDING CEREMONY (Mandapam to Gopuram)
    // Architectural pillar lines + temporary chromatic separation
    float pillars = sin(uv.x * 18.0 + organicNoise * 2.0) * 0.25;
    float threshold = uProgress * 1.35 - 0.15;
    mask = smoothstep(threshold - 0.3, threshold + 0.3, pillars + (1.0 - uv.y * 0.5));

    chroma = curve * 0.0055 * velFactor;
    dispA = vec2(0.0, curve * 0.035 * uIntensity);
    dispB = vec2(0.0, -(1.0 - uProgress) * 0.025);

  } else if (uTransitionType == 4) {
    // 4: WEDDING CEREMONY -> JOIN (Gopuram to Deepam)
    // Radial warm light bloom expanding from center
    float radialBloom = 1.0 - smoothstep(0.0, 0.8, dist);
    float threshold = uProgress * 1.5 - 0.25;
    mask = smoothstep(threshold - 0.35, threshold + 0.35, radialBloom * 0.6 + organicNoise * 0.4);

    dispA = toCenter * curve * 0.05 * uIntensity;
    dispB = -toCenter * (1.0 - uProgress) * 0.035;

  } else if (uTransitionType == 5) {
    // 5: JOIN -> PENUGONDA (Deepam to Penugonda Home)
    // Home reveals through warm light mask as deepam bends
    float threshold = uProgress * 1.4 - 0.2;
    mask = smoothstep(threshold - 0.35, threshold + 0.35, organicNoise + uv.x * 0.3 + (1.0 - uv.y * 0.5));

    dispA = vec2(curve * 0.03, snoise(uv * 4.0) * 0.02 * curve);
    dispB = vec2(-(1.0 - uProgress) * 0.02, 0.0);

  } else {
    // 6: PENUGONDA -> CLOSING (Penugonda to Deep Maroon Memory)
    // Edges dissolve smoothly into deep maroon
    float threshold = uProgress * 1.25;
    mask = smoothstep(threshold - 0.3, threshold + 0.3, (1.0 - dist) + organicNoise * 0.3);
    dispA = toCenter * curve * 0.035;
  }

  // Sample Texture A with displacement
  vec2 uvA = clamp(uv + dispA, 0.0, 1.0);
  vec4 colA;
  if (chroma > 0.0005) {
    float r = texture2D(uTextureA, uvA + vec2(chroma, 0.0)).r;
    float g = texture2D(uTextureA, uvA).g;
    float b = texture2D(uTextureA, uvA - vec2(chroma, 0.0)).b;
    colA = vec4(r, g, b, 1.0);
  } else {
    colA = texture2D(uTextureA, uvA);
  }

  // Sample Texture B with displacement
  vec2 uvB = clamp(uv + dispB, 0.0, 1.0);
  vec4 colB;
  if (uTransitionType == 6) {
    // Final closing world is deep sacred maroon (#2A0C11)
    colB = vec4(0.165, 0.047, 0.067, 1.0);
  } else {
    if (chroma > 0.0005) {
      float r = texture2D(uTextureB, uvB + vec2(chroma, 0.0)).r;
      float g = texture2D(uTextureB, uvB).g;
      float b = texture2D(uTextureB, uvB - vec2(chroma, 0.0)).b;
      colB = vec4(r, g, b, 1.0);
    } else {
      colB = texture2D(uTextureB, uvB);
    }
  }

  // True Scene Blending: Blend A and B through the soft organic procedural mask
  float blendFactor = clamp(mask, 0.0, 1.0);
  vec3 finalColor = mix(colA.rgb, colB.rgb, blendFactor);

  // Color Bridge: subtle warm maroon/gold shift during the transition midpoint (0.35 to 0.65)
  float bridgeWeight = smoothstep(0.2, 0.5, uProgress) * smoothstep(0.8, 0.5, uProgress);
  finalColor = mix(finalColor, finalColor * uColorBridge * 1.25, bridgeWeight * 0.35);

  // Soft border vignette so scene sits gracefully inside the viewport
  float vignette = smoothstep(0.92, 0.35, dist);
  finalColor = mix(vec3(0.165, 0.047, 0.067), finalColor, vignette);

  gl_FragColor = vec4(finalColor, 1.0);
}
