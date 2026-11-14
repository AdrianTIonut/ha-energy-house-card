// tests/flow-svg.test.js — teste pentru buildFlowSVG (funcție pură, fără DOM)
import { buildFlowSVG } from '../src/flow-svg.js';
import { computeFlow } from '../src/flow.js';

let passed = 0, failed = 0;
function eq(label, got, want) {
  if (got === want) passed++;
  else { failed++; console.log('FAIL', label, '=> got', JSON.stringify(got), 'want', JSON.stringify(want)); }
}
function near(label, got, want, eps = 1e-6) {
  if (Math.abs(got - want) <= eps) passed++;
  else { failed++; console.log('FAIL', label, '=> got', got, 'want', want); }
}
function includes(label, hay, needle) {
  if (hay.includes(needle)) passed++;
  else { failed++; console.log('FAIL', label, '=> NU conține', JSON.stringify(needle)); }
}
function notIncludes(label, hay, needle) {
  if (!hay.includes(needle)) passed++;
  else { failed++; console.log('FAIL', label, '=> CONȚINE (nu ar fi trebui)', JSON.stringify(needle)); }
}
const bands = (svg) => (svg.match(/<path [^>]*fill="none"[^>]*>/g) || []);   // doar benzile (nu căile iconițelor)
const paths = (svg) => bands(svg).length;
const widths = (svg) => bands(svg).map((t) => parseFloat((t.match(/stroke-width="([0-9.]+)"/) || [0, 0])[1]));

// zero / total < 50 W → „fără flux” (nu SVG)
{
  const svg = buildFlowSVG(computeFlow({ solar: 10, 'rețea': 0, baterie: 0 }, { 'Cas\u0103': 10 }), {});
  includes('zero → fără flux', svg, 'f\u0103r\u0103 flux');
  notIncludes('zero nu e <svg', svg, '<svg');
  const svg2 = buildFlowSVG(computeFlow({ solar: 0, 'rețea': 0, baterie: 0 }, { 'Cas\u0103': 0 }), {});
  includes('zero2 → fără flux', svg2, 'f\u0103r\u0103 flux');
}

// un singur flux (solar → casa) → un singur path
{
  const svg = buildFlowSVG(computeFlow({ solar: 5000, 'rețea': 0, baterie: 0 }, { 'Cas\u0103': 5000 }), { width: 800, height: 260 });
  includes('single svg', svg, '<svg');
  eq('single 1 path', paths(svg), 1);
  notIncludes('single no NaN', svg, 'NaN');
  includes('single titlu „estimat”', svg, 'estimat');
  includes('single etichetă 5,00 kW', svg, '5,00 kW');
}

// grosimi: banda max e clamped la 24 (nu mai mult)
{
  const svg = buildFlowSVG(computeFlow({ solar: 4000, 'rețea': 0, baterie: 0 }, { 'Cas\u0103': 4000 }), { width: 800, height: 260 });
  const ws = widths(svg);
  eq('max width <= 24', Math.max(...ws) <= 24, true);
  eq('min width >= 2', Math.min(...ws) >= 2, true);
  eq('grosime max atingă 24', Math.max(...ws), 24);
}

// grosimi PROPORȚIONALE: banda de la sursa mai mică e mai subțire decât cea de la cea mare
{
  // solar 3000 → casa 2000 + baterie 1000; rețea 1000 → casa (import nu la export)
  const flow = computeFlow({ solar: 3000, 'rețea': 1000, baterie: 0 }, { 'Cas\u0103': 2000, 'Baterie': 1000, 'Re\u021bea': 0 });
  const svg = buildFlowSVG(flow, { width: 800, height: 320 });
  const ws = widths(svg).sort((a, b) => a - b);
  // există benzi de grosimi diferite (proporționale), nu toate identice
  eq('prop >= 2 benzi', ws.length >= 2, true);
  eq('prop grosimi diferite', ws[ws.length - 1] > ws[0], true);
  notIncludes('prop no NaN', svg, 'NaN');
}

// fără NaN (oricum)
{
  const svg = buildFlowSVG(computeFlow({ solar: 0, 'rețea': 2500, baterie: 1200 }, { 'Cas\u0103': 2000, 'Baterie': 1700 }), { width: 800, height: 280 });
  notIncludes('no NaN general', svg, 'NaN');
  includes('general svg', svg, '<svg');
}

// etichete cu fmtPower (W / kW cu virgulă)
{
  const svg = buildFlowSVG(computeFlow({ solar: 850, 'rețea': 0, baterie: 0 }, { 'Cas\u0103': 850 }), { width: 800, height: 260 });
  includes('etichetă 850 W', svg, '850 W');
  notIncludes('nu „850,0 W”', svg, '850,0 W');
}

// escape: nume de sursă/destinație cu & < > nu intră brute
{
  const svg = buildFlowSVG({ alloc: { 'A&B': { 'X<Y>': 400 } }, totalSources: 400, totalDestinations: 400, imbalance: 0 }, { width: 800, height: 260 });
  includes('escape A&amp;B', svg, 'A&amp;B');
  notIncludes('escape A&B raw', svg, 'A&B');
  includes('escape X&lt;Y&gt;', svg, 'X&lt;Y&gt;');
}

// dezechilibru > 50 W → se raportează
{
  const svg = buildFlowSVG({ alloc: { solar: { 'Cas\u0103': 400 } }, totalSources: 1000, totalDestinations: 400, imbalance: 600 }, { width: 800, height: 260 });
  includes('dezechilibru raportat', svg, 'dezechilibru');
}

// benzi sub 1% din total → omise (agregate): „Mica” 5/1000 = 0,5%
{
  const svg = buildFlowSVG({ alloc: { solar: { 'Cas\u0103': 995, 'Mica': 5 } }, totalSources: 1000, totalDestinations: 1000, imbalance: 0 }, { width: 800, height: 280 });
  notIncludes('sub 1% omis (etichetă Mica)', svg, 'Mica');
  includes('restul desenat', svg, '<svg');
  eq('1 path pentru rest', paths(svg), 1);
}

// titlu custom
{
  const svg = buildFlowSVG(computeFlow({ solar: 1000, 'rețea': 0, baterie: 0 }, { 'Cas\u0103': 1000 }), { width: 800, height: 260, title: 'flux Deye' });
  includes('titlu custom', svg, 'flux Deye');
}

console.log(`flow-svg.test.js: ${passed} OK, ${failed} FAIL`);
if (failed > 0) process.exit(1);
