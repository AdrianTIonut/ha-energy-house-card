// energie-casa-card.js — asamblat automat din src/*.js (build.js). NU edita manual.

/* ===== icons.js ===== */
// src/icons.js — iconițe SVG (viewBox 32×32, doar căi, stroke) folosite de card și de diagrama de flux.
// Fără biblioteci. Culoarea o dă cel care desenează (stroke).
const ICON_SOLAR =
  '<circle cx="12" cy="8" r="3.5"/>' +
  '<path d="M12 1.5v2M12 12.5v2M5.5 8h2M16.5 8h2M7.4 3.4l1.4 1.4M16.6 3.4l-1.4 1.4M7.4 12.6l1.4-1.4M16.6 12.6l-1.4-1.4"/>' +
  '<path d="M5 29l4-11h20l-4 11z"/>' +
  '<path d="M7 23.5h20M15 18l-2 11M22 18l-2 11"/>';
const ICON_RETEA =
  '<path d="M16 2v3M13 5h6"/>' +
  '<path d="M14 5 9.5 30M18 5l4.5 25"/>' +
  '<path d="M6 11h20M8.5 18h15"/>' +
  '<path d="M11.2 18l9.6-7M20.8 18l-9.6-7M10.2 25l11.6-7M21.8 25 10.2 18"/>';
const ICON_BATERIE =
  '<rect x="8" y="6" width="16" height="23" rx="2.5"/>' +
  '<path d="M13 6V3h6v3"/>' +
  '<path d="M12 12h8M12 17h8M12 22h8"/>';
const ICON_CASA =
  '<path d="M3 16 16 5l13 11"/>' +
  '<path d="M7 14v15h18V14"/>' +
  '<path d="M13 29v-9h6v9"/>';
const ICON_PISCINA =
  '<path d="M10 4v13M20 4v13M10 8h10M10 13h10"/>' +
  '<path d="M3 21c3-3 5 3 8 0s5 3 8 0 5 3 8 0"/>' +
  '<path d="M3 27c3-3 5 3 8 0s5 3 8 0 5 3 8 0"/>';
const ICON_HALA =
  '<path d="M3 28V13l8 5v-5l8 5V8h5v20z"/>' +
  '<path d="M8 23h3M15 23h3M22 23h2"/>';
const ICON_PRIZA =
  '<path d="M11 3v6M21 3v6"/>' +
  '<path d="M7 9h18v4a9 9 0 0 1-18 0z"/>' +
  '<path d="M16 22v7"/>';
const ICON_MASINA =
  '<path d="M4 19l2.5-7h19L28 19"/>' +
  '<rect x="3" y="19" width="26" height="6" rx="2"/>' +
  '<path d="M8 25v3M24 25v3M8 22h.01M24 22h.01"/>';
const ICON_SPALAT =
  '<rect x="6" y="3" width="20" height="26" rx="2.5"/>' +
  '<circle cx="16" cy="18" r="6"/>' +
  '<path d="M6 9h20M10 6h.01M14 6h.01"/>';
const ICON_AER =
  '<path d="M16 3v26M5 9.5l22 13M5 22.5l22-13"/>' +
  '<path d="M12 5l4 3 4-3M12 27l4-3 4 3"/>';
const ICON_FRUNZA =
  '<path d="M6 26C6 12 14 6 27 5c0 13-6 21-19 21z"/>' +
  '<path d="M6 26 18 14"/>';
const ICON_MONEDE =
  '<ellipse cx="16" cy="8" rx="9" ry="4"/>' +
  '<path d="M7 8v6c0 2.2 4 4 9 4s9-1.8 9-4V8M7 14v6c0 2.2 4 4 9 4s9-1.8 9-4v-6"/>';
const ICON_SOARE =
  '<circle cx="16" cy="16" r="5"/>' +
  '<path d="M16 3v4M16 25v4M3 16h4M25 16h4M6.8 6.8l2.8 2.8M22.4 22.4l2.8 2.8M6.8 25.2l2.8-2.8M22.4 9.6l2.8-2.8"/>';

/** Iconiță potrivită după numele unei surse/destinații (fără diacritice, litere mici). */
function iconForName(name) {
  const n = String(name || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  if (n.startsWith('solar')) return ICON_SOLAR;
  if (n.startsWith('retea') || n.includes('grid')) return ICON_RETEA;
  if (n.startsWith('baterie') || n.includes('batt')) return ICON_BATERIE;
  if (n.startsWith('casa')) return ICON_CASA;
  if (n.includes('pisc')) return ICON_PISCINA;
  if (n.includes('hal')) return ICON_HALA;
  if (n.includes('spal') || n.includes('masina de s')) return ICON_SPALAT;
  if (n.includes('masina') || n.includes('auto') || /\bev\b/.test(n) || n.includes('incarc')) return ICON_MASINA;
  if (n.includes('aer') || n.includes('clima') || /\bac\b/.test(n)) return ICON_AER;
  return ICON_PRIZA;
}

// ---- iconițe suplimentare (fluxul compact, fără nume: iconița spune ce este) ----
const ICON_SERVER =
  '<rect x="5" y="5" width="22" height="9" rx="1.5"/><rect x="5" y="18" width="22" height="9" rx="1.5"/>' +
  '<path d="M9 9.5h.01M9 22.5h.01M14 9.5h9M14 22.5h9"/>';
const ICON_CALDURA =
  '<rect x="4" y="5" width="24" height="22" rx="2"/><circle cx="16" cy="16" r="6"/>' +
  '<path d="M16 10v12M10 16h12"/>';
const ICON_BEC =
  '<path d="M16 3a8 8 0 0 0-5 14.2V21h10v-3.8A8 8 0 0 0 16 3z"/><path d="M12 25h8M13.5 29h5"/>';
const ICON_TV =
  '<rect x="4" y="6" width="24" height="17" rx="2"/><path d="M11 27h10M16 23v4"/>';
const ICON_FRIGIDER =
  '<rect x="8" y="3" width="16" height="26" rx="2"/><path d="M8 14h16M12 8v3M12 18v5"/>';
const ICON_BOILER =
  '<rect x="9" y="4" width="14" height="24" rx="3"/><path d="M9 9h14M13 15h6M13 20h6"/>';
const ICON_VENTILATOR =
  '<circle cx="16" cy="16" r="2"/>' +
  '<path d="M16 14c-1-6 3-9 5-7s0 6-5 7M18 16c6-1 9 3 7 5s-6 0-7-5M16 18c1 6-3 9-5 7s0-6 5-7M14 16c-6 1-9-3-7-5s6 0 7 5"/>';
const ICON_FULGER = '<path d="M18 3 7 18h8l-2 11 12-16h-8z"/>';
const ICON_ALTELE = '<circle cx="7" cy="16" r="2"/><circle cx="16" cy="16" r="2"/><circle cx="25" cy="16" r="2"/>';

const MDI_ICONS = {
  'mdi:pool': ICON_PISCINA, 'mdi:ev-station': ICON_MASINA, 'mdi:car-electric': ICON_MASINA, 'mdi:car': ICON_MASINA,
  'mdi:washing-machine': ICON_SPALAT, 'mdi:tumble-dryer': ICON_SPALAT,
  'mdi:air-conditioner': ICON_AER, 'mdi:snowflake': ICON_AER,
  'mdi:server': ICON_SERVER, 'mdi:server-network': ICON_SERVER, 'mdi:desktop-tower': ICON_SERVER,
  'mdi:heat-pump': ICON_CALDURA, 'mdi:radiator': ICON_CALDURA,
  'mdi:factory': ICON_HALA, 'mdi:warehouse': ICON_HALA,
  'mdi:lightbulb': ICON_BEC, 'mdi:lightbulb-outline': ICON_BEC, 'mdi:lamp': ICON_BEC,
  'mdi:television': ICON_TV, 'mdi:fridge': ICON_FRIGIDER, 'mdi:fridge-outline': ICON_FRIGIDER,
  'mdi:water-boiler': ICON_BOILER, 'mdi:water-heater': ICON_BOILER,
  'mdi:fan': ICON_VENTILATOR, 'mdi:home': ICON_CASA, 'mdi:home-outline': ICON_CASA, 'mdi:flash': ICON_FULGER,
};
/** Iconița SVG potrivită unui nume `mdi:...` din config; null dacă nu o avem. */
function iconForMdi(mdi) {
  return MDI_ICONS[String(mdi || '').toLowerCase()] || null;
}
// producția pe zi: panou solar cu fulger
const ICON_PROD =
  '<path d="M3 29l4-10h22l-4 10z"/><path d="M5.5 24h21M13 19l-2 10M20 19l-2 10"/>' +
  '<path d="M11 2 5 12h5l-1.5 7 7-10h-5z"/>';


/* ===== calc.js ===== */
// src/calc.js — Funcții pure de calcul, fără DOM.
// Puteri in W, energii in kWh. Singura sursa de adevăr: formulele din PROMPT-AI-local.md.

/**
 * Citește o valoare numerică dintr-un state HA sau un număr direct.
 * Dacă unit_of_measurement === "kW", înmulțește cu 1000.
 * unavailable / unknown / NaN → { value: 0, missing: true }.
 * @param {object|number|string|null|undefined} x
 * @returns {{ value: number, missing: boolean }}
 */
function num(x) {
  if (x === null || x === undefined) return { value: 0, missing: true };
  if (typeof x === 'number') return { value: x, missing: Number.isNaN(x) };

  let raw, unit = '';
  if (typeof x === 'string') {
    raw = x;
  } else if (typeof x === 'object' && 'state' in x) {
    raw = x.state;
    unit = (x.attributes && x.attributes.unit_of_measurement) || '';
  } else {
    return { value: 0, missing: true };
  }

  if (raw === 'unavailable' || raw === 'unknown' || raw === '' ||
      raw === null || raw === undefined) {
    return { value: 0, missing: true };
  }

  const n = parseFloat(raw);
  if (Number.isNaN(n)) return { value: 0, missing: true };

  const value = (unit === 'kW') ? n * 1000 : n;
  return { value, missing: false };
}

/** HOUSE_W = PV + import − export + descărcare − încărcare, minim 0. */
function houseW(pvW, importW, exportW, dischargeW, chargeW) {
  const w = pvW + importW - exportW + dischargeW - chargeW;
  return Math.max(0, w);
}

/** HOUSE_KWH = prod + import − export − încărcare + descărcare (toate kWh). */
function houseKwh(pvKwh, importKwh, exportKwh, batChargeKwh, batDischargeKwh) {
  return pvKwh + importKwh - exportKwh - batChargeKwh + batDischargeKwh;
}

/** Autoconsum % = clamp((prod − export) / prod × 100, 0, 100). Null dacă prod === 0. */
function autoconsumPct(prodKwh, exportKwh) {
  if (prodKwh === 0) return null;
  return Math.max(0, Math.min(100, ((prodKwh - exportKwh) / prodKwh) * 100));
}

/** Autonomie % = clamp((house − import) / house × 100, 0, 100). Null dacă house === 0. */
function autonomiePct(houseKwh, importKwh) {
  if (houseKwh === 0) return null;
  return Math.max(0, Math.min(100, ((houseKwh - importKwh) / houseKwh) * 100));
}

/**
 * Economie lei = (prod − export) × tarif + export × pretExport.
 * @returns {number|null} null dacă tarif e necunoscut (null/undefined)
 */
function economieLei(prodKwh, exportKwh, tarif, pretExport) {
  if (tarif === null || tarif === undefined) return null;
  const pe = (pretExport === null || pretExport === undefined) ? 0 : pretExport;
  return (prodKwh - exportKwh) * tarif + exportKwh * pe;
}

/** BAT_KWH = capacitate × SOC / 100. */
function batKwh(capacityKwh, socPct) {
  if (capacityKwh === null || capacityKwh === undefined) return 0;
  return capacityKwh * socPct / 100;
}

/** BAT_ORE = batKwh / (dischargeW / 1000). Null dacă dischargeW ≤ 50. */
function batOre(batKwh, dischargeW) {
  if (dischargeW <= 50) return null;
  if (batKwh <= 0) return 0;
  return batKwh / (dischargeW / 1000);
}

/**
 * Citește toate entitățile din states și întoarce bundle-ul de valori calculate.
 * Entitățile implicite sunt cele din PROMPT; config poate suprascrie cu *_entity.
 * Fiecare intrare are și un flag *Missing (true când senzorul e unavailable/unknown/NaN)
 * — folosit de randare ca să afișeze „—" în loc de 0.
 * @param {object} states  – obiectul hass.states (entity_id → { state, attributes })
 * @param {object} config  – config-ul cardului
 * @returns {object} toate valorile calculate + flag-urile *Missing
 */
function calcAll(states, config) {
  config = config || {};
  const get = (id) => (id && states[id]) ? num(states[id]) : { value: 0, missing: true };

  // Pputeri instantanee (W)
  const pv         = get(config.pv_entity        || 'sensor.solar_total_power');
  let importW    = get(config.import_entity    || 'sensor.grid_import_power_w');
  let exportW    = get(config.export_entity    || 'sensor.grid_export_power_w');
  // rețea dintr-un SINGUR senzor cu semn (ex. contor Huawei): `grid_entity`; implicit + = import, cu `grid_invert: true` + = export
  if (config.grid_entity && states[config.grid_entity]) {
    const g = num(states[config.grid_entity]);
    const v = g.missing ? 0 : (config.grid_invert === true ? -g.value : g.value);
    importW = { value: Math.max(0, v), missing: g.missing };
    exportW = { value: Math.max(0, -v), missing: g.missing };
  }
  const chargeW    = get(config.charge_entity    || 'sensor.battery_charge_power');
  const dischargeW = get(config.discharge_entity || 'sensor.battery_discharge_power');

  // Energii zilnice (kWh)
  const pvKwh        = get(config.pv_daily_entity      || 'sensor.solar_total_daily');
  const importKwh    = get(config.import_daily_entity  || 'sensor.import_retea_zilnic_local');
  const exportKwh    = get(config.export_daily_entity  || 'sensor.export_retea_zilnic_local');
  const importMonth  = get(config.import_monthly_entity || 'sensor.import_retea_lunar_local');
  const batChargeKwh = get(config.bat_charge_daily_entity   || 'sensor.invertor_deye_today_battery_charge');
  const batDischKwh  = get(config.bat_discharge_daily_entity || 'sensor.invertor_deye_today_battery_discharge');

  // Baterie
  const soc    = get(config.soc_entity           || 'sensor.invertor_deye_battery');
  const capKwh = get(config.battery_capacity_entity || 'sensor.invertor_deye_battery_capacity');

  // Tarif (lei/kWh) – din helper, rezerva din config, altfel necunoscut
  let tarif = null;
  if (config.tarif_entity && states[config.tarif_entity]) {
    const t = num(states[config.tarif_entity]);
    if (!t.missing) tarif = t.value;
  }
  if (tarif === null && config.tarif_lei_kwh != null) tarif = config.tarif_lei_kwh;

  let pretExport = 0;
  if (config.pret_export_entity && states[config.pret_export_entity]) {
    const pe = num(states[config.pret_export_entity]);
    if (!pe.missing) pretExport = pe.value;
  }

  // Calculuri
  const hW   = houseW(pv.value, importW.value, exportW.value, dischargeW.value, chargeW.value);
  const hKwh = houseKwh(pvKwh.value, importKwh.value, exportKwh.value, batChargeKwh.value, batDischKwh.value);
  const bKwh = batKwh(capKwh.value, soc.value);

  return {
    pv: pv.value,             pvMissing: pv.missing,
    importW: importW.value,   importMissing: importW.missing,
    exportW: exportW.value,   exportMissing: exportW.missing,
    chargeW: chargeW.value,   chargeMissing: chargeW.missing,
    dischargeW: dischargeW.value, dischargeMissing: dischargeW.missing,
    pvKwh: pvKwh.value,       pvKwhMissing: pvKwh.missing,
    importKwh: importKwh.value,   importKwhMissing: importKwh.missing,
    exportKwh: exportKwh.value,   exportKwhMissing: exportKwh.missing,
    importMonthKwh: importMonth.value, importMonthKwhMissing: importMonth.missing,
    batChargeKwh: batChargeKwh.value,   batChargeKwhMissing: batChargeKwh.missing,
    batDischargeKwh: batDischKwh.value, batDischargeKwhMissing: batDischKwh.missing,
    houseW: hW,
    houseKwh: hKwh,
    autoconsumPct: autoconsumPct(pvKwh.value, exportKwh.value),
    autonomiePct:  autonomiePct(hKwh, importKwh.value),
    economieLei:   economieLei(pvKwh.value, exportKwh.value, tarif, pretExport),
    tarif,
    pretExport,
    soc: soc.value,           socMissing: soc.missing,
    capacityKwh: capKwh.value, capacityMissing: capKwh.missing,
    batteryKwh: bKwh,
    batteryOre: batOre(bKwh, dischargeW.value),
  };
}


/* ===== format.js ===== */
// src/format.js — Formatare valori pentru afișare. Fără DOM, fără dependențe.
// Convenție: zecimala cu virgulă, niciodată "1000 W" sau "1182,4 W".

/**
 * Trunchiază (nu rotunjește) o valoare la dp zecimale.
 * Se folosește la afișarea kW ca să nu „sărim" peste pragul de unitate
 * (ex: 9999 W / 1000 = 9,999 → 9,99 kW, nu 10,00 kW).
 * @param {number} v
 * @param {number} dp – numărul de zecimale
 * @returns {number}
 */
function trunc(v, dp) {
  const f = 10 ** dp;
  return Math.floor(v * f + 1e-9) / f;
}

/**
 * Formatează o putere (W sau kW). Unitatea se decide DUPĂ rotunjire la W întreg:
 *   r = |w| rotunjit la W întreg
 *   r < 1000     → "850 W" (întreg)
 *   1000 ≤ r < 10000 → "1,18 kW" (2 zecimale)
 *   r ≥ 10000    → "12,4 kW" (1 zecimală)
 * Capcane de prag: 999,5 W → "1,00 kW"; 999,4 W → "999 W";
 *                  9999,6 W → "10,0 kW"; 9999,4 W → "9,99 kW".
 * NaN / null → "—"
 * @param {number} w – puterea în W (poate fi negativă)
 * @returns {string}
 */
function fmtPower(w) {
  if (w === null || w === undefined || Number.isNaN(w)) return '—';
  const sign = w < 0 ? '\u2212' : '';
  const r = Math.round(Math.abs(w));      // rotunjire la W întreg (decide unitatea)
  if (r < 1000) return sign + r + ' W';
  const dp = (r < 10000) ? 2 : 1;
  const v = trunc(r / 1000, dp);
  return sign + v.toFixed(dp).replace('.', ',') + ' kW';
}

/**
 * Formatează o energie (kWh sau MWh). Unitatea se decide DUPĂ rotunjire la 2 zecimale:
 *   r = |kwh| rotunjit la 2 zecimale
 *   r < 1000  → "15,15 kWh"
 *   r ≥ 1000  → "1,24 MWh"
 * Capcană: 999,999 kWh → r=1000,00 → "1,00 MWh" (nu "999,99 kWh").
 * NaN / null → "—"
 * @param {number} kwh
 * @returns {string}
 */
function fmtEnergy(kwh) {
  if (kwh === null || kwh === undefined || Number.isNaN(kwh)) return '—';
  const sign = kwh < 0 ? '\u2212' : '';
  const a = Math.abs(kwh);
  const r = Math.round(a * 100) / 100;    // rotunjire la 2 zecimale (decide unitatea)
  if (r < 1000) return sign + a.toFixed(2).replace('.', ',') + ' kWh';
  return sign + (a / 1000).toFixed(2).replace('.', ',') + ' MWh';
}

/**
 * Formatare cu semn de direcție (convenția din IDEE-card-energie.md).
 * Semnul e parte a numărului (fără spațiu): "+192 W", "−1,18 kW".
 * Convenție: solar → '+', export → '+', încărcare → '+';
 *            import → '−', consum casă → '−', descărcare → '−'.
 * VALOAREA 0 nu primește semn: fmtSigned(0, …, '+') → "0 W", fmtSigned(0, …, '−') → "0 W".
 * @param {number} value  – valoarea (folosește magnitudinea)
 * @param {function} fmtFn – fmtPower sau fmtEnergy
 * @param {string} sign    – '+' | '\u2212' | '' (fără semn)
 * @returns {string}
 */
function fmtSigned(value, fmtFn, sign) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  const a = Math.abs(value);
  if (a === 0) return fmtFn(0);           // 0 fără semn, indiferent de `sign`
  return (sign || '') + fmtFn(a);
}

