// tests/fake-hass.js — Sursa unică de date FALSE (valorile-exemplu din PROMPT-AI-local.md,
// extrase din HA la 2026-11-12). Folosită de machetă (preview/index.html) și de tests/asm.test.mjs.
// Sunt EXEMPLE, nu valori citite live — le folosim ca să vedem cardul fără Home Assistant.

export const fakeHass = {
  states: {
    'sensor.solar_total_power':                 { state: '192',   attributes: { unit_of_measurement: 'W' } },
    'sensor.grid_import_power_w':               { state: '7',     attributes: { unit_of_measurement: 'W' } },
    'sensor.grid_export_power_w':               { state: '0',     attributes: { unit_of_measurement: 'W' } },
    'sensor.battery_charge_power':              { state: '0',     attributes: { unit_of_measurement: 'W' } },
    'sensor.battery_discharge_power':           { state: '983',   attributes: { unit_of_measurement: 'W' } },
    'sensor.solar_total_daily':                 { state: '15.83', attributes: { unit_of_measurement: 'kWh' } },
    'sensor.import_retea_zilnic_local':         { state: '7.802', attributes: { unit_of_measurement: 'kWh' } },
    'sensor.export_retea_zilnic_local':         { state: '3.082', attributes: { unit_of_measurement: 'kWh' } },
    'sensor.invertor_deye_today_battery_charge':    { state: '6.7',   attributes: { unit_of_measurement: 'kWh' } },
    'sensor.invertor_deye_today_battery_discharge': { state: '1.3',   attributes: { unit_of_measurement: 'kWh' } },
    'sensor.invertor_deye_battery':             { state: '31',    attributes: { unit_of_measurement: '%' } },
    'sensor.invertor_deye_battery_capacity':    { state: '37.4',  attributes: { unit_of_measurement: 'kWh' } },
    'input_number.tarif_energie':               { state: '1.30',  attributes: { unit_of_measurement: 'lei/kWh' } },
  },
};

export const fakeConfig = {
  style: 'cyber',
  tarif_entity: 'input_number.tarif_energie', // helperul cu prețul (lei/kWh)
};

// așteptări derivate (pentru teste) — HOUSE_W = 192 + 7 - 0 + 983 - 0 = 1182;
// HOUSE_KWH = 15.83 + 7.802 - 3.082 - 6.7 + 1.3 = 15.15; economie = (15.83-3.082)*1.30 = 16.57 lei
export const expect = {
  houseW: '−1,18 kW',
  houseKwh: '15,15 kWh',
  economie: '16,57 lei',
  soc: '31%',
};
