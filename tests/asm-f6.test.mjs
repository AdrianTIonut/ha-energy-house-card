// tests/asm-f6.test.mjs — Faza 6 pe FIȘIERUL ASAMBLAT (energie-casa-card.js).
// PAS 1+2 (Baterie/Invertoare + diagrama de flux flow-svg) → smoke: flow-wrap, <svg, „estimat”, fără NaN.
// PAS 3 (mode: separate) → chip-uri „Toate · Deye · Huawei” (≥ 48 px, aria-pressed); alegerea
// filtrează diagrama/panourile. În combined, chip-urile NU apar.

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

// --- stub minim de DOM (identic cu tests/asm.test.mjs) ---
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
const { fakeHass, fakeConfig } = await import('./fake-hass.js');

// montare: tot ca în tests/asm.test.mjs (containerul .consumers e un El real pentru evenimente)
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

// sensibile la accent, pentru a nu depinde de encoding
const TOATE = 'Toate';
const ESTIMAT = 'estimat';

// ============================================================
// (A) PAS 1+2: diagrama de flux în card — flow-wrap, <svg, „estimat”, fără NaN
//     Fără chip-uri în combined (mode implicit).
// ============================================================
{
  const el = mount({ style: 'cyber', tarif_lei_kwh: 1.30 }, { states: Object.assign({}, fakeHass.states) });
  const h = htmlOf(el);
  includes('f6-a flow-wrap prezent', h, 'flow-wrap');
  includes('f6-a <svg prezent', h, '<svg');
  includes('f6-a „estimat” sub diagramă', h, ESTIMAT);
  notIncludes('f6-a fără NaN', h, 'NaN');
  notIncludes('f6-a combined → fără chip-uri sisteme', h, 'class="sys-chips"');
  notIncludes('f6-a combined → fără butoane .sys-chip', h, 'class="sys-chip"');
  el._stopRefresh();
}

// ============================================================
// (B) PAS 3: mode: separate — chip-uri „Toate · Deye · Huawei”, alegere, filtrare
// ============================================================
const SYS = [
  { id: 'deye', name: 'Deye',
    pv: 'sensor.invertor_deye_pv_power',
    pv_energy_today: 'sensor.invertor_deye_today_production',
    battery_soc: 'sensor.invertor_deye_battery' },
  { id: 'huawei', name: 'Huawei',
    pv: 'sensor.fsp_ne_159534803_current_active_power',
    pv_energy_today: 'sensor.fsp_ne_159534803_daily_energy' },
];
const CFG_SEP = { style: 'cyber', tarif_lei_kwh: 1.30, mode: 'separate', systems: SYS };
const hassSep = { states: Object.assign({}, fakeHass.states, {
  'sensor.invertor_deye_pv_power':           { state: '120',   attributes: { unit_of_measurement: 'W' } },
  'sensor.invertor_deye_today_production':   { state: '8.1',   attributes: { unit_of_measurement: 'kWh' } },
  'sensor.fsp_ne_159534803_current_active_power': { state: '0.072', attributes: { unit_of_measurement: 'kW' } },
  'sensor.fsp_ne_159534803_daily_energy':    { state: '7.7',   attributes: { unit_of_measurement: 'kWh' } },
  'sensor.gw2000a_solar_radiation':          { state: '540',   attributes: { unit_of_measurement: 'W/m\u00b2' } },
})};
const EXTRAS = [
  { name: 'Radiație solară', icon: 'mdi:sun-wireless', entity: 'sensor.gw2000a_solar_radiation' },
  { name: 'Producție azi Huawei', icon: 'mdi:solar-panel', entity: 'sensor.fsp_ne_159534803_daily_energy', system: 'huawei' },
];
// „Huawei azi” e un string unic: nu apare nicăieri în config/HTML fără un chip/panou/extras Huawei
const HW_AZI = '7,70 kWh';

// (B1) randare implicită (Deye, primul sistem): 3 chip-uri, aria-pressed corecte
{
  const el = mount(Object.assign({}, CFG_SEP, { extras: EXTRAS }), { states: Object.assign({}, hassSep.states) });
  const h = htmlOf(el);
  includes('f6-b chip container', h, 'class="sys-chips"');
  includes('f6-b chip Toate', h, TOATE);
  includes('f6-b chip Deye', h, 'Deye');
  includes('f6-b chip Huawei', h, 'Huawei');
  includes('f6-b aria-pressed pe buton', h, 'aria-pressed=');
  includes('f6-b Toate activ (implicit all) (true)', h, 'data-system="all" aria-pressed="true"');
  includes('f6-b Deye non-activ (false)', h, 'data-system="deye" aria-pressed="false"');
  includes('f6-b Huawei non-activ (false)', h, 'data-system="huawei" aria-pressed="false"');
  eq('f6-b 3 chip-uri', (h.match(/class="sys-chip"/g) || []).length, 3);
  // CSS: butoane ≥ 48 px
  includes('f6-b butoane ≥ 48 px', h, 'min-height: 48px');
  // Deye activ: diagrama pe Deye (solar Deye) + panou Deye; Huawei ascuns; extras Huawei ascuns
  includes('f6-b diag all: sursa solar', h, 'solar');
  includes('f6-b diag Deye: „estimat”', h, ESTIMAT);
  includes('f6-b panou Deye prezent (all)', h, '>Deye</div>');
  includes('f6-b panou Huawei prezent (all)', h, '>Huawei</div>');
  notIncludes('f6-b diag fără eticheta solar Huawei', h, 'Huawei \u2192');
  includes('f6-b extras Radiație (fără system) prezent', h, '540 W/m\u00b2');
  includes('f6-b extras Huawei prezent (all)', h, HW_AZI);
  notIncludes('f6-b fără NaN', h, 'NaN');
  el._stopRefresh();
}

