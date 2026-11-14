// tests/compact.test.js — fluxul compact FĂRĂ NUME (buildCompactSVG): iconițe + flux + valori.
// Rețeaua și bateria sunt bidirecționale (rândul de sus), nu apar jos; import verde / export roșu;
// săgeți (chevron) în sensul fluxului; Casă fixă la mijloc jos; text mic și constant; fără NaN.
import { buildCompactSVG } from '../src/flow-svg.js';
import { computeFlow } from '../src/flow.js';
import { iconForMdi, iconForName } from '../src/icons.js';

let passed = 0, failed = 0;
function eq(label, got, want) { if (got === want) passed++; else { failed++; console.log('FAIL', label, '=> got', JSON.stringify(got), 'want', JSON.stringify(want)); } }
function ok(label, cond) { eq(label, !!cond, true); }

const R = 'rețea';
const INFO = (over) => Object.assign({
  texts: { solar: '+192 W', grid: '−7 W', battery: '−983 W' },
  dir: { grid: 'import', battery: 'discharge' },
  soc: 31,
  entities: { solar: 'sensor.solar_total_power', grid: 'sensor.grid_import_power_w', battery: 'sensor.invertor_deye_battery' },
  icons: {},
}, over || {});

const visibleText = (svg) => [...svg.matchAll(/<text[^>]*>(.*?)<\/text>/g)].map((m) => m[1].replace(/<[^>]+>/g, '')).join('|');
const fontsOk = (svg, min) => (svg.replace(/<tspan class="cb-sub"[^>]*>[^<]*<\/tspan>/g, '').replace(/<g class="cx"[\s\S]*?<\/g><\/g>/g, '').match(/font-size="([0-9.]+)"/g) || []).every((m) => parseFloat(m.match(/"([0-9.]+)"/)[1]) >= min);
const xs = (svg) => (svg.match(/ x="(-?[0-9.]+)"/g) || []).map((m) => parseFloat(m.match(/"(-?[0-9.]+)"/)[1]));
const heightOf = (svg) => parseFloat(svg.match(/viewBox="0 0 [0-9.]+ ([0-9.]+)"/)[1]);
const boxes = (svg) => (svg.match(/class="cbox"/g) || []).length;
// corpul panglicii e un contur conic; linia centrală (`data-c`), culoarea (fill sau stroke) și grosimea maximă (`data-t`) sunt în atribute
const bands = (svg) => [...svg.matchAll(/<path class="rb-body" d="[^"]+" data-c="([^"]+)" data-t="([0-9.]+)" (?:fill="none" stroke|fill)="([^"]+)"/g)]
  .map((m) => ({ d: m[1], col: m[3], w: parseFloat(m[2]), y0: parseFloat(m[1].match(/^M[0-9.]+,([0-9.]+)/)[1]) }));
const titles = (svg) => [...svg.matchAll(/<title>([^<]*)<\/title>/g)].map((m) => m[1]);

// import + descărcare: fără nume vizibile
const flow1 = computeFlow({ solar: 192, [R]: 7, baterie: 983 }, { 'Casă': 1182, 'Baterie': 0, 'Rețea': 0 });
for (const W of [300, 336, 352, 419, 420, 480, 560, 800]) {
  const s = buildCompactSVG(flow1, INFO(), { layout: 'vertical', width: W });
  const vt = visibleText(s);
  ok('W=' + W + ' viewBox', s.includes('viewBox="0 0 ' + W + ' '));
  ok('W=' + W + ' fără nume vizibile', !/Solar|Re[țt]ea|Baterie|Cas[ăa]|TOTAL|estimat/.test(vt));
  ok('W=' + W + ' nume în <title> (accesibilitate)', titles(s).includes('Solar') && titles(s).includes('Baterie'));
  ok('W=' + W + ' text >= ' + (W < 420 ? 11 : 17), fontsOk(s, W < 420 ? 11 : 17));
  ok('W=' + W + ' fără NaN', !s.includes('NaN'));
  ok('W=' + W + ' x în desen', xs(s).every((x) => x >= -1 && x <= W + 1));
  eq('W=' + W + ' înălțime', heightOf(s), W < 420 ? 108 : 184);
  eq('W=' + W + ' 3 sus + Casă', boxes(s), 4);
}
const s = buildCompactSVG(flow1, INFO(), { layout: 'vertical', width: 336 });
ok('valori: +192 W', visibleText(s).includes('+192 W'));
ok('valori: −7 W', visibleText(s).includes('−7 W'));
ok('valori: −983 W', visibleText(s).includes('−983 W'));
ok('fără casetă TOTAL (nici nod, nici titlu „Total”)', !s.includes('flow-node') && !titles(s).includes('Total') && boxes(s) === 4);
ok('intersecția: scânteie mică, când există flux', s.includes('class="flow-hub"'));
ok('data-entity solar', s.includes('data-entity="sensor.solar_total_power"'));
ok('data-entity baterie', s.includes('data-entity="sensor.invertor_deye_battery"'));
ok('bateria arată nivelul (bat-fill)', s.includes('class="bat-fill"'));
ok('fără bile vechi / puncte', !s.includes('class="flow-dot"') && !s.includes('flow-spark'));
eq('fără săgeți (chevron) pe panglici', (s.match(/rb-chev|flow-chev/g) || []).length, 0);
eq('panglică translucidă: halou + mijloc + luminos + miez', [(s.match(/class="rb-halo"/g) || []).length, (s.match(/class="rb-mid"/g) || []).length, (s.match(/class="rb-light"/g) || []).length, (s.match(/class="rb-core"/g) || []).length].join(','), [1, 1, 1, 1].map((n) => n * bands(s).length).join(','));
ok('corpul panglicii e translucid (opacitate 0.5–0.85)', bands(s).length > 0 && [...s.matchAll(/class="rb-body"[^>]*opacity="([0-9.]+)"/g)].every((m) => parseFloat(m[1]) >= 0.5 && parseFloat(m[1]) <= 0.85));
eq('fără pete blurate care ies de pe traseu (rb-pulse)', (s.match(/rb-pulse/g) || []).length, 0);
ok('panglică: cel puțin 5 sclipiri pe panglică', (s.match(/class="rb-star"/g) || []).length >= 5 * bands(s).length);
ok('sclipirile pâlpâie (a doua animație) și strălucesc', s.includes('animation-duration:') && /animation-duration:[0-9.]+s,[0-9.]+s/.test(s) && s.includes('drop-shadow'));
ok('sclipiri de mărimi diferite', new Set((s.match(/class="rb-star" d="M0,-([0-9.]+)/g) || [])).size > 2);
ok('casete octogonale (7 laturi L + Z)', (s.match(/<g class="cbox"[^>]*><title>[^<]*<\/title><path d="([^"]+)"/)[1].match(/L/g) || []).length === 7);
ok('sclipiri: unele rotite 45° („×”), altele drepte („+”)', s.includes('offset-rotate:45deg') && s.includes('offset-rotate:0deg'));
ok('sclipiri: și puncte mici (circle)', /<circle class="rb-star"/.test(s));
ok('casete poligon teșit (path, nu dreptunghi)', s.includes('<path d="M') && !/<rect[^>]*fill="#06121c"/.test(s));

// IMPORT = ROȘU, în JOS (banda începe sus, la caseta rețelei)
{
  const b = bands(s);
  const red1 = b.filter((x) => x.col === '#ff4d5e');
  eq('import: o bandă roșie', red1.length, 1);
  ok('import: pornește de sus (y mic)', red1[0].y0 < 40);
  eq('import: nicio bandă verde (export)', b.filter((x) => x.col === '#3dff9a').length, 0);
}
// EXPORT = VERDE, în SUS (banda începe de la nod, jos, și urcă spre caseta rețelei); rețeaua NU apare jos
{
  const fl = computeFlow({ solar: 2000, [R]: 0, baterie: 0 }, { 'Casă': 600, 'Baterie': 0, 'Rețea': 1400 });
  const se = buildCompactSVG(fl, INFO({ texts: { solar: '+2 kW', grid: '+1,40 kW', battery: '0 W' }, dir: { grid: 'export', battery: 'idle' } }), { layout: 'vertical', width: 336 });
  const b = bands(se);
  const red = b.filter((x) => x.col === '#3dff9a');
  eq('export: o bandă verde', red.length, 1);
  eq('export: nicio bandă roșie (import)', b.filter((x) => x.col === '#ff4d5e').length, 0);
  ok('export: pornește de la nod (y > caseta de sus) și urcă', red[0].y0 > 40 && /,24$/.test(red[0].d));
  eq('export: casete = 3 sus + Casă (rețeaua nu e consumator)', boxes(se), 4);
  ok('export: nicio caseta „Rețea” jos', titles(se).filter((t) => t === 'Rețea').length === 1);
  ok('export: valoare + în caseta rețelei', visibleText(se).includes('+1,40 kW'));
}
// bateria se ÎNCARCĂ = bandă în sus (nu apare jos), culoare baterie
{
  const fl = computeFlow({ solar: 3000, [R]: 0, baterie: 0 }, { 'Casă': 1000, 'Baterie': 2000, 'Rețea': 0 });
  const sc = buildCompactSVG(fl, INFO({ texts: { solar: '+3 kW', grid: '0 W', battery: '+2 kW' }, dir: { grid: 'idle', battery: 'charge' } }), { layout: 'vertical', width: 336 });
  const lime = bands(sc).filter((x) => x.col === '#7dff3a');
  eq('încărcare: o bandă verde-lime', lime.length, 1);
  ok('încărcare: urcă', lime[0].y0 > 40);
  eq('încărcare: baterie nu apare jos', titles(sc).filter((t) => t === 'Baterie').length, 1);
}

// IMPORT alimentează casa: banda spre Casă (și spre consumatori) are partea din import ROȘIE
{
  const fl = computeFlow({ solar: 0, [R]: 1000, baterie: 0 }, { 'Casă': 1000, 'Baterie': 0, 'Rețea': 0 });
  const si = buildCompactSVG(fl, INFO({ texts: { solar: '0 W', grid: '−1 kW', battery: '0 W' }, dir: { grid: 'import', battery: 'idle' } }), { layout: 'vertical', width: 336 });
  const b = bands(si);
  eq('import→casă: 2 benzi roșii (rețea→nod, nod→casă)', b.filter((x) => x.col === '#ff4d5e').length, 2);
  eq('import→casă: nicio bandă în culoarea casei', b.filter((x) => x.col === '#ccffff').length, 0);
  // mixt: 500 solar + 500 import → casa primește ambele: dungi roșie + culoarea casei, alăturate
  const fm = computeFlow({ solar: 500, [R]: 500, baterie: 0 }, { 'Casă': 1000, 'Baterie': 0, 'Rețea': 0 });
  const sm = buildCompactSVG(fm, INFO({ dir: { grid: 'import', battery: 'idle' } }), { layout: 'vertical', width: 336 });
  const bm = bands(sm);
  // un SINGUR flux către casă, culoarea ei „contaminată” cu roșu (nu două dungi): nici roșu pur, nici alb pur
  const known = ['#ff4d5e', '#ccffff', '#ffa726', '#7dff3a', '#3dff9a', '#19e6ff', '#c58aff', '#6f8aa0'];
  eq('mixt: doar rețea→nod e roșu pur', bm.filter((x) => x.col === '#ff4d5e').length, 1);
  eq('mixt: nicio dungă separată în culoarea casei', bm.filter((x) => x.col === '#ccffff').length, 0);
  ok('mixt: fluxul către casă are o culoare amestecată (alb + roșu)', bm.filter((x) => !known.includes(x.col)).length === 1);
  // fără import → nicio dungă roșie
  const fs = computeFlow({ solar: 1000, [R]: 0, baterie: 0 }, { 'Casă': 1000, 'Baterie': 0, 'Rețea': 0 });
  const ss = buildCompactSVG(fs, INFO({ dir: { grid: 'idle', battery: 'idle' } }), { layout: 'vertical', width: 336 });
  eq('fără import: nicio bandă roșie', bands(ss).filter((x) => x.col === '#ff4d5e').length, 0);
}


// importul ÎNCARCĂ bateria: banda în sus spre baterie are partea din import ROȘIE
{
  const fl = computeFlow({ solar: 0, [R]: 2000, baterie: 0 }, { 'Casă': 500, 'Baterie': 1500, 'Rețea': 0 });
  const sc = buildCompactSVG(fl, INFO({ texts: { solar: '0 W', grid: '\u22122 kW', battery: '+1,50 kW' }, dir: { grid: 'import', battery: 'charge' } }), { layout: 'vertical', width: 336 });
  const b = bands(sc);
  eq('import→baterie: 3 benzi roșii (rețea→nod, nod→casă, nod→baterie în sus)', b.filter((c) => c.col === '#ff4d5e').length, 3);
  eq('import→baterie: nicio bandă lime (totul vine din import)', b.filter((c) => c.col === '#7dff3a').length, 0);
  const fm = computeFlow({ solar: 1000, [R]: 1000, baterie: 0 }, { 'Casă': 500, 'Baterie': 1500, 'Rețea': 0 });
  const sm = buildCompactSVG(fm, INFO({ dir: { grid: 'import', battery: 'charge' } }), { layout: 'vertical', width: 336 });
  const bm = bands(sm);
  ok('mixt: bateria primește un singur flux amestecat (lime + roșu), fără dungă lime separată', bm.filter((c) => c.col === '#7dff3a').length === 0 && bm.some((c) => !['#ff4d5e', '#ccffff', '#ffa726', '#7dff3a', '#3dff9a', '#19e6ff', '#c58aff'].includes(c.col)));
  // doar solar încarcă bateria: fără dungă roșie
  const fs = computeFlow({ solar: 2000, [R]: 0, baterie: 0 }, { 'Casă': 500, 'Baterie': 1500, 'Rețea': 0 });
  const ss = buildCompactSVG(fs, INFO({ dir: { grid: 'idle', battery: 'charge' } }), { layout: 'vertical', width: 336 });
  eq('solar→baterie: nicio bandă roșie', bands(ss).filter((c) => c.col === '#ff4d5e').length, 0);
}


// casetele se strâng pe conținut: iconiță + număr, fără spațiu în plus
{
  const boxW = (svg) => [...svg.matchAll(/<g class="cbox"[^>]*><title>([^<]*)<\/title><path d="([^"]+)"/g)].map((m) => {
    const xsb = (m[2].match(/[ML]\s*(-?[0-9.]+),/g) || []).map((q) => parseFloat(q.replace(/[ML]\s*/, '')));
    return { name: m[1], w: Math.max(...xsb) - Math.min(...xsb) };
  });
  const fl = computeFlow({ solar: 0, [R]: 0, baterie: 0 }, { 'Casă': 0, 'Baterie': 0, 'Rețea': 0 });
  const a = boxW(buildCompactSVG(fl, INFO({ texts: { solar: '0 W', grid: '0 W', battery: '0 W' }, dir: { grid: 'idle', battery: 'idle' } }), { layout: 'vertical', width: 336 }));
  const fl2 = computeFlow({ solar: 0, [R]: 12400, baterie: 0 }, { 'Casă': 12400, 'Baterie': 0, 'Rețea': 0 });
  const b = boxW(buildCompactSVG(fl2, INFO({ texts: { solar: '0 W', grid: '−12,4 kW', battery: '0 W' } }), { layout: 'vertical', width: 336 }));
  const g0 = a.find((x) => x.name === 'Rețea').w, g1 = b.find((x) => x.name === 'Rețea').w;
  ok('caseta „0 W” e mai îngustă decât „−12,4 kW”', g0 < g1 - 20);
  ok('caseta mică încape: lățime minimă rezonabilă (>= 46)', g0 >= 46);
  ok('casetele de sus încap în sloturi (≤ 112 px la 336 px)', [...a, ...b].filter((x) => ['Solar', 'Rețea', 'Baterie'].includes(x.name)).every((x) => x.w <= 112));
  ok('Casă 0 W: caseta mică', a.find((x) => x.name === 'Casă').w <= 80);
  // la lățime mare încap 4 consumatori + Casă, fără „Altele”
  const f4 = computeFlow({ solar: 3000, [R]: 0, baterie: 0 }, { 'Casă': 200, 'Piscină': 300, 'Hală': 250, 'EV': 150, 'AC': 100 });
  const s4 = buildCompactSVG(f4, INFO(), { layout: 'vertical', width: 700 });
  const t4 = titles(s4);
  eq('W=700: 4 consumatori + Casă pe un rând (fără Altele)', t4.filter((q) => !['Solar', 'Rețea', 'Baterie'].includes(q)).length, 5);
  ok('W=700: fără „Altele”', !t4.includes('Altele'));
  ok('W=700: casetele din rând încap în desen', [...s4.matchAll(/<g class="cbox"[^>]*><title>[^<]*<\/title><path d="M(-?[0-9.]+),/g)].every((q) => parseFloat(q[1]) >= -1));
  // la 336 px nu încap toate: restul se adună în Altele, iar rândul rămâne în desen
  const s5 = buildCompactSVG(f4, INFO(), { layout: 'vertical', width: 336 });
  ok('W=336: dacă nu încap, „Altele” apare', titles(s5).includes('Altele') || titles(s5).filter((q) => !['Solar', 'Rețea', 'Baterie'].includes(q)).length >= 4);
  ok('W=336: x în desen', xs(s5).every((x) => x >= -1 && x <= 337));
}



// opțional: casetă „Total” mică, strânsă pe conținut (show_total), la fel de înaltă ca celelalte
{
  const st = buildCompactSVG(flow1, INFO(), { showTotal: true, layout: 'vertical', width: 336 });
  ok('show_total: apare caseta Total', titles(st).includes('Total') && boxes(st) === 5);
  ok('show_total: fără NaN, în desen', !st.includes('NaN') && xs(st).every((q) => q >= -1 && q <= 337));
  ok('show_total: înălțimea crește doar cu o casetă (22 px)', heightOf(st) === 108 + 22);
  {
    const pathH = (svg, title) => { const m = svg.match(new RegExp('<title>' + title + '</title><path d="([^"]+)"')); const ys = (m[1].match(/,(-?[0-9.]+)/g) || []).map((q) => parseFloat(q.slice(1))); return Math.max(...ys) - Math.min(...ys); };
    ok('show_total: caseta Total are același format ca celelalte (22 px)', Math.abs(pathH(st, 'Total') - pathH(st, 'Solar')) < 0.6 && pathH(st, 'Total') <= 22.5);
    ok('show_total: text mic (11 px)', /<text class="cb-text"[^>]*font-size="11"[^>]*>1,18 kW/.test(st));
  }
  ok('show_total: valoarea totalului vizibilă', visibleText(st).includes('1,18 kW'));
}
// fără flux deloc: nicio scânteie, nicio bandă
{
  const f0 = computeFlow({ solar: 0, [R]: 0, baterie: 0 }, { 'Casă': 0, 'Baterie': 0, 'Rețea': 0 });
  const s0x = buildCompactSVG(f0, INFO({ texts: { solar: '0 W', grid: '0 W', battery: '0 W' }, dir: { grid: 'idle', battery: 'idle' } }), { layout: 'vertical', width: 336 });
  ok('fără flux: nicio scânteie la intersecție și nicio bandă', !s0x.includes('flow-hub') && bands(s0x).length === 0);
}


// elemente lipsă (ex. fără baterie, ca la Huawei): reașezare automată, fără goluri
{
  const cxv = 336 / 2;
  const topCx = (svg) => [...svg.matchAll(/<g class="cbox"[^>]*data-cx="([0-9.]+)" data-y="2"[^>]*><title>([^<]*)<\/title>/g)].map((m) => ({ name: m[2], cx: parseFloat(m[1]) }));
  const fl = computeFlow({ solar: 3000, [R]: 0, baterie: 0 }, { 'Casă': 2500, 'Baterie': 0, 'Rețea': 500 });
  // fără baterie: Solar + Rețea, simetrice față de mijloc
  const sb = buildCompactSVG(fl, INFO({ dir: { grid: 'export', battery: 'idle' }, present: { battery: false }, texts: { solar: '+3 kW', grid: '+500 W', battery: '0 W' } }), { layout: 'vertical', width: 336, showTotal: true });
  const tb = topCx(sb);
  eq('fără baterie: 2 casete sus (Solar, Rețea)', tb.map((q) => q.name).join(','), 'Solar,Rețea');
  ok('fără baterie: simetrice față de mijloc', Math.abs((tb[0].cx + tb[1].cx) / 2 - cxv) < 0.6 && tb[1].cx - tb[0].cx >= 120);
  ok('fără baterie: nicio casetă „Baterie”, Casă și Total prezente', !titles(sb).includes('Baterie') && titles(sb).includes('Casă') && titles(sb).includes('Total'));
  ok('fără baterie: fără NaN, în desen', !sb.includes('NaN') && xs(sb).every((q) => q >= -1 && q <= 337));
  ok('fără baterie: banda de export (verde) există, fără bandă de baterie', bands(sb).some((q) => q.col === '#3dff9a') && !bands(sb).some((q) => q.col === '#7dff3a'));
  // doar solar: în centru
  const so = buildCompactSVG(fl, INFO({ present: { grid: false, battery: false } }), { layout: 'vertical', width: 336 });
  const ts = topCx(so);
  ok('doar Solar: o casetă, în centru', ts.length === 1 && Math.abs(ts[0].cx - cxv) < 0.6);
  // doar rețea + casă
  const gr = buildCompactSVG(fl, INFO({ present: { solar: false, battery: false } }), { layout: 'vertical', width: 336 });
  eq('Rețea + Casă: Rețea singură sus', topCx(gr).map((q) => q.name).join(','), 'Rețea');
  // nimic sus: rămâne casa; fără NaN
  const nn = buildCompactSVG(fl, INFO({ present: { solar: false, grid: false, battery: false } }), { layout: 'vertical', width: 336 });
  ok('nimic sus: doar rândul de jos, fără NaN', topCx(nn).length === 0 && !nn.includes('NaN') && titles(nn).includes('Casă'));
  // implicit (fără `present`): toate trei, ca înainte
  eq('implicit: 3 casete sus', topCx(buildCompactSVG(fl, INFO(), { layout: 'vertical', width: 336 })).map((q) => q.name).join(','), 'Solar,Rețea,Baterie');
  // înălțimea nu depinde de câte casete sunt sus
  eq('înălțime identică fără baterie', heightOf(buildCompactSVG(fl, INFO({ present: { battery: false } }), { layout: 'vertical', width: 336 })), 108);
}


// caseta Total ia culoarea care domină fluxul: energie proprie = portocaliu, import = roșu, amestec continuu între ele
{
  const totalStroke = (svg) => { const m = svg.match(/<title>Total<\/title><path d="[^"]+" class="cb-line" fill="#06121c" stroke="(#[0-9a-f]{6})"/); return m && m[1]; };
  const own = computeFlow({ solar: 3000, [R]: 0, baterie: 500 }, { 'Casă': 3500, 'Baterie': 0, 'Rețea': 0 });
  const imp = computeFlow({ solar: 0, [R]: 1000, baterie: 0 }, { 'Casă': 1000, 'Baterie': 0, 'Rețea': 0 });
  const mix = computeFlow({ solar: 500, [R]: 500, baterie: 0 }, { 'Casă': 1000, 'Baterie': 0, 'Rețea': 0 });
  const zero = computeFlow({ solar: 0, [R]: 0, baterie: 0 }, { 'Casă': 0, 'Baterie': 0, 'Rețea': 0 });
  const o = (fl) => buildCompactSVG(fl, INFO(), { layout: 'vertical', width: 336, showTotal: true });
  eq('total: doar solar+baterie → portocaliu', totalStroke(o(own)), '#ffa726');
  eq('total: doar import → roșu', totalStroke(o(imp)), '#ff4d5e');
  // marginea e culoarea DOMINANTĂ, nu un amestec: import mai mare → roșu, energie proprie mai mare/egală → portocaliu
  const mix2 = computeFlow({ solar: 300, [R]: 700, baterie: 0 }, { 'Casă': 1000, 'Baterie': 0, 'Rețea': 0 });
  const mix3 = computeFlow({ solar: 700, [R]: 300, baterie: 0 }, { 'Casă': 1000, 'Baterie': 0, 'Rețea': 0 });
  const G = (hex) => parseInt(hex.slice(3, 5), 16);   // canalul verde: portocaliu 167 → roșu 77
  ok('total: import 70% → mai aproape de roșu (domină importul)', G(totalStroke(o(mix2))) < G(totalStroke(o(mix))));
  ok('total: solar 70% → mai aproape de portocaliu (domină solarul)', G(totalStroke(o(mix3))) > G(totalStroke(o(mix))));
  ok('total: trecere graduală (10% import e între portocaliu și 50%)', (() => { const m10 = computeFlow({ solar: 900, [R]: 100, baterie: 0 }, { 'Casă': 1000, 'Baterie': 0, 'Rețea': 0 }); const g = G(totalStroke(o(m10))); return g < 167 && g > G(totalStroke(o(mix))); })());
  eq('total: fără flux → gri', totalStroke(o(zero)), '#6f8aa0');
  ok('total: lumina din jur în aceeași culoare', o(imp).includes('drop-shadow(0 0 3px #ff4d5e66)'));
  ok('total: nu mai e cyan', !totalStroke(o(own)).includes('19e6ff'));
  // scânteia (fără caseta Total) ia aceeași culoare
  const sp = buildCompactSVG(imp, INFO(), { layout: 'vertical', width: 336 });
  ok('scânteia: culoarea dominantă (roșu la import)', sp.includes('class="flow-hub"') && sp.includes('drop-shadow(0 0 3px #ff4d5e99)'));
  // culoare configurabilă
  ok('own_color configurabil', totalStroke(buildCompactSVG(own, INFO({ colors: { own: '#ffd700' } }), { layout: 'vertical', width: 336, showTotal: true })) === '#ffd700');
}


// ARANJARE automată orizontal/vertical: după STRUCTURĂ (nu după valori); orizontal = în diagonală
{
  const layoutOf = (svg) => svg.includes('data-layout="horizontal"') ? 'h' : 'v';
  const place = (svg) => Object.fromEntries([...svg.matchAll(/<g class="cbox"[^>]*data-anchor="([crl])" data-cx="([0-9.]+)" data-y="([0-9.]+)"[^>]*><title>([^<]*)<\/title>/g)].map((m) => [m[4], { a: m[1], cx: parseFloat(m[2]), y: parseFloat(m[3]) }]));
  const huawei = (texts, dirs, fl) => buildCompactSVG(fl, INFO({ texts, dir: dirs, present: { battery: false } }), { width: 336, consumerCount: 0, showTotal: true });
  const day = computeFlow({ solar: 4200, [R]: 0, baterie: 0 }, { 'Casă': 2700, 'Baterie': 0, 'Rețea': 1500 });
  const night = computeFlow({ solar: 0, [R]: 850, baterie: 0 }, { 'Casă': 850, 'Baterie': 0, 'Rețea': 0 });
  const big = computeFlow({ solar: 0, [R]: 12400, baterie: 0 }, { 'Casă': 12400, 'Baterie': 0, 'Rețea': 0 });
  const tDay = { solar: '+4,20 kW', grid: '+1,50 kW', battery: '0 W' }, tNight = { solar: '0 W', grid: '\u2212850 W', battery: '0 W' }, tBig = { solar: '0 W', grid: '\u221212,4 kW', battery: '0 W' };
  const sd = huawei(tDay, { grid: 'export', battery: 'idle' }, day), sn = huawei(tNight, { grid: 'import', battery: 'idle' }, night), sb = huawei(tBig, { grid: 'import', battery: 'idle' }, big);
  ok('Huawei (Solar·Rețea + Casă): aceeași aranjare zi / noapte / valori mari', layoutOf(sd) === layoutOf(sn) && layoutOf(sn) === layoutOf(sb));
  eq('Huawei: orizontal', layoutOf(sd), 'h');
  eq('Huawei: înălțime stabilă', new Set([sd, sn, sb].map(heightOf)).size, 1);
  ok('orizontal: mult mai scund decât verticalul (≤ 76 vs 108)', heightOf(sd) <= 76);
  // designul: Solar sus-stânga, Rețea jos-stânga, Total centru jos, Casă sus-dreapta (opus totalului)
  const p = place(sd);
  ok('Solar sus-stânga (ancorat dreapta)', p.Solar.a === 'r' && p['Rețea'].a === 'r' && p.Solar.y < p['Rețea'].y);
  ok('Rețea jos-stânga, la același nivel cu totalul', Math.abs(p['Rețea'].y - p.Total.y) <= 1);
  ok('Total în centru, jos', Math.abs(p.Total.cx - 168) < 0.6 && p.Total.y > p.Casă.y);
  ok('Casă sus-dreapta, opusă totalului', p.Casă.a === 'l' && p.Casă.y === p.Solar.y);
  // cu baterie: sub Casă, în coloana din dreapta
  const withBat = buildCompactSVG(day, INFO({ dir: { grid: 'export', battery: 'charge' } }), { width: 336, consumerCount: 0, showTotal: true });
  const pb = place(withBat);
  ok('cu baterie: sub Casă, în dreapta', layoutOf(withBat) === 'h' && pb['Baterie'].a === 'l' && pb['Baterie'].y > pb.Casă.y && pb['Baterie'].y === pb['Rețea'].y);
  ok('cu baterie: aceeași înălțime ca fără', heightOf(withBat) === heightOf(sd));
  // culori / sensuri
  ok('export (verde) și fără săgeți, cu sclipiri', bands(sd).some((q) => q.col === '#3dff9a') && !/rb-chev/.test(sd) && /rb-star/.test(sd));
  ok('import (roșu) în orizontal', bands(sn).some((q) => q.col === '#ff4d5e'));
  ok('fără NaN, în desen', [sd, sn, sb, withBat].every((q) => !q.includes('NaN') && xs(q).every((v) => v >= -1 && v <= 337)));
  // consumatori configurați → vertical, chiar dacă acum e activ doar Casă
  eq('1+ consumator configurat → vertical', layoutOf(buildCompactSVG(night, INFO({ present: { battery: false }, consumerCount: 1 }), { width: 336 })), 'v');
  eq('5 consumatori configurați → vertical', layoutOf(buildCompactSVG(night, INFO({ present: { battery: false }, consumerCount: 5 }), { width: 336 })), 'v');
  // 3 surse + Casă: orizontal
  eq('3 surse + Casă → orizontal', layoutOf(buildCompactSVG(day, INFO(), { width: 336, consumerCount: 0 })), 'h');
  // forțat vertical
  eq('forțat vertical', layoutOf(buildCompactSVG(day, INFO(), { width: 336, consumerCount: 0, layout: 'vertical' })), 'v');
  // card larg → tot orizontal pentru configurații simple
  eq('W=700 Huawei → orizontal', layoutOf(buildCompactSVG(day, INFO({ present: { battery: false } }), { width: 700, consumerCount: 0 })), 'h');
  // import alimentează Casa: dungă roșie spre Casă în orizontal
  ok('import → dungă roșie spre Casă (orizontal)', bands(sn).filter((q) => q.col === '#ff4d5e').length >= 2);
}


// procentul bateriei: text mic în caseta bateriei (a doua linie), în ambele aranjări
{
  const fl = computeFlow({ solar: 2000, [R]: 0, baterie: 0 }, { 'Casă': 500, 'Baterie': 1500, 'Rețea': 0 });
  const mk = (extra, lay) => buildCompactSVG(fl, INFO(Object.assign({ soc: 62, dir: { grid: 'idle', battery: 'charge' } }, extra)), { width: 336, layout: lay });
  for (const lay of ['vertical', 'horizontal']) {
    const sv = mk({ consumerCount: lay === 'vertical' ? 2 : 0 }, lay);
    ok(lay + ': procentul bateriei apare (62%), pe același rând', /<tspan class="cb-sub"[^>]*>62%<\/tspan>/.test(sv));
    ok(lay + ': procent mai mic decât valoarea (8 px)', /<tspan class="cb-sub"[^>]*font-size="8"/.test(sv));
    eq(lay + ': o singură linie mică (doar bateria)', (sv.match(/class="cb-sub"/g) || []).length, 1);
  }
  ok('fără SOC → fără linie mică', !mk({ soc: null, consumerCount: 2 }, 'vertical').includes('cb-sub'));
  ok('procentul rotunjit', />63%<\/tspan>/.test(mk({ soc: 62.6, consumerCount: 2 }, 'vertical')));
}


// extra mici: radiația solară (W/m²) și producția pe zi, în spațiul liber, cu iconițe
{
  const EX = [{ key: 'rad', text: '115 W/m\u00b2', col: '#ffd23a', entity: 'sensor.rad' }, { key: 'prod', text: '9,34 kWh', col: '#19e6ff', entity: 'sensor.solar_total_daily' }];
  const fl = computeFlow({ solar: 3000, [R]: 0, baterie: 0 }, { 'Casă': 2700, 'Baterie': 0, 'Rețea': 300 });
  const exCount = (svg) => (svg.match(/<g class="cx"/g) || []).length;
  for (const [lay, w, extra] of [['horizontal', 336, { consumerCount: 0 }], ['vertical', 336, { consumerCount: 2 }], ['vertical', 500, { consumerCount: 2 }]]) {
    const sv = buildCompactSVG(fl, INFO(Object.assign({ extras: EX }, extra)), { layout: lay, width: w, showTotal: true });
    ok(lay + ' W=' + w + ': ambele extra apar (W/m², kWh)', exCount(sv) === 2 && visibleText(sv).includes('115 W/m\u00b2') && visibleText(sv).includes('9,34 kWh'));
    ok(lay + ' W=' + w + ': iconiță + text mic (9 px în mic)', /class="cx-text"[^>]*font-size="(9|11)"/.test(sv));
    ok(lay + ' W=' + w + ': fără NaN, în desen', !sv.includes('NaN') && xs(sv).every((q) => q >= -1 && q <= w + 1));
    ok(lay + ' W=' + w + ': apăsabile (more-info)', sv.includes('data-entity="sensor.rad"') && sv.includes('data-entity="sensor.solar_total_daily"'));
    eq(lay + ' W=' + w + ': înălțimea nu crește cu extra', heightOf(sv), heightOf(buildCompactSVG(fl, INFO(Object.assign({ extras: [] }, extra)), { layout: lay, width: w, showTotal: true })));
  }
  ok('un singur extra: apare', exCount(buildCompactSVG(fl, INFO({ extras: [EX[1]], consumerCount: 0 }), { width: 336 })) === 1);
  ok('fără extra: nimic', exCount(buildCompactSVG(fl, INFO({ extras: [], consumerCount: 0 }), { width: 336 })) === 0);
  ok('titluri pentru accesibilitate', buildCompactSVG(fl, INFO({ extras: EX, consumerCount: 2 }), { layout: 'vertical', width: 336 }).includes('<title>Produc\u021bie azi</title>'));
}

// forma fluxului diagonal: square (inalt, Total la mijloc) / wide (scund, Total jos) / auto (dupa latime)
{
  const fl = computeFlow({ solar: 500, [R]: 200, baterie: 0 }, { 'Casă': 700, 'Baterie': 0, 'Rețea': 0 });
  const mk = (width, shape) => buildCompactSVG(fl, INFO({ consumerCount: 0, present: { battery: false } }), { width, shape, showTotal: true });
  const H = (svg) => heightOf(svg);
  ok('auto: card lat (484) e inalt, telefon (336) scund', H(mk(484)) > H(mk(336)) + 40);
  ok('square pe 336: mai inalt decat auto pe 336', H(mk(336, 'square')) > H(mk(336)) + 20);
  ok('wide pe 484: mai scund decat auto pe 484', H(mk(484, 'wide')) < H(mk(484)));
  ok('wide: toate in desen, fara NaN', !mk(484, 'wide').includes('NaN') && !mk(484, 'square').includes('NaN'));
}

// stil DESCHIS (flow_style: open): fara casete, doar Total; panglicile intra in latura casetei Total (nu ies in afara ei)
{
  const dst = { 'Casă': 900, 'Hală': 450, 'Piscină': 1200, 'EV Charger': 2900, 'Aer condiționat': 450, 'Baterie': 0, 'Rețea': 0 };
  const fl = computeFlow({ solar: 4200, [R]: 1100, baterie: 600 }, dst);
  const info = INFO({ soc: 62, dir: { grid: 'import', battery: 'discharge' }, consumerCount: 4 });
  for (const w of [340, 484]) {
    const sv = buildCompactSVG(fl, info, { width: w, style: 'open', showTotal: true });
    ok('open W=' + w + ': layout open', sv.includes('data-layout="open"'));
    eq('open W=' + w + ': nicio casetă în afară de Total', (sv.match(/class="cbox"/g) || []).length, 0);
    ok('open W=' + w + ': caseta Total există', sv.includes('class="copen-total"'));
    ok('open W=' + w + ': 8 panglici (3 surse + 5 consumatori)', bands(sv).length === 8);
    ok('open W=' + w + ': fără NaN, în desen', !sv.includes('NaN') && xs(sv).every((q) => q >= -1 && q <= w + 1));
    ok('open W=' + w + ': procentul bateriei sub valoare', /class="co-sub"[^>]*>62%</.test(sv));
    // capetele dinspre Total ale panglicilor: pe latura casetei, în intervalul ei vertical
    const tp = sv.match(/class="copen-total"[^>]*><title>Total<\/title><path d="([^"]+)"/)[1];
    const nums = (tp.match(/-?[0-9.]+/g) || []).map(Number), px = nums.filter((_, i) => i % 2 === 0), py = nums.filter((_, i) => i % 2 === 1);
    const x0 = Math.min(...px), x1 = Math.max(...px), y0 = Math.min(...py), y1 = Math.max(...py);
    const ends = bands(sv).flatMap((b) => { const n = (b.d.match(/-?[0-9.]+/g) || []).map(Number); return [[n[0], n[1]], [n[6], n[7]]]; })
      .filter(([x]) => Math.abs(x - x0) < 5 || Math.abs(x - x1) < 5);
    const cc = nums[0] - x0;   // teșitura colțului
    ok('open W=' + w + ': 8 capete pe laturile casetei Total', ends.length === 8);
    ok('open W=' + w + ': toate capetele pe partea dreaptă a laturii (între teșituri)', ends.every(([, y]) => y >= y0 + cc - 0.1 && y <= y1 - cc + 0.1));
    ok('open W=' + w + ': capetele intră puțin sub casetă (fără gol)', ends.every(([px2]) => (px2 > x0 && px2 < x0 + 5) || (px2 < x1 && px2 > x1 - 5)));
  }
  // iconita/valoarea consumatorilor se colorează gradual cu rosu la import (casa alba devine rozalie cand importul e mare)
  const fi = computeFlow({ solar: 0, [R]: 900, baterie: 0 }, { 'Casă': 900, 'Baterie': 0, 'Rețea': 0 });
  const si = buildCompactSVG(fi, INFO({ dir: { grid: 'import', battery: 'idle' }, consumerCount: 0 }), { width: 340, style: 'open', showTotal: true });
  ok('open: casa alimentata din import are iconita rosie (nu alba)', !si.includes('stroke="#ccffff" color="#ccffff"') && si.includes('color="#ff4d5e"'));
}

// proportional: 10% import -> 10% rosu pe iconita si flux; consumatorii au toti culoarea casei
{
  const fl = computeFlow({ solar: 900, [R]: 100, baterie: 0 }, { 'Casă': 600, 'Piscină': 400, 'Baterie': 0, 'Rețea': 0 });
  const sv = buildCompactSVG(fl, INFO({ dir: { grid: 'import', battery: 'idle' }, consumerCount: 1 }), { width: 340, style: 'open', showTotal: true });
  const cols = [...sv.matchAll(/class="copen"[^>]*><title>[^<]*<\/title><g transform="[^"]*" fill="none" stroke="(#[0-9a-f]{6})"/g)].map((m) => m[1]);
  ok('10% import -> iconita casei amestecata 10% cu rosu (#d1edef)', cols.includes('#d1edef'));
  ok('toti consumatorii au aceeasi culoare (a casei, cu acelasi amestec)', new Set(cols.slice(-2)).size === 1);
  ok('Total: 10% import din total -> margine 10% spre rosu (#ff9e2c)', sv.includes('stroke="#ff9e2c"'));
}

// stil deschis: 3 randuri informative sub Retea (aceeasi iconita; import rosu, export verde), fara flux si fara sectiune noua
{
  const dst = { 'Casă': 900, 'Hală': 450, 'Baterie': 0, 'Rețea': 0 };
  const fl = computeFlow({ solar: 1500, [R]: 300, baterie: 0 }, dst);
  const gi = [{ text: '9,73', unit: 'kWh', label: '', col: 'imp', title: 'Import azi' }, { text: '2,56', unit: 'kWh', label: '', col: 'exp', title: 'Export azi' }, { text: '108,8', unit: 'kWh', label: '', col: 'imp', title: 'Import luna aceasta', pos: 'above' }];
  for (const w of [340, 484]) {
    const sv = buildCompactSVG(fl, INFO({ dir: { grid: 'import', battery: 'idle' }, consumerCount: 2, gridInfo: gi }), { width: w, style: 'open', showTotal: true });
    const rows = [...sv.matchAll(/class="co-row"><title>([^<]*)<\/title><g [^>]*stroke="(#[0-9a-f]{6})"[^>]*>[\s\S]*?class="co-led"[^>]*>([^<]*)</g)].map((m) => ({ t: m[1], c: m[2], x: m[3] }));
    eq('open W=' + w + ': 3 randuri informative', rows.length, 3);
    // ordine de sus in jos: import lunar (deasupra liniei Retea), apoi import azi, apoi export azi
    ok('open W=' + w + ': ordine lunar / azi / export, culori rosu / rosu / verde', rows[0].t === 'Import luna aceasta' && rows[1].t === 'Import azi' && rows[2].t === 'Export azi' && rows[0].c === '#ff4d5e' && rows[1].c === '#ff4d5e' && rows[2].c === '#3dff9a');
    ok('open W=' + w + ': texte doar valoare + unitate (fara azi/luna)', rows[0].x === '108,8 kWh' && rows[1].x === '9,73 kWh' && rows[2].x === '2,56 kWh');
    ok('open W=' + w + ': toate trei cu aceeasi iconita (stalp)', (sv.match(/class="co-row"/g) || []).length === 3);
    ok('open W=' + w + ': fara NaN, in desen', !sv.includes('NaN') && xs(sv).every((q) => q >= -1 && q <= w + 1));
    ok('open W=' + w + ': panglici neschimbate (3 surse + 2 consumatori)', bands(sv).length === 4 || bands(sv).length === 5);
  }
  const sn = buildCompactSVG(fl, INFO({ dir: { grid: 'import', battery: 'idle' }, consumerCount: 2 }), { width: 340, style: 'open', showTotal: true });
  eq('fara gridInfo: niciun rand', (sn.match(/class="co-row"/g) || []).length, 0);
}

// inaltime STABILA (stil deschis): nu depinde de cati consumatori sunt activi acum, ci de cati sunt configurati
{
  const dst5 = { 'Casă': 900, 'Hală': 450, 'Piscină': 1200, 'EV Charger': 2900, 'Aer condiționat': 450, 'Baterie': 0, 'Rețea': 0 };
  const dst2 = { 'Casă': 900, 'Piscină': 1200, 'Baterie': 0, 'Rețea': 0 };   // doar 2 active
  const mk = (d, w) => buildCompactSVG(computeFlow({ solar: 4000, [R]: 0, baterie: 0 }, d), INFO({ dir: { grid: 'idle', battery: 'idle' }, consumerCount: 5 }), { width: w, style: 'open', showTotal: true });
  for (const w of [340, 484]) eq('open W=' + w + ': aceeasi inaltime cu 2 sau 5 consumatori activi (5 configurati)', heightOf(mk(dst2, w)), heightOf(mk(dst5, w)));
}

// culori configurabile
{
  const sx = buildCompactSVG(flow1, INFO({ colors: { importGrid: '#ff0000' } }), { layout: 'vertical', width: 336 });
  ok('culoare import configurabilă', sx.includes('stroke="#ff0000"'));
}

// peste 2 consumatori → [primul, Casă, Altele]; ordine: Casă fixă la mijloc
{
  const fl = computeFlow({ solar: 3000, [R]: 0, baterie: 0 }, { 'Casă': 300, 'Piscină': 900, 'Hală': 600, 'EV': 400, 'AC': 200 });
  const s3 = buildCompactSVG(fl, INFO(), { layout: 'vertical', width: 336 });
  const t = titles(s3);
  eq('Altele: 3 sus + 3 jos', boxes(s3), 6);
  ok('ordine: Piscină, Casă, Altele', t.indexOf('Piscină') < t.indexOf('Casă') && t.indexOf('Casă') < t.indexOf('Altele'));
  const f2 = computeFlow({ solar: 2000, [R]: 0, baterie: 0 }, { 'Casă': 500, 'Piscină': 900, 'Hală': 600 });
  const t2 = titles(buildCompactSVG(f2, INFO(), { layout: 'vertical', width: 336 }));
  ok('2 consumatori: Piscină, Casă, Hală', t2.indexOf('Piscină') < t2.indexOf('Casă') && t2.indexOf('Casă') < t2.indexOf('Hală'));
  const f1c = computeFlow({ solar: 2000, [R]: 0, baterie: 0 }, { 'Casă': 500, 'Piscină': 900 });
  const t1 = titles(buildCompactSVG(f1c, INFO(), { layout: 'vertical', width: 336 }));
  ok('1 consumator: Piscină în stânga Casei (alternare stânga/dreapta)', t1.indexOf('Piscină') < t1.indexOf('Casă'));
  const f0 = computeFlow({ solar: 2000, [R]: 0, baterie: 0 }, { 'Casă': 0, 'Piscină': 900, 'Hală': 600 });
  ok('Casă 0 W rămâne afișată', titles(buildCompactSVG(f0, INFO(), { layout: 'vertical', width: 336 })).includes('Casă'));
}
// iconițe: din numele consumatorului sau din `icon:` (mdi) din config
{
  eq('mdi:pool → piscină', iconForMdi('mdi:pool'), iconForName('Piscină'));
  ok('mdi:server are iconiță proprie', iconForMdi('mdi:server') && iconForMdi('mdi:server') !== iconForName('xyz'));
  eq('mdi necunoscut → null', iconForMdi('mdi:inexistent'), null);
  const fl = computeFlow({ solar: 2000, [R]: 0, baterie: 0 }, { 'Casă': 500, 'Test': 900 });
  const a = buildCompactSVG(fl, INFO({ icons: { Test: 'mdi:server' } }), { layout: 'vertical', width: 336 });
  const b = buildCompactSVG(fl, INFO({ icons: {} }), { layout: 'vertical', width: 336 });
  ok('iconița din config schimbă desenul', a !== b);
}
// zero flux: fără NaN, fără benzi, 4 casete
{
  const fl = computeFlow({ solar: 0, [R]: 0, baterie: 0 }, { 'Casă': 0, 'Baterie': 0, 'Rețea': 0 });
  const s0 = buildCompactSVG(fl, INFO({ texts: { solar: '0 W', grid: '0 W', battery: '0 W' }, dir: { grid: 'idle', battery: 'idle' }, soc: null }), { layout: 'vertical', width: 336 });
  eq('zero: 4 casete', boxes(s0), 4);
  eq('zero: fără benzi', bands(s0).length, 0);
  ok('zero: fără NaN', !s0.includes('NaN'));
  ok('zero: estompat', s0.includes('opacity="0.5"'));
}
// senzor lipsă → „—”; escape
{
  const sm = buildCompactSVG(flow1, INFO({ texts: { solar: undefined, grid: '<b>x</b>', battery: '1 W' } }), { layout: 'vertical', width: 336 });
  ok('lipsă → —', sm.includes('—'));
  ok('escape', !sm.includes('<b>x</b>') && sm.includes('&lt;b&gt;'));
}

console.log(`compact.test.js: ${passed} OK, ${failed} FAIL`);
process.exit(failed ? 1 : 0);
