// tests/asm-f7b.test.mjs — Faza 7, PAS 7B: opțiunea config `sections` pe fișierul asamblat.
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

// config de bază (CONSUMATOR real ca să existe blocul „consumers”)
const CFG = { style: 'cyber', tarif_lei_kwh: 1.30,
  consumers: [ { name: 'Test', icon: 'mdi:lightbulb', power: 'sensor.piscina_total_power', energy_today: 'sensor.solar_total_daily', group: 'Altele' } ] };

// marcere bloc -> sir unic in HTML (fara diacritice ambigue)
const MARK = {
  header: 'class="title',
  tiles: 'class="plates"',
  graph: 'class="graph-wrap"',
  flow: 'class="flow-wrap"',
  consumers: 'class="consumers"',
  battery: 'class="bi-title">Baterie',
  inverters: 'class="bi-wrap"',
  stats: 'class="azi"',
};
const ALL = Object.keys(MARK);

// (S1) FARA sections -> TOT, in ordinea originala (comportament neschimbat)
{
  const el = mount(Object.assign({}, CFG), { states: Object.assign({}, fakeHass.states) });
  const h = htmlOf(el);
  for (const k of ALL) idx('f7b tot: prezenta ' + k, h, MARK[k]);
  notIncludes('f7b tot: fara NaN', h, 'NaN');
  el._stopRefresh();
}

// (S2) fiecare bloc SIN Gur (o singura sectiune valida)
for (const k of ALL) {
  const el = mount(Object.assign({}, CFG, { sections: [k] }), { states: Object.assign({}, fakeHass.states) });
  const h = htmlOf(el);
  idx('f7b single: prezenta ' + k, h, MARK[k]);
  for (const j of ALL) { if (j === k) continue; notIncludes('f7b single: absenta ' + j, h, MARK[j]); }
  el._stopRefresh();
}

// (S3) DOUA blocuri in ordinea inversata (stats inainte de tiles) -> ordinea din lista
{
  const el = mount(Object.assign({}, CFG, { sections: ['stats', 'tiles'] }), { states: Object.assign({}, fakeHass.states) });
  const h = htmlOf(el);
  const iStats = h.indexOf(MARK.stats);
  const iTiles = h.indexOf(MARK.tiles);
  eq('f7b order: stats si tiles prezente', (iStats >= 0 && iTiles >= 0), true);
  eq('f7b order: stats INAINTE de tiles', iStats < iTiles, true);
  notIncludes('f7b order: fara header', h, MARK.header);
  notIncludes('f7b order: fara graph', h, MARK.graph);
  el._stopRefresh();
}

// (S3b) ordinea default (tiles inainte de stats) ca sa nu fie intamplare
{
  const el = mount(Object.assign({}, CFG, { sections: ['tiles', 'stats'] }), { states: Object.assign({}, fakeHass.states) });
  const h = htmlOf(el);
  const iTiles = h.indexOf(MARK.tiles);
  const iStats = h.indexOf(MARK.stats);
  eq('f7b order2: tiles INAINTE de stats', iTiles < iStats, true);
  el._stopRefresh();
}

// (S4) nume necunoscut -> ignorat, blocurile valide randate, UN singur avertisment in consolă
{
  const warns = [];
  const origWarn = console.warn;
  console.warn = (m) => { warns.push(String(m)); };
  const el = mount(Object.assign({}, CFG, { sections: ['tiles', 'nu-exista', 'stats'] }),
    { states: Object.assign({}, fakeHass.states) });
  const h = htmlOf(el);
  idx('f7b unk: tiles randata', h, MARK.tiles);
  idx('f7b unk: stats randata', h, MARK.stats);
  notIncludes('f7b unk: fara header', h, MARK.header);
  eq('f7b unk: UN singur console.warn', warns.filter((w) => w.indexOf('nu-exista') >= 0).length, 1);
  console.warn = origWarn;
  // re-randare -> avertismentul nu se mai duplica (emisa deja o data)
  warns.length = 0;
  el._render();
  eq('f7b unk: la re-randare 0 avertismente noi', warns.filter((w) => w.indexOf('nu-exista') >= 0).length, 0);
  console.warn = origWarn;
  el._stopRefresh();
}

// (S5) „graph” ABSENT din sections -> _fetchHistory() NU cere istoric (0 apeluri callWS)
{
  let wsCalls = 0;
  const hass = Object.assign({ states: Object.assign({}, fakeHass.states) }, {
    callWS: async () => { wsCalls++; return null; },
  });
  const el = mount(Object.assign({}, CFG, { sections: ['tiles', 'stats', 'consumers', 'flow'] }), hass);
  el._stopRefresh();
  eq('f7b nograph: _needsHistory() = false', el._needsHistory(), false);
  await el._fetchHistory();   // apel explicit pe care il controleaza garda
  await flush(6);
  eq('f7b nograph: 0 apeluri callWS', wsCalls, 0);
  el._stopRefresh();
}

