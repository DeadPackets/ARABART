const D = document, $ = (s, r = D) => r.querySelector(s), $$ = (s, r = D) => [...r.querySelectorAll(s)];
D.documentElement.classList.add('js');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const hex = (n, d = 2) => n.toString(16).toUpperCase().padStart(d, '0');
const HEX = Array.from({ length: 256 }, (_, i) => hex(i));
const fmtN = n => n.toLocaleString('en-US');
const easeOut = t => 1 - Math.pow(1 - t, 3);

/* ---------- data ---------- */
const CLASSES = ['sea', 'header', 'reloc', 'entry', 'unpacker', 'control', 'literal', 'text', 'backref', 'never'];
const RGB = { sea: [255, 255, 255], header: [0, 0, 170], reloc: [85, 85, 255], entry: [0, 0, 0], unpacker: [0, 170, 0], control: [170, 170, 170], literal: [0, 170, 170], text: [170, 0, 0], backref: [85, 85, 85], never: [170, 85, 0] };
const CSS = Object.fromEntries(Object.entries(RGB).map(([k, v]) => [k, `rgb(${v.join(' ')})`])), css = k => CSS[k];
const CL = {
  literal: ['Literal', 'His program’s bytes, stored as-is', 'A byte of the original program, stored as-is.'],
  text: ['Readable text', 'Literals that spell out text', 'A literal byte that is part of readable text.'],
  backref: ['Back-reference', 'Copy bytes already rebuilt', 'Tells the unpacker to copy bytes it already rebuilt.'],
  control: ['Control bits', 'Steer the unpacker, bit by bit', 'Read one bit at a time. Each bit helps the unpacker decide what comes next.'],
  unpacker: ['Unpacker', 'Code that rebuilds the program', 'Code that rebuilds the program in memory at start-up.'],
  entry: ['Entry code', 'The first code to run', 'Among the first instructions to run.'],
  header: ['Header', 'What DOS reads first', 'A header field. DOS reads it before the program starts.'],
  reloc: ['Relocation', 'An address DOS fixes up', 'An address that DOS fixes up when it loads the program.'],
  never: ['Never read', 'Nothing reads these at start', 'Nothing reads this byte when the program starts.'],
};
const REG = {
  header: ['Header', () => 'The first 32 bytes. DOS reads them to learn the size of the program, where it starts, and which address to fix up.'],
  entry: ['Entry code', t => t.com ? 'The first instructions to run. They check that there is enough memory, move the packed body to the top, then jump to the unpacker.' : 'The first instructions to run. They move the packed body higher in memory, one paragraph at a time, then jump to the unpacker.'],
  packed: ['Packed body', () => 'The real program, compressed. Cyan bytes are stored as-is. Grey bytes tell the unpacker what to copy, and from where.'],
  unpacker: ['Unpacker', (t, r) => `${r.b - r.a} bytes of code that rebuild the program in memory at start-up, then jump into it.`],
  never: ['Never read', (t, r) => `${fmtN(r.b - r.a)} bytes that the unpacker does not read when the program starts.`],
};
const LIB = { id: 'arabart-lib', title: 'ARABART library', subtitle: 'Arabic graphics library for DOS graphics mode', year: '1991 to 1993', language: 'Assembly', executable: 'ARABART.EXE', folder: 'ARABART' };
const SHORT = { 'arabart-lib': 'ARABART library', 'arabart-demo': 'ARABART Demo', 'arabart-editor': 'ARABART Editor', 'arabart-commercial': 'ARABART Commercial', 'arabic-basmallah': 'Basmallah', 'portsaid-it-screensaver': 'Port Said IT', taher: 'TAHER', 'formula-solver': 'Formula Solver', winkey: 'WINKEY', 'digi-test': 'Digi-Test', 'kvc-antivirus': 'KVC', 'kemyam-splash': 'Kemyam', 'text-editor-gui': 'Text Editor GUI', 'text-editor-demo': 'Text Editor Demo', 'portsaid-cs-splash': 'Port Said CS', 'brave-sun': 'The Brave Sun' };
const NOTE = { 0x23: 'string copies run forward', 0x24: 'remember the segments DOS gave us', 0x27: 'where our own code was loaded', 0x2D: 'size of the packed body, in 16-byte paragraphs', 0x3F: '8 words = one 16-byte paragraph', 0x42: 'copy one paragraph upward in memory', 0x44: 'step back one paragraph', 0x45: 'step back one paragraph', 0x46: 'step back one paragraph', 0x47: 'repeat until the whole body has moved', 0x53: '16-bit buffer for the decompressor’s bit reader', 0x55: 'jump into the unpacker, which rebuilds the real program' };
const STRINGOPS = /^(rep |repne )?(movs|lods|stos|cmps|scas)[bw]$/;

const [J, buf] = await Promise.all([fetch('plate.json').then(r => r.json()), fetch('plate.bin').then(r => r.arrayBuffer())]);
const W = J.W, H = J.H, N = J.total;
const BYTES = new Uint8Array(buf, 0, N), CLS = new Uint8Array(buf, N, N);
const PROGS = window.PROGRAMS || [];
const T = J.territories.map((t, i) => ({ ...t, i, p: t.id === 'arabart-lib' ? LIB : PROGS.find(p => p.id === t.id) || { title: t.file } }));
const lib = T.find(t => t.id === 'arabart-lib');
const PLATE = { x: 0, y: 0, w: W, h: H };
const CAREER = [
  { id: 'sakhr', x: W + 120, y: 0, w: 780, h: H },
  { id: 'alcatel', x: 0, y: H + 120, w: W + 900, h: 782 },
  { id: 'dinar', x: W + 1020, y: 0, w: 520, h: H + 902 },
];
const WORLD = { x: -60, y: -90, w: W + 1020 + 520 + 120, h: H + 902 + 160 };

/* ---------- DOM ---------- */
const map = $('#map'), cgl = $('#gl'), cov = $('#ov'), ctx = cov.getContext('2d'), panel = $('#panel'), labels = $('#labels');
let VW = innerWidth, VH = innerHeight, DPR = Math.min(2, devicePixelRatio || 1);
const phone = () => innerWidth <= 760;
function inset() {
  if (phone()) return { l: 0, t: 104, r: 0, b: panel.getBoundingClientRect().height + 58 };
  return { l: panel.offsetWidth, t: 64, r: 120, b: 64 };
}
const cam = { x: W / 2, y: H / 2, s: 1 };
const toS = (wx, wy) => [(wx - cam.x) * cam.s + VW / 2, (wy - cam.y) * cam.s + VH / 2];
const toW = (sx, sy) => [(sx - VW / 2) / cam.s + cam.x, (sy - VH / 2) / cam.s + cam.y];
function focusPt() { const I = inset(); return [(I.l + VW - I.r) / 2, (I.t + VH - I.b) / 2]; }
function viewAt(wx, wy, s) { const [fx, fy] = focusPt(); return { x: wx - (fx - VW / 2) / s, y: wy - (fy - VH / 2) / s, s }; }
function fitView(r, pad = 0.86) {
  const I = inset(), aw = VW - I.l - I.r, ah = VH - I.t - I.b;
  const s = clamp(Math.min(aw * pad / r.w, ah * pad / r.h), sMin(), S_MAX);
  return viewAt(r.x + r.w / 2, r.y + r.h / 2, s);
}
const S_MAX = 140;
const sMin = () => { const I = inset(); return Math.min((VW - I.l - I.r) / WORLD.w, (VH - I.t - I.b) / WORLD.h) * 0.85; };
const sPlate = () => fitView(PLATE).s;
const tRect = t => ({ x: t.x, y: t.y, w: t.w, h: t.h });
const cellOf = (t, k) => [t.x + (k % t.w), t.y + Math.floor(k / t.w)];
function territoryAt(wx, wy) {
  const cx = Math.floor(wx), cy = Math.floor(wy);
  for (const t of T) if (cx >= t.x && cx < t.x + t.w && cy >= t.y && cy < t.y + t.h) {
    const k = (cy - t.y) * t.w + (cx - t.x);
    return { t, k: k < t.size ? k : -1 };
  }
  return null;
}
const regionOf = (t, k) => t.regions.find(r => k >= r.a && k < r.b);
const clsAt = (t, k) => CLASSES[CLS[t.start + k]];
function insAt(t, k) { return t.code.find(c => k >= c.a && k < c.a + c.n); }
function fmtIns(t, c) {
  const m = c.m, base = t.com ? 0x100 : -0x20;
  if (m === 'ljmp') { const [sg, of] = c.o.split(':').map(v => parseInt(v, 16)); return `jmp far ${hex(sg, 4)}:${hex(of, 4)}`; }
  if (STRINGOPS.test(m)) return m;
  if (/^(j|loop|call)/.test(m) && /^0x[0-9a-f]+$/.test(c.o)) return `${m} ${hex((parseInt(c.o, 16) + base) & 0xfffff, 5)}`;
  const o = c.o.replace(/0x([0-9a-f]+)/g, (_, h) => { const v = parseInt(h, 16); if (v < 10) return String(v); let s = h.toUpperCase(); if (s.length % 2) s = '0' + s; if (/^[A-F]/.test(s)) s = '0' + s; return s + 'h'; });
  return `${m} ${o}`.trim();
}

