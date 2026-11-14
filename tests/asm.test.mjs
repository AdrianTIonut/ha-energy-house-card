// tests/asm.test.mjs — smoke test pe FIȘIERUL ASAMBLAT (energie-casa-card.js).
// Faza 4: Consumatori (grupare, senzor lipsă → „—", kW → W, escaping, avertisment ⚠ persistent,
//          tabindex + Enter/Space) + Faza 3 (export_zilnic unknown → „—", Rețea ț, încarcă, produce/oprit).
import { existsSync } from 'node:fs';

const asmPath = new URL('../energie-casa-card.js', import.meta.url);
if (!existsSync(asmPath)) { console.error('Lipsește fișierul asamblat — rulează: node build.js'); process.exit(2); }

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
function isNum(label, v) {
  if (typeof v === 'number') passed++;
  else { failed++; console.log('FAIL', label, '=> nu e număr:', typeof v, JSON.stringify(v)); }
}

// --- stub minim de DOM ---
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
  querySelector() { return null; }                       // randarea nu are nevoie
  addEventListener(t, fn) { (this._ls[t] = this._ls[t] || []).push(fn); }
  dispatchEvent(ev) { this.dispatched.push(ev); return true; }   // captăm evenimente
}
El.prototype.attachShadow = function () { return new El(); };
El.prototype.querySelector = function () { return null; };
// containerul .consumers: El cu listeneri reali (pentru testul click/keydown)
class ConsumersEl extends El {}
globalThis.HTMLElement = El;
globalThis.customElements = { define: () => {}, get: () => El };

const { EnergieCasaCard } = await import(asmPath.href);
const { fakeHass, fakeConfig, expect } = await import('./fake-hass.js');

// mount cu un container .consumers REAL (ca să testăm delegația de evenimente)
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
function textOf(el) {
  let h = (el._root.innerHTML || '').replace(/<style>[\s\S]*?<\/style>/g, ' ');
  return h.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
}
function htmlOf(el) { return el._root.innerHTML || ''; }
function cssOf(el) { return el._root.innerHTML || ''; }

// --- Faza 3 (randare normală) ---
const el = mount(fakeConfig, fakeHass);
const text = textOf(el);
includes('asm solar', text, '+192 W');
includes('asm houseW', text, expect.houseW);
includes('asm houseKwh', text, expect.houseKwh);
includes('asm economie', text, expect.economie);
includes('asm soc', text, expect.soc);
includes('asm solar produce', text, 'produce');
notIncludes('asm no produță', text, 'produ\u021b\u0103');
notIncludes('asm no încearcă', text, '\u00eencearc\u0103');
includes('asm rețea ț', cssOf(el), 'Re\u021bea');
notIncludes('asm no reșea', cssOf(el), 'Re\u0219ea');
includes('asm .stat-k block', cssOf(el), '.stat-k { display: block;');
includes('asm .stat-v block', cssOf(el), '.stat-v { display: block;');
isNum('asm getCardSize number', el.getCardSize());
eq('asm getCardSize value', el.getCardSize(), 30);
eq('asm getGridOptions columns', el.getGridOptions().columns, 12);
eq('asm getGridOptions min_columns', el.getGridOptions().min_columns, 6);
eq('asm getGridOptions rows', el.getGridOptions().rows, 'auto');

// --- Faza 4: Consumatori ---
const cfg4 = {
  style: 'cyber',
  tarif_entity: 'input_number.tarif_energie',
  consumers: [
    { name: 'Piscină', icon: 'mdi:pool', group: 'Altele',
      power: 'sensor.piscina_total_power', energy_today: 'sensor.piscina_energy' },
    { name: 'Hală', icon: 'mdi:warehouse', group: 'Hală',
      power: 'sensor.hala_total_power_kW', energy_today: null },
    { name: 'Server', icon: 'mdi:server', group: 'Casă',
      power: 'sensor.server_power_missing', energy_today: null },
    { name: 'Rețea', icon: 'mdi:transmission-tower', group: 'Altele',
      power: 'sensor.retea_consumer', energy_today: null },
  ],
};
const hass4 = { states: Object.assign({}, fakeHass.states, {
  'sensor.piscina_total_power': { state: '350', attributes: { unit_of_measurement: 'W' } },
  'sensor.piscina_energy': { state: '2.5', attributes: { unit_of_measurement: 'kWh' } },
  'sensor.hala_total_power_kW': { state: '1.5', attributes: { unit_of_measurement: 'kW' } },
  'sensor.retea_consumer': { state: '500', attributes: { unit_of_measurement: 'W' } },
})};

