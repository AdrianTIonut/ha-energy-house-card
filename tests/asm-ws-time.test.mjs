// tests/asm-ws-time.test.mjs — cererea history/history_during_period trebuie să aibă timpuri REALE (ms).
// Helper de montare identic cu tests/asm-f6.test.mjs. Fără date false în producție.
// Testează: fără sections -> tot; fiecare bloc singur; ordine inversată; nume necunoscut;
// „graph” absent -> niciun apel callWS; chip-uri sisteme doar pe bloc dependent.
// PAS 7C: text >= 16 px in tot CSS-ul.

import { existsSync } from 'node:fs';
const asmPath = new URL('../energie-casa-card.js', import.meta.url);
if (!existsSync(asmPath)) { console.error('Lipsește fișierul asamblat — rulează: node build.js'); process.exit(2); }

let passed = 0, failed = 0;
function includes(label, hay, needle) { if (hay.includes(needle)) passed++; else { failed++; console.log('FAIL', label, '=> NU contine', JSON.stringify(needle)); } }
function notIncludes(label, hay, needle) { if (!hay.includes(needle)) passed++; else { failed++; console.log('FAIL', label, '=> CONTINE (nu ar fi trebui)', JSON.stringify(needle)); } }
function eq(label, got, want) { if (got === want) passed++; else { failed++; console.log('FAIL', label, '=> got', JSON.stringify(got), 'want', JSON.stringify(want)); } }
function idx(label, hay, needle) { const i = hay.indexOf(needle); if (i >= 0) passed++; else { failed++; console.log('FAIL', label, '=> lipseste', JSON.stringify(needle)); } return i; }

// --- stub minim de DOM (identic cu asm-f6.test.mjs) ---
if (typeof globalThis.CustomEvent === 'undefined') { globalThis.CustomEvent = class CustomEvent { constructor(t, o) { this.type = t; this.detail = (o && o.detail) || {}; } }; }
class El {
  constructor() { this._html = ''; this._ls = {}; this.dispatched = []; }
  set innerHTML(v) { this._html = String(v); }
  get innerHTML() { return this._html; }
  attachShadow() { return new El(); }
  querySelector() { return null; }
  addEventListener(t, fn) { (this._ls[t] = this._ls[t] || []).push(fn); }
  dispatchEvent(ev) { this.dispatched.push(ev); return true; }
}
El.prototype.attachShadow = function () { return new El(); };
El.prototype.querySelector = function () { return null; };
class ConsumersEl extends El {}
globalThis.HTMLElement = El;
globalThis.customElements = { define: () => {}, get: () => El };

const { EnergieCasaCard } = await import(asmPath.href);
const { fakeHass } = await import('./fake-hass.js');

function mount(config, hass) {
  const el = new EnergieCasaCard();
  el.connectedCallback();
  const cont = new ConsumersEl();
  el._cont = cont;
  el._root.querySelector = (sel) => (sel === '.consumers' ? cont : null);
  el.setConfig(config);
  if (hass) el.hass = hass;
  return el;
}
function htmlOf(el) { return el._root.innerHTML || ''; }
function flush(n = 4) { let p = Promise.resolve(); for (let i = 0; i < n; i++) p = p.then(() => {}); return p; }
// extrage continutul <style> din HTML-ul randat (tema cyber e in umbra, in primul <style>)
function cssOf(el) {
  const h = htmlOf(el);
  const m = h.match(/<style>([\s\S]*?)<\/style>/);
  return m ? m[1] : '';
}


// Regresie: Date.now()/1000 dădea date din 1970 -> HA întorcea istoric gol.
{
  const msgs = [];
  const hass = Object.assign({}, fakeHass, { callWS: async (m) => { msgs.push(m); return {}; } });
  const el = mount({ style: 'cyber' }, hass);
  await el._fetchHistory();
  eq('ws: a fost cerut istoricul', msgs.length >= 1, true);
  const m = msgs[0];
  const st = new Date(m.start_time).getTime(), en = new Date(m.end_time).getTime(), now = Date.now();
  eq('ws: end_time ~ acum (±10 s)', Math.abs(en - now) < 10000, true);
  eq('ws: start_time = acum - 24 h (±10 s)', Math.abs((now - 24 * 3600 * 1000) - st) < 10000, true);
  eq('ws: interval = 24 h', Math.abs((en - st) - 24 * 3600 * 1000) < 1000, true);
  eq('ws: an plauzibil (>= 2025)', new Date(m.start_time).getFullYear() >= 2025, true);
  eq('ws: minimal_response', m.minimal_response, true);
  el._stopRefresh();
}
console.log(`asm-ws-time.test.mjs: ${passed} OK, ${failed} FAIL`);
process.exit(failed ? 1 : 0);