/* ---------- WebGL ---------- */
const VS = `#version 300 es
void main(){ vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2); gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0); }`;
const FS = `#version 300 es
precision highp float;
uniform sampler2D uData, uCol;
uniform vec2 uPlate, uRes;
uniform vec3 uCam;
uniform float uDpr, uReveal, uTint, uDots;
uniform vec4 uR0, uR1, uR2;
out vec4 o;
float inR(vec2 w, vec4 r){ return step(r.x, w.x) * step(r.y, w.y) * step(w.x, r.x + r.z) * step(w.y, r.y + r.w); }
void main(){
  vec2 cssp = vec2(gl_FragCoord.x, uRes.y * uDpr - gl_FragCoord.y) / uDpr;
  vec2 w = (cssp - 0.5 * uRes) / uCam.z + uCam.xy;
  vec3 c = vec3(1.0);
  if (w.x >= 0.0 && w.y >= 0.0 && w.x < uPlate.x && w.y < uPlate.y) {
    ivec2 cell = ivec2(floor(w));
    vec4 d = texelFetch(uData, cell, 0);
    if (d.b > 0.0) {
      float lod = max(0.0, log2(1.0 / (uCam.z * uDpr)));
      vec3 k = textureLod(uCol, w / uPlate, lod).rgb;
      float px = 1.0 / uCam.z;
      vec2 f = fract(w);
      float gap = smoothstep(4.0, 8.0, uCam.z) * max(step(f.x, px), step(f.y, px));
      float para = smoothstep(9.0, 16.0, uCam.z) * step(mod(float(cell.x), 16.0), 0.5) * step(f.x, 3.0 * px);
      float band = step(1.0 - 4.0 * px, f.y);
      k = mix(k, mix(mix(k, vec3(1.0), 0.8), k, band), uTint);
      k = mix(k, vec3(1.0), max(gap, para));
      float vis = step(d.a, uReveal);
      float edge = vis * step(uReveal - 0.025, d.a) * step(uReveal, 1.0);
      k = mix(k, vec3(0.0), edge);
      c = mix(vec3(1.0), k, vis);
    }
  } else if (uDots > 0.0) {
    float inside = max(max(inR(w, uR0), inR(w, uR1)), inR(w, uR2));
    if (inside > 0.0) {
      float sp = 12.0 * exp2(max(0.0, ceil(log2(7.0 / (12.0 * uCam.z)))));
      vec2 q = (fract(w / sp) - 0.5) * sp;
      float r = 1.05 / uCam.z;
      c = mix(c, vec3(0.667), (1.0 - smoothstep(r * 0.6, r, length(q))) * uDots);
    }
  }
  o = vec4(c, 1.0);
}`;
let gl = null, U = {}, reveal = reduce ? 2 : 0;
try { gl = cgl.getContext('webgl2', { antialias: false, alpha: false }); } catch (e) { gl = null; }
if (gl) {
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog); gl.useProgram(prog);
  for (const n of ['uData', 'uCol', 'uPlate', 'uRes', 'uCam', 'uDpr', 'uReveal', 'uTint', 'uDots', 'uR0', 'uR1', 'uR2']) U[n] = gl.getUniformLocation(prog, n);
  const data = new Uint8Array(W * H * 4), col = new Uint8Array(W * H * 4).fill(255);
  T.forEach((t, i) => {
    for (let k = 0; k < t.size; k++) {
      const x = t.x + (k % t.w), row = Math.floor(k / t.w), p = ((t.y + row) * W + x) * 4, c = CLS[t.start + k];
      const h = ((x * 73856093) ^ (row * 19349663)) >>> 0;
      data[p] = BYTES[t.start + k]; data[p + 1] = c; data[p + 2] = i + 1;
      data[p + 3] = Math.min(250, Math.round(((i / T.length) * 0.3 + (row / t.h) * 0.62 + (h % 1000) / 1000 * 0.05) * 255));
      const rgb = RGB[CLASSES[c]]; col[p] = rgb[0]; col[p + 1] = rgb[1]; col[p + 2] = rgb[2];
    }
  });
  const tex = (unit, arr, mip) => {
    const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, W, H, 0, gl.RGBA, gl.UNSIGNED_BYTE, arr);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mip ? gl.LINEAR_MIPMAP_LINEAR : gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    if (mip) gl.generateMipmap(gl.TEXTURE_2D);
  };
  tex(0, data, false); tex(1, col, true);
  gl.uniform1i(U.uData, 0); gl.uniform1i(U.uCol, 1); gl.uniform2f(U.uPlate, W, H);
  const r = CAREER;
  gl.uniform4f(U.uR0, r[0].x, r[0].y, r[0].w, r[0].h); gl.uniform4f(U.uR1, r[1].x, r[1].y, r[1].w, r[1].h); gl.uniform4f(U.uR2, r[2].x, r[2].y, r[2].w, r[2].h);
  D.documentElement.classList.add('has-gl');
} else reveal = 2;

/* ---------- labels ---------- */
for (const t of T) {
  const b = D.createElement('button');
  b.className = 'tl'; b.type = 'button';
  b.innerHTML = `<span class="n">${SHORT[t.id] || t.p.title}</span><span class="y">${t.p.year}</span>`;
  b.setAttribute('aria-label', `${t.p.title}, ${t.p.year}, ${fmtN(t.size)} bytes. Zoom to it.`);
  b.addEventListener('click', () => flyTo(fitView(tRect(t))));
  labels.append(b); t.el = b;
}
const CAREER_HTML = {
  plate: `<h3>Port Said, the DOS programs</h3><p class="when">1991 to 1993 · every byte mapped</p>`,
  sakhr: `<h3>Sakhr Software, Cairo</h3><p class="when">Project Leader · Jun 1993 to Sep 1996<br>Documented, not yet mapped</p><ul><li>Multi-threaded printing core</li><li>Bilingual multi-font text displayer (Ustaz)</li><li>Common Arabic APIs for Windows</li><li>First multimedia installer framework</li></ul>`,
  alcatel: `<h3>Newbridge Networks → Alcatel, Kanata</h3><p class="when">Senior Designer and team leader, OSS interfaces · Oct 1996 to Nov 2006<br>Documented, not yet mapped</p><ul><li>Architect of the 5620 CORBA product (JIDM)</li><li>JIDM discussions at the ITU</li><li>jidmTester, adopted by Alcatel labs</li><li>An EventChannel at twice the standard speed</li><li>Patent <span class="pat">US 7,603,377 B2</span> (2009)</li></ul>`,
  dinar: `<h3>DinarSoft Corporation, Kanata</h3><p class="when">Founded Nov 2002 · utilities for Pocket PC and Windows Mobile, 2003 to 2008<br>Documented, not yet mapped</p><ul><li>MemMaid</li><li>HandySwitcher</li><li>HandyMenu</li><li>HandyLauncher</li><li>TapText</li><li>HijriDate</li></ul>`,
};
const CLAB = [{ id: 'plate', ...PLATE }, ...CAREER].map(r => { const d = D.createElement('div'); d.className = 'cl' + (r.id === 'plate' ? ' plate' : ''); d.innerHTML = CAREER_HTML[r.id]; labels.append(d); return { ...r, el: d }; });
const callout = D.createElement('div'); callout.className = 'callout'; labels.append(callout);
const sizeCache = new Map();
function measure(el, cls) { const key = el.textContent + cls; if (sizeCache.has(key)) return sizeCache.get(key); const was = el.className; el.className = 'tl on ' + cls; const r = [el.offsetWidth, el.offsetHeight]; el.className = was; sizeCache.set(key, r); return r; }