// (4a) Piscină W + kWh; (4b) Hală kW→W; (4c) Server senzor lipsă → „—”
const el4 = mount(cfg4, hass4);
const t4 = textOf(el4);
const h4 = htmlOf(el4);
includes('c4 piscină W', t4, '350 W');
includes('c4 piscină kWh', t4, '2,50 kWh');
includes('c4 hală kW→W', t4, '1,50 kW');
includes('c4 server —', t4, '—');
const srvIdx = t4.indexOf('Server');
includes('c4 server W —', t4.slice(srvIdx, srvIdx + 60), '—');

// (4d) Escape nume
const cfg5 = { style: 'cyber', consumers: [
  { name: 'A&B<C>', icon: 'mdi:lightning', group: 'Casă', power: 'sensor.piscina_total_power' },
]};
const el5 = mount(cfg5, hass4);
includes('c5 escaped', htmlOf(el5), 'A&amp;B&lt;C&gt;');
notIncludes('c5 no raw', htmlOf(el5), 'A&B<C>');

// (4e) tabindex="0" pe rândul de consumator
includes('c4 tabindex', h4, 'tabindex="0"');

// (3/DEFECT) Nume rezervat „Rețea”: ⚠ PREZENT la primele 2 randări; console.warn O SINGURĂ dată
const warnLog = [];
const origWarn = console.warn;
console.warn = (m) => warnLog.push(String(m));
try {
  const elR = mount(cfg4, hass4);                 // randare 1
  includes('warn ⚠ randare1', htmlOf(elR), '\u26a0');
  // re-randare: schimb o valoare ca să forțeze _render (nu e idempotent pe aceeași stare)
  elR.hass = { states: Object.assign({}, hass4.states, {
    'sensor.solar_total_power': { state: '200', attributes: { unit_of_measurement: 'W' } },
  })};                                             // randare 2
  includes('warn ⚠ randare2 (persistent)', htmlOf(elR), '\u26a0');
} finally { console.warn = origWarn; }
eq('warn console.warn de 1 dată', warnLog.length, 1);

// (4f) more-info: click + Enter + Space pe rândul de consumator
const elM = mount(cfg4, hass4);
const cont = elM._cont;
const mkEvt = (targetEl) => ({ key: '', target: targetEl });
const row = { getAttribute: (a) => (a === 'data-entity' ? 'sensor.piscina_total_power' : null),
              closest: (sel) => (sel === '.consumer' ? row : null) };
// click
cont._ls.click.forEach((fn) => fn({ target: row }));
eq('click → 1 eveniment', elM.dispatched.length, 1);
eq('click entityId', elM.dispatched[0].detail.entityId, 'sensor.piscina_total_power');
// Enter
elM.dispatched.length = 0;
cont._ls.keydown.forEach((fn) => fn({ key: 'Enter', target: row, preventDefault() {} }));
eq('Enter → 1 eveniment', elM.dispatched.length, 1);
eq('Enter entityId', elM.dispatched[0].detail.entityId, 'sensor.piscina_total_power');
// Space
elM.dispatched.length = 0;
cont._ls.keydown.forEach((fn) => fn({ key: ' ', target: row, preventDefault() {} }));
eq('Space → 1 eveniment', elM.dispatched.length, 1);
// altă tastă → nimic
elM.dispatched.length = 0;
cont._ls.keydown.forEach((fn) => fn({ key: 'a', target: row, preventDefault() {} }));
eq('altă tastă → 0 evenimente', elM.dispatched.length, 0);

