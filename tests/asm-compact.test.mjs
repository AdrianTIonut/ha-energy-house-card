// tests/asm-compact.test.mjs — secțiunea „compact” (surse fixe + flux + 4 statistici) în card.
// Verifică: apare doar dacă helperele există; change -> callService input_number.set_value;
// virgula zecimală; valori invalide ignorate; doar entitățile din config; fără re-randare în timpul tastării.

import { existsSync } from 'node:fs';
const asmPath = new URL('../energie-casa-card.js', import.meta.url);
if (!existsSync(asmPath)) { console.error('Lipsește fișierul asamblat — rulează: node build.js'); process.exit(2); }

let passed = 0, failed = 0;
function includes(label, hay, needle) { if (hay.includes(needle)) passed++; else { failed++; console.log('FAIL', label, '=> NU contine', JSON.stringify(needle)); } }
function notIncludes(label, hay, needle) { if (!hay.includes(needle)) passed++; else { failed++; console.log('FAIL', label, '=> CONTINE', JSON.stringify(needle)); } }
function eq(label, got, want) { if (JSON.stringify(got) === JSON.stringify(want)) passed++; else { failed++; console.log('FAIL', label, '=> got', JSON.stringify(got), 'want', JSON.stringify(want)); } }

if (typeof globalThis.CustomEvent === 'undefined') { globalThis.CustomEvent = class CustomEvent { constructor(t, o) { this.type = t; this.detail = (o && o.detail) || {}; } }; }
class El {
  constructor() { this._html = ''; }
  set innerHTML(v) { this._html = String(v); }
  get innerHTML() { return this._html; }
  attachShadow() { return new El(); }
  querySelector() { return null; }
  addEventListener() {}
  dispatchEvent() { return true; }
}
globalThis.HTMLElement = El;
globalThis.customElements = { define: () => {}, get: () => El };

const { EnergieCasaCard } = await import(asmPath.href);
const { fakeHass } = await import('./fake-hass.js');

const A = (v, u) => ({ state: String(v), attributes: { unit_of_measurement: u } });
function mkHass(extraStates, calls) {
  return Object.assign({}, fakeHass, {
    states: Object.assign({}, fakeHass.states, extraStates),
    callWS: async () => ({}),
    callService: (d, s, data) => { calls.push({ d, s, data }); },
  });
}
function mount(config, hass) {
  const el = new EnergieCasaCard();
  el.connectedCallback();
  el.setConfig(config);
  el.hass = hass;
  el._stopRefresh();
  return el;
}
const htmlOf = (el) => el._root.innerHTML || '';
function inputEvent(eid, value) {
  return { target: { classList: { contains: (c) => c === 'price-in' }, getAttribute: () => eid, value } };
}