// (S5b) control: „graph” PREZENT -> _fetchHistory() CER istoricul (1 apel callWS)
{
  let wsCalls = 0;
  const hass = Object.assign({ states: Object.assign({}, fakeHass.states) }, {
    callWS: async () => { wsCalls++; return null; },
  });
  const el = mount(Object.assign({}, CFG, { sections: ['graph', 'tiles'] }), hass);
  el._stopRefresh();
  eq('f7b graph: _needsHistory() = true', el._needsHistory(), true);
  await el._fetchHistory();
  await flush(6);
  eq('f7b graph: 1 apel callWS', wsCalls, 1);
  el._stopRefresh();
}

// (S6) chip-uri sisteme (mode:separate, 2 sisteme):
//      apar DOAR daca in lista e un bloc dependent (flow/battery/inverters)
const SYSF7B = [
  { id: 'deye', name: 'Deye', pv: 'sensor.invertor_deye_pv_power', pv_energy_today: 'sensor.invertor_deye_today_production', battery_soc: 'sensor.invertor_deye_battery' },
  { id: 'huawei', name: 'Huawei', pv: 'sensor.fsp_ne_159534803_current_active_power', pv_energy_today: 'sensor.fsp_ne_159534803_daily_energy' },
];
const hsep = { states: Object.assign({}, fakeHass.states, {
  'sensor.invertor_deye_pv_power': { state: '120', attributes: { unit_of_measurement: 'W' } },
  'sensor.fsp_ne_159534803_current_active_power': { state: '0.072', attributes: { unit_of_measurement: 'kW' } },
}) };
{
  // cu „flow” in lista -> chip-uri apar
  const el = mount(Object.assign({}, CFG, { mode: 'separate', systems: SYSF7B, sections: ['tiles', 'flow'] }), { states: Object.assign({}, hsep.states) });
  idx('f7b chips: cu flow apar chip-urile', htmlOf(el), 'class="sys-chips"');
  el._stopRefresh();
}
{
  // FARA bloc dependent (doar tiles+stats) -> chip-uri NU apar
  const el = mount(Object.assign({}, CFG, { mode: 'separate', systems: SYSF7B, sections: ['tiles', 'stats'] }), { states: Object.assign({}, hsep.states) });
  notIncludes('f7b chips: fara bloc dependent, fara chip-uri', htmlOf(el), 'class="sys-chips"');
  el._stopRefresh();
}
{
  // combined (nu separate) -> chip-uri NU apar nici daca e „flow”
  const el = mount(Object.assign({}, CFG, { mode: 'combined', systems: SYSF7B, sections: ['tiles', 'flow'] }), { states: Object.assign({}, hsep.states) });
  notIncludes('f7b chips: combined, fara chip-uri', htmlOf(el), 'class="sys-chips"');
  el._stopRefresh();
}

// (C1) PAS 7C: text >= 16 px in tot CSS-ul (parseaza <style> si respinge orice font-size < 16px)
{
  const el = mount(Object.assign({}, CFG), { states: Object.assign({}, fakeHass.states) });
  let css = cssOf(el);
  // excepție explicită, cerută de utilizator: cardurile compacte din coloană îngustă (≤ 400 px) au text mic
  css = css.replace(/\/\* compact-small:start[\s\S]*?compact-small:end \*\//, '');
  includes('f7c css: <style> extras', css, 'font-size');
  const sizes = [];
  const re = /font-size:\s*([0-9]+(?:\.[0-9]+)?)\s*px/g;
  let m;
  while ((m = re.exec(css)) !== null) sizes.push(parseFloat(m[1]));
  eq('f7c css: gaseste font-size-uri', sizes.length > 0, true);
  const bad = sizes.filter((s) => s < 16);
  eq('f7c css: NIMIC sub 16px', bad.length, 0);
  if (bad.length) console.log('f7c font-size sub 16px:', bad.join(', '));
  // butoane >= 48 px (inaltimi minime): .tab, .sys-chip, .consumer
  includes('f7c butoane: min-height 48px in CSS', css, 'min-height: 48px');
  el._stopRefresh();
}

// (G1) PAS 7B: getGridOptions -> { columns: 12, min_columns: 6, rows: 'auto' }
{
  const el = mount(Object.assign({}, CFG), { states: Object.assign({}, fakeHass.states) });
  const g = el.getGridOptions();
  eq('f7b grid: columns 12', g.columns, 12);
  eq('f7b grid: min_columns 6', g.min_columns, 6);
  eq('f7b grid: rows auto', g.rows, 'auto');
  el._stopRefresh();
}

console.log(`asm-f7b.test.mjs: ${passed} OK, ${failed} FAIL`);
process.exit(failed > 0 ? 1 : 0);