// (1) _entityIds include entitățile consumatorilor
const entIds = el4._entityIds();
includes('c1 entity piscina', entIds.join(','), 'sensor.piscina_total_power');
includes('c1 entity hală kW', entIds.join(','), 'sensor.hala_total_power_kW');
includes('c1 entity server', entIds.join(','), 'sensor.server_power_missing');

// Faza 3: export_zilnic unknown → autoconsum + economie „—”
const hassExp = { states: Object.assign({}, fakeHass.states, {
  'sensor.export_retea_zilnic_local': { state: 'unknown', attributes: { unit_of_measurement: 'kWh' } },
})};
const tExp = textOf(mount(fakeConfig, hassExp));
eq('def1 no lei (nicio sumă în lei; „lei/kWh” din caseta de preț nu contează)', /\d,\d\d\s*lei(?!\/)/.test(tExp), false);
// „100%" apare legitim în axa SOC (0%/50%/100%) din SVG — verificăm doar Autoconsum/Economie
const acB = tExp.slice(tExp.indexOf('Autoconsum'), tExp.indexOf('Autoconsum') + 40);
const ecB = tExp.slice(tExp.indexOf('Economie'), tExp.indexOf('Economie') + 40);
includes('def1 autoconsum —', acB, '—');
includes('def1 economie —', ecB, '—');
notIncludes('def1 autoconsum nu 100%', acB, '100%');
notIncludes('def1 economie nu 100%', ecB, '100%');

// Faza 3: încarcă + oprit
const tChg = textOf(mount(fakeConfig, { states: Object.assign({}, fakeHass.states, {
  'sensor.battery_charge_power': { state: '600', attributes: { unit_of_measurement: 'W' } },
  'sensor.battery_discharge_power': { state: '0', attributes: { unit_of_measurement: 'W' } },
})}));
includes('def3 se încarcă', tChg, ' se \u00eencarc\u0103');
includes('def3 ▲ încarcă', tChg, '\u25B2 \u00eencarc\u0103');
const tPv0 = textOf(mount({ tarif_lei_kwh: 1.30 }, { states: Object.assign({}, fakeHass.states, {
  'sensor.solar_total_power': { state: '0', attributes: { unit_of_measurement: 'W' } },
})}));
includes('def4 oprit', tPv0, '\u25CF oprit');
notIncludes('def4 no produce', tPv0, 'produce');

// zero → „0 W”
const tZ = textOf(mount({ tarif_lei_kwh: 1.30 }, { states: {
  'sensor.solar_total_power': { state: '0', attributes: { unit_of_measurement: 'W' } },
  'sensor.grid_import_power_w': { state: '0', attributes: { unit_of_measurement: 'W' } },
  'sensor.grid_export_power_w': { state: '0', attributes: { unit_of_measurement: 'W' } },
  'sensor.battery_charge_power': { state: '0', attributes: { unit_of_measurement: 'W' } },
  'sensor.battery_discharge_power': { state: '0', attributes: { unit_of_measurement: 'W' } },
}}));
notIncludes('zero no +0W', tZ, '+0 W');
notIncludes('zero no −0W', tZ, '−0 W');
includes('zero 0 W', tZ, '0 W');

// idempotență
const before = el._lastKey;
el.hass = fakeHass;
eq('asm no re-render', el._lastKey, before);