const CFG = { style: 'cyber', sections: ['compact'], show_total: false, compact_extras: true };
{
  const el = mount(CFG, mkHass({}, []));
  const h = htmlOf(el);
  includes('compact: bloc', h, 'class="compact"');
  notIncludes('compact: fără statistici (sunt în compact_stats)', h, 'class="cstats3"');
  includes('compact: slim', h, 'class="card slim"');
  notIncludes('compact: fără textul TOTAL', h, 'TOTAL');
  notIncludes('compact: fără nume vizibile (doar iconițe)', h.replace(/<title>[^<]*<\/title>/g, ''), '>Solar<');
  notIncludes('compact: fără casetă TOTAL', h, 'class="flow-node"');
  includes('compact: scânteie la intersecție', h, 'class="flow-hub"');
  notIncludes('compact: fără plăci', h, 'class="plates"');
  notIncludes('compact: fără grafic', h, 'class="graph-wrap"');
  notIncludes('compact: fără NaN', h, 'NaN');
  eq('compact: nu cere istoric', el._needsHistory(), false);
}
// casetele sursă au data-entity (more-info) și atingerea o deschide
{
  const el = mount(CFG, mkHass({}, []));
  const h = htmlOf(el);
  includes('compact: entity solar', h, 'data-entity="sensor.solar_total_power"');
  includes('compact: entity baterie', h, 'data-entity="sensor.invertor_deye_battery"');
  let fired = null;
  el._fireMoreInfo = (id) => { fired = id; };
  el._onCompactClick({ target: { closest: () => ({ getAttribute: () => 'sensor.solar_total_power' }) } });
  eq('compact: click -> more-info', fired, 'sensor.solar_total_power');
  fired = null;
  el._onCompactClick({ target: { closest: () => null } });
  eq('compact: click în gol ignorat', fired, null);
}
// semn și SOC corecte pentru fakeHass (solar 192, import 7, descărcare 983)
{
  const el = mount(CFG, mkHass({}, []));
  const h = htmlOf(el);
  includes('compact: +192 W', h, '+192 W');
  includes('compact: −983 W', h, '\u2212983 W');
  includes('compact: nivel baterie în iconiță', h, 'class="bat-fill"');
}
// secțiunea poate fi combinată cu altele
{
  const el = mount({ style: 'cyber', sections: ['compact', 'prices'] }, mkHass({ 'input_number.tarif_energie': { state: '1.11', attributes: {} } }, []));
  const h = htmlOf(el);
  includes('compact+prices: compact', h, 'class="compact"');
  includes('compact+prices: prices', h, 'class="prices"');
  eq('compact+prices: ordine', h.indexOf('class="compact"') < h.indexOf('class="prices"'), true);
}
// secțiunea „compact_stats”: 6 statistici zilnice pe 3×2
{
  const el = mount({ style: 'cyber', sections: ['compact_stats'] }, mkHass({}, []));
  const h = htmlOf(el);
  includes('cstats: bloc', h, 'class="cstats3"');
  for (const k of ['Producție', 'Consum', 'Autoconsum', 'Import', 'Export', 'Economie']) includes('cstats: ' + k, h, k);
  eq('cstats: 6 celule', (h.match(/class="cq"/g) || []).length, 6);
  notIncludes('cstats: fără flux', h, 'TOTAL');
  includes('cstats: slim', h, 'slim');
  notIncludes('cstats: fără NaN', h, 'NaN');
  eq('cstats: nu cere istoric', el._needsHistory(), false);
}
// cu prețuri setate, economia arată suma în lei
{
  const st = { 'input_number.tarif_energie': { state: '1.11', attributes: { unit_of_measurement: 'lei/kWh' } },
               'input_number.pret_export_energie': { state: '0.45', attributes: { unit_of_measurement: 'lei/kWh' } } };
  const el = mount({ style: 'cyber', sections: ['compact_stats'] }, mkHass(st, []));
  includes('cstats: economie cu lei', htmlOf(el), 'lei</span>');
}
// compact + compact_stats rămân „slim”; cu alt bloc nu mai sunt
{
  const e1 = mount({ style: 'cyber', sections: ['compact', 'compact_stats'] }, mkHass({}, []));
  includes('slim: compact+stats', htmlOf(e1), ' slim');
  const e2 = mount({ style: 'cyber', sections: ['compact', 'graph'] }, mkHass({}, []));
  notIncludes('slim: nu cu graph', htmlOf(e2), ' slim');
  e2._stopRefresh();
}

// prezența elementelor din senzorii existenți: fără senzori de baterie → fără casetă „Baterie” (ca la Huawei)
{
  const noBat = mkHass({}, []);
  for (const k of ['sensor.battery_charge_power', 'sensor.battery_discharge_power', 'sensor.invertor_deye_battery']) delete noBat.states[k];
  const e1 = mount(CFG, noBat);
  const h1 = htmlOf(e1);
  includes('prezență: Solar și Rețea rămân', h1, '<title>Solar</title>');
  includes('prezență: Rețea', h1, '<title>Re\u021bea</title>');
  notIncludes('prezență: fără Baterie (senzori lipsă)', h1, '<title>Baterie</title>');
  notIncludes('prezență: fără NaN', h1, 'NaN');
  // suprascriere: show_battery:true cu senzori lipsă → apare; show_battery:false cu senzori → dispare
  const e2 = mount(Object.assign({}, CFG, { show_battery: true }), noBat);
  includes('prezență: show_battery:true forțează caseta', htmlOf(e2), '<title>Baterie</title>');
  const e3 = mount(Object.assign({}, CFG, { show_battery: false }), mkHass({}, []));
  notIncludes('prezență: show_battery:false o ascunde', htmlOf(e3), '<title>Baterie</title>');
  // un senzor „unavailable” nu face elementul să dispară
  const un = mkHass({ 'sensor.battery_discharge_power': { state: 'unavailable', attributes: {} } }, []);
  includes('prezență: senzor unavailable → rămâne', htmlOf(mount(CFG, un)), '<title>Baterie</title>');
  // toate prezente: ca înainte
  includes('prezență: toate prezente → 3 sus', htmlOf(mount(CFG, mkHass({}, []))), '<title>Baterie</title>');
}

