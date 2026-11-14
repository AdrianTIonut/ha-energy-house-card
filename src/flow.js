// src/flow.js — Alocare proporțională a fluxului de energie. Funcție pură, fără DOM.
// Metoda: fiecare sursă împarte puterea ei către toate destinațiile,
// în proporția cerută de ele (ca în Energy Dashboard HA).
// Este o estimare: contoarele nu pot spune fizic ce electron a ajuns unde.

import { num } from './calc.js';

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
export function computeFlow(sources, destinations) {
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
export function makeSources(calc) {
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
export function makeDestinations(calc, config, states) {
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