/* ---------- camera motion ---------- */
let fly = null, raf = 0, last = 0, zoomT = null, drag = null;
const vel = { x: 0, y: 0 };
function kick() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); } }
function clampCam() {
  cam.s = clamp(cam.s, sMin(), S_MAX);
  const [fx, fy] = focusPt(); const [wx, wy] = toW(fx, fy);
  const nx = clamp(wx, WORLD.x, WORLD.x + WORLD.w), ny = clamp(wy, WORLD.y, WORLD.y + WORLD.h);
  cam.x += nx - wx; cam.y += ny - wy;
}
function zoomAt(sx, sy, s) { s = clamp(s, sMin(), S_MAX); const [wx, wy] = toW(sx, sy); cam.s = s; cam.x = wx - (sx - VW / 2) / s; cam.y = wy - (sy - VH / 2) / s; }
function zoomBy(f, ax, ay) {
  if (ax == null) [ax, ay] = focusPt();
  fly = null;
  const base = zoomT ? zoomT.ls : Math.log(cam.s);
  const ls = Math.log(clamp(Math.exp(base) * f, sMin(), S_MAX));
  if (reduce) { zoomAt(ax, ay, Math.exp(ls)); kick(); return; }
  zoomT = { ls, ax, ay }; kick();
}
function flyTo(v, ms) {
  const [fx, fy] = focusPt();
  v.s = clamp(v.s, sMin(), S_MAX);
  vel.x = vel.y = 0; zoomT = null;
  if (reduce) { Object.assign(cam, v); fly = null; kick(); return; }
  const c0 = toW(fx, fy), w0 = VW / cam.s;
  const c1 = [v.x + (fx - VW / 2) / v.s, v.y + (fy - VH / 2) / v.s], w1 = VW / v.s;
  const rho = 1.4, dx = c1[0] - c0[0], dy = c1[1] - c0[1], u1 = Math.hypot(dx, dy);
  let S, uf, wf;
  if (u1 < 1e-3 * Math.min(w0, w1)) {
    const k = Math.sign(w1 - w0) || 1; S = Math.abs(Math.log(w1 / w0)) / rho; uf = () => 0; wf = s => w0 * Math.exp(k * rho * s);
  } else {
    const b = i => (w1 * w1 - w0 * w0 + (i ? -1 : 1) * rho ** 4 * u1 * u1) / (2 * (i ? w1 : w0) * rho * rho * u1);
    const r = i => Math.log(-b(i) + Math.sqrt(b(i) ** 2 + 1)); const r0 = r(0), r1 = r(1);
    S = (r1 - r0) / rho;
    uf = s => w0 / (rho * rho) * (Math.cosh(r0) * Math.tanh(rho * s + r0) - Math.sinh(r0));
    wf = s => w0 * Math.cosh(r0) / Math.cosh(rho * s + r0);
  }
  if (!isFinite(S) || S < 1e-4) { Object.assign(cam, v); kick(); return; }
  fly = { t0: performance.now(), dur: ms ?? clamp(S * 430, 520, 1650), S, end: v, step: s => { const u = u1 ? uf(s) / u1 : 0; Object.assign(cam, viewAt(c0[0] + dx * u, c0[1] + dy * u, VW / wf(s))); } };
  kick();
}
let revealT0 = 0;
function tick(now) {
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
  if (reveal < 1.05) { reveal = 1.06 * easeOut(Math.min(1, (now - revealT0) / 1500)); busy = true; if (reveal >= 1.05) labels.classList.add('ready'); }
  clampCam(); render();
  if (busy) kick();
}

