// tests/asm-f7.test.mjs — Faza 7 (finisare) pe FIȘIERUL ASAMBLAT (energie-casa-card.js).
// PAS 7A: 3 defecte — implicit „all"; Deye → diagrama completă; setConfig re-pornește istoricul.
// PAS 7B: opțiunea `sections`.  PAS 7C: text ≥ 16 px peste tot.

import { existsSync } from 'node:fs';

const asmPath = new URL('../energie-casa-card.js', import.meta.url);
if (!existsSync(asmPath)) {
  console.error('Lipsește fișierul asamblat — rulează: node build.js');
  process.exit(2);
}

let passed = 0, failed = 0;
function includes(label, hay, needle) {
  if (hay.includes(needle)) passed++;
  else { failed++; console.log('FAIL', label, '=> NU conține', JSON.stringify(needle)); }
}
function notIncludes(label, hay, needle) {
  if (!hay.includes(needle)) passed++;
  else { failed++; console.log('FAIL', label, '=> CONȚINE (nu ar fi trebui)', JSON.stringify(needle)); }
}
function eq(label, got, want) {
  if (got === want) passed++;
  else { failed++; console.log('FAIL', label, '=> got', JSON.stringify(got), 'want', JSON.stringify(want)); }
}

// --- stub minim de DOM (identic cu tests/asm.test.mjs / asm-f6.test.mjs) ---
if (typeof globalThis.CustomEvent === 'undefined') {
  globalThis.CustomEvent = class CustomEvent {
    constructor(type, opts) { this.type = type; this.detail = (opts && opts.detail) || {}; }
  };
}
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
function flush(n = 4) {
  let p = Promise.resolve();
  for (let i = 0; i < n; i++) p = p.then(() => {});
  return p;
}
// răspuns istoric minim, valid (forma cerută de Faza 5) → parseHistory → „ready"
function rawHist() {
  const t = 1794000000;
  return {
    'sensor.solar_total_power': [{ s: '500', lu: t }, { s: '900', lu: t + 300 }],
    'sensor.grid_import_power_w': [{ s: '10', lu: t }],
    'sensor.grid_export_power_w': [{ s: '0', lu: t }],
    'sensor.battery_charge_power': [{ s: '0', lu: t }],
    'sensor.battery_discharge_power': [{ s: '50', lu: t }],
    'sensor.invertor_deye_battery': [{ s: '31', lu: t }],
  };
}

// ============================================================
// PAS 7A — defect 1: implicitul e „all" (Toate), nu primul sistem
// ============================================================
const SYSF7 = [
  { id: 'deye', name: 'Deye',
    pv: 'sensor.invertor_deye_pv_power',
    pv_energy_today: 'sensor.invertor_deye_today_production',
    battery_soc: 'sensor.invertor_deye_battery' },
  { id: 'huawei', name: 'Huawei',
    pv: 'sensor.fsp_ne_159534803_current_active_power',
    pv_energy_today: 'sensor.fsp_ne_159534803_daily_energy' },
];
{
  const el = mount({ style: 'cyber', tarif_lei_kwh: 1.30, mode: 'separate', systems: SYSF7 },
    { states: Object.assign({}, fakeHass.states) });
  eq('7A implicit all (fără default_system)', el._system, 'all');
  el._stopRefresh();
}
{
  // default_system valid → se respectă
  const el = mount({ style: 'cyber', tarif_lei_kwh: 1.30, mode: 'separate',
    systems: SYSF7, default_system: 'deye' }, { states: Object.assign({}, fakeHass.states) });
  eq('7A default_system deye respectat', el._system, 'deye');
  el._stopRefresh();
}
{
  // default_system invalid → rămâne „all"
  const el = mount({ style: 'cyber', tarif_lei_kwh: 1.30, mode: 'separate',
    systems: SYSF7, default_system: 'nu-există' }, { states: Object.assign({}, fakeHass.states) });
  eq('7A default_system invalid → all', el._system, 'all');
  el._stopRefresh();
}