// ---- Faza 5: grafic 24h — date false DOAR prin hook, istoric real prin _historyProvider ----
// (1) eliminate generateFake* din calea de producție; (2) istoric real + gaps + HOUSE_W
function rawHistory(withGap) {
  const t = 1794000000;
  const pv = withGap
    ? [{ s: '1000', lu: t }, { s: '1800', lu: t + 300 }, { s: 'unavailable', lu: t + 600 },
       { s: '2400', lu: t + 900 }, { s: '2900', lu: t + 1200 }, { s: '3100', lu: t + 1500 }, { s: '2800', lu: t + 1800 }]
    : [{ s: '1000', lu: t }, { s: '1800', lu: t + 300 }, { s: '2400', lu: t + 600 },
       { s: '2900', lu: t + 900 }, { s: '3100', lu: t + 1200 }, { s: '2800', lu: t + 1800 }];
  return {
    'sensor.solar_total_power': pv,
    'sensor.grid_import_power_w': [{ s: '10', lu: t }],
    'sensor.grid_export_power_w': [{ s: '0', lu: t }],
    'sensor.battery_charge_power': [{ s: '0', lu: t }],
    'sensor.battery_discharge_power': [{ s: '50', lu: t }],
    'sensor.invertor_deye_battery': [{ s: '31', lu: t }],
  };
}
// (1) fără sursă (nici _historyProvider, nici hass.callWS) → „se încarcă…” (NU „fără date”)
{
  const el = mount({ style: 'cyber', tarif_lei_kwh: 1.30 }, { states: Object.assign({}, fakeHass.states) });
  includes('f5 no-source → se încarcă', textOf(el), 'se \u00eencarc\u0103');
  notIncludes('f5 no-source nu „fără date” încă', textOf(el), 'f\u0103r\u0103 date istorice');
  el._stopRefresh();
}
// (2) hook _historyProvider cu istoric REAL → state ready + SVG 24h (fără date false din card)
{
  const el = mount({ style: 'cyber', tarif_lei_kwh: 1.30 }, { states: Object.assign({}, fakeHass.states) });
  el._historyProvider = async () => rawHistory(false);
  await el._fetchHistory();
  eq('f5 state ready', el._graphState, 'ready');
  const h = htmlOf(el);
  includes('f5 svg 24h present', h, '<svg');
  notIncludes('f5 no NaN', h, 'NaN');
  includes('f5 tick 1,0 kW', textOf(el), '1,0 kW');
  el._stopRefresh();
}
// (2) istoric cu GOL (unavailable) → SVG cu segmente, fără NaN (gol, nu 0)
{
  const el = mount({ style: 'cyber', tarif_lei_kwh: 1.30 }, { states: Object.assign({}, fakeHass.states) });
  el._historyProvider = async () => rawHistory(true);
  await el._fetchHistory();
  eq('f5 gap state ready', el._graphState, 'ready');
  const h = htmlOf(el);
  includes('f5 gap svg present', h, '<svg');
  notIncludes('f5 gap no NaN', h, 'NaN');
  el._stopRefresh();
}
// (1) hook întoarce {} (am încercat, dar fără date istorice) → „fără date istorice”
{
  const el = mount({ style: 'cyber', tarif_lei_kwh: 1.30 }, { states: Object.assign({}, fakeHass.states) });
  el._historyProvider = async () => ({});
  await el._fetchHistory();
  eq('f5 state empty', el._graphState, 'empty');
  includes('f5 → fără date istorice', textOf(el), 'f\u0103r\u0103 date istorice');
  el._stopRefresh();
}