// (B2) alegere: click pe chip-ul „Huawei” → re-randare, Huawei activ, Deye ascuns
{
  const el = mount(Object.assign({}, CFG_SEP, { extras: EXTRAS }), { states: Object.assign({}, hassSep.states) });
  // container real pentru .sys-chips ca să leg handlerul la randare
  el._sysCont = new ConsumersEl();
  el._root.querySelector = (sel) => (sel === '.consumers' ? el._cont
                              : sel === '.sys-chips' ? el._sysCont
                              : null);
  el._render(true);   // re-randare FORȚATĂ (altfel HTML identic = DOM neatins) cu querySelector actualizat → handlerul .sys-chips se leagă pe _sysCont
  const h1 = htmlOf(el);
  includes('f6-b2 înainte: Toate activ (all)', h1, 'data-system="all" aria-pressed="true"');
  // construim un element fals pentru click (getAttribute data-system, closest .sys-chip)
  const fakeBtn = {
    getAttribute: (a) => (a === 'data-system' ? 'huawei' : null),
    closest: (sel) => (sel === '.sys-chip' ? fakeBtn : null),
  };
  // simulez click pe „Huawei”
  { const fns = (el._sysCont._ls.click || []).slice(); for (const fn of fns) fn({ target: fakeBtn }); }
  const h2 = htmlOf(el);
  eq('f6-b2 după click: _system = huawei', el._system, 'huawei');
  includes('f6-b2 Huawei activ', h2, 'data-system="huawei" aria-pressed="true"');
  includes('f6-b2 Deye non-activ', h2, 'data-system="deye" aria-pressed="false"');
  includes('f6-b2 Toate non-activ', h2, 'data-system="all" aria-pressed="false"');
  // diagrama pe Huawei (solar Huawei), panou Huawei, Deye ascuns
  includes('f6-b2 panou Huawei prezent', h2, '>Huawei</div>');
  notIncludes('f6-b2 panou Deye ascuns', h2, '>Deye</div>');
  includes('f6-b2 diag Huawei: „estimat”', h2, ESTIMAT);
  includes('f6-b2 extras Huawei prezent', h2, HW_AZI);
  notIncludes('f6-b2 fără NaN', h2, 'NaN');
  // click pe „Toate” → combinat (panouri Deye + Huawei, diagrama totală)
  const allBtn = {
    getAttribute: (a) => (a === 'data-system' ? 'all' : null),
    closest: (sel) => (sel === '.sys-chip' ? allBtn : null),
  };
  { const fns = (el._sysCont._ls.click || []).slice(); for (const fn of fns) fn({ target: allBtn }); }
  const h3 = htmlOf(el);
  eq('f6-b3 după click Toate: _system = all', el._system, 'all');
  includes('f6-b3 Toate activ', h3, 'data-system="all" aria-pressed="true"');
  includes('f6-b3 panou Deye (all)', h3, '>Deye</div>');
  includes('f6-b3 panou Huawei (all)', h3, '>Huawei</div>');
  includes('f6-b3 extras Huawei (all)', h3, HW_AZI);
  notIncludes('f6-b3 fără NaN', h3, 'NaN');
  el._stopRefresh();
}

// (B4) un singur sistem în listă (mode: separate) → FĂRĂ chip-uri
{
  const one = { style: 'cyber', tarif_lei_kwh: 1.30, mode: 'separate',
    systems: [SYS[1]] };
  const el = mount(one, { states: Object.assign({}, hassSep.states) });
  const h = htmlOf(el);
  notIncludes('f6-b4 1 sistem → fără container chip', h, 'class="sys-chips"');
  notIncludes('f6-b4 1 sistem → fără buton .sys-chip', h, 'class="sys-chip"');
  eq('f6-b4 _system implicit all', el._system, 'all');
  notIncludes('f6-b4 fără NaN', h, 'NaN');
  el._stopRefresh();
}

// (B5) combined cu systems în config → tot fără chip-uri (doar separate le arată)
{
  const el = mount({ style: 'cyber', tarif_lei_kwh: 1.30, mode: 'combined', systems: SYS },
    { states: Object.assign({}, hassSep.states) });
  const h = htmlOf(el);
  notIncludes('f6-b5 combined → fără chip-uri', h, 'class="sys-chips"');
  notIncludes('f6-b5 combined → fără buton .sys-chip', h, 'class="sys-chip"');
  includes('f6-b5 combined panou Deye', h, '>Deye<');
  includes('f6-b5 combined panou Huawei', h, '>Huawei<');
  notIncludes('f6-b5 fără NaN', h, 'NaN');
  el._stopRefresh();
}

console.log(`asm-f6.test.mjs: ${passed} OK, ${failed} FAIL`);
process.exit(failed > 0 ? 1 : 0);