/* ---------- render ---------- */
let state = {};
function resize() {
  const [fx, fy] = VW ? focusPt() : [0, 0]; const keep = VW ? toW(fx, fy) : null;
  VW = innerWidth; VH = innerHeight; DPR = Math.min(2, devicePixelRatio || 1);
  for (const c of [cgl, cov]) { c.width = Math.round(VW * DPR); c.height = Math.round(VH * DPR); }
  if (gl) gl.viewport(0, 0, cgl.width, cgl.height);
  if (keep) Object.assign(cam, viewAt(keep[0], keep[1], cam.s));
}
function render() {
  const sp = sPlate();
  if (gl) {
    gl.uniform2f(U.uRes, VW, VH); gl.uniform3f(U.uCam, cam.x, cam.y, cam.s); gl.uniform1f(U.uDpr, DPR);
    gl.uniform1f(U.uReveal, reveal); gl.uniform1f(U.uTint, clamp((cam.s - 13) / 9, 0, 1));
    gl.uniform1f(U.uDots, clamp((sp * 0.92 - cam.s) / (sp * 0.3), 0, 1));
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  updateUI(sp); draw2d(sp); placeLabels(sp); drawMini(); drawScale(sp);
}

function levelNow(sp, near) {
  if (cam.s < sp * 0.62) return 'career';
  const fit = near ? fitView(tRect(near)).s * 0.92 : Infinity;
  if (cam.s < Math.min(Math.max(sp * 1.8, 2.2), fit)) return 'archive';
  if (cam.s < 15) return 'program';
  if (cam.s < 32) return 'bytes';
  return 'code';
}
function focusTerr() {
  const [fx, fy] = focusPt(), [wx, wy] = toW(fx, fy);
  let best = null, bd = 60 / cam.s;
  for (const t of T) {
    const dx = Math.max(t.x - wx, 0, wx - (t.x + t.w)), dy = Math.max(t.y - wy, 0, wy - (t.y + t.h)), d = Math.hypot(dx, dy);
    if (d < bd || (d === 0 && bd === 0)) { best = t; bd = d; }
  }
  return best;
}

/* 2D overlay: regions, readable text, hex, code */
function segs(t, a, b) {
  const out = [];
  for (let k = a; k < b;) { const row = Math.floor(k / t.w), c0 = k % t.w, c1 = Math.min(t.w, c0 + (b - k)); out.push([row, c0, c1]); k += c1 - c0; }
  return out;
}
function regionPath(t, r) {
  const a = r.a, b = r.b, w = t.w, r0 = Math.floor(a / w), c0 = a % w, r1 = Math.floor((b - 1) / w), c1 = (b - 1) % w + 1;
  const P = r0 === r1 ? [[c0, r0], [c1, r0], [c1, r0 + 1], [c0, r0 + 1]]
    : [[c0, r0], [w, r0], [w, r1], [c1, r1], [c1, r1 + 1], [0, r1 + 1], [0, r0 + 1], [c0, r0 + 1]];
  ctx.beginPath(); P.forEach(([x, y], i) => { const [sx, sy] = toS(t.x + x, t.y + y); i ? ctx.lineTo(sx, sy) : ctx.moveTo(sx, sy); }); ctx.closePath();
}
let hover = null, selected = null, curIns = null, placed = [], bigRect = null;
const hit = (r) => placed.some(p => r[0] < p[2] && r[2] > p[0] && r[1] < p[3] && r[3] > p[1]);
function chip(text, x, y, font, opts = {}) {
  const I = inset(), room = VW - 8 - (opts.slid ? x : I.l);
  ctx.font = font; let w = ctx.measureText(text).width + 10;
  if (w > room) { font = font.replace(/[\d.]+px/, '9px'); ctx.font = font; w = ctx.measureText(text).width + 10; }
  if (w > room) {
    const L = q => (q.match(/[A-Za-z]/g) || []).length, n3 = Math.floor(text.length / 3), head = L(text.slice(0, n3)) < L(text.slice(-n3));
    while (w > room && text.length > 4) { text = head ? '\u2026' + text.replace(/^\u2026/, '').slice(2) : text.replace(/\u2026$/, '').slice(0, -2) + '\u2026'; w = ctx.measureText(text).width + 10; }
  }
  x = clamp(x, I.l + 4, VW - 4 - w);
  const h = opts.h || 18, r = [x, y, x + w, y + h];
  if (x < I.l + 4 || x + w > VW - 4 || y < I.t - 30 || y + h > VH - I.b) return null;
  const blk = placed.find(p => r[0] < p[2] && r[2] > p[0] && r[1] < p[3] && r[3] > p[1]);
  if (blk) {
    if (opts.slid || blk[2] + 4 + 60 > VW - 4) return null;
    return chip(text, blk[2] + 4, y, font, { ...opts, slid: true });
  }
  placed.push(r);
  ctx.fillStyle = '#fff'; ctx.fillRect(x, y, w, h);
  if (opts.border) { ctx.strokeStyle = '#1f1f1f'; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1); }
  ctx.fillStyle = opts.color || '#1f1f1f'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  ctx.fillText(text, x + 5, y + h / 2 + 0.5);
  return r;
}
const CHROME = ['#crumbs', '.topbtns', '#ladder', '.zoom', '#mini', '#scale'].map(q => $(q));
const MONO = '"Martian Mono", ui-monospace, monospace', SANS = '"Archivo", system-ui, sans-serif';
function draw2d(sp) {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.clearRect(0, 0, VW, VH);
  placed = CHROME.map(el => el.getBoundingClientRect()).filter(r => r.width).map(r => [r.left - 6, r.top - 6, r.right + 6, r.bottom + 6]);
  const [x0, y0] = toW(0, 0), [x1, y1] = toW(VW, VH);
  const vis = T.filter(t => t.x < x1 && t.x + t.w > x0 && t.y < y1 && t.y + t.h > y0);
  const s = cam.s, lvl = state.level, ft = state.focus;
  // career outlines
  if (cam.s < sp * 0.92) {
    ctx.save(); ctx.globalAlpha = clamp((sp * 0.92 - cam.s) / (sp * 0.3), 0, 1); ctx.setLineDash([5, 5]); ctx.lineWidth = 1; ctx.strokeStyle = 'rgb(150 150 150)';
    for (const r of CAREER) { const [a, b] = toS(r.x, r.y); ctx.strokeRect(a + 0.5, b + 0.5, r.w * s, r.h * s); }
    ctx.restore();
  }
  // hovered territory at archive
  if (lvl === 'archive' && hover && hover.t) { const t = hover.t, [a, b] = toS(t.x, t.y); ctx.lineWidth = 2; ctx.strokeStyle = '#000'; ctx.strokeRect(a - 3, b - 3, t.w * s + 6, t.h * s + 6); }
  // regions, readable-text underlines, region callouts, then text chips
  const regA = clamp((s - 1.8) / 1.5, 0, 1) * clamp((60 - s) / 20, 0, 1);
  if (regA > 0) {
    ctx.save(); ctx.globalAlpha = regA;
    for (const t of vis) for (const r of t.regions) { regionPath(t, r); ctx.lineWidth = t === ft ? 1.5 : 1; ctx.strokeStyle = t === ft ? '#000' : 'rgb(120 120 120)'; ctx.stroke(); }
    ctx.restore();
  }
  const showF = s >= 2.2 && s < 20, frs = showF ? vis.filter(t => !ft || t === ft).map(t => [t, [...t.strings].sort((a, b) => b.n - a.n).slice(0, 8)]) : [];
  for (const [t, fr] of frs) for (const f of fr) for (const [row, c0, c1] of segs(t, f.a, f.a + f.n)) {
    const [a, b] = toS(t.x + c0, t.y + row), th = Math.max(1.5, s * 0.25); ctx.fillStyle = '#000'; ctx.fillRect(a, b + s - th, (c1 - c0) * s, th);
  }
  bigRect = null;
  if (ft && state.level !== 'archive' && state.level !== 'career') {
    const [w, h] = measure(ft.el, 'big'), [sx, sy] = toS(ft.x, ft.y), I = inset();
    const x = clamp(sx, I.l + 12, Math.max(I.l + 12, sx + ft.w * s - w)), y = sy - h - 10;
    const r = [x, y, x + w, y + h];
    if (y >= I.t - 50 && !hit(r)) { bigRect = r; placed.push(r); }
  }
  if (regA > 0 && ft && s < 15) regionCallouts(ft);
  const font = `500 10.5px ${MONO}`;
  for (const [t, fr] of frs) for (const f of fr) {
    const [sx, sy] = toS(...cellOf(t, f.a));
    const r = chip(f.t, sx - 2, sy - 21, font, { color: css('text') }) || chip(f.t, sx - 2, sy + s + 3, font, { color: css('text') });
    if (r) { const lx = clamp(sx + 0.5, r[0] + 2, r[2] - 2), below = r[1] > sy; ctx.strokeStyle = css('text'); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(lx, below ? r[1] : r[3]); ctx.lineTo(lx, sy + (below ? s : 0)); ctx.stroke(); }
  }
  // hex + ascii; skipped mid-flight when the screen holds too many cells to letter cheaply
  if (s >= 16 && !(fly && VW * VH / (s * s) > 1500)) {
    const fs = clamp(s * 0.34, 9, 15), showA = s >= 26, HEXF = `500 ${fs}px ${MONO}`, ASCF = `700 ${fs * 1.05}px ${MONO}`, hy = showA ? 0.34 : 0.45;
    ctx.save(); ctx.globalAlpha = clamp((s - 16) / 6, 0, 1); ctx.textBaseline = 'middle';
    for (const t of vis) {
      const cx0 = Math.max(t.x, Math.floor(x0)), cx1 = Math.min(t.x + t.w, Math.ceil(x1)), cy0 = Math.max(t.y, Math.floor(y0)), cy1 = Math.min(t.y + t.h, Math.ceil(y1));
      const rowEnd = cy => Math.min(cx1, t.x + Math.max(0, Math.min(t.w, t.size - (cy - t.y) * t.w)));
      if (cx0 === t.x) {
        ctx.font = `400 ${clamp(s * 0.28, 9, 12)}px ${MONO}`; ctx.fillStyle = 'rgb(110 110 110)'; ctx.textAlign = 'right';
        for (let cy = cy0; cy < cy1; cy++) ctx.fillText(hex((cy - t.y) * t.w, 5), (t.x - cam.x) * s + VW / 2 - 8, (cy - cam.y) * s + VH / 2 + s * 0.4);
      }
      ctx.textAlign = 'center'; ctx.font = HEXF; ctx.fillStyle = '#141414';
      for (let cy = cy0; cy < cy1; cy++) { const sy = (cy - cam.y) * s + VH / 2 + s * hy, e = rowEnd(cy);
        for (let cx = cx0; cx < e; cx++) ctx.fillText(HEX[BYTES[t.start + (cy - t.y) * t.w + cx - t.x]], (cx - cam.x) * s + VW / 2 + s / 2, sy); }
      if (showA) {
        ctx.font = ASCF;
        for (let cy = cy0; cy < cy1; cy++) { const sy = (cy - cam.y) * s + VH / 2 + s * 0.68, e = rowEnd(cy);
          for (let cx = cx0; cx < e; cx++) { const k = t.start + (cy - t.y) * t.w + cx - t.x, b = BYTES[k], c = CLS[k];
            if ((c === 6 || c === 7) && b >= 0x20 && b < 0x7f) { ctx.fillStyle = c === 7 ? css('text') : 'rgb(0 110 110)'; ctx.fillText(String.fromCharCode(b), (cx - cam.x) * s + VW / 2 + s / 2, sy); } } }
      }
      if (s >= 30) drawCode(t, x0, x1, y0, y1);
    }
    ctx.restore();
  }
  // hover / selected byte
  const mark = hover?.k >= 0 && state.level !== 'archive' ? hover : selected;
  if (mark && mark.k >= 0 && s >= 5) {
    const [cx, cy] = cellOf(mark.t, mark.k), [a, b] = toS(cx, cy);
    ctx.lineWidth = 2; ctx.strokeStyle = '#000'; ctx.strokeRect(a - 1, b - 1, s + 2, s + 2);
  }
}
function drawCode(t, x0, x1, y0, y1) {
  const s = cam.s, a = clamp((s - 30) / 8, 0, 1);
  ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  const fs = clamp(s * 0.22, 9, 13);
  for (const c of t.code) {
    const [cx, cy] = cellOf(t, c.a); if (cy + 1 < y0 || cy > y1 + 1) continue;
    const txt = fmtIns(t, c), mn = txt.split(' ')[0];
    for (const [row, c0, c1] of segs(t, c.a, c.a + c.n)) {
      const [sx, sy] = toS(t.x + c0, t.y + row), w = (c1 - c0) * s;
      if (sx > VW || sx + w < 0) continue;
      const by = sy + s * 0.58, on = curIns && curIns.t === t && curIns.c === c;
      ctx.strokeStyle = on ? '#000' : 'rgb(40 40 40)'; ctx.lineWidth = on ? 2 : 1.25;
      ctx.beginPath(); ctx.moveTo(sx + 4, by - 4); ctx.lineTo(sx + 4, by); ctx.lineTo(sx + w - 4, by); ctx.lineTo(sx + w - 4, by - 4); ctx.stroke();
      ctx.font = `${on ? 700 : 500} ${fs}px ${MONO}`; ctx.fillStyle = '#000';
      const room = w - 10, full = ctx.measureText(txt).width;
      const label = full <= room ? txt : ctx.measureText(mn).width <= room ? mn : '';
      if (label) ctx.fillText(label, sx + 6, sy + s * 0.79);
    }
  }
  ctx.restore();
}
function regionCallouts(t) {
  const I = inset(), s = cam.s, items = [];
  const [tx0] = toS(t.x, t.y), tx1 = tx0 + t.w * s, right = tx1 + 24 + 190 < VW - I.r;
  for (const r of t.regions) {
    const sg = segs(t, r.a, r.b), mid = sg[Math.floor(sg.length / 2)];
    const [ax, ay] = toS(t.x + (right ? mid[2] : mid[1]), t.y + mid[0] + 0.5);
    if (ay < I.t || ay > VH - I.b) continue;
    items.push({ r, ax, ay, y: ay });
  }
  items.sort((a, b) => a.y - b.y);
  for (let i = 1; i < items.length; i++) items[i].y = Math.max(items[i].y, items[i - 1].y + 40);
  const done = [];
  for (const it of items) {
    const name = REG[it.r.k][0], n = `${fmtN(it.r.b - it.r.a)} bytes`;
    ctx.font = `640 13px ${SANS}`; const w1 = ctx.measureText(name).width; ctx.font = `400 10.5px ${MONO}`; const w2 = ctx.measureText(n).width;
    const w = Math.max(w1, w2) + 14, h = 36, lx = right ? tx1 + 26 : Math.max(I.l + 8, tx0 - 26 - w);
    let rect = [lx, it.y - h / 2, lx + w, it.y + h / 2], tries = 0;
    while (hit(rect) && tries++ < 5) { it.y += 14; rect = [lx, it.y - h / 2, lx + w, it.y + h / 2]; }
    if (hit(rect)) continue;
    placed.push(rect); done.push({ ...it, name, n, rect });
  }
  ctx.save(); ctx.strokeStyle = '#000'; ctx.fillStyle = '#000'; ctx.lineWidth = 1;
  for (const d of done) {
    const [lx, ly, rx] = d.rect;
    if (!right && d.ax <= rx + 4) continue;
    const ex = right ? tx1 + 12 : Math.min(tx0 - 12, d.ax - 8);
    ctx.beginPath(); ctx.moveTo(d.ax, d.ay); ctx.lineTo(ex, d.ay); ctx.lineTo(ex, d.y); ctx.lineTo(right ? lx : rx, d.y); ctx.stroke();
    ctx.beginPath(); ctx.arc(d.ax, d.ay, 2.5, 0, 7); ctx.fill();
  }
  for (const d of done) {
    const [lx, ly, rx, by] = d.rect;
    ctx.fillStyle = '#fff'; ctx.fillRect(lx, ly, rx - lx, by - ly); ctx.strokeRect(lx + 0.5, ly + 0.5, rx - lx - 1, by - ly - 1);
    ctx.fillStyle = '#141414'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.font = `640 13px ${SANS}`; ctx.fillText(d.name, lx + 7, ly + 16);
    ctx.font = `400 10.5px ${MONO}`; ctx.fillStyle = 'rgb(90 90 90)'; ctx.fillText(d.n, lx + 7, ly + 29);
  }
  ctx.restore();
}

