// docs/demo/capture.mjs — generates the screenshots in docs/img from the fake-data demo (docs/demo/index.html) with headless Chrome.
// Usage: node build.js && node docs/demo/capture.mjs        (set CHROME=/path/to/chrome if it is not found)
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { crc32 } from 'node:zlib';
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url)), root = join(here, '..', '..'), out = join(here, '..', 'img');
mkdirSync(out, { recursive: true });
const CANDIDATES = [process.env.CHROME, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', '/usr/bin/google-chrome', '/usr/bin/chromium', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].filter(Boolean);
const chrome = CANDIDATES.find((p) => existsSync(p));
if (!chrome) throw new Error('Chrome not found: set CHROME=/path/to/chrome');

// the card is an ES module, which Chrome will not load from file://: serve the repo over http for the capture
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json' };
const server = createServer((req, res) => {
  const p = join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(root) || !existsSync(p)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': MIME[extname(p)] || 'application/octet-stream' }); res.end(readFileSync(p));
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/docs/demo/index.html`;

const PORT = 9333 + Math.floor(Math.random() * 500), profile = join(here, '.chrome-profile-' + PORT);
const proc = spawn(chrome, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function connect() {
  for (let i = 0; i < 60; i++) {
    try { const page = (await (await fetch(`http://127.0.0.1:${PORT}/json`)).json()).find((t) => t.type === 'page'); if (page) return new WebSocket(page.webSocketDebuggerUrl); } catch (e) { /* not ready */ }
    await sleep(250);
  }
  throw new Error('Chrome did not start');
}
const ws = await connect();
await new Promise((r) => ws.addEventListener('open', r));
let id = 0; const pending = new Map();
ws.addEventListener('message', (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } });
const send = (method, params = {}) => new Promise((res, rej) => { const n = ++id; pending.set(n, (d) => (d.error ? rej(new Error(method + ': ' + d.error.message)) : res(d.result))); ws.send(JSON.stringify({ id: n, method, params })); });
const evalJs = async (e) => (await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true })).result.value;

async function shot(file, query, width) {
  await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 2, mobile: false });
  await send('Page.navigate', { url: base + '?' + query });
  for (let i = 0; i < 60; i++) { if ((await evalJs('document.title')) === 'ready') break; await sleep(150); }
  await sleep(1200);
  const h = Math.ceil(await evalJs('document.body.scrollHeight'));
  await send('Emulation.setDeviceMetricsOverride', { width, height: h, deviceScaleFactor: 2, mobile: false });
  await sleep(300);
  writeFileSync(join(out, file), Buffer.from((await send('Page.captureScreenshot', { format: 'png' })).data, 'base64'));
  console.log('✔', file, width + '×' + h);
}

// ---- animated PNG (APNG): the real CSS animations (glow, dots and arrows running along the flow) stepped frame by frame through the Web Animations API ----
const u32 = (n) => { const b = Buffer.alloc(4); b.writeUInt32BE(n >>> 0); return b; };
const u16 = (n) => { const b = Buffer.alloc(2); b.writeUInt16BE(n); return b; };
const chunk = (type, data) => { const t = Buffer.from(type, 'latin1'); return Buffer.concat([u32(data.length), t, data, u32(crc32(Buffer.concat([t, data])))]); };
function buildApng(pngs, delayMs) {
  const parse = (png) => { const o = []; let p = 8; while (p < png.length) { const len = png.readUInt32BE(p), type = png.toString('latin1', p + 4, p + 8); o.push({ type, data: png.subarray(p + 8, p + 8 + len) }); p += 12 + len; } return o; };
  const frames = pngs.map(parse), ihdr = frames[0].find((c) => c.type === 'IHDR').data, w = ihdr.readUInt32BE(0), h = ihdr.readUInt32BE(4);
  const o = [Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('acTL', Buffer.concat([u32(pngs.length), u32(0)]))];
  let seq = 0;
  const fctl = () => chunk('fcTL', Buffer.concat([u32(seq++), u32(w), u32(h), u32(0), u32(0), u16(delayMs), u16(1000), Buffer.from([0, 0])]));
  frames.forEach((f, i) => { o.push(fctl()); for (const c of f.filter((x) => x.type === 'IDAT')) o.push(i === 0 ? chunk('IDAT', c.data) : chunk('fdAT', Buffer.concat([u32(seq++), c.data]))); });
  o.push(chunk('IEND', Buffer.alloc(0)));
  return Buffer.concat(o);
}
const allAnims = `(() => { const out = []; const walk = (root) => { out.push(...root.getAnimations()); root.querySelectorAll('*').forEach((e) => { if (e.shadowRoot) walk(e.shadowRoot); }); }; walk(document); return out; })()`;
async function recordApng(file, query, width, seconds, fps) {
  await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: base + '?' + query });
  for (let i = 0; i < 60; i++) { if ((await evalJs('document.title')) === 'ready') break; await sleep(150); }
  await sleep(1500);
  const h = Math.ceil(await evalJs('document.body.scrollHeight'));
  await send('Emulation.setDeviceMetricsOverride', { width, height: h, deviceScaleFactor: 1, mobile: false });
  await sleep(300);
  const count = await evalJs(allAnims + '.length'), frames = [], n = Math.round(seconds * fps);
  for (let i = 0; i < n; i++) {
    await evalJs(`${allAnims}.forEach((a) => { a.pause(); a.currentTime = ${Math.round((i * 1000) / fps)}; })`);
    await sleep(40);
    frames.push(Buffer.from((await send('Page.captureScreenshot', { format: 'png' })).data, 'base64'));
  }
  const apng = buildApng(frames, Math.round(1000 / fps));
  writeFileSync(join(out, file), apng);
  console.log('✔', file, `${count} animations, ${n} frames, ${(apng.length / 1024).toFixed(0)} KB`);
}
await send('Page.enable');
for (const [s, w] of [['full', 512], ['compact', 392], ['header', 512], ['battery', 512], ['consumers', 512]]) await shot(s + '.png', `scene=${s}&lang=en&w=${w - 32}`, w);
await shot('compact-ro.png', 'scene=compact&lang=ro&w=360', 392);
await recordApng('compact-animated.png', 'scene=compact&lang=en&w=360', 392, 2.8, 10);
await send('Browser.close').catch(() => {});
proc.kill(); server.close();
await sleep(500);
try { rmSync(profile, { recursive: true, force: true }); } catch (e) { /* ignore */ }