// ============================================================
// PAS 7A — defect 2: Deye (are baterie) → diagrama COMPLETĂ
//            Casă = consumul total (1,18 kW), nu doar PV-ul (192 W)
// ============================================================
{
  const h = Object.assign({}, fakeHass.states, {
    // PV-ul sistemului Deye = 192 W (ca să se vadă diferența față de consumul total)
    'sensor.invertor_deye_pv_power': { state: '192', attributes: { unit_of_measurement: 'W' } },
  });
  const el = mount({ style: 'cyber', tarif_lei_kwh: 1.30, mode: 'separate', systems: SYSF7 },
    { states: h });
  el._system = 'deye';
  el._render();
  const full = htmlOf(el);
  // extrag doar zona de flux (flow-wrap → următorul bloc)
  const i = full.indexOf('class="flow-wrap"');
  let e = full.indexOf('class="consumers"', i);
  const e2 = full.indexOf('class="bi-wrap"', i);
  if (e2 > 0 && (e < 0 || e2 < e)) e = e2;
  if (e < 0) e = i + 4000;
  const flowSec = full.slice(i, e);
  includes('7A deye flux conține „Casă"', flowSec, 'Cas\u0103');
  includes('7A deye Casă = consum total (kW)', flowSec, 'kW');
  includes('7A deye banda baterie 983 W (diagramă completă)', flowSec, '983 W');
  notIncludes('7A deye nu „fără flux"', flowSec, 'f\u0103r\u0103 flux');
  notIncludes('7A deye fără NaN', flowSec, 'NaN');
  el._stopRefresh();
}
{
  // control: Huawei (fără baterie) → doar PV-ul lui, nu consumul total 1,18 kW
  const h = Object.assign({}, fakeHass.states, {
    'sensor.fsp_ne_159534803_current_active_power': { state: '0.072', attributes: { unit_of_measurement: 'kW' } },
  });
  const el = mount({ style: 'cyber', tarif_lei_kwh: 1.30, mode: 'separate', systems: SYSF7 }, { states: h });
  el._system = 'huawei';
  el._render();
  const full = htmlOf(el);
  const i = full.indexOf('class="flow-wrap"');
  let e = full.indexOf('class="bi-wrap"', i);
  if (e < 0) e = i + 4000;
  const flowSec = full.slice(i, e);
  includes('7A huawei flux propriu conține „Casă"', flowSec, 'Cas\u0103');
  notIncludes('7A huawei fără baterie (983 W)', flowSec, '983 W');
  notIncludes('7A huawei nu consumul total (kW)', flowSec, 'kW');
  notIncludes('7A huawei fără NaN', flowSec, 'NaN');
  el._stopRefresh();
}

// ============================================================
// PAS 7A — defect 3: setConfig re-pornește istoricul
//            (resetează _graphTried + _fetchHistory) → nu rămâne „se încarcă…”
// ============================================================
{
  const el = mount({ style: 'cyber', tarif_lei_kwh: 1.30 }, { states: Object.assign({}, fakeHass.states) });
  let calls = 0;
  el._historyProvider = async () => { calls++; return rawHist(); };
  el._stopRefresh();          // fără tick periodic, ca să numărăm doar fetch-urile explicite
  // 1) primul fetch (explicit) → „ready"
  await el._fetchHistory();
  await flush();
  eq('7A3 state după primul fetch = ready', el._graphState, 'ready');
  const before = calls;
  // 2) schimb config-ul → setConfig trebuie să re-pornească istoricul (fetch nou)
  el.setConfig({ style: 'cyber', tarif_lei_kwh: 1.30 });
  await flush();
  // efectul observabil: un fetch nou a avut loc (graficul nu rămâne blocat pe „se încarcă…”)
  eq('7A3 setConfig re-apelează istoricul', calls, before + 1);
  eq('7A3 după setConfig, din nou ready', el._graphState, 'ready');
  notIncludes('7A3 nu „se încarcă…” după setConfig', htmlOf(el), 'se \u00eencarc\u0103');
  el._stopRefresh();
}

console.log(`asm-f7.test.mjs: ${passed} OK, ${failed} FAIL`);
process.exit(failed > 0 ? 1 : 0);