/* DOM labels */
function placeLabels(sp) {
  const I = inset(), s = cam.s, lvl = state.level, rects = [...placed];
  const overl = r => rects.some(p => r[0] < p[2] && r[2] > p[0] && r[1] < p[3] && r[3] > p[1]);
  const showT = lvl !== 'career' && reveal > 0.6;
  const order = [...T].sort((a, b) => (b === state.focus) - (a === state.focus) || (b === lib) - (a === lib) || b.size - a.size);
  const fits = r => r[0] >= I.l + 2 && r[2] <= VW - 2 && r[1] >= I.t - 50 && r[3] <= VH - I.b - 2 && !overl(r);
  for (const t of order) {
    const el = t.el; let on = false;
    if (showT && (lvl === 'archive' || t === state.focus || s < 15)) {
      const big = t === state.focus && lvl !== 'archive';
      const cls = big ? 'big' : '';
      const [w, h] = measure(el, cls);
      const [sx, sy] = toS(t.x, t.y), tw = t.w * s;
      const cands = big ? (bigRect ? [[bigRect[0], bigRect[1], false]] : []) : [[sx, sy - h - 3, false]];
      if (!big) { if (t.h * s > w) cands.push([sx + tw + 2, sy, true]); cands.push([sx + 4, sy + 6, false]); }
      for (const [x, y, rot] of cands) {
        const r = rot ? [x, y, x + h, y + w] : [x, y, x + w, y + h];
        if (!big && !fits(r)) continue;
        rects.push(r); on = true;
        el.className = 'tl on ' + cls;
        el.style.transform = rot ? `translate(${x + h}px, ${y}px) rotate(90deg)` : `translate(${x}px, ${y}px)`;
        break;
      }
    }
    if (!on && el.classList.contains('on')) el.className = 'tl';
    el.tabIndex = on ? 0 : -1;
  }
  // career labels
  const showC = cam.s < sp * 0.8;
  for (const c of CLAB) {
    const [sx, sy] = toS(c.x, c.y), w = c.w * s, h = c.h * s;
    let on = showC && w > 70;
    if (on) {
      const plate = c.id === 'plate';
      const x = sx + (plate ? 0 : 14), y = plate ? sy - 46 : sy + 14;
      c.el.classList.toggle('compact', w < 190 || h < 150);
      c.el.style.maxWidth = plate ? 'none' : Math.max(80, Math.min(w - 28, VW - 12 - x)) + 'px';
      c.el.style.transform = `translate(${x}px, ${y}px)`;
      on = x > I.l - 10 && x < VW - 60 && y < VH - I.b - 20;
    }
    c.el.classList.toggle('on', on);
  }
  // instruction callout
  if (curIns && NOTE[curIns.c.a] != null && curIns.t === lib && s >= 30) {
    const c = curIns.c, [sx, sy] = toS(...cellOf(lib, c.a));
    callout.innerHTML = `<span class="ins">${fmtIns(lib, c)}</span>; ${NOTE[c.a]}`;
    callout.style.transform = `translate(${clamp(sx, I.l + 8, VW - 260)}px, ${sy + s + 12}px)`;
    callout.classList.add('on');
  } else callout.classList.remove('on');
}

/* minimap + scale */
const miniC = $('#mini canvas'), mctx = miniC.getContext('2d'), plateImg = $('#fallback');
function drawMini() {
  const cw = miniC.width, ch = miniC.height, k = Math.min(cw / W, ch / H) * 0.9, ox = (cw - W * k) / 2, oy = (ch - H * k) / 2;
  mctx.fillStyle = '#fff'; mctx.fillRect(0, 0, cw, ch);
  mctx.imageSmoothingEnabled = true;
  if (plateImg.complete && plateImg.naturalWidth) mctx.drawImage(plateImg, ox, oy, W * k, H * k);
  const I = inset(), [a, b] = toW(I.l, I.t), [c, d] = toW(VW - I.r, VH - I.b);
  mctx.lineWidth = 3; mctx.strokeStyle = '#000';
  const rx = clamp(ox + a * k, -2, cw + 2), ry = clamp(oy + b * k, -2, ch + 2), rx2 = clamp(ox + c * k, -2, cw + 2), ry2 = clamp(oy + d * k, -2, ch + 2);
  mctx.strokeRect(rx, ry, Math.max(4, rx2 - rx), Math.max(4, ry2 - ry));
  miniC._map = { k, ox, oy };
}
const scaleEl = $('#scale');
function drawScale(sp) {
  if (state.level === 'career') { scaleEl.style.visibility = 'hidden'; return; }
  scaleEl.style.visibility = '';
  let n = 1; while (n * 2 * cam.s <= 130 && n < 8192) n *= 2;
  const txt = n === 16 ? '16 bytes, one paragraph' : n >= 1024 ? `${n / 1024} KB` : `${n} byte${n > 1 ? 's' : ''}`;
  scaleEl.firstElementChild.textContent = txt; scaleEl.lastElementChild.style.width = (n * cam.s).toFixed(1) + 'px';
}

