// The /bytes/ explorer: every byte of every file on one zoomable plate, as shipped (disk) or as unpacked (memory).
import {
  MEM_KINDS, DISK_KINDS, BY, MEM_RGB, DISK_RGB, MEM_NAME, DISK_NAME, DISK_SAYS, BY_NAME, EXPLAIN,
  autoRegions, linkFor, pageFor, deepLink, rgb,
  type Region, type Routine, type Anatomy, type Layer, type By,
} from './regions';

type Ins = [number, number, string];
interface FileMeta {
  key: string; path: string; id: string; x: number; y: number; w: number; h: number; scrambled?: string[];
  disk: { size: number; start: number; out: number; com: boolean; regions: Region[]; strings: { a: number; n: number; t: string }[]; counts: Record<string, number>; mask: number[][] };
  mem: { size: number; hdr: number; relocs: number; entry: number; entryText: string; auto: any[]; mask: number[][] };
}
interface F extends FileMeta {
  i: number; title: string; year: string; name: string;
  regions: Record<Layer, Region[]>; routines: Routine[]; authored: boolean;
  kind: Uint8Array; by: Uint8Array; dcls: Uint8Array;
  bytes: Partial<Record<Layer, Uint8Array>>; code: { disk?: Ins[]; memory?: Ins[] }; loading: Set<string>;
  mask: Record<Layer, Uint8Array | null>;
}
interface PageData { base: string; titles: Record<string, { title: string; year: string }>; anatomy: Record<string, Anatomy> }

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const hex = (n: number, d = 2) => n.toString(16).toUpperCase().padStart(d, '0');
const HEX = Array.from({ length: 256 }, (_, i) => hex(i));
const fmtN = (n: number) => n.toLocaleString('en-US');
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const esc = (s: string) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const MONO = '"Martian Mono", ui-monospace, monospace', SANS = '"Archivo", system-ui, sans-serif';
const SEA = [0, 0, 170];
const kindIndex = (k: string) => { const i = MEM_KINDS.indexOf(k as any); return i < 0 ? MEM_KINDS.indexOf('data') : i; };
const lum = (c: number[]) => { const l = (v: number) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * l(c[0]) + 0.7152 * l(c[1]) + 0.0722 * l(c[2]); };
const inkFor = (c: number[]) => (lum(c) >= 0.3 ? rgb(c as [number, number, number]) : 'rgb(240 242 255)');

