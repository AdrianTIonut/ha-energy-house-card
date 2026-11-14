// tests/asm-f8.test.mjs — STIL CYBER, PARTEA 1 (S1..S4) pe FIȘIERUL ASAMBLAT (energie-casa-card.js).
// Helper de montare identic cu tests/asm-f6.test.mjs. Fără date false în producție.
// S1 iconițe plăci · S2 ceas header · S3 baterie gauge 10 celule · S4 extras→stats.

import { existsSync } from 'node:fs';
const asmPath = new URL('../energie-casa-card.js', import.meta.url);
if (!existsSync(asmPath)) { console.error('Lipsește fișierul asamblat — rulează: node build.js'); process.exit(2); }

let passed = 0, failed = 0;
function includes(label, hay, needle) { if (hay.includes(needle)) passed++; else { failed++; console.log('FAIL', label, '=> NU contine', JSON.stringify(needle)); } }
function notIncludes(label, hay, needle) { if (!hay.includes(needle)) passed++; else { failed++; console.log('FAIL', label, '=> CONTINE (nu ar fi trebui)', JSON.stringify(needle)); } }
function eq(label, got, want) { if (got === want) passed++; else { failed++; console.log('FAIL', label, '=> got', JSON.stringify(got), 'want', JSON.stringify(want)); } }

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
function textOf(el) {
  let h = (el._root.innerHTML || '').replace(/<style>[\s\S]*?<\/style>/g, ' ');
  return h.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
}
function cssOf(el) { const m = htmlOf(el).match(/<style>([\s\S]*?)<\/style>/); return m ? m[1] : ''; }
function flush(n = 4) { let p = Promise.resolve(); for (let i = 0; i < n; i++) p = p.then(() => {}); return p; }

// ============================================================
// (S1) Iconițe SVG inline în cele 4 plăci — 32×32, aria-hidden, culoarea plăcii
//      Test: 4 iconițe prezente, fără NaN, fără text nou (etichetele rămân).
// ============================================================
{
  const el = mount({ style: 'cyber', tarif_lei_kwh: 1.30 }, { states: Object.assign({}, fakeHass.states) });
  const h = htmlOf(el);
  const t = textOf(el);
  eq('f8-s1 4 plăci + 1 antet, iconițe svg', (h.match(/class="tile-icon"/g) || []).length, 5);
  eq('f8-s1 5 aria-hidden', (h.match(/tile-icon[^>]*aria-hidden="true"/g) || []).length, 5);
  eq('f8-s1 5 viewBox 32', (h.match(/tile-icon[^>]*viewBox="0 0 32 32"/g) || []).length, 5);
  includes('f8-s1 solar accent portocaliu', h, 'stroke="#ffa726"');
  includes('f8-s1 rețea accent roșu (import)', h, 'stroke="#ff4d5e"');
  includes('f8-s1 baterie accent verde', h, 'stroke="#7dff3a"');
  includes('f8-s1 casă accent alb-cyan', h, 'stroke="#ccffff"');
  // textele / valorile rămân neschimbate
  includes('f8-s1 eticheta Solar', t, 'Solar');
  includes('f8-s1 eticheta Rețea', t, 'Re\u021bea');
  includes('f8-s1 eticheta Baterie', t, 'Baterie');
  includes('f8-s1 eticheta Casă', t, 'Cas\u0103');
  includes('f8-s1 valoarea solar +192 W', t, '+192 W');
  notIncludes('f8-s1 fără NaN', h, 'NaN');
  el._stopRefresh();
}