/* ---------- panel state ---------- */
const secs = { archive: $('#s-archive'), exhibit: $('#s-exhibit'), program: $('#s-program'), bytes: $('#s-bytes'), career: $('#s-career') };
const TERMS = { career: ['dosbox'], archive: ['byte', 'packer', 'vga'], program: ['packer', 'literal', 'backref'], bytes: ['byte', 'paragraph', 'control'], code: ['assembly', 'paragraph'] };
const TERM_NAME = id => $(`#g-${id} dt`)?.textContent || id;
const seenTerms = new Set();
let lastTermKey = '', depth = 'glance';
function termsFor(lvl, t) {
  const set = new Set(TERMS[lvl] || []);
  if (t && lvl !== 'archive' && lvl !== 'career') {
    if (lvl === 'program') set.add(t.com ? 'com' : 'exe');
    if (t === lib && lvl === 'program') ['tsr', 'shaping'].forEach(x => set.add(x));
    if (t.id === 'formula-solver') set.add('bcd');
    if (t.strings.some(f => /Borland|Turbo/.test(f.t.replace(/·/g, '')))) set.add('borland');
    if (t.strings.some(f => /BGI/.test(f.t))) set.add('bgi');
    if (t.com && lvl === 'code') set.add('interrupt');
  }
  return [...set];
}
function renderTerms(list) {
  const key = list.join(); if (key === lastTermKey) return; lastTermKey = key;
  const ul = $('#terms ul'); ul.innerHTML = '';
  const first = !seenTerms.size;
  list.forEach((id, i) => {
    const li = D.createElement('li'); li.style.setProperty('--i', i);
    const b = D.createElement('button'); b.className = 'chip' + (seenTerms.has(id) || first ? '' : ' new'); b.dataset.term = id; b.textContent = TERM_NAME(id);
    li.append(b); ul.append(li); seenTerms.add(id);
  });
}
function crumbs(lvl, t, reg) {
  const items = lvl === 'career' ? [['career', 'Career map']] : [['archive', 'All work']];
  if (t && lvl !== 'career' && lvl !== 'archive') items.push(['program', t === lib ? 'ARABART.EXE' : t.file]);
  if (reg && (lvl === 'bytes' || lvl === 'code')) items.push(['bytes', REG[reg.k][0]]);
  $('#crumbs').innerHTML = items.map(([g, n], i) => `<li><button data-go="${g}" ${i === items.length - 1 ? 'aria-current="page"' : ''} class="${i ? 'f' : ''}">${n}</button></li>`).join('');
}
function showSecs(list) { for (const [k, el] of Object.entries(secs)) { const i = list.indexOf(k); el.classList.toggle('on', i >= 0); el.style.order = i >= 0 ? i : 99; } }
function setDepth(d, move) {
  depth = d;
  for (const tab of $$('#s-exhibit [role=tab]')) { const on = tab.dataset.depth === d; tab.setAttribute('aria-selected', on); tab.tabIndex = on ? 0 : -1; $('#' + tab.getAttribute('aria-controls')).hidden = !on; }
  if (!move) return;
  if (d === 'glance') flyTo(fitView(tRect(lib)));
  if (d === 'story') flyTo(storyView(lib));
  if (d === 'code') goIns(lib, lib.code.find(c => c.a === 0x23));
}
function storyView(t) {
  const f = t.strings.find(x => /right/.test(x.t)) || t.strings[0], [, cy] = cellOf(t, f.a), fl = fitView(tRect(t)).s * 1.4;
  const I = inset(), half = (VH - I.t - I.b) / 2 / fl;
  return viewAt(t.x + t.w / 2, Math.min(cy, t.y + t.h + 4 - half * 0.8), fl);
}
function goIns(t, c, s = 48) {
  const [cx, cy] = cellOf(t, c.a); flyTo(viewAt(cx + c.n / 2, cy + 0.5, Math.max(s, cam.s >= 30 ? cam.s : s)));
  curIns = { t, c }; selected = { t, k: c.a };
}
function programHTML(t) {
  const p = t.p;
  const sentences = (p.description || '').match(/[^.!?]+[.!?]+/g) || [];
  const story = sentences.slice(0, 3).join(' ').trim();
  return `<p class="meta">${p.year} · ${p.language || ''} · ${t.file} · ${fmtN(t.size)} bytes</p>
<h2>${p.title}</h2>
<p class="glance">${p.subtitle || ''}</p>
${story ? `<p>${story}</p>` : ''}
${p.image ? `<figure><img src="../../images/${p.image}" alt="Screenshot of ${p.title} running" loading="lazy"><figcaption>${p.title}, running in DOS.</figcaption></figure>` : ''}
${insideHTML(t)}`;
}
function insideHTML(t) {
  const c = t.counts, total = t.size;
  const order = ['header', 'reloc', 'entry', 'literal', 'text', 'backref', 'control', 'unpacker', 'never'];
  const bar = order.filter(k => c[k]).map(k => `<i style="width:${(c[k] / total * 100).toFixed(3)}%;background:${css(k)}" title="${CL[k][0]}: ${fmtN(c[k])}"></i>`).join('');
  const pct = k => `${fmtN(c[k])} (${Math.round(c[k] / total * 100)}%)`;
  const frags = [...t.strings].sort((a, b) => b.n - a.n).slice(0, 6);
  return `<h3>Inside the file</h3>
<div class="bar" role="img" aria-label="Byte composition of ${t.file}">${bar}</div>
<dl class="facts"><dt>On disk</dt><dd>${fmtN(total)} bytes</dd><dt>Rebuilt in memory at start</dt><dd>${fmtN(t.out)} bytes</dd><dt>Stored as-is (literals)</dt><dd>${pct('literal')}</dd><dt>Back-references</dt><dd>${pct('backref')}</dd><dt>Control bits</dt><dd>${pct('control')}</dd></dl>
<h3>Regions</h3>
<ul class="regs">${t.regions.map((r, i) => `<li><button data-reg="${i}"><span class="sw" style="background:${css(r.k === 'packed' ? 'literal' : r.k)}"></span><span><b>${REG[r.k][0]}</b><small>${REG[r.k][1](t, r)}</small></span><span class="n">${fmtN(r.b - r.a)}</span></button></li>`).join('')}</ul>
${frags.length ? `<h3>Readable text in the bytes</h3><p class="note">A dot marks packer bytes that cut into the text.</p><ul class="frags">${frags.map(f => `<li><button data-frag="${f.a}">${f.t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/·/g, '<span class="gap">·</span>')}</button></li>`).join('')}</ul>` : ''}`;
}
let lastProg = null;
function inspHTML(m) {
  if (!m || m.k < 0) return '<p class="note">Point at a byte, or tap it, to read it.</p>';
  const t = m.t, k = m.k, b = BYTES[t.start + k], c = clsAt(t, k), ins = insAt(t, k);
  const ch = b >= 0x20 && b < 0x7f ? ` · ‘${String.fromCharCode(b).replace('<', '&lt;')}’` : '';
  return `<div class="big">${hex(b)}h <small>${b}${ch}</small></div>
<p><span class="sw" style="background:${css(c)}"></span> <b>${CL[c][0]}.</b> ${CL[c][2]}</p>
${ins ? `<p class="mono">${fmtIns(t, ins)}${t === lib && NOTE[ins.a] ? ` ; ${NOTE[ins.a]}` : ''}</p>` : ''}
<p class="meta">${t.file} · file offset ${hex(k, 5)} · paragraph ${hex(k >> 4, 4)}, byte ${k & 15}</p>`;
}
function updateUI(sp) {
  const near = focusTerr(), lvl = levelNow(sp, near), t = lvl === 'career' || lvl === 'archive' ? null : near;
  let reg = null;
  if (t && (lvl === 'bytes' || lvl === 'code')) { const [fx, fy] = focusPt(), [wx, wy] = toW(fx, fy), h = territoryAt(wx, wy); if (h && h.t === t && h.k >= 0) reg = regionOf(t, h.k); }
  // centre instruction at code level
  if (lvl === 'code' && t && !fly) {
    const [fx, fy] = focusPt(), [wx, wy] = toW(fx, fy), h = territoryAt(wx, wy);
    const c = h && h.k >= 0 ? insAt(h.t, h.k) : null;
    if (c && (!curIns || curIns.c !== c)) curIns = { t: h.t, c };
  } else if (lvl !== 'code' && !fly) curIns = null;
  const key = `${lvl}|${t?.id}|${reg?.k}`;
  if (key !== state.key) {
    state = { key, level: lvl, focus: t, reg };
    crumbs(lvl, t, reg);
    $$('#ladder button').forEach(b => b.toggleAttribute('aria-current', b.dataset.go === lvl));
    if (lvl === 'career') showSecs(['career']);
    else if (lvl === 'archive' || !t) showSecs(['archive']);
    else {
      if (t !== lib && t !== lastProg) { secs.program.innerHTML = programHTML(t); lastProg = t; }
    if (t === lib && !$('#ex-inside').firstChild) $('#ex-inside').innerHTML = insideHTML(lib);
      const main = t === lib ? 'exhibit' : 'program';
      showSecs(lvl === 'program' ? [main] : ['bytes', main]);
    }
    if (reg) { $('#b-h').textContent = REG[reg.k][0]; $('#b-reg').textContent = REG[reg.k][1](t, reg); }
    else if (t) { $('#b-h').textContent = t.p.title; $('#b-reg').textContent = 'Each square is one byte, shown in hexadecimal.'; }
    renderTerms(termsFor(lvl, t));
    $('#mini').style.opacity = lvl === 'career' ? 0 : 1;
    $('#live').textContent = `${{ career: 'Career map', archive: 'All work', program: 'Program', bytes: 'Bytes', code: 'Code' }[lvl]} level${t ? '. ' + t.p.title : ''}${reg ? ', ' + REG[reg.k][0] : ''}.`;
  }
  state.focus = t;
  if (t === lib) {
    const fl = fitView(tRect(lib)).s;
    const d = lvl === 'code' ? 'code' : cam.s < fl * 1.12 && lvl === 'program' ? 'glance' : 'story';
    if (d !== depth && !fly) setDepth(d, false);
  }
  const insKey = `${(hover || selected)?.t?.id}|${(hover || selected)?.k}|${curIns?.c?.a}`;
  if (insKey !== state.insKey) {
    state.insKey = insKey; $('#insp').innerHTML = inspHTML(hover?.k >= 0 ? hover : selected);
    $$('#listing button').forEach(b => b.toggleAttribute('aria-current', !!curIns && curIns.t === lib && +b.dataset.a + 0x20 <= curIns.c.a && curIns.c.a < +b.dataset.a + 0x20 + (b.dataset.a === '36' ? 3 : 1)));
  }
}

