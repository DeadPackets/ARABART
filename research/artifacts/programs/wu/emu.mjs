// Section-by-section screenshots of one writeup page, plus console errors.
// usage: node shot.mjs <program-id> <prefix> <w> <h> [nojs]
// writes scratchpad/shots/<program-id>-<w>[-nojs]-<section>.png and, for Steps, -<section>-last.png
import { spawn } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
const S = '/private/tmp/claude-501/-Users-deadpackets-workspace-DOSArchive/bb845a97-0c40-416d-bb30-299debf3ecff/scratchpad';
const [pid, prefix, w, h, nojs] = process.argv.slice(2);
const port = 9300 + Math.floor(Math.random() * 500);
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  '--headless=new', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--hide-scrollbars',
  `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(S + '/cdp-')}`, `--window-size=${w},${h}`, 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let ws, id = 0; const pending = new Map(); const errors = [];
for (let i = 0; i < 50 && !ws; i++) {
  await sleep(200);
  try { const t = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); const p = t.find(x => x.type === 'page'); if (p) ws = new WebSocket(p.webSocketDebuggerUrl); } catch {}
}
await new Promise(r => ws.addEventListener('open', r));
ws.addEventListener('message', e => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); }
  if (m.method === 'Runtime.exceptionThrown') errors.push('exception: ' + m.params.exceptionDetails.exception?.description);
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push('console: ' + m.params.args.map(a => a.value ?? a.description).join(' '));
  if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') errors.push('log: ' + m.params.entry.text + ' ' + (m.params.entry.url || ''));
});
const cdp = (method, params = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const js = async expr => (await cdp('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }))?.result?.value;
const mobile = +w < 600;
await cdp('Emulation.setDeviceMetricsOverride', { width: +w, height: +h, deviceScaleFactor: 1, mobile });
await cdp('Runtime.enable'); await cdp('Log.enable'); await cdp('Page.enable');
if (nojs) await cdp('Emulation.setScriptExecutionDisabled', { value: true });
await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
await cdp('Page.navigate', { url: `http://localhost:4322/ARABART/program/${pid}/` });
await sleep(4000);
await sleep(16000);
const st = await js(`JSON.stringify({ state: document.querySelector('[data-player]')?.dataset.state, status: document.querySelector('[data-status]')?.textContent, canvas: !!document.querySelector('[data-emu] canvas') })`);
const b = await js(`JSON.stringify((() => { const e = document.querySelector('[data-screen]'); e.scrollIntoView(); const r = e.getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height }; })())`);
await sleep(1500);
const bb = JSON.parse(b);
const shot = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: bb.x, y: bb.y, width: bb.w, height: bb.h, scale: 1 } });
writeFileSync(`${S}/shots/${pid}-${w}-emulator.png`, Buffer.from(shot.data, 'base64'));
console.log(`${S}/shots/${pid}-${w}-emulator.png`, st, 'errors', JSON.stringify(errors));
ws.close(); chrome.kill(); process.exit(0);