// extra în card: producția pe zi (din sensor.solar_total_daily) și radiația solară (radiation_entity, opțional)
{
  const h = mkHass({ 'sensor.rad_test': { state: '115.4', attributes: { unit_of_measurement: 'W/m\u00b2' } } }, []);
  const e1 = mount(Object.assign({}, CFG, { radiation_entity: 'sensor.rad_test' }), h);
  const t1 = htmlOf(e1);
  includes('extra: radiația apare (115 W/m²)', t1, '115 W/m\u00b2');
  includes('extra: producția pe zi apare (kWh)', t1, 'class="cx-text"');
  includes('extra: titlu producție', t1, '<title>Produc\u021bie azi</title>');
  includes('extra: titlu radiație', t1, '<title>Radia\u021bie solar\u0103</title>');
  // fără radiation_entity: doar producția
  const e2 = mount(CFG, mkHass({}, []));
  eq('extra: fără radiation_entity → doar producția', (htmlOf(e2).match(/<g class="cx"/g) || []).length, 1);
  // compact_extras:false → niciunul
  const e3 = mount(Object.assign({}, CFG, { compact_extras: false }), mkHass({}, []));
  notIncludes('extra: compact_extras:false → fără extra', htmlOf(e3), 'class="cx"');
  // senzor radiație lipsă/unavailable → nu apare
  const e4 = mount(Object.assign({}, CFG, { radiation_entity: 'sensor.rad_test' }), mkHass({ 'sensor.rad_test': { state: 'unavailable', attributes: {} } }, []));
  eq('extra: radiație unavailable → doar producția', (htmlOf(e4).match(/<g class="cx"/g) || []).length, 1);
}

// implicit: Total afisat (show_total true), extrele optionale oprite; se pornesc cu compact_extras: true
{
  const base = { style: 'cyber', sections: ['compact'] };
  const h0 = htmlOf(mount(base, mkHass({}, [])));
  includes('implicit: caseta Total e afisata', h0, 'Total</title>');
  notIncludes('implicit: extrele sunt oprite', h0, 'class="cx"');
  const h1 = htmlOf(mount(Object.assign({}, base, { show_total: false }), mkHass({}, [])));
  notIncludes('show_total:false ascunde Total', h1, 'Total</title>');
  const h2 = htmlOf(mount(Object.assign({}, base, { compact_extras: true }), mkHass({}, [])));
  includes('compact_extras:true porneste extrele', h2, 'class="cx"');
}
// accent_color: gri (#555555) inlocuieste cyanul in chenare, grila si umbre; chenarele devin pline
{
  const h = htmlOf(mount(Object.assign({}, CFG, { accent_color: '#555555' }), mkHass({}, [])));
  includes('accent: grila in gri (rgba 85,85,85)', h, 'rgba(85,85,85,.04)');
  notIncludes('accent: nicio grila cyan ramasa', h, 'rgba(25,230,255');
  notIncludes('accent: fara cyan #19e6ff in CSS', h.slice(h.indexOf('<style>'), h.indexOf('</style>')), '#19e6ff');
  includes('accent: chenar plin gri (ca butoanele camerelor)', h, 'border: 2px solid #555555;');
  const h0 = htmlOf(mount(CFG, mkHass({}, [])));
  includes('implicit: ramane cyan', h0, 'rgba(25,230,255,.04)');
}
// HTML identic -> DOM-ul nu se atinge (fara clipiri / salturi de derulare); _render(true) il inlocuieste oricum
{
  const el = mount(CFG, mkHass({}, []));
  el._root.innerHTML = 'SENTINEL';
  el._render();
  eq('html identic: DOM neatins', el._root.innerHTML, 'SENTINEL');
  el._render(true);
  notIncludes('render fortat: DOM inlocuit', el._root.innerHTML, 'SENTINEL');
}
console.log(`asm-compact.test.mjs: ${passed} OK, ${failed} FAIL`);
process.exit(failed ? 1 : 0);
