// src/editor.js — vizual editor (ha-form) pentru energie-casa-card / energy-house-card. Fără `import` (build.js îl lipește în fișierul final).
// Logica pură (detectarea senzorilor) e testată în Node; clasa DOM se definește doar în browser.

/** Text în limba lui HA: română sau engleză. */
function eccL(hass, en, ro) {
  const l = String((hass && ((hass.locale && hass.locale.language) || hass.language)) || 'en').slice(0, 2).toLowerCase();
  return l === 'ro' ? ro : en;
}

/**
 * Ghicește senzorii de energie din HA după unitate și nume: { pv_entity, grid_entity, soc_entity, battery_capacity_entity }.
 * Folosit de butonul „Detectează senzorii” și de exemplul unui card nou.
 */
function eccDetectSensors(hass) {
  const S = (hass && hass.states) || {};
  const list = Object.entries(S).filter(([id]) => id.indexOf('sensor.') === 0).map(([id, s]) => {
    const a = (s && s.attributes) || {};
    const ent = hass.entities && hass.entities[id];
    const dev = ent && ent.device_id && hass.devices && hass.devices[ent.device_id];
    const mobile = (ent && /mobile_app|fully_kiosk|browser_mod/.test(String(ent.platform))) || (dev && /iphone|ipad|tablet|pixel|galaxy/i.test(String(dev.model || '')));
    return { id, key: (id + ' ' + String(a.friendly_name || '')).toLowerCase(), unit: String(a.unit_of_measurement || ''), dc: a.device_class || '', mobile: !!mobile };
  }).filter((x) => !x.mobile);
  const power = list.filter((x) => x.dc === 'power' || /^k?W$/.test(x.unit));
  const pick = (cands, good, bad) => {
    const best = cands.filter((x) => !(bad && bad.test(x.key))).map((x) => ({ x, sc: good.reduce((a, g) => a + (g[0].test(x.key) ? g[1] : 0), 0) })).filter((r) => r.sc > 0)
      .sort((a, b) => b.sc - a.sc || a.x.id.length - b.x.id.length)[0];
    return best ? best.x.id : '';
  };
  const out = {};
  const pv = pick(power, [[/solar|pv|fotovolt|panou/, 3], [/total/, 1], [/power|putere/, 1]], /today|daily|zilnic|lunar|monthly|import|export|grid|batter|baterie|load|consum|phase|faza/);
  const grid = pick(power, [[/power_meter|smart_meter|contor|grid|re[tț]ea/, 3], [/active/, 1], [/power|putere/, 1]], /solar|pv|batter|baterie|phase|faza|load|consum|today|daily/);
  const soc = pick(list.filter((x) => x.unit === '%' || x.dc === 'battery'), [[/batter|baterie|soc/, 3], [/(^|_)soc$/, 2], [/\.(\w+_)?battery$/, 2]], /phone|tablet|ipad|telefon|car|remote|mouse|soh|health|limit|battery_\d|_pack|_cell/);
  const cap = pick(list.filter((x) => /^k?Wh$/.test(x.unit) || x.dc === 'energy'), [[/capacity|capacitate/, 3], [/batter|baterie/, 1]], /today|daily|total_/);
  if (pv) out.pv_entity = pv;
  if (grid) out.grid_entity = grid;
  if (soc) out.soc_entity = soc;
  if (cap) out.battery_capacity_entity = cap;
  return out;
}

const ECC_SECTIONS = ['header', 'tiles', 'graph', 'flow', 'consumers', 'battery', 'inverters', 'stats', 'prices', 'compact', 'compact_stats'];
const eccIsEmpty = (v) => v === undefined || v === null || v === '' || v === false || (Array.isArray(v) && !v.length);

