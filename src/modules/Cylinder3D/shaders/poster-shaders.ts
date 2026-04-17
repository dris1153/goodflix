// Inline GLSL as TS template literals — no .glsl file imports.
// Compatible with Turbopack dev + webpack build without loaders.
// VSCode extension "glsl-literal" provides syntax highlighting.

export const VERT_SRC = /* glsl */ `
  // Per-instance UV region: x,y = atlas origin (0..1), z,w = atlas region size (0..1)
  attribute vec4 aUvOffset;
  varying vec2 vUv;
  varying vec4 vUvOffset;
  varying float vDepth;

  void main() {
    vUv = uv;
    vUvOffset = aUvOffset;
    // instanceMatrix transforms position into world space
    vec4 worldPos = instanceMatrix * vec4(position, 1.0);
    vec4 viewPos = modelViewMatrix * worldPos;
    vDepth = -viewPos.z;
    gl_Position = projectionMatrix * viewPos;
  }
`

export const FRAG_SRC = /* glsl */ `
  precision highp float;

  uniform sampler2D uAtlas;
  // Mood tint colour (RGB 0..1) blended 35% over poster base
  uniform vec3 uMoodTint;
  // Mood edge-glow colour (RGB 0..1)
  uniform vec3 uMoodGlow;
  // Elapsed time in seconds (reserved for future animation)
  uniform float uTime;

  varying vec2 vUv;
  varying vec4 vUvOffset;
  varying float vDepth;

  void main() {
    // Remap local [0,1] UV into the atlas sub-region
    vec2 atlasUv = vUvOffset.xy + vUv * vUvOffset.zw;
    vec4 tex = texture2D(uAtlas, atlasUv);

    // Mood tint: lerp toward tint colour at 35%
    vec3 base = tex.rgb * mix(vec3(1.0), uMoodTint, 0.35);

    // Edge glow: smoothstep from inner 0.45 to outer 0.5 of quad extents
    float edge = smoothstep(0.45, 0.5, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)));
    vec3 glow = uMoodGlow * edge * 0.6;

    // Depth fade: full at ≤8 units, gone at 18 units
    float fade = 1.0 - smoothstep(8.0, 18.0, vDepth);

    gl_FragColor = vec4((base + glow) * fade, tex.a);
  }
`
