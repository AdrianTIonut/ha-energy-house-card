// tests/calc.test.js — teste pentru calc.js (formule + capcane + flag-uri *Missing)
import { num, houseW, houseKwh, autoconsumPct, autonomiePct,
         economieLei, batKwh, batOre, calcAll } from '../src/calc.js';

let passed = 0, failed = 0;
function eq(label, got, want) {
  if (got === want) passed++;
  else { failed++; console.log('FAIL', label, '=> got', JSON.stringify(got), 'want', JSON.stringify(want)); }
}
function near(label, got, want, eps = 1e-6) {
  if (Math.abs(got - want) <= eps) passed++;
  else { failed++; console.log('FAIL', label, '=> got', got, 'want', want); }
}

// num: conversii + capcane
eq('num simple',      num(850).value, 850);
eq('num kW state',    num({ state: '1.5', attributes: { unit_of_measurement: 'kW' } }).value, 1500);
eq('num W state',     num({ state: '850', attributes: { unit_of_measurement: 'W' } }).value, 850);
eq('num unavailable', num({ state: 'unavailable' }).value, 0);
eq('num unavailable m', num({ state: 'unavailable' }).missing, true);
eq('num unknown',     num({ state: 'unknown' }).missing, true);
eq('num NaN',         num({ state: 'abc' }).missing, true);
eq('num null',        num(null).missing, true);
eq('num string',      num('7.802').value, 7.802);

// HOUSE_W: exemplul din prompt (192 PV, 7 import, 0 export, 983 descărcare, 0 încărcare)
eq('houseW exemplul', houseW(192, 7, 0, 983, 0), 1182);
eq('houseW negativ',  houseW(0, 0, 0, 0, 500), 0);
eq('houseW noapte',   houseW(0, 1200, 0, 0, 0), 1200);

// HOUSE_KWH: 15.83 + 7.802 − 3.082 − 6.7 + 1.3 = 15.15
near('houseKwh', houseKwh(15.83, 7.802, 3.082, 6.7, 1.3), 15.15);

// autoconsum / autonomie
near('autoconsum', autoconsumPct(15.83, 3.082), (15.83 - 3.082) / 15.83 * 100);
eq('autoconsum prod0', autoconsumPct(0, 0), null);
eq('autoconsum clamp', autoconsumPct(10, -5), 100);
near('autonomie', autonomiePct(15.15, 7.802), (15.15 - 7.802) / 15.15 * 100);
eq('autonomie house0', autonomiePct(0, 5), null);

// economie
near('economie', economieLei(15.83, 3.082, 1.30, 0.60), (15.83 - 3.082) * 1.30 + 3.082 * 0.60);
eq('economie tarif nul', economieLei(15.83, 3.082, null, 0), null);

// baterie
near('batKwh', batKwh(37.4, 31), 37.4 * 31 / 100);
near('batOre', batOre(batKwh(37.4, 31), 983), batKwh(37.4, 31) / (983 / 1000));
eq('batOre 40W', batOre(10, 40), null);
eq('batOre 0W',  batOre(10, 0),  null);