function eccDefineEditor() {
  if (typeof HTMLElement === 'undefined' || typeof customElements === 'undefined') return;
  if (customElements.get('energie-casa-card-editor')) return;

  const CSS = `:host{display:block}.ed{display:grid;gap:14px}.blk{border:1px solid var(--divider-color,#444);border-radius:12px;padding:12px 14px}
.blk>h3{margin:0 0 8px;font-size:14px;font-weight:600;display:flex;align-items:center;gap:8px}.blk>h3 small{font-weight:400;color:var(--secondary-text-color)}
.hint{color:var(--secondary-text-color);font-size:12px;margin:0 0 8px;line-height:1.4}.row{border:1px solid var(--divider-color,#444);border-radius:10px;padding:8px 10px;margin-top:8px}
.row .bar{display:flex;align-items:center;gap:6px;margin-bottom:4px}.row .bar b{flex:1;font-size:13px}
button.mini{border:1px solid var(--divider-color,#555);background:transparent;color:var(--primary-text-color);border-radius:8px;min-width:32px;height:32px;cursor:pointer;font-size:14px}button.mini:disabled{opacity:.35;cursor:default}
button.add,button.auto{margin-top:10px;border:1px dashed var(--primary-color,#03a9f4);background:transparent;color:var(--primary-color,#03a9f4);border-radius:10px;padding:8px 14px;cursor:pointer;font-size:13px}button.auto{margin:0;border-style:solid}
details{margin-top:6px}summary{cursor:pointer;font-size:12px;color:var(--secondary-text-color);padding:4px 0}.found{font-size:12px;color:var(--secondary-text-color);margin-top:6px}`;
  const h = (tag, attrs, ...kids) => {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) { if (k === 'class') el.className = v; else if (k === 'text') el.textContent = v; else if (k.indexOf('on') === 0) el.addEventListener(k.slice(2), v); else if (v !== false && v != null) el.setAttribute(k, v === true ? '' : v); }
    for (const k of kids.flat(Infinity)) if (k != null && k !== false) el.append(k);
    return el;
  };
  const ENT = (o) => ({ entity: { ...(o || {}) } });
  const SENSOR = (o) => ENT({ domain: 'sensor', ...(o || {}) });
  const TXT = { text: {} }, BOOL = { boolean: {} }, ICON = { icon: {} };
  const NUM = (min, max, step) => ({ number: { min, max, step: step || 1, mode: 'box' } });
  const SEL = (opts, multiple) => ({ select: { mode: 'dropdown', multiple: !!multiple, options: opts.map((o) => (typeof o === 'string' ? { value: o, label: o } : o)) } });
  const grid = (...f) => ({ type: 'grid', name: '', schema: f });
  const names = (schema) => schema.flatMap((s) => (s.type === 'grid' ? names(s.schema) : [s.name]));
  const pick = (o, keys) => { const r = {}; for (const k of keys) if (o && o[k] !== undefined) r[k] = o[k]; return r; };

  async function ensureHaParts() {
    try {
      if (customElements.get('ha-entity-picker') && customElements.get('ha-icon-picker')) return;
      const helpers = await (window.loadCardHelpers && window.loadCardHelpers());
      const c = helpers && await helpers.createCardElement({ type: 'entities', entities: [] });
      if (c && c.constructor && c.constructor.getConfigElement) await c.constructor.getConfigElement();
    } catch (e) { /* câmpurile devin text */ }
  }

  class EnergieCasaCardEditor extends HTMLElement {
    constructor() { super(); this._cfg = {}; this._hass = null; this._root = this.attachShadow({ mode: 'open' }); this._ready = false; this._rows = {}; this._last = ''; this._sent = []; this._found = ''; }
    L(en, ro) { return eccL(this._hass, en, ro); }
    setConfig(c) {
      const j = JSON.stringify(c || {});
      // HA trimite înapoi, asincron, config-ul emis: ignorăm orice config trimis de noi (nu doar ultimul), altfel ecoul vechi suprascrie ce ai scris
      if (j === this._last || this._sent.includes(j)) return;
      this._last = j; this._cfg = JSON.parse(j); this._rows = {}; this._init();
    }
    set hass(hass) { this._hass = hass; this._root.querySelectorAll('ha-form').forEach((f) => { f.hass = hass; }); }
    get hass() { return this._hass; }
    async _init() { if (!this._ready) { this._ready = true; await ensureHaParts(); } this._draw(); }
    _emit() {
      const j = JSON.stringify(this._cfg);
      if (j === this._last) return;
      this._last = j; this._sent.push(j); if (this._sent.length > 40) this._sent.shift();
      this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: JSON.parse(j) }, bubbles: true, composed: true }));
    }
    _form(schema, data, labels, onChange, helpers) {
      const f = document.createElement('ha-form');
      f.hass = this._hass; f.schema = schema; f.data = data;
      f.computeLabel = (s) => (labels && labels[s.name]) || s.name;
      f.computeHelper = (s) => (helpers && helpers[s.name]) || '';
      f.addEventListener('value-changed', (e) => { e.stopPropagation(); const v = e.detail.value || {}; f.data = v; onChange(v); });
      return f;
    }
    _obj(path, create) { let o = this._cfg; for (const p of path) { if (!o[p] || typeof o[p] !== 'object') { if (!create) return {}; o[p] = {}; } o = o[p]; } return o; }
    _set(path, key, v, keepFalse) {
      const o = this._obj(path, true);
      if (eccIsEmpty(v) && !(keepFalse && v === false)) delete o[key]; else o[key] = v;
      if (path.length && !Object.keys(o).length) delete this._obj(path.slice(0, -1), true)[path[path.length - 1]];
      this._emit();
    }
    _fields(title, hint, schema, labels, helpers, opts) {
      const o = opts || {}, keys = names(schema), keep = new Set(o.defTrue || []);
      const form = this._form(schema, pick(this._cfg, keys), labels, (v) => { for (const k of keys) this._set([], k, v[k], keep.has(k)); }, helpers);
      const body = [hint ? h('p', { class: 'hint', text: hint }) : null, form];
      if (o.collapsed) return h('details', { class: 'blk', open: keys.some((k) => !eccIsEmpty(this._cfg[k])) }, h('summary', { text: title }), body);
      return h('div', { class: 'blk' }, title ? h('h3', {}, title) : null, body);
    }
    /** Lista consumatorilor: rânduri cu ↑ ↓ ✕; rândul gol nu se scrie în config până nu are nume și senzor. */
    _consumers() {
      const c = this._cfg, L = (a, b) => this.L(a, b);
      if (!this._rows.consumers) this._rows.consumers = (Array.isArray(c.consumers) ? c.consumers : []).map((x) => ({ ...x }));
      const rows = this._rows.consumers, max = 12;
      const ready = (x) => !!(x && x.name && x.power);
      const save = () => { const arr = rows.filter(ready); if (arr.length) c.consumers = arr; else delete c.consumers; this._emit(); };
      const wrap = h('div', { class: 'blk' }, h('h3', {}, L('Consumers', 'Consumatori'), h('small', { text: rows.length + ' / ' + max })),
        h('p', { class: 'hint', text: L('Appliances measured separately (pool, EV, server…). What is not measured stays under “House”.', 'Aparate măsurate separat (piscină, mașină electrică, server…). Ce nu e măsurat rămâne la „Casă”.') }));
      rows.forEach((item, i) => {
        const move = (d) => () => { const j = i + d; if (j < 0 || j >= rows.length) return; [rows[i], rows[j]] = [rows[j], rows[i]]; save(); this._draw(); };
        const del = () => { rows.splice(i, 1); save(); this._draw(); };
        const sch = [grid({ name: 'name', selector: TXT }, { name: 'icon', selector: ICON }), { name: 'power', selector: SENSOR() }, { name: 'energy_today', selector: SENSOR() }, { name: 'group', selector: TXT }];
        const f = this._form(sch, pick(item, names(sch)), { name: L('Name', 'Nume'), icon: L('Icon', 'Iconiță'), power: L('Power sensor (W / kW)', 'Senzor de putere (W / kW)'), energy_today: L('Energy today (optional)', 'Energie azi (opțional)'), group: L('Group (optional)', 'Grup (opțional)') },
          (v) => { for (const k of names(sch)) { if (eccIsEmpty(v[k])) delete item[k]; else item[k] = v[k]; } save(); });
        wrap.append(h('div', { class: 'row' }, h('div', { class: 'bar' }, h('b', { text: item.name || L('Consumer', 'Consumator') + ' ' + (i + 1) }),
          h('button', { class: 'mini', type: 'button', 'aria-label': L('Move up', 'Mută în sus'), disabled: i === 0, onclick: move(-1), text: '↑' }),
          h('button', { class: 'mini', type: 'button', 'aria-label': L('Move down', 'Mută în jos'), disabled: i === rows.length - 1, onclick: move(1), text: '↓' }),
          h('button', { class: 'mini', type: 'button', 'aria-label': L('Delete', 'Șterge'), onclick: del, text: '✕' })), f));
      });
      if (rows.length < max) wrap.append(h('button', { class: 'add', type: 'button', onclick: () => { rows.push({}); this._draw(); }, text: '+ ' + L('Add consumer', 'Adaugă consumator') }));
      return wrap;
    }
    _auto() {
      const found = eccDetectSensors(this._hass), put = [];
      for (const [k, v] of Object.entries(found)) if (!this._cfg[k]) { this._cfg[k] = v; put.push(v); }
      this._found = put.length ? this.L('Filled in: ', 'Am completat: ') + put.join(', ') + this.L('. Check the signs in the preview.', '. Verifică semnele în previzualizare.') : this.L('No new sensors found. Pick them manually below.', 'Nu am găsit senzori noi. Alege-i manual mai jos.');
      this._emit(); this._draw();
    }
    _draw() {
      const L = (a, b) => this.L(a, b), c = this._cfg;
      const secLabel = { header: L('Header (house / solar / battery + clock)', 'Antet (casă / solar / baterie + ceas)'), tiles: L('Tiles', 'Plăcuțe'), graph: L('Graph (24 h / 7 days)', 'Grafic (24 h / 7 zile)'), flow: L('Flow diagram', 'Diagramă de flux'), consumers: L('Consumers', 'Consumatori'), battery: L('Battery panel', 'Panou baterie'), inverters: L('Inverters', 'Invertoare'), stats: L('Daily statistics', 'Statistici zilnice'), prices: L('Prices (editable)', 'Prețuri (editabile)'), compact: L('Compact flow', 'Flux compact'), compact_stats: L('Compact statistics', 'Statistici compacte') };
      const blocks = [
        h('div', { class: 'blk' }, h('h3', {}, L('Energy house card', 'Card energie casă')),
          h('button', { class: 'auto', type: 'button', onclick: () => this._auto() }, L('Detect sensors automatically', 'Detectează automat senzorii')), h('div', { class: 'found', text: this._found })),
        this._fields(L('What to show', 'Ce se afișează'), L('Pick sections in the order you want; none selected = the whole card. A narrow column works best with “Compact flow” + “Compact statistics”.', 'Alege secțiunile în ordinea dorită; nimic ales = tot cardul. Pe o coloană îngustă merg cel mai bine „Flux compact” + „Statistici compacte”.'),
          [{ name: 'sections', selector: SEL(ECC_SECTIONS.map((s) => ({ value: s, label: secLabel[s] })), true) }], { sections: L('Sections', 'Secțiuni') }),
        this._fields(L('Power sensors', 'Senzori de putere'), L('Instant power in W or kW. The grid can be one signed meter or two separate sensors.', 'Putere instantanee în W sau kW. Rețeaua poate fi un contor cu semn sau doi senzori separați.'),
          [{ name: 'pv_entity', selector: SENSOR() }, grid({ name: 'grid_entity', selector: SENSOR() }, { name: 'grid_invert', selector: BOOL }), grid({ name: 'import_entity', selector: SENSOR() }, { name: 'export_entity', selector: SENSOR() }), grid({ name: 'charge_entity', selector: SENSOR() }, { name: 'discharge_entity', selector: SENSOR() })],
          { pv_entity: L('Solar power', 'Putere solară'), grid_entity: L('Grid meter (signed)', 'Contor rețea (cu semn)'), grid_invert: L('Meter is + when exporting', 'Contorul e + la export'), import_entity: L('Grid import power', 'Putere import rețea'), export_entity: L('Grid export power', 'Putere export rețea'), charge_entity: L('Battery charge power', 'Putere încărcare baterie'), discharge_entity: L('Battery discharge power', 'Putere descărcare baterie') },
          { grid_entity: L('Use this OR the import + export pair below.', 'Folosește asta SAU perechea import + export de mai jos.') }),
        this._consumers(),
        this._fields(L('Battery', 'Baterie'), L('Charge level, capacity and the levels the inverter keeps for outages.', 'Nivel de încărcare, capacitate și pragurile păstrate pentru pană de curent.'),
          [{ name: 'soc_entity', selector: SENSOR() }, grid({ name: 'battery_capacity_entity', selector: SENSOR() }, { name: 'battery_capacity_kwh', selector: NUM(0, 1000, 0.1) }), grid({ name: 'battery_reserve_entity', selector: ENT() }, { name: 'battery_reserve_pct', selector: NUM(0, 90) }), grid({ name: 'battery_shutdown_entity', selector: ENT() }, { name: 'battery_shutdown_pct', selector: NUM(0, 90) }), { name: 'grid_present_entity', selector: ENT() }],
          { soc_entity: L('Charge level (%)', 'Nivel încărcare (%)'), battery_capacity_entity: L('Capacity sensor (kWh)', 'Senzor capacitate (kWh)'), battery_capacity_kwh: L('or capacity (kWh)', 'sau capacitate (kWh)'), battery_reserve_entity: L('Reserve level sensor', 'Senzor nivel rezervă'), battery_reserve_pct: L('or reserve (%)', 'sau rezervă (%)'), battery_shutdown_entity: L('Shutdown level sensor', 'Senzor prag oprire'), battery_shutdown_pct: L('or shutdown (%)', 'sau oprire (%)'), grid_present_entity: L('Grid present (on / off or voltage)', 'Rețea prezentă (on / off sau tensiune)') },
          { grid_present_entity: L('When it says the grid is gone, the card shows the backup runtime.', 'Când spune că rețeaua a căzut, cardul arată autonomia de backup.') }, { collapsed: true }),
        this._fields(L('Daily energy', 'Energie zilnică'), '', [grid({ name: 'pv_daily_entity', selector: SENSOR() }, { name: 'import_daily_entity', selector: SENSOR() }), grid({ name: 'export_daily_entity', selector: SENSOR() }, { name: 'import_monthly_entity', selector: SENSOR() }), grid({ name: 'bat_charge_daily_entity', selector: SENSOR() }, { name: 'bat_discharge_daily_entity', selector: SENSOR() }), { name: 'radiation_entity', selector: SENSOR() }],
          { pv_daily_entity: L('Solar production today', 'Producție solară azi'), import_daily_entity: L('Import today', 'Import azi'), export_daily_entity: L('Export today', 'Export azi'), import_monthly_entity: L('Import this month', 'Import luna aceasta'), bat_charge_daily_entity: L('Battery charged today', 'Baterie încărcată azi'), bat_discharge_daily_entity: L('Battery discharged today', 'Baterie descărcată azi'), radiation_entity: L('Solar radiation (optional)', 'Radiație solară (opțional)') }, null, { collapsed: true }),
        this._fields(L('Prices', 'Prețuri'), L('Two number helpers (input_number) with the price per kWh; the card lets you edit them.', 'Două helpere număr (input_number) cu prețul pe kWh; cardul le poate modifica.'),
          [grid({ name: 'tarif_entity', selector: ENT({ domain: 'input_number' }) }, { name: 'pret_export_entity', selector: ENT({ domain: 'input_number' }) })], { tarif_entity: L('Buy price (per kWh)', 'Preț cumpărare (pe kWh)'), pret_export_entity: L('Sell price (per kWh)', 'Preț vânzare (pe kWh)') }, null, { collapsed: true }),
        this._fields(L('Look', 'Aspect'), '', [grid({ name: 'style', selector: SEL(['cyber', 'glass']) }, { name: 'flow_style', selector: SEL(['open']) }), grid({ name: 'flow_layout', selector: SEL(['auto', 'vertical', 'horizontal']) }, { name: 'flow_shape', selector: SEL(['auto', 'square', 'wide']) }),
          grid({ name: 'accent_color', selector: TXT }, { name: 'card_background', selector: TXT }), { name: 'battery_color', selector: TXT },
          grid({ name: 'show_total', selector: BOOL }, { name: 'show_clock', selector: BOOL }), grid({ name: 'compact_extras', selector: BOOL }, { name: 'grid_info', selector: BOOL })],
          { style: L('Style', 'Stil'), flow_style: L('Flow style', 'Stil flux'), flow_layout: L('Flow layout', 'Aranjare flux'), flow_shape: L('Flow shape', 'Formă flux'), accent_color: L('Accent color (#rrggbb)', 'Culoare accent (#rrggbb)'), card_background: L('Card background (#rrggbb)', 'Fundal card (#rrggbb)'), battery_color: L('Battery color (#rrggbb)', 'Culoare baterie (#rrggbb)'), show_total: L('Show “Total”', 'Arată „Total”'), show_clock: L('Show the clock', 'Arată ceasul'), compact_extras: L('Radiation and daily production in the compact flow', 'Radiație și producție zilnică în fluxul compact'), grid_info: L('Grid import / export lines', 'Rânduri import / export rețea') },
          { flow_style: L('“open” = icons and values only, no boxes.', '„open” = doar iconițe și valori, fără casete.') }, { collapsed: true, defTrue: ['show_total', 'show_clock', 'grid_info'] }),
      ];
      const s = document.createElement('style'); s.textContent = CSS;
      this._root.replaceChildren(s, h('div', { class: 'ed' }, blocks));
    }
  }
  customElements.define('energie-casa-card-editor', EnergieCasaCardEditor);
}
eccDefineEditor();