export async function initExplorer(root: HTMLElement) {
  const $ = <T extends Element = HTMLElement>(s: string) => root.querySelector(s) as T;
  const page: PageData = JSON.parse(document.getElementById('bx-data')!.textContent!);
  const base = page.base;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [meta, dbin] = await Promise.all([
    fetch(`${base}/bytes/files.json`).then(r => r.json()),
    fetch(`${base}/bytes/disk-classes.bin`).then(r => r.arrayBuffer()),
  ]);
  const W: number = meta.W, H: number = meta.H, nib = new Uint8Array(dbin);

  /* ---------- files ---------- */
  const T: F[] = (meta.files as FileMeta[]).map((m, i) => {
    const info = page.titles[m.key] || { title: m.path, year: '' };
    const an = page.anatomy[m.key];
    const memRegions = an?.regions?.length ? an.regions.map(r => ({ ...r })) : autoRegions(m.mem.auto, m.mem.entryText, m.mem.relocs);
    const f: F = {
      ...m, i, title: info.title, year: info.year,
      name: m.path.split('/').pop()!,
      regions: { disk: m.disk.regions, memory: memRegions }, routines: an?.routines || [], authored: !!an?.regions?.length,
      kind: new Uint8Array(m.mem.size), by: new Uint8Array(m.mem.size), dcls: new Uint8Array(m.disk.size),
      bytes: {}, code: {}, loading: new Set(), mask: { disk: null, memory: null },
    };
    f.kind.fill(MEM_KINDS.indexOf('data'));
    for (const r of memRegions) {
      const k = kindIndex(r.kind), b = Math.max(0, BY.indexOf(r.by));
      f.kind.fill(k, r.start, Math.min(r.end, m.mem.size)); f.by.fill(b, r.start, Math.min(r.end, m.mem.size));
    }
    for (let k = 0; k < m.disk.size; k++) { const v = nib[(m.disk.start + k) >> 1]; f.dcls[k] = (m.disk.start + k) & 1 ? v >> 4 : v & 15; }
    for (const L of ['disk', 'memory'] as Layer[]) {
      const ms = L === 'disk' ? m.disk.mask : m.mem.mask;
      if (ms.length) { const a = new Uint8Array(L === 'disk' ? m.disk.size : m.mem.size); for (const [s, e] of ms) a.fill(1, s, e); f.mask[L] = a; }
    }
    return f;
  });
  const byKey = (k: string) => T.find(t => t.key === k);
  const sizeOf = (t: F, L: Layer) => (L === 'disk' ? t.disk.size : t.mem.size);
  const PLATE = { x: 0, y: 0, w: W, h: H };
  const tRect = (t: F) => ({ x: t.x, y: t.y, w: t.w, h: t.h });
  const cellOf = (t: F, k: number): [number, number] => [t.x + (k % t.w), t.y + Math.floor(k / t.w)];

  /* ---------- state ---------- */
  let layer: Layer = 'memory', layerT = 1, layerFrom = 1, layerTo = 1, layerT0 = 0, onlyHis = false;
  const cam = { x: W / 2, y: H / 2, s: 1 };
  let VW = 0, VH = 0, DPR = 1, MX = 0, MY = 0;
  const map = $('.bx-map'), cgl = $<HTMLCanvasElement>('.bx-gl'), cov = $<HTMLCanvasElement>('.bx-ov'), ctx = cov.getContext('2d')!;
  const labels = $('.bx-labels'), panel = $('.bx-panel');
  const S_MAX = 140;

  function resize() {
    const r = map.getBoundingClientRect();
    const keep = VW ? toW(VW / 2, VH / 2) : null;
    VW = r.width; VH = r.height; DPR = Math.min(2, devicePixelRatio || 1);
    for (const c of [cgl, cov]) { c.width = Math.round(VW * DPR); c.height = Math.round(VH * DPR); }
    if (gl) gl.viewport(0, 0, cgl.width, cgl.height);
    if (keep) { cam.x = keep[0]; cam.y = keep[1]; }
  }
  const toS = (wx: number, wy: number): [number, number] => [(wx - cam.x) * cam.s + VW / 2, (wy - cam.y) * cam.s + VH / 2];
  const toW = (sx: number, sy: number): [number, number] => [(sx - VW / 2) / cam.s + cam.x, (sy - VH / 2) / cam.s + cam.y];
  const viewAt = (wx: number, wy: number, s: number) => ({ x: wx, y: wy, s });
  const sMin = () => Math.min(VW / W, VH / H) * 0.8;
  function fitView(r: { x: number; y: number; w: number; h: number }, pad = 0.86) {
    return viewAt(r.x + r.w / 2, r.y + r.h / 2, clamp(Math.min(VW * pad / r.w, (VH - 40) * pad / r.h), sMin(), S_MAX));
  }
  const sPlate = () => fitView(PLATE, 0.92).s;
  function territoryAt(wx: number, wy: number) {
    const cx = Math.floor(wx), cy = Math.floor(wy);
    for (const t of T) if (cx >= t.x && cx < t.x + t.w && cy >= t.y && cy < t.y + t.h) {
      const k = (cy - t.y) * t.w + (cx - t.x);
      return { t, k: k < sizeOf(t, layer) ? k : -1 };
    }
    return null;
  }
  function regionAt(t: F, L: Layer, k: number) {
    const R = t.regions[L]; let lo = 0, hi = R.length - 1;
    while (lo <= hi) { const m = (lo + hi) >> 1; if (k < R[m].start) hi = m - 1; else if (k >= R[m].end) lo = m + 1; else return R[m]; }
    return null;
  }
  const routineAt = (t: F, k: number) => t.routines.find(r => k >= r.start && k < r.end) || null;
  const insAt = (t: F, L: Layer, k: number) => { const c = t.code[L]; if (!c) return null; let lo = 0, hi = c.length - 1;
    while (lo <= hi) { const m = (lo + hi) >> 1; if (k < c[m][0]) hi = m - 1; else if (k >= c[m][0] + c[m][1]) lo = m + 1; else return c[m]; } return null; };

  /* ---------- WebGL ---------- */
  const VS = `#version 300 es
void main(){ vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2); gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0); }`;
  const FS = `#version 300 es
precision highp float;
uniform sampler2D uData, uDiskC, uMemC;
uniform vec2 uPlate, uRes;
uniform vec3 uCam;
uniform float uDpr, uReveal, uTint, uLayer, uOnly;
uniform vec4 uTerr[${T.length}];
uniform vec2 uSize[${T.length}];
out vec4 o;
const vec3 SEA = vec3(0.0, 0.0, 0.667);
void main(){
  vec2 cssp = vec2(gl_FragCoord.x, uRes.y * uDpr - gl_FragCoord.y) / uDpr;
  vec2 w = (cssp - 0.5 * uRes) / uCam.z + uCam.xy;
  vec3 c = SEA;
  if (w.x >= 0.0 && w.y >= 0.0 && w.x < uPlate.x && w.y < uPlate.y) {
    ivec2 cell = ivec2(floor(w));
    vec4 d = texelFetch(uData, cell, 0);
    int ti = int(d.b * 255.0 + 0.5) - 1;
    if (ti >= 0) {
      vec4 tr = uTerr[ti]; vec2 sz = uSize[ti];
      vec2 loc = vec2(cell) - tr.xy;
      float k = loc.y * tr.z + loc.x;
      float rowf = loc.y / tr.w;
      float lod = max(0.0, log2(1.0 / (uCam.z * uDpr)));
      vec2 uv = w / uPlate;
      vec3 mc = textureLod(uMemC, uv, lod).rgb, dc = textureLod(uDiskC, uv, lod).rgb;
      if (uOnly > 0.5 && int(d.a * 255.0 + 0.5) != 1) mc = mix(SEA, mc, 0.22);
      bool mem = rowf < uLayer * 1.0001;
      vec3 k3 = mem ? (k < sz.y ? mc : SEA) : (k < sz.x ? dc : (k < sz.y ? mix(SEA, vec3(1.0), 0.07) : SEA));
      float px = 1.0 / uCam.z;
      vec2 f = fract(w);
      bool filled = mem ? k < sz.y : k < sz.x;
      if (filled) {
        float band = step(1.0 - 4.0 * px, f.y);
        k3 = mix(k3, mix(mix(k3, SEA, 0.82), k3, band), uTint);
        float gap = smoothstep(4.0, 8.0, uCam.z) * max(step(f.x, px), step(f.y, px));
        float para = smoothstep(9.0, 16.0, uCam.z) * step(mod(loc.x, 16.0), 0.5) * step(f.x, 3.0 * px);
        k3 = mix(k3, SEA * 0.55, max(gap, para));
      }
      float edge = (uLayer > 0.0 && uLayer < 1.0) ? 1.0 - smoothstep(0.0, 2.0 * px / tr.w * 0.0 + 1.5 / (tr.w * uCam.z) + 1.0 / tr.w, abs(rowf - uLayer)) : 0.0;
      k3 = mix(k3, vec3(1.0, 1.0, 0.333), edge);
      float order = float(ti) / ${T.length}.0 * 0.3 + rowf * 0.62 + fract(sin(dot(vec2(cell), vec2(12.9898, 78.233))) * 43758.5453) * 0.05;
      float vis = step(order, uReveal);
      float front = vis * step(uReveal - 0.025, order) * step(uReveal, 1.0);
      k3 = mix(k3, vec3(1.0, 1.0, 0.333), front);
      c = mix(SEA, k3, vis);
    }
  }
  o = vec4(c, 1.0);
}`;
  let gl: WebGL2RenderingContext | null = null;
  const U: Record<string, WebGLUniformLocation | null> = {};
  let texDisk: WebGLTexture | null = null, texMem: WebGLTexture | null = null;
  const colDisk = new Uint8Array(W * H * 4), colMem = new Uint8Array(W * H * 4);
  function paintCols() {
    for (const A of [colDisk, colMem]) for (let p = 0; p < A.length; p += 4) { A[p] = SEA[0]; A[p + 1] = SEA[1]; A[p + 2] = SEA[2]; A[p + 3] = 255; }
    for (const t of T) {
      for (let k = 0; k < t.mem.size; k++) {
        const [x, y] = cellOf(t, k), p = (y * W + x) * 4;
        let c = MEM_RGB[MEM_KINDS[t.kind[k]]];
        if (onlyHis && t.by[k] !== 1) c = [c[0] * 0.22, c[1] * 0.22, c[2] * 0.22 + 170 * 0.78] as any;
        colMem[p] = c[0]; colMem[p + 1] = c[1]; colMem[p + 2] = c[2];
      }
      for (let k = 0; k < t.disk.size; k++) {
        const [x, y] = cellOf(t, k), p = (y * W + x) * 4, c = DISK_RGB[DISK_KINDS[t.dcls[k]]];
        colDisk[p] = c[0]; colDisk[p + 1] = c[1]; colDisk[p + 2] = c[2];
      }
    }
  }
  paintCols();
  try { gl = cgl.getContext('webgl2', { antialias: false, alpha: false }); } catch { gl = null; }
  if (gl) {
    const g = gl;
    const sh = (type: number, src: string) => { const s = g.createShader(type)!; g.shaderSource(s, src); g.compileShader(s); if (!g.getShaderParameter(s, g.COMPILE_STATUS)) throw new Error(g.getShaderInfoLog(s) || 'shader'); return s; };
    const prog = g.createProgram()!;
    g.attachShader(prog, sh(g.VERTEX_SHADER, VS)); g.attachShader(prog, sh(g.FRAGMENT_SHADER, FS)); g.linkProgram(prog); g.useProgram(prog);
    for (const n of ['uData', 'uDiskC', 'uMemC', 'uPlate', 'uRes', 'uCam', 'uDpr', 'uReveal', 'uTint', 'uLayer', 'uOnly', 'uTerr', 'uSize']) U[n] = g.getUniformLocation(prog, n);
    const data = new Uint8Array(W * H * 4);
    for (const t of T) for (let k = 0; k < t.w * t.h; k++) {
      const [x, y] = cellOf(t, k), p = (y * W + x) * 4;
      data[p] = k < t.disk.size ? t.dcls[k] : 0; data[p + 1] = k < t.mem.size ? t.kind[k] : 0; data[p + 2] = t.i + 1; data[p + 3] = k < t.mem.size ? t.by[k] : 0;
    }
    const tex = (unit: number, arr: Uint8Array, mip: boolean) => {
      const tx = g.createTexture(); g.activeTexture(g.TEXTURE0 + unit); g.bindTexture(g.TEXTURE_2D, tx);
      g.pixelStorei(g.UNPACK_ALIGNMENT, 1);
      g.texImage2D(g.TEXTURE_2D, 0, g.RGBA8, W, H, 0, g.RGBA, g.UNSIGNED_BYTE, arr);
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.NEAREST);
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, mip ? g.LINEAR_MIPMAP_LINEAR : g.NEAREST);
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE); g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE);
      if (mip) g.generateMipmap(g.TEXTURE_2D);
      return tx;
    };
    tex(0, data, false); texDisk = tex(1, colDisk, true); texMem = tex(2, colMem, true);
    g.uniform1i(U.uData, 0); g.uniform1i(U.uDiskC, 1); g.uniform1i(U.uMemC, 2); g.uniform2f(U.uPlate, W, H);
    g.uniform4fv(U.uTerr, T.flatMap(t => [t.x, t.y, t.w, t.h])); g.uniform2fv(U.uSize, T.flatMap(t => [t.disk.size, t.mem.size]));
    root.classList.add('has-gl');
  }
  function reuploadMem() {
    if (!gl) return;
    paintCols(); gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, texMem);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, colMem); gl.generateMipmap(gl.TEXTURE_2D);
  }

  /* ---------- labels ---------- */
  for (const t of T) {
    const b = document.createElement('button');
    b.className = 'bx-tl'; b.type = 'button';
    b.innerHTML = `<span class="n">${esc(t.name)}</span><span class="y">${esc(t.year)}</span>`;
    b.setAttribute('aria-label', `${t.title}, ${t.path}. Zoom to it.`);
    b.addEventListener('click', () => flyTo(fitView(tRect(t))));
    labels.append(b); (t as any).el = b;
  }
  const callout = document.createElement('div'); callout.className = 'bx-callout'; labels.append(callout);
  const sizeCache = new Map<string, [number, number]>();
  function measure(el: HTMLElement, cls: string) {
    const key = el.textContent + cls; if (sizeCache.has(key)) return sizeCache.get(key)!;
    const was = el.className; el.className = 'bx-tl on ' + cls; const r: [number, number] = [el.offsetWidth, el.offsetHeight]; el.className = was;
    sizeCache.set(key, r); return r;
  }

  /* ---------- camera ---------- */
  let fly: any = null, raf = 0, last = 0, zoomT: any = null, drag = false, visible = true, reveal = reduce ? 2 : 0, revealT0 = 0;
  const vel = { x: 0, y: 0 };
  function kick() { if (!raf && visible) { last = performance.now(); raf = requestAnimationFrame(tick); } }
  function clampCam() {
    cam.s = clamp(cam.s, sMin(), S_MAX);
    cam.x = clamp(cam.x, -60, W + 60); cam.y = clamp(cam.y, -60, H + 60);
  }
  function zoomAt(sx: number, sy: number, s: number) { s = clamp(s, sMin(), S_MAX); const [wx, wy] = toW(sx, sy); cam.s = s; cam.x = wx - (sx - VW / 2) / s; cam.y = wy - (sy - VH / 2) / s; }
  function zoomBy(f: number, ax = VW / 2, ay = VH / 2) {
    fly = null;
    const ls = Math.log(clamp(Math.exp(zoomT ? zoomT.ls : Math.log(cam.s)) * f, sMin(), S_MAX));
    if (reduce) { zoomAt(ax, ay, Math.exp(ls)); kick(); return; }
    zoomT = { ls, ax, ay }; kick();
  }
  function flyTo(v: { x: number; y: number; s: number }, ms?: number) {
    v.s = clamp(v.s, sMin(), S_MAX); vel.x = vel.y = 0; zoomT = null;
    if (reduce) { Object.assign(cam, v); fly = null; kick(); return; }
    const w0 = VW / cam.s, w1 = VW / v.s, c0 = [cam.x, cam.y], c1 = [v.x, v.y];
    const rho = 1.4, dx = c1[0] - c0[0], dy = c1[1] - c0[1], u1 = Math.hypot(dx, dy);
    let S: number, uf: (s: number) => number, wf: (s: number) => number;
    if (u1 < 1e-3 * Math.min(w0, w1)) {
      const k = Math.sign(w1 - w0) || 1; S = Math.abs(Math.log(w1 / w0)) / rho; uf = () => 0; wf = s => w0 * Math.exp(k * rho * s);
    } else {
      const b = (i: number) => (w1 * w1 - w0 * w0 + (i ? -1 : 1) * rho ** 4 * u1 * u1) / (2 * (i ? w1 : w0) * rho * rho * u1);
      const r = (i: number) => Math.log(-b(i) + Math.sqrt(b(i) ** 2 + 1)); const r0 = r(0), r1 = r(1);
      S = (r1 - r0) / rho;
      uf = s => w0 / (rho * rho) * (Math.cosh(r0) * Math.tanh(rho * s + r0) - Math.sinh(r0));
      wf = s => w0 * Math.cosh(r0) / Math.cosh(rho * s + r0);
    }
    if (!isFinite(S) || S < 1e-4) { Object.assign(cam, v); kick(); return; }
    fly = { t0: performance.now(), dur: ms ?? clamp(S * 430, 520, 1650), S, end: v,
      step: (s: number) => { const u = u1 ? uf(s) / u1 : 0; cam.x = c0[0] + dx * u; cam.y = c0[1] + dy * u; cam.s = VW / wf(s); } };
    kick();
  }
  function setLayer(L: Layer, instant = false) {
    if (L === layer && !instant) return;
    layer = L; layerFrom = layerT; layerTo = L === 'memory' ? 1 : 0; layerT0 = performance.now();
    if (instant || reduce) layerT = layerFrom = layerTo;
    root.dataset.layer = L;
    $$('[data-set-layer]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.setLayer === L)));
    selected = null; hover = null; state.key = ''; kick();
  }
  const $$ = (s: string) => [...root.querySelectorAll<HTMLElement>(s)];
  function tick(now: number) {
    raf = 0;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    let busy = false;
    if (fly) { const t = Math.min(1, (now - fly.t0) / fly.dur); fly.step(fly.S * easeOut(t)); if (t >= 1) { Object.assign(cam, fly.end); fly = null; } else busy = true; }
    if (!drag && (vel.x || vel.y)) {
      cam.x -= vel.x * dt / cam.s; cam.y -= vel.y * dt / cam.s;
      const k = Math.exp(-dt * 4.2); vel.x *= k; vel.y *= k;
      if (Math.hypot(vel.x, vel.y) < 6) vel.x = vel.y = 0; else busy = true;
    }
    if (zoomT) {
      const ls = Math.log(cam.s), n = ls + (zoomT.ls - ls) * (1 - Math.exp(-dt * 14));
      zoomAt(zoomT.ax, zoomT.ay, Math.exp(n));
      if (Math.abs(zoomT.ls - n) < 0.003) { zoomAt(zoomT.ax, zoomT.ay, Math.exp(zoomT.ls)); zoomT = null; } else busy = true;
    }
    if (layerT !== layerTo) { const u = Math.min(1, (now - layerT0) / 900); layerT = layerFrom + (layerTo - layerFrom) * easeOut(u); if (u >= 1) layerT = layerTo; else busy = true; }
    if (reveal < 1.05) { reveal = 1.06 * easeOut(Math.min(1, (now - revealT0) / 1500)); busy = true; }
    clampCam(); render();
    if (busy) kick(); else settle();
  }

  /* ---------- render ---------- */
  let state: any = { key: '' };
  let hover: { t: F; k: number } | null = null, selected: { t: F; k: number } | null = null, pinned: Region | null = null;
  let curIns: { t: F; c: Ins } | null = null, placed: number[][] = [];
  function render() {
    updateUI();
    if (gl) {
      gl.uniform2f(U.uRes, VW, VH); gl.uniform3f(U.uCam, cam.x, cam.y, cam.s); gl.uniform1f(U.uDpr, DPR);
      gl.uniform1f(U.uReveal, reveal); gl.uniform1f(U.uTint, clamp((cam.s - 13) / 9, 0, 1));
      gl.uniform1f(U.uLayer, layerT); gl.uniform1f(U.uOnly, onlyHis && layer === 'memory' ? 1 : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    draw2d(); placeLabels(); drawMini(); drawScale();
  }
  function levelNow(near: F | null) {
    const sp = sPlate();
    const fit = near ? fitView(tRect(near)).s * 0.92 : Infinity;
    if (cam.s < Math.min(Math.max(sp * 1.8, 2.2), fit)) return 'all';
    if (cam.s < 14) return 'file';
    if (cam.s < 30) return 'bytes';
    return 'code';
  }
  function focusTerr() {
    const [wx, wy] = [cam.x, cam.y];
    let best: F | null = null, bd = 60 / cam.s;
    for (const t of T) {
      const d = Math.hypot(Math.max(t.x - wx, 0, wx - (t.x + t.w)), Math.max(t.y - wy, 0, wy - (t.y + t.h)));
      if (d < bd || (d === 0 && bd === 0)) { best = t; bd = d; }
    }
    return best;
  }

  const segs = (t: F, a: number, b: number) => {
    const out: [number, number, number][] = [];
    for (let k = a; k < b;) { const row = Math.floor(k / t.w), c0 = k % t.w, c1 = Math.min(t.w, c0 + (b - k)); out.push([row, c0, c1]); k += c1 - c0; }
    return out;
  };
  function regionPath(t: F, a: number, b: number) {
    const w = t.w, r0 = Math.floor(a / w), c0 = a % w, r1 = Math.floor((b - 1) / w), c1 = (b - 1) % w + 1;
    const P = r0 === r1 ? [[c0, r0], [c1, r0], [c1, r0 + 1], [c0, r0 + 1]]
      : [[c0, r0], [w, r0], [w, r1], [c1, r1], [c1, r1 + 1], [0, r1 + 1], [0, r0 + 1], [c0, r0 + 1]];
    ctx.beginPath(); P.forEach(([x, y], i) => { const [sx, sy] = toS(t.x + x, t.y + y); i ? ctx.lineTo(sx, sy) : ctx.moveTo(sx, sy); }); ctx.closePath();
  }
  const hit = (r: number[]) => placed.some(p => r[0] < p[2] && r[2] > p[0] && r[1] < p[3] && r[3] > p[1]);
  function chip(text: string, x: number, y: number, font: string, color: string, slid = false): number[] | null {
    const room = VW - 8 - (slid ? x : 0);
    ctx.font = font; let w = ctx.measureText(text).width + 10;
    if (w > room) { font = font.replace(/[\d.]+px/, '9px'); ctx.font = font; w = ctx.measureText(text).width + 10; }
    while (w > room && text.length > 4) { text = text.replace(/…$/, '').slice(0, -2) + '…'; w = ctx.measureText(text).width + 10; }
    x = clamp(x, 4, VW - 4 - w);
    const h = 18, r = [x, y, x + w, y + h];
    if (y < 4 || y + h > VH - 4) return null;
    const blk = placed.find(p => r[0] < p[2] && r[2] > p[0] && r[1] < p[3] && r[3] > p[1]);
    if (blk) return slid || blk[2] + 64 > VW - 4 ? null : chip(text, blk[2] + 4, y, font, color, true);
    placed.push(r);
    ctx.fillStyle = 'rgb(0 0 120)'; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = color; ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.fillText(text, x + 5, y + h / 2 + 0.5);
    return r;
  }
  function draw2d() {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.clearRect(0, 0, VW, VH);
    placed = chrome.map(el => el.getBoundingClientRect()).filter(r => r.width).map(r => {
      const m = map.getBoundingClientRect(); return [r.left - m.left - 6, r.top - m.top - 6, r.right - m.left + 6, r.bottom - m.top + 6];
    });
    const [x0, y0] = toW(0, 0), [x1, y1] = toW(VW, VH);
    const vis = T.filter(t => t.x < x1 && t.x + t.w > x0 && t.y < y1 && t.y + t.h > y0);
    const s = cam.s, lvl = state.level, ft: F | null = state.focus, L = layer;
    if (lvl === 'all' && hover?.t) { const t = hover.t, [a, b] = toS(t.x, t.y); ctx.lineWidth = 2; ctx.strokeStyle = 'rgb(255 255 85)'; ctx.strokeRect(a - 3, b - 3, t.w * s + 6, t.h * s + 6); }
    const regA = clamp((s - 1.6) / 1.4, 0, 1) * clamp((60 - s) / 20, 0, 1);
    if (regA > 0 && layerT % 1 === 0) {
      ctx.save(); ctx.globalAlpha = regA;
      for (const t of vis) for (const r of t.regions[L]) {
        if (r.end - r.start < 2) continue;
        regionPath(t, r.start, Math.min(r.end, sizeOf(t, L)));
        ctx.lineWidth = t === ft ? 1.25 : 0.75; ctx.strokeStyle = t === ft ? 'rgb(240 242 255 / 0.85)' : 'rgb(240 242 255 / 0.35)'; ctx.stroke();
      }
      const sel = pinned && ft && ft.regions[L].includes(pinned) ? pinned : null;
      if (sel && ft) { regionPath(ft, sel.start, sel.end); ctx.lineWidth = 2.5; ctx.strokeStyle = 'rgb(255 255 85)'; ctx.stroke(); }
      ctx.restore();
    }
    if (regA > 0 && ft && s < 14 && layerT % 1 === 0) regionCallouts(ft);
    if (L === 'disk' && s >= 2.2 && s < 20 && ft) {
      const font = `500 10.5px ${MONO}`;
      for (const f of [...ft.disk.strings].sort((a, b) => b.n - a.n).slice(0, 8)) {
        const [sx, sy] = toS(...cellOf(ft, f.a));
        const r = chip(f.t, sx - 2, sy - 21, font, 'rgb(255 85 85)') || chip(f.t, sx - 2, sy + s + 3, font, 'rgb(255 85 85)');
        if (r) { ctx.strokeStyle = 'rgb(255 85 85)'; ctx.lineWidth = 1; const lx = clamp(sx + 0.5, r[0] + 2, r[2] - 2); ctx.beginPath(); ctx.moveTo(lx, r[1] > sy ? r[1] : r[3]); ctx.lineTo(lx, sy + (r[1] > sy ? s : 0)); ctx.stroke(); }
      }
    }
    if (s >= 16 && !(fly && VW * VH / (s * s) > 1500) && layerT % 1 === 0) drawHex(vis, x0, x1, y0, y1);
    const mark = hover && hover.k >= 0 && lvl !== 'all' ? hover : selected;
    if (mark && mark.k >= 0 && s >= 5) { const [a, b] = toS(...cellOf(mark.t, mark.k)); ctx.lineWidth = 2; ctx.strokeStyle = 'rgb(255 255 85)'; ctx.strokeRect(a - 1, b - 1, s + 2, s + 2); }
  }
  function drawHex(vis: F[], x0: number, x1: number, y0: number, y1: number) {
    const s = cam.s, L = layer, fs = clamp(s * 0.34, 9, 15), showA = s >= 26, hy = showA ? 0.34 : 0.45;
    ctx.save(); ctx.globalAlpha = clamp((s - 16) / 6, 0, 1); ctx.textBaseline = 'middle';
    for (const t of vis) {
      const B = t.bytes[L];
      if (!B) { load(t, L); continue; }
      const n = sizeOf(t, L), mask = t.mask[L];
      const cx0 = Math.max(t.x, Math.floor(x0)), cx1 = Math.min(t.x + t.w, Math.ceil(x1)), cy0 = Math.max(t.y, Math.floor(y0)), cy1 = Math.min(t.y + t.h, Math.ceil(y1));
      const rowEnd = (cy: number) => Math.min(cx1, t.x + Math.max(0, Math.min(t.w, n - (cy - t.y) * t.w)));
      if (cx0 === t.x) {
        ctx.font = `400 ${clamp(s * 0.28, 9, 12)}px ${MONO}`; ctx.fillStyle = 'rgb(170 190 255)'; ctx.textAlign = 'right';
        for (let cy = cy0; cy < cy1; cy++) if ((cy - t.y) * t.w < n) ctx.fillText(hex((cy - t.y) * t.w, 5), (t.x - cam.x) * s + VW / 2 - 8, (cy - cam.y) * s + VH / 2 + s * 0.4);
      }
      ctx.textAlign = 'center'; ctx.font = `500 ${fs}px ${MONO}`;
      for (let cy = cy0; cy < cy1; cy++) {
        const sy = (cy - cam.y) * s + VH / 2 + s * hy, e = rowEnd(cy);
        for (let cx = cx0; cx < e; cx++) {
          const k = (cy - t.y) * t.w + cx - t.x;
          ctx.fillStyle = L === 'memory' ? MEM_INK[t.kind[k]] : DISK_INK[t.dcls[k]];
          ctx.fillText(mask?.[k] ? '··' : HEX[B[k]], (cx - cam.x) * s + VW / 2 + s / 2, sy);
        }
      }
      if (showA) {
        ctx.font = `700 ${fs * 1.05}px ${MONO}`; ctx.fillStyle = 'rgb(240 242 255)';
        for (let cy = cy0; cy < cy1; cy++) {
          const sy = (cy - cam.y) * s + VH / 2 + s * 0.68, e = rowEnd(cy);
          for (let cx = cx0; cx < e; cx++) {
            const k = (cy - t.y) * t.w + cx - t.x, b = B[k];
            if (mask?.[k] || b < 0x21 || b > 0x7e) continue;
            const textish = L === 'memory' ? MEM_KINDS[t.kind[k]] === 'text' || MEM_KINDS[t.kind[k]] === 'data' : t.dcls[k] === 6 || t.dcls[k] === 7;
            if (textish) ctx.fillText(String.fromCharCode(b), (cx - cam.x) * s + VW / 2 + s / 2, sy);
          }
        }
      }
      if (s >= 30) drawCode(t, y0, y1);
    }
    ctx.restore();
  }
  const MEM_INK = MEM_KINDS.map(k => inkFor(MEM_RGB[k]));
  const DISK_INK = DISK_KINDS.map(k => inkFor(DISK_RGB[k]));
  function drawCode(t: F, y0: number, y1: number) {
    const c = t.code[layer]; if (!c) { load(t, 'code'); return; }
    const s = cam.s, fs = clamp(s * 0.22, 9, 13), r0 = Math.floor(y0) - t.y - 1, r1 = Math.ceil(y1) - t.y + 1;
    const lo = Math.max(0, r0 * t.w), hi = r1 * t.w;
    let i = lowerBound(c, lo);
    ctx.save(); ctx.globalAlpha = clamp((s - 30) / 8, 0, 1); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    for (; i < c.length && c[i][0] < hi; i++) {
      const ins = c[i], txt = ins[2], mn = txt.split(' ')[0], on = curIns?.t === t && curIns.c === ins;
      const note = layer === 'memory' && noteAt(t, ins[0]);
      for (const [row, c0, c1] of segs(t, ins[0], ins[0] + ins[1])) {
        const [sx, sy] = toS(t.x + c0, t.y + row), w = (c1 - c0) * s;
        if (sx > VW || sx + w < 0) continue;
        const by = sy + s * 0.58;
        ctx.strokeStyle = on ? 'rgb(255 255 85)' : note ? 'rgb(85 255 255)' : 'rgb(240 242 255 / 0.8)'; ctx.lineWidth = on ? 2 : 1.25;
        ctx.beginPath(); ctx.moveTo(sx + 4, by - 4); ctx.lineTo(sx + 4, by); ctx.lineTo(sx + w - 4, by); ctx.lineTo(sx + w - 4, by - 4); ctx.stroke();
        ctx.font = `${on ? 700 : 500} ${fs}px ${MONO}`; ctx.fillStyle = on ? 'rgb(255 255 85)' : 'rgb(240 242 255)';
        const room = w - 10, label = ctx.measureText(txt).width <= room ? txt : ctx.measureText(mn).width <= room ? mn : '';
        if (label) ctx.fillText(label, sx + 6, sy + s * 0.79);
      }
    }
    ctx.restore();
  }
  const lowerBound = (c: Ins[], k: number) => { let lo = 0, hi = c.length; while (lo < hi) { const m = (lo + hi) >> 1; if (c[m][0] < k) lo = m + 1; else hi = m; } return lo; };
  const noteAt = (t: F, off: number) => { const r = routineAt(t, off); return r?.lines?.find(l => l.off === off)?.note || ''; };
  function regionCallouts(t: F) {
    const s = cam.s, L = layer, items: any[] = [];
    const [tx0] = toS(t.x, t.y), tx1 = tx0 + t.w * s, right = tx1 + 24 + 190 < VW - 8;
    const R = [...t.regions[L]].filter(r => r.end - r.start >= Math.max(16, sizeOf(t, L) / 60)).sort((a, b) => (b.end - b.start) - (a.end - a.start)).slice(0, 9);
    if (pinned && t.regions[L].includes(pinned) && !R.includes(pinned)) R.push(pinned);
    for (const r of R) {
      const sg = segs(t, r.start, Math.min(r.end, sizeOf(t, L))), mid = sg[Math.floor(sg.length / 2)];
      const [ax, ay] = toS(t.x + (right ? mid[2] : mid[1]), t.y + mid[0] + 0.5);
      if (ay < 8 || ay > VH - 8) continue;
      items.push({ r, ax, ay, y: ay });
    }
    items.sort((a, b) => a.y - b.y);
    for (let i = 1; i < items.length; i++) items[i].y = Math.max(items[i].y, items[i - 1].y + 40);
    const done: any[] = [];
    for (const it of items) {
      const name = L === 'memory' ? (it.r.auto ? MEM_NAME[it.r.kind] : it.r.label) : (DISK_NAME[it.r.kind] || it.r.label);
      const n = `${fmtN(it.r.end - it.r.start)} bytes`;
      ctx.font = `640 13px ${SANS}`; const w1 = ctx.measureText(name).width; ctx.font = `400 10.5px ${MONO}`; const w2 = ctx.measureText(n).width;
      const w = Math.min(230, Math.max(w1 + 26, w2 + 14)), h = 36, lx = right ? tx1 + 26 : Math.max(8, tx0 - 26 - w);
      let rect = [lx, it.y - h / 2, lx + w, it.y + h / 2], tries = 0;
      while (hit(rect) && tries++ < 5) { it.y += 14; rect = [lx, it.y - h / 2, lx + w, it.y + h / 2]; }
      if (hit(rect)) continue;
      placed.push(rect); done.push({ ...it, name, n, rect });
    }
    ctx.save(); ctx.strokeStyle = 'rgb(240 242 255)'; ctx.fillStyle = 'rgb(240 242 255)'; ctx.lineWidth = 1;
    for (const d of done) {
      const [lx, , rx] = d.rect;
      if (!right && d.ax <= rx + 4) continue;
      const ex = right ? tx1 + 12 : Math.min(tx0 - 12, d.ax - 8);
      ctx.beginPath(); ctx.moveTo(d.ax, d.ay); ctx.lineTo(ex, d.ay); ctx.lineTo(ex, d.y); ctx.lineTo(right ? lx : rx, d.y); ctx.stroke();
      ctx.beginPath(); ctx.arc(d.ax, d.ay, 2.5, 0, 7); ctx.fill();
    }
    for (const d of done) {
      const [lx, ly, rx, by] = d.rect, on = d.r === pinned;
      ctx.fillStyle = on ? 'rgb(255 255 85)' : 'rgb(170 170 170)'; ctx.fillRect(lx, ly, rx - lx, by - ly);
      ctx.fillStyle = 'rgb(0 0 0)'; ctx.fillRect(lx + 4, by, rx - lx, 4); ctx.fillRect(rx, ly + 4, 4, by - ly);
      const c = (L === 'memory' ? MEM_RGB[d.r.kind] : DISK_RGB[d.r.kind === 'packed' ? 'literal' : d.r.kind]) || [255, 255, 255];
      ctx.fillStyle = rgb(c); ctx.fillRect(lx + 6, ly + 8, 8, 8);
      ctx.fillStyle = 'rgb(0 0 0)'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.font = `640 13px ${SANS}`; ctx.fillText(fit(d.name, rx - lx - 26), lx + 19, ly + 16);
      ctx.font = `400 10.5px ${MONO}`; ctx.fillText(d.n, lx + 7, ly + 29);
    }
    ctx.restore();
  }
  function fit(s: string, w: number) { if (ctx.measureText(s).width <= w) return s; while (s.length > 3 && ctx.measureText(s + '…').width > w) s = s.slice(0, -1); return s + '…'; }

  function placeLabels() {
    const s = cam.s, lvl = state.level, rects = [...placed];
    const overl = (r: number[]) => rects.some(p => r[0] < p[2] && r[2] > p[0] && r[1] < p[3] && r[3] > p[1]);
    const fits = (r: number[]) => r[0] >= 2 && r[2] <= VW - 2 && r[1] >= 2 && r[3] <= VH - 2 && !overl(r);
    const showT = reveal > 0.6;
    const order = [...T].sort((a, b) => Number(b === state.focus) - Number(a === state.focus) || b.mem.size - a.mem.size);
    for (const t of order) {
      const el = (t as any).el as HTMLElement; let on = false;
      if (showT && (lvl === 'all' || t === state.focus || s < 14)) {
        const big = t === state.focus && lvl !== 'all';
        const cls = big ? 'big' : '';
        const [w, h] = measure(el, cls);
        const [sx, sy] = toS(t.x, t.y), tw = t.w * s;
        const cands: [number, number, boolean][] = [[big ? clamp(sx, 12, Math.max(12, sx + tw - w)) : sx, sy - h - (big ? 8 : 3), false]];
        if (!big) { if (t.h * s > w) cands.push([sx + tw + 2, sy, true]); cands.push([sx + 4, sy + 6, false]); }
        for (const [x, y, rot] of cands) {
          const r = rot ? [x, y, x + h, y + w] : [x, y, x + w, y + h];
          if (!fits(r)) continue;
          rects.push(r); on = true;
          el.className = 'bx-tl on ' + cls;
          el.style.transform = rot ? `translate(${x + h}px, ${y}px) rotate(90deg)` : `translate(${x}px, ${y}px)`;
          break;
        }
      }
      if (!on && el.classList.contains('on')) el.className = 'bx-tl';
      el.tabIndex = on ? 0 : -1;
    }
    const n = curIns && layer === 'memory' ? noteAt(curIns.t, curIns.c[0]) : '';
    if (n && s >= 30 && curIns) {
      const [sx, sy] = toS(...cellOf(curIns.t, curIns.c[0]));
      callout.innerHTML = `<span class="ins">${esc(curIns.c[2])}</span>; ${esc(n)}`;
      callout.style.transform = `translate(${clamp(sx, 8, VW - 300)}px, ${sy + s + 12}px)`;
      callout.classList.add('on');
    } else callout.classList.remove('on');
  }

  /* minimap + scale */
  const miniC = $<HTMLCanvasElement>('.bx-mini canvas'), mctx = miniC.getContext('2d')!;
  const miniImg = document.createElement('canvas'); miniImg.width = W; miniImg.height = H;
  let miniLayer = '';
  function drawMini() {
    const key = layer + onlyHis;
    if (key !== miniLayer) { miniLayer = key; const id = new ImageData(new Uint8ClampedArray(layer === 'memory' ? colMem : colDisk), W, H); miniImg.getContext('2d')!.putImageData(id, 0, 0); }
    const cw = miniC.width, ch = miniC.height, k = Math.min(cw / W, ch / H) * 0.94, ox = (cw - W * k) / 2, oy = (ch - H * k) / 2;
    mctx.fillStyle = 'rgb(0 0 170)'; mctx.fillRect(0, 0, cw, ch);
    mctx.imageSmoothingEnabled = true; mctx.drawImage(miniImg, ox, oy, W * k, H * k);
    const [a, b] = toW(0, 0), [c, d] = toW(VW, VH);
    mctx.lineWidth = 3; mctx.strokeStyle = 'rgb(255 255 85)';
    const rx = clamp(ox + a * k, -2, cw + 2), ry = clamp(oy + b * k, -2, ch + 2), rx2 = clamp(ox + c * k, -2, cw + 2), ry2 = clamp(oy + d * k, -2, ch + 2);
    mctx.strokeRect(rx, ry, Math.max(4, rx2 - rx), Math.max(4, ry2 - ry));
    (miniC as any)._map = { k, ox, oy };
  }
  const scaleEl = $('.bx-scale');
  function drawScale() {
    let n = 1; while (n * 2 * cam.s <= 120 && n < 65536) n *= 2;
    const txt = n === 16 ? '16 bytes, 1 paragraph' : n >= 1024 ? `${n / 1024} KB` : `${n} byte${n > 1 ? 's' : ''}`;
    scaleEl.firstElementChild!.textContent = txt; (scaleEl.lastElementChild as HTMLElement).style.width = (n * cam.s).toFixed(1) + 'px';
  }

  /* ---------- lazy data ---------- */
  function load(t: F, what: Layer | 'code') {
    if (t.loading.has(what)) return; t.loading.add(what);
    const done = () => kick();
    if (what === 'code') fetch(`${base}/bytes/code/${t.key}.json`).then(r => r.json()).then(j => { t.code = { disk: j.disk, memory: j.mem }; done(); });
    else {
      const ext = what === 'disk' ? 'disk' : 'mem';
      fetch(`${base}/bytes/files/${t.key}.${ext}`).then(r => r.arrayBuffer()).then(b => {
        const u = new Uint8Array(b);
        // Files that hold an antivirus signature are stored scrambled (scripts/bytes/build.py): XOR A5h + 4Dh per byte
        if (t.scrambled?.includes(ext)) for (let i = 0; i < u.length; i++) u[i] ^= (0xa5 + 0x4d * i) & 0xff;
        t.bytes[what] = u; done();
      });
    }
  }

  /* ---------- panel ---------- */
  const legendHTML = () => {
    const L = layer, rows = L === 'memory'
      ? MEM_KINDS.map(k => [k, MEM_NAME[k], EXPLAIN[k].what.split('. ')[0].replace(/\.$/, '') + '.', T.reduce((s, t) => s + t.regions.memory.filter(r => r.kind === k).reduce((a, r) => a + r.end - r.start, 0), 0)] as const)
      : DISK_KINDS.slice(1).map(k => [k, DISK_NAME[k], DISK_SAYS[k], meta.totals.classes[k] || 0] as const);
    return `<ul class="bx-legend">${rows.filter(r => r[3]).map(([k, n, d, c]) => `<li><i style="background:${rgb((L === 'memory' ? MEM_RGB : DISK_RGB)[k])}"></i><span><b>${n}.</b> ${esc(d)}</span><span class="n">${fmtN(c)}</span></li>`).join('')}</ul>`;
  };
  const filesHTML = () => `<ul class="bx-files">${[...T].sort((a, b) => +a.year - +b.year || a.i - b.i).map(t =>
    `<li><a href="${deepLink(base, t.key, layer)}" data-key="${t.key}"><span class="yr">${esc(t.year)}</span><span class="t">${esc(t.name)}<small>${esc(t.title)}</small></span><span class="sz">${fmtN(sizeOf(t, layer))}</span></a></li>`).join('')}</ul>`;
  function compBar(t: F) {
    const L = layer, cnt = new Map<string, number>();
    if (L === 'memory') for (const r of t.regions.memory) cnt.set(r.kind, (cnt.get(r.kind) || 0) + r.end - r.start);
    else for (const [k, v] of Object.entries(t.disk.counts)) cnt.set(k, v);
    const tot = sizeOf(t, L);
    return `<div class="bx-bar" role="img" aria-label="What the bytes of ${esc(t.name)} are">${[...cnt].map(([k, v]) => `<i style="width:${(v / tot * 100).toFixed(3)}%;background:${rgb(((L === 'memory' ? MEM_RGB : DISK_RGB) as any)[k] || [255, 255, 255])}" title="${esc((L === 'memory' ? MEM_NAME : DISK_NAME)[k] || k)}: ${fmtN(v)}"></i>`).join('')}</div>`;
  }
  function fileHTML(t: F) {
    const his = t.regions.memory.filter(r => r.by === 'yasser').reduce((a, r) => a + r.end - r.start, 0);
    const big = [...t.regions[layer]].sort((a, b) => (b.end - b.start) - (a.end - a.start)).slice(0, 12).sort((a, b) => a.start - b.start);
    return `<p class="bx-meta">${esc(t.year)} · ${esc(t.path)}</p><h2>${esc(t.title)}</h2>
<dl class="bx-facts"><div><dt>On disk</dt><dd>${fmtN(t.disk.size)} bytes</dd></div><div><dt>In memory</dt><dd>${fmtN(t.mem.size)} bytes</dd></div>
${t.authored ? `<div><dt>Written by Yasser</dt><dd>${fmtN(his)} bytes</dd></div>` : ''}</dl>
${compBar(t)}
<p class="bx-src ${t.authored ? 'is-auth' : ''}">${layer === 'disk' ? 'Measured by running DIET’s own unpacker and recording every byte it reads.' : t.authored ? 'Mapped by hand from the program’s own bytes.' : 'Mapped from the bytes: header, fix-ups, code, text and empty space.'}</p>
<h3>Parts</h3><ul class="bx-regs">${big.map(r => `<li><button type="button" data-reg="${t.regions[layer].indexOf(r)}"><i style="background:${rgb(regionRGB(r))}"></i><span><b>${esc(r.label)}</b></span><span class="n">${fmtN(r.end - r.start)}</span></button></li>`).join('')}</ul>
${t.regions[layer].length > big.length ? `<p class="bx-note">${t.regions[layer].length - big.length} smaller parts: zoom in to see them.</p>` : ''}
${layer === 'memory' && t.routines.length ? `<h3>Functions</h3><ul class="bx-rts">${t.routines.map((q, i) => `<li><button type="button" data-rt="${i}"><b>${esc(q.name)}</b><small>${esc(q.note)}</small></button></li>`).join('')}</ul>` : ''}
<p><a class="bx-go" href="${pageFor(t.id, base)}">Read how ${esc(t.name)} works</a></p>`;
  }
  const regionRGB = (r: Region) => (layer === 'memory' ? MEM_RGB[r.kind] : DISK_RGB[r.kind === 'packed' ? 'literal' : r.kind]) || [255, 255, 255];
  function regionHTML(t: F, r: Region) {
    const ex = EXPLAIN[r.kind] || EXPLAIN.data;
    const link = linkFor(r.link, t.id, base);
    const rts = layer === 'memory' ? t.routines.filter(q => q.start < r.end && q.end > r.start) : [];
    const kindName = layer === 'memory' ? MEM_NAME[r.kind] || r.kind : DISK_NAME[r.kind] || (r.kind === 'packed' ? 'Packed program' : r.kind);
    return `<p class="bx-meta">${esc(t.name)} · ${layer === 'memory' ? 'in memory' : 'on disk'} · ${hex(r.start, 5)} to ${hex(r.end - 1, 5)}</p>
<h2>${esc(r.label)}</h2>
<p class="bx-kind"><i style="background:${rgb(regionRGB(r))}"></i>${esc(kindName)} · ${fmtN(r.end - r.start)} bytes</p>
<p class="bx-lead">${esc(r.note)}</p>
${BY_NAME[r.by as By] ? `<dl class="bx-facts"><div><dt>Made by</dt><dd>${esc(BY_NAME[r.by as By])}</dd></div></dl>` : ''}
${link ? `<p><a class="bx-go" href="${link}">Read the full explanation</a></p>` : ''}
<div class="bx-explain"><p><b>What is this?</b> ${esc(ex.what)}</p><p><b>In 2026:</b> ${esc(ex.now)}</p></div>
${rts.length ? `<h3>Functions</h3><ul class="bx-rts">${rts.map(q => `<li><button type="button" data-rt="${t.routines.indexOf(q)}"><b>${esc(q.name)}</b><small>${esc(q.note)}</small></button>${q.lines?.length ? `<ol class="bx-lines">${q.lines.map(l => `<li><button type="button" data-off="${l.off}"><span class="o">${hex(l.off, 5)}</span><span>${esc(l.note)}</span></button></li>`).join('')}</ol>` : ''}</li>`).join('')}</ul>` : ''}`;
  }
  function byteHTML(m: { t: F; k: number } | null) {
    if (!m || m.k < 0) return '<p class="bx-note">Point at a byte, or tap it, to read it.</p>';
    const t = m.t, k = m.k, L = layer, B = t.bytes[L];
    if (!B) return '<p class="bx-note">Loading the bytes…</p>';
    if (t.mask[L]?.[k]) return '<p class="bx-note">Hidden: this byte is part of a personal phone number or address.</p>';
    const b = B[k], ins = insAt(t, L, k);
    const cls = L === 'memory' ? MEM_NAME[MEM_KINDS[t.kind[k]]] : DISK_NAME[DISK_KINDS[t.dcls[k]]];
    const ch = b >= 0x20 && b < 0x7f ? ` · '${esc(String.fromCharCode(b))}'` : '';
    const img = L === 'memory' && t.mem.hdr && k >= t.mem.hdr ? ` · program byte ${hex(k - t.mem.hdr, 5)}` : '';
    return `<div class="bx-byte"><b>${HEX[b]}h</b><span>${b}${ch}</span></div>
<p>${esc(cls)}.${L === 'disk' ? ' ' + esc(DISK_SAYS[DISK_KINDS[t.dcls[k]]]) : ''}</p>
${ins ? `<p class="bx-ins">${esc(ins[2])}</p>` : ''}
<p class="bx-meta">file offset ${hex(k, 5)}${img} · paragraph ${hex(k >> 4, 4)}, byte ${k & 15}</p>`;
  }
  const P = { head: $('.bx-p-head'), body: $('.bx-p-body'), byte: $('.bx-p-byte') };
  function crumbs(lvl: string, t: F | null, r: Region | null) {
    const items: [string, string][] = [['all', 'All files']];
    if (t && lvl !== 'all') items.push(['file', t.name]);
    if (r && (lvl === 'bytes' || lvl === 'code')) items.push(['bytes', r.label]);
    $('.bx-crumbs').innerHTML = items.map(([g, n], i) => `<li><button type="button" data-go="${g}" ${i === items.length - 1 ? 'aria-current="page"' : ''}>${esc(n)}</button></li>`).join('');
  }
  function updateUI() {
    const near = focusTerr(), lvl = levelNow(near), t = lvl === 'all' ? null : near;
    let reg: Region | null = null;
    if (t && lvl !== 'file') { const h = territoryAt(cam.x, cam.y); if (h && h.t === t && h.k >= 0) reg = regionAt(t, layer, h.k); }
    if (lvl === 'code' && t && !fly) { const h = territoryAt(cam.x, cam.y), c = h && h.k >= 0 ? insAt(h.t, layer, h.k) : null; if (c && curIns?.c !== c) curIns = { t: h!.t, c }; }
    else if (lvl !== 'code' && !fly) curIns = null;
    if (pinned && t && !t.regions[layer].includes(pinned)) pinned = null;
    const shown = pinned || reg;
    const key = `${lvl}|${t?.key}|${layer}|${shown?.start}|${onlyHis}`;
    if (key !== state.key) {
      state = { key, level: lvl, focus: t, reg };
      crumbs(lvl, t, reg);
      $$('.bx-ladder button').forEach(b => b.toggleAttribute('aria-current', b.dataset.go === lvl));
      if (!t) { P.head.innerHTML = `<h2>All files</h2><p class="bx-lead">${layer === 'memory' ? `${fmtN(meta.totals.mem)} bytes, unpacked in memory as the processor runs them.` : `${fmtN(meta.totals.disk)} bytes on the disk, packed by DIET.`} Each square is one byte.</p>`; P.body.innerHTML = legendHTML() + '<h3>Files</h3>' + filesHTML(); }
      else if (shown && lvl !== 'file' || pinned) { P.head.innerHTML = regionHTML(t, shown!); P.body.innerHTML = `<details class="bx-more"><summary>${esc(t.name)}: the whole file</summary>${fileHTML(t)}</details>`; }
      else { P.head.innerHTML = fileHTML(t); P.body.innerHTML = '<h3>Colors</h3>' + legendHTML(); }
      $('.bx-onlyhis').toggleAttribute('hidden', layer !== 'memory');
      live.textContent = `${{ all: 'All files', file: 'File', bytes: 'Bytes', code: 'Code' }[lvl as 'all']} level${t ? '. ' + t.name : ''}${shown ? ', ' + shown.label : ''}.`;
    }
    state.focus = t;
    const ik = `${(hover || selected)?.t?.key}|${(hover || selected)?.k}|${curIns?.c?.[0]}|${layer}|${(hover || selected)?.t?.bytes[layer] ? 1 : 0}`;
    if (ik !== state.ik) { state.ik = ik; P.byte.innerHTML = lvl === 'bytes' || lvl === 'code' ? byteHTML(hover?.k! >= 0 ? hover : selected) : ''; }
  }
  const live = $('.bx-live');

  /* ---------- URL ---------- */
  let urlT = 0;
  function settle() {
    clearTimeout(urlT);
    urlT = window.setTimeout(() => {
      const t = state.focus as F | null, q = new URLSearchParams();
      if (t) {
        q.set('f', t.key); q.set('layer', layer);
        const m = selected?.t === t ? selected.k : state.level === 'bytes' || state.level === 'code' ? territoryAt(cam.x, cam.y)?.k : -1;
        if (m != null && m >= 0) q.set('at', m.toString(16));
      } else q.set('layer', layer);
      const u = `${location.pathname}?${q}`;
      if (u !== location.pathname + location.search) history.replaceState(null, '', u);
    }, 400);
  }

  /* ---------- navigation ---------- */
  function go(where: string) {
    const t = state.focus || T[0];
    if (where === 'all') flyTo(fitView(PLATE, 0.92));
    if (where === 'file') { pinned = null; flyTo(fitView(tRect(t))); }
    if (where === 'bytes') { const h = territoryAt(cam.x, cam.y); if (h && h.k >= 0) flyTo(viewAt(cam.x, cam.y, 24)); else { const [cx, cy] = cellOf(t, 0); flyTo(viewAt(cx + 8, cy + 3, 24)); } }
    if (where === 'code') {
      load(t, 'code');
      const k = layer === 'memory' ? (t.mem.hdr ? t.mem.entry : 0) : (t.disk.com ? 0 : 0x23);
      const [cx, cy] = cellOf(t, k); selected = { t, k }; flyTo(viewAt(cx + 2, cy + 0.5, 48));
    }
  }
  function goByte(t: F, k: number, s = 26) { const [cx, cy] = cellOf(t, k); selected = { t, k }; flyTo(viewAt(cx + 0.5, cy + 0.5, Math.max(s, cam.s))); }
  root.addEventListener('click', e => {
    const el = e.target as Element;
    const g = el.closest<HTMLElement>('[data-go]'); if (g) { go(g.dataset.go!); return; }
    const l = el.closest<HTMLElement>('[data-set-layer]'); if (l) { setLayer(l.dataset.setLayer as Layer); return; }
    const a = el.closest<HTMLAnchorElement>('.bx-files a[data-key]'); if (a) { e.preventDefault(); const t = byKey(a.dataset.key!)!; flyTo(fitView(tRect(t))); return; }
    const rg = el.closest<HTMLElement>('[data-reg]');
    if (rg && state.focus) { const t: F = state.focus, r = t.regions[layer][+rg.dataset.reg!]; pinned = r; state.key = '';
      if (r.end - r.start < t.w * 4) goByte(t, r.start, 22); else { const r0 = Math.floor(r.start / t.w), r1 = Math.ceil(r.end / t.w); flyTo(fitView({ x: t.x, y: t.y + r0, w: t.w, h: r1 - r0 }, 0.8)); } return; }
    const rt = el.closest<HTMLElement>('[data-rt]'); if (rt && state.focus) { const t: F = state.focus; load(t, 'code'); goByte(t, t.routines[+rt.dataset.rt!].start, 48); return; }
    const off = el.closest<HTMLElement>('[data-off]'); if (off && state.focus) { const t: F = state.focus; load(t, 'code'); goByte(t, +off.dataset.off!, 48); return; }
  });
  $('.bx-onlyhis input').addEventListener('change', e => { onlyHis = (e.target as HTMLInputElement).checked; reuploadMem(); miniLayer = ''; state.key = ''; kick(); });
  $('.bx-zin').addEventListener('click', () => zoomBy(2));
  $('.bx-zout').addEventListener('click', () => zoomBy(0.5));
  $('.bx-zfit').addEventListener('click', () => go('all'));

  /* ---------- input ---------- */
  const pts = new Map<number, [number, number]>();
  let down: any = null, samples: [number, number, number][] = [], pinch: any = null, lastTap = 0, gesture = false;
  const local = (e: MouseEvent): [number, number] => { const r = map.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  map.addEventListener('pointerdown', e => {
    if ((e.target as Element).closest('button, a, input, label')) return;
    map.setPointerCapture(e.pointerId); const p = local(e); pts.set(e.pointerId, p);
    fly = null; zoomT = null; vel.x = vel.y = 0;
    if (pts.size === 1) { down = { x: p[0], y: p[1], t: performance.now(), moved: 0 }; gesture = false; drag = true; samples = [[p[0], p[1], performance.now()]]; map.classList.add('dragging'); }
    if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), c: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] }; down = null; gesture = true; }
  });
  map.addEventListener('pointermove', e => {
    const p = local(e);
    if (!pts.has(e.pointerId)) { if (e.pointerType === 'mouse') hoverAt(p[0], p[1]); return; }
    const prev = pts.get(e.pointerId)!; pts.set(e.pointerId, p);
    if (pts.size === 1) {
      const dx = p[0] - prev[0], dy = p[1] - prev[1];
      cam.x -= dx / cam.s; cam.y -= dy / cam.s;
      if (down) { down.moved += Math.abs(dx) + Math.abs(dy); if (down.moved >= 7) gesture = true; }
      samples.push([p[0], p[1], performance.now()]); if (samples.length > 8) samples.shift();
    } else if (pts.size === 2 && pinch) {
      const [a, b] = [...pts.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]), c = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      cam.x -= (c[0] - pinch.c[0]) / cam.s; cam.y -= (c[1] - pinch.c[1]) / cam.s;
      zoomAt(c[0], c[1], cam.s * d / pinch.d); pinch = { d, c };
    }
    kick();
  });
  function endPointer(e: PointerEvent) {
    if (!pts.has(e.pointerId)) return;
    pts.delete(e.pointerId);
    if (pts.size === 1) { pinch = null; const [q] = [...pts.values()]; samples = [[q[0], q[1], performance.now()]]; return; }
    if (pts.size) return;
    drag = false; map.classList.remove('dragging');
    const now = performance.now();
    if (gesture && !reduce && samples.length > 1) {
      const a = samples.find(s => now - s[2] < 90) || samples[0], b = samples[samples.length - 1], dt = (b[2] - a[2]) / 1000;
      if (dt > 0.005 && now - b[2] < 60) { vel.x = (b[0] - a[0]) / dt; vel.y = (b[1] - a[1]) / dt; const m = Math.hypot(vel.x, vel.y); if (m > 3500) { vel.x *= 3500 / m; vel.y *= 3500 / m; } }
    }
    down = null; kick();
  }
  // Taps come from click, so synthetic and assistive clicks work too; drags and pinches set gesture and are not taps
  map.addEventListener('click', e => {
    if ((e.target as Element).closest('button, a, input, label') || gesture) { gesture = false; return; }
    const now = performance.now(), p = local(e);
    if (now - lastTap < 320) { zoomBy(2.4, p[0], p[1]); lastTap = 0; } else { lastTap = now; tap(p[0], p[1]); }
  });
  map.addEventListener('pointerup', endPointer); map.addEventListener('pointercancel', endPointer);
  map.addEventListener('pointerleave', () => { if (hover) { hover = null; kick(); } });
  map.addEventListener('wheel', e => {
    e.preventDefault();
    const m = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1, p = local(e);
    if (!e.ctrlKey && Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.2) { fly = null; cam.x += e.deltaX * m / cam.s; kick(); return; }
    zoomBy(Math.exp(-e.deltaY * m * (e.ctrlKey ? 0.011 : 0.0021)), p[0], p[1]);
  }, { passive: false });
  function hoverAt(x: number, y: number) {
    const [wx, wy] = toW(x, y), h = territoryAt(wx, wy), nh = h ? { t: h.t, k: h.k } : null;
    if (nh?.t !== hover?.t || nh?.k !== hover?.k) { hover = nh; map.style.cursor = h && state.level === 'all' ? 'pointer' : ''; kick(); }
  }
  function tap(x: number, y: number) {
    const [wx, wy] = toW(x, y), h = territoryAt(wx, wy);
    if (!h) { selected = null; pinned = null; state.key = ''; kick(); return; }
    const lvl = state.level;
    if (lvl === 'all') { flyTo(fitView(tRect(h.t))); return; }
    if (h.k < 0) return;
    if (lvl === 'file') { pinned = regionAt(h.t, layer, h.k); state.key = ''; kick(); return; }
    selected = { t: h.t, k: h.k }; pinned = regionAt(h.t, layer, h.k); state.key = '';
    if (lvl === 'code') { const c = insAt(h.t, layer, h.k); if (c) curIns = { t: h.t, c }; }
    kick();
  }
  root.addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey || (e.target as Element).closest('input, textarea, select')) return;
    const inMap = e.target === map;
    if (e.key === 'Escape') { if (pinned) { pinned = null; state.key = ''; kick(); return; } const up = ({ code: 'file', bytes: 'file', file: 'all' } as any)[state.level]; if (up) go(up); return; }
    if (e.key === '+' || e.key === '=') { zoomBy(2); e.preventDefault(); }
    else if (e.key === '-' || e.key === '_') { zoomBy(0.5); e.preventDefault(); }
    else if (e.key === '0' || e.key === 'Home') go('all');
    else if (e.key === 'l' || e.key === 'L') setLayer(layer === 'memory' ? 'disk' : 'memory');
    else if (e.key === 'i' || e.key === 'I') setLayer('memory');
    else if (e.key === 'd' || e.key === 'D') setLayer('disk');
    else if ((e.key === 'y' || e.key === 'Y') && layer === 'memory') { const c = $<HTMLInputElement>('.bx-onlyhis input'); c.checked = !c.checked; c.dispatchEvent(new Event('change')); }
    else if (inMap && e.key.startsWith('Arrow')) {
      e.preventDefault(); fly = null;
      const v = 1100; vel.x = e.key === 'ArrowLeft' ? v : e.key === 'ArrowRight' ? -v : 0; vel.y = e.key === 'ArrowUp' ? v : e.key === 'ArrowDown' ? -v : 0;
      if (reduce) { cam.x -= vel.x * 0.15 / cam.s; cam.y -= vel.y * 0.15 / cam.s; vel.x = vel.y = 0; }
      kick();
    }
  });
  const mini = $('.bx-mini');
  function miniGo(e: PointerEvent) { const r = miniC.getBoundingClientRect(), m = (miniC as any)._map; if (!m) return; const px = (e.clientX - r.left) * miniC.width / r.width, py = (e.clientY - r.top) * miniC.height / r.height; cam.x = (px - m.ox) / m.k; cam.y = (py - m.oy) / m.k; fly = null; vel.x = vel.y = 0; kick(); }
  mini.addEventListener('pointerdown', e => { e.stopPropagation(); mini.setPointerCapture(e.pointerId); miniGo(e); });
  mini.addEventListener('pointermove', e => { if (mini.hasPointerCapture(e.pointerId)) miniGo(e); });
  const chrome = ['.bx-tools', '.bx-ctrl', '.bx-mini', '.bx-scale'].map(q => $(q)).filter(Boolean);

  /* ---------- start ---------- */
  new ResizeObserver(() => { resize(); kick(); }).observe(map);
  new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) { if (!revealT0 && reveal < 1) revealT0 = performance.now(); kick(); } else if (raf) { cancelAnimationFrame(raf); raf = 0; } }).observe(map);
  await Promise.race([Promise.all([document.fonts.load(`500 12px ${MONO}`), document.fonts.load(`640 13px ${SANS}`)]), new Promise(r => setTimeout(r, 1500))]);
  sizeCache.clear(); resize();
  const q = new URLSearchParams(location.search);
  setLayer(q.get('layer') === 'disk' ? 'disk' : 'memory', true);
  const ft = q.get('f') ? byKey(q.get('f')!) : null;
  if (ft) {
    reveal = 2;
    root.scrollIntoView({ block: 'start' });
    const at = parseInt((q.get('at') || '').replace(/^0x/i, ''), 16);
    if (!isNaN(at) && at >= 0 && at < sizeOf(ft, layer)) { const [cx, cy] = cellOf(ft, at); Object.assign(cam, viewAt(cx + 0.5, cy + 0.5, 26)); selected = { t: ft, k: at }; pinned = regionAt(ft, layer, at); }
    else Object.assign(cam, fitView(tRect(ft)));
  } else Object.assign(cam, fitView(PLATE, 0.92));
  if (!ft && !reduce) revealT0 = visible ? performance.now() : 0; else reveal = 2;
  root.classList.add('is-ready');
  kick();
  (window as any).__bx = { cam, state: () => state, setLayer };
}
