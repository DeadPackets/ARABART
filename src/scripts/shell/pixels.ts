// Every lit ARABART pixel is one instanced square. A morph moves each square from its place in one picture to its place in the next,
// with a soft phosphor halo drawn under it. Pictures (States) are lists of [x, y, vgaColor, alpha] in ARABART pixels around (0, 0).
import { Renderer, Program, Mesh, Geometry } from 'ogl';
import { PALETTE } from '../../lib/arabart';

export interface State { px: Float32Array; n: number; w: number; h: number; cx?: number; cy?: number }
const MAX = 8192;

const vertex = /* glsl */ `#version 300 es
in vec2 position;
in vec2 aFrom; in vec2 aTo; in vec4 aCol; in float aSeed;
uniform vec2 uRes; uniform vec2 uC0; uniform vec2 uC1;
uniform float uS0; uniform float uS1; uniform float uT; uniform float uSpread; uniform float uArc; uniform float uHalo;
uniform vec3 uPal[16];
out vec3 vCol; out float vA; out vec2 vQ;
float ease(float t) { return t < .5 ? 4. * t * t * t : 1. - pow(-2. * t + 2., 3.) * .5; }
void main() {
  float t = clamp((uT - aSeed * uSpread) / (1. - uSpread), 0., 1.);
  float e = ease(t);
  vec2 a = floor(uC0 + aFrom * uS0 + .5), b = floor(uC1 + aTo * uS1 + .5);
  vec2 p = mix(a, b, e);
  float uS = floor(mix(uS0, uS1, e) + .5);
  p.y -= sin(e * 3.14159) * (8. + aSeed * 40.) * uS * uArc;
  vec2 q = position;
  vec2 pos = uHalo > .5 ? p + uS * .5 + (q - .5) * uS * 7. : p + q * uS;
  vec2 c = pos / uRes * 2. - 1.;
  gl_Position = vec4(c.x, -c.y, 0., 1.);
  vCol = mix(uPal[int(aCol.x)], uPal[int(aCol.y)], e);
  vA = mix(aCol.z, aCol.w, e);
  vQ = q;
}`;

const fragment = /* glsl */ `#version 300 es
precision highp float;
in vec3 vCol; in float vA; in vec2 vQ;
uniform float uHalo; uniform float uGlow;
out vec4 o;
void main() {
  if (uHalo > .5) {
    float r = length(vQ - .5) * 2.;
    float g = exp(-r * r * 5.) * uGlow * vA;
    o = vec4(vCol * g, g);
  } else {
    o = vec4(vCol * vA, vA);
  }
}`;

/** Builds a State from parts: each a bitmap and where its top-left corner goes. Centers it on (0, 0). */
export function compose(parts: { img: { width: number; height: number; data: Uint8Array }; x: number; y: number }[], alpha = 1): State {
  let n = 0, x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const { img, x, y } of parts) {
    for (let j = 0; j < img.height; j++) for (let i = 0; i < img.width; i++) if (img.data[j * img.width + i] !== 255) n++;
    x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x + img.width); y1 = Math.max(y1, y + img.height);
  }
  const w = x1 - x0, h = y1 - y0, cx = Math.round(x0 + w / 2), cy = Math.round(y0 + h / 2);
  const rows: number[][] = [];
  for (const { img, x, y } of parts)
    for (let j = 0; j < img.height; j++) for (let i = 0; i < img.width; i++) {
      const v = img.data[j * img.width + i];
      if (v !== 255) rows.push([x + i - cx, y + j - cy, v]);
    }
  rows.sort((a, b) => b[0] - a[0] || a[1] - b[1]);
  const px = new Float32Array(n * 4);
  rows.forEach((r, k) => px.set([r[0], r[1], r[2], alpha], k * 4));
  return { px, n, w: n ? w : 0, h: n ? h : 0, cx, cy };
}

/** The same pixels scattered over a w x h box (in ARABART pixels), faded out. */
export function scatter(s: State, w: number, h: number, dy = 0): State {
  const px = new Float32Array(s.px);
  for (let k = 0; k < s.n; k++) {
    px[k * 4] = Math.round((Math.random() - 0.5) * w);
    px[k * 4 + 1] = Math.round((Math.random() - 0.5) * h + dy);
    px[k * 4 + 3] = 0;
  }
  return { px, n: s.n, w, h };
}

