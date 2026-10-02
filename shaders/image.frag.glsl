uniform sampler2D uTexture;
uniform float uOpacity;
uniform float uWarmth;
uniform vec3 uTint;

varying vec2 vUv;
varying vec3 vWorldPosition;

void main() {
  vec4 color = texture2D(uTexture, vUv);
  
  // Warm gold/maroon subtle grading
  vec3 warmTone = mix(color.rgb, color.rgb * uTint, uWarmth);
  
  // Soft boundary feather
  float edgeX = smoothstep(0.0, 0.05, vUv.x) * smoothstep(1.0, 0.95, vUv.x);
  float edgeY = smoothstep(0.0, 0.05, vUv.y) * smoothstep(1.0, 0.95, vUv.y);
  
  gl_FragColor = vec4(warmTone, color.a * uOpacity * edgeX * edgeY);
}