// calcAll pe set real de state (exemplul din PROMPT)
const states = {
  'sensor.solar_total_power':            { state: '192',  attributes: { unit_of_measurement: 'W' } },
  'sensor.grid_import_power_w':          { state: '7',    attributes: { unit_of_measurement: 'W' } },
  'sensor.grid_export_power_w':          { state: '0',    attributes: { unit_of_measurement: 'W' } },
  'sensor.battery_charge_power':         { state: '0',    attributes: { unit_of_measurement: 'W' } },
  'sensor.battery_discharge_power':      { state: '983',  attributes: { unit_of_measurement: 'W' } },
  'sensor.solar_total_daily':            { state: '15.83', attributes: { unit_of_measurement: 'kWh' } },
  'sensor.import_retea_zilnic_local':    { state: '7.802', attributes: { unit_of_measurement: 'kWh' } },
  'sensor.export_retea_zilnic_local':    { state: '3.082', attributes: { unit_of_measurement: 'kWh' } },
  'sensor.invertor_deye_today_battery_charge':   { state: '6.7', attributes: { unit_of_measurement: 'kWh' } },
  'sensor.invertor_deye_today_battery_discharge': { state: '1.3', attributes: { unit_of_measurement: 'kWh' } },
  'sensor.invertor_deye_battery':        { state: '31',   attributes: { unit_of_measurement: '%' } },
  'sensor.invertor_deye_battery_capacity': { state: '37.4', attributes: { unit_of_measurement: 'kWh' } },
  'input_number.tarif_energie':          { state: '1.30', attributes: {} },
};
const cfg = { tarif_entity: 'input_number.tarif_energie' };
const c = calcAll(states, cfg);
eq('calcAll houseW', c.houseW, 1182);
near('calcAll houseKwh', c.houseKwh, 15.15);
eq('calcAll tarif', c.tarif, 1.30);
near('calcAll economie', c.economieLei, (15.83 - 3.082) * 1.30);
eq('calcAll soc', c.soc, 31);
// senzori OK → toate flag-urile *Missing false
eq('calcAll pvMissing false', c.pvMissing, false);
eq('calcAll importKwhMissing false', c.importKwhMissing, false);
eq('calcAll exportKwhMissing false', c.exportKwhMissing, false);
eq('calcAll capacityMissing false', c.capacityMissing, false);
eq('calcAll batChargeKwhMissing false', c.batChargeKwhMissing, false);

// capcană: senzor unavailable → 0 + missing
const statesBad = { 'sensor.solar_total_power': { state: 'unavailable' } };
const cb = calcAll(statesBad, { tarif_lei_kwh: 1.30 });
eq('calcAll pv missing', cb.pvMissing, true);
eq('calcAll pv value', cb.pv, 0);
eq('calcAll houseW still number', typeof cb.houseW, 'number');
// și pe kWh / capacitate (noul set de flag-uri)
eq('calcAll importKwh missing', cb.importKwhMissing, true);
eq('calcAll exportKwh missing', cb.exportKwhMissing, true);
eq('calcAll capacity missing', cb.capacityMissing, true);
eq('calcAll soc missing', cb.socMissing, true);

// capcană: producție 0 → autoconsum null (fără împărțire la 0)
const statesZero = { 'sensor.solar_total_daily': { state: '0', attributes: { unit_of_measurement: 'kWh' } } };
const cz = calcAll(statesZero, {});
eq('calcAll autoconsum null', cz.autoconsumPct, null);

// grid_entity: o singura valoare cu semn (+ = import; cu grid_invert + = export)
{
  const st = (v) => ({ state: String(v), attributes: { unit_of_measurement: 'W' } });
  const J = JSON.stringify;
  const a = calcAll({ 'sensor.g': st(300) }, { grid_entity: 'sensor.g' });
  eq('grid_entity +300 -> import 300, export 0', J([a.importW, a.exportW]), J([300, 0]));
  const b = calcAll({ 'sensor.g': st(300) }, { grid_entity: 'sensor.g', grid_invert: true });
  eq('grid_entity +300 invert -> export 300, import 0', J([b.importW, b.exportW]), J([0, 300]));
  const c = calcAll({ 'sensor.g': st(-120) }, { grid_entity: 'sensor.g' });
  eq('grid_entity -120 -> export 120', J([c.importW, c.exportW]), J([0, 120]));
  const d = calcAll({ 'sensor.g': { state: 'unavailable', attributes: {} } }, { grid_entity: 'sensor.g' });
  eq('grid_entity unavailable -> lipsa', J([d.importMissing, d.exportMissing]), J([true, true]));
}

console.log(`calc.test.js: ${passed} OK, ${failed} FAIL`);
if (failed > 0) process.exit(1);
