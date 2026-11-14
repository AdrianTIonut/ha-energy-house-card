// tests/graph-24h.test.js — teste pentru funcțiile pure de grafic (fără DOM)
import { resample5min, buildGraphSVG, buildBars7d, generateFake24h, generateFake7d,
         tooltipInfo, parseHistory, niceStep, axisStep } from '../src/graph-24h.js';

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

// resample5min (compatibilitate)
{
  const r = resample5min([1000, 1000], 5, 240);
  eq('resample len', r.length, 49);
  near('resample const', r[0], 1000);
  const rr = resample5min([0, 1000], 5, 240);
  near('resample mid 500', rr[120/5], 500);
  const e = resample5min([], 5, 120);
  eq('resample empty len', e.length, 25);
}

// niceStep: cel mai mare {1,2,4,5,9}×10^n ≤ max
{
  eq('nice 0', niceStep(0), 1);
  eq('nice 800', niceStep(800), 500);
  eq('nice 1000', niceStep(1000), 1000);
  eq('nice 1200', niceStep(1200), 1000);
  eq('nice 2000', niceStep(2000), 2000);
  eq('nice 3000', niceStep(3000), 2000);
  eq('nice 5000', niceStep(5000), 5000);
  eq('nice 7000', niceStep(7000), 5000);
  eq('nice 12000', niceStep(12000), 10000);
  eq('nice 450', niceStep(450), 400);
  eq('nice 99', niceStep(99), 90);
  eq('nice 12', niceStep(12), 10);
}

// axisStep: pas de axă Y pentru ticks 0/1/2/3 kW
{
  eq('axis 3000 → 1 kW ticks', axisStep(3000), 1000);
  eq('axis 1000 → ≤ 5 ticks', axisStep(1000) <= 1000, true);
  eq('axis 20 (W) rotund', [1,2,4,5,9,10].includes(axisStep(20)), true);
}

// parseHistory: răspuns HA minimal_response (s = stare text, lu = secunde epoch)
// Grilă 5 min. „Ultima valoare valabilă rămâne” (forward-fill); unknown/unavailable = gol (null), nu 0.
{
  // toate entitățile pe aceeași grilă [900, 1200, 1500] (minLu=900 → t0=900, maxLu=1500)
  const pv  = [ { s: '100', lu: 900 }, { s: '500', lu: 1500 } ];   // forward-fill 100 → 100 → 500
  const imp = [ { s: '10',  lu: 900 }, { s: 'unknown', lu: 1200 }, { s: '20', lu: 1500 } ]; // 10 → gol → 20
  const exp = [ { s: '0', lu: 900 } ];
  const chg = [ { s: '0', lu: 900 } ];
  const dis = [ { s: '5', lu: 900 }, { s: '7', lu: 1500 } ];       // 5 → 5 → 7
  const soc = [ { s: '31', lu: 900 }, { s: '30', lu: 1500 } ];     // 31 → 31 → 30
  const raw = {
    'sensor.pv': pv, 'sensor.imp': imp, 'sensor.exp': exp,
    'sensor.chg': chg, 'sensor.dis': dis, 'sensor.soc': soc,
  };
  const ents = { pv: 'sensor.pv', imp: 'sensor.imp', exp: 'sensor.exp',
                 chg: 'sensor.chg', dis: 'sensor.dis', soc: 'sensor.soc' };
  const p = parseHistory(raw, ents, {});
  // grilă
  eq('parse len', p.times.length, 3);
  eq('parse t0', p.times[0], 900);
  eq('parse t2', p.times[2], 1500);
  // pv forward-fill: 100 rămâne până la 500
  eq('parse pv[0]', p.pv[0], 100);
  eq('parse pv[1] (fill)', p.pv[1], 100);
  eq('parse pv[2]', p.pv[2], 500);
  // imp: unknown la t=1200 → gol (null), apoi 20
  eq('parse imp[0]', p.imp[0], 10);
  eq('parse imp[1] (unknown → null)', p.imp[1], null);
  eq('parse imp[2]', p.imp[2], 20);
  // exp / chg / dis forward-fill
  eq('parse exp[1] (fill)', p.exp[1], 0);
  eq('parse chg[1] (fill)', p.chg[1], 0);
  eq('parse dis[1] (fill)', p.dis[1], 5);
  eq('parse dis[2]', p.dis[2], 7);
  // consum = HOUSE_W per punct (toate non-null); gol dacă o componentă e null
  // t=900: 100 + 10 - 0 + 5 - 0 = 115
  near('parse cons[0] 115', p.cons[0], 115);
  // t=1200: imp null → cons null (gol)
  eq('parse cons[1] null (imp gap)', p.cons[1], null);
  // t=1500: 500 + 20 - 0 + 7 - 0 = 527
  near('parse cons[2] 527', p.cons[2], 527);
  // soc
  eq('parse soc[0]', p.soc[0], 31);
  eq('parse soc[1] (fill)', p.soc[1], 31);
  eq('parse soc[2]', p.soc[2], 30);
}

// parseHistory: unavailable în pv → gol în linie (nu 0), și consumul devine gol
{
  const raw = { 'sensor.pv': [ { s: '100', lu: 900 }, { s: 'unavailable', lu: 1200 }, { s: '300', lu: 1500 } ] };
  const p = parseHistory(raw, { pv: 'sensor.pv' }, {});
  eq('unav pv[0]', p.pv[0], 100);
  eq('unav pv[1] (unavailable → null)', p.pv[1], null);
  eq('unav pv[2]', p.pv[2], 300);
  eq('unav cons[1] null', p.cons[1], null);
}

