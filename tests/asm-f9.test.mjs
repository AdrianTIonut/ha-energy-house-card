// tests/asm-f9.test.mjs — P3/P4/P5 pe fișierul asamblat (energie-casa-card.js).
// Helper de montare ca în tests/asm-f6.test.mjs (stub DOM minim, El real pentru evenimente).
// (P4) atingere pe destinație în hub: click evidențiază, al doilea anulează, fără alocare → mesaj.
// (P5) consumatori sortați descrescător + sub 10 W opacitate redusă + nume esc();
//      bare simple PV/nominal în panourile Deye/Huawei (config *_rated_kw).

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
function idx(label, hay, needle) { return hay.indexOf(needle); }
function before(label, hay, a, b) {
  const i = hay.indexOf(a), j = hay.indexOf(b);
  if (i >= 0 && j >= 0 && i < j) passed++;
  else { failed++; console.log('FAIL', label, '=> ordinea e greșită', i, j); }
}

// --- stub minim de DOM (identic cu tests/asm-f6.test.mjs) ---
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
class BoxEl extends El {}
globalThis.HTMLElement = El;
globalThis.customElements = { define: () => {}, get: () => El };

const { EnergieCasaCard } = await import(asmPath.href);

// montare: containerul .consumers e un El real; separ, _flowBoxEl se setează manual
function mount(config, states) {
  const el = new EnergieCasaCard();
  el.connectedCallback();
  const cont = new BoxEl();
  el._cont = cont;
  el._root.querySelector = (sel) => (sel === '.consumers' ? cont : null);
  el.setConfig(config);
  el.hass = { states };
  return el;
}
const htmlOf = (el) => el._root.innerHTML || '';
const flowOf = (el) => (el._flowBoxEl ? el._flowBoxEl.innerHTML : '');

// stări cu 2 consumatori reali + senzor pentru inversoare (valori exemplu)
const STATES = {
  'sensor.solar_total_power':      { state: '600', attributes: { unit_of_measurement: 'W' } },
  'sensor.grid_import_power_w':    { state: '0',   attributes: { unit_of_measurement: 'W' } },
  'sensor.grid_export_power_w':    { state: '0',   attributes: { unit_of_measurement: 'W' } },
  'sensor.battery_charge_power':   { state: '0',   attributes: { unit_of_measurement: 'W' } },
  'sensor.battery_discharge_power':{ state: '0',   attributes: { unit_of_measurement: 'W' } },
  'sensor.solar_total_daily':      { state: '1.0', attributes: { unit_of_measurement: 'kWh' } },
  'sensor.import_retea_zilnic_local':  { state: '0', attributes: { unit_of_measurement: 'kWh' } },
  'sensor.export_retea_zilnic_local':  { state: '0', attributes: { unit_of_measurement: 'kWh' } },
  'sensor.piscina_total_power':    { state: '350', attributes: { unit_of_measurement: 'W' } },
  'sensor.siguranta_ac_server_power': { state: '8', attributes: { unit_of_measurement: 'W' } },
  'sensor.invertor_deye_pv_power': { state: '120', attributes: { unit_of_measurement: 'W' } },
};
const CONSUMERS = [
  { name: 'Server', icon: 'mdi:server', power: 'sensor.siguranta_ac_server_power', energy_today: null, group: 'Altele' },
  { name: 'Piscină', icon: 'mdi:water', power: 'sensor.piscina_total_power', energy_today: null, group: 'Altele' },
];

// helper: click simulat pe eticheta unei destinații (closest [data-flow-dst])
function clickDst(el, name, inLabel) {
  const target = inLabel
    ? { closest: (sel) => (sel === '[data-flow-dst]' ? { getAttribute: () => name } : null) }
    : { closest: () => null };
  el._onFlowClick({ target });
}

// ============================================================
// (P4) atingere pe destinația din hub
// ============================================================
{
  const el = mount({ style: 'cyber', consumers: CONSUMERS }, Object.assign({}, STATES));
  const box = new BoxEl();
  el._flowBoxEl = box;
  // destinație „Piscină” are alocare solar→Piscină > 0
  clickDst(el, 'Piscină', true);
  eq('p4: _flowSel = Piscină', el._flowSel, 'Piscină');
  const h1 = flowOf(el);
  includes('p4: fluxul este varianta compacta', h1, 'class="compact"');
  notIncludes('p4: fara vechea diagrama hub', h1, 'flow-detail');
  notIncludes('p4: fără NaN', h1, 'NaN');
  // al doilea click pe aceeași destinație → anulează
  clickDst(el, 'Piscină', true);
  eq('p4: _flowSel null după 2 clicks', el._flowSel, null);
  const h2 = flowOf(el);
  notIncludes('p4: anulat → fără flow-detail', h2, 'flow-detail');
  el._stopRefresh();
}