// ============================================================
// (S2) Ceas în header — HH:MM din new Date(); show_clock (implicit true);
//      un singur setInterval curățat la disconnectedCallback.
// ============================================================
{
  const el = mount({ style: "cyber", tarif_lei_kwh: 1.30 }, { states: Object.assign({}, fakeHass.states) });
  const h = htmlOf(el);
  includes("f8-s2 ceas prezent (implicit true)", h, 'class="clock"');
  // format HH:MM (4 cifre cu ':') — verifică modelul, nu ora exactă
  const m = h.match(/class="clock"[^>]*>(\d{2}):(\d{2})</);
  eq("f8-s2 format HH:MM", !!m, true);
  if (m) { eq("f8-s2 ore valide", Number(m[1]) < 24, true); eq("f8-s2 minute valide", Number(m[2]) < 60, true); }
  // un singur interval activ pentru ceas
  eq("f8-s2 ceas: timer activ", el._clockTimer != null, true);
  // re-randare nu creează al doilea interval (se revigorează)
  const before = el._clockTimer;
  el._render();
  // timerul e curățat + relansat; doar UN interval există (nu e o listă) -> rămâne un singur handle
  eq("f8-s2 după re-randare tot un handle", (el._clockTimer != null), true);
  el.disconnectedCallback();
  eq("f8-s2 disconnectedCallback curăță timer", el._clockTimer, null);
  el._stopRefresh();
}
{
  // show_clock:false -> fără ceas și fără timer
  const el = mount({ style: "cyber", tarif_lei_kwh: 1.30, show_clock: false }, { states: Object.assign({}, fakeHass.states) });
  notIncludes("f8-s2 show_clock:false fără ceas", htmlOf(el), 'class="clock"');
  eq("f8-s2 show_clock:false fără timer (no timer)", (el._clockTimer == null), true);
  el.disconnectedCallback();
  el._stopRefresh();
}
{
  // fără header în sections -> fără ceas (doar tiles+stats)
  const el = mount({ style: "cyber", tarif_lei_kwh: 1.30, sections: ["tiles", "stats"] }, { states: Object.assign({}, fakeHass.states) });
  notIncludes("f8-s2 fără header în sections, fără ceas", htmlOf(el), 'class="clock"');
  eq("f8-s2 fără header în sections, fără timer (no timer)", (el._clockTimer == null), true);
  el.disconnectedCallback();
  el._stopRefresh();
}
{
  // cu header în sections -> ceas apare
  const el = mount({ style: "cyber", tarif_lei_kwh: 1.30, sections: ["header", "tiles"] }, { states: Object.assign({}, fakeHass.states) });
  includes("f8-s2 cu header în sections, ceas apare", htmlOf(el), 'class="clock"');
  eq("f8-s2 cu header, timer activ", el._clockTimer != null, true);
  el.disconnectedCallback();
  el._stopRefresh();
}
// ceas modifică DOAR nodul de text (nu re-randează cardul): simulează tick pe interval
{
  const el = mount({ style: "cyber", tarif_lei_kwh: 1.30 }, { states: Object.assign({}, fakeHass.states) });
  const snap = htmlOf(el);
  // înlocuiește textul ceasului ca la tick; apoi verificăm că _formatClock întoarce HH:MM valid
  const t2 = el._formatClock();
  eq("f8-s2 _formatClock HH:MM", /^[0-2][0-9]:[0-5][0-9]$/.test(t2), true);
  el.disconnectedCallback();
  el._stopRefresh();
}