/**
 * Formatare generică pentru chip-urile „extras".
 * Depinde de unit_of_measurement:
 *   W/m² → întreg + " W/m²"
 *   lx   → întreg cu spațiu separator de mii + " lx"
 *   kWh / MWh → prin fmtEnergy
 *   W / kW    → prin fmtPower (kW se convertește la W)
 *   altă unitate → valoarea (max 2 zecimale, fără zerouri finale) + unitatea
 * @param {number} value
 * @param {string} unit – unit_of_measurement
 * @returns {string}
 */
function fmtExtra(value, unit) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  const u = (unit || '').trim();
  if (u === 'W/m\u00b2') return Math.round(value) + ' W/m\u00b2';
  if (u === 'lx') {
    // separator de mii cu spațiu: 12400 → "12 400"
    const s = Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u2009');
    return s + ' lx';
  }
  if (u === 'kWh' || u === 'MWh') return fmtEnergy(value);
  if (u === 'W' || u === 'kW') return fmtPower(u === 'kW' ? value * 1000 : value);
  // unitate necunoscută: afișăm valoarea + unitatea ca atare
  const str = parseFloat(value.toFixed(2)).toString().replace('.', ',');
  return u ? str + ' ' + u : str;
}

/**
 * Formatare procent: "31%" sau "—" dacă null/NaN.
 * @param {number|null} val
 * @returns {string}
 */
function fmtPct(val) {
  if (val === null || val === undefined || Number.isNaN(val)) return '—';
  return Math.round(val) + '%';
}

/**
 * Escape pentru inserare în HTML (text SAU atribute):
 * & < > " ' → entități. Folosit înainte de innerHTML pentru nume/icoane din config.
 * @param {string} s
 * @returns {string}
 */
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}


/* ===== flow.js ===== */
// src/flow.js — Alocare proporțională a fluxului de energie. Funcție pură, fără DOM.
// Metoda: fiecare sursă împarte puterea ei către toate destinațiile,
// în proporția cerută de ele (ca în Energy Dashboard HA).
// Este o estimare: contoarele nu pot spune fizic ce electron a ajuns unde.



// Perechi de alocare care NU au sens fizic și se exclud din diagramă:
//   import (sursa „rețea") → export (destinația „Rețea")  : importul nu se „exportează"
//   descărcare (sursa „baterie") → încărcare (destinația „Baterie") : bateria nu se autoîncarcă
// Puterea respectivă se redistribuie proporțional către restul de destinații ale sursei.
const EXCLUDED = [
  ['rețea',   'Rețea'],
  ['baterie', 'Baterie'],
];

function isExcluded(src, dst) {
  return EXCLUDED.some(([s, d]) => s === src && d === dst);
}

/**
 * Calculează alocarea proporțională sursă → destinație.
 *   alloc[sursă][destinație] = putere_sursă × putere_dest / total_dest_ale_sursei
 * unde total_dest_ale_sursei = suma puterilor destinațiilor PERMISE pentru acea sursă
 * (cu perechile din EXCLUDED excluse), astfel încât puterea sursei se redistribuie
 * proporțional către restul de destinații.
 * @param {object} sources      – { solar: W, rețea: W, baterie: W } (toate ≥ 0)
 * @param {object} destinations – { [nume]: W } (toate ≥ 0)
 * @returns {{ alloc: object, totalSources: number, totalDestinations: number, imbalance: number }}
 *   imbalance = totalSources − totalDestinations (W);
 *   dacă |imbalance| > 50 → cardul scrie „dezechilibru X W".
 */
function computeFlow(sources, destinations) {
  const totalSrc  = Object.values(sources).reduce((a, b) => a + b, 0);
  const totalDest = Object.values(destinations).reduce((a, b) => a + b, 0);
  const imbalance = totalSrc - totalDest;

  const alloc = {};
  for (const [src, srcW] of Object.entries(sources)) {
    alloc[src] = {};
    // suma destinațiilor permise pentru această sursă (fără perechile excluse)
    let denom = 0;
    for (const [dst, dstW] of Object.entries(destinations)) {
      if (!isExcluded(src, dst)) denom += dstW;
    }
    for (const [dst, dstW] of Object.entries(destinations)) {
      if (isExcluded(src, dst)) {
        alloc[src][dst] = 0;
      } else {
        alloc[src][dst] = (denom > 0) ? (srcW * dstW / denom) : 0;
      }
    }
  }

  return { alloc, totalSources: totalSrc, totalDestinations: totalDest, imbalance };
}

/**
 * Construiește sursele din bundle-ul calcAll().
 * @param {object} calc – rezultatul calcAll()
 * @returns {{ solar: number, rețea: number, baterie: number }} (W)
 */
function makeSources(calc) {
  return {
    solar:   Math.max(0, calc.pv),
    rețea:   Math.max(0, calc.importW),
    baterie: Math.max(0, calc.dischargeW),
  };
}

/**
 * Construiește destinațiile din calcAll() + consumatorii din config.
 * Destinații: fiecare consumator din config, Casă (rest necontorizat),
 * Baterie (încărcare), Rețea (export).
 * @param {object} calc   – rezultatul calcAll()
 * @param {object} config – config card (consumers[])
 * @param {object} states – hass.states
 * @returns {object} { [nume]: W }
 */
function makeDestinations(calc, config, states) {
  config = config || {};
  const dest = {};
  let sumConsumers = 0;

  // Consumatorii din config (power în W sau kW – num() convertește)
  if (Array.isArray(config.consumers)) {
    for (const c of config.consumers) {
      if (!c || !c.power || !c.name) continue;
      const st = states[c.power];
      if (!st) continue;
      const { value, missing } = num(st);
      if (missing) continue;
      const w = Math.max(0, value);
      dest[c.name] = w;
      sumConsumers += w;
    }
  }

  // Casă = restul necontorizat (HOUSE_W − suma consumatorilor, min 0)
  dest['Cas\u0103'] = Math.max(0, calc.houseW - sumConsumers);

  // Baterie (încărcare)
  dest['Baterie'] = Math.max(0, calc.chargeW);

  // Rețea (export)
  dest['Re\u021bea'] = Math.max(0, calc.exportW);

  return dest;
}


/* ===== flow-svg.js ===== */
// src/flow-svg.js — Diagrama de distribuție a fluxului de energie (SVG). Funcție PURE, fără DOM.
// Folosesc computeFlow() din flow.js pentru alocare; aici doar desenez.
// Surse în stânga, destinații în dreapta, benzi curbate (cubic bezier), grosime ∝ putere.
// Text ≥ 16, fără NaN, titlu „estimat”. Benzi sub 1% din total → omise (agregate):
// nici banda, nici blocul/eticheta sursei-destinației nu apar dacă toate benzile ei sunt sub prag.



// Culori per sursă (neon, cyber). Numele din computeFlow(): solar / rețea / baterie.
const SRC_COLOR = { solar: '#00e5ff', 're\u021bea': '#ff00ea', 'retea': '#ff00ea', baterie: '#ffe066' };
const srcColor = (s) => SRC_COLOR[s] || SRC_COLOR[String(s).toLowerCase()] || '#00e5ff';

// (P3) culorile cerute explicit pentru hub: benzile sursă→nod în culoarea sursei,
// benzile nod→destinație în culoarea destinației.
const HUB_SRC_COLOR = { solar: '#19e6ff', 're\u021bea': '#ff3df0', 'retea': '#ff3df0', baterie: '#7dff3a' };
const HUB_DST_COLOR = {
  'Cas\u0103': '#ccffff', 'Baterie': '#7dff3a', 'Re\u021bea': '#ff3df0', 'Re\u0219ea': '#ff3df0',
  'Piscin\u0103': '#ffd23a', 'Hal\u0103': '#ff9a3a', 'Altele': '#c58aff',
};
const hubColor = (name, kind) =>
  (kind === 'src' ? HUB_SRC_COLOR[name] : HUB_DST_COLOR[name]) ||
  (kind === 'src' ? srcColor(name) : '#00e5ff');

/**
 * Construiește SVG-ul diagramii de flux.
 * @param {object} flow   – rezultatul computeFlow(): { alloc, totalSources, totalDestinations, imbalance }
 *   alloc = { [sursă]: { [destinație]: W } } (toate ≥ 0)
 * @param {object} opts   – { width?, height?, title?, style?, selected? } opțional
 *   style: 'hub' (implicit P3) | 'ribbons' (desenul original, neschimbat).
 *   selected: numele unei destinații (P4) → benzile ei la opacitate 1, celelalte la 0.25.
 * @returns {string} SVG (sau un div „fără flux” dacă total < 50 W)
 */
