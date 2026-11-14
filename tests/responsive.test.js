// tests/responsive.test.js — SVG-urile (grafic, flux) se adaptează lățimii cardului.
// La lățime mică textul rămâne >= 16 (nu se micșorează prin scalare), nimic nu iese din desen, fără NaN.
import { buildGraphSVG, buildBars7d } from '../src/graph-24h.js';
import { buildFlowSVG } from '../src/flow-svg.js';
import { computeFlow } from '../src/flow.js';

let passed = 0, failed = 0;
function eq(label, got, want) { if (got === want) passed++; else { failed++; console.log('FAIL', label, '=> got', JSON.stringify(got), 'want', JSON.stringify(want)); } }
function ok(label, cond) { eq(label, !!cond, true); }

const N = 289;
const pv = Array.from({ length: N }, (_, i) => Math.max(0, Math.sin((i / N) * Math.PI * 2 - 1.2) * 3000));
const cons = Array.from({ length: N }, (_, i) => 600 + 400 * Math.sin(i / 20));
const soc = Array.from({ length: N }, (_, i) => 30 + 40 * Math.sin(i / 60) ** 2);
const times = Array.from({ length: N }, (_, i) => 1794438000 + i * 300);
const data = { pv, cons, soc, imp: [], exp: [], times };

const fontsOk = (svg, min) => (svg.match(/font-size="([0-9.]+)"/g) || []).every((m) => parseFloat(m.match(/"([0-9.]+)"/)[1]) >= (min == null ? 16 : min));
const minFs = (W) => (W < 420 ? 11 : W < 640 ? 13 : 16);   // scara de text a graficelor: telefon / intermediar / tabletă
const xs = (svg) => (svg.match(/ x="(-?[0-9.]+)"/g) || []).map((m) => parseFloat(m.match(/"(-?[0-9.]+)"/)[1]));

for (const W of [300, 432, 560, 800]) {
  const g = buildGraphSVG(Object.assign({}, data, { width: W }));
  eq('grafic W=' + W + ' viewBox', g.includes('viewBox="0 0 ' + W + ' '), true);
  ok('grafic W=' + W + ' text >= ' + minFs(W), fontsOk(g, minFs(W)));
  ok('grafic W=' + W + ' fără NaN', !g.includes('NaN'));
  ok('grafic W=' + W + ' x în desen', xs(g).every((x) => x >= -1 && x <= W + 1));
}

const flow = computeFlow({ solar: 192, 'rețea': 7, baterie: 983 },
  { 'Casă': 300, 'Piscină': 120, 'Încărcător EV': 700, 'Baterie': 0, 'Rețea': 0 });
for (const W of [300, 432, 560, 800]) {
  const f = buildFlowSVG(flow, { width: W });
  eq('flux W=' + W + ' viewBox', f.includes('viewBox="0 0 ' + W + ' '), true);
  ok('flux W=' + W + ' text >= 16', fontsOk(f));
  ok('flux W=' + W + ' fără NaN', !f.includes('NaN'));
  ok('flux W=' + W + ' cutii în desen', xs(f).every((x) => x >= -1 && x <= W + 1));
  ok('flux W=' + W + ' nod TOTAL', f.includes('TOTAL'));
}
// lățimea implicită rămâne 800 (comportament neschimbat)
eq('flux implicit 800', buildFlowSVG(flow, {}).includes('viewBox="0 0 800 '), true);
eq('grafic implicit 800', buildGraphSVG(data).includes('viewBox="0 0 800 '), true);
// bare 7 zile la lățime mică
const b = buildBars7d({ kwhPerDay: [14, 18, 11, 16, 9, 12, 7], dayLabels: ['Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sa', 'Du'], width: 432, height: 220 });
ok('7 zile W=432 text >= ' + minFs(432), fontsOk(b, minFs(432)));

console.log(`responsive.test.js: ${passed} OK, ${failed} FAIL`);
process.exit(failed ? 1 : 0);
