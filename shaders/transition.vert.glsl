varying vec2 vUv;
varying vec3 vPosition;
uniform float uTime;
uniform float uProgress;
uniform float uIntensity;

void main() {
  vUv = uv;
  vec3 pos = position;

  // Gentle spatial surface breath
  float breath = sin(uTime * 0.8 + pos.x * 0.5) * cos(uTime * 0.6 + pos.y * 0.5) * 0.04;
  pos.z += breath * (1.0 + uIntensity * 0.5);

  // Subtle curvature during active transitions
  float wave = sin(pos.x * 2.0 + uTime) * uProgress * 0.08 * uIntensity;
  pos.z += wave;

  vPosition = pos;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
