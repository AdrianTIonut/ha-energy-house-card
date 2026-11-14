// tests/flow.test.js — teste pentru alocarea proporțională (3 scenarii + dezechilibru + excluderi)
import { computeFlow, makeSources, makeDestinations } from '../src/flow.js';

let passed = 0, failed = 0;
function eq(label, got, want) {
  if (got === want) passed++;
  else { failed++; console.log('FAIL', label, '=> got', JSON.stringify(got), 'want', JSON.stringify(want)); }
}
function near(label, got, want, eps = 1e-6) {
  if (Math.abs(got - want) <= eps) passed++;
  else { failed++; console.log('FAIL', label, '=> got', got, 'want', want); }
}

// Scenariu 1 — ZI: PV acoperă totul + export, fără rețea.
// Surse: solar 5000 W. Destinații: Casă 3800, Baterie 500, Rețea 700 (= 5000).
{
  const src = { solar: 5000, 'rețea': 0, baterie: 0 };
  const dst = { 'Cas\u0103': 3800, 'Baterie': 500, 'Re\u021bea': 700 };
  const { alloc, totalSources, totalDestinations, imbalance } = computeFlow(src, dst);
  near('z1 totalSrc', totalSources, 5000);
  near('z1 totalDst', totalDestinations, 5000);
  near('z1 imbalance', imbalance, 0);
  near('z1 solar->Casa', alloc.solar['Cas\u0103'], 3800);
  near('z1 solar->Baterie', alloc.solar['Baterie'], 500);
  near('z1 solar->Retea', alloc.solar['Re\u021bea'], 700);
  near('z1 rețea->Casa', alloc['rețea']['Cas\u0103'], 0);
}

// Scenariu 2 — NOAPTE: baterie → casă.
// Surse: baterie 1200 W. Destinații: Casă 1200 W.
{
  const src = { solar: 0, 'rețea': 0, baterie: 1200 };
  const dst = { 'Cas\u0103': 1200 };
  const { alloc, imbalance } = computeFlow(src, dst);
  near('z2 imbalance', imbalance, 0);
  near('z2 baterie->Casa', alloc.baterie['Cas\u0103'], 1200);
  near('z2 solar->Casa', alloc.solar['Cas\u0103'], 0);
}

// Scenariu 3 — BATERIE GOALĂ: rețea → casă + baterie.
// Surse: rețea 2000 W (import). Destinații: Casă 1500, Baterie 500 (= 2000).
// Aici importul NU merge spre exportul (destinația „Rețea”) — e exclusă.
{
  const src = { solar: 0, 'rețea': 2000, baterie: 0 };
  const dst = { 'Cas\u0103': 1500, 'Baterie': 500, 'Re\u021bea': 0 };
  const { alloc, imbalance } = computeFlow(src, dst);
  near('z3 imbalance', imbalance, 2000 - 2000);
  near('z3 rețea->Casa', alloc['rețea']['Cas\u0103'], 1500);
  near('z3 rețea->Baterie', alloc['rețea']['Baterie'], 500);
  near('z3 rețea->Rețea (exclus)', alloc['rețea']['Re\u021bea'], 0);
}

// IMPORT + EXPORT SIMULTAN nenule (defect 3):
// Sursa „rețea” (import) = 3000 W, iar destinația „Rețea” (export) = 3000 W.
// Perechea rețea→Rețea e exclusă, deci importul se redistribuie 100% la Casă.
// Sursa „solar” = 1000 W; Casă cere 3000, Rețea(export) cere 3000 → solar → Rețea = 1000.
{
  const src = { solar: 1000, 'rețea': 3000, baterie: 0 };
  const dst = { 'Cas\u0103': 3000, 'Re\u021bea': 3000 };
  const { alloc } = computeFlow(src, dst);
  // import 3000: doar la Casă (Rețea exclusă) → Casă +3000
  near('imp+exp rețea->Casa', alloc['rețea']['Cas\u0103'], 3000);
  near('imp+exp rețea->Rețea exclus', alloc['rețea']['Re\u021bea'], 0);
  // solar 1000: Casă 3000/6000, Rețea 3000/6000 → 500 / 500
  near('imp+exp solar->Casa', alloc.solar['Cas\u0103'], 500);
  near('imp+exp solar->Rețea', alloc.solar['Re\u021bea'], 500);
}

// BATERIE + ÎNCĂRCARE simultană (defect 3): descărcare → destinația „Baterie” (încărcare) exclusă.
// Sursă baterie 800 W (descarcă). Destinații: Casă 500, Baterie 300 (încarcă).
// Baterie→Baterie exclusă → descărcarea 800 merge integral la Casă.
{
  const src = { solar: 0, 'rețea': 0, baterie: 800 };
  const dst = { 'Cas\u0103': 500, 'Baterie': 300 };
  const { alloc } = computeFlow(src, dst);
  near('batt baterie->Baterie exclus', alloc.baterie['Baterie'], 0);
  near('batt baterie->Casa', alloc.baterie['Cas\u0103'], 800);
}

// Dezechilibru: surse 1000, destinații 800 → imbalance 200 (> 50, se raportează)
{
  const src = { solar: 1000, 'rețea': 0, baterie: 0 };
  const dst = { 'Cas\u0103': 800 };
  const { imbalance } = computeFlow(src, dst);
  near('imbalance', imbalance, 200);
}

// totalDestinations = 0 → alocări 0, nu împărțire la 0
{
  const src = { solar: 100, 'rețea': 0, baterie: 0 };
  const dst = { 'Cas\u0103': 0 };
  const { alloc } = computeFlow(src, dst);
  near('no dest', alloc.solar['Cas\u0103'], 0);
}

// makeSources / makeDestinations pe un bundle calcAll minim
{
  const calc = { pv: 2000, importW: 0, exportW: 300, chargeW: 500, dischargeW: 0, houseW: 2800 };
  const src = makeSources(calc);
  eq('makeSources solar', src.solar, 2000);
  eq('makeSources rețea', src['rețea'], 0);
  eq('makeSources baterie', src.baterie, 0);

  const cfg = { consumers: [ { name: 'Piscin\u0103', power: 'sensor.piscina_total_power' } ] };
  const states = { 'sensor.piscina_total_power': { state: '800', attributes: { unit_of_measurement: 'W' } } };
  const dst = makeDestinations(calc, cfg, states);
  eq('makeDest piscina', dst['Piscin\u0103'], 800);
  eq('makeDest casa rest', dst['Cas\u0103'], 2800 - 800);
  eq('makeDest baterie', dst['Baterie'], 500);
  eq('makeDest rețea', dst['Re\u021bea'], 300);
}

// consumator cu senzor lipsă → nu apare în destinații
{
  const calc = { pv: 0, importW: 1000, exportW: 0, chargeW: 0, dischargeW: 0, houseW: 1000 };
  const cfg = { consumers: [ { name: 'Hal\u0103', power: 'sensor.hala_total_power' } ] };
  const dst = makeDestinations(calc, cfg, {});
  eq('hala lipsa nu e in dest', ('Hal\u0103' in dst), false);
  eq('casa prinde tot', dst['Cas\u0103'], 1000);
}

console.log(`flow.test.js: ${passed} OK, ${failed} FAIL`);
if (failed > 0) process.exit(1);