function buildFlowSVG(flow, opts) {
  opts = opts || {};
  const total = Math.max(0, flow ? flow.totalSources : 0);
  // total < 50 W → „fără flux” (același text ca înainte, pentru ambele stiluri)
  if (total < 50) return '<div class="flow-empty">f\u0103r\u0103 flux</div>';
  // (P3) hub = stilul implicit nou; 'ribbons' = desenul original, neschimbat
  if ((opts.style || 'hub') === 'hub') return buildHubSVG(flow, opts);
  return buildRibbonSVG(flow, opts);
}
// Desenul original (ribbons) — corporatura a rămas identică, doar a schimbat numele.
function buildRibbonSVG(flow, opts) {
  opts = opts || {};
  const W = opts.width || 800, H = opts.height || 260;
  const alloc = (flow && flow.alloc) || {};
  const total = Math.max(0, flow ? flow.totalSources : 0);

  // total < 50 W → „fără flux”
  if (total < 50) return '<div class="flow-empty">f\u0103r\u0103 flux</div>';


  // (1) benzile VIZIBILE: alloc > 0 și ≥ 1% din total. Restul se agregă (omise).
  const visible = [];   // [{ s, d, v }]
  for (const s of Object.keys(alloc)) {
    for (const d of Object.keys(alloc[s] || {})) {
      const v = alloc[s][d] || 0;
      if (v > 0 && v >= 0.01 * total) visible.push({ s, d, v });
    }
  }
  // totaluri pe sursă / destinație, doar din benzile vizibile
  const srcTotal = {}, dstTotal = {};
  for (const { s, d, v } of visible) {
    srcTotal[s] = (srcTotal[s] || 0) + v;
    dstTotal[d] = (dstTotal[d] || 0) + v;
  }
  const srcs = Object.entries(srcTotal).sort((a, b) => b[1] - a[1]);
  const dsts = Object.entries(dstTotal).sort((a, b) => b[1] - a[1]);
  if (!srcs.length || !dsts.length) return '<div class="flow-empty">f\u0103r\u0103 flux</div>';

  // (2) geometrie: stânga (surse), dreapta (destinații)
  const PAD = { l: 130, r: 130, t: 44, b: 44 };
  const maxThick = 24;   // grosime maximă bandă (din prompt)
  const minThick = 2;    // grosime minimă bandă (din prompt)
  const srcX = PAD.l, dstX = W - PAD.r;

  // alocare verticală: fiecare sursă/destinație primește o „colană” de înălțime ∝ total, cu spațiere
  function stack(items, x) {
    const gap = 16;
    const sum = items.reduce((a, [, v]) => a + v, 0);
    const avail = Math.max(1, H - PAD.t - PAD.b - gap * (items.length - 1));
    const scale = avail / sum;
    let y = PAD.t;
    const out = [];
    for (const [name, v] of items) {
      const h = Math.max(16, v * scale);
      out.push({ name, total: v, y, h, x });
      y += h + gap;
    }
    return out;
  }
  const srcBlocks = stack(srcs, srcX);
  const dstBlocks = stack(dsts, dstX);
  const srcBy = {}, dstBy = {};
  for (const b of srcBlocks) srcBy[b.name] = b;
  for (const b of dstBlocks) dstBy[b.name] = b;

  const srcMax = Math.max(...srcs.map(([, v]) => v));

  // (3) benzi: pentru fiecare pereche vizibilă, grosime ∝ v, clamped la [min,max]
  //     grosimea nu depășește înălțimea sursei sau a destinației (ca să încapă în „colană”)
  let paths = '', labels = '';
  const perSrc = {}, perDst = {};
  // ordonez benzile după sursă (apoi destinație) ca să stivuiască frumos
  const order = [...visible].sort((a, b) => (srcBy[a.s].y - srcBy[b.s].y) || (dstBy[a.d].y - dstBy[b.d].y));
  for (const { s, d, v } of order) {
    const sb = srcBy[s], db = dstBy[d];
    const bySrc = sb.h * (v / sb.total);
    const byDst = db.h * (v / db.total);
    const t = Math.max(minThick, Math.min(maxThick, bySrc, byDst));
    const cy1 = (sb.y + (perSrc[s] || 0)) + t / 2;
    const cy2 = (db.y + (perDst[d] || 0)) + t / 2;
    const col = srcColor(s);
    const opacity = (0.28 + 0.42 * (v / srcMax)).toFixed(2);
    const cx = (srcX + dstX) / 2;
    const dd = `M${srcX},${cy1.toFixed(1)} C ${cx.toFixed(1)},${cy1.toFixed(1)} ${cx.toFixed(1)},${cy2.toFixed(1)} ${dstX},${cy2.toFixed(1)}`;
    paths += `<path d="${dd}" fill="none" stroke="${col}" stroke-width="${t.toFixed(1)}" stroke-opacity="${opacity}" stroke-linecap="round"/>`;
    perSrc[s] = (perSrc[s] || 0) + t;
    perDst[d] = (perDst[d] || 0) + t;
    // etichetă pe bandă doar dacă banda e suficient de groasă (ca să nu se suprapună)
    if (t >= 6) {
      const my = (cy1 + cy2) / 2;
      const txt = esc(s) + ' \u2192 ' + esc(d) + ' ' + fmtPower(v);
      labels += `<text x="${cx.toFixed(1)}" y="${(my + 5).toFixed(1)}" fill="#cfe" font-size="16" text-anchor="middle">${txt}</text>`;
    }
  }

  // (4) etichete surse (stânga) + destinații (dreapta)
  let srcLabels = '', dstLabels = '';
  for (const sb of srcBlocks) {
    const col = srcColor(sb.name);
    srcLabels += `<rect x="${srcX - 6}" y="${sb.y.toFixed(1)}" width="6" height="${sb.h.toFixed(1)}" fill="${col}"/>`;
    srcLabels += `<text x="${(srcX - 10).toFixed(1)}" y="${(sb.y + sb.h / 2 - 2).toFixed(1)}" fill="#cfe" font-size="16" text-anchor="end">${esc(sb.name)}</text>`;
    srcLabels += `<text x="${(srcX - 10).toFixed(1)}" y="${(sb.y + sb.h / 2 + 18).toFixed(1)}" fill="${col}" font-size="16" text-anchor="end">${fmtPower(sb.total)}</text>`;
  }
  for (const db of dstBlocks) {
    dstLabels += `<rect x="${dstX}" y="${db.y.toFixed(1)}" width="6" height="${db.h.toFixed(1)}" fill="#00e5ff"/>`;
    dstLabels += `<text x="${(dstX + 10).toFixed(1)}" y="${(db.y + db.h / 2 - 2).toFixed(1)}" fill="#cfe" font-size="16" text-anchor="start">${esc(db.name)}</text>`;
    dstLabels += `<text x="${(dstX + 10).toFixed(1)}" y="${(db.y + db.h / 2 + 18).toFixed(1)}" fill="#00e5ff" font-size="16" text-anchor="start">${fmtPower(db.total)}</text>`;
  }

  // (5) titlu „estimat” + dezechilibru > 50 W
  const title = opts.title || 'flux de energie (estimat)';
  const imb = (flow && flow.imbalance) || 0;
  let foot = `<text x="${(W / 2).toFixed(1)}" y="22" fill="#7fd" font-size="16" text-anchor="middle">${esc(title)}</text>`;
  if (Math.abs(imb) > 50) {
    foot += `<text x="${(W / 2).toFixed(1)}" y="${H - 8}" fill="#ff00ea" font-size="16" text-anchor="middle">dezechilibru ${fmtPower(imb)}</text>`;
  }

  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;">
${foot}
${srcLabels}${dstLabels}
${paths}${labels}
</svg>`;
}

// (P3) Diagramă cu NOD CENTRAL. Surse în stânga, destinații în dreapta, un nod
// central (dreptunghi cu colțuri tăiate + glow) care afișează TOTALUL surselor.
// Alocarea sursă→destinație vine din computeFlow() (ne-rescrisă); aici doar desenez.
//   banda sursă→nod: culoarea SURSEI, grosime ∝ totalul sursei;
//   banda nod→destinație: culoarea DESTINAȚIEI, grosime ∝ totalul destinației;
//   benzi sub 1% din total → omise; total < 50 W → „fără flux” (în buildFlowSVG).
//   nodul arată „dezechilibru X W” doar dacă |surse − destinații| > 50 W.
// (P4) opts.selected = nume destinație: benzile ei la opacitate 1, celelalte la 0.25;
//      etichetele destinațiilor sunt butoane (data-flow-dst) cu țintă ≥ 48 px.
function buildHubSVG(flow, opts) {
  const W = opts.width || 800;
  const alloc = (flow && flow.alloc) || {};
  const total = Math.max(0, flow.totalSources);
  const selected = opts.selected || null;

  // totaluri pe sursă / destinație (toate alocările, apoi filtru la 1%)
  const srcTotal = {}, dstTotal = {};
  for (const s of Object.keys(alloc)) {
    for (const d of Object.keys(alloc[s] || {})) {
      const v = alloc[s][d] || 0;
      if (v <= 0) continue;
      srcTotal[s] = (srcTotal[s] || 0) + v;
      dstTotal[d] = (dstTotal[d] || 0) + v;
    }
  }
  // doar sursele / destinațiile cu ≥ 1% din total apar în diagramă
  const srcs = Object.entries(srcTotal).filter(([, v]) => v >= 0.01 * total);
  const dsts = Object.entries(dstTotal).filter(([, v]) => v >= 0.01 * total);
  if (!srcs.length || !dsts.length) return '<div class="flow-empty">f\u0103r\u0103 flux</div>';
  const H = opts.height || Math.max(230, 84 + 72 * Math.max(srcs.length, dsts.length));

  // geometrie: nodul central, surse stânga, destinații dreapta
  const narrow = W < 640;                       // card îngust: cutii și nod mai mici, text tot ≥ 16
  const nodeW = narrow ? 100 : 164, nodeH = narrow ? 84 : 92;
  const nx0 = (W - nodeW) / 2, nx1 = nx0 + nodeW;
  const ny0 = (H - nodeH) / 2, ny1 = ny0 + nodeH;
  const boxW = narrow ? 128 : 200, srcX = 6 + boxW, dstX = W - 6 - boxW;      // x-ul de unde pleacă benzile
  const maxThick = 24, minThick = 7;   // grosime ∝ putere, clamped (ca la ribbons)
  const srcSum = srcs.reduce((a, [, v]) => a + v, 0);
  const dstSum = dsts.reduce((a, [, v]) => a + v, 0);
  const maxV = Math.max(...srcs.map(([, v]) => v), ...dsts.map(([, v]) => v));

  // așez vertical: fiecare sursă/destinație = un punct centrat pe o coloană
  function rowY(items) {
    const top = 48, bottom = H - 12, step = (bottom - top) / items.length;
    const out = {};
    items.forEach(([name], i) => { out[name] = { y: top + step * (i + 0.5), h: 60 }; });
    return out;
  }
  const srcAt = rowY(srcs);
  const dstAt = rowY(dsts);

  // puncte de atașare pe muchia stângă / dreaptă a nodului (stivuite pe total)
  function edgeAt(items, sum, y0, y1) {
    const gap = 8;
    const span = (y1 - y0) - gap * (items.length - 1);
    let y = y0 + gap;
    const out = {};
    for (const [name, v] of items) {
      const h = Math.max(10, (span * v) / (sum || 1));
      out[name] = y + h / 2;
      y += h + gap;
    }
    return out;
  }
  const srcEdge = edgeAt(srcs, srcSum, ny0 + 6, ny1 - 6);
  const dstEdge = edgeAt(dsts, dstSum, ny0 + 6, ny1 - 6);

  const thick = (v) => Math.max(minThick, Math.min(maxThick, (maxV > 0 ? v / maxV : 0) * maxThick));
  // opacitate banda în funcție de selecția P4: banda „evidențiată" = 1, restul 0.25
  const bandOp = (d, isDst) => (selected == null) ? '' : (isDst && d === selected) ? '1' : '0.25';

  // puncte de lumină care curg pe bandă (CSS offset-path; oprite la prefers-reduced-motion)
  const dots = (d) => {
    let o = '';
    for (let k = 0; k < 2; k++) {
      o += '<circle class="flow-dot" r="4.5" cx="0" cy="0" fill="#fff" style="offset-path:path(\'' + d +
        '\');animation-delay:-' + (k * 1.4).toFixed(1) + 's"/>';
    }
    return o;
  };
  let paths = '', labels = '';
  const nodeMidY = (ny0 + ny1) / 2;
  // Caz degenerat: o singură sursă și o singură destinație → o singură bandă
  // dreaptă prin nod (corespunde așteptărilor testelor existente: 1 path pe flux).
  if (srcs.length === 1 && dsts.length === 1) {
    const s = srcs[0][0], d = dsts[0][0];
    const v = alloc[s][d] || 0;
    const t = thick(v);
    const col = hubColor(s, 'src');
    const y2 = dstAt[d].y;
    const op = bandOp(d, true);
    const dimAttr = op ? ' stroke-opacity="' + op + '"' : '';
    paths += '<path class="flow-band" data-flow-src="' + esc(s) + '" data-flow-dst="' + esc(d) + '" ' +
      'd="M' + srcX + ',' + nodeMidY.toFixed(1) + ' H' + dstX + '" fill="none" ' +
      'stroke="' + col + '" stroke-width="' + t.toFixed(1) + '"' + dimAttr + ' stroke-linecap="round"/>';
    paths += dots('M' + srcX + ',' + nodeMidY.toFixed(1) + ' H' + dstX); // (etichetele sursei/destinației se desenează mai jos)
  } else {
  // banda sursă→nod: culoarea sursei
  for (const [s, v] of srcs) {
    const t = thick(v);
    const y1 = srcAt[s].y, y2 = srcEdge[s];
    const col = hubColor(s, 'src');
    const op = bandOp(s, false);
    const dimAttr = op ? ' stroke-opacity="' + op + '"' : '';
    const cx = (srcX + nx0) / 2;
    paths += '<path class="flow-band" data-flow-src="' + esc(s) + '" ' +
      'd="M' + srcX + ',' + y1.toFixed(1) + ' C ' + cx.toFixed(1) + ',' + y1.toFixed(1) + ' ' +
      cx.toFixed(1) + ',' + y2.toFixed(1) + ' ' + nx0 + ',' + y2.toFixed(1) + '" fill="none" ' +
      'stroke="' + col + '" stroke-width="' + t.toFixed(1) + '"' + dimAttr + ' stroke-linecap="round"/>';
    paths += dots('M' + srcX + ',' + y1.toFixed(1) + ' C ' + cx.toFixed(1) + ',' + y1.toFixed(1) + ' ' +
      cx.toFixed(1) + ',' + y2.toFixed(1) + ' ' + nx0 + ',' + y2.toFixed(1));
  }
  // banda nod→destinație: culoarea destinației
  for (const [d, v] of dsts) {
    const t = thick(v);
    const y1 = dstEdge[d], y2 = dstAt[d].y;
    const col = hubColor(d, 'dst');
    const op = bandOp(d, true);
    const dimAttr = op ? ' stroke-opacity="' + op + '"' : '';
    const cx = (nx1 + dstX) / 2;
    paths += '<path class="flow-band" data-flow-dst="' + esc(d) + '" ' +
      'd="M' + nx1 + ',' + y1.toFixed(1) + ' C ' + cx.toFixed(1) + ',' + y1.toFixed(1) + ' ' +
      cx.toFixed(1) + ',' + y2.toFixed(1) + ' ' + dstX + ',' + y2.toFixed(1) + '" fill="none" ' +
      'stroke="' + col + '" stroke-width="' + t.toFixed(1) + '"' + dimAttr + ' stroke-linecap="round"/>';
    paths += dots('M' + nx1 + ',' + y1.toFixed(1) + ' C ' + cx.toFixed(1) + ',' + y1.toFixed(1) + ' ' +
      cx.toFixed(1) + ',' + y2.toFixed(1) + ' ' + dstX + ',' + y2.toFixed(1));
  }
  } // încheiere caz multiplu (else)

  // nod central: dreptunghi cu colțuri tăiate (polyline) + glow, TOTALUL surselor
  const cut = 12;
  const nodeShape =
    '<polygon class="flow-node" points="' +
    (nx0 + cut) + ',' + ny0 + ' ' + nx1 + ',' + ny0 + ' ' +
    (nx1) + ',' + (ny1 - cut) + ' ' + (nx1 - cut) + ',' + ny1 + ' ' +
    nx0 + ',' + (ny1 - cut) + ' ' + nx0 + ',' + ny0 + '" ' +
    'fill="#071624" stroke="#19e6ff" stroke-width="2"/>';
  const totalTxt = '<text x="' + (W / 2).toFixed(1) + '" y="' + (nodeMidY - 10).toFixed(1) +
    '" fill="#19e6ff" font-size="16" letter-spacing="2" text-anchor="middle">TOTAL</text>';
  const totalVal = '<text x="' + (W / 2).toFixed(1) + '" y="' + (nodeMidY + 22).toFixed(1) +
    '" fill="#fff" font-size="' + (narrow ? 24 : 30) + '" font-weight="bold" text-anchor="middle">' + fmtPower(total) + '</text>';
  // dezechilibru: discret, DOAR dacă |surse − destinații| > 50 W
  const imb = (flow.imbalance != null) ? flow.imbalance : (flow.totalSources - (flow.totalDestinations || 0));
  let imbTxt = '';
  if (Math.abs(imb) > 50) {
    imbTxt = '<text x="' + (W / 2).toFixed(1) + '" y="' + (ny1 + 22).toFixed(1) +
      '" fill="#ff3df0" font-size="16" text-anchor="middle">dezechilibru ' + fmtPower(Math.round(imb)) + '</text>';
  }
  labels += nodeShape + totalTxt + totalVal + imbTxt;

  const cut12 = (t) => { t = String(t); return t.length > (narrow ? 9 : 14) ? t.slice(0, narrow ? 8 : 13) + '…' : t; };
  const cap = (t) => { t = String(t); return t.charAt(0).toUpperCase() + t.slice(1); };
  // cutie cu iconiță + nume + valoare (surse stânga, destinații dreapta)
  const mkBox = (x, yc, name, v, col, isDst, op) =>
    '<g' + (isDst ? ' class="flow-dst" data-flow-dst="' + esc(name) + '" style="cursor:pointer"' : '') +
    (op !== '1' ? ' opacity="' + op + '"' : '') + '>' +
    '<rect class="flow-box" x="' + x + '" y="' + (yc - 30).toFixed(1) + '" width="' + boxW +
    '" height="60" rx="12" fill="#06121c" stroke="' + col + '" stroke-width="2"/>' +
    '<g transform="translate(' + (x + (narrow ? 8 : 12)) + ',' + (yc - (narrow ? 14 : 18)).toFixed(1) + ') scale(' + (narrow ? 0.875 : 1.125) + ')" fill="none" stroke="' + col +
    '" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + iconForName(name) + '</g>' +
    '<text x="' + (x + (narrow ? 42 : 60)) + '" y="' + (yc - 4).toFixed(1) + '" fill="#e8fbff" font-size="' + (narrow ? 16 : 17) + '" font-weight="bold">' +
      esc(cut12(cap(name))) + '</text>' +
    '<text x="' + (x + (narrow ? 42 : 60)) + '" y="' + (yc + (narrow ? 18 : 20)).toFixed(1) + '" fill="' + col + '" font-size="' + (narrow ? 16 : 20) + '" font-weight="bold">' +
      fmtPower(v) + '</text></g>';
  for (const [s2, v] of srcs) labels += mkBox(6, srcAt[s2].y, s2, v, hubColor(s2, 'src'), false, '1');
  for (const [d, v] of dsts) {
    const boxOp = (selected == null || selected === d) ? '1' : '0.35';
    labels += mkBox(dstX, dstAt[d].y, d, v, hubColor(d, 'dst'), true, boxOp);
  }

  // titlu „estimat” (ca la ribbons) deasupra
  const title = opts.title || 'flux de energie (estimat)';
  const foot = '<text x="' + (W / 2).toFixed(1) + '" y="22" fill="#7fd" font-size="18" text-anchor="middle">' +
    esc(title) + '</text>';

  return '<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" ' +
    'style="width:100%;height:auto;">' +
    foot + paths + labels + '</svg>';
}

// ---------------------------------------------------------------------------
// Fluxul COMPACT, fără nume: doar iconițe, flux și valori (W/kW). Aranjare verticală la orice lățime.
//   rând sus   : Solar · Rețea · Baterie (fixe; rețeaua și bateria merg în ambele sensuri)
//   mijloc     : nod cu totalul
//   rând jos   : consumatorii (Casă fixă la mijloc; max 3; restul → „Altele”)
// IMPORT = ROȘU (rețea → nod → destinațiile alimentate din import); EXPORT = VERDE (nod → rețea, în sus).
// Panglici ca în poza de referință: halou larg translucid + corp + miez luminos + sclipiri + săgeți în sensul fluxului.
// flow = computeFlow(); info = { texts:{solar,grid,battery}, dir:{grid,battery}, soc, entities:{…}, dim:{…}, icons:{nume:mdi}, colors:{…} }
// ---------------------------------------------------------------------------
function buildCompactSVG(flow, info, opts) {
  opts = opts || {};
  info = info || {};
  const texts = info.texts || {}, ents = info.entities || {}, dirs = info.dir || {};
  const iconsCfg = info.icons || {};
  const colors = Object.assign({ solar: '#ffa726', importGrid: '#ff4d5e', exportGrid: '#3dff9a', battery: '#7dff3a', house: '#ccffff', other: '#19e6ff', more: '#c58aff', own: '#ffa726' }, info.colors || {});
  const W = opts.width || 336;
  const small = W < 420;
  const M = small
    ? { bh: 22, vg: 30, nodeH: 22, fv: 11, ico: 12, cut: 5, pad: 4, gap: 5, nfv: 12 }
    : { bh: 42, vg: 48, nodeH: 30, fv: 17, ico: 24, cut: 9, pad: 6, gap: 8, nfv: 18 };
  const alloc = (flow && flow.alloc) || {};
  const total = Math.max(0, (flow && flow.totalSources) || 0);

  const srcTotal = {}, dstTotal = {};
  for (const s of Object.keys(alloc)) {
    for (const d of Object.keys(alloc[s] || {})) {
      const v = alloc[s][d] || 0;
      if (v <= 0) continue;
      srcTotal[s] = (srcTotal[s] || 0) + v;
      dstTotal[d] = (dstTotal[d] || 0) + v;
    }
  }
  const R = 'rețea', houseName = 'Casă';
  const solarV = srcTotal.solar || 0;
  const gridImp = srcTotal[R] || 0, gridExp = dstTotal['Rețea'] || 0;
  const batDis = srcTotal.baterie || 0, batChg = dstTotal['Baterie'] || 0;

  // ---- dimensiuni casete: se strâng pe conținut (iconiță + număr), centrate pe slotul lor ----
  const CH = { d: 0.6, c: 0.3, s: 0.3, p: 0.6, m: 0.6, k: 0.58, W: 0.95, x: 0.9, o: 0.6 };   // lățimi aproximative (em), generoase
  const estW = (txt, fs) => {
    let w = 0;
    for (const ch of String(txt)) {
      w += /[0-9]/.test(ch) ? CH.d : (ch === ',' || ch === '.') ? CH.c : ch === ' ' ? CH.s : ch === '+' ? CH.p :
        (ch === '−' || ch === '-') ? CH.m : ch === 'k' ? CH.k : ch === 'W' ? CH.W : ch === '—' ? CH.x : CH.o;
    }
    return w * fs;
  };
  const padX = small ? 6 : 11, gapIT = small ? 4 : 8, subFs = small ? 8 : 11;
  const fitW = (txt, sub) => Math.ceil(2 * padX + M.ico + gapIT + estW(txt, M.fv) + (sub ? estW(sub, subFs) + 4 : 0) + 4);

  // consumatori (jos): Casă fixă la mijloc; consumatorii alternativ stânga/dreapta (după putere), câți încap pe un rând;
  // restul se adună în „Altele”. Rețeaua/bateria nu apar aici (sunt sus).
  const houseV = dstTotal[houseName] || 0;
  const others = Object.entries(dstTotal)
    .filter(([n, v]) => n !== houseName && n !== 'Rețea' && n !== 'Baterie' && total > 0 && v >= 0.01 * total)
    .sort((a, b) => b[1] - a[1]);
  const gapB = M.gap;
  const layoutBottom = (maxVis) => {
    const vis = others.slice(0, maxVis), extra = others.slice(maxVis);
    const items = vis.map(([name, v]) => ({ name, v }));
    if (extra.length) items.push({ name: 'Altele', v: extra.reduce((a, [, v]) => a + v, 0), members: extra.map(([n]) => n) });
    const house = { name: houseName, v: houseV, w: fitW(fmtPower(houseV)), cx: W / 2 };
    const lefts = [], rights = [];
    items.forEach((it, i) => { it.w = fitW(fmtPower(it.v)); (i % 2 === 0 ? lefts : rights).push(it); });
    let edgeL = W / 2 - house.w / 2 - gapB;
    for (const it of lefts) { it.cx = edgeL - it.w / 2; edgeL -= it.w + gapB; }
    let edgeR = W / 2 + house.w / 2 + gapB;
    for (const it of rights) { it.cx = edgeR + it.w / 2; edgeR += it.w + gapB; }
    const all = [...lefts, house, ...rights].sort((a, b) => a.cx - b.cx);
    return { boxes: all, minX: Math.min(...all.map((b) => b.cx - b.w / 2)), maxX: Math.max(...all.map((b) => b.cx + b.w / 2)) };
  };
  let layout = null;
  for (let mv = others.length <= 4 ? others.length : 3; mv >= 0; mv--) {
    const L = layoutBottom(mv);
    if (L.minX >= M.pad - 0.5 && L.maxX <= W - M.pad + 0.5) { layout = L; break; }
  }
  if (!layout) layout = layoutBottom(0);
  const dsts = layout.boxes.map((b) => [b.name, b.v]);
  const altMembers = ((layout.boxes.find((b) => b.name === 'Altele') || {}).members) || [];
  // cât din fiecare destinație vine din IMPORT (se colorează roșu pe bandă)
  const importShare = (name) => {
    if (gridImp <= 0) return 0;
    if (name === 'Altele') {
      const imp = altMembers.reduce((acc, n) => acc + ((alloc[R] || {})[n] || 0), 0);
      const tot = altMembers.reduce((acc, n) => acc + (dstTotal[n] || 0), 0);
      return tot > 0 ? imp / tot : 0;
    }
    const tot = dstTotal[name] || 0;
    return tot > 0 ? ((alloc[R] || {})[name] || 0) / tot : 0;
  };

  const { bh, vg, cut } = M;
  const showTotal = !!opts.showTotal;            // implicit: fără casetă TOTAL (doar o scânteie la intersecție)
  const nodeH = showTotal ? bh : 0;               // caseta „Total” (opțională) are același format ca restul
  const bw = Math.floor((W - 2 * M.pad - 2 * M.gap) / 3);
  const srcTop = 2, srcBot = srcTop + bh, nodeTop = srcBot + vg, nodeBot = nodeTop + nodeH;
  const dstTop = nodeBot + vg, dstBot = dstTop + bh;
  const H = opts.height || (dstBot + 2);
  const cx = W / 2;
  const nodeW = small ? 112 : 150;
  const nx0 = cx - nodeW / 2, nx1 = cx + nodeW / 2;
  const attSp = showTotal ? 22 : 10;             // cât de depărtate se prind panglicile de intersecție
  const allV = [solarV, gridImp, gridExp, batDis, batChg, ...dsts.map(([, v]) => v)];
  const maxV = Math.max(1, ...allV);
  const thick = (v) => (small ? 8 : 11) + Math.min(1, v / maxV) * (small ? 9 : 15);   // 9–20 px (mic) / 11–26 px: late și pline, ca în poză

  // ---- panglici ----
  const lighten = (hex, k) => {
    const m = /^#([0-9a-f]{6})$/i.exec(hex);
    if (!m) return '#ffffff';
    const n = parseInt(m[1], 16);
    const f = (c) => Math.round(c + (255 - c) * k);
    return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => f(c).toString(16).padStart(2, '0')).join('');
  };
  // pseudo-aleatoriu determinist (aceeași imagine la fiecare randare)
  const rnd = (n) => { const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
  let ribbonSeq = 0;
  const approxLen = (d) => {
    const n = (d.match(/-?[0-9.]+/g) || []).map(Number);
    if (n.length < 8) return 40;
    let L = 0;
    for (let i = 0; i < 3; i++) L += Math.hypot(n[2 * i + 2] - n[2 * i], n[2 * i + 3] - n[2 * i + 1]);
    return L * 0.92;
  };
  const star = (z) => 'M0,' + (-z) + ' L' + (z * 0.28).toFixed(2) + ',' + (-z * 0.28).toFixed(2) + ' L' + z + ',0 L' + (z * 0.28).toFixed(2) + ',' + (z * 0.28).toFixed(2) +
    ' L0,' + z + ' L' + (-z * 0.28).toFixed(2) + ',' + (z * 0.28).toFixed(2) + ' L' + (-z) + ',0 L' + (-z * 0.28).toFixed(2) + ',' + (-z * 0.28).toFixed(2) + ' Z';
  // sclipiri (ca în poza de referință): cruciulițe „×” / „+” de mărimi diferite și puncte, strălucitoare, cu pâlpâire,
  // înșirate pe miez; nicio săgeată, nicio pată (pulsul = sclipirile care curg)
  const sparkles = (d, t, col) => {
    const id = ribbonSeq++;
    const len = approxLen(d);
    const n = Math.max(6, Math.min(12, Math.round(len / 8.5)));
    const glow = 'filter:drop-shadow(0 0 1px ' + col + '99);';
    let o = '';
    for (let k = 0; k < n; k++) {
      const r1 = rnd(id * 31 + k + 1), r2 = rnd(id * 17 + k + 5), r3 = rnd(id * 7 + k + 11);
      const dur = 1.9 + r1 * 1.7, tw = 0.7 + r3 * 1.1;
      const delay = (-(k / n) * dur - r2 * 0.5).toFixed(2);
      const common = 'style="offset-path:path(\'' + d + '\');offset-rotate:' + (r3 > 0.5 ? 45 : 0) + 'deg;' + glow +
        'animation-duration:' + dur.toFixed(2) + 's,' + tw.toFixed(2) + 's;animation-delay:' + delay + 's,' + (-r2 * tw).toFixed(2) + 's"';
      if (k % 3 === 2) {
        o += '<circle class="rb-star" r="' + (0.9 + r2 * 1.1).toFixed(1) + '" cx="0" cy="0" fill="#fff" ' + common + '/>';
      } else {
        const z = 1.8 + r2 * 2.4 + Math.min(1.4, t / 14);
        o += '<path class="rb-star" d="' + star(parseFloat(z.toFixed(1))) + '" fill="#fff" ' + common + '/>';
      }
    }
    return o;
  };
  // panglică ca în poză, TRANSLUCIDĂ: halou moale, corp saturat translucid (margini mai închise), strat mijlociu și luminos spre centru,
  // miez alb-colorat subțire, apoi sclipiri + puls
  // Panglica e CONICĂ, ca în poza de referință: subțire la capătul de proveniență / destinație, mai groasă la intrarea/ieșirea din Total.
  // Capătul dinspre Total = cel mai apropiat de un punct din `hubPts` (umplut de aranjare). Dacă `d` nu e o singură curbă cubică → bandă de lățime constantă.
  const hubPts = [];
  const parseCubic = (d) => {
    const n = (d.match(/-?[0-9]*\.?[0-9]+/g) || []).map(Number);
    return (n.length === 8 && /^M/.test(d) && (d.match(/C/g) || []).length === 1) ? n : null;
  };
  const taperPoly = (P, wOf, k, add) => {
    const N = 30, L = [], R = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N, v = 1 - u;
      const x = v * v * v * P[0] + 3 * v * v * u * P[2] + 3 * v * u * u * P[4] + u * u * u * P[6];
      const y = v * v * v * P[1] + 3 * v * v * u * P[3] + 3 * v * u * u * P[5] + u * u * u * P[7];
      let dx = 3 * v * v * (P[2] - P[0]) + 6 * v * u * (P[4] - P[2]) + 3 * u * u * (P[6] - P[4]);
      let dy = 3 * v * v * (P[3] - P[1]) + 6 * v * u * (P[5] - P[3]) + 3 * u * u * (P[7] - P[5]);
      const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
      const h = (wOf(u) * k + (add || 0)) / 2;
      L.push([x - dy * h, y + dx * h]); R.push([x + dy * h, y - dx * h]);
    }
    const pts = L.concat(R.reverse());
    return 'M' + pts.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' L') + ' Z';
  };
  const ribbon = (d, col, t, spec) => {
    const P = parseCubic(d);
    let body;
    if (P) {
      const dist = (x, y) => Math.min(...(hubPts.length ? hubPts : [[P[0], P[1]]]).map((h) => Math.hypot(h[0] - x, h[1] - y)));
      const hubAtStart = dist(P[0], P[1]) <= dist(P[6], P[7]);
      const wMax = t * 1.2, wMin = Math.max(1.6, t * 0.28);
      let wOf = (u) => { const s = hubAtStart ? 1 - u : u; const e = s * s * (3 - 2 * s); return wMin + (wMax - wMin) * e; };
      if (spec && spec.hubW != null) {
        // fusiform: vârf subțire la sursă/destinație, lățimea reală (proporțională cu puterea) la mijloc, îngust la intrarea în Total (încape în latura casetei)
        const tip = Math.max(1.8, t * 0.22), hw = Math.min(spec.hubW, t), lenF = Math.min(1, approxLen(d) / 110);   // panglicile scurte se umflă mai puțin (nu devin „bulbi”)
        wOf = (u) => {
          const s = spec.hubAtStart ? 1 - u : u;
          const lin = tip + (hw - tip) * s;
          return lin + Math.max(0, t - Math.max(tip, hw)) * lenF * Math.pow(Math.sin(Math.PI * Math.min(1, Math.max(0, s))), 1.1);
        };
      }
      body =
        '<path class="rb-halo" d="' + taperPoly(P, wOf, 1.9) + '" fill="' + col + '" opacity="0.10"/>' +
        '<path class="rb-edge" d="' + taperPoly(P, wOf, 1, 1.6) + '" fill="' + lighten(col, 0.3) + '" opacity="0.32"/>' +
        '<path class="rb-body" d="' + taperPoly(P, wOf, 1) + '" data-c="' + d + '" data-t="' + t.toFixed(1) + '" fill="' + col + '" opacity="0.5"/>' +
        '<path class="rb-mid" d="' + taperPoly(P, wOf, 0.5) + '" fill="' + lighten(col, 0.25) + '" opacity="0.3"/>' +
        '<path class="rb-light" d="' + taperPoly(P, wOf, 0.22) + '" fill="' + lighten(col, 0.55) + '" opacity="0.5"/>';
    } else {
      body =
        '<path class="rb-halo" d="' + d + '" fill="none" stroke="' + col + '" stroke-width="' + (t * 1.9).toFixed(1) + '" stroke-linecap="round" opacity="0.10"/>' +
        '<path class="rb-edge" d="' + d + '" fill="none" stroke="' + lighten(col, 0.3) + '" stroke-width="' + (t + 1.6).toFixed(1) + '" stroke-linecap="round" opacity="0.32"/>' +
        '<path class="rb-body" d="' + d + '" data-c="' + d + '" data-t="' + t.toFixed(1) + '" fill="none" stroke="' + col + '" stroke-width="' + t.toFixed(1) + '" stroke-linecap="round" opacity="0.5"/>' +
        '<path class="rb-mid" d="' + d + '" fill="none" stroke="' + lighten(col, 0.25) + '" stroke-width="' + (t * 0.5).toFixed(1) + '" stroke-linecap="round" opacity="0.3"/>' +
        '<path class="rb-light" d="' + d + '" fill="none" stroke="' + lighten(col, 0.55) + '" stroke-width="' + (t * 0.22).toFixed(1) + '" stroke-linecap="round" opacity="0.5"/>';
    }
    return body +
      '<path class="rb-core" d="' + d + '" fill="none" stroke="' + lighten(col, 0.9) + '" stroke-width="' + Math.max(0.8, t * 0.07).toFixed(1) + '" stroke-linecap="round" opacity="0.75"/>' +
      sparkles(d, t, col);
  };
  const down = (sx, sy, ax, ay) => 'M' + sx.toFixed(1) + ',' + sy + ' C ' + sx.toFixed(1) + ',' + (sy + vg * 0.6).toFixed(1) + ' ' +
    ax.toFixed(1) + ',' + (ay - vg * 0.6).toFixed(1) + ' ' + ax.toFixed(1) + ',' + ay;
  const up = (ax, ay, sx, sy) => 'M' + ax.toFixed(1) + ',' + ay + ' C ' + ax.toFixed(1) + ',' + (ay - vg * 0.6).toFixed(1) + ' ' +
    sx.toFixed(1) + ',' + (sy + vg * 0.6).toFixed(1) + ' ' + sx.toFixed(1) + ',' + sy;

  // ---- casete octogonale (toate colțurile teșite, ca în poză) ----
  const oct = (x, y, w, h, c) => 'M' + (x + c) + ',' + y + ' L' + (x + w - c) + ',' + y + ' L' + (x + w) + ',' + (y + c) +
    ' L' + (x + w) + ',' + (y + h - c) + ' L' + (x + w - c) + ',' + (y + h) + ' L' + (x + c) + ',' + (y + h) +
    ' L' + x + ',' + (y + h - c) + ' L' + x + ',' + (y + c) + ' Z';
  const batteryIcon = (soc) => {
    let o = '<rect x="8" y="6" width="16" height="23" rx="2.5"/><path d="M13 6V3h6v3"/>';
    if (soc != null && isFinite(soc)) {
      const h = soc > 0 ? Math.max(2.6, Math.min(18, 18 * soc / 100)) : 0;   // umplerea graduală (proporțională cu SOC), mereu vizibilă când SOC > 0
      if (h > 0.5) o += '<rect class="bat-fill" x="10.5" y="' + (26.5 - h).toFixed(1) + '" width="11" height="' + h.toFixed(1) + '" rx="1" fill="currentColor" stroke="none"/>';
    }
    return o;
  };
  const iconFor = (name, key) => {
    if (key === 'battery') return batteryIcon(info.soc);
    if (key === 'total') return ICON_FULGER;
    if (key === 'solar') return ICON_SOLAR;
    if (key === 'grid') return ICON_RETEA;
    if (name === 'Altele') return ICON_ALTELE;
    return iconForMdi(iconsCfg[name]) || iconForName(name);
  };
  // casetă strânsă pe conținut: [iconiță][număr (+ procent mic)], centrată pe cxB; `maxW` limitează lățimea (slotul din rândul de sus).
  // Toate casetele au același format ca „Total”: joase, text mic, margine subțire.
  function box(cxB, y, title, text, col, entity, dimmed, key, maxW, anchor, sub, glow) {
    const w0 = fitW(text, sub), w = maxW ? Math.min(w0, maxW) : w0, x = anchor === 'r' ? cxB - w : (anchor === 'l' ? cxB : cxB - w / 2);
    const is = M.ico / 32, sw = small ? 1.6 : 2;
    const availT = w - 2 * padX - M.ico - gapIT, est = estW(text, M.fv) + (sub ? estW(sub, subFs) + 4 : 0);
    const tl = est > availT ? ' textLength="' + Math.max(8, availT).toFixed(1) + '" lengthAdjust="spacingAndGlyphs"' : '';
    return '<g class="cbox"' + (entity ? ' data-entity="' + esc(entity) + '" role="button"' : '') + (dimmed ? ' opacity="0.5"' : '') +
      (glow ? ' style="filter:drop-shadow(0 0 3px ' + col + '66)"' : '') +
      ' data-anchor="' + (anchor || 'c') + '" data-cx="' + cxB.toFixed(1) + '" data-y="' + y + '" data-h="' + bh + '" data-cut="' + cut + '" data-padx="' + padX + '" data-ico="' + M.ico + '" data-gap="' + gapIT + '"' +
      (maxW ? ' data-maxw="' + maxW.toFixed(1) + '"' : '') + '>' +
      '<title>' + esc(title) + '</title>' +
      '<path d="' + oct(x, y, w, bh, cut) + '" class="cb-line" fill="#06121c" stroke="' + col + '" stroke-width="' + sw + '" stroke-linejoin="round"/>' +
      '<path d="' + oct(x, y, w, bh, cut) + '" class="cb-tint" fill="' + col + '" fill-opacity="0.08" stroke="none"/>' +
      '<g class="cb-icon" transform="translate(' + (x + padX).toFixed(1) + ',' + (y + (bh - M.ico) / 2).toFixed(1) + ') scale(' + is.toFixed(3) + ')" fill="none" stroke="' + col +
      '" color="' + col + '" stroke-width="' + (small ? 2.6 : 2.4) + '" stroke-linecap="round" stroke-linejoin="round">' + iconFor(title, key) + '</g>' +
      '<text class="cb-text" x="' + (x + padX + M.ico + gapIT).toFixed(1) + '" y="' + (y + bh / 2 + M.fv * 0.36).toFixed(1) + '" text-anchor="start" fill="' + (glow ? '#fff' : col) + '"' + tl +
      ' font-size="' + M.fv + '" font-weight="bold">' + esc(text) +
      (sub ? '<tspan class="cb-sub" dx="3" font-size="' + subFs + '" fill="' + col + '" fill-opacity="0.85">' + esc(sub) + '</tspan>' : '') + '</text></g>';
  }

  // mici informații extra (ex. radiația solară W/m², producția pe zi): text 9 px + iconiță, în spațiul liber al cardului
  const exs = (Array.isArray(info.extras) ? info.extras.filter((e) => e && e.text) : []).slice(0, 2);
  const exFs = small ? 9 : 11, exIc = small ? 10 : 13;
  const exW = (e) => exIc + 3 + estW(e.text, exFs);
  const exItem = (e, x, yBase, mode) => {
    const w = exW(e), xl = mode === 'end' ? x - w : (mode === 'mid' ? x - w / 2 : x);
    const col = e.col || '#ffd23a';
    return '<g class="cx"' + (e.entity ? ' data-entity="' + esc(e.entity) + '" role="button"' : '') + '><title>' + esc(e.title || (e.key === 'prod' ? 'Produc\u021bie azi' : 'Radia\u021bie solar\u0103')) + '</title>' +
      '<g transform="translate(' + xl.toFixed(1) + ',' + (yBase - exIc * 0.86).toFixed(1) + ') scale(' + (exIc / 32).toFixed(3) + ')" fill="none" stroke="' + col +
      '" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">' + (e.key === 'prod' ? ICON_PROD : ICON_SOARE) + '</g>' +
      '<text class="cx-text" x="' + (xl + exIc + 3).toFixed(1) + '" y="' + yBase.toFixed(1) + '" text-anchor="start" fill="' + col + '" fill-opacity="0.92" font-size="' + exFs + '" font-weight="bold">' + esc(e.text) + '</text></g>';
  };

  let bands = '', boxes = '';
  // rând sus: Solar · Rețea · Baterie (3 sloturi egale; caseta se strânge pe conținut, centrată pe slot)
  const gridCol = dirs.grid === 'export' ? colors.exportGrid : colors.importGrid;
  const topAll = [
    { key: 'solar', title: 'Solar', col: colors.solar, text: texts.solar, ent: ents.solar, dimmed: solarV <= 0, v: solarV, dir: 'down' },
    { key: 'grid', title: 'Rețea', col: gridCol, text: texts.grid, ent: ents.grid, dimmed: dirs.grid === 'idle',
      v: dirs.grid === 'export' ? gridExp : gridImp, dir: dirs.grid === 'export' ? 'up' : 'down' },
    { key: 'battery', title: 'Baterie', col: colors.battery, text: texts.battery, ent: ents.battery, dimmed: dirs.battery === 'idle',
      v: dirs.battery === 'charge' ? batChg : batDis, dir: dirs.battery === 'charge' ? 'up' : 'down',
      sub: (info.soc != null && isFinite(info.soc)) ? Math.round(info.soc) + '%' : null },
  ];
  // culoarea intersecției = culoarea care DOMINĂ fluxul: energie proprie (solar/baterie) = portocaliu, import din rețea = roșu,
  // amestecate continuu după ponderea importului în total; fără flux: gri
  const mixHex = (a, b, k) => {
    const pa = /^#([0-9a-f]{6})$/i.exec(a), pb = /^#([0-9a-f]{6})$/i.exec(b);
    if (!pa || !pb) return a;
    const na = parseInt(pa[1], 16), nb = parseInt(pb[1], 16);
    const ch = (sh) => Math.round(((na >> sh) & 255) * (1 - k) + ((nb >> sh) & 255) * k).toString(16).padStart(2, '0');
    return '#' + ch(16) + ch(8) + ch(0);
  };
  const impShareTotal = total > 0 ? Math.min(1, gridImp / total) : 0;
  // margine = culoarea care DOMINĂ, dar trecerea e GRADUALĂ: de la portocaliu (fără import) spre roșu (doar import), cu curbă netedă;
  // peste 50% import domină roșul, sub 50% domină portocaliul
  const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  // proporțional: 10% din total din import → 10% roșu
  const hubCol = total > 0 ? mixHex(colors.own, colors.importGrid, impShareTotal) : '#6f8aa0';
  // o destinație alimentată (și) din import primește UN SINGUR flux, „contaminat” cu roșu: culoarea ei se amestecă gradual cu roșul după ponderea importului
  // proporțional (10% din destinație din import → 10% roșu pe flux și pe iconiță)
  const tint = (col, sh) => (sh > 0.002 ? mixHex(col, colors.importGrid, Math.min(1, sh)) : col);
  // ce există se vede; ce lipsește (de ex. bateria la Huawei) nu lasă gol: elementele rămase se reașază singure
  const present = Object.assign({ solar: true, grid: true, battery: true }, info.present || {});
  const top = topAll.filter((t) => present[t.key] !== false);
  const nT = top.length, slotW = (W - 2 * M.pad) / 3;
  const dPair = Math.max(62, Math.min(90, W * 0.2));
  const slotCx = (i) => nT >= 3 ? M.pad + slotW * (i + 0.5) : (nT === 2 ? cx + (i === 0 ? -dPair : dPair) : cx);
  // ---- aranjare ORIZONTALĂ, în diagonală (pentru configurații fără consumatori suplimentari: doar Casă) ----
  //   stânga: Solar (sus) · Rețea (jos)      centru: Total (jos)      dreapta: Casă (sus, opus totalului) · Baterie (jos, sub Casă)
  // Panglicile se încrucișează în diagonală, deci se văd lungi. Alegerea auto/forțată e după STRUCTURĂ, nu după valori.
  const layoutOpt = opts.layout || 'auto';
  const consN = info.consumerCount != null ? info.consumerCount : others.length;
  const structH = nT >= 1 && consN === 0;
  const WORST = '−12,4 kW';
  const hubWw = showTotal ? fitW('12,4 kW') : 0;
  const hubWh = showTotal ? fitW(fmtPower(total)) : 0;
  const leftItems = top.filter((t) => t.key !== 'battery'), batItem = top.find((t) => t.key === 'battery');
  const wLeft = leftItems.length ? Math.max(...leftItems.map((t) => fitW(t.text == null ? '—' : t.text, t.sub))) : 0;
  const wRight = Math.max(fitW(fmtPower(houseV)), batItem ? fitW(batItem.text == null ? '—' : batItem.text, batItem.sub) : 0);
  const gapLW = (cx - hubWw / 2) - (M.pad + (leftItems.length ? fitW(WORST) : 0)), gapRW = (W - M.pad - fitW(WORST)) - (cx + hubWw / 2);
  const hGapL = (cx - hubWh / 2) - (M.pad + wLeft), hGapR = (W - M.pad - wRight) - (cx + hubWh / 2);
  const hGapNeed = small ? 30 : 36;
  const useH = structH && (
    (layoutOpt === 'horizontal' && Math.min(hGapL, hGapR) >= 14) ||
    (layoutOpt === 'auto' && Math.min(gapLW, gapRW) >= hGapNeed));
  // ---- stil DESCHIS (opts.style === 'open'): fără casete; doar iconiță + valoare, iar „Total” e singura casetă ----
  //   stânga: Solar · Rețea · Baterie (procentul bateriei SUB valoare) · centru: Total · dreapta: Casă + consumatori (iconiță + valoare)
  //   panglici fusiforme: nu ies în afara casetei Total (fiecare intră pe latura ei, în propriul slot, îngustă), iconițele se colorează gradual cu roșu la import
  if (opts.style === 'open') {
    const oFv = small ? 12 : 16, oIco = small ? 16 : 22, oSub = small ? 9 : 11, rowH = small ? 34 : 46;
    const gInfo = (Array.isArray(info.gridInfo) ? info.gridInfo : []).slice(0, 3);
    const left = top.map((t) => ({ key: t.key, title: t.title, text: t.text == null ? '\u2014' : t.text, sub: t.sub, col: t.col, ent: t.ent,
      dimmed: t.dimmed && t.key !== 'battery', v: t.v, dir: t.dir, sh: (t.key === 'battery' && t.dir === 'up') ? importShare('Baterie') : 0,
      // Rețea: 3 rânduri informative (fără flux): aceeași iconiță, import roșu / export verde
      rows: t.key === 'grid' ? gInfo.filter((g) => g.pos !== 'above').map((g) => ({ text: g.text + ' ' + g.unit + (g.label ? ' ' + g.label : ''), col: g.col === 'exp' ? colors.exportGrid : colors.importGrid, title: g.title })) : [],
      rowsAbove: t.key === 'grid' ? gInfo.filter((g) => g.pos === 'above').map((g) => ({ text: g.text + ' ' + g.unit + (g.label ? ' ' + g.label : ''), col: g.col === 'exp' ? colors.exportGrid : colors.importGrid, title: g.title })) : [] }));
    const rowIco = oSub + 3, rowStep = oSub + 3, mainH = oFv + 2;
    // înălțimea blocului unui element (linia principală + procent/rânduri informative dedesubt) și slotul lui
    const aboveH = (it) => it.rowsAbove.length * rowStep;
    const blockH = (it) => aboveH(it) + mainH + (it.sub ? oSub + 2 : 0) + it.rows.length * rowStep;
    const slotH = (it) => Math.max(rowH, blockH(it) + 8);
    const maxRows = small ? 5 : 6;
    const many = others.length + 1 > maxRows;
    const visO = many ? others.slice(0, maxRows - 2) : others, restO = many ? others.slice(maxRows - 2) : [];
    const rows = [{ name: houseName, v: houseV }, ...visO.map(([name, v]) => ({ name, v }))];
    if (restO.length) rows.push({ name: 'Altele', v: restO.reduce((a, [, v]) => a + v, 0), members: restO.map(([n]) => n) });
    const rcol = () => colors.house;   // toți consumatorii au culoarea casei; doar importul îi înroșește
    const shOf = (it) => {
      if (gridImp <= 0) return 0;
      const names = it.members || [it.name];
      const imp = names.reduce((a, n) => a + ((alloc[R] || {})[n] || 0), 0), tot = names.reduce((a, n) => a + (dstTotal[n] || 0), 0);
      return tot > 0 ? imp / tot : 0;
    };
    const right = rows.map((it) => ({ key: 'dst', title: it.name, text: fmtPower(it.v), col: rcol(it.name), ent: null, dimmed: false, v: it.v, sh: shOf(it) }));
    const nL = left.length, nR = right.length, nMax = Math.max(nL, nR, 1);
    const sumL = left.reduce((a, it) => a + slotH(it), 0);
    // înălțime STABILĂ: se rezervă rânduri pentru toți consumatorii configurați (Casă + info.consumerCount, max. maxRows), ca desenul să nu-și schimbe
    // înălțimea când un consumator apare/dispare (ar muta tot ce e dedesubt și pe telefon ar sări derularea)
    const nRres = Math.max(nR, Math.min(maxRows, 1 + (info.consumerCount != null ? info.consumerCount : 0)));
    const Ho = opts.height || Math.max(sumL, nRres * rowH, small ? 84 : 120) + 8;
    const yOf = (i, n) => Ho / 2 + (i - (n - 1) / 2) * rowH;
    // stânga: sloturi de înălțimi diferite (Rețea e mai înaltă din cauza rândurilor informative); yc = linia principală a elementului
    const slotsL = []; { let acc = Ho / 2 - sumL / 2; left.forEach((it) => { const h = slotH(it); slotsL.push({ top: acc, h, yc: acc + h / 2 - blockH(it) / 2 + aboveH(it) + mainH / 2 }); acc += h; }); }
    const yLeft = (i) => slotsL[i].yc;
    const colW = (arr) => arr.length ? oIco + 5 + Math.max(...arr.map((it) => Math.max(estW(it.text, oFv), it.sub ? estW(it.sub, oSub) : 0,
      (it.rows || []).concat(it.rowsAbove || []).length ? Math.max(...(it.rows || []).concat(it.rowsAbove || []).map((r) => estW(r.text, oSub) + rowIco - oIco + 3 - 5)) : 0))) : 0;
    const wLc = colW(left), wRc = colW(right);
    const xl0 = M.pad + 2, xlEnd = xl0 + wLc + 5;
    const xrIco = W - M.pad - 2 - wRc, xrStart = xrIco - 5;
    const totTxt = fmtPower(total), wT = Math.ceil(2 * padX + M.ico + gapIT + estW(totTxt, M.fv + 1) + 6);
    // panglicile se prind doar pe partea DREAPTĂ a laturii (între teșituri), ca să nu rămână gol între colțul teșit și flux
    const boxH = Math.min(Ho - 8, Math.max(small ? 36 : 46, nMax * (small ? 10 : 12) + 2 * (cut + 1) + 4));
    const hx0 = cx - wT / 2, hx1 = cx + wT / 2, ty = Ho / 2 - boxH / 2;
    const xsL = (it) => xl0 + oIco + 5 + estW(it.text, oFv) + 4;   // panglica începe lângă valoarea ei (nu la marginea coloanei)
    const xsMax = Math.max(xl0 + oIco + 5, ...left.map(xsL));
    if (hx0 - xsMax >= 22 && xrStart - hx1 >= 22) {
      const toR = (x0, y0, x1, y1b, g) => 'M' + x0.toFixed(1) + ',' + y0.toFixed(1) + ' C ' + (x0 + g * 0.55).toFixed(1) + ',' + y0.toFixed(1) + ' ' +
        (x1 - g * 0.55).toFixed(1) + ',' + y1b.toFixed(1) + ' ' + x1.toFixed(1) + ',' + y1b.toFixed(1);
      const toL = (x0, y0, x1, y1b, g) => 'M' + x0.toFixed(1) + ',' + y0.toFixed(1) + ' C ' + (x0 - g * 0.55).toFixed(1) + ',' + y0.toFixed(1) + ' ' +
        (x1 + g * 0.55).toFixed(1) + ',' + y1b.toFixed(1) + ' ' + x1.toFixed(1) + ',' + y1b.toFixed(1);
      const band0 = ty + cut + 1, bandH = boxH - 2 * (cut + 1), IN = 4;   // IN: panglica intră 4 px sub casetă (acoperită de ea), fără hairline
      const slotY = (k, n) => band0 + (k + 0.5) * bandH / n;
      let rb = '', items = '';
      left.forEach((it, k) => {
        if (!(it.v > 0)) return;
        const yc = yLeft(k), yh = slotY(k, nL), t = thick(it.v), hubW = Math.max(2.2, Math.min(t * 0.7, bandH / nL - 2)), xs0 = xsL(it), gg = hx0 - xs0;
        const col = tint(it.col, it.sh);
        rb += it.dir === 'up' ? ribbon(toL(hx0 + IN, yh, xs0, yc, gg), col, t, { hubW, hubAtStart: true })
          : ribbon(toR(xs0, yc, hx0 + IN, yh, gg), col, t, { hubW, hubAtStart: false });
      });
      right.forEach((it, k) => {
        if (!(it.v > 0)) return;
        const yc = yOf(k, nR), yh = slotY(k, nR), t = thick(it.v), hubW = Math.max(2.2, Math.min(t * 0.7, bandH / nR - 2)), gg = xrStart - hx1;
        rb += ribbon(toR(hx1 - IN, yh, xrStart, yc, gg), tint(it.col, it.sh), t, { hubW, hubAtStart: true });
      });
      const icoAt = (x, yc, col, title, key) => '<g transform="translate(' + (x - (key === 'battery' ? oIco * 0.1 : 0)).toFixed(1) + ',' + (yc - oIco * (key === 'battery' ? 0.6 : 0.5)).toFixed(1) + ') scale(' + (oIco * (key === 'battery' ? 1.2 : 1) / 32).toFixed(3) +
        ')" fill="none" stroke="' + col + '" color="' + col + '" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">' + iconFor(title, key) + '</g>';
      const item = (it, k, n, x) => {
        const yc = it.side === 'l' ? yLeft(k) : yOf(k, n), col = tint(it.col, it.sh || 0), tx = x + oIco + 5;
        const vy = yc + oFv * 0.36;
        const rowSvg = (r, ry) => '<g class="co-row"><title>' + esc(r.title) + '</title><g transform="translate(' + (x + (oIco - rowIco) / 2).toFixed(1) + ',' + (ry - rowIco / 2).toFixed(1) + ') scale(' + (rowIco / 32).toFixed(3) +
          ')" fill="none" stroke="' + r.col + '" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">' + ICON_RETEA + '</g>' +
          '<text class="co-led" x="' + (x + oIco + 2).toFixed(1) + '" y="' + (ry + oSub * 0.34).toFixed(1) + '" fill="' + r.col + '" font-size="' + oSub + '" font-weight="bold">' + esc(r.text) + '</text></g>';
        let o = '<g class="copen"' + (it.ent ? ' data-entity="' + esc(it.ent) + '" role="button"' : '') + (it.dimmed ? ' opacity="0.5"' : '') + '><title>' + esc(it.title) + '</title>';
        // rânduri informative DEASUPRA liniei principale (ex. importul lunar)
        (it.rowsAbove || []).forEach((r, j) => { o += rowSvg(r, yc - mainH / 2 - (it.rowsAbove.length - j) * rowStep + rowStep / 2); });
        o += icoAt(x, yc, col, it.title, it.key) +
          '<text class="co-text" x="' + tx.toFixed(1) + '" y="' + vy.toFixed(1) + '" fill="' + col + '" font-size="' + oFv + '" font-weight="bold">' + esc(it.text) + '</text>';
        let ly = yc + mainH / 2 + (oSub + 2) / 2;
        if (it.sub) { o += '<text class="co-sub" x="' + tx.toFixed(1) + '" y="' + (ly + oSub * 0.34).toFixed(1) + '" fill="' + col + '" fill-opacity="0.85" font-size="' + oSub + '" font-weight="bold">' + esc(it.sub) + '</text>'; ly += oSub + 2; }
        (it.rows || []).forEach((r) => { o += rowSvg(r, ly + rowStep / 2); ly += rowStep; });
        return o + '</g>';
      };
      left.forEach((it, k) => { items += item(Object.assign({ side: 'l' }, it), k, nL, xl0); });
      right.forEach((it, k) => { items += item(it, k, nR, xrIco); });
      const isT = M.ico / 32;
      const chip = '<g class="copen-total" style="filter:drop-shadow(0 0 3px ' + hubCol + '66)"><title>Total</title>' +
        '<path d="' + oct(hx0, ty, wT, boxH, cut) + '" fill="#06121c" stroke="' + hubCol + '" stroke-width="' + (small ? 1.6 : 2) + '" stroke-linejoin="round"/>' +
        '<path d="' + oct(hx0, ty, wT, boxH, cut) + '" fill="' + hubCol + '" fill-opacity="0.08" stroke="none"/>' +
        '<g transform="translate(' + (hx0 + padX).toFixed(1) + ',' + (Ho / 2 - M.ico / 2).toFixed(1) + ') scale(' + isT.toFixed(3) + ')" fill="none" stroke="' + hubCol + '" color="' + hubCol +
        '" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">' + ICON_FULGER + '</g>' +
        '<text class="co-text" x="' + (hx0 + padX + M.ico + gapIT).toFixed(1) + '" y="' + (Ho / 2 + (M.fv + 1) * 0.36).toFixed(1) + '" fill="#fff" font-size="' + (M.fv + 1) + '" font-weight="bold">' + esc(totTxt) + '</text></g>';
      let ex = '';
      if (exs.length) {
        ex += exItem(exs[0], cx, ty - 5, 'mid');
        if (exs[1]) ex += exItem(exs[1], cx, ty + boxH + exFs + 4, 'mid');
      }
      return '<svg viewBox="0 0 ' + W + ' ' + Ho + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="flux de energie (estimat)" data-layout="open" ' +
        'style="width:100%;height:auto;display:block;overflow:visible;">' + rb + chip + items + ex + '</svg>';
    }
  }
  if (useH) {
    // card lat (nu telefon): rândurile se depărtează ca desenul să fie mai pătrat și fluxurile să se vadă cum merg; pe ecran îngust rămâne compact
    // forma: 'square' = înalt, Total la mijloc · 'wide' = scund/dreptunghiular, Total jos · 'auto' (implicit) = înalt pe card lat, scund pe telefon/tabletă
    const tall = opts.shape === 'square' ? true : (opts.shape === 'wide' ? false : !small);
    const rowGap = tall ? Math.max(bh + 24, Math.min(130, Math.round(W * 0.24))) : bh + 24, y1 = 2 + bh / 2, y2 = y1 + rowGap, Hh = opts.height || (y2 + bh / 2 + 2);
    const yh = tall ? Math.round((y1 + y2) / 2) : y2;   // pe card lat Total stă la mijloc (nu „trântit” jos); pe telefon rămâne jos
    const xLR = M.pad + wLeft, xRL = W - M.pad - wRight, hx0 = cx - hubWh / 2, hx1 = cx + hubWh / 2;
    const gL = Math.max(10, hx0 - xLR), gR = Math.max(10, xRL - hx1);
    const toR = (x0, y0, x1, y1b, g) => 'M' + x0.toFixed(1) + ',' + y0.toFixed(1) + ' C ' + (x0 + g * 0.55).toFixed(1) + ',' + y0.toFixed(1) + ' ' +
      (x1 - g * 0.55).toFixed(1) + ',' + y1b.toFixed(1) + ' ' + x1.toFixed(1) + ',' + y1b.toFixed(1);
    const toL = (x0, y0, x1, y1b, g) => 'M' + x0.toFixed(1) + ',' + y0.toFixed(1) + ' C ' + (x0 - g * 0.55).toFixed(1) + ',' + y0.toFixed(1) + ' ' +
      (x1 + g * 0.55).toFixed(1) + ',' + y1b.toFixed(1) + ' ' + x1.toFixed(1) + ',' + y1b.toFixed(1);
    // un singur flux, culoarea destinației „contaminată” cu roșu după ponderea importului
    // lățimea la intrarea în Total e limitată la partea dreaptă a laturii (între teșituri), ca fluxul să nu iasă peste casetă; intră 3 px sub ea
    const bandH2 = bh - 2 * (cut + 1), ao = bandH2 / 4, IN2 = 3;
    const hw = (tk) => Math.max(2.2, Math.min(tk * 0.7, bandH2 / 2 - 1.5));
    const stripes = (mk, col, tk, sh) => ribbon(mk(0), tint(col, sh), tk, { hubW: hw(tk), hubAtStart: true });
    hubPts.push([hx0, yh], [hx1, yh]);
    let hb = '', hxs = '';
    // stânga: Solar sus, Rețea jos
    for (const t of leftItems) {
      const yc = t.key === 'solar' ? y1 : y2, ay = t.key === 'solar' ? yh - ao : yh + ao;
      if (t.v > 0) {
        const up2 = t.dir === 'up', tk0 = thick(t.v);
        hb += ribbon(up2 ? toL(hx0 + IN2, ay, xLR, yc, gL) : toR(xLR, yc, hx0 + IN2, ay, gL), t.col, tk0, { hubW: hw(tk0), hubAtStart: up2 });
      }
      hxs += box(xLR, yc - bh / 2, t.title, t.text == null ? '—' : t.text, t.col, t.ent, t.dimmed, t.key, 0, 'r');
    }
    // dreapta: Casă sus (opus totalului), Baterie jos (sub Casă)
    if (houseV > 0) {
      const tk = thick(houseV), sh = importShare(houseName);
      hb += stripes((off) => toR(hx1 - IN2, yh - ao + off, xRL, y1 + off, gR), colors.house, tk, sh);
    }
    hxs += box(xRL, y1 - bh / 2, houseName, fmtPower(houseV), colors.house, null, false, 'dst', 0, 'l');
    if (batItem) {
      if (batItem.v > 0) {
        const tk = thick(batItem.v), sh = batItem.dir === 'up' ? importShare('Baterie') : 0;
        hb += batItem.dir === 'up'
          ? stripes((off) => toR(hx1 - IN2, yh + ao + off, xRL, y2 + off, gR), batItem.col, tk, sh)
          : ribbon(toL(xRL, y2, hx1 - IN2, yh + ao, gR), batItem.col, tk, { hubW: hw(tk), hubAtStart: false });
      }
      hxs += box(xRL, y2 - bh / 2, batItem.title, batItem.text == null ? '—' : batItem.text, batItem.col, batItem.ent, batItem.dimmed, batItem.key, 0, 'l', batItem.sub);
    }
    const hubH = showTotal
      ? box(cx, yh - bh / 2, 'Total', fmtPower(total), hubCol, null, false, 'total', 0, 'c', null, true)
      : (total > 0 ? '<circle class="flow-hub" cx="' + cx + '" cy="' + yh + '" r="' + (small ? 3.5 : 5) + '" fill="#fff" opacity="0.95" style="filter:drop-shadow(0 0 3px ' + hubCol + '99)"/>' : '');
    let hex = '';
    if (exs.length) {
      const availL = xLR + 8, availR = xRL - 8, wmax = Math.max(...exs.map(exW));
      if (wmax <= availR - availL) {
        if (exs.length === 1) hex = exItem(exs[0], cx, y1 + exFs * 0.36, 'mid');
        else exs.forEach((e, i) => { hex += exItem(e, cx, y1 - 2 + i * 11, 'mid'); });
      }
    }
    return '<svg viewBox="0 0 ' + W + ' ' + Hh + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="flux de energie (estimat)" data-layout="horizontal" ' +
      'style="width:100%;height:auto;display:block;overflow:visible;">' + hb + hubH + hxs + hex + '</svg>';
  }

  // la intrarea/ieșirea din Total panglicile încap pe latura casetei (între teșituri) și intră 3 px sub ea
  const IV = showTotal ? 3 : 0, wTotV = showTotal ? fitW(fmtPower(total)) : 60;
  const hwV = (tk, n) => Math.max(2.2, Math.min(tk * 0.7, (wTotV - 2 * (cut + 1)) / Math.max(1, n) - 2));
  hubPts.push([cx, nodeTop], [cx, nodeBot]);
  top.forEach((t, i) => {
    const sx = slotCx(i), ax = cx + (i - (nT - 1) / 2) * attSp;
    if (t.v > 0) {
      const tk = thick(t.v);
      const sh = (t.key === 'battery' && t.dir === 'up') ? importShare('Baterie') : 0;
      // bateria se încarcă (și) din import: un singur flux, culoarea bateriei „contaminată” cu roșu
      bands += ribbon(t.dir === 'up' ? up(ax, nodeTop + IV, sx, srcBot) : down(sx, srcBot, ax, nodeTop + IV), tint(t.col, sh), tk, { hubW: hwV(tk, nT), hubAtStart: t.dir === 'up' });
    }
    boxes += box(sx, srcTop, t.title, t.text == null ? '—' : t.text, t.col, t.ent, t.dimmed, t.key, slotW - 1, undefined, t.sub);
  });
  // rând jos: consumatori; partea alimentată din import = bandă ROȘIE (alăturată), restul în culoarea destinației
  const dstColor = () => colors.house;   // toți consumatorii au culoarea casei; doar importul îi înroșește
  const m = layout.boxes.length, sAtt = m > 1 ? Math.min(attSp, 40 / (m - 1)) : 0;
  layout.boxes.forEach((b, i) => {
    const dx = b.cx, ex = cx + (i - (m - 1) / 2) * sAtt;
    const col = dstColor(b.name);
    if (b.v > 0) {
      const t = thick(b.v), sh = importShare(b.name);
      // un singur flux către destinație, culoarea ei „contaminată” cu roșu după ponderea importului
      bands += ribbon(down(ex, nodeBot - IV, dx, dstTop), tint(col, sh), t, { hubW: hwV(t, m), hubAtStart: true });
    }
    boxes += box(dx, dstTop, b.name, fmtPower(b.v), col, null, false, 'dst');
  });

  // intersecția: implicit doar o scânteie mică (când există flux); opțional o casetă „Total”, strânsă ca celelalte
  const hub = showTotal
    ? box(cx, nodeTop, 'Total', fmtPower(total), hubCol, null, false, 'total', 0, 'c', null, true)
    : (total > 0 ? '<circle class="flow-hub" cx="' + cx + '" cy="' + nodeTop + '" r="' + (small ? 3.5 : 5) + '" fill="#fff" opacity="0.95" style="filter:drop-shadow(0 0 3px ' + hubCol + '99)"/>' : '');

  // extra în vertical: stânga/dreapta intersecției (panglicile se adună doar în centru)
  let exV = '';
  if (exs.length) {
    const hubHalf = showTotal ? fitW(fmtPower(total)) / 2 : 6, yb = nodeTop + (nodeH ? nodeH / 2 : 0) + exFs * 0.36;
    exs.forEach((e, i) => {
      const side = (exs.length === 1 || i === 0) ? 'l' : 'r';
      if (exW(e) > cx - hubHalf - 10 - M.pad) return;                      // nu încape: nu-l desenăm
      exV += side === 'l' ? exItem(e, M.pad + 2, yb, 'start') : exItem(e, W - M.pad - 2, yb, 'end');
    });
  }
  return '<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="flux de energie (estimat)" ' +
    'style="width:100%;height:auto;display:block;overflow:visible;">' + bands + hub + boxes + exV + '</svg>';
}

// ---------------------------------------------------------------------------
// Pas de MĂSURARE (DOM, după randare): strânge fiecare casetă pe conținutul real (iconiță + text), indiferent de font.
// Caseta rămâne centrată pe `data-cx`, deci panglicile rămân prinse la mijloc. Nu face nimic fără getBBox (Node, teste).
// ---------------------------------------------------------------------------
function fitCompactBoxes(root) {
  if (!root || typeof root.querySelectorAll !== 'function') return 0;
  const oct2 = (x, y, w, h, c) => 'M' + (x + c) + ',' + y + ' L' + (x + w - c) + ',' + y + ' L' + (x + w) + ',' + (y + c) +
    ' L' + (x + w) + ',' + (y + h - c) + ' L' + (x + w - c) + ',' + (y + h) + ' L' + (x + c) + ',' + (y + h) +
    ' L' + x + ',' + (y + h - c) + ' L' + x + ',' + (y + c) + ' Z';
  let n = 0;
  root.querySelectorAll('.cbox').forEach((g) => {
    const t = g.querySelector('.cb-text');
    if (!t || typeof t.getBBox !== 'function') return;
    const cxB = parseFloat(g.getAttribute('data-cx')), y = parseFloat(g.getAttribute('data-y')), h = parseFloat(g.getAttribute('data-h'));
    const cut = parseFloat(g.getAttribute('data-cut')), padX = parseFloat(g.getAttribute('data-padx'));
    const ico = parseFloat(g.getAttribute('data-ico')), gap = parseFloat(g.getAttribute('data-gap'));
    const maxW = parseFloat(g.getAttribute('data-maxw')), anchor = g.getAttribute('data-anchor') || 'c';
    t.removeAttribute('textLength'); t.removeAttribute('lengthAdjust');
    const bb = t.getBBox();
    if (!bb || !isFinite(bb.width) || bb.width <= 0) return;
    let w = Math.ceil(2 * padX + ico + gap + bb.width);
    let tl = null;
    if (isFinite(maxW) && w > maxW) { tl = Math.max(8, maxW - 2 * padX - ico - gap); w = maxW; }
    const x = anchor === 'r' ? cxB - w : (anchor === 'l' ? cxB : cxB - w / 2);
    g.querySelectorAll('.cb-line, .cb-tint').forEach((p) => p.setAttribute('d', oct2(x, y, w, h, cut)));
    const ig = g.querySelector('.cb-icon');
    if (ig) ig.setAttribute('transform', 'translate(' + (x + padX).toFixed(1) + ',' + (y + (h - ico) / 2).toFixed(1) + ') scale(' + (ico / 32).toFixed(3) + ')');
    t.setAttribute('x', (x + padX + ico + gap).toFixed(1));
    if (tl != null) { t.setAttribute('textLength', tl.toFixed(1)); t.setAttribute('lengthAdjust', 'spacingAndGlyphs'); }
    n++;
  });
  return n;
}


/* ===== graph-24h.js ===== */
// src/graph-24h.js — Grafic SVG 24h + bare 7 zile. Funcții PURE, fără DOM.
// Producție (zona cyan), consum (linie magenta), SOC (linie subțire), import/export (zone sub axă).
// Date false (generateFake24h/generateFake7d) NU sunt în calea de producție a cardului —
// sunt injectate doar din preview/index.html printr-un hook (card._historyProvider / _historyProvider7d).
// Gaps (null) = gol în linie, nu 0. Font SVG >= 16. Ticks rotunde (0, 1, 2, 3 kW).

/**
 * Reeșantionează o serie la fiecare stepMin minute (interpolare liniară).
 * Păstrată pentru compatibilitate/teste; calea de producție folosește parseHistory()
 * (grilă 5 min, „ultima valoare valabilă rămâne”).
 */
function resample5min(values, stepMin, totalMin) {
  const n = Math.floor(totalMin / stepMin) + 1;
  if (!values || values.length === 0) return new Array(n).fill(0);
  const origStep = totalMin / Math.max(1, values.length - 1);
  const out = [];
  for (let i = 0; i < n; i++) {
    const fi = (i * stepMin) / origStep;
    const lo = Math.floor(fi), hi = Math.min(lo + 1, values.length - 1);
    out.push(values[lo] * (1 - (fi - lo)) + values[hi] * (fi - lo));
  }
  return out;
}

/**
 * Pas „rotund” = CEL MAI MARE {1,2,4,5,9} × 10^n sub sau egal cu max (pentru unit-test).
 *   niceStep(99)=90, niceStep(450)=400, niceStep(800)=500, niceStep(1200)=1000, niceStep(3000)=2000.
 */
function niceStep(max) {
  if (max <= 0) return 1;
  let best = 1;
  for (let e = 0; e < 12; e++) {
    const p = Math.pow(10, e);
    for (const m of [1, 2, 4, 5, 9]) {
      const v = m * p;
      if (v <= max && v > best) best = v;
    }
  }
  return best;
}

// Candidați „rotunzi” pentru pasul de axă (kW / W), crescând.
const AXIS_CANDIDATES = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 5000, 10000, 20000, 50000];

/**
 * Pas de AXĂ Y: cel mai mic candidat rotund la care max-ul produce ≤ 5 ticks
 * (deci pentru max ~3 kW → ticks 0, 1, 2, 3 kW; pentru max ~1,5 kW → 0, 0,5, 1, 1,5).
 */
function axisStep(max) {
  const m = Math.max(1, max);
  for (const c of AXIS_CANDIDATES) {
    if (Math.ceil(m / c) <= 5) return c;
  }
  return Math.pow(10, Math.floor(Math.log10(m)));
}

/** Segmente consecutive non-null: [[i0,i1,...],[j0,j1,...], ...] */
function segments(arr) {
  const segs = []; let cur = [];
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] != null) cur.push(i);
    else { if (cur.length) segs.push(cur); cur = []; }
  }
  if (cur.length) segs.push(cur);
  return segs;
}

/**
 * Parsează răspunsul HA `history/history_during_period` → serii pe grilă de 5 min.
 * Input:  { entity_id: [{s:"192", lu:1794463158.9}, ...], ... }   (s = stare text, lu = secunde epoch)
 * Output: { times:number[], pv, imp, exp, chg, dis, soc, cons: (number|null)[] }
 *
 * Reguli:
 *  - grilă 5 min: t0 = floor(minLu/300)*300, până la maxLu.
 *  - „ultima valoare valabilă rămâne” (forward-fill): pentru o grilă t,
 *      valoarea = cea mai recentă stare VALABILĂ cu lu <= t; dacă nu e nicio
 *      stare valabilă înainte → null (nu e încă nimic). unavailable/unknown/NaN
 *      NU sunt „valori valide” (nu preiau forward-fill) și lasă GOL în linie, nu 0.
 *  - consum (cons) = formula HOUSE_W per punct: max(0, pv+imp-exp+dis-chg), doar
 *    când toate cele 5 componente sunt non-null (altfel null = gol).
 *
 * @param {object} raw  – răspunsul callWS (dict entity_id → [puncte])
 * @param {object} ents – { pv, imp, exp, chg, dis, soc } → entity_id
 * @param {object} opts – { consum_entity } opțional (senzor de consum direct)
 */
function parseHistory(raw, ents, opts) {
  opts = opts || {};
  const raw2 = raw || {};
  // intervalul [minLu, maxLu]
  let minLu = Infinity, maxLu = -Infinity;
  for (const pts of Object.values(raw2))
    for (const p of pts || []) { if (p.lu < minLu) minLu = p.lu; if (p.lu > maxLu) maxLu = p.lu; }
  if (!isFinite(minLu) || !isFinite(maxLu)) return null;

  const STEP = 300; // 5 min
  const t0 = Math.floor(minLu / STEP) * STEP;
  const times = [];
  for (let t = t0; t <= maxLu; t += STEP) times.push(t);

  // forward-fill pe grilă pentru o entitate
  function seriesFor(eid) {
    const out = new Array(times.length).fill(null);
    const pts = raw2[eid];
    if (!pts || !pts.length) return out;
    const sorted = [...pts].sort((a, b) => a.lu - b.lu);
    let pi = 0, last = null;
    for (let ti = 0; ti < times.length; ti++) {
      while (pi < sorted.length && sorted[pi].lu <= times[ti]) {
        const s = sorted[pi].s, n = parseFloat(s);
        if (s === 'unavailable' || s === 'unknown' || Number.isNaN(n)) last = null;
        else last = n;
        pi++;
      }
      out[ti] = last;
    }
    return out;
  }

  const pv  = ents.pv  ? seriesFor(ents.pv)  : new Array(times.length).fill(null);
  const imp = ents.imp ? seriesFor(ents.imp) : new Array(times.length).fill(null);
  const exp = ents.exp ? seriesFor(ents.exp) : new Array(times.length).fill(null);
  const chg = ents.chg ? seriesFor(ents.chg) : new Array(times.length).fill(null);
  const dis = ents.dis ? seriesFor(ents.dis) : new Array(times.length).fill(null);
  const soc = ents.soc ? seriesFor(ents.soc) : new Array(times.length).fill(null);

  // consum: HOUSE_W per punct (toate componente non-null) sau consum_entity
  let cons;
  if (opts.consum_entity && raw2[opts.consum_entity]) {
    cons = seriesFor(opts.consum_entity);
  } else {
    cons = new Array(times.length).fill(null);
    for (let i = 0; i < times.length; i++) {
      if (pv[i]!=null && imp[i]!=null && exp[i]!=null && dis[i]!=null && chg[i]!=null)
        cons[i] = Math.max(0, pv[i] + imp[i] - exp[i] + dis[i] - chg[i]);
    }
  }
  return { times, pv, imp, exp, chg, dis, soc, cons };
}

/**
 * Construiește SVG-ul graficului 24h (stil neon): zonă cyan cu gradient, linii cu glow,
 * grilă fină, legendă cu puncte. Font >= 16, ticks rotunde, gaps pentru null.
 * @param {object} o – { pv, cons, soc, imp, exp, width, height, times }
 */
/** Scara de text a graficelor, după lățimea desenului (1 unitate = 1 px): telefon / intermediar / tabletă. */
function fsFor(W) {
  return W < 420 ? { tick: 11, legend: 11, val: 11 } : W < 640 ? { tick: 13, legend: 13, val: 13 } : { tick: 18, legend: 16, val: 16 };
}

function buildGraphSVG(o) {
  const W = o.width || 800, H = o.height || 320;
  const AC = o.accent || '#19e6ff';   // culoarea accentului (grilă)
  const FS = fsFor(W);
  const PAD = W < 420 ? { top: 34, right: 12, bottom: 28, left: 50 } : W < 640 ? { top: 40, right: 16, bottom: 34, left: 60 } : { top: 22, right: 18, bottom: 44, left: 84 };
  const pW = W - PAD.left - PAD.right, pH = H - PAD.top - PAD.bottom;
  const pv = o.pv || [], cons = o.cons || [], soc = o.soc || [], imp = o.imp || [], exp = o.exp || [];
  const N = Math.max(1, pv.length || cons.length || soc.length || imp.length || exp.length || 1);

  // scara Y (putere): max rotund, pas de axă pentru ticks 0/1/2/3 kW
  let mx = 0;
  for (const a of [pv, cons, imp, exp]) for (const v of a) if (v != null && v > mx) mx = v;
  const yStep = axisStep(mx);
  const maxY = Math.max(yStep, Math.ceil(mx / yStep) * yStep);

  const x = (i) => PAD.left + (i / Math.max(1, N - 1)) * pW;
  const y = (w) => PAD.top + pH - (w / maxY) * pH;
  const base = PAD.top + pH;

  // polyline pe segmente (gaps la null)
  function poly(arr, yFn, stroke, w, glow) {
    let s = '';
    for (const seg of segments(arr)) {
      if (seg.length < 2) continue;
      s += `<polyline points="${seg.map((i)=>x(i).toFixed(1)+','+yFn(arr[i]).toFixed(1)).join(' ')}" fill="none" stroke="${stroke}" stroke-width="${w||2}" stroke-linejoin="round" stroke-linecap="round"${glow ? ' filter="url(#eg-glow)"' : ''}/>`;
    }
    return s;
  }
  // zonă pe segmente
  function zone(arr, yFn, baseY, fill) {
    let s = '';
    for (const seg of segments(arr)) {
      if (seg.length < 2) continue;
      let d = `M${x(seg[0]).toFixed(1)},${baseY.toFixed(1)}`;
      for (const i of seg) d += ` L${x(i).toFixed(1)},${yFn(arr[i]).toFixed(1)}`;
      d += ` L${x(seg[seg.length-1]).toFixed(1)},${baseY.toFixed(1)} Z`;
      s += `<path d="${d}" fill="${fill}"/>`;
    }
    return s;
  }

  // ticks X: ore (HH:MM) + grilă verticală fină
  let xT = '';
  const times = o.times || [];
  const xTickCount = Math.min(W < 640 ? 5 : 7, N);
  for (let k = 0; k < xTickCount && xTickCount > 1; k++) {
    const i = Math.round((k / (xTickCount - 1)) * (N - 1));
    const px = x(i);
    const label = (times && times[i]) ?
      new Date(times[i] * 1000).toTimeString().slice(0, 5) :
      String(Math.floor((i * 5) / 60)).padStart(2, '0') + ':' + String((i * 5) % 60).padStart(2, '0');
    xT += `<line x1="${px.toFixed(1)}" y1="${PAD.top}" x2="${px.toFixed(1)}" y2="${base.toFixed(1)}" stroke="${AC}" stroke-opacity="0.12"/>`;
    const lastTick = (k === xTickCount - 1);
    xT += `<text x="${(lastTick ? px + 6 : px).toFixed(1)}" y="${H-(W < 640 ? 8 : 10)}" fill="#e8fbff" font-size="${FS.tick}" text-anchor="${lastTick ? 'end' : 'middle'}">${label}</text>`;
  }

  // ticks Y: 0, step, 2*step, ... (rotunde, kW cu virgulă) + grilă orizontală fină
  let yT = '';
  for (let v = 0; v <= maxY + 0.5; v += yStep) {
    const py = y(v);
    const lbl = v >= 1000 ? (v / 1000).toFixed(1).replace('.', ',') + ' kW' : String(Math.round(v)) + ' W';
    yT += `<text x="${(PAD.left-(W < 640 ? 6 : 10)).toFixed(1)}" y="${(py+FS.tick*0.34).toFixed(1)}" fill="#e8fbff" font-size="${FS.tick}" text-anchor="end">${lbl}</text>`;
    if (v > 0) yT += `<line x1="${PAD.left}" y1="${py.toFixed(1)}" x2="${(W-PAD.right).toFixed(1)}" y2="${py.toFixed(1)}" stroke="${AC}" stroke-opacity="0.12"/>`;
  }

  // SOC: linie albă (scara proprie 0–100%, în același cadru)
  let sP = '';
  for (const seg of segments(soc)) {
    if (seg.length < 2) continue;
    sP += `<polyline points="${seg.map((i)=>x(i).toFixed(1)+','+(base-(soc[i]/100)*pH).toFixed(1)).join(' ')}" fill="none" stroke="#ffffff" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" filter="url(#eg-glow-soft)"/>`;
  }

  // legendă (sus-dreapta, în interiorul cadrului)
  let legend;
  if (W < 640) {
    // card îngust: legenda pe un rând, deasupra graficului (nu acoperă curbele)
    const items = [['#ffa726', 'Solar'], ['#ff3df0', 'Consum'], ['#ffffff', 'SOC']];
    let lxx = PAD.left, parts = '';
    for (const [col, lbl] of items) {
      const r = Math.round(FS.legend * 0.4);
      parts += `<circle cx="${lxx + r}" cy="${PAD.top - 20}" r="${r}" fill="${col}"/><text x="${lxx + 2 * r + 5}" y="${PAD.top - 20 + FS.legend * 0.34}" fill="#e8fbff" font-size="${FS.legend}">${lbl}</text>`;
      lxx += 2 * r + 5 + lbl.length * FS.legend * 0.62 + 14;
    }
    legend = parts;
  } else {
    const lx = W - PAD.right - 214, ly = PAD.top + 14;
    legend =
      `<circle cx="${lx}" cy="${ly}" r="7" fill="#ffa726"/><text x="${lx+16}" y="${ly+6}" fill="#e8fbff" font-size="16">Producție solară</text>` +
      `<circle cx="${lx}" cy="${ly+28}" r="7" fill="#ff3df0"/><text x="${lx+16}" y="${ly+34}" fill="#e8fbff" font-size="16">Consum</text>` +
      `<circle cx="${lx}" cy="${ly+56}" r="7" fill="#ffffff"/><text x="${lx+16}" y="${ly+62}" fill="#e8fbff" font-size="16">SOC baterie (%)</text>`;
  }

  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;">
<defs>
<linearGradient id="eg-pv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffa726" stop-opacity="0.62"/><stop offset="1" stop-color="#ffa726" stop-opacity="0.06"/></linearGradient>
<filter id="eg-glow" x="-5%" y="-30%" width="110%" height="160%"><feGaussianBlur stdDeviation="3.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="eg-glow-soft" x="-5%" y="-30%" width="110%" height="160%"><feGaussianBlur stdDeviation="1.8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
${yT}${xT}
<line x1="${PAD.left}" y1="${PAD.top}" x2="${PAD.left}" y2="${base.toFixed(1)}" stroke="#e8fbff" stroke-opacity="0.75" stroke-width="2"/>
<line x1="${PAD.left}" y1="${base.toFixed(1)}" x2="${(W-PAD.right).toFixed(1)}" y2="${base.toFixed(1)}" stroke="#e8fbff" stroke-opacity="0.75" stroke-width="2"/>
${zone(pv, y, base, 'url(#eg-pv)')}
${poly(pv, y, '#ffa726', 4, true)}
${poly(cons, y, '#ff3df0', 3.5, true)}
${sP}
${legend}
</svg>`;
}

/** Bare 7 zile (kWh/zi). Font >= 16, ticks rotunde. */
function buildBars7d(o) {
  const W = o.width || 800, H = o.height || 220;
  const FS = fsFor(W);
  const PAD = W < 420 ? { top: 24, right: 12, bottom: 28, left: 40 } : { top: 28, right: 24, bottom: 40, left: 64 };
  const pW = W - PAD.left - PAD.right, pH = H - PAD.top - PAD.bottom;
  const vals = o.kwhPerDay || [], labels = o.dayLabels || [];
  const mx = Math.max(1, ...vals);
  const yStep = axisStep(mx);
  const maxY = Math.max(yStep, Math.ceil(mx / yStep) * yStep);
  const n = Math.max(1, vals.length);
  const slot = pW / n;
  const bw = slot * 0.62;
  let bars = '';
  vals.forEach((v, i) => {
    const bx = PAD.left + i * slot + (slot - bw) / 2;
    const bh = (v / maxY) * pH, by = PAD.top + pH - bh;
    bars += `<rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" fill="#00e5ff" opacity="0.7" rx="2"/>`;
    bars += `<text x="${(bx+bw/2).toFixed(1)}" y="${(by-4).toFixed(1)}" fill="#cfe" font-size="${FS.val}" text-anchor="middle">${v.toFixed(1).replace('.', ',')}</text>`;
    bars += `<text x="${(bx+bw/2).toFixed(1)}" y="${H-8}" fill="#7fd" font-size="${FS.val}" text-anchor="middle">${labels[i] || ''}</text>`;
  });
  let yT = '';
  for (let v = 0; v <= maxY + 0.5; v += yStep) {
    const py = PAD.top + pH - (v / maxY) * pH;
    const lbl = v >= 1000 ? (v / 1000).toFixed(1).replace('.', ',') + ' kWh' : String(Math.round(v)) + ' kWh';
    yT += `<text x="${(PAD.left-6).toFixed(1)}" y="${(py+5).toFixed(1)}" fill="#7fd" font-size="${FS.val}" text-anchor="end">${lbl}</text>`;
    if (v > 0) yT += `<line x1="${PAD.left}" y1="${py.toFixed(1)}" x2="${(W-PAD.right).toFixed(1)}" y2="${py.toFixed(1)}" stroke="#00e5ff11"/>`;
  }
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;">
${yT}${bars}
<text x="${(W-PAD.right-52).toFixed(1)}" y="${(PAD.top+14).toFixed(1)}" fill="#7fd" font-size="${FS.val}">kWh/zi</text>
</svg>`;
}

/**
 * Date 24h de TEST/MACHETĂ (sinus solar, 289 puncte la 5 min).
 * NU e apelat de card în producție — doar din preview printr-un hook și din teste.
 */
function generateFake24h() {
  const N = 289;
  const pv = [], cons = [], soc = [], imp = [], exp = [];
  for (let i = 0; i < N; i++) {
    const h = i * 5 / 60;
    const s = (h >= 6 && h <= 18) ? Math.sin((h - 6) / 12 * Math.PI) * 3000 : 0;
    pv.push(s);
    const c = 500 + 1000 * Math.exp(-((h-8)**2)/8) + 800 * Math.exp(-((h-20)**2)/6);
    cons.push(c); soc.push(30 + 50 * Math.sin((h-6)/24 * 2 * Math.PI));
    imp.push(Math.max(0, c - s)); exp.push(Math.max(0, s - c));
  }
  return { pv, cons, soc, imp, exp, times: [] };
}

/** Date 7 zile (test/machetă). */
function generateFake7d() {
  return { kwhPerDay: [14,18,11,16,9,12,7].map(v=>v+Math.sin(v)*1.5),
           dayLabels: ['Lu','Ma','Mi','Jo','Vi','S\u0103','Du'], width: 800, height: 220 };
}

/** Tooltip: valorile momentului la un index. Folosește d.times dacă există. */
function tooltipInfo(d, idx) {
  if (!d || !d.pv || !d.pv.length) return { time: '—', prod: 0, cons: 0, soc: null };
  const i = Math.max(0, Math.min(d.pv.length - 1, Math.round(idx)));
  let time;
  if (d.times && d.times[i]) {
    time = new Date(d.times[i] * 1000).toTimeString().slice(0, 5);
  } else {
    const m = i * 5;
    time = String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
  }
  return { time, prod: d.pv[i] != null ? d.pv[i] : 0,
           cons: d.cons && d.cons[i] != null ? d.cons[i] : 0,
           soc: d.soc && d.soc[i] != null ? d.soc[i] : null };
}


/* ===== theme-cyber.js ===== */
// src/theme-cyber.js — „pielea” vizuală cyber (după referinta/cyber-chatgpt.webp).
// Se adaugă DUPĂ CYBER_CSS din card.js și îl suprascrie. Doar CSS, fără logică.
// Reguli: text >= 16px, butoane >= 48px, fără fonturi/resurse externe.
// Accentul fiecărui panou vine din variabila --ac (setată inline de card.js).

const CYBER_SKIN = `
:host { --cy:#19e6ff; --mg:#ff3df0; --gr:#7dff3a; --yl:#ffd23a; }
.card { background:
    radial-gradient(120% 60% at 50% 0%, #0b2a3d55 0%, transparent 70%),
    linear-gradient(rgba(25,230,255,.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(25,230,255,.04) 1px, transparent 1px), #050b14;
  background-size: auto, 22px 22px, 22px 22px, auto;
  border: 2px solid #19e6ff88; border-radius: 16px; padding: 14px;
  box-shadow: 0 0 22px #19e6ff33, inset 0 0 34px #19e6ff14;
  font-family: "Rajdhani","Bahnschrift","Roboto Condensed","Segoe UI",system-ui,sans-serif;
  font-variant-numeric: tabular-nums; letter-spacing: .02em; }

/* antet: casă în cutie + titlu + ceas */
.head { display: flex; align-items: center; justify-content: space-between; gap: 12px;
  border: 2px solid #19e6ff99; border-radius: 14px; padding: 8px 14px 8px 8px; margin-bottom: 12px;
  background: linear-gradient(90deg, #0a2433, #06111c); box-shadow: 0 0 12px #19e6ff33, inset 0 0 16px #19e6ff1a; }
.head-ico { flex: 0 0 auto; display: grid; place-items: center; width: 52px; height: 52px;
  border: 2px solid #19e6ffaa; border-radius: 12px; background: #071a26; }
.head .title { flex: 1; min-width: 0; font-size: 18px; line-height: 1.25; color: #e8fbff; text-shadow: none; }
.title-warn { color: #ff7af4; }
.clock { display: flex; flex-direction: column; align-items: flex-end; line-height: 1.05; font-size: 22px; font-weight: 700; color: #7ff3ff; flex: 0 0 auto; }
.clock-d { font-size: 16px; font-weight: 600; color: #9fc4d0; white-space: nowrap; letter-spacing: 0; }
.hi { display: inline-block; white-space: nowrap; }
.hI { display: none; vertical-align: -2px; margin-right: 2px; }
.hv { font-size: 23px; font-weight: 700; margin: 0 2px; }
.hv-neg { color: #ff3df0; }
.hv-pos { color: #ffa726; }
.hv-bat { color: #7dff3a; }

/* plăci: 2 × 2, accent per placă */
.plates { grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 12px; }
.plate { --ac: #19e6ff; clip-path: none; border: 2px solid var(--ac); border-radius: 14px;
  padding: 12px 14px; gap: 14px; min-height: 112px; align-items: center;
  background: linear-gradient(155deg, #0b1c2b, #050e17);
  box-shadow: 0 0 14px color-mix(in srgb, var(--ac) 45%, transparent), inset 0 0 22px color-mix(in srgb, var(--ac) 16%, transparent); }
.tile-icon { filter: drop-shadow(0 0 5px var(--ac)); }
.plate-label { font-size: 20px; font-weight: 700; letter-spacing: .14em; color: var(--ac); }
.plate .plate-val { font-size: 34px; font-weight: 700; line-height: 1.1; color: var(--ac);
  text-shadow: 0 0 12px color-mix(in srgb, var(--ac) 60%, transparent); }
.plate .plate-val.dash { color: #4b6070; text-shadow: none; }
.plate-arrow { font-size: 18px; color: #e8fbff; }

/* butoane/taburi paralelogram */
.tabs, .sys-chips { gap: 4px; }
.tab, .sys-chip { border: 0; min-height: 48px; padding: 8px 28px; font-size: 20px; font-weight: 700;
  font-family: inherit; color: #19e6ff; background: #0a2231;
  clip-path: polygon(14px 0, 100% 0, calc(100% - 14px) 100%, 0 100%); }
.tab.active, .sys-chip[aria-pressed="true"] { color: #00131a; background: linear-gradient(180deg, #5cf2ff, #19e6ff);
  box-shadow: none; }

/* panouri mari: grafic, flux, baterie, invertoare */
.graph-wrap, .flow-wrap { border: 2px solid #19e6ff99; border-radius: 14px; padding: 12px;
  background: linear-gradient(180deg, #071624, #050c15); box-shadow: 0 0 12px #19e6ff33, inset 0 0 20px #19e6ff10; }
.graph-wrap { margin-top: 12px; }
.flow-wrap { margin-top: 12px; }
.bi-wrap { gap: 10px; margin-top: 12px; }
.bi-panel { --ac: #19e6ff; clip-path: none; border: 2px solid var(--ac); border-radius: 14px; padding: 12px 14px;
  background: linear-gradient(160deg, #0a1b2a, #050d16); margin-top: 12px;
  box-shadow: 0 0 12px color-mix(in srgb, var(--ac) 40%, transparent), inset 0 0 20px color-mix(in srgb, var(--ac) 14%, transparent); }
.bi-wrap .bi-panel { margin-top: 0; }
.bi-title { font-size: 24px; font-weight: 700; letter-spacing: .06em; text-transform: none; color: var(--ac);
  text-shadow: 0 0 10px color-mix(in srgb, var(--ac) 55%, transparent); }
.bi-k { color: #9fd9e6; }
.bi-v { color: #fff; font-size: 18px; }

/* gauge baterie: 10 celule pe toată lățimea */
.bat-gauge-wrap { flex-wrap: wrap; gap: 8px; margin-bottom: 10px; }
.bat-gauge { flex: 1 1 100%; gap: 5px; padding: 6px; border: 2px solid #7dff3a99; border-radius: 10px; background: #06130b; }
.bat-gauge .cell { flex: 1; min-width: 0; height: 34px; border-radius: 4px; background: #0b1f12; border: 1px solid #7dff3a33; }
.bat-gauge .cell.filled { border-color: #ffffff55; box-shadow: 0 0 10px #ffffff40, inset 0 0 6px #ffffff55; }
.bat-sum { font-size: 20px; color: #e8fbff; }

/* statistici: cartonașe cu accent */
.azi { grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 12px; }
.stat { --ac: #19e6ff; border: 2px solid var(--ac); border-radius: 12px; padding: 10px 12px;
  background: linear-gradient(160deg, #0a1b2a, #050d16);
  box-shadow: 0 0 10px color-mix(in srgb, var(--ac) 35%, transparent), inset 0 0 16px color-mix(in srgb, var(--ac) 12%, transparent); }
.stat:nth-child(1) { --ac: #ffa726; }
.stat:nth-child(2) { --ac: #ff3df0; }
.stat:nth-child(5) { --ac: #ff4d5e; }
.stat:nth-child(6) { --ac: #3dff9a; }
.stat:nth-child(3), .stat:nth-child(4), .stat:nth-child(8) { --ac: #7dff3a; }
.stat:nth-child(7) { --ac: #ffffff; }
.stat-k { color: var(--ac); font-size: 18px; font-weight: 700; }
.stat-v { font-size: 28px; font-weight: 700; color: #fff; margin-top: 4px; }
.stat-v.dash { color: #4b6070; }

/* consumatori + extras */
.consumers { margin-top: 12px; }
.group-title { color: #19e6ff; font-size: 18px; font-weight: 700; }
.consumer { border: 2px solid #19e6ff66; border-radius: 12px; margin-bottom: 8px; padding: 10px 12px;
  background: linear-gradient(160deg, #0a1b2a, #050d16); }
.c-name { font-size: 18px; }
.c-w { font-size: 20px; color: #ff7af4; }
.c-bar { height: 8px; border-radius: 4px; background: #19e6ff22; }
.c-bar-fill { border-radius: 4px; background: linear-gradient(90deg, #19e6ff, #5cf2ff); box-shadow: 0 0 8px #19e6ff88; }
.extra-chip { border: 2px solid #19e6ff44; border-radius: 12px; background: #071624; min-height: 48px; }
.graph-tip { font-size: 18px; }

/* ===== potrivire cu poza de referință ===== */
/* plăci: 3 pe rând (Casă e în antet) */
.plates { grid-template-columns: repeat(3, 1fr); gap: 10px; }
.card.has-head .plate-house { display: none; }
.card:not(.has-head) .plates { grid-template-columns: repeat(2, 1fr); }
.plate { padding: 12px 12px; gap: 10px; min-height: 124px; min-width: 0; }
.plate .tile-icon { width: 56px; height: 56px; flex: 0 0 auto; }
.plate-text { min-width: 0; }
.plate-label { font-size: 20px; }
.plate .plate-val { font-size: 32px; white-space: nowrap; }
.plate-arrow { font-size: 18px; }

/* baterie: o singură bară (gauge + procent + rezumat) */
.bi-battery { display: flex; flex-direction: column; padding: 14px 16px; position: relative; overflow: hidden; }
.bi-battery .bi-title, .bi-battery .bi-row { display: none; }
.bi-battery .bat-gauge-wrap { flex-wrap: nowrap; align-items: center; gap: 14px; margin: 0; }
.bi-battery .bat-gauge { flex: 0 0 230px; position: relative; padding: 5px; gap: 3px;
  border: 3px solid #7dff3a; border-radius: 10px; background: #06130b; margin-right: 12px; }
.bi-battery .bat-gauge::after { content: ''; position: absolute; right: -13px; top: 28%; width: 8px; height: 44%;
  border-radius: 0 4px 4px 0; background: var(--bat, #7dff3a); }
.bi-battery .bat-gauge .cell { height: 40px; }
.bat-pct { font-size: 46px; font-weight: 700; color: #fff; line-height: 1; padding-right: 14px;
  border-right: 2px solid #7dff3a55; }
.bi-battery .bat-sum { display: flex; flex-direction: column; gap: 2px; min-width: 0; font-size: 22px; color: #e8fbff; }
.bat-sep { display: none; }
.bat-aut { color: #7dff3a; }
.bi-battery::after { content: ''; position: absolute; right: 0; bottom: 0; width: 64px; height: 34px; opacity: .55;
  background: repeating-linear-gradient(135deg, transparent 0 7px, #19e6ff 7px 9px);
  clip-path: polygon(100% 0, 100% 100%, 0 100%); pointer-events: none; }

/* invertoare */
.bi-wrap .bi-title { font-size: 30px; }
.bi-wrap .bi-row { min-height: 34px; }
.bi-wrap .bi-k { font-size: 20px; }
.bi-wrap .bi-v { font-size: 24px; }

/* jos: statistici (3 col.) + consumatori */
.bottom { display: grid; grid-template-columns: minmax(0, 1.75fr) minmax(0, 1fr); gap: 10px; margin-top: 12px; align-items: start; }
.bottom:not(:has(.consumers)) { grid-template-columns: 1fr; }
.azi { grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 0; }
.azi .stat:nth-child(4), .azi .stat:nth-child(8) { display: none; }
.stat { padding: 10px 10px 12px; min-width: 0; }
.stat-head { display: flex; align-items: center; gap: 8px; color: var(--ac); }
.stat-ico { flex: 0 0 auto; }
.stat-k { font-size: 17px; white-space: nowrap; }
.stat-v { font-size: 30px; margin-top: 6px; line-height: 1.05; }
.stat-u { display: block; font-size: 18px; font-weight: 600; color: #cfeff5; margin-top: 2px; }
.consumers { margin-top: 0; border: 2px solid #19e6ff99; border-radius: 14px; padding: 12px 14px;
  background: linear-gradient(160deg, #0a1b2a, #050d16); box-shadow: 0 0 12px #19e6ff33, inset 0 0 18px #19e6ff10; }
.cons-head { display: flex; align-items: center; gap: 10px; font-size: 20px; font-weight: 700; color: #e8fbff; margin-bottom: 8px; }
.cons-dot { width: 12px; height: 12px; border-radius: 50%; background: #7dff3a; box-shadow: 0 0 8px #7dff3a; }
.consumers .group-title, .consumers .c-bottom { display: none; }
.consumers .consumer { border: 0; background: none; padding: 6px 0; margin: 0; min-height: 48px; border-radius: 0; }
.consumers .c-icon { color: #19e6ff; width: 34px; font-size: 26px; }
.consumers .c-name { font-size: 18px; color: #e8fbff; }
.consumers .c-w { font-size: 20px; color: #e8fbff; display: block; }
.consumers .c-top { flex-direction: column; align-items: flex-start; gap: 0; }


/* caseta de preț */
.prices { display: flex; gap: 10px; margin-top: 12px; }
.price { flex: 0 1 auto; display: flex; flex-direction: column; gap: 6px; min-width: 0; border: 2px solid #ffd23a; border-radius: 12px;
  padding: 10px 12px; background: linear-gradient(160deg, #1a1608, #0a0a08);
  box-shadow: 0 0 10px #ffd23a40, inset 0 0 16px #ffd23a14; }
.price-k { font-size: 18px; font-weight: 700; color: #ffd23a; }
.price-f { display: flex; align-items: center; gap: 8px; }
.price-in { flex: 0 0 auto; width: 5.2em; min-width: 0; min-height: 48px; box-sizing: border-box; font: inherit; font-size: 26px; font-weight: 700;
  color: #fff; background: #06121c; border: 2px solid #ffd23a88; border-radius: 10px; padding: 4px 10px; text-align: right; }
.price-in:focus { outline: none; border-color: #ffd23a; box-shadow: 0 0 10px #ffd23a88; }
.price-u { font-size: 18px; color: #cfeff5; white-space: nowrap; }



/* varianta compactă */
.compact { display: flex; flex-direction: column; gap: 6px; }
.cbox { cursor: pointer; filter: drop-shadow(0 0 2px #19e6ff33); }
.card.slim { padding: 6px; border-radius: 14px; }
.cstats3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
.cq { --ac: #19e6ff; min-width: 0; border: 2px solid var(--ac); border-radius: 10px; padding: 3px 8px 5px;
  background: linear-gradient(160deg, #0a1b2a, #050d16);
  box-shadow: 0 0 8px color-mix(in srgb, var(--ac) 35%, transparent), inset 0 0 12px color-mix(in srgb, var(--ac) 12%, transparent); }
.cq-k { display: block; font-size: 16px; font-weight: 700; color: var(--ac); white-space: nowrap; line-height: 1.15; }
.cq-v { display: block; font-size: 21px; font-weight: 700; color: #fff; white-space: nowrap; line-height: 1.15; }
.cq-u { font-size: 16px; font-weight: 600; color: #cfeff5; margin-left: 4px; }


/* compact-small:start — carduri compacte în coloană îngustă (≤ 400 px): text mic, ca restul vederii */
@container (max-width: 400px) {
  .card.slim { padding: 4px; }
  .compact { gap: 4px; }
  .cstats3 { gap: 4px; }
  .cq { padding: 2px 6px 4px; border-radius: 8px; }
  .cq-k { font-size: 11px; }
  .cq-v { font-size: 13px; }
  .cq-u { font-size: 11px; margin-left: 3px; }
}
/* compact-small:end */

/* ===== card îngust (coloană de tabletă/telefon): se adaptează lățimii cardului, nu a ferestrei ===== */
:host { container-type: inline-size; }
@container (max-width: 640px) {
  .card { padding: 10px; }
  .head { gap: 8px; padding: 6px 10px 6px 6px; }
  .head-ico { width: 44px; height: 44px; }
  .head .title { font-size: 16px; }
  .hv { font-size: 19px; }
  .clock { font-size: 18px; }
  .plates { gap: 6px; }
  .plate { flex-direction: column; align-items: flex-start; gap: 6px; padding: 10px 8px; min-height: 0; }
  .plate .tile-icon { width: 40px; height: 40px; }
  .plate-label { font-size: 16px; letter-spacing: .06em; }
  .plate .plate-val { font-size: 25px; }
  .plate-arrow { font-size: 16px; }
  .tabs { flex-wrap: wrap; }
  .tab, .sys-chip { padding: 8px 18px; font-size: 18px; }
  .graph-wrap, .flow-wrap { padding: 8px; }
  .bi-battery .bat-gauge-wrap { flex-wrap: wrap; }
  .bi-battery .bat-gauge { flex: 1 1 100%; margin-right: 12px; }
  .bat-pct { font-size: 38px; }
  .bi-battery .bat-sum { font-size: 18px; }
  .bi-wrap .bi-title { font-size: 24px; }
  .bi-wrap .bi-k { font-size: 16px; }
  .bi-wrap .bi-v { font-size: 20px; }
  .bottom { grid-template-columns: 1fr; }
  .azi { grid-template-columns: repeat(2, 1fr); }
  .stat-v { font-size: 26px; }
  .prices { flex-direction: column; }
  .price-in { font-size: 24px; }
}

/* telefon (iPhone ~ 370 px util): antetul rămâne pe UN singur rând, ca în design; textul se scalează cu lățimea cardului */
@container (max-width: 420px) {
  .head { padding: 6px 8px 6px 6px; gap: 6px; }
  .head-ico { width: 8.6cqw; height: 8.6cqw; min-width: 32px; min-height: 32px; }
  .head-ico svg { width: 70%; height: 70%; }
  .head .title { white-space: nowrap; overflow: hidden; font-size: 3.1cqw; line-height: 1.2; }
  .hv { font-size: 3.8cqw; margin: 0 .3cqw; }
  .hw { display: none; }
  .hI { display: inline-block; }
  .hb { display: none; }
  .hs { margin: 0 .4cqw; }
  .clock { font-size: 4.4cqw; }
  .clock-d { font-size: 3cqw; }
  .plate { padding: 10px 6px; }
  .plate .plate-val { font-size: 21px; }
}
/* plăci Solar / Rețea / Baterie: aceeași formă pătrată, dar mai mici, cu text scalat ca la butoanele de statistici
   (etichetă mică, valoare medie). Vine ULTIMUL ca să câștige peste regulile de mai sus. */
.plates { gap: 6px; margin-bottom: 8px; }
.plate { flex-direction: column; align-items: flex-start; gap: 3px; padding: 7px 8px 8px; min-height: 0; border-width: 1.6px; }
.plate .tile-icon { width: 26px; height: 26px; flex: 0 0 auto; }
.plate-text { display: grid; gap: 1px; min-width: 0; width: 100%; }
.plate-label { font-size: 16px; letter-spacing: .06em; line-height: 1.1; }
.plate .plate-val { font-size: 23px; line-height: 1.1; margin-top: 0; text-shadow: none; white-space: nowrap; }
.plate-arrow { font-size: 16px; line-height: 1.1; margin-top: 1px; white-space: nowrap; }
.plate-led { display: grid; gap: 0; margin-top: 3px; white-space: nowrap; font-size: clamp(10px, 3cqw, 12px); line-height: 1.18; font-weight: 600; }
.plate-led .led-i { color: #ff4d5e; }
.plate-led .led-e { color: #3dff9a; }
.plate-led .led-a { font-size: .8em; }
.plate-soc { margin-left: 4px; font-weight: 600; opacity: .9; letter-spacing: 0; }
/* telefon: ACELEAȘI dimensiuni ca în antet (titlu 3.1cqw, valori 3.8cqw, iconiță 6cqw) */
@container (max-width: 420px) {
  .plate .tile-icon { width: 6cqw; height: 6cqw; min-width: 20px; min-height: 20px; }
  .plate-label, .plate-arrow { font-size: 3.1cqw; }
  .plate .plate-val { font-size: 3.8cqw; }
  .plate { padding: 7px 8px 8px; }
}

/* telefon: O SINGURĂ scară pentru toate casetele (etichete 3.1cqw, valori 3.8cqw, iconițe 6cqw); forma rămâne */
@container (max-width: 420px) {
  .tab, .sys-chip { min-height: 36px; padding: 6px 14px; font-size: 3.4cqw; }
  .stat { padding: 7px 8px 8px; }
  .stat-head { gap: 6px; }
  .stat-ico { width: 6cqw; height: 6cqw; min-width: 18px; min-height: 18px; }
  .stat-k { font-size: 3.1cqw; }
  .stat-v { font-size: 3.8cqw; margin-top: 3px; }
  .stat-u { font-size: 3.1cqw; margin-top: 0; }
  .bi-battery { padding: 10px 12px; }
  .bi-battery .bat-gauge-wrap { flex-wrap: wrap; align-items: center; gap: 6px 10px; }
  .bi-battery .bat-gauge { flex: 1 1 100%; margin-right: 10px; padding: 4px; gap: 2px; }
  .bi-battery .bat-gauge .cell { height: 20px; border-radius: 3px; }
  .bi-battery .bat-gauge::after { right: -9px; width: 6px; }
  .bat-pct { font-size: 7cqw; padding-right: 10px; }
  .bi-battery .bat-sum { font-size: 3.1cqw; flex: 1; gap: 0; }
  .bi-battery::after { width: 40px; height: 20px; }
  .bi-wrap .bi-title { font-size: 3.8cqw; }
  .bi-wrap .bi-row { min-height: 26px; }
  .bi-wrap .bi-k { font-size: 3.1cqw; }
  .bi-wrap .bi-v { font-size: 3.8cqw; }
  .bi-panel { padding: 8px 10px; }
  .consumers { padding: 8px 10px; }
  .consumers .consumer { min-height: 34px; padding: 3px 0; }
  .consumers .c-icon { width: 6cqw; font-size: 6cqw; }
  .consumers .c-name { font-size: 3.1cqw; }
  .consumers .c-w { font-size: 3.8cqw; }
  .prices { flex-direction: row; gap: 6px; margin-top: 8px; }
  .price { padding: 6px 8px; gap: 3px; flex: 0 1 auto; }
  .cons-head { font-size: 3.8cqw; gap: 6px; }
  .cons-dot { width: 2.4cqw; height: 2.4cqw; min-width: 8px; min-height: 8px; }
  .price-f { gap: 6px; }
  .price-k, .price-u { font-size: 3.1cqw; }
  .price-in { font-size: 3.8cqw; min-height: 30px; width: 4.8em; flex: 0 1 4.8em; padding: 1px 6px; border-width: 1.6px; }
  .extra-chip { min-height: 36px; font-size: 3.1cqw; }
}
/* baterie: corp mic (~50%), umplere continuă proporțională, procentul pe baterie, capacitatea + autonomia dedesubt */
.bi-battery { padding: 10px 14px; }
.bi-battery .bat-gauge-wrap { flex-direction: row; flex-wrap: nowrap; align-items: center; gap: 0; margin: 0; }
.bi-battery .bat-gauge { position: relative; display: block; flex: 0 0 46%; width: auto; height: 34px; padding: 0; margin: 0 14px 0 0;
  border: 2px solid var(--bat, #7dff3a); border-radius: 8px; background: #06130b; }
.bi-battery .bat-gauge::after { right: -7px; top: 28%; width: 5px; height: 44%; border-radius: 0 3px 3px 0; }
.bat-level { position: absolute; left: 2px; top: 2px; bottom: 2px; border-radius: 5px; opacity: .9; box-shadow: 0 0 5px #ffffff30; }
.bi-battery .bat-pct { position: absolute; inset: 0; display: grid; place-items: center; padding: 0; border: 0; font-size: 20px;
  color: #fff; text-shadow: 0 1px 3px #000, 0 0 5px #000; }
.bi-battery .bat-sum { display: flex; flex-direction: column; justify-content: center; align-items: flex-start; text-align: left; font-size: 18px; gap: 2px; flex: 1; min-width: 0;
  border-left: 2px solid var(--bat-soft, #7dff3a66); padding-left: 12px; align-self: stretch; }
.bi-battery .bat-s1 { color: #e8fbff; white-space: nowrap; }
.bat-reserve { position: absolute; top: 2px; bottom: 2px; width: 2px; margin-left: -1px; background: #fff; opacity: .75; z-index: 1; border-radius: 1px; }
.bat-floor { background: #ff4d5e; opacity: .85; }
.bat-extra { font-size: .85em; color: #9fd9e6; white-space: nowrap; }
.bat-res { color: #ffd23a; }
.bat-lost { color: #ff9a3c; font-weight: 700; }
@container (max-width: 420px) {
  .bi-battery { padding: 8px 10px; }
  .bi-battery .bat-gauge { flex: 0 0 46%; height: 7.5cqw; min-height: 26px; margin-right: 12px; }
  .bi-battery .bat-pct { font-size: 3.8cqw; }
  .bi-battery .bat-sum { font-size: 3.1cqw; padding-left: 8px; }
}
.flow-wrap:has(.compact) { border: 0; padding: 0; background: none; box-shadow: none; }
/* antetul rămâne mereu pe UN rând (la nevoie _fitHead îl micșorează); starea bateriei scrisă ("se descarcă") doar pe card lat */
.head .title { white-space: nowrap; overflow: hidden; }
@container (max-width: 640px) { .hb { display: none; } }
/* colțuri teșite ca în designul inițial (sus-stânga + jos-dreapta tăiate, celelalte două puțin rotunjite).
   Fără corner-shape (nu există în Safari / WebView): clip-path taie colțul, iar diagonala se desenează cu gradient în ::before. */
.card, .head, .plate, .graph-wrap, .flow-wrap, .bi-panel, .stat, .consumers, .price, .cq {
  --cut: 14px; --bw: 2px; --bc: #19e6ff99; position: relative; border-radius: 0 8px 0 8px;
  clip-path: polygon(var(--cut) 0, 100% 0, 100% calc(100% - var(--cut)), calc(100% - var(--cut)) 100%, 0 100%, 0 var(--cut)); }
.card, .card.slim { border-radius: 0 10px 0 10px; }
.card { --cut: 26px; --bc: #19e6ff88; }
.card.slim { --cut: 18px; }
.plate, .stat, .bi-panel, .cq { --bc: var(--ac); }
.plate, .stat, .cq { --cut: 11px; }
.plate { --bw: 1.6px; }
.price { --cut: 11px; --bc: #ffd23a; }
.card::before, .head::before, .plate::before, .graph-wrap::before, .flow-wrap::before, .bi-panel::before, .stat::before, .consumers::before, .price::before, .cq::before {
  content: ''; position: absolute; inset: calc(-1 * var(--bw)); pointer-events: none; z-index: 2;   /* absolute se măsoară de la marginea INTERIOARĂ; compensăm grosimea bordurii */
  background:
    linear-gradient(135deg, transparent calc(50% - 0.5px), var(--bc) calc(50% - 0.5px), var(--bc) calc(50% + var(--bw)), transparent calc(50% + var(--bw))) top left / var(--cut) var(--cut) no-repeat,
    linear-gradient(315deg, transparent calc(50% - 0.5px), var(--bc) calc(50% - 0.5px), var(--bc) calc(50% + var(--bw)), transparent calc(50% + var(--bw))) bottom right / var(--cut) var(--cut) no-repeat; }
.head-ico { border-radius: 6px; }
/* cardul „doar baterie”: o singură margine (a cardului), fără panou în panou */
.card.solo-battery .bi-battery { border: 0; background: none; box-shadow: none; clip-path: none; border-radius: 0; padding: 0; }
.card.solo-battery .bi-battery::before, .card.solo-battery .bi-battery::after { display: none; }
/* cardul „doar antet”: rămâne doar banda (cu marginea ei), fără cardul exterior → nu mai e card în card */
.card.solo-header { border: 0; background: none; box-shadow: none; clip-path: none; border-radius: 0; padding: 0; }
.card.solo-header::before { display: none; }
.card.solo-header .head { margin-bottom: 0; }
`;


/* ===== editor.js ===== */
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


/* ===== card.js ===== */
// src/card.js — web component energie-casa-card. FAZA 4: + Consumatori (grupare, bară %, more-info, „—").
// FAZA 6: + Baterie/Invertoare, diagramă flux (flow-svg), chip-uri sisteme (mode: separate).








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

class EnergieCasaCard extends HTMLElement {
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

export { EnergieCasaCard, eccDetectSensors };