// ---- Faza 6, PAS 1: panou Baterie + Invertoare (fără fetch nou) ----
const hass6 = { states: Object.assign({}, fakeHass.states, {
  'sensor.invertor_deye_battery':            { state: '31',  attributes: { unit_of_measurement: '%' } },
  'sensor.invertor_deye_battery_capacity':   { state: '37.4', attributes: { unit_of_measurement: 'kWh' } },
  'sensor.invertor_deye_pv_power':           { state: '120', attributes: { unit_of_measurement: 'W' } },
  'sensor.invertor_deye_today_production':   { state: '8.1', attributes: { unit_of_measurement: 'kWh' } },
  'sensor.fsp_ne_159534803_current_active_power': { state: '0.072', attributes: { unit_of_measurement: 'kW' } },
  'sensor.fsp_ne_159534803_daily_energy':    { state: '7.7', attributes: { unit_of_measurement: 'kWh' } },
  'sensor.gw2000a_solar_radiation':          { state: '540', attributes: { unit_of_measurement: 'W/m\u00b2' } },
})};
{
  // descărcare 983 W (din fakeHass) > 50 → autonomie afișată
  const el = mount({ style:'cyber', tarif_lei_kwh:1.30,
    strings:[{name:'PV1',entity:'sensor.fsp_ne_159534803_pv_1_input_power'}],
    extras:[{name:'Radiație solară',icon:'mdi:sun-wireless',entity:'sensor.gw2000a_solar_radiation'}] }, hass6);
  const t = textOf(el);
  includes('f6-bat title', t, 'Baterie');
  includes('f6 SOC 31%', t, '31%');
  includes('f6 stocat 37,4×31% = 11,59 kWh', t, '11,59 kWh');
  includes('f6 încărcare 0 W (fără semn)', t, 'Încărcare 0 W');
  includes('f6 descărcare −983 W', t, 'Descărcare −983 W');
  includes('f6 autonomie ore (983>50)', t, ' h');
  // Invertoare
  includes('f6 Deye title', t, 'Deye');
  includes('f6 Deye PV 120 W', t, 'PV 120 W');
  includes('f6 Deye azi 8,10 kWh', t, '8,10 kWh');
  includes('f6 Huawei title', t, 'Huawei');
  includes('f6 Huawei PV kW→W 72 W', t, 'PV 72 W');
  includes('f6 Huawei azi 7,70 kWh', t, '7,70 kWh');
  // string cu senzor lipsă → „—” (niciodată 0)
  includes('f6 string PV1 prezență', t, 'PV1');
  // radiația din extras (nu hardcodată)
  includes('f6 extras radiație 540 W/m²', t, '540 W/m²');
  el._stopRefresh();
}
{
  // descărcare < 50 W → autonomie „—” (nu ore)
  const h2 = Object.assign({}, hass6.states);
  h2['sensor.battery_discharge_power'] = { state:'40', attributes:{unit_of_measurement:'W'} };
  const el = mount({ style:'cyber', tarif_lei_kwh:1.30 }, { states:h2 });
  const t = textOf(el);
  notIncludes('f6 autonomie 40W nu „0,0 h”', t, '0,0 h');
  notIncludes('f6 autonomie 40W nu „1,0 h”', t, '1,0 h');
  el._stopRefresh();
}
{
  // senzor lipsă (SOC) → „—”, nu 0
  const h3 = Object.assign({}, hass6.states);
  delete h3['sensor.invertor_deye_battery'];
  const el = mount({ style:'cyber', tarif_lei_kwh:1.30 }, { states:h3 });
  const t = textOf(el);
  const iB = t.indexOf('Baterie');
  const seg = t.slice(iB, iB + 120);
  includes('f6 SOC lipsă „—”', seg, '—');
  notIncludes('f6 SOC lipsă nu 0%', seg, '0%');
  el._stopRefresh();
}
{
  // capacitate din CONFIG (nu din senzor) + nume escapate în extras
  const h4 = Object.assign({}, hass6.states);
  delete h4['sensor.invertor_deye_battery_capacity'];
  const el = mount({ style:'cyber', tarif_lei_kwh:1.30, battery_capacity_kwh: 20,
    extras:[{name:'A&B<C>', icon:'mdi:x', entity:'sensor.gw2000a_solar_radiation'}] }, { states:h4 });
  const h = htmlOf(el);
  const t = textOf(el);
  // stocat = 20 × 0,31 = 6,2 kWh
  includes('f6 cap config 20 → stocat 6,20 kWh', t, '6,20 kWh');
  includes('f6 extras nume escapat', h, 'A&amp;B&lt;C&gt;');
  el._stopRefresh();
}

console.log(`asm.test.mjs: ${passed} OK, ${failed} FAIL`);
process.exit(failed > 0 ? 1 : 0);   // cardul ține un interval (ceasul): fără exit explicit procesul nu se oprește
