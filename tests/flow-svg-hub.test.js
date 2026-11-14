// tests/flow-svg-hub.test.js — teste pentru diagrama cu NOD CENTRAL (P3) + P4 (selected).
// buildFlowSVG(..., { style: 'hub' }) = stil nou implicit; { style: 'ribbons' } = desenul vechi.
import { buildFlowSVG } from '../src/flow-svg.js';
import { computeFlow } from '../src/flow.js';

let passed = 0, failed = 0;
function eq(label, got, want) {
  if (got === want) passed++;
  else { failed++; console.log('FAIL', label, '=> got', JSON.stringify(got), 'want', JSON.stringify(want)); }
}
function includes(label, hay, needle) {
  if (hay.includes(needle)) passed++;
  else { failed++; console.log('FAIL', label, '=> NU conține', JSON.stringify(needle)); }
}
function notIncludes(label, hay, needle) {
  if (!hay.includes(needle)) passed++;
  else { failed++; console.log('FAIL', label, '=> CONȚINE (nu ar fi trebui)', JSON.stringify(needle)); }
}
const bands = (svg) => (svg.match(/class="flow-band"/g) || []).length;
const totalFlow = () => computeFlow({ solar: 192, 're\u021bea': 7, baterie: 983 }, { 'Cas\u0103': 1182 });

// (1) nod central prezent + total corect (192+7+983 = 1182 → „1,18 kW")
{
  const svg = buildFlowSVG(totalFlow(), {});
  includes('hub: svg prezent', svg, '<svg');
  includes('hub: nod prezent (flow-node)', svg, 'flow-node');
  includes('hub: eticheta TOTAL', svg, 'TOTAL');
  includes('hub: total 1,18 kW', svg, '1,18 kW');
  notIncludes('hub: fără NaN', svg, 'NaN');
  includes('hub: titlu „estimat”', svg, 'estimat');
  includes('hub: banda sursă (data-flow-src)', svg, 'data-flow-src="solar"');
  includes('hub: banda destinație (data-flow-dst)', svg, 'data-flow-dst="Cas\u0103"');
}

// (2) zero / total < 50 W → „fără flux" (div, nu svg) — același text ca la ribbons
{
  const svg = buildFlowSVG(computeFlow({ solar: 0, 're\u021bea': 0, baterie: 0 }, { 'Cas\u0103': 0 }), {});
  includes('hub: zero → fără flux', svg, 'f\u0103r\u0103 flux');
  notIncludes('hub: zero nu e svg', svg, '<svg');
}

// (3) un singur flux → o singură bandă (caz degenerat prin nod)
{
  const svg = buildFlowSVG(computeFlow({ solar: 5000, 're\u021bea': 0, baterie: 0 }, { 'Cas\u0103': 5000 }),
    { width: 800, height: 260 });
  eq('hub: single = 1 bandă prin nod', bands(svg), 1);
  includes('hub: single 5,00 kW', svg, '5,00 kW');
  notIncludes('hub: single fără NaN', svg, 'NaN');
}

// (4) fără NaN în scenariu mixt
{
  const svg = buildFlowSVG(computeFlow({ solar: 0, 're\u021bea': 2500, baterie: 1200 },
    { 'Cas\u0103': 2000, 'Baterie': 1700 }), { width: 800, height: 280 });
  includes('hub: mixt svg', svg, '<svg');
  notIncludes('hub: mixt fără NaN', svg, 'NaN');
}

// (5) escape: nume de sursă/destinație cu & < > nu intră brute
{
  const svg = buildFlowSVG({ alloc: { 'A&B': { 'X<Y>': 400 } }, totalSources: 400,
    totalDestinations: 400, imbalance: 0 }, { width: 800, height: 260 });
  includes('hub: escape A&amp;B', svg, 'A&amp;B');
  notIncludes('hub: escape A&B raw', svg, 'A&B');
  includes('hub: escape X&lt;Y&gt;', svg, 'X&lt;Y&gt;');
}

// (6) dezechilibru: „dezechilibru X W" DOAR dacă |surse − destinații| > 50 W
{
  const big = buildFlowSVG({ alloc: { solar: { 'Cas\u0103': 400 } }, totalSources: 1000,
    totalDestinations: 400, imbalance: 600 }, { width: 800, height: 260 });
  includes('hub: dezechilibru 600 W (valoare de test, nu senzor) raportat', big, 'dezechilibru');
  const small = buildFlowSVG({ alloc: { solar: { 'Cas\u0103': 960 } }, totalSources: 1000,
    totalDestinations: 960, imbalance: 40 }, { width: 800, height: 260 });
  notIncludes('hub: dezechilibru 40 W ascuns', small, 'dezechilibru');
}

// (7) benzi sub 1% din total → omise: „Mica” 5/1000 = 0,5% nu apare
{
  const svg = buildFlowSVG({ alloc: { solar: { 'Cas\u0103': 995, 'Mica': 5 } }, totalSources: 1000,
    totalDestinations: 1000, imbalance: 0 }, { width: 800, height: 280 });
  notIncludes('hub: sub 1% omis (Mica)', svg, 'Mica');
  includes('hub: restul desenat', svg, '<svg');
}

// (8) ribbons = desenul original, neschimbat: același desen (fără nod), etichete vechi
{
  const rb = buildFlowSVG(totalFlow(), { style: 'ribbons' });
  includes('ribbons: svg prezent', rb, '<svg');
  notIncludes('ribbons: fără nod (flow-node)', rb, 'flow-node');
  includes('ribbons: titlu „estimat”', rb, 'estimat');
  includes('ribbons: eticheta veche solar (text-anchor=end)', rb, 'text-anchor="end">solar');
  notIncludes('ribbons: fără NaN', rb, 'NaN');
}

// (9) implicitul e hub: fără opts.style → nod central
{
  const def = buildFlowSVG(totalFlow(), { width: 800, height: 260 });
  includes('implicit hub: nod prezent', def, 'flow-node');
  notIncludes('implicit hub: nu e ribbons pur', def, 'width="6"');
}

// (10) P4 selected: benzile destinației alese rămân opace, celelalte la 0.25
{
  const flow = computeFlow({ solar: 1000, 're\u021bea': 0, baterie: 0 },
    { 'Cas\u0103': 700, 'Baterie': 300 });
  const sel = buildFlowSVG(flow, { selected: 'Baterie' });
  includes('P4: selected are opacitate redusă 0.25', sel, 'stroke-opacity="0.25"');
  const noSel = buildFlowSVG(flow, {});
  notIncludes('P4: fără selected → fără 0.25', noSel, 'stroke-opacity="0.25"');
  // banda nod→Baterie rămâne opacitate 1
  const re = sel.match(/data-flow-dst="Baterie"[^>]*stroke-opacity="1"/);
  eq('P4: banda aleasă opacitate 1', !!re, true);
}

console.log(`flow-svg-hub.test.js: ${passed} OK, ${failed} FAIL`);
if (failed > 0) process.exit(1);