export function createPixels(canvas: HTMLCanvasElement, dpr: number) {
  const renderer = new Renderer({ canvas, dpr, alpha: true, premultipliedAlpha: true, antialias: false, depth: false, webgl: 2, powerPreference: 'high-performance' });
  const gl = renderer.gl;
  if (!renderer.isWebgl2) throw new Error('WebGL2 is not available');
  gl.clearColor(0, 0, 0, 0);

  const seed = new Float32Array(MAX).map(() => Math.random());
  const from = new Float32Array(MAX * 2), to = new Float32Array(MAX * 2), col = new Float32Array(MAX * 4);
  const geometry = new Geometry(gl, {
    position: { size: 2, data: new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]) },
    index: { data: new Uint16Array([0, 1, 2, 2, 1, 3]) },
    aFrom: { instanced: 1, size: 2, data: from, usage: gl.DYNAMIC_DRAW },
    aTo: { instanced: 1, size: 2, data: to, usage: gl.DYNAMIC_DRAW },
    aCol: { instanced: 1, size: 4, data: col, usage: gl.DYNAMIC_DRAW },
    aSeed: { instanced: 1, size: 1, data: seed },
  });
  geometry.setInstancedCount(0);

  // a plain array: OGL only sets uniform arrays (uPal[0]) from Array values
  const pal = PALETTE.flatMap(c => [(c >> 16 & 255) / 255, (c >> 8 & 255) / 255, (c & 255) / 255]);
  const u = {
    uRes: { value: [1, 1] }, uC0: { value: [0, 0] }, uC1: { value: [0, 0] }, uS0: { value: 4 }, uS1: { value: 4 }, uT: { value: 0 },
    uSpread: { value: 0.35 }, uArc: { value: 1 }, uGlow: { value: 0.2 }, uPal: { value: pal },
  };
  const make = (halo: number, blend: [number, number]) => {
    const program = new Program(gl, { vertex, fragment, uniforms: { ...u, uHalo: { value: halo } }, transparent: true, depthTest: false, depthWrite: false, cullFace: false });
    program.setBlendFunc(blend[0], blend[1]);
    return new Mesh(gl, { geometry, program });
  };
  const halo = make(1, [gl.ONE, gl.ONE]);
  const crisp = make(0, [gl.ONE, gl.ONE_MINUS_SRC_ALPHA]);

  let A: State | null = null, B: State | null = null;

  return {
    u,
    /** Canvas size in CSS pixels. */
    size(w: number, h: number) {
      renderer.setSize(w, h);
      u.uRes.value = [gl.drawingBufferWidth, gl.drawingBufferHeight];
    },
    /** Loads a morph from state a (around canvas point c0) to state b (around c1). */
    pair(a: State, b: State) {
      A = a; B = b;
      const n = Math.min(MAX, Math.max(a.n, b.n));
      for (let i = 0; i < n; i++) {
        const fi = a.n ? Math.floor(i * a.n / n) * 4 : -1, ti = b.n ? Math.floor(i * b.n / n) * 4 : -1;
        const f = fi < 0 ? b.px.subarray(ti, ti + 4) : a.px.subarray(fi, fi + 4);
        const t = ti < 0 ? a.px.subarray(fi, fi + 4) : b.px.subarray(ti, ti + 4);
        from[i * 2] = f[0]; from[i * 2 + 1] = f[1];
        to[i * 2] = t[0]; to[i * 2 + 1] = t[1];
        col[i * 4] = f[2]; col[i * 4 + 1] = t[2];
        col[i * 4 + 2] = fi < 0 ? 0 : f[3]; col[i * 4 + 3] = ti < 0 ? 0 : t[3];
      }
      geometry.attributes.aFrom.needsUpdate = true;
      geometry.attributes.aTo.needsUpdate = true;
      geometry.attributes.aCol.needsUpdate = true;
      geometry.setInstancedCount(n);
    },
    /** Where every square is right now, as a State around c1, so a new morph can start mid-flight. */
    snapshot(): State {
      const n = geometry.instancedCount, px = new Float32Array(n * 4);
      const [c0x, c0y] = u.uC0.value, [c1x, c1y] = u.uC1.value, S0 = u.uS0.value, S = u.uS1.value, T = u.uT.value, sp = u.uSpread.value;
      for (let i = 0; i < n; i++) {
        const t = Math.min(1, Math.max(0, (T - seed[i] * sp) / (1 - sp)));
        const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        const ax = c0x + from[i * 2] * S0, ay = c0y + from[i * 2 + 1] * S0, bx = c1x + to[i * 2] * S, by = c1y + to[i * 2 + 1] * S;
        px[i * 4] = (ax + (bx - ax) * e - c1x) / S;
        px[i * 4 + 1] = (ay + (by - ay) * e - c1y) / S;
        px[i * 4 + 2] = e < 0.5 ? col[i * 4] : col[i * 4 + 1];
        px[i * 4 + 3] = col[i * 4 + 2] + (col[i * 4 + 3] - col[i * 4 + 2]) * e;
      }
      return { px, n, w: B?.w ?? 0, h: B?.h ?? 0 };
    },
    draw() {
      renderer.render({ scene: halo });
      renderer.render({ scene: crisp, clear: false });
    },
    get states() { return [A, B]; },
  };
}
export type Pixels = ReturnType<typeof createPixels>;