// (P4) click în afară anulează o selecție activă
{
  const el = mount({ style: 'cyber', consumers: CONSUMERS }, Object.assign({}, STATES));
  el._flowBoxEl = new BoxEl();
  clickDst(el, 'Piscină', true);
  eq('p4b: selectat', el._flowSel, 'Piscină');
  clickDst(el, null, false);   // click în afară
  eq('p4b: click în afară anulează', el._flowSel, null);
  notIncludes('p4b: fără detalii după anulare', flowOf(el), 'flow-detail');
  el._stopRefresh();
}

// (P4) destinație selectată FĂRĂ alocare > 0 → mesaj „fără alocare”
{
  const el = mount({ style: 'cyber', consumers: CONSUMERS }, Object.assign({}, STATES));
  el._flowBoxEl = new BoxEl();
  // „Rețea” (export) nu primește alocare de la sursă „rețea” (import→export e exclus)
  clickDst(el, 'Re\u021bea', true);
  includes('p4c: fluxul compact ramane afisat', flowOf(el), 'class="compact"');
  el._stopRefresh();
}

// ============================================================
// (P5) consumatori: sortare descrescător + sub 10 W opacitate redusă + nume esc()
// ============================================================
{
  const el = mount({ style: 'cyber', consumers: CONSUMERS }, Object.assign({}, STATES));
  const h = htmlOf(el);
  // Piscina (350 W) înaintea Server (8 W) în același grup
  before('p5: Piscina (350W) înaintea Server (8W)', h, '>Piscină</span>', '>Server</span>');
  // Server sub 10 W → rând cu opacitate redusă (clasa .c-dim)
  const srvIdx = h.indexOf('data-entity="sensor.siguranta_ac_server_power"');
  includes('p5: rând Server cu .c-dim', h.slice(srvIdx - 60, srvIdx + 60), 'c-dim');
  // nume prin esc() — testăm cu un nume care conține & <
  const el2 = mount({ style: 'cyber', consumers: [
    { name: 'A&B <X>', icon: 'mdi:x', power: 'sensor.piscina_total_power', energy_today: null },
  ] }, Object.assign({}, STATES));
  includes('p5: nume escapat', htmlOf(el2), 'A&amp;B &lt;X&gt;');
  el._stopRefresh(); el2._stopRefresh();
}

// ============================================================
// (P5) bare PV/nominal în panourile Deye/Huawei
// ============================================================
{
  // cu deye_rated_kw=2 (kW) și PV 120 W → bară la ~6%
  const el = mount({ style: 'cyber', deye_rated_kw: 2, huawei_rated_kw: 5 }, Object.assign({}, STATES));
  const h = htmlOf(el);
  includes('p5b: bară PV prezentă (bi-bar)', h, 'class="bi-bar"');
  includes('p5b: bară cu umplutură', h, 'bi-bar-fill');
  notIncludes('p5b: fără NaN', h, 'NaN');
  // fără config de nominal → fără bară
  const el2 = mount({ style: 'cyber' }, Object.assign({}, STATES));
  notIncludes('p5b: fără config → fără bară', htmlOf(el2), 'class="bi-bar"');
  el._stopRefresh(); el2._stopRefresh();
}

// (P5) senzor PV lipsă → „—”, fără bară (chiar și cu nominal în config)
{
  const st = Object.assign({}, STATES);
  delete st['sensor.invertor_deye_pv_power'];
  const el = mount({ style: 'cyber', deye_rated_kw: 2 }, st);
  const h = htmlOf(el);
  notIncludes('p5c: senzor lipsă → fără bară', h, 'class="bi-bar"');
  // panoul Deye tot afișează „—" pentru PV (prin _sensorPowerText)
  includes('p5c: PV „—" în panou', h, '>—</span>');
  el._stopRefresh();
}

console.log(`asm-f9.test.mjs: ${passed} OK, ${failed} FAIL`);
process.exit(failed > 0 ? 1 : 0);