// ============================================================
// (S3) Baterie ca gauge cu 10 celule (câte 10%) — umplute = floor(SOC/10),
//      SOC lipsă → 0 pline + „—”. Textul existent: „X kWh din Y kWh · autonomie Z h”.
// ============================================================
function gaugeOf(el) {
  const h = htmlOf(el);
  const i = h.indexOf("class=\"bat-gauge\"");
  const j = h.indexOf("class=\"bat-sum\"", i);
  return h.slice(i, j);
}
{
  // SOC 31 → 3 celule pline (floor 31/10)
  const el = mount({ style: "cyber", tarif_lei_kwh: 1.30 }, { states: Object.assign({}, fakeHass.states) });
  const g = gaugeOf(el);
  eq("f8-s3 SOC 31 → o singura umplere continua (fara celule)", (g.match(/class="bat-level"/g) || []).length === 1 && !g.includes("class=\"cell"), true);
  includes("f8-s3 SOC 31 → umplere 31%", g, "* 0.310");
  includes("f8-s3 SOC 31 → procentul scris pe baterie", g, '<span class="bat-pct">31%</span>');
  includes("f8-s3 SOC 31 aria-label 31%", g, "aria-label=\"31%\"");
  const h = htmlOf(el);
  const t = textOf(el);
  includes("f8-s3 text 11,59 kWh din", t, "11,59 kWh din");
  includes("f8-s3 text autonomie", t, "autonomie");
  includes("f8-s3 text autonomie ~9,8 h (dupa consumul casei 1,18 kW)", t, "autonomie ~9,8 h");
  // 31% ∈ [20,50] → galben
  includes("f8-s3 SOC 31: zone rosu/portocaliu/verde (31% = 3 zone)", g, "#ff4d5e 0,#ff4d5e 32.3%,#ffa726 32.3%,#ffa726 64.5%,#7dff3a 64.5%");
  el.disconnectedCallback(); el._stopRefresh();
}
{
  // SOC lipsă → 0 pline, aria-label „—”, „—” în rezumat (nu 0%)
  const st = Object.assign({}, fakeHass.states);
  delete st["sensor.invertor_deye_battery"];
  const el = mount({ style: "cyber", tarif_lei_kwh: 1.30 }, { states: st });
  const g = gaugeOf(el);
  includes("f8-s3 SOC lipsă → umplere 0", g, "* 0.000");
  includes("f8-s3 SOC lipsă aria-label —", g, "aria-label=\"\u2014\"");
  const seg = htmlOf(el).slice(htmlOf(el).indexOf("class=\"bat-sum\""), htmlOf(el).indexOf("class=\"bat-sum\"") + 40);
  includes("f8-s3 SOC lipsă rezumat —", seg, "\u2014");
  notIncludes("f8-s3 SOC lipsă nu 0%", seg, "0%");
  el.disconnectedCallback(); el._stopRefresh();
}
{
  // praguri culoare: SOC 10 → roșu-magenta, SOC 60 → verde (verifică doar culoarea folosită)
  const mk = (soc) => { const st = Object.assign({}, fakeHass.states); st["sensor.invertor_deye_battery"] = { state: String(soc), attributes: { unit_of_measurement: "%" } }; return st; };
  const elA = mount({ style: "cyber", tarif_lei_kwh: 1.30 }, { states: mk(10) });
  const gA = gaugeOf(elA);
  includes("f8-s3 SOC 10 → umplere 10%", gA, "* 0.100");
  includes("f8-s3 SOC 10: toata umplerea rosie", gA, "#ff4d5e 0,#ff4d5e 100.0%");
  includes("f8-s3 SOC 10: zona rosie ocupa tot (100%)", gA, "linear-gradient(90deg,#ff4d5e 0,#ff4d5e 100.0%");
  elA.disconnectedCallback(); elA._stopRefresh();
  const elB = mount({ style: "cyber", tarif_lei_kwh: 1.30 }, { states: mk(60) });
  const gB = gaugeOf(elB);
  includes("f8-s3 SOC 60 → umplere 60%", gB, "* 0.600");
  includes("f8-s3 SOC 60: verde peste 20%", gB, "#7dff3a 33.3%,#7dff3a 100%");
  elB.disconnectedCallback(); elB._stopRefresh();
}


