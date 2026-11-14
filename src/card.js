// src/card.js — web component energie-casa-card. FAZA 4: + Consumatori (grupare, bară %, more-info, „—").
// FAZA 6: + Baterie/Invertoare, diagramă flux (flow-svg), chip-uri sisteme (mode: separate).
import { calcAll, num } from './calc.js';
import { fmtPower, fmtEnergy, fmtSigned, fmtPct, fmtExtra, esc } from './format.js';
import { buildGraphSVG, buildBars7d, parseHistory, tooltipInfo } from './graph-24h.js';
import { computeFlow, makeSources, makeDestinations } from './flow.js';
import { buildFlowSVG, buildCompactSVG, fitCompactBoxes } from './flow-svg.js';
import { CYBER_SKIN } from './theme-cyber.js';
import { ICON_SOLAR, ICON_RETEA, ICON_BATERIE, ICON_CASA, ICON_FRUNZA, ICON_MONEDE, ICON_SOARE } from './icons.js';

// Actualizează DOM-ul existent după HTML-ul nou, FĂRĂ să-l înlocuiască (text + atribute); întoarce false dacă structura diferă
// (noduri adăugate/șterse/alt tip) — atunci apelantul înlocuiește tot. Elementele rămân aceleași: nu clipesc, păstrează animațiile
// (sclipirile din flux) și nu-ți strică derularea pe telefon.
function patchNodes(o, n) {
  const oc = o.childNodes, nc = n.childNodes;
  if (!oc || !nc || oc.length !== nc.length) return false;
  for (let i = 0; i < oc.length; i++) {
    const a = oc[i], b = nc[i];
    if (a.nodeType !== b.nodeType || a.nodeName !== b.nodeName) return false;
    if (a.nodeType === 3 || a.nodeType === 8) { if (a.nodeValue !== b.nodeValue) a.nodeValue = b.nodeValue; continue; }
    if (a.nodeType !== 1) return false;
    for (const at of Array.from(a.attributes)) if (!b.hasAttribute(at.name)) a.removeAttribute(at.name);
    for (const at of Array.from(b.attributes)) if (a.getAttribute(at.name) !== at.value) a.setAttribute(at.name, at.value);
    if (!patchNodes(a, b)) return false;
  }
  return true;
}

const DEFAULT_CONFIG = {
  style: 'cyber',           // cyber | glass
  tarif_lei_kwh: null,      // doar rezervă; preferat tarif_entity (input_number)
  battery_capacity_kwh: 37.4,  // implicit (PROMPT: PYLON litiu 37,4 kWh); suprascrit de battery_capacity_entity
  mode: 'combined',         // combined | separate
  tarif_entity: 'input_number.tarif_energie',          // lei/kWh cumpărare (helper editabil din card)
  pret_export_entity: 'input_number.pret_export_energie', // lei/kWh vânzare (helper editabil din card)
};
// implicitul de capacitate (PROMPT: PYLON litiu 37,4 kWh) — dacă nu e battery_capacity_entity / battery_capacity_kwh
const DEFAULT_BATTERY_KWH = 37.4;

// Numele de consumator care SE SUPRASCRID în diagrama de flux (destinații din flow.js)
const FLOW_DEST_NAMES = ['Cas\u0103', 'Baterie', 'Re\u021bea'];
// Ordinea grupurilor din listă
const GROUP_ORDER = ['Cas\u0103', 'Hal\u0103', 'Altele'];
// CSS tema cyber (fundal #0a0e14 + grilă fină, accente #00e5ff / #ff00ea, clip-path, monospace, glow)
const CYBER_CSS = `
:host { display: block; width: 100%; box-sizing: border-box; }
.card { background: #0a0e14;
  background-image:
    linear-gradient(rgba(0,229,255,.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,229,255,.03) 1px, transparent 1px);
  background-size: 24px 24px;
  border: 1px solid #00e5ff33; border-radius: 4px;
  font-family: ui-monospace,"SF Mono",Consolas,monospace; font-size: 16px;
  color: #cfe; padding: 16px; }
.title { color: #00e5ff; font-size: 18px; margin-bottom: 12px;
  text-shadow: 0 0 8px #00e5ff55; }
.head { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; margin-bottom: 12px; }
.head .title { margin-bottom: 0; }
.clock { color: #00e5ff; font-size: 18px; text-shadow: 0 0 8px #00e5ff55; white-space: nowrap; }
.title-warn { color: #ff00ea; text-shadow: 0 0 8px #ff00ea55; }
.plates { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 12px; }
.plate { background: #0d1520; border: 1px solid #00e5ff22; padding: 10px 8px; text-align: left;
  clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);
  min-height: 80px; display: flex; flex-direction: row; align-items: center; gap: 8px; }
.tile-icon { flex: 0 0 auto; }
.plate-text { display: flex; flex-direction: column; }
.plate-label { font-size: 16px; color: #7fd; text-transform: uppercase; letter-spacing: 1px; }
.plate-val { font-size: 20px; font-weight: bold; margin-top: 4px; }
.plate-arrow { font-size: 16px; margin-top: 4px; color: #7fd; }
.pos { color: #00e5ff; text-shadow: 0 0 6px #00e5ff44; }
.neg { color: #ff00ea; text-shadow: 0 0 6px #ff00ea44; }
.dash { color: #556; }
.azi { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 12px; }
.stat { background: #0d152088; border: 1px solid #00e5ff11; padding: 6px 8px; font-size: 16px; }
.stat-k { display: block; color: #7fd; font-size: 16px; }
.stat-v { display: block; color: #fff; font-size: 16px; margin-top: 2px; }
.consumers { margin-top: 16px; }
.group-title { color: #7fd; font-size: 16px; margin: 10px 0 4px; text-transform: uppercase; letter-spacing: 1px; }
.consumer { display: flex; align-items: center; gap: 10px; padding: 8px; min-height: 48px;
  background: #0d152088; border: 1px solid #00e5ff11; cursor: pointer; }
.c-icon { font-size: 20px; width: 28px; text-align: center; color: #00e5ff; }
.c-body { flex: 1; min-width: 0; }
.c-top { display: flex; align-items: center; gap: 8px; }
.c-name { color: #fff; font-size: 16px; flex: 1; }
.c-w { color: #ff00ea; font-size: 16px; font-weight: bold; }
.c-bottom { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
.c-kwh { color: #7fd; font-size: 16px; white-space: nowrap; }
.c-bar { flex: 1; height: 6px; background: #00e5ff22; }
.c-bar-fill { height: 100%; background: #00e5ff; }
.c-pct { color: #7fd; font-size: 16px; width: 42px; text-align: right; }

.c-warn { color: #ff00ea; font-size: 16px; }
.graph-wrap { margin-top: 16px; }
.tabs { display: flex; gap: 6px; margin-bottom: 8px; }
.tab { padding: 8px 14px; min-height: 48px; border: 1px solid #00e5ff33; background: #0d1520;
  color: #7fd; font-size: 16px; cursor: pointer; }
.tab.active { color: #00e5ff; border-color: #00e5ff; box-shadow: 0 0 8px #00e5ff44; }
.graph-tip { margin-top: 6px; font-size: 16px; color: #cfe; min-height: 20px; }
.graph-tip b { color: #fff; }
.graph-empty { padding: 40px 12px; text-align: center; color: #7fd; font-size: 18px; background: #0d152055; border: 1px dashed #00e5ff33; min-height: 160px; display: flex; align-items: center; justify-content: center; }
.bi-wrap { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 16px; }
.bi-panel { background: #0d1520; border: 1px solid #00e5ff22; padding: 10px 12px;
  clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px); }
.bat-gauge-wrap { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.bat-gauge { display: flex; gap: 2px; }
.bat-gauge .cell { width: 14px; height: 22px; background: #0d1520; border: 1px solid #ffffff22; }
.bat-gauge .cell.filled { border-color: transparent; }
.bat-sum { color: #fff; font-size: 16px; }
.bi-title { color: #00e5ff; font-size: 16px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;
  text-shadow: 0 0 8px #00e5ff44; }
.bi-row { display: flex; align-items: center; justify-content: space-between; gap: 8px;
  min-height: 28px; font-size: 16px; }
.bi-row.bi-sub { min-height: 24px; padding-left: 12px; }
.bi-k { color: #7fd; font-size: 16px; }
.bi-v { color: #fff; font-size: 16px; font-weight: bold; text-align: right; }
.extras { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.extra-chip { display: inline-flex; align-items: center; gap: 6px; background: #0d152088;
  border: 1px solid #00e5ff11; padding: 6px 10px; font-size: 16px; min-height: 40px; }
.extra-chip ha-icon { color: #00e5ff; font-size: 18px; }
.extra-k { color: #7fd; }
.extra-v { color: #fff; font-weight: bold; }
.flow-wrap { margin-top: 16px; }
.flow-empty { padding: 32px 12px; text-align: center; color: #7fd; font-size: 18px;
  background: #0d152055; border: 1px dashed #00e5ff33; min-height: 120px; display: flex; align-items: center; justify-content: center; }
.sys-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
.sys-chip { min-height: 48px; padding: 8px 14px; border: 1px solid #00e5ff33; background: #0d1520;
  color: #7fd; font-size: 16px; cursor: pointer; }
.sys-chip[aria-pressed="true"] { color: #00e5ff; border-color: #00e5ff; box-shadow: 0 0 8px #00e5ff44; }
`;


// (P3/P4/P5) CSS nou, separat de CYBER_CSS (care nu se modifică): hub-ului,
// rândurilor de alocare, pulsurilor pe benzi și barelor invertoare. font-size ≥ 16px.
const HUB_CSS = `
.flow-node { filter: drop-shadow(0 0 6px #19e6ff88); }
.flow-dst { outline: none; }
.flow-dst:focus-visible { outline: 2px solid #19e6ff; outline-offset: 2px; }
/* pulsuri de lumină pe benzile active (stroke-dasharray animat) */
.flow-band { stroke-opacity: .72; filter: drop-shadow(0 0 6px #ffffff55); animation: flow-glow 2.2s ease-in-out infinite; }
@keyframes flow-glow { 0%, 100% { opacity: .62; } 50% { opacity: 1; } }
@media (prefers-reduced-motion: reduce) {
  .flow-band { animation: none; }
}
.flow-node { filter: drop-shadow(0 0 10px #19e6ffaa); }
.flow-box { filter: drop-shadow(0 0 6px #19e6ff55); }
.flow-dot { opacity: .95; filter: drop-shadow(0 0 5px #fff); animation: flow-run 2.8s linear infinite; }
.flow-chev { filter: drop-shadow(0 0 3px #fff); animation: flow-run 2.4s linear infinite; }
.flow-spark { animation: flow-spark 1.1s linear infinite; }
@keyframes flow-spark { to { stroke-dashoffset: -10; } }
/* panglici compacte (după poza de referință): translucide, margini moi, sclipiri care pâlpâie și curg, puls luminos */
.rb-halo { filter: blur(4px); }
.rb-edge { filter: blur(0.5px); }
.rb-body { filter: blur(0.7px); }
.rb-mid { filter: blur(0.9px); }
.rb-light { filter: blur(0.6px); }
.rb-star { animation-name: flow-run, rb-twinkle; animation-timing-function: linear, ease-in-out; animation-iteration-count: infinite, infinite; }
@keyframes rb-twinkle { 0%, 100% { opacity: .3; } 50% { opacity: 1; } }
@keyframes flow-run { from { offset-distance: 0%; } to { offset-distance: 100%; } }
@media (prefers-reduced-motion: reduce) { .flow-dot, .flow-chev, .rb-star { display: none; } .flow-spark { animation: none; } }
/* rândurile de alocare sub diagrama hub (P4) */
.flow-detail { margin-top: 8px; min-height: 24px; font-size: 16px; color: #cfe; }
.flow-detail .fd-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; }
.flow-detail .fd-chip { background: #0d152088; border: 1px solid #19e6ff22;
  padding: 4px 10px; border-radius: 8px; font-size: 16px; min-height: 20px; }
.flow-detail .fd-empty { color: #7fd; font-size: 16px; }
/* (P5) rând consumator sub 10 W → opacitate redusă */
.consumer.c-dim { opacity: 0.45; }
/* (P5) bară simplă PV/nominal din panourile Deye/Huawei (fără clase .bi-* noi) */
.bi-bar { height: 6px; background: #00e5ff22; border-radius: 3px; margin: 2px 0 6px; }
.bi-bar-fill { display: block; height: 100%; border-radius: 3px; background: linear-gradient(90deg, #19e6ff, #5cf2ff); }
`;