/* ---------- navigation ---------- */
function go(where) {
  const t = state.focus || lib;
  if (where === 'career') flyTo(fitView({ x: 0, y: 0, w: WORLD.x + WORLD.w, h: WORLD.y + WORLD.h }, 0.94));
  if (where === 'archive') flyTo(fitView(PLATE));
  if (where === 'program') flyTo(fitView(tRect(t)));
  if (where === 'bytes') {
    const [fx, fy] = focusPt(), [wx, wy] = toW(fx, fy), h = territoryAt(wx, wy);
    if (h && h.k >= 0) flyTo(viewAt(wx, wy, 22)); else { const r = t.regions.find(r => r.k === 'entry'); const [cx, cy] = cellOf(t, r.a); flyTo(viewAt(cx + 8, cy + 3, 22)); }
  }
  if (where === 'code') goIns(t, t === lib ? lib.code.find(c => c.a === 0x23) : t.code[0]);
}
D.addEventListener('click', e => {
  const g = e.target.closest('[data-go]'); if (g) { go(g.dataset.go); return; }
  const p = e.target.closest('.progs [data-id]'); if (p) { const t = T.find(x => x.id === p.dataset.id); flyTo(fitView(tRect(t))); if (phone()) sheet(false); return; }
  const r = e.target.closest('[data-reg]'); if (r && state.focus) { const t = state.focus, rg = t.regions[+r.dataset.reg];
    if (rg.b - rg.a < t.w * 4) { const [cx, cy] = cellOf(t, rg.a); flyTo(viewAt(cx + Math.min(10, (rg.b - rg.a) / 2), cy + 1, 24)); }
    else { const r0 = Math.floor(rg.a / t.w), r1 = Math.ceil(rg.b / t.w); flyTo(fitView({ x: t.x, y: t.y + r0, w: t.w, h: r1 - r0 }, 0.8)); } return; }
  const f = e.target.closest('[data-frag]'); if (f && state.focus) { const t = state.focus, a = +f.dataset.frag; const [cx, cy] = cellOf(t, a); selected = { t, k: a }; flyTo(viewAt(cx + 6, cy + 0.5, 28)); return; }
  const l = e.target.closest('#listing [data-a]'); if (l) { goIns(lib, lib.code.find(c => c.a === +l.dataset.a + 0x20)); return; }
  const tab = e.target.closest('#s-exhibit [role=tab]'); if (tab) { setDepth(tab.dataset.depth, true); return; }
});
$('#s-exhibit [role=tablist]').addEventListener('keydown', e => {
  const tabs = $$('#s-exhibit [role=tab]'), i = tabs.indexOf(D.activeElement);
  if (i < 0 || !['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
  const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length]; n.focus(); setDepth(n.dataset.depth, true);
});
$('#zin').onclick = () => zoomBy(2);
$('#zout').onclick = () => zoomBy(0.5);
$('#zfit').onclick = () => go('archive');
function sheet(o) { panel.classList.toggle('open', o); D.body.classList.toggle('sheet-open', o); $('#sheetToggle').setAttribute('aria-expanded', o); $('#sheetToggle').textContent = o ? 'Less' : 'More'; }
$('#sheetToggle').onclick = () => { const o = !panel.classList.contains('open'); sheet(o); };

/* legend + program index */
const lg = ['literal', 'text', 'backref', 'control', 'unpacker', 'entry', 'header', 'reloc', 'never'];
$('#legend').innerHTML = lg.map(k => `<li><span class="sw" style="background:${css(k)}"></span><span><b>${CL[k][0]}.</b> <span class="d">${CL[k][1]}</span></span><span class="n">${fmtN(J.totals[k])}</span></li>`).join('');
const byYear = [...T].sort((a, b) => (parseInt(a.p.year) - parseInt(b.p.year)) || a.i - b.i);
$('#progs').innerHTML = byYear.map(t => `<li><button data-id="${t.id}" class="${t === lib ? 'lib' : ''}"><span class="yr">${t === lib ? '1991+' : t.p.year}</span><span class="t">${t === lib ? 'ARABART' : t.p.title}</span><span class="sz">${fmtN(t.size)}</span></button></li>`).join('');

/* ---------- pointer input ---------- */
const pts = new Map();
let down = null, samples = [], pinch = null, lastTap = 0;
map.addEventListener('pointerdown', e => {
  map.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]);
  fly = null; zoomT = null; vel.x = vel.y = 0;
  if (pts.size === 1) { down = { x: e.clientX, y: e.clientY, t: performance.now(), moved: 0 }; drag = true; samples = [[e.clientX, e.clientY, performance.now()]]; map.classList.add('dragging'); }
  if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), c: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] }; down = null; }
});
map.addEventListener('pointermove', e => {
  if (!pts.has(e.pointerId)) { if (e.pointerType === 'mouse') hoverAt(e.clientX, e.clientY); return; }
  const prev = pts.get(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]);
  if (pts.size === 1) {
    const dx = e.clientX - prev[0], dy = e.clientY - prev[1];
    cam.x -= dx / cam.s; cam.y -= dy / cam.s;
    if (down) down.moved += Math.abs(dx) + Math.abs(dy);
    samples.push([e.clientX, e.clientY, performance.now()]); if (samples.length > 8) samples.shift();
  } else if (pts.size === 2 && pinch) {
    const [a, b] = [...pts.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]), c = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    cam.x -= (c[0] - pinch.c[0]) / cam.s; cam.y -= (c[1] - pinch.c[1]) / cam.s;
    zoomAt(c[0], c[1], cam.s * d / pinch.d); pinch = { d, c };
  }
  kick();
});
function endPointer(e) {
  if (!pts.has(e.pointerId)) return;
  pts.delete(e.pointerId);
  if (pts.size === 1) { pinch = null; const [p] = [...pts.values()]; samples = [[p[0], p[1], performance.now()]]; return; }
  if (pts.size) return;
  drag = null; map.classList.remove('dragging');
  const now = performance.now();
  if (down && down.moved < 7 && now - down.t < 400) {
    if (now - lastTap < 320) { zoomBy(2.4, e.clientX, e.clientY); lastTap = 0; }
    else { lastTap = now; tap(e.clientX, e.clientY); }
  } else if (!reduce && samples.length > 1) {
    const a = samples.find(s => now - s[2] < 90) || samples[0], b = samples[samples.length - 1], dt = (b[2] - a[2]) / 1000;
    if (dt > 0.005 && now - b[2] < 60) { vel.x = (b[0] - a[0]) / dt; vel.y = (b[1] - a[1]) / dt; const m = Math.hypot(vel.x, vel.y); if (m > 3500) { vel.x *= 3500 / m; vel.y *= 3500 / m; } }
  }
  down = null; kick();
}
map.addEventListener('pointerup', endPointer); map.addEventListener('pointercancel', endPointer);
map.addEventListener('wheel', e => {
  e.preventDefault();
  const m = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1;
  if (!e.ctrlKey && Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.2) { fly = null; cam.x += e.deltaX * m / cam.s; kick(); return; }
  zoomBy(Math.exp(-e.deltaY * m * (e.ctrlKey ? 0.011 : 0.0021)), e.clientX, e.clientY);
}, { passive: false });
function hoverAt(x, y) {
  const [wx, wy] = toW(x, y), h = territoryAt(wx, wy);
  const nh = h ? { t: h.t, k: h.k } : null;
  if ((nh?.t !== hover?.t) || (nh?.k !== hover?.k)) { hover = nh; map.style.cursor = h && state.level === 'archive' ? 'pointer' : ''; kick(); }
}
function tap(x, y) {
  const [wx, wy] = toW(x, y), h = territoryAt(wx, wy);
  if (!h) { selected = null; kick(); return; }
  const lvl = state.level;
  if (lvl === 'career' || lvl === 'archive') flyTo(fitView(tRect(h.t)));
  else if (lvl === 'program') flyTo(viewAt(wx, wy, 24));
  else { selected = h.k >= 0 ? { t: h.t, k: h.k } : null; if (lvl === 'code' && h.k >= 0) { const c = insAt(h.t, h.k); if (c) curIns = { t: h.t, c }; } kick(); }
}
map.addEventListener('pointerleave', () => { if (hover) { hover = null; kick(); } });

