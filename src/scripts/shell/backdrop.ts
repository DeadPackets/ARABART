// The desktop behind the home page. Each era is a wallpaper drawn with that era's screen: 16 colors and big pixels in DOS,
// the 256-color Setup gradient in Windows 3.1, high color teal in Windows 95, smooth ClearType-era gradients in Visual Studio 2005.
// Where one era's section meets the next, a band sweeps up the screen in which the pixel size and the number of color levels slide
// from one era to the other: the screen gains colors and resolution as you scroll into his next job.
import { Renderer, Program, Mesh, Triangle } from 'ogl';

const vertex = /* glsl */ `#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position, 0., 1.); }`;

const fragment = /* glsl */ `#version 300 es
precision highp float;
uniform vec2 uRes; uniform float uTime; uniform float uDpr;
uniform float uA; uniform float uB; uniform float uY; uniform float uBand;
out vec4 o;
float h(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y); }
float b2(vec2 a) { a = floor(a); return fract(a.x / 2. + a.y * a.y * .75); }
float b8(vec2 a) { return b2(.25 * a) * .0625 + b2(.5 * a) * .25 + b2(a); }
vec3 wall(float e, vec2 fc) {
  vec2 uv = fc / uRes, q = fc / uRes.y;
  float t = uTime;
  if (e < .5) {
    float v = n(q * 1.6 + vec2(t * .021, -t * .013)) * .62 + n(q * 4.1 - vec2(t * .034, t * .017)) * .38;
    v *= .5 + .5 * smoothstep(1.2, .1, distance(q, vec2(uRes.x / uRes.y * .5, .5)));
    return vec3(0., 0., .2 + v * .62);
  }
  if (e < 1.5) return vec3(0., 0., mix(.04, .62, pow(uv.y, 1.2)));
  if (e < 2.5) return vec3(0., .44, .44) + (n(q * 2.5) - .5) * .035;
  return mix(vec3(.78, .84, .93), vec3(.95, .97, .99), smoothstep(0., 1., uv.y));
}
float pxOf(float e) { return e < .5 ? 4. : e < 1.5 ? 2. : 1.; }
float lvOf(float e) { return e < .5 ? 3. : e < 1.5 ? 5. : e < 2.5 ? 31. : 255.; }
void main() {
  float f = smoothstep(uY - uBand, uY + uBand, uRes.y - gl_FragCoord.y);
  float px = max(1., floor(mix(pxOf(uA), pxOf(uB), f) * uDpr + .5));
  vec2 cell = floor(gl_FragCoord.xy / px);
  vec2 fc = (cell + .5) * px;
  f = smoothstep(uY - uBand, uY + uBand, uRes.y - fc.y);
  vec3 c = mix(wall(uA, fc), wall(uB, fc), f);
  float L = exp(mix(log(lvOf(uA)), log(lvOf(uB)), f));
  c = floor(c * L + b8(cell)) / L;
  o = vec4(clamp(c, 0., 1.), 1.);
}`;

export function createBackdrop(canvas: HTMLCanvasElement, dpr: number) {
  const renderer = new Renderer({ canvas, dpr, alpha: false, antialias: false, depth: false, webgl: 2, powerPreference: 'low-power' });
  if (!renderer.isWebgl2) throw new Error('WebGL2 is not available');
  const gl = renderer.gl;
  const u = { uRes: { value: [1, 1] }, uTime: { value: 8 }, uDpr: { value: dpr }, uA: { value: 0 }, uB: { value: 0 }, uY: { value: 1e5 }, uBand: { value: 200 } };
  const mesh = new Mesh(gl, { geometry: new Triangle(gl), program: new Program(gl, { vertex, fragment, uniforms: u, depthTest: false, depthWrite: false }) });

  let queued = false, running = false, last = 0, t0 = performance.now();
  const draw = () => renderer.render({ scene: mesh });
  const redraw = () => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; draw(); }); } };
  // Only the DOS wallpaper drifts, at 30 frames a second; the rest are still and drawn only when the mix changes
  const loop = (now: number) => {
    if (!running) return;
    if (now - last > 32) { last = now; u.uTime.value = 8 + (now - t0) / 1000; draw(); }
    requestAnimationFrame(loop);
  };
  const animate = (on: boolean) => { if (on && !running) { running = true; requestAnimationFrame(loop); } else if (!on) running = false; };

  const size = () => {
    renderer.setSize(innerWidth, Math.max(innerHeight, document.documentElement.clientHeight));
    u.uRes.value = [gl.drawingBufferWidth, gl.drawingBufferHeight];
    u.uBand.value = innerHeight * 0.22 * dpr;
    draw();
  };
  size();
  addEventListener('resize', size);
  let visible = !document.hidden;
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; animate(visible && dosOn()); });
  const dosOn = () => u.uA.value === 0 || u.uB.value === 0;

  return {
    /** Era a above the line y (CSS px from the top of the screen), era b below it. Eras: 0 dos, 1 win31, 2 win9x, 3 vs2005. */
    set(a: number, b: number, y: number) {
      const Y = y * dpr;
      if (u.uA.value === a && u.uB.value === b && u.uY.value === Y) return;
      u.uA.value = a; u.uB.value = b; u.uY.value = Y;
      animate(visible && dosOn());
      redraw();
    },
  };
}