export class EnergieCasaCard extends HTMLElement {
  // ---- API cerut de prompt ----
  setConfig(config) {
    this._config = { ...DEFAULT_CONFIG, ...(config || {}) };
    this._lastKey = undefined;
    this._tab = (config && config.graph_tab) || '24h';   // Azi | 24h | 7zile
    this._graphState = 'loading';                       // refetch la nou config
    this._graphData = null;
    this._graphTried = false;
    this._graphFetchStarted = false;                    // (7A) permite re-pornirea istoricului
    this._warned = new Set();           // avertismente emise o singură dată
    // sistemele (mode: separate): cele cu show !== false.
    // (7A) implicitul e „all" (Toate) — NU primul din listă — decât dacă config.default_system e valid.
    const systems = Array.isArray(this._config.systems) ? this._config.systems.filter(Boolean) : [];
    this._systems = systems.filter((s) => s && s.show !== false);
    const defSys = this._config.default_system;
    const defValid = defSys && (defSys === 'all' || this._systems.some((s) => s.id === defSys));
    this._system = defValid ? defSys : 'all';
    if (this.style && !this.style.display) this.style.display = 'block';   // element personalizat = inline implicit; ca bloc are lățime/înălțime măsurabile
    this._reserveHeight();
    // (7A) randare + re-pornire istoric: nu lăsăm graficul blocat pe „se încarcă…”
    if (this._hass && this._root) this._render();
    if (this._root) this._fetchHistory();
  }

  get hass() { return this._hass; }
  set hass(hass) {
    if (!hass || !hass.states) return;
    const key = this._stateKey(hass);
    if (key === this._lastKey) return;
    this._lastKey = key;
    this._hass = hass;
    // re-randare LIMITATĂ (implicit cel mult o dată la 5 s; `render_throttle_ms: 0` o oprește): senzorii de putere oscilează des și fiecare
    // înlocuire a DOM-ului pe telefon provoacă clipiri/salturi de derulare
    // (în testele rulate sub Node nu limităm: ele cer re-randare imediată)
    const inNode = typeof process !== 'undefined' && !!(process.versions && process.versions.node);
    const ms = (this._config && this._config.render_throttle_ms != null && isFinite(+this._config.render_throttle_ms)) ? +this._config.render_throttle_ms : (inNode ? 0 : 5000);
    const since = Date.now() - (this._lastRenderAt || 0);
    if (this._lastRenderAt && ms > 0 && since < ms) {
      if (!this._throttleTimer) this._throttleTimer = setTimeout(() => { this._throttleTimer = null; this._render(); }, ms - since);
    } else {
      this._render();
    }
    // primul hass poate veni după connectedCallback: pornește istoricul acum
    if (!this._graphTried && !this._graphFetchStarted && this.isConnected && hass.callWS) { this._graphFetchStarted = true; this._fetchHistory(); }
  }

  getCardSize() { return 30; }
  getGridOptions() { return { columns: 12, min_columns: 6, rows: 'auto' }; }   // (7B) grila HA: 12 coloane, minim 6, inaltime auto