/* keyboard */
addEventListener('keydown', e => {
  if (e.metaKey || e.ctrlKey || e.altKey || e.target.closest('input,textarea,dialog')) return;
  const inMap = e.target === map || e.target === D.body;
  if (e.key === 'Escape') { if (pop.classList.contains('on')) { closePop(); return; } const up = { code: 'program', bytes: 'program', program: 'archive', archive: 'career' }[state.level]; if (up) go(up); return; }
  if (e.key === '+' || e.key === '=') { zoomBy(2); e.preventDefault(); }
  else if (e.key === '-' || e.key === '_') { zoomBy(0.5); e.preventDefault(); }
  else if (e.key === '0' || e.key === 'Home') go('archive');
  else if (inMap && e.key.startsWith('Arrow')) {
    e.preventDefault(); fly = null;
    const v = 1100; vel.x = e.key === 'ArrowLeft' ? v : e.key === 'ArrowRight' ? -v : 0; vel.y = e.key === 'ArrowUp' ? v : e.key === 'ArrowDown' ? -v : 0;
    if (reduce) { cam.x -= vel.x * 0.15 / cam.s; cam.y -= vel.y * 0.15 / cam.s; vel.x = vel.y = 0; }
    kick();
  }
});

/* minimap input */
const mini = $('#mini');
function miniGo(e) { const r = miniC.getBoundingClientRect(), m = miniC._map; if (!m) return; const px = (e.clientX - r.left) * miniC.width / r.width, py = (e.clientY - r.top) * miniC.height / r.height; Object.assign(cam, viewAt((px - m.ox) / m.k, (py - m.oy) / m.k, cam.s)); fly = null; vel.x = vel.y = 0; kick(); }
mini.addEventListener('pointerdown', e => { mini.setPointerCapture(e.pointerId); miniGo(e); });
mini.addEventListener('pointermove', e => { if (mini.hasPointerCapture(e.pointerId)) miniGo(e); });

/* ---------- glossary popover + dialog ---------- */
const pop = $('#pop'), glossary = $('#glossary');
let popFor = null, hoverTimer = 0, popHover = false;
function openPop(btn) {
  const id = btn.dataset.term, el = $('#g-' + id); if (!el) return;
  if (popFor) popFor.setAttribute('aria-expanded', 'false');
  popFor = btn; btn.setAttribute('aria-expanded', 'true');
  $('#pop-t').textContent = el.querySelector('dt').textContent; $('#pop-d').innerHTML = el.querySelector('dd').innerHTML;
  pop.dataset.term = id; pop.classList.add('on');
  const r = btn.getBoundingClientRect(), pw = pop.offsetWidth, ph = pop.offsetHeight;
  let x = clamp(r.left, 8, innerWidth - pw - 8), y = r.bottom + 8; if (y + ph > innerHeight - 8) y = r.top - ph - 8;
  pop.style.left = x + 'px'; pop.style.top = Math.max(8, y) + 'px';
}
function closePop() { popHover = false; pop.classList.remove('on'); if (popFor) popFor.setAttribute('aria-expanded', 'false'); popFor = null; }
D.addEventListener('click', e => {
  const tb = e.target.closest('[data-term]');
  if (tb && !tb.closest('#pop')) { e.stopPropagation(); clearTimeout(hoverTimer); if (popFor === tb && pop.classList.contains('on') && !popHover) closePop(); else { openPop(tb); popHover = false; } return; }
  if (e.target.closest('[data-open-glossary]')) { const id = pop.dataset.term; closePop(); glossary.showModal(); if (id && e.target.closest('#pop')) $('#g-' + id)?.scrollIntoView({ block: 'center' }); return; }
  if (e.target.closest('[data-close]')) { glossary.close(); return; }
  if (!e.target.closest('#pop')) closePop();
}, true);
for (const t of $$('.term')) t.setAttribute('aria-expanded', 'false');
D.addEventListener('pointerover', e => {
  if (e.pointerType !== 'mouse') return;
  if (e.target.closest('#pop')) { clearTimeout(hoverTimer); return; }
  const tb = e.target.closest('.term,.chip'); if (!tb) return;
  clearTimeout(hoverTimer); hoverTimer = setTimeout(() => { if (popFor !== tb || !pop.classList.contains('on')) { openPop(tb); popHover = true; } }, 260);
});
D.addEventListener('pointerout', e => {
  if (e.pointerType !== 'mouse' || !e.target.closest('.term,.chip,#pop')) return;
  clearTimeout(hoverTimer); if (popHover) hoverTimer = setTimeout(() => { if (popHover) closePop(); }, 350);
});
panel.addEventListener('scroll', closePop, { passive: true });
glossary.addEventListener('click', e => { if (e.target === glossary) glossary.close(); });

/* ---------- start ---------- */
addEventListener('resize', () => { resize(); kick(); });
D.addEventListener('visibilitychange', () => { if (D.hidden && raf) { cancelAnimationFrame(raf); raf = 0; } else if (!D.hidden) kick(); });
await Promise.race([Promise.all([D.fonts.load(`500 12px ${MONO}`), D.fonts.load(`640 13px ${SANS}`), D.fonts.load(`700 30px ${SANS}`)]), new Promise(r => setTimeout(r, 1500))]);
sizeCache.clear();
resize();
const start = fitView(PLATE);
const q = new URLSearchParams(location.search);
if (q.get('view')) {
  // deep links for review: ?view=career|archive|program|story|bytes|code[&t=id]
  const v = q.get('view'), t = T.find(x => x.id === q.get('t')) || lib;
  reveal = 2; labels.classList.add('ready');
  if (v === 'career') Object.assign(cam, fitView({ x: 0, y: 0, w: WORLD.x + WORLD.w, h: WORLD.y + WORLD.h }, 0.94));
  else if (v === 'program') Object.assign(cam, fitView(tRect(t)));
  else if (v === 'story') Object.assign(cam, storyView(t));
  else if (v === 'bytes') { const f = t.strings.find(x => /right/.test(x.t)) || t.strings[0]; const [cx, cy] = cellOf(t, f.a); Object.assign(cam, viewAt(cx + 10, cy + 0.5, 26)); selected = { t, k: f.a + 3 }; }
  else if (v === 'code') { const c = t === lib ? t.code.find(c => c.a === 0x27) : t.code[3]; const [cx, cy] = cellOf(t, c.a); Object.assign(cam, viewAt(cx + 1, cy + 0.5, 52)); curIns = { t, c }; selected = { t, k: c.a }; }
  else Object.assign(cam, start);
  if (q.get('pop')) setTimeout(() => openPop($(`.term[data-term="${q.get('pop')}"]`) || $('.chip')), 300);
  if (q.get('gloss')) glossary.showModal();
  if (q.get('sheet')) sheet(true);
} else {
  Object.assign(cam, reduce ? start : viewAt(W / 2, H / 2, start.s * 0.9));
  if (!reduce) { revealT0 = performance.now(); flyTo(start, 1500); } else labels.classList.add('ready');
}
kick();
window.__eb = { cam }; // read by the E2E script
