// src/calc.js — Funcții pure de calcul, fără DOM.
// Puteri in W, energii in kWh. Singura sursa de adevăr: formulele din PROMPT-AI-local.md.

/**
 * Citește o valoare numerică dintr-un state HA sau un număr direct.
 * Dacă unit_of_measurement === "kW", înmulțește cu 1000.
 * unavailable / unknown / NaN → { value: 0, missing: true }.
 * @param {object|number|string|null|undefined} x
 * @returns {{ value: number, missing: boolean }}
 */
export function num(x) {
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
export function houseW(pvW, importW, exportW, dischargeW, chargeW) {
  const w = pvW + importW - exportW + dischargeW - chargeW;
  return Math.max(0, w);
}

/** HOUSE_KWH = prod + import − export − încărcare + descărcare (toate kWh). */
export function houseKwh(pvKwh, importKwh, exportKwh, batChargeKwh, batDischargeKwh) {
  return pvKwh + importKwh - exportKwh - batChargeKwh + batDischargeKwh;
}

/** Autoconsum % = clamp((prod − export) / prod × 100, 0, 100). Null dacă prod === 0. */
export function autoconsumPct(prodKwh, exportKwh) {
  if (prodKwh === 0) return null;
  return Math.max(0, Math.min(100, ((prodKwh - exportKwh) / prodKwh) * 100));
}

/** Autonomie % = clamp((house − import) / house × 100, 0, 100). Null dacă house === 0. */
export function autonomiePct(houseKwh, importKwh) {
  if (houseKwh === 0) return null;
  return Math.max(0, Math.min(100, ((houseKwh - importKwh) / houseKwh) * 100));
}

/**
 * Economie lei = (prod − export) × tarif + export × pretExport.
 * @returns {number|null} null dacă tarif e necunoscut (null/undefined)
 */
export function economieLei(prodKwh, exportKwh, tarif, pretExport) {
  if (tarif === null || tarif === undefined) return null;
  const pe = (pretExport === null || pretExport === undefined) ? 0 : pretExport;
  return (prodKwh - exportKwh) * tarif + exportKwh * pe;
}

/** BAT_KWH = capacitate × SOC / 100. */
export function batKwh(capacityKwh, socPct) {
  if (capacityKwh === null || capacityKwh === undefined) return 0;
  return capacityKwh * socPct / 100;
}

/** BAT_ORE = batKwh / (dischargeW / 1000). Null dacă dischargeW ≤ 50. */
export function batOre(batKwh, dischargeW) {
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
export function calcAll(states, config) {
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