// parseHistory: fără date → null
{
  eq('parse empty → null', parseHistory({}, { pv: 'a' }, {}), null);
  eq('parse null → null', parseHistory(null, { pv: 'a' }, {}), null);
}

// parseHistory: consum_entity opțional (senzor de consum direct, în loc de HOUSE_W)
{
  const raw = {
    'sensor.pv': [{ s: '100', lu: 900 }],
    'sensor.consum': [{ s: '777', lu: 900 }, { s: '888', lu: 1500 }],
  };
  const ents = { pv: 'sensor.pv' };
  const p = parseHistory(raw, ents, { consum_entity: 'sensor.consum' });
  near('parse cons_entity[0]', p.cons[0], 777);
  near('parse cons_entity[2]', p.cons[2], 888);
}

// buildGraphSVG: SVG valid, font ≥ 16, fără NaN, ticks rotunde 0/1/2/3 kW
{
  const d = generateFake24h();
  const svg = buildGraphSVG(d);
  includes('svg open', svg, '<svg');
  includes('svg close', svg, '</svg>');
  notIncludes('svg no NaN', svg, 'NaN');
  // font ≥ 16 (niciun font sub 16)
  notIncludes('svg no font 10', svg, 'font-size="10"');
  notIncludes('svg no font 11', svg, 'font-size="11"');
  notIncludes('svg no font 12', svg, 'font-size="12"');
  notIncludes('svg no font 13', svg, 'font-size="13"');
  notIncludes('svg no font 14', svg, 'font-size="14"');
  notIncludes('svg no font 15', svg, 'font-size="15"');
  includes('svg font 16', svg, 'font-size="16"');
  // ticks Y rotunde: apar 1,0/2,0/3,0 kW; nu apare „3,33 kW”
  includes('svg tick 1,0 kW', svg, '1,0 kW');
  includes('svg tick 3,0 kW', svg, '3,0 kW');
  notIncludes('svg no 3,33 kW', svg, '3,33 kW');
}

// buildGraphSVG: ticks Y = 0, 1, 2, 3 kW pentru max ~3 kW (axă kW)
{
  const d = { pv: [0, 1500, 3000, 1500, 0], cons: [500, 800, 1000, 900, 400],
              soc: [], imp: [], exp: [], times: [] };
  const svg = buildGraphSVG(d);
  includes('yaxis 0 W', svg, '>0 W</text>');
  includes('yaxis 1,0 kW', svg, '>1,0 kW</text>');
  includes('yaxis 2,0 kW', svg, '>2,0 kW</text>');
  includes('yaxis 3,0 kW', svg, '>3,0 kW</text>');
  notIncludes('yaxis no 0,5 W', svg, '0,5 W');
}

// buildGraphSVG: gaps → mai multe polylines (segmente)
{
  const d = { pv: [0, 100, null, null, 200, 300], cons: [10, 20, null, null, 30, 40],
              soc: [], imp: [], exp: [], times: [] };
  const svg = buildGraphSVG(d);
  // pv are 2 segmente (0-1 și 4-5) → 2 polyline pentru pv (stroke #ffa726)
  const pvPolylines = (svg.match(/stroke="#ffa726" stroke-width="4"/g) || []).length;
  eq('gaps → 2 segmente pv', pvPolylines, 2);
}

// serie goală nu crapa
{
  const svg = buildGraphSVG({ pv: [], cons: [], imp: [], exp: [], soc: [] });
  includes('svg empty ok', svg, '<svg');
  notIncludes('svg empty no NaN', svg, 'NaN');
}

// buildBars7d: 7 bare, font ≥ 16
{
  const b = buildBars7d(generateFake7d());
  includes('bars svg', b, '<svg');
  eq('bars 7 rects', (b.match(/<rect/g) || []).length, 7);
  notIncludes('bars no NaN', b, 'NaN');
  notIncludes('bars no font 10', b, 'font-size="10"');
  includes('bars font 16', b, 'font-size="16"');
}

// tooltipInfo: cu times (epoch) și fără
{
  const d = generateFake24h();
  const t0 = tooltipInfo(d, 0);
  eq('tip time 0 (fără times)', t0.time, '00:00');
  near('tip prod 0', t0.prod, 0);
  const tMid = tooltipInfo(d, 144);
  eq('tip time 12h', tMid.time, '12:00');
  near('tip prod 12h', tMid.prod, 3000, 1);
  const tBig = tooltipInfo(d, 99999);
  eq('tip clamp idx', tBig.time, '24:00');
  const tNeg = tooltipInfo(d, -5);
  eq('tip clamp neg', tNeg.time, '00:00');
  eq('tip empty', tooltipInfo(null, 0).time, '—');
  // cu times
  const d2 = { pv: [100, 200], cons: [10, 20], soc: [30, 31], times: [1794463200, 1794463500] };
  const t2 = tooltipInfo(d2, 1);
  eq('tip cu times hh:mm', /^\d\d:\d\d$/.test(t2.time), true);
}

console.log(`graph-24h.test.js: ${passed} OK, ${failed} FAIL`);
if (failed > 0) process.exit(1);