  // ---- ciclu de viață ----
  connectedCallback() {
    if (!this._root) this._root = this.attachShadow({ mode: 'open' });
    this._graphState = this._graphState || 'loading';   // loading | ready | empty
    this._graphData = this._graphData || null;
    if (this._hass) this._render();
    this._startRefresh();
    this._startResize();
  }
  disconnectedCallback() { this._stopRefresh(); this._stopClock(); this._stopResize(); if (this._throttleTimer) { clearTimeout(this._throttleTimer); this._throttleTimer = null; } }
  // lățimea utilă (px) pentru SVG-uri: lățimea cardului minus padding/chenare; 300–800 (800 = comportamentul vechi)
  _svgWidth(extra) {
    const w = this.clientWidth || 0;
    if (!w) return 800;
    return Math.max(300, Math.min(800, Math.round(w - (extra == null ? 68 : extra))));
  }
  // re-randare când se schimbă lățimea cardului (tabletă rotită, coloană redimensionată)
  _startResize() {
    this._stopResize();
    if (typeof ResizeObserver === 'undefined') return;
    this._lastW = this._svgWidth();
    this._ro = new ResizeObserver(() => {
      const w = this._svgWidth();
      if (Math.abs(w - (this._lastW || 0)) >= 24) { this._lastW = w; this._render(true); }
    });
    this._ro.observe(this);
  }
  _stopResize() { if (this._ro) { this._ro.disconnect(); this._ro = null; } }
  // (STIL CYBER, S2) ceas în header: un singur setInterval la 30 s, curățat la disconnect.
  // Modifică DOAR nodul de text al ceasului (nu re-randează cardul).
  _shouldShowClock() {
    const cfg = this._config || {};
    if (cfg.show_clock === false) return false;            // implicit true
    const secs = this._validSections(cfg.sections);
    // fără sections -> header afișat -> ceas; cu sections -> doar dacă 'header' e în listă
    if (secs === null) return true;
    return secs.includes('header');
  }
  // format HH:MM din new Date() din browser (doar orele minute, fără fus inventat)
  _formatClock() {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return hh + ':' + mm;
  }
  // data scurt\u0103 \u00een rom\u00e2n\u0103: \u201evin 13 nov\u201d
  _formatDate() {
    const d = new Date();
    const zi = ['dum', 'lun', 'mar', 'mie', 'joi', 'vin', 's\u00e2m'][d.getDay()];
    const luna = ['ian', 'feb', 'mar', 'apr', 'mai', 'iun', 'iul', 'aug', 'sep', 'oct', 'nov', 'dec'][d.getMonth()];
    return zi + ' ' + d.getDate() + ' ' + luna;
  }
  // Antetul rămâne pe UN rând: măsoară titlul și aplică `zoom` (max. -40%) cât să nu se mai taie nimic.
  _fitHead() {
    const t = this._root && this._root.querySelector ? this._root.querySelector('.head .title') : null;
    if (!t || !t.clientWidth) return;
    t.style.zoom = '';
    const need = t.scrollWidth, have = t.clientWidth;
    if (need > have + 0.5) t.style.zoom = String(Math.max(0.6, Math.floor((have / need) * 100) / 100 - 0.01));
  }
  // culoarea accentului (chenare, grile, antet): `accent_color: '#rrggbb'` (implicit cyan #19e6ff; ex. '#555555' = gri ca butoanele camerelor)
  _accent() {
    const a = (this._config || {}).accent_color;
    return (typeof a === 'string' && /^#[0-9a-f]{6}$/i.test(a)) ? a.toLowerCase() : '#19e6ff';
  }
  // aplică accentul pe CSS: chenare/umbre (cu alfa păstrat), culoarea TEXTELOR de accent se deschide dacă accentul e închis (gri)
  _themed(css) {
    const ac = this._accent();
    if (ac === '#19e6ff') return css;
    const n = parseInt(ac.slice(1), 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    const mix = (k) => '#' + [r, g, b].map((c) => Math.round(c + (255 - c) * k).toString(16).padStart(2, '0')).join('');
    const txt = lum < 0.55 ? mix(0.62) : ac;
    // chenarele (alfa >= 0x66) devin pline, ca bordura butoanelor camerelor; umbrele/grilele (alfa mică) rămân fine
    const solidOrFaint = (m, a) => ac + ((a && parseInt(a, 16) < 0x66) ? a : '');
    return css
      .replace(/(color:\s*)#19e6ff(?![0-9a-f])/gi, '$1' + txt)
      .replace(/#19e6ff([0-9a-f]{2})?/gi, solidOrFaint)
      .replace(/#00e5ff([0-9a-f]{2})?/gi, solidOrFaint)
      .replace(/rgba\(25,\s*230,\s*255,/gi, 'rgba(' + r + ',' + g + ',' + b + ',')
      .replace(/rgba\(0,\s*229,\s*255,/gi, 'rgba(' + r + ',' + g + ',' + b + ',')
      .replace(/#5cf2ff/gi, mix(0.35))
      .replace(/#7ff3ff/gi, mix(0.62));
  }
  // sub placa Rețea: importul pe zi + importul lunar (roșu) și exportul pe zi (verde); `grid_ledger: false` le ascunde, ce lipsește nu se afișează
  _gridLedger(c) {
    if ((this._config || {}).grid_ledger === false) return '';
    const row = (cls, arrow, label, kwh, miss, title) => miss ? '' :
      '<span class="led ' + cls + '" title="' + title + '"><span class="led-a">' + arrow + '</span> ' + label + ' ' + fmtEnergy(kwh) + '</span>';
    const html = row('led-i', '\u25BC', 'azi', c.importKwh, c.importKwhMissing, 'Import azi') +
      row('led-i', '\u25BC', 'lun\u0103', c.importMonthKwh, c.importMonthKwhMissing, 'Import luna aceasta') +
      row('led-e', '\u25B2', 'azi', c.exportKwh, c.exportKwhMissing, 'Export azi');
    return html ? '<span class="plate-led">' + html + '</span>' : '';
  }
  // fundalul interiorului cardului: `card_background` ('#000000', '#111', 'rgba(17,17,17,.9)'…); fără valoare = fundalul cyber cu grilă
  _bg() {
    const v = (this._config || {}).card_background;
    return (typeof v === 'string' && /^(#[0-9a-f]{3,8}|rgba?\([0-9., %]+\))$/i.test(v.trim())) ? v.trim() : null;
  }
  _bgCss() {
    const bg = this._bg();
    if (!bg) return '';
    // grila cyber (pătrățelele) rămâne, în culoarea accentului (ex. gri), peste fundalul ales
    const ac = this._accent(), n = parseInt(ac.slice(1), 16), gl = 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',.16)';
    return '.card { background: linear-gradient(' + gl + ' 1px, transparent 1px), linear-gradient(90deg, ' + gl + ' 1px, transparent 1px), ' + bg + '; background-size: 22px 22px, 22px 22px, auto; }' +
      '.head, .head-ico, .plate, .stat, .cq, .bi-panel, .graph-wrap, .flow-wrap, .consumers, .price { background: ' + bg + '; }';
  }
  _startClock() {
    this._stopClock();
    if (!this._shouldShowClock()) return;   // fără ceas -> niciun interval (și îl oprește dacă era)
    const upd = () => {
      const el = (this._root && this._root.querySelector) ? this._root.querySelector('.clock') : null;
      if (el) {
        if (el.firstChild) el.firstChild.nodeValue = this._formatClock();
        const dd = el.querySelector('.clock-d');
        if (dd) dd.textContent = this._formatDate();
      }
    };
    upd();
    this._clockTimer = setInterval(upd, 30000);
  }
  _stopClock() {
    if (this._clockTimer) { clearInterval(this._clockTimer); this._clockTimer = null; }
  }


  // reîmprospătare la 5 min (un singur setInterval), doar când cardul e vizibil
  _startRefresh() {
    this._stopRefresh();
    const tick = () => { if (this._isVisible()) this._fetchHistory(); };
    tick();                                   // fetch imediat
    this._refreshTimer = setInterval(tick, 5 * 60 * 1000);
    // vizibilitate: re-fetch la re-afișare (opțional)
    if (typeof IntersectionObserver !== 'undefined' && this.observe) {
      this._visible = true;
      this._io = new IntersectionObserver((es) => {
        this._visible = es.some((e) => e.isIntersecting);
        if (this._visible) this._fetchHistory();
      }, { threshold: 0.1 });
      this._io.observe(this);
    } else {
      this._visible = true;                   // Node / fără IO → considerăm vizibil
    }
  }
  _stopRefresh() {
    if (this._refreshTimer) { clearInterval(this._refreshTimer); this._refreshTimer = null; }
    if (this._io) { this._io.disconnect(); this._io = null; }
  }
  _isVisible() { return this._visible !== false; }

  // ---- intern ----
  // (1) ENTITĂȚILE URMĂRITE: cele de bază + power și energy_today ale consumatorilor
  _entityIds() {
    const c = this._config || {};
    const ids = [
      c.pv_entity || 'sensor.solar_total_power',
      c.import_entity || 'sensor.grid_import_power_w',
      c.export_entity || 'sensor.grid_export_power_w',
      c.grid_entity,
      c.grid_present_entity,
      c.battery_reserve_entity,
      c.battery_shutdown_entity,
      c.charge_entity || 'sensor.battery_charge_power',
      c.discharge_entity || 'sensor.battery_discharge_power',
      c.pv_daily_entity || 'sensor.solar_total_daily',
      c.import_daily_entity || 'sensor.import_retea_zilnic_local',
      c.export_daily_entity || 'sensor.export_retea_zilnic_local',
      c.import_monthly_entity || 'sensor.import_retea_lunar_local',
      c.bat_charge_daily_entity || 'sensor.invertor_deye_today_battery_charge',
      c.bat_discharge_daily_entity || 'sensor.invertor_deye_today_battery_discharge',
      c.soc_entity || 'sensor.invertor_deye_battery',
      c.battery_capacity_entity || 'sensor.invertor_deye_battery_capacity',
      c.tarif_entity, c.pret_export_entity,
    ];
    if (Array.isArray(c.consumers)) {
      for (const cn of c.consumers) {
        if (!cn) continue;
        if (cn.power) ids.push(cn.power);
        if (cn.energy_today) ids.push(cn.energy_today);
      }
    }
    return ids.filter(Boolean);
  }

  _stateKey(hass) {
    return this._entityIds()
      .map((id) => (hass.states[id] ? hass.states[id].state : ''))
      .join('\u0001');
  }

  _f(value, fmtFn, sign, missing) {
    if (missing) return '—';
    return fmtSigned(value, fmtFn, sign);
  }


  _plate(label, value, sign, missing, arrow, accent, iconPaths, extraHtml) {
    const text = this._f(value, fmtPower, sign, missing);
    const cls = missing ? 'dash' : (sign === '+' ? 'pos' : 'neg');
    const arrowHtml = arrow ? '<span class="plate-arrow">' + arrow + '</span>' : '';
    const iconHtml = this._tileIcon(iconPaths, accent);
    return '<div class="plate" style="--ac:' + accent + '">' +
      iconHtml +
      '<span class="plate-text">' +
        '<span class="plate-label">' + label + '</span>' +
        '<span class="plate-val ' + cls + '">' + text + '</span>' + arrowHtml + (extraHtml || '') +
      '</span>' +
      '</div>';
  }
  // (STIL CYBER, S1) iconiță SVG 32×32 cu aria-hidden="true", culoare = accentul plăcii
  _tileIcon(paths, color, size) {
    const z = size || 44;
    return '<svg class="tile-icon" width="' + z + '" height="' + z + '" viewBox="0 0 32 32" aria-hidden="true" ' +
      'fill="none" stroke="' + color + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      paths + '</svg>';
  }

  _stat(k, v, missing, icon) {
    const cls = missing ? 'stat-v dash' : 'stat-v';
    let val = missing ? '\u2014' : String(v);
    const m = !missing && val.match(/^(.+?)(\s(?:kWh|MWh|lei))$/);
    if (m) val = m[1] + '<span class="stat-u">' + m[2] + '</span>';
    const ico = icon ? '<svg class="stat-ico" width="28" height="28" viewBox="0 0 32 32" aria-hidden="true" fill="none" ' +
      'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + icon + '</svg>' : '';
    return '<div class="stat"><span class="stat-head">' + ico + '<span class="stat-k">' + k + '</span></span>' +
      '<span class="' + cls + '">' + val + '</span></div>';
  }

  // (3) avertisment pentru nume care suprascrie o destinație din flux.
  // console.warn o singură dată (prin this._warned); simbolul ⚠ se întoarce MEREU,
  // ca să nu dispară de lângă rând la re-randare.
  _warn(name, id) {
    const key = name + '|' + (id || '');
    if (!this._warned.has(key)) {
      this._warned.add(key);
      // eslint-disable-next-line no-console
      console.warn('energie-casa-card: consumatorul „' + name +
        '” suprascrie o destinație din diagrama de flux (Casă/Baterie/Rețea).');
    }
    return '<span class="c-warn">\u26a0</span>';
  }

  // ---- chip-uri sisteme (Faza 6, PAS 3) — doar mode: separate și > 1 sistem vizibil ----
  // „Toate" + câte un chip pe sistem; butoane ≥ 48 px (CSS .sys-chip), aria-pressed pe cel activ.
  _visibleSystems() {
    return (Array.isArray(this._systems) ? this._systems : []).filter((s) => s && s.show !== false);
  }
  _renderSystemChips() {
    const cfg = this._config || {};
    if (cfg.mode !== 'separate') return '';
    const sys = this._visibleSystems();
    if (sys.length <= 1) return '';          // un singur sistem în listă → fără chip-uri
    const mk = (id, label) => {
      const pressed = (this._system === id) ? 'true' : 'false';
      return '<button class="sys-chip" type="button" data-system="' + esc(id) +
        '" aria-pressed="' + pressed + '">' + esc(label) + '</button>';
    };
    let html = '<div class="sys-chips">' + mk('all', 'Toate');
    for (const s of sys) { if (s.id === 'all') continue; html += mk(s.id, s.name || s.id); }
    return html + '</div>';
  }
  // alegerea sistemului: validează id-ul, setează și re-randează
  _onSystemClick(e) {
    const b = e.target && e.target.closest ? e.target.closest('.sys-chip') : null;
    if (!b) return;
    const id = b.getAttribute('data-system');
    if (id === 'all' || this._visibleSystems().some((s) => s.id === id)) {
      this._system = id;
      this._render();
    }
  }
  // (P4) selecția destinației din hub: click pe o etichetă → evidențiază benzile ei
  // + rânduri de alocare sub diagramă; al doilea click (sau click în afară) anulează.
  _flowToggleSelect(sel) {
    this._flowSel = (this._flowSel === sel) ? null : sel;
  }
  // delegație pe containerul .flow-wrap: etichetă destinație → comută; restul → anulează
  _onFlowClick(e) {
    const t = e.target;
    if (!t || !t.closest) return;
    const lbl = t.closest('[data-flow-dst]');
    if (lbl) {
      this._flowToggleSelect(lbl.getAttribute('data-flow-dst'));
      this._renderFlowSection();
    } else if (this._flowSel) {
      this._flowSel = null;
      this._renderFlowSection();
    }
  }
  // re-randare doar a secțiunii flux (diagrama + detalii) — nu tot cardul
  _renderFlowSection() {
    const box = this._flowBoxEl;
    if (!box) return;
    box.innerHTML = this._flowHtml(this._flowCalc, this._system || 'all');
  }

  // un rând de consumator (nume + iconu ESCAPATE, (2))
  // (P5) `pw` (W sau null = lipsă) vine pre-calculat de _consumerPower — e și cheia de
  // sortare descrescătoare din _renderConsumers. Sub 10 W → rând cu opacitate redusă.
  _consumerRow(c, houseW, houseMissing, pw) {
    const icon = esc(c.icon || '');
    const name = esc(c.name || '');
    const entityId = c.power || '';
    const pMissing = (pw == null);
    const stE = c.energy_today && this._hass.states ? this._hass.states[c.energy_today] : null;
    const { value: ek, missing: eMissing } = stE ? num(stE) : { value: 0, missing: true };

    const wText = pMissing ? '—' : fmtPower(pw);
    const kwhText = eMissing ? '—' : fmtEnergy(ek);

    // bară % din consumul casei; „—" dacă consumul e missing/0
    let pct = null;
    if (!houseMissing && houseW > 0 && !pMissing) {
      pct = Math.max(0, Math.min(100, (pw / houseW) * 100));
    }
    const pctText = pct == null ? '—' : Math.round(pct) + '%';
    const barFill = pct == null ? 0 : pct;
    const dim = (!pMissing && pw < 10) ? ' c-dim' : '';

    const reserved = FLOW_DEST_NAMES.includes(c.name);
    const warn = reserved ? this._warn(c.name, entityId) : '';

    return '<div class="consumer' + dim + '" data-entity="' + esc(entityId) + '" role="button" tabindex="0">' +
      '<span class="c-icon"><ha-icon icon="' + icon + '"></ha-icon></span>' +
      '<span class="c-body">' +
        '<span class="c-top"><span class="c-name">' + name + warn + '</span>' +
          '<span class="c-w">' + wText + '</span></span>' +
        '<span class="c-bottom"><span class="c-kwh">' + kwhText + '</span>' +
          '<span class="c-bar"><span class="c-bar-fill" style="width:' + barFill.toFixed(1) + '%"></span></span>' +
          '<span class="c-pct">' + pctText + '</span></span>' +
      '</span></div>';
  }
  // (P5) puterea unui consumator (W) din config: senzor lipsă/unavailable/NaN → null
  _consumerPower(c) {
    if (!c || !c.power) return null;
    const st = this._hass.states ? this._hass.states[c.power] : null;
    if (!st) return null;
    const { value, missing } = num(st);
    return missing ? null : Math.max(0, value);
  }

  // (lista consumatorilor, grupată pe Casă/Hală/Altele)
  // (P5) sortare DESCRESCĂTOARE după putere în fiecare grup (lipsa = 0, la final);
  // rândurile sub 10 W primesc opacitate redusă (clasa .c-dim din _consumerRow).
  _renderConsumers(c) {
    const cfg = this._config || {};
    const consumers = Array.isArray(cfg.consumers) ? cfg.consumers.filter(Boolean) : [];
    if (consumers.length === 0) return '';

    const byGroup = {};
    for (const cn of consumers) {
      const g = cn.group || 'Altele';
      (byGroup[g] = byGroup[g] || []).push(cn);
    }
    const order = GROUP_ORDER.filter((g) => byGroup[g]).concat(
      Object.keys(byGroup).filter((g) => !GROUP_ORDER.includes(g)));

    let html = '<div class="consumers"><div class="cons-head"><span class="cons-dot"></span>Consumatori</div>';
    for (const g of order) {
      const rows = byGroup[g]
        .map((cn) => ({ cn, pw: this._consumerPower(cn) }))
        .sort((a, b) => ((b.pw == null ? 0 : b.pw) - (a.pw == null ? 0 : a.pw)));
      html += '<div class="group-title">' + esc(g) + '</div>';
      for (const r of rows) {
        html += this._consumerRow(r.cn, c.houseW, c.pvMissing || c.importMissing ||
                 c.exportMissing || c.chargeMissing || c.dischargeMissing, r.pw);
      }
    }
    html += '</div>';
    return html;
  }
  // ---- Baterie + Invertoare (Faza 6) — panourile 6 și 7 din IDEE ----
  // un rând cheie–valoare (valoare escapată, semnul prin convenție, „—" dacă lipsă)
  _biRow(k, v, opts) {
    opts = opts || {};
    const kHtml = '<span class="bi-k">' + esc(k) + '</span>';
    const missing = (v === null || v === undefined || v === '—');
    const cls = missing ? ' class="bi-v dash"' : ' class="bi-v' + (opts.cls ? ' ' + opts.cls : '') + '"';
    return '<div class="bi-row' + (opts.sub ? ' bi-sub' : '') + '">' + kHtml +
      '<span' + cls + '>' + (missing ? '—' : esc(v)) + '</span></div>';
  }
  // capacitatea bateriei (kWh): config.battery_capacity_kwh (număr) → senzor battery_capacity_entity
  // → implicitul DEFAULT_BATTERY_KWH (37,4). Senzor unavailable/unknown → „—" dacă nimic altceva.
  _batteryCapacityKwh(c) {
    const cfg = this._config || {};
    if (cfg.battery_capacity_kwh != null && isFinite(+cfg.battery_capacity_kwh)) return +cfg.battery_capacity_kwh;
    const ent = cfg.battery_capacity_entity || 'sensor.invertor_deye_battery_capacity';
    const st = ent && this._hass.states ? this._hass.states[ent] : null;
    if (st) {
      const { value, missing } = num(st);
      if (!missing) return value;
    }
    return DEFAULT_BATTERY_KWH;   // implicitul scris la vedere
  }
  // panou 6 — Baterie. (STIL CYBER, S3) gauge cu 10 celule (câte 10%) + textul existent.
  // Dacă `system` e un sistem fără baterie (ex. huawei), SOC/Stocat/Autonomie devin „—"
  // (nu am date per-sistem). Încărcare/Descărcare rămân „—" (nu sunt per-sistem în datele curente).
  _renderBattery(c, system) {
    const capKwh = this._batteryCapacityKwh(c);
    // În mode separate, dacă sistemul ales e fără baterie (huawei), nu afișăm cifre false.
    const cfg = this._config || {};
    const hasBattery = (cfg.mode !== 'separate' || system === 'all' || system == null) ||
      (system && (Array.isArray(cfg.systems) ? cfg.systems : []).some((s) => s.id === system && s.battery_soc));
    const socText = (!hasBattery || c.socMissing) ? '—' : Math.round(c.soc) + '%';
    // energie stocată = capacitate × SOC / 100
    const storedKwh = (!hasBattery || c.socMissing) ? null : capKwh * c.soc / 100;
    // încărcare / descărcare curentă (convenție: + încărcare, − descărcare)
    const chargeText = (!hasBattery || c.chargeMissing) ? '—' : fmtSigned(c.chargeW, fmtPower, '+');
    const dischargeText = (!hasBattery || c.dischargeMissing) ? '—' : fmtSigned(c.dischargeW, fmtPower, '\u2212');
    // autonomie ore = kWh stocată / descărcare kW, doar dacă descărcare > 50 W, altfel „—"
    // autonomie = cât ar ține bateria la consumul de acum: dacă se descarcă (> 50 W) după descărcarea reală,
    // altfel (se încarcă / în repaus) după consumul casei (> 50 W); sub pragurile astea nu există o estimare → „—”
    // consumul de referință = consumul CASEI (nu descărcarea de acum a bateriei: cu rețeaua prezentă bateria poate da doar 50 W deși casa consumă 1,5 kW → ar ieși sute de ore)
    const loadW = (!c.houseMissing && c.houseW > 50) ? c.houseW : ((c.dischargeW > 50) ? c.dischargeW : 0);
    // REZERVĂ (battery_reserve_pct, ex. 20): sub ea bateria nu mai alimentează casa (rămâne backup la pană de curent).
    //   cu rețea: autonomie = (SOC − rezervă) × capacitate / consum;  fără rețea (grid_present_entity pe off): backup = tot ce e stocat / consum
    // rezerva și pragul de oprire: din entitate (ex. Deye: number.invertor_deye_program_1_soc / ..._battery_shutdown_soc) sau setate manual
    const reserve = Math.max(0, Math.min(90, this._pctCfg('battery_reserve_entity', 'battery_reserve_pct', 0)));
    const floorPct = Math.max(0, Math.min(90, this._pctCfg('battery_shutdown_entity', 'battery_shutdown_pct', 0)));
    const gridLost = this._gridLost();
    const ok = hasBattery && loadW > 0 && !c.socMissing;
    const approx = '~';
    const fmtH = (h) => h >= 100 ? '99+ h' : (h <= 0 ? '0 min' : (h < 1 ? Math.max(1, Math.round(h * 60)) + ' min' : h.toFixed(1).replace('.', ',') + ' h'));
    // cu rețea: se consumă doar peste rezervă; la pană: tot ce e peste pragul de oprire al invertorului (ex. 10%), nu până la 0%
    const usableKwh = ok ? Math.max(0, storedKwh - capKwh * Math.max(reserve, floorPct) / 100) : 0;
    const backupKwh = ok ? Math.max(0, storedKwh - capKwh * floorPct / 100) : 0;
    const oreFull = ok ? backupKwh / (loadW / 1000) : null, oreUse = ok ? usableKwh / (loadW / 1000) : null;
    const oreText = !ok ? '\u2014' : (gridLost ? approx + fmtH(oreFull) : approx + fmtH(oreUse));
    // capacitatea afișată = cea UTILIZABILĂ: cu rețea, doar ce e peste rezervă (la ≤ rezervă arată 0); fără rețea (backup), tot ce e peste pragul de oprire
    const baseP = gridLost ? floorPct : Math.max(reserve, floorPct);
    const canShow = hasBattery && !c.socMissing;
    const capNow = canShow ? Math.max(0, storedKwh - capKwh * baseP / 100) : null;
    const capTotal = capKwh * (100 - baseP) / 100;
    let aut = { text: oreText, line: 'autonomie ' + oreText, extra: null, reserve, floorPct, gridLost, capNow, capTotal };
    if (ok && gridLost) { aut.line = 'backup ' + approx + fmtH(oreFull); aut.cls = 'bat-aut bat-lost'; }
    else if (ok && usableKwh <= 0) { aut.line = '\u00een rezerv\u0103'; aut.cls = 'bat-aut bat-res'; }
    if (ok && !gridLost && reserve > 0) aut.extra = 'f\u0103r\u0103 re\u021bea ' + approx + fmtH(oreFull);
    // autonomia depinde de consumul de acum (oscilează la câteva secunde): o păstrăm cel mult 60 s, ca textul să nu se schimbe la fiecare actualizare;
    // se recalculează imediat dacă se schimbă SOC-ul (0,1%), prezența rețelei, pragurile sau capacitatea. (Sub Node, în teste, nu se păstrează.)
    if (!(typeof process !== 'undefined' && process.versions && process.versions.node)) {
      const autKey = [c.socMissing ? -1 : Math.round(c.soc * 10), gridLost ? 1 : 0, reserve, floorPct, Math.round(capKwh * 10), hasBattery ? 1 : 0, ok ? 1 : 0].join('|');
      if (this._autC && this._autC.key === autKey && Date.now() - this._autC.t < 60000) aut = this._autC.aut;
      else this._autC = { key: autKey, t: Date.now(), aut };
    }
    // chenarul/bateria/despărțitorul: `battery_color` ('#rrggbb', implicit verde); umplerea are ZONE de culoare (roșu/galben/verde), nu culoarea chenarului
    const bc = (typeof cfg.battery_color === 'string' && /^#[0-9a-f]{6}$/i.test(cfg.battery_color)) ? cfg.battery_color.toLowerCase() : '#7dff3a';
    return '<div class="bi-panel bi-battery" style="--ac:' + bc + ';--bat:' + bc + ';--bat-soft:' + bc + '66"><div class="bi-title">Baterie</div>' +
      this._batteryGauge(c, system, hasBattery, storedKwh, capKwh, aut) +
      this._biRow('SOC', socText) +
      this._biRow('Stocat', storedKwh == null ? '—' : fmtEnergy(storedKwh)) +
      this._biRow('Încărcare', chargeText, { cls: 'pos' }) +
      this._biRow('Descărcare', dischargeText, { cls: 'neg' }) +
      this._biRow('Autonomie', oreText) +
      '</div>';
  }
  // curentul de la rețea a dispărut? `grid_present_entity`: valoare numerică (tensiune V) sub `grid_present_min` (50) sau stare text off/false/…
  // procent din entitate (dacă există și e numeric) sau din valoarea manuală, altfel implicit
  _pctCfg(entityKey, manualKey, dflt) {
    const cfg = this._config || {};
    const st = cfg[entityKey] && this._hass && this._hass.states ? this._hass.states[cfg[entityKey]] : null;
    if (st) {
      const n = num(st);
      if (!n.missing && isFinite(n.value)) return n.value;
    }
    const m = +cfg[manualKey];
    return isFinite(m) && cfg[manualKey] != null ? m : dflt;
  }
  _gridLost() {
    const cfg = this._config || {};
    const st = cfg.grid_present_entity && this._hass && this._hass.states ? this._hass.states[cfg.grid_present_entity] : null;
    if (!st) return false;
    const v = String(st.state).trim().toLowerCase();
    if (v === '' || v === 'unknown' || v === 'unavailable') return false;   // senzor indisponibil ≠ pană de curent
    if (/^-?[0-9]+([.,][0-9]+)?$/.test(v)) return parseFloat(v.replace(',', '.')) < (cfg.grid_present_min != null ? +cfg.grid_present_min : 50);
    return !['on', 'true', 'connected', 'ok', 'normal', 'home', 'yes', 'present'].includes(v);
  }
  // (STIL CYBER, S3) gauge: o baterie mică, umplută proporțional cu SOC, cu procentul scris pe ea.
  //   verde peste 50% · galben 20–50% · roșu-magenta sub 20%. SOC lipsă → 0 pline + „—”.
  _batteryGauge(c, system, hasBattery, storedKwh, capKwh, aut) {
    const missing = (!hasBattery || c.socMissing);
    const soc = missing ? 0 : c.soc;
    const pct = missing ? 0 : Math.max(0, Math.min(100, soc));
    // umplere pe ZONE (nu după SOC-ul curent): primele z1 % roșu, între z1 și z2 galben, peste z2 verde (z1/z2 = pragul de oprire / rezerva dacă sunt setate, altfel 10 / 20)
    const z1 = aut.floorPct > 0 ? aut.floorPct : 10, z2 = aut.reserve > 0 ? aut.reserve : 20;
    // culorile zonelor: `battery_zone_colors: ['#jos', '#mijloc', '#sus']` (implicit roșu, portocaliu, verde)
    const zc = Array.isArray((this._config || {}).battery_zone_colors) ? (this._config || {}).battery_zone_colors : [];
    const okc = (v, d) => (typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v)) ? v : d;
    const RED = okc(zc[0], '#ff4d5e'), YEL = okc(zc[1], '#ffa726'), GRN = okc(zc[2], '#7dff3a');
    const a = soc > 0 ? Math.min(100, z1 / soc * 100) : 100, b = soc > 0 ? Math.min(100, z2 / soc * 100) : 100;
    const color = 'linear-gradient(90deg,' + RED + ' 0,' + RED + ' ' + a.toFixed(1) + '%,' + YEL + ' ' + a.toFixed(1) + '%,' + YEL + ' ' + b.toFixed(1) + '%,' + GRN + ' ' + b.toFixed(1) + '%,' + GRN + ' 100%)';
    // umplere continuă, proporțională cu SOC (nu mai sunt 10 celule)
    const fill = '<span class="bat-level" style="width:calc((100% - 4px) * ' + (pct / 100).toFixed(3) + ');background:' + color + '"></span>';
    const pctLabel = missing ? '\u2014' : Math.round(soc) + '%';
    const sumHtml = missing ? '\u2014' :
      '<span class="bat-s1">' + fmtEnergy(aut.capNow == null ? storedKwh : aut.capNow) + ' din ' + fmtEnergy(aut.capTotal == null ? capKwh : aut.capTotal) + '</span>' +
      '<span class="bat-sep"> \u00b7 </span>' +
      '<span class="' + (aut.cls || 'bat-aut') + '">' + aut.line + '</span>' +
      (aut.extra ? '<span class="bat-extra">' + aut.extra + '</span>' : '');
    // marcaj subțire la nivelul rezervei (ex. 20%)
    const mark = (!missing && aut.reserve > 0 ? '<span class="bat-reserve" title="rezerv\u0103 ' + Math.round(aut.reserve) + '%" style="left:calc(2px + (100% - 4px) * ' + (aut.reserve / 100).toFixed(3) + ')"></span>' : '') +
      (!missing && aut.floorPct > 0 ? '<span class="bat-reserve bat-floor" title="oprire invertor ' + Math.round(aut.floorPct) + '%" style="left:calc(2px + (100% - 4px) * ' + (aut.floorPct / 100).toFixed(3) + ')"></span>' : '');
    return '<div class="bat-gauge-wrap">' +
      '<span class="bat-gauge" role="img" aria-label="' + pctLabel + '">' + fill + mark + '<span class="bat-pct">' + pctLabel + '</span></span>' +
      '<span class="bat-sum">' + sumHtml + '</span>' +
      '</div>';
  }
  // citește un senzor de putere (W/kW) → { text, missing } ; num() convertește kW→W
  _sensorPowerText(entityId) {
    const st = entityId && this._hass.states ? this._hass.states[entityId] : null;
    if (!st) return { text: '—', missing: true };
    const { value, missing } = num(st);
    return { text: missing ? '—' : fmtPower(value), missing };
  }
  // citește un senzor de energie (kWh) → text
  _sensorEnergyText(entityId) {
    const st = entityId && this._hass.states ? this._hass.states[entityId] : null;
    if (!st) return '—';
    const { value, missing } = num(st);
    return missing ? '—' : fmtEnergy(value);
  }
  // un bloc de invertor (Deye / Huawei): nume, PV, azi, (opțional) stringuri
  // (P5) bară simplă PV / putere nominală din config (deye_rated_kw / huawei_rated_kw);
  // fără config → fără bară; senzor lipsă → „—”, fără bară. (clasele .bi-* nu se schimbă)
  _inverterBlock(title, pvEntity, dailyEntity, strings, ratedKw) {
    const pv = this._sensorPowerText(pvEntity);
    const daily = this._sensorEnergyText(dailyEntity);
    let rows =
      this._biRow('PV', pv.text, { cls: 'pos' }) +
      this._biRow('Prod azi', daily);
    // bară: doar când există config de nominal (kW) și senzor PV valid (senz
    // lipsă → „—”, fără bară); fără config de nominal → tot fără bară
    if (ratedKw != null && isFinite(ratedKw) && ratedKw > 0 && !pv.missing) {
      const st = this._hass.states ? this._hass.states[pvEntity] : null;
      const { value } = st ? num(st) : { value: 0 };
      const pct = Math.max(0, Math.min(100, (Math.max(0, value) / (ratedKw * 1000)) * 100));
      rows += '<div class="bi-bar"><span class="bi-bar-fill" style="width:' +
        pct.toFixed(1) + '%"></span></div>';
    }
    if (Array.isArray(strings)) {
      for (const s of strings) {
        if (!s || !s.entity) continue;
        const sv = this._sensorPowerText(s.entity);
        rows += this._biRow(esc(s.name || 'String'), sv.text, { sub: true });
      }
    }
    const ac = (title === 'Huawei') ? '#ff3df0' : '#19e6ff';
    return '<div class="bi-panel" style="--ac:' + ac + '"><div class="bi-title">' + esc(title) + '</div>' + rows + '</div>';
  }
  // rând de chip-uri „extras” (config.extras[]). Radiația solară vine DIN AICI, nu e hardcodată.
  // Formatare după unit_of_measurement (fmtExtra); senzor lipsă → „—”.
  // În mode separate, un chip cu system: huawei apare doar la „all" sau la sistemul „huawei";
  // fără câmpul system apare peste tot.
  _renderExtras(system) {
    const cfg = this._config || {};
    const extras = Array.isArray(cfg.extras) ? cfg.extras.filter(Boolean) : [];
    if (extras.length === 0) return '';
    const separate = (cfg.mode === 'separate');
    const sys = (system && system !== 'all') ? system : null;
    let chips = '';
    for (const ex of extras) {
      if (separate) {
        const es = ex.system || null;
        if (es && es !== 'all') {
          // chip legat de un sistem: apare doar pe „all" (Toate) sau pe sistemul respectiv
          if (sys !== null && es !== sys) continue;
        }
      }
      const st = ex.entity && this._hass.states ? this._hass.states[ex.entity] : null;
      const unit = ex.unit || (st && st.attributes && st.attributes.unit_of_measurement) || '';
      const { value, missing } = st ? num(st) : { value: null, missing: true };
      const text = missing ? '—' : fmtExtra(value, unit);
      const icon = esc(ex.icon || '');
      const label = esc(ex.name || (ex.entity || '').split('.').pop());
      chips += '<span class="extra-chip" data-entity="' + esc(ex.entity || '') + '">' +
        '<ha-icon icon="' + icon + '"></ha-icon><span class="extra-k">' + label + '</span>' +
        '<span class="extra-v">' + text + '</span></span>';
    }
    if (!chips) return '';
    return '<div class="extras">' + chips + '</div>';
  }

  // panou 7 — Invertoare (Deye + Huawei). Radiația solară e din `extras` (nu e hardcodată aici).
  // În mode separate pe un sistem, arătăm doar invertorul respectiv.
  _renderInverters(system) {
    const cfg = this._config || {};
    const separate = (cfg.mode === 'separate');
    const only = (separate && system && system !== 'all') ? system : null;
    // (P5) nominalurile (kW) vin din config; fără ele → fără bară în panou
    const deyeRated = (cfg.deye_rated_kw != null && isFinite(+cfg.deye_rated_kw)) ? +cfg.deye_rated_kw : null;
    const hwRated = (cfg.huawei_rated_kw != null && isFinite(+cfg.huawei_rated_kw)) ? +cfg.huawei_rated_kw : null;
    const deye = !only || only === 'deye' ? this._inverterBlock(
      'Deye',
      cfg.deye_pv_entity || 'sensor.invertor_deye_pv_power',
      cfg.deye_daily_entity || 'sensor.invertor_deye_today_production',
      cfg.deye_strings, deyeRated) : '';
    const huawei = !only || only === 'huawei' ? this._inverterBlock(
      'Huawei',
      cfg.huawei_pv_entity || 'sensor.fsp_ne_159534803_current_active_power',
      cfg.huawei_daily_entity || 'sensor.fsp_ne_159534803_daily_energy',
      cfg.strings, hwRated) : '';
    return '<div class="bi-wrap">' + deye + huawei + '</div>';
  }
  // ---- Diagrama de distribuție a fluxului (Faza 6) — sursă → destinație ----
  // Folosește computeFlow() (alocare) + buildFlowSVG() (desen). Fără fetch: doar stări curente.
  // (7A) `system`: pentru un sistem CU baterie (ex. deye) diagrama rămâne COMPLETĂ (rețea +
  //       baterie + consum reale), doar sursa solară e înlocuită cu PV-ul sistemului.
  //       Pentru un sistem FĂRĂ baterie (ex. huawei) se arată doar fluxul propriu:
  //       PV-ul sistemului → Casă + Rețea (export). Nu se inventează surse zero.
  // are sistemul ales o baterie? (config.systems[].battery_soc) — doar în mode separate
  _systemHasBattery(system) {
    const cfg = this._config || {};
    if (cfg.mode !== 'separate' || !system || system === 'all') return true;
    const sys = (Array.isArray(cfg.systems) ? cfg.systems : []).find((s) => s.id === system);
    return !!(sys && sys.battery_soc);
  }
  _renderFlow(c, system) {
    // (P3/P4) calculează fluxul o singură dată, îl reține pentru re-randarea locală la selecție
    this._flowCalc = c;
    return '<div class="flow-wrap">' + this._flowHtml(c, system) + '</div>';
  }
  // (P3) stilul diagramei: config.flow_style = 'hub' (implicit) | 'ribbons'
  _flowStyle() {
    const s = (this._config || {}).flow_style;
    return (s === 'ribbons') ? 'ribbons' : 'hub';
  }
  // (P3/P4) HTML-ul diagramei (diagrama SVG + rândurile de alocare la selecție).
  // Alocarea vine din computeFlow() (ne-rescrisă); desenul din buildFlowSVG().
  // Fluxul de energie = varianta compactă (cea din dashboard-energie/tableta-test); vechea diagramă „flux de energie (estimat)” a fost înlăturată.
  _flowHtml(c, system) {
    const cfg = this._config || {};
    let calc = c;
    if (system && system !== 'all') {
      const sys = (Array.isArray(cfg.systems) ? cfg.systems : []).find((s) => s.id === system);
      const pvSt = sys && sys.pv && (this._hass.states || {})[sys.pv] ? num(this._hass.states[sys.pv]) : { value: 0, missing: true };
      if (this._systemHasBattery(system)) {
        calc = Object.assign({}, c, { pv: pvSt.missing ? 0 : pvSt.value });
      } else {
        // sistem fără baterie (ex. Huawei): doar PV → Casă + Rețea; nu inventăm surse
        calc = Object.assign({}, c, { pv: pvSt.missing ? 0 : pvSt.value, importW: 0, exportW: 0,
          dischargeW: 0, chargeW: 0, houseW: pvSt.missing ? 0 : pvSt.value });
      }
    }
    return this._compactHtml(calc, system);
  }
  // (P4) rândurile „solar → Destinație X W · baterie → Destinație Y W” pentru destinația aleasă
  _flowDetailHtml(flow, style) {
    if (style !== 'hub' || !this._flowSel) return '';
    const d = this._flowSel;
    const alloc = (flow && flow.alloc) || {};
    const rows = [];
    for (const s of Object.keys(alloc)) {
      const v = (alloc[s] && alloc[s][d]) || 0;
      if (v > 0) rows.push('<span class="fd-chip">' + esc(s) + ' \u2192 ' + esc(d) + ' ' +
        fmtPower(Math.round(v)) + '</span>');
    }
    if (rows.length === 0) return '<div class="flow-detail"><span class="fd-empty">fără alocare</span></div>';
    return '<div class="flow-detail"><div class="fd-row">' + rows.join('') + '</div></div>';
  }

  // ---- Grafic 24h / 7 zile (Faza 5) ----
  _renderGraph() {
    const tab = this._tab || '24h';
    let svg;
    if (tab === '7zile') {
      const g = this._graphData7d();
      svg = g ? buildBars7d(Object.assign({}, g, { width: this._svgWidth() })) : '<div class="graph-empty">fără date istorice</div>';
    } else if (this._graphState === 'ready' && this._graphData) {
      svg = buildGraphSVG(Object.assign({}, this._graphData, { width: this._svgWidth(), accent: this._accent() }));
    } else if (this._graphState === 'empty') {
      svg = '<div class="graph-empty">fără date istorice</div>';
    } else {
      svg = '<div class="graph-empty">se încarcă…</div>';
    }
    const tabs = [
      { id: 'Azi',   label: 'Azi' },
      { id: '24h',   label: '24 h' },
      { id: '7zile', label: '7 zile' },
    ].map((t) => {
      const act = (t.id === tab) ? ' active' : '';
      return '<button class="tab' + act + '" data-tab="' + esc(t.id) + '">' + esc(t.label) + '</button>';
    }).join('');
    return '<div class="graph-wrap">' +
      '<div class="tabs">' + tabs + '</div>' +
      '<div class="graph-svg">' + svg + '</div>' +
      '<div class="graph-tip" role="status"></div>' +
      '</div>';
  }

  // date 7 zile: doar prin hook _historyProvider7d (injectat din preview/index.html sau teste).
  // Fără hook → null → „fără date istorice”. NU mai apelează generateFake7d (nu e în calea de producție).
  _graphData7d() {
    if (this._graphData7dCache !== undefined) return this._graphData7dCache;
    this._graphData7dCache = (typeof this._historyProvider7d === 'function') ? this._historyProvider7d() : null;
    return this._graphData7dCache;
  }

  // entitățile pentru istoricul din grafic (pot fi suprascrise din config)
  _graphEntities() {
    const c = this._config || {};
    return {
      pv:  c.pv_entity   || 'sensor.solar_total_power',
      imp: c.import_entity || 'sensor.grid_import_power_w',
      exp: c.export_entity || 'sensor.grid_export_power_w',
      chg: c.charge_entity || 'sensor.battery_charge_power',
      dis: c.discharge_entity || 'sensor.battery_discharge_power',
      soc: c.soc_entity  || 'sensor.invertor_deye_battery',
    };
  }

  // citire istoric real: hook _historyProvider (test/preview) SAU hass.callWS real.
  // Datele false NU sunt aici — vin doar prin _historyProvider din preview. Fără sursă
  // (nicio metodă disponibilă) stăm „se încarcă…”. Răspuns → parseHistory (grilă 5 min).
  async _fetchHistory() {
    if (!this._needsHistory()) return;   // (7B) fara „graph” in sections -> nu cerem istoric
    const ents = this._graphEntities();
    let hasSource = false;
    let raw = null;
    try {
      if (typeof this._historyProvider === 'function') {
        hasSource = true;
        raw = await this._historyProvider();
      } else if (this._hass && this._hass.callWS) {
        hasSource = true;
        const nowMs = Date.now();                      // Date primește MILISECUNDE (nu secunde)
        raw = await this._hass.callWS({
          type: 'history/history_during_period',
          start_time: new Date(nowMs - 24 * 3600 * 1000),
          end_time: new Date(nowMs),
          entity_ids: [ents.pv, ents.imp, ents.exp, ents.chg, ents.dis, ents.soc],
          minimal_response: true,
          no_attributes: true,
          significant_changes_only: false,
        });
      }
    } catch (e) {
      // eroare de rețea → raw rămâne null; marcăm că s-a încercat
      this._graphTried = true;
    }
    if (!hasSource && !this._graphTried) return;   // încă nu avem sursă → „se încarcă…”
    this._graphTried = true;
    const parsed = parseHistory(raw, ents, { consum_entity: (this._config || {}).consum_entity });
    if (parsed && parsed.pv && parsed.pv.length) {
      this._graphData = parsed;
      this._graphState = 'ready';
    } else {
      this._graphState = 'empty';                  // am încercat, dar fără date istorice
    }
    if (this._root) this._render();
  }

  _onTabClick(e) {
    const b = e.target && e.target.closest ? e.target.closest('.tab') : null;
    if (b) { this._tab = b.getAttribute('data-tab'); this._render(); }
  }

  // atingere / mutare pe grafic → valorile momentului (Faza 5)
  _onGraphPointer(e) {
    const d = this._graphData;
    if (!d || !d.pv || !d.pv.length) return;
    const svgEl = e.currentTarget;
    if (!svgEl || !svgEl.getBoundingClientRect) return;
    const rect = svgEl.getBoundingClientRect();
    if (!rect || !rect.width) return;
    const frac = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const idx = Math.round(frac * (d.pv.length - 1));
    this._showGraphTip(idx);
  }

  _showGraphTip(idx) {
    const tip = this._root.querySelector ? this._root.querySelector('.graph-tip') : null;
    if (!tip) return;
    const info = tooltipInfo(this._graphData, idx);
    const soc = (info.soc == null) ? '—' : fmtPct(info.soc);
    tip.textContent = info.time + '   Prod ' + fmtPower(info.prod) +
      '   Cons ' + fmtPower(info.cons) + '   SOC ' + soc;
  }

  _fireMoreInfo(entityId) {
    if (!entityId) return;
    const ev = new CustomEvent('hass-more-info', {
      detail: { entityId }, bubbles: true, composed: true,
    });
    this.dispatchEvent(ev);
  }

  // handler de click pe un rând de consumator
  _onConsumerClick(e) {
    const row = e.target && e.target.closest ? e.target.closest('.consumer') : null;
    if (row) this._fireMoreInfo(row.getAttribute('data-entity'));
  }

  // handler de tastatură: Enter / Space deschide more-info (ca un buton focusabil)
  _onConsumerKey(e) {
    if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return;
    const row = e.target && e.target.closest ? e.target.closest('.consumer') : null;
    if (row) {
      e.preventDefault();
      this._fireMoreInfo(row.getAttribute('data-entity'));
    }
  }

  // ---- (7B) secțiuni opționale: config.sections = subset din header/tiles/graph/flow/
  //      consumers/battery/inverters/stats, în ordinea listată. Fără sections = TOT (default).
  // Blocul „header” (titlul viu) — calculat verbatim ca în _render înainte de 7B.
  _headerHtml(c) {
    const houseMissing = c.pvMissing || c.importMissing || c.exportMissing ||
                         c.chargeMissing || c.dischargeMissing;
    // casa doar consum\u0103: valoare f\u0103r\u0103 semn
    const tCasa = houseMissing ? '\u2014' : fmtPower(Math.abs(c.houseW));
    const tSolar = this._f(c.pv, fmtPower, '+', c.pvMissing);
    const tBatt = c.socMissing ? '—' : Math.round(c.soc) + '%';
    const battState = (c.dischargeMissing && c.chargeMissing) ? '' :
      (c.dischargeW > 0 ? ' se descarc\u0103' : c.chargeW > 0 ? ' se \u00eencarc\u0103' : '');
    // trei grupuri care nu se rup la mijloc (pe ecran \u00eengust se a\u015fa\u017e\u0103 pe dou\u0103 r\u00e2nduri curate)
    // pe ecran \u00eengust (telefon) cuvintele devin iconi\u021be mici, ca antetul s\u0103 r\u0103m\u00e2n\u0103 pe UN r\u00e2nd
    const hIco = (paths, col) => '<svg class="hI" width="16" height="16" viewBox="0 0 32 32" aria-hidden="true" fill="none" stroke="' + col + '" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">' + paths + '</svg>';
    const title = '<span class="hi hi-casa"><span class="hw">Cas\u0103 </span><b class="hv hv-neg">' + tCasa + '</b></span><span class="hs"> \u00b7 </span>' +
      '<span class="hi"><span class="hw">Solar </span>' + hIco(ICON_SOLAR, '#ffa726') + '<b class="hv hv-pos">' + tSolar + '</b></span><span class="hs"> \u00b7 </span>' +
      '<span class="hi"><span class="hw">Baterie </span>' + hIco(ICON_BATERIE, '#7dff3a') + '<b class="hv hv-bat">' + tBatt + '</b><span class="hb">' + battState + '</span></span>';
    const titleCls = (c.dischargeW > 500) ? 'title title-warn' : 'title';
    // (STIL CYBER, S2) ceas HH:MM în dreapta; doar dacă show_clock (implicit true) + header afișat
    const clockHtml = this._shouldShowClock()
      ? '<span class="clock" role="timer">' + this._formatClock() + '<small class="clock-d">' + this._formatDate() + '</small></span>' : '';
    const ico = '<span class="head-ico">' + this._tileIcon(ICON_CASA, this._accent(), 34) + '</span>';
    return '<div class="head">' + ico + '<div class="' + titleCls + '">' + title + '</div>' + clockHtml + '</div>';
  }
  // Blocul „tiles” — cele 4 plăci de flux (folosește _plate/arrow-uri, ca înainte).
  _tilesHtml(c) {
    const houseMissing = c.pvMissing || c.importMissing || c.exportMissing ||
                         c.chargeMissing || c.dischargeMissing;
    const aSolar = c.pvMissing ? '' : (c.pv > 0 ? '\u25BC produce' : '\u25CF oprit');
    let aRetea = '';
    if (!(c.importMissing && c.exportMissing)) {
      aRetea = c.importW > c.exportW ? '\u25BC import' : c.exportW > c.importW ? '\u25B2 export' : '\u25CF echilibru';
    }
    let aBatt = '';
    if (!(c.dischargeMissing && c.chargeMissing)) {
      aBatt = c.dischargeW > 0 ? '\u25BC descarc\u0103' : c.chargeW > 0 ? '\u25B2 \u00eencarc\u0103' : '\u25CF repaus';
    }
    return '<div class="plates">' +
      this._plate('Solar', c.pv, '+', c.pvMissing, aSolar, '#ffa726', ICON_SOLAR) +
      this._plate('Re\u021bea', Math.max(c.importW, c.exportW),
                  c.importW >= c.exportW ? '\u2212' : '+',
                  c.importMissing && c.exportMissing, aRetea, (c.exportW > c.importW ? '#3dff9a' : '#ff4d5e'), ICON_RETEA, this._gridLedger(c)) +
      this._plate('Baterie' + ((!c.socMissing && isFinite(c.soc)) ? ' <span class="plate-soc">' + Math.round(c.soc) + '%</span>' : ''), Math.max(c.dischargeW, c.chargeW),
                  c.dischargeW >= c.chargeW ? '\u2212' : '+',
                  c.dischargeMissing && c.chargeMissing, aBatt, '#7dff3a', ICON_BATERIE) +
      this._plate('Cas\u0103', c.houseW, '\u2212', houseMissing, '', '#ff3df0', ICON_CASA).replace('class="plate"', 'class="plate plate-house"') +
      '</div>';
  }
  // Blocul „stats” — rândul „Azi” (folosește _stat, ca înainte).
  _statsHtml(c, system) {
    const houseKwhMissing = c.pvKwhMissing || c.importKwhMissing || c.exportKwhMissing ||
                            c.batChargeKwhMissing || c.batDischargeKwhMissing;
    const autoconsMissing = c.pvKwhMissing || c.exportKwhMissing;
    const econMissing = c.pvKwhMissing || c.exportKwhMissing;
    const economie = (c.economieLei == null) ? 'seteaz\u0103 pre\u021bul' :
      c.economieLei.toFixed(2).replace('.', ',') + ' lei';
    return '<div class="azi">' +
      this._stat('Produc\u021bie', fmtEnergy(c.pvKwh), c.pvKwhMissing, ICON_SOARE) +
      this._stat('Consum', fmtEnergy(c.houseKwh), houseKwhMissing, ICON_CASA) +
      this._stat('Autoconsum', fmtPct(c.autoconsumPct), autoconsMissing, ICON_FRUNZA) +
      this._stat('Autonomie', fmtPct(c.autonomiePct), houseKwhMissing, ICON_BATERIE) +
      this._stat('Import', fmtEnergy(c.importKwh), c.importKwhMissing, ICON_RETEA) +
      this._stat('Export', fmtEnergy(c.exportKwh), c.exportKwhMissing, ICON_RETEA) +
      this._stat('Economie', economie, econMissing, ICON_MONEDE) +
      this._stat('SOC', fmtPct(c.soc), c.socMissing, ICON_BATERIE) +
      this._renderExtras(system) +
      '</div>';
  }
  // numele de secțiuni valide (ordinea implicită = ordinea din _render înainte de 7B)
  _SECTIONS = ['header', 'tiles', 'graph', 'flow', 'consumers', 'battery', 'inverters', 'stats', 'prices', 'compact', 'compact_stats'];
  // nume cunoscute dintr-o listă de secțiuni (fără duplicări)
  _validSections(sections) {
    if (!Array.isArray(sections)) return null;
    const seen = new Set();
    const out = [];
    for (const s of sections) {
      if (typeof s === 'string' && this._SECTIONS.includes(s) && !seen.has(s)) {
        seen.add(s); out.push(s);
      }
    }
    return out;
  }
  // randează UN bloc de secțiune apelând metodele de randare EXISTENTE (nu rescrie logica)
  _renderSection(name, c, system) {
    switch (name) {
      case 'header':    return this._headerHtml(c);
      case 'tiles':     return this._tilesHtml(c);
      case 'graph':     return this._renderGraph();
      case 'flow':      return this._renderFlow(c, system);
      case 'consumers': return this._renderConsumers(c);
      case 'battery':   return this._renderBattery(c, system);
      case 'inverters': return this._renderInverters(system);
      case 'stats':     return this._statsHtml(c, system);
      case 'prices':    return this._pricesHtml();
      case 'compact':   return this._compactHtml(c, system);
      case 'compact_stats': return this._compactStatsHtml(c);
      default:          return '';
    }
  }

  // (7B) istoricul 24h (callWS) se cere DOAR daca „graph" e in lista sections (sau lipsesc sections)
  _needsHistory() {
    const cfg = this._config || {};
    if (!Array.isArray(cfg.sections)) return true;
    return this._validSections(cfg.sections).includes('graph');
  }
  // (7B) chip-urile de sisteme: doar mode:separate + un bloc dependent (flow/battery/inverters) in lista.
  //      (numarul de sisteme >1 e verificat in _renderSystemChips)
  _showSystemChips(validSections) {
    const cfg = this._config || {};
    if (cfg.mode !== 'separate') return false;
    return ['flow', 'battery', 'inverters'].some((b) => validSections.includes(b));
  }
  // (7B) avertisment UNIC (console.warn) pentru un nume de sectiune necunoscut din config.sections
  _warnSection(name) {
    const key = 'section:' + name;
    if (!this._warned.has(key)) {
      this._warned.add(key);
      // eslint-disable-next-line no-console
      console.warn('energie-casa-card: sectiune necunoscuta in config.sections: \u201e' + name + '\u201d (ignorata).');
    }
  }

  // ---- varianta COMPACTĂ: surse fixe + flux + 4 statistici zilnice, într-un spațiu mic ----
  _compactHtml(c, system) {
    const cfg = this._config || {};
    const states = (this._hass && this._hass.states) || {};
    const flow = computeFlow(makeSources(c), makeDestinations(c, cfg, states));
    // sensul rețelei și al bateriei (semn: + export/încărcare, − import/descărcare)
    const gridDir = (c.importMissing && c.exportMissing) ? 'idle' : (c.exportW > c.importW ? 'export' : (c.importW > 0 ? 'import' : 'idle'));
    const batDir = (c.dischargeMissing && c.chargeMissing) ? 'idle' : (c.chargeW > c.dischargeW ? 'charge' : (c.dischargeW > 0 ? 'discharge' : 'idle'));
    const texts = {
      solar: c.pvMissing ? '\u2014' : fmtSigned(c.pv, fmtPower, '+'),
      grid: (c.importMissing && c.exportMissing) ? '\u2014' :
        (gridDir === 'export' ? fmtSigned(c.exportW, fmtPower, '+') : fmtSigned(c.importW, fmtPower, '\u2212')),
      battery: (c.dischargeMissing && c.chargeMissing) ? '\u2014' :
        (batDir === 'charge' ? fmtSigned(c.chargeW, fmtPower, '+') : fmtSigned(c.dischargeW, fmtPower, '\u2212')),
    };
    const entities = {
      solar: cfg.pv_entity || 'sensor.solar_total_power',
      grid: cfg.grid_entity || cfg.import_entity || 'sensor.grid_import_power_w',
      battery: cfg.soc_entity || 'sensor.invertor_deye_battery',
    };
    const icons = {};
    for (const cn of (Array.isArray(cfg.consumers) ? cfg.consumers : [])) { if (cn && cn.name && cn.icon) icons[cn.name] = cn.icon; }
    const colors = {};
    if (cfg.grid_import_color) colors.importGrid = cfg.grid_import_color;
    if (cfg.grid_export_color) colors.exportGrid = cfg.grid_export_color;
    if (cfg.own_color) colors.own = cfg.own_color;
    // ce există în HA (după senzori, nu după valoare: un senzor „unavailable” nu face elementul să dispară)
    const has = (id) => !!(id && states[id]);
    const tri = (v, auto) => (v === true ? true : (v === false ? false : auto));
    const present = {
      solar: tri(cfg.show_solar, has(entities.solar)),
      grid: tri(cfg.show_grid, has(cfg.grid_entity) || has(cfg.import_entity || 'sensor.grid_import_power_w') || has(cfg.export_entity || 'sensor.grid_export_power_w')),
      battery: tri(cfg.show_battery, (system && system !== 'all' && !this._systemHasBattery(system)) ? false : has(cfg.soc_entity || 'sensor.invertor_deye_battery') ||
        has(cfg.charge_entity || 'sensor.battery_charge_power') || has(cfg.discharge_entity || 'sensor.battery_discharge_power')),
    };
    // mici informații extra: radiația solară (senzor opțional) și producția pe zi
    const extras = [];
    // extrele sunt opționale: oprite implicit, pornite cu compact_extras: true
    if (cfg.compact_extras === true && cfg.radiation_entity && states[cfg.radiation_entity]) {
      const rs = states[cfg.radiation_entity], rv = num(rs);
      if (!rv.missing) extras.push({ key: 'rad', text: fmtExtra(rv.value, (rs.attributes && rs.attributes.unit_of_measurement) || 'W/m\u00b2'), col: '#ffd23a', entity: cfg.radiation_entity });
    }
    if (cfg.compact_extras === true && !c.pvKwhMissing) {
      extras.push({ key: 'prod', text: fmtEnergy(c.pvKwh), col: '#ffa726', entity: cfg.pv_daily_entity || 'sensor.solar_total_daily' });
    }
    // informații despre rețea (fără flux): import azi (roșu), export azi (verde), import luna aceasta (roșu); senzorii se pot seta
    //   (import_daily_entity / export_daily_entity / import_monthly_entity); `grid_info: false` le ascunde
    const gridInfo = [];
    if (cfg.grid_info !== false) {
      const one = (kwh, miss, col, label, title, pos) => { if (!miss) { const e = fmtEnergy(kwh); gridInfo.push({ text: e.replace(/\s(kWh|MWh)$/, ''), unit: /MWh/.test(e) ? 'MWh' : 'kWh', label, col, title, pos }); } };
      one(c.importKwh, c.importKwhMissing, 'imp', '', 'Import azi');
      one(c.exportKwh, c.exportKwhMissing, 'exp', '', 'Export azi');
      one(c.importMonthKwh, c.importMonthKwhMissing, 'imp', '', 'Import luna aceasta', 'above');   // sus: importul lunar, apoi linia Rețea cu fluxul, apoi azi, apoi export azi
    }
    const info = { texts, entities, icons, colors, soc: c.socMissing ? null : c.soc, present, extras, gridInfo,
      consumerCount: Array.isArray(cfg.consumers) ? cfg.consumers.length : 0,
      dir: { grid: gridDir, battery: batDir } };
    const svg = buildCompactSVG(flow, info, { showTotal: cfg.show_total !== false, layout: cfg.flow_layout || 'auto', shape: cfg.flow_shape || 'auto', style: cfg.flow_style, width: !this.clientWidth ? 340 : this._svgWidth(this._isSlim() ? ((this.clientWidth || 0) && this.clientWidth <= 400 ? 12 : 16) : 28) });
    // casetele din flux (Total / chip-uri) au fundalul cardului când `card_background` e setat
    const bgv = this._bg();
    return '<div class="compact">' + (bgv ? svg.replace(/#06121c/g, bgv) : svg) + '</div>';
  }
  // 6 statistici zilnice pe 3×2 (înlocuiește rândul de gauge-uri): Producție, Consum, Autoconsum, Import, Export, Economie
  _compactStatsHtml(c) {
    const houseKwhMissing = c.pvKwhMissing || c.importKwhMissing || c.exportKwhMissing ||
                            c.batChargeKwhMissing || c.batDischargeKwhMissing;
    const autoconsMissing = c.pvKwhMissing || c.exportKwhMissing;
    const econ = (c.economieLei == null || c.pvKwhMissing || c.exportKwhMissing) ? null :
      c.economieLei.toFixed(2).replace('.', ',') + ' lei';
    const cell = (k, v, miss, ac) => {
      const m = !miss && String(v).match(/^(.+?)(\s(?:kWh|MWh|lei))$/);
      const val = miss ? '\u2014' : (m ? m[1] + '<span class="cq-u">' + m[2] + '</span>' : esc(v));
      return '<div class="cq" style="--ac:' + ac + '"><span class="cq-k">' + k + '</span><span class="cq-v">' + val + '</span></div>';
    };
    return '<div class="cstats3">' +
      cell('Produc\u021bie', fmtEnergy(c.pvKwh), c.pvKwhMissing, '#ffa726') +
      cell('Consum', fmtEnergy(c.houseKwh), houseKwhMissing, '#ff3df0') +
      cell('Autoconsum', fmtPct(c.autoconsumPct), autoconsMissing, '#7dff3a') +
      cell('Import', fmtEnergy(c.importKwh), c.importKwhMissing, '#ff4d5e') +
      cell('Export', fmtEnergy(c.exportKwh), c.exportKwhMissing, '#3dff9a') +
      cell('Economie', econ == null ? '' : econ, econ == null, '#ffffff') +
      '</div>';
  }
  // „slim”: cardul conține doar blocuri compacte → padding mic, ca să încapă în locul cardurilor vechi
  _isSlim() {
    const cfg = this._config || {};
    const secs = this._validSections(cfg.sections);
    return !!(secs && secs.length && secs.every((x) => x === 'compact' || x === 'compact_stats'));
  }
  _onCompactClick(e) {
    const g = e.target && e.target.closest ? e.target.closest('[data-entity]') : null;
    if (g) this._fireMoreInfo(g.getAttribute('data-entity'));
  }

  // ---- caseta de preț (lei/kWh) editabilă din card: scrie în input_number prin serviciu ----
  _pricesHtml() {
    const cfg = this._config || {};
    const st = (this._hass && this._hass.states) || {};
    const mk = (label, eid) => {
      if (!eid || !st[eid]) return '';
      const { value, missing } = num(st[eid]);
      const val = missing ? '' : value.toFixed(2).replace('.', ',');
      return '<label class="price"><span class="price-k">' + label + '</span>' +
        '<span class="price-f"><input class="price-in" type="text" inputmode="decimal" data-entity="' + esc(eid) +
        '" value="' + esc(val) + '" aria-label="' + label + ' lei/kWh"/><span class="price-u">lei/kWh</span></span></label>';
    };
    const html = mk('Pre\u021b cump\u0103rare', cfg.tarif_entity) + mk('Pre\u021b v\u00e2nzare', cfg.pret_export_entity);
    return html ? '<div class="prices">' + html + '</div>' : '';
  }
  _onPriceChange(e) {
    const t = e && e.target;
    if (!t || !t.classList || !t.classList.contains('price-in')) return;
    const cfg = this._config || {};
    const eid = t.getAttribute('data-entity');
    if (!eid || (eid !== cfg.tarif_entity && eid !== cfg.pret_export_entity)) return;   // doar helperele din config
    const v = parseFloat(String(t.value).replace(',', '.'));
    if (!Number.isFinite(v) || v < 0 || v > 100) { this._render(true); return; }          // valoare invalidă: revine
    if (this._hass && this._hass.callService) {
      this._hass.callService('input_number', 'set_value', { entity_id: eid, value: Math.round(v * 100) / 100 });
    }
  }

  _render(force) {
    if (!this._root || !this._hass) return;
    // lățimea încă nu e cunoscută (cardul nu a fost încă măsurat): așteptăm câteva cadre, ca prima randare să fie la lățimea reală
    if (!this._sized && !force && this.isConnected && !this.clientWidth && typeof setTimeout === 'function' && (this._waitTries = (this._waitTries || 0) + 1) <= 8) {
      setTimeout(() => this._render(), 30);   // (setTimeout, nu rAF: rAF e oprit în file/ferestre ascunse)
      return;
    }
    if (this.clientWidth) this._sized = true;
    // cât timp se tastează un preț, nu re-randăm (ar pierde focusul)
    const ae = this._root.activeElement;
    if (ae && ae.classList && ae.classList.contains('price-in')) { this._pendingRender = true; return; }
    const c = calcAll(this._hass.states, this._config || {});
    const system = this._system || 'all';
    const cfg = this._config || {};

    // (7B) config.sections: daca e array -> DOAR blocurile numite, in ordinea listei.
    // Fara sections -> TOT, exact ca inainte (ordinea originala, comportament neschimbat).
    const secs = this._validSections(cfg.sections);
    let body;
    if (secs === null) {
      body =
        this._headerHtml(c) +
        this._renderSystemChips() +
        this._tilesHtml(c) +
        this._renderGraph() +
        this._renderFlow(c, system) +
        this._renderBattery(c, system) +
        this._renderInverters(system) +
        '<div class="bottom">' + this._statsHtml(c, system) + this._renderConsumers(c) + '</div>' +
        this._pricesHtml();
    } else {
      const parts = [];
      let headerIdx = -1;
      let idx = 0;
      for (const s of cfg.sections) {
        if (typeof s === 'string' && !this._SECTIONS.includes(s)) {
          this._warnSection(s);
          continue;
        }
        if (s === 'header' && headerIdx < 0) headerIdx = idx;
        parts.push(this._renderSection(s, c, system));
        idx++;
      }
      // chip-uri de sisteme: doar mode:separate + un bloc dependent (flow/battery/inverters) in lista
      const chipsHtml = this._showSystemChips(secs) ? this._renderSystemChips() : '';
      if (chipsHtml) {
        if (headerIdx >= 0) parts.splice(headerIdx + 1, 0, chipsHtml);
        else parts.unshift(chipsHtml);
      }
      body = parts.join('');
    }

    const fullHtml =
      '<style>' + this._themed(CYBER_CSS + CYBER_SKIN + HUB_CSS) + this._bgCss() + '</style>' +
      '<div class="card' + ((secs === null || secs.includes('header')) ? ' has-head' : '') + (this._isSlim() ? ' slim' : '') + ((secs && secs.length === 1 && secs[0] === 'battery') ? ' solo-battery' : '') + ((secs && secs.length === 1 && secs[0] === 'header') ? ' solo-header' : '') + '">' + body + '</div>';
    // nimic nu s-a schimbat în ce se vede → nu atingem DOM-ul (fără clipiri, fără pierdut scroll/hover/atingere)
    if (!force && fullHtml === this._lastHtml) { this._lastRenderAt = Date.now(); return; }
    this._lastHtml = fullHtml;
    this._lastRenderAt = Date.now();
    // întâi încercăm să ACTUALIZĂM DOM-ul existent (doar text/atribute); înlocuirea completă doar la schimbare de structură
    let patched = false;
    if (!force && this._domReady && typeof document !== 'undefined' && document.createElement) {
      try { const tpl = document.createElement('template'); tpl.innerHTML = fullHtml; patched = patchNodes(this._root, tpl.content); } catch (e) { patched = false; }
    }
    if (!patched) { this._root.innerHTML = fullHtml; this._domReady = true; this._bindAll(); }
    this._afterRender();
  }

  // Înălțimea ultimei randări se ține minte pe dispozitiv (localStorage) și se rezervă la încărcare: cardul nu mai apare „de la 0”, deci
  // nu împinge restul paginii în jos (ceea ce, la refresh, mută derularea). Se ridică după prima randare completă.
  _hKey() {
    const c = this._config || {};
    return 'ecc_h:' + (Array.isArray(c.sections) ? c.sections.join('+') : 'all') + ':' + (c.flow_style || '') + ':' + (c.consumers ? c.consumers.length : 0);
  }
  _reserveHeight() {
    try {
      if (!this.style || typeof localStorage === 'undefined') return;
      const h = parseInt(localStorage.getItem(this._hKey()), 10);
      if (h > 20 && h < 4000) { this.style.display = 'block'; this.style.minHeight = h + 'px'; this._reserved = true; }
    } catch (e) { /* localStorage indisponibil */ }
  }
  _rememberHeight() {
    try {
      if (!this.getBoundingClientRect || typeof localStorage === 'undefined') return;
      const h = Math.round(this.getBoundingClientRect().height);
      if (h > 20 && h !== this._hStored) { this._hStored = h; localStorage.setItem(this._hKey(), String(h)); }
    } catch (e) { /* ignorat */ }
  }
  // legare listeneri (doar după o înlocuire completă a DOM-ului; la patch elementele rămân cu listenerii lor)
  _bindAll() {
    // more-info la atingere (delegatie pe containerul .consumers, re-legat la fiecare randare)
    const cont = this._root.querySelector('.consumers');
    if (cont) {
      cont.addEventListener('click', (e) => this._onConsumerClick(e));
      // accesibilitate: Enter / Space deschide more-info (ca un buton)
      cont.addEventListener('keydown', (e) => this._onConsumerKey(e));
    }

    // varianta compactă: atingere pe caseta Solar/Rețea/Baterie -> more-info
    const compactEl = this._root.querySelector('.compact');
    if (compactEl) compactEl.addEventListener('click', (e) => this._onCompactClick(e));

    // caseta de preț: change -> set_value; la ieșire din câmp se re-randează dacă s-a amânat
    const prices = this._root.querySelector('.prices');
    if (prices) {
      prices.addEventListener('change', (e) => this._onPriceChange(e));
      prices.addEventListener('focusout', () => {
        if (this._pendingRender) { this._pendingRender = false; setTimeout(() => this._render(true), 0); }
      });
    }

    // chip-uri sisteme (mode: separate): click schimba sistemul activ
    const chips = this._root.querySelector('.sys-chips');
    if (chips) chips.addEventListener('click', (e) => this._onSystemClick(e));

    // (P4) atingere pe destinația din hub: delegație pe containerul .flow-wrap
    const flowWrap = this._root.querySelector('.flow-wrap');
    if (flowWrap) {
      this._flowBoxEl = flowWrap;   // ținta re-randării locale la selecție
      flowWrap.addEventListener('click', (e) => this._onFlowClick(e));
    }

    // grafic: tab-uri + atingere pentru valorile momentului
    const tabs = this._root.querySelector('.tabs');
    if (tabs) tabs.addEventListener('click', (e) => this._onTabClick(e));
    const svgEl = this._root.querySelector('.graph-svg svg');
    if (svgEl) {
      svgEl.addEventListener('pointermove', (e) => this._onGraphPointer(e));
      svgEl.addEventListener('pointerdown', (e) => this._onGraphPointer(e));
    }
  }

  // după fiecare randare (completă sau doar patch): măsurători + ceas
  _afterRender() {
    // varianta compactă: casetele se strâng pe conținutul real (măsurat), apoi din nou când se încarcă fonturile
    if (this._root.querySelector && this._root.querySelector('.compact')) {
      fitCompactBoxes(this._root);
      if (typeof document !== 'undefined' && document.fonts && document.fonts.ready && !this._fontsFit) {
        this._fontsFit = true;
        document.fonts.ready.then(() => { if (this._root && this._root.querySelector('.compact')) fitCompactBoxes(this._root); });
      }
    }
    // antet: dacă textul nu încape pe un rând (font de rezervă mai lat pe telefon), se micșorează până încape
    this._fitHead();
    if (typeof document !== 'undefined' && document.fonts && document.fonts.ready && !this._fontsHead) {
      this._fontsHead = true;
      document.fonts.ready.then(() => this._fitHead());
    }
    // graficul: derulare verticală permisă pe telefon (touch-action pan-y), doar pe SVG-ul graficului
    const gs = this._root.querySelector ? this._root.querySelector('.graph-svg svg') : null;
    if (gs && gs.style) gs.style.touchAction = 'pan-y';
    // câmpurile de preț: după un patch atributul `value` nu actualizează o valoare deja editată → o punem explicit (dacă nu se tastează în ele)
    if (this._root.querySelectorAll) {
      const ae = this._root.activeElement;
      this._root.querySelectorAll('.price-in').forEach((inp) => {
        const v = inp.getAttribute && inp.getAttribute('value');
        if (v != null && inp.value !== v && ae !== inp) inp.value = v;
      });
    }
    // (STIL CYBER, S2) pornește/revigorează ceasul (un singur interval; se curăță la disconnect)
    this._startClock();
    if (typeof setTimeout === 'function' && !this._remT) {
      this._remT = setTimeout(() => {
        this._remT = null;
        this._rememberHeight();
        if (this._reserved && this.style) { this.style.minHeight = ''; this._reserved = false; }
      }, 120);
    }
  }
}

EnergieCasaCard.getConfigElement = function () { return document.createElement('energie-casa-card-editor'); };
// un card nou pornește cu senzorii găsiți în HA (după unitate și nume); fără ei, doar fluxul compact (editorul vizual completează restul)
EnergieCasaCard.getStubConfig = function (hass) { return { sections: ['compact', 'compact_stats'], ...eccDetectSensors(hass) }; };

if (typeof customElements !== 'undefined') {
  customElements.define('energie-casa-card', EnergieCasaCard);
  // numele în engleză (același card): `custom:energy-house-card`
  if (!customElements.get('energy-house-card')) {
    const EnergyHouseCard = class extends EnergieCasaCard {};
    EnergyHouseCard.getConfigElement = EnergieCasaCard.getConfigElement; EnergyHouseCard.getStubConfig = EnergieCasaCard.getStubConfig;
    customElements.define('energy-house-card', EnergyHouseCard);
  }
  if (typeof window !== 'undefined') {
    window.customCards = window.customCards || [];
    window.customCards.push({ type: 'energy-house-card', name: 'Energy house card', description: 'Solar / grid / battery flow, daily statistics, battery runtime and prices for your house (cyber style).', preview: false });
  }
}