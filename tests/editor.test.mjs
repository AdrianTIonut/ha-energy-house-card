// tests/editor.test.mjs — detectarea automată a senzorilor (logica pură a editorului vizual), pe fișierul asamblat.
import { existsSync } from 'node:fs';
const asmPath = new URL('../energie-casa-card.js', import.meta.url);
if (!existsSync(asmPath)) { console.error('Lipsește fișierul asamblat — rulează: node build.js'); process.exit(2); }
globalThis.HTMLElement = globalThis.HTMLElement || class {};   // stub minim: cardul extinde HTMLElement la încărcare
globalThis.customElements = globalThis.customElements || { define() {}, get() { return undefined; } };
const { eccDetectSensors } = await import(asmPath.href);
let passed = 0, failed = 0;
const T = (n, ok, info) => { if (ok === true) passed++; else { failed++; console.log('FAIL', n, info === undefined ? '' : JSON.stringify(info)); } };
const S = (state, unit, name, dc) => ({ state: String(state), attributes: { unit_of_measurement: unit, friendly_name: name, ...(dc ? { device_class: dc } : {}) } });
const hass = {
  states: {
    'sensor.solar_total_power': S(3200, 'W', 'Solar Total Power', 'power'), 'sensor.solar_total_energy': S(1200, 'kWh', 'Solar Total Energy', 'energy'),
    'sensor.power_meter_active_power': S(-900, 'W', 'Active power', 'power'), 'sensor.house_phase_a_power': S(300, 'W', 'Phase A power', 'power'),
    'sensor.inverter_battery_power': S(-800, 'W', 'Battery Power', 'power'),
    'sensor.inverter_battery': S(52, '%', 'Battery', 'battery'), 'sensor.inverter_battery_capacity': S(37.7, 'kWh', 'Battery capacity', 'energy'),
    'sensor.battery_battery_1': S(51, '%', 'Battery 1 Battery 1', 'battery'), 'sensor.battery_battery_1_soh': S(100, '%', 'Battery 1 SOH'),
    'sensor.tablet_battery_level': S(70, '%', 'Tablet', 'battery'), 'sensor.inverter_today_energy_export': S(0, 'kWh', 'Export today', 'energy'),
  },
  entities: { 'sensor.tablet_battery_level': { platform: 'mobile_app', device_id: 'd1' } }, devices: { d1: { model: 'iPad13,18' } },
};
const d = eccDetectSensors(hass);
T('solar: senzorul de putere, nu energia', d.pv_entity === 'sensor.solar_total_power', d);
T('rețea: contorul, nu fazele', d.grid_entity === 'sensor.power_meter_active_power', d);
T('baterie: nivelul în %, nu tableta', d.soc_entity === 'sensor.inverter_battery', d);
T('baterie: nu alege un pachet de celule (battery_1) sau SOH în locul nivelului invertorului', d.soc_entity !== 'sensor.battery_battery_1' && d.soc_entity !== 'sensor.battery_battery_1_soh', d);
T('capacitate: senzorul în kWh cu „capacity”', d.battery_capacity_entity === 'sensor.inverter_battery_capacity', d);
T('fără hass sau fără senzori → obiect gol, fără erori', Object.keys(eccDetectSensors(undefined)).length === 0 && Object.keys(eccDetectSensors({ states: {} })).length === 0);
console.log(`editor.test.mjs: ${passed} OK, ${failed} FAIL`);
process.exit(failed ? 1 : 0);