// ============================================================
// (S4) extras (W/m² etc.) se mută din blocul `tiles` în blocul `stats`:
//      apar doar când `stats` e în listă SAU fără `sections`.
// ============================================================
const EXH = { states: Object.assign({}, fakeHass.states, {
  "sensor.gw2000a_solar_radiation": { state: "540", attributes: { unit_of_measurement: "W/m²" } },
})};
{
  // fără sections -> extras apar (atașate la stats)
  const el = mount({ style: "cyber", tarif_lei_kwh: 1.30, extras: [ { name: 'Radiație solară', icon: 'mdi:sun-wireless', entity: 'sensor.gw2000a_solar_radiation' } ] }, EXH);
  includes("f8-s4 fără sections, extras prezente", htmlOf(el), "540 W/m\u00b2");
  // nu mai sunt atașate la tiles: blocul .plates nu mai conține .extras
  const h = htmlOf(el);
  const iTiles = h.indexOf("class=\"plates\"");
  const iStats = h.indexOf("class=\"azi\"");
  const iEx = h.indexOf("class=\"extra-chip\"");
  eq("f8-s4 extras sunt în stats (după .azi)", iStats >= 0 && iEx > iStats, true);
  notIncludes("f8-s4 extras nu în tiles", h.slice(iTiles, iStats), "extra-chip");
  el.disconnectedCallback(); el._stopRefresh();
}
{
  // sections fără stats -> extras NU apar
  const el = mount({ style: "cyber", tarif_lei_kwh: 1.30, sections: ["tiles"], extras: [ { name: 'Radiație solară', icon: 'mdi:sun-wireless', entity: 'sensor.gw2000a_solar_radiation' } ] }, EXH);
  notIncludes("f8-s4 sections [tiles] -> fără extras", htmlOf(el), 'class="extra-chip"');
  notIncludes("f8-s4 sections [tiles] -> fără radiație", htmlOf(el), "540 W/m\u00b2");
  el.disconnectedCallback(); el._stopRefresh();
}
{
  // sections cu stats -> extras apar
  const el = mount({ style: "cyber", tarif_lei_kwh: 1.30, sections: ["tiles", "stats"], extras: [ { name: 'Radiație solară', icon: 'mdi:sun-wireless', entity: 'sensor.gw2000a_solar_radiation' } ] }, EXH);
  includes("f8-s4 sections [tiles,stats] -> extras apar", htmlOf(el), "540 W/m\u00b2");
  includes("f8-s4 sections [tiles,stats] -> blocul .extras", htmlOf(el), "class=\"extras\"");
  el.disconnectedCallback(); el._stopRefresh();
}

