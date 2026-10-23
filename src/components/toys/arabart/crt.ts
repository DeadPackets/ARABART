// The phosphor screen: his 640x480 frame through WebGL (OGL). Pixels stay square and exact at their core; around them
// a glow in their own color, a fading afterglow when pixels go dark, and faint scan lines once pixels are big.
// Loaded only when the glow is on; returns null when WebGL is missing, so the caller keeps the plain canvas.
import { Renderer, Program, Mesh, Triangle, Texture, RenderTarget } from 'ogl';

const vertex = /* glsl */ `
attribute vec2 position; attribute vec2 uv; varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }`;

// Afterglow: each pixel keeps the brighter of what is drawn now and what was there, fading
const persist = /* glsl */ `
precision mediump float; varying vec2 vUv; uniform sampler2D tNow, tOld; uniform float uKeep;
void main() { vec3 now = texture2D(tNow, vUv).rgb; vec3 old = texture2D(tOld, vUv).rgb * uKeep;
  gl_FragColor = vec4(max(now, old), 1.0); }`;

const display = /* glsl */ `
precision mediump float; varying vec2 vUv; uniform sampler2D tMap; uniform vec4 uView; uniform float uScale, uGlow;
const vec2 RES = vec2(640.0, 480.0);
void main() {
  vec2 f = uView.xy + vec2(vUv.x, 1.0 - vUv.y) * uView.zw;      // frame pixels, y down
  vec2 cell = (floor(f) + 0.5) / RES;                             // the exact pixel under this point
  vec3 c = texture2D(tMap, cell).rgb;                            // row 0 of the frame is t = 0
  vec3 g = vec3(0.0);
  for (int i = 0; i < 8; i++) {
    float a = float(i) * 0.785398;
    vec2 d = vec2(cos(a), sin(a));
    g += texture2D(tMap, (f + d * 1.6) / RES).rgb;
    g += 0.55 * texture2D(tMap, (f + d * 4.0) / RES).rgb;
  }
  c += g / 12.4 * uGlow;
  float scan = smoothstep(2.5, 5.0, uScale);                      // only once a pixel is several screen pixels tall
  c *= 1.0 - scan * 0.22 * pow(abs(fract(f.y) - 0.5) * 2.0, 2.0);
  vec2 v = vUv * (1.0 - vUv);
  c *= mix(0.82, 1.0, clamp(v.x * v.y * 18.0, 0.0, 1.0));
  gl_FragColor = vec4(c, 1.0);
}`;

export interface CRT { frame(rgba: Uint8Array): void; view(x: number, y: number, w: number, h: number): void; resize(): void; kick(frames?: number): void; destroy(): void }

export function crt(canvas: HTMLCanvasElement): CRT | null {
  const probe = document.createElement('canvas');
  const weak = { failIfMajorPerformanceCaveat: true };
  if (!(probe.getContext('webgl2', weak) || probe.getContext('webgl', weak))) return null;
  const dpr = Math.min(devicePixelRatio || 1, 1.5);
  const renderer = new Renderer({ canvas, dpr, alpha: false, depth: false, antialias: false });
  const gl = renderer.gl;
  const tri = new Triangle(gl);
  const now = new Texture(gl, { image: new Uint8Array(640 * 480 * 4), width: 640, height: 480, generateMipmaps: false, minFilter: gl.NEAREST, magFilter: gl.NEAREST, flipY: false });
  const rt = [0, 1].map(() => new RenderTarget(gl, { width: 640, height: 480, depth: false, minFilter: gl.LINEAR }));
  const pProg = new Program(gl, { vertex, fragment: persist, uniforms: { tNow: { value: now }, tOld: { value: rt[0].texture }, uKeep: { value: 0.84 } } });
  const dProg = new Program(gl, { vertex, fragment: display, uniforms: { tMap: { value: rt[1].texture }, uView: { value: [0, 0, 640, 480] }, uScale: { value: 1 }, uGlow: { value: 0.9 } } });
  const pMesh = new Mesh(gl, { geometry: tri, program: pProg }), dMesh = new Mesh(gl, { geometry: tri, program: dProg });

  let cur = 0, left = 0, raf = 0, seen = true;
  const draw = () => {
    raf = 0;
    pProg.uniforms.tOld.value = rt[cur].texture;
    renderer.render({ scene: pMesh, target: rt[1 - cur] });
    cur = 1 - cur;
    dProg.uniforms.tMap.value = rt[cur].texture;
    renderer.render({ scene: dMesh });
    if (--left > 0) loop();
  };
  const loop = () => { if (!raf && seen && !document.hidden) raf = requestAnimationFrame(draw); };
  const api: CRT = {
    frame(rgba) { now.image = rgba; now.needsUpdate = true; api.kick(36); },
    view(x, y, w, h) {
      dProg.uniforms.uView.value = [x, y, w, h];
      dProg.uniforms.uScale.value = canvas.clientWidth / w;
      api.kick(2);
    },
    resize() {
      const r = canvas.parentElement!.getBoundingClientRect();
      renderer.setSize(Math.max(1, r.width), Math.max(1, r.height));
      canvas.style.width = canvas.style.height = '100%';
      api.kick(2);
    },
    kick(frames = 2) { left = Math.max(left, frames); loop(); },
    destroy() { cancelAnimationFrame(raf); gl.getExtension('WEBGL_lose_context')?.loseContext(); },
  };
  new IntersectionObserver(([e]) => { seen = e.isIntersecting; if (seen) api.kick(2); }).observe(canvas);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) api.kick(2); });
  api.resize();
  return api;
}
