// tests/asm-prices.test.mjs — caseta de preț (lei/kWh) editabilă din card.
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

const ST = { 'input_number.tarif_energie': A('1.11', 'lei/kWh'), 'input_number.pret_export_energie': A('0.45', 'lei/kWh') };

// 1. helperele există -> două câmpuri cu valorile curente (virgulă)
{
  const calls = [];
  const el = mount({ style: 'cyber' }, mkHass(ST, calls));
  const h = htmlOf(el);
  includes('prices: bloc', h, 'class="prices"');
  includes('prices: cumpărare 1,11', h, 'value="1,11"');
  includes('prices: vânzare 0,45', h, 'value="0,45"');
  includes('prices: data-entity tarif', h, 'data-entity="input_number.tarif_energie"');
}
// 2. helperele lipsesc -> nicio casetă
{
  const h0 = mkHass({}, []);
  delete h0.states['input_number.tarif_energie'];
  delete h0.states['input_number.pret_export_energie'];
  const el = mount({ style: 'cyber' }, h0);
  notIncludes('prices: absent fără helpere', htmlOf(el), 'class="prices"');
}
// 3. doar tarif -> un singur câmp
{
  const h3 = mkHass({ 'input_number.tarif_energie': ST['input_number.tarif_energie'] }, []);
  delete h3.states['input_number.pret_export_energie'];
  const el = mount({ style: 'cyber' }, h3);
  const h = htmlOf(el);
  includes('prices: doar tarif', h, 'tarif_energie');
  notIncludes('prices: fără export', h, 'pret_export_energie');
}
// 4. change cu virgulă -> set_value 1.25
{
  const calls = [];
  const el = mount({ style: 'cyber' }, mkHass(ST, calls));
  el._onPriceChange(inputEvent('input_number.tarif_energie', '1,25'));
  eq('prices: apel serviciu', calls, [{ d: 'input_number', s: 'set_value', data: { entity_id: 'input_number.tarif_energie', value: 1.25 } }]);
}
// 5. punct zecimal + rotunjire la 2 zecimale
{
  const calls = [];
  const el = mount({ style: 'cyber' }, mkHass(ST, calls));
  el._onPriceChange(inputEvent('input_number.pret_export_energie', '0.4567'));
  eq('prices: rotunjit 0.46', calls[0] && calls[0].data.value, 0.46);
}
// 6. invalid / negativ / prea mare -> niciun apel
{
  const calls = [];
  const el = mount({ style: 'cyber' }, mkHass(ST, calls));
  for (const bad of ['abc', '', '-1', '101', 'NaN']) el._onPriceChange(inputEvent('input_number.tarif_energie', bad));
  eq('prices: invalide ignorate', calls.length, 0);
}
// 7. entitate care nu e în config -> ignorată (nu scriem în orice helper)
{
  const calls = [];
  const el = mount({ style: 'cyber' }, mkHass(ST, calls));
  el._onPriceChange(inputEvent('input_number.alt_helper', '2'));
  eq('prices: entitate străină ignorată', calls.length, 0);
}
// 8. nu e un .price-in -> ignorat
{
  const calls = [];
  const el = mount({ style: 'cyber' }, mkHass(ST, calls));
  el._onPriceChange({ target: { classList: { contains: () => false }, getAttribute: () => 'input_number.tarif_energie', value: '2' } });
  eq('prices: alt element ignorat', calls.length, 0);
}
// 9. cât timp un câmp are focus, hass nou NU re-randează (ar pierde textul tastat)
{
  const calls = [];
  const hass = mkHass(ST, calls);
  const el = mount({ style: 'cyber' }, hass);
  const before = htmlOf(el);
  el._root.activeElement = { classList: { contains: (c) => c === 'price-in' } };
  el._render();
  eq('prices: re-randare amânată', el._pendingRender, true);
  eq('prices: HTML neschimbat în timpul tastării', htmlOf(el), before);
}
// 10. economia folosește ambele prețuri (cumpărare 1,11 și vânzare 0,45)
{
  const el = mount({ style: 'cyber' }, mkHass(ST, []));
  const h = htmlOf(el);
  notIncludes('prices: economia nu mai cere prețul', h, 'setează prețul');
}
// 11. secțiunea „prices” singură
{
  const el = mount({ style: 'cyber', sections: ['prices'] }, mkHass(ST, []));
  const h = htmlOf(el);
  includes('prices: secțiune singură', h, 'class="prices"');
  notIncludes('prices: fără alte blocuri', h, 'class="plates"');
}

console.log(`asm-prices.test.mjs: ${passed} OK, ${failed} FAIL`);
process.exit(failed ? 1 : 0);