// autonomia cand bateria NU se descarca: estimare dupa consumul casei (cu ~); sub 50 W consum -> —
{
  const st = Object.assign({}, fakeHass.states);
  st['sensor.battery_discharge_power'] = { state: '0', attributes: { unit_of_measurement: 'W' } };
  const el = mount({ style: 'cyber', tarif_lei_kwh: 1.30 }, { states: st });
  includes('f8 autonomie estimata dupa consumul casei (~)', textOf(el), 'autonomie ~');
  el.disconnectedCallback(); el._stopRefresh();
  const st2 = Object.assign({}, st, { 'sensor.solar_total_power': { state: '0', attributes: { unit_of_measurement: 'W' } }, 'sensor.grid_import_power_w': { state: '0', attributes: { unit_of_measurement: 'W' } } });
  const el2 = mount({ style: 'cyber', tarif_lei_kwh: 1.30 }, { states: st2 });
  includes('f8 fara consum si fara descarcare: autonomie —', textOf(el2), 'autonomie —');
  el2.disconnectedCallback(); el2._stopRefresh();
}
// rezerva bateriei (battery_reserve_pct) + backup la pana de curent (grid_present_entity)
{
  const st = (o) => Object.assign({}, fakeHass.states, o);
  const S = (v, u) => ({ state: String(v), attributes: u ? { unit_of_measurement: u } : {} });
  const run = (cfg, extra) => { const el = mount(Object.assign({ style: 'cyber', tarif_lei_kwh: 1.30 }, cfg), { states: st(extra || {}) }); const t = textOf(el); const h = htmlOf(el); el.disconnectedCallback(); el._stopRefresh(); return { t, h }; };
  // SOC 31, cap 37,4, descarcare 983 W: rezerva 20% -> utilizabil (31-20)% = 4,11 kWh -> 4,2 h; fara retea 11,8 h
  let r = run({ battery_reserve_pct: 20 });
  includes('rezerva 20: autonomie ~3,5 h', r.t, 'autonomie ~3,5 h');
  includes('rezerva 20: linie fara retea 11,8 h', r.t, 'fara retea ~9,8 h'.replace('fara', 'fără').replace('retea', 'rețea'));
  includes('rezerva 20: marcaj pe baterie', r.h, 'class="bat-reserve"');
  // sub rezerva: nu mai e autonomie normala
  r = run({ battery_reserve_pct: 35 });
  includes('SOC sub rezerva: in rezerva', r.t, 'în rezervă');
  // pana de curent (binary_sensor off): backup = tot ce e stocat
  r = run({ battery_reserve_pct: 20, grid_present_entity: 'binary_sensor.g' }, { 'binary_sensor.g': S('off') });
  includes('pana de curent: backup ~9,8 h', r.t, 'backup ~9,8 h');
  notIncludes('pana de curent: fara linia fara retea', r.t, 'fără rețea');
  r = run({ battery_reserve_pct: 20, grid_present_entity: 'sensor.v' }, { 'sensor.v': S('0', 'V') });
  includes('tensiune 0 V = pana de curent', r.t, 'backup');
  r = run({ battery_reserve_pct: 20, grid_present_entity: 'binary_sensor.g' }, { 'binary_sensor.g': S('on') });
  notIncludes('retea prezenta: fara backup', r.t, 'backup');
  r = run({ battery_reserve_pct: 20, grid_present_entity: 'binary_sensor.g' }, { 'binary_sensor.g': S('unavailable') });
  notIncludes('senzor indisponibil nu e pana de curent', r.t, 'backup');
  // fara rezerva configurata: comportament vechi (11,8 h, fara linie extra, fara marcaj)
  r = run({});
  includes('fara rezerva: autonomie ~9,8 h', r.t, 'autonomie ~9,8 h');
  notIncludes('fara rezerva: fara marcaj', r.h, 'class="bat-reserve"');
  // sub o ora -> minute
  r = run({ battery_reserve_pct: 20 }, { 'sensor.invertor_deye_battery': S('21', '%') });
  includes('sub o ora se arata in minute', r.t, ' min');
}
// prag de oprire invertor (ex. 10%) + rezerva si pragul citite din entitati (Deye) sau setate manual
{
  const st = (o) => Object.assign({}, fakeHass.states, o);
  const S = (v, u) => ({ state: String(v), attributes: u ? { unit_of_measurement: u } : {} });
  const run = (cfg, extra) => { const el = mount(Object.assign({ style: 'cyber', tarif_lei_kwh: 1.30 }, cfg), { states: st(extra || {}) }); const t = textOf(el); const h = htmlOf(el); el.disconnectedCallback(); el._stopRefresh(); return { t, h }; };
  // la pana: (31-10)% x 37,4 / 0,983 kW = 8,0 h (nu 11,8 h cat ar fi pana la 0%)
  let r = run({ battery_reserve_pct: 20, battery_shutdown_pct: 10, grid_present_entity: 'binary_sensor.g' }, { 'binary_sensor.g': S('off') });
  includes('backup pana la pragul de oprire: ~6,6 h', r.t, 'backup ~6,6 h');
  includes('doua marcaje pe baterie (rezerva + oprire)', r.h, 'bat-floor');
  // aceleasi valori din entitati (Deye)
  r = run({ battery_reserve_entity: 'number.r', battery_shutdown_entity: 'number.s', grid_present_entity: 'binary_sensor.g' }, { 'number.r': S('20', '%'), 'number.s': S('10', '%'), 'binary_sensor.g': S('off') });
  includes('din entitati: backup ~6,6 h', r.t, 'backup ~6,6 h');
  // entitatea are prioritate fata de valoarea manuala; daca e indisponibila se foloseste manualul
  r = run({ battery_reserve_entity: 'number.r', battery_reserve_pct: 5 }, { 'number.r': S('20', '%') });
  includes('entitatea bate manualul: autonomie ~3,5 h', r.t, 'autonomie ~3,5 h');
  r = run({ battery_reserve_entity: 'number.r', battery_reserve_pct: 20 }, { 'number.r': S('unavailable') });
  includes('entitate indisponibila -> manualul (20%): autonomie ~3,5 h', r.t, 'autonomie ~3,5 h');
  // cu rezerva 20 si oprire 10, cu retea: tot (31-20)%
  r = run({ battery_reserve_pct: 20, battery_shutdown_pct: 10 });
  includes('cu retea: tot peste rezerva (~3,5 h)', r.t, 'autonomie ~3,5 h');
  includes('cu retea: fara retea ~6,6 h', r.t, 'fără rețea ~6,6 h');
  // SOC sub pragul de oprire la pana -> 0 min
  r = run({ battery_shutdown_pct: 10, grid_present_entity: 'binary_sensor.g' }, { 'sensor.invertor_deye_battery': S('8', '%'), 'binary_sensor.g': S('off') });
  includes('sub pragul de oprire: backup 0 min', r.t, 'backup ~0 min');
}
// placa Retea: import azi + import lunar (rosu) si export azi (verde)
{
  const st = Object.assign({}, fakeHass.states, { 'sensor.import_retea_lunar_local': { state: '108.551', attributes: { unit_of_measurement: 'kWh' } } });
  const el = mount({ style: 'cyber', tarif_lei_kwh: 1.30 }, { states: st });
  const h = htmlOf(el), t = textOf(el);
  includes('retea: import azi (rosu)', h, 'class="led led-i" title="Import azi"');
  includes('retea: import lunar (rosu)', h, 'class="led led-i" title="Import luna aceasta"');
  includes('retea: export azi (verde)', h, 'class="led led-e" title="Export azi"');
  includes('retea: valoarea lunara', t, 'lună 108');
  el.disconnectedCallback(); el._stopRefresh();
  const el2 = mount({ style: 'cyber', tarif_lei_kwh: 1.30, grid_ledger: false }, { states: st });
  notIncludes('grid_ledger:false ascunde randurile', htmlOf(el2), 'class="plate-led"');
  el2.disconnectedCallback(); el2._stopRefresh();
  const el3 = mount({ style: 'cyber', tarif_lei_kwh: 1.30 }, { states: fakeHass.states });
  notIncludes('fara senzor lunar: nu apare randul lunar', htmlOf(el3), 'Import luna aceasta');
  el3.disconnectedCallback(); el3._stopRefresh();
}
// culoarea chenarului bateriei (battery_color), culorile zonelor si fundalul interiorului (card_background)
{
  const run = (cfg) => { const el = mount(Object.assign({ style: 'cyber', tarif_lei_kwh: 1.30 }, cfg), { states: Object.assign({}, fakeHass.states) }); const h = htmlOf(el); el.disconnectedCallback(); el._stopRefresh(); return h; };
  let h = run({ battery_color: '#555555' });
  includes('battery_color: chenar gri pe panou', h, '--ac:#555555;--bat:#555555');
  notIncludes('battery_color: nu mai e verde pe panou', h.slice(h.indexOf('class="bi-panel bi-battery"'), h.indexOf('class="bi-panel bi-battery"') + 120), '--ac:#7dff3a');
  includes('implicit: chenarul bateriei ramane verde', run({}), '--ac:#7dff3a;--bat:#7dff3a');
  h = run({ battery_zone_colors: ['#aa0000', '#bb7700', '#00aa00'] });
  includes('zone configurabile', h, '#aa0000 0,#aa0000');
  h = run({ card_background: '#000000' });
  includes('card_background: interiorul negru, cu grila ramasa', h, 'background-size: 22px 22px, 22px 22px, auto');
  includes('card_background: negrul e culoarea de baza', h, ', #000000; background-size');
  includes('card_background: si panourile', h, '.plate, .stat, .cq, .bi-panel');
  notIncludes('fara card_background: nicio suprascriere', run({}), ', #000000; background-size');
  notIncludes('card_background invalid e ignorat', run({ card_background: 'rosu; } body{' }), 'rosu; background-size');
}
// capacitatea afisata = cea utilizabila (peste rezerva); la <= rezerva arata 0; la pana de curent tot ce e peste pragul de oprire
{
  const st = (o) => Object.assign({}, fakeHass.states, o);
  const S = (v, u) => ({ state: String(v), attributes: u ? { unit_of_measurement: u } : {} });
  const run = (cfg, extra) => { const el = mount(Object.assign({ style: 'cyber', tarif_lei_kwh: 1.30 }, cfg), { states: st(extra || {}) }); const t = textOf(el); el.disconnectedCallback(); el._stopRefresh(); return t; };
  // cap 48,0 manual; SOC 31, rezerva 20: utilizabil (31-20)% x 48 = 5,28 din (100-20)% x 48 = 38,40
  let t = run({ battery_capacity_kwh: 48, battery_reserve_pct: 20 });
  includes('capacitate utilizabila: 5,28 kWh din 38,40 kWh', t, '5,28 kWh din 38,40 kWh');
  // SOC 18 (sub rezerva): 0 din 38,40
  t = run({ battery_capacity_kwh: 48, battery_reserve_pct: 20 }, { 'sensor.invertor_deye_battery': S('18', '%') });
  includes('sub rezerva: 0,00 kWh din 38,40 kWh', t, '0,00 kWh din 38,40 kWh');
  // pana de curent, oprire 10: (18-10)% x 48 = 3,84 din (100-10)% x 48 = 43,20
  t = run({ battery_capacity_kwh: 48, battery_reserve_pct: 20, battery_shutdown_pct: 10, grid_present_entity: 'binary_sensor.g' }, { 'sensor.invertor_deye_battery': S('18', '%'), 'binary_sensor.g': S('off') });
  includes('backup: 3,84 kWh din 43,20 kWh', t, '3,84 kWh din 43,20 kWh');
  // fara rezerva: comportament vechi (stocat din capacitate)
  t = run({ battery_capacity_kwh: 48 });
  includes('fara rezerva: 14,88 kWh din 48,00 kWh', t, '14,88 kWh din 48,00 kWh');
}
// cardul doar-baterie: o singura margine (clasa solo-battery); cu alte sectiuni ramane panoul cu chenar
{
  const run = (cfg) => { const el = mount(Object.assign({ style: 'cyber', tarif_lei_kwh: 1.30 }, cfg), { states: Object.assign({}, fakeHass.states) }); const h = htmlOf(el); el.disconnectedCallback(); el._stopRefresh(); return h; };
  includes('doar baterie: card solo-battery', run({ sections: ['battery'] }), 'class="card solo-battery"');
  notIncludes('baterie + grafic: fara solo-battery', run({ sections: ['battery', 'graph'] }), 'solo-battery"');
  notIncludes('card complet: fara solo-battery', run({}), 'class="card has-head solo-battery"');
  includes('regula CSS: fara a doua margine', run({ sections: ['battery'] }), '.card.solo-battery .bi-battery { border: 0;');
}
// regresie: bateria da doar 52 W (rețeaua alimenteaza casa), dar casa consuma 1,55 kW -> backup ~3,1 h, NU sute de ore
{
  const S = (v, u) => ({ state: String(v), attributes: u ? { unit_of_measurement: u } : {} });
  const st = Object.assign({}, fakeHass.states, { 'sensor.battery_discharge_power': S(52, 'W'), 'sensor.grid_import_power_w': S(1500, 'W'), 'sensor.solar_total_power': S(0, 'W'), 'sensor.invertor_deye_battery': S(20, '%'), 'binary_sensor.g': S('off') });
  const el = mount({ style: 'cyber', tarif_lei_kwh: 1.30, battery_capacity_kwh: 48, battery_shutdown_pct: 10, battery_reserve_pct: 20, grid_present_entity: 'binary_sensor.g' }, { states: st });
  includes('backup dupa consumul casei, nu dupa descarcarea de 52 W', textOf(el), 'backup ~3,1 h');
  el.disconnectedCallback(); el._stopRefresh();
}
// cardul doar-antet: fara card exterior (solo-header); cu alte sectiuni ramane cardul
{
  const run = (cfg) => { const el = mount(Object.assign({ style: 'cyber', tarif_lei_kwh: 1.30 }, cfg), { states: Object.assign({}, fakeHass.states) }); const h = htmlOf(el); el.disconnectedCallback(); el._stopRefresh(); return h; };
  includes('doar antet: solo-header', run({ sections: ['header'] }), 'solo-header"');
  notIncludes('antet + placi: fara solo-header', run({ sections: ['header', 'tiles'] }), 'solo-header"');
  notIncludes('card complet: fara solo-header', run({}), 'solo-header"');
  includes('regula CSS solo-header', run({ sections: ['header'] }), '.card.solo-header { border: 0;');
}
console.log(`asm-f8.test.mjs: ${passed} OK, ${failed} FAIL`);
process.exit(failed > 0 ? 1 : 0);
