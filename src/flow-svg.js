// src/flow-svg.js — Diagrama de distribuție a fluxului de energie (SVG). Funcție PURE, fără DOM.
// Folosesc computeFlow() din flow.js pentru alocare; aici doar desenez.
// Surse în stânga, destinații în dreapta, benzi curbate (cubic bezier), grosime ∝ putere.
// Text ≥ 16, fără NaN, titlu „estimat”. Benzi sub 1% din total → omise (agregate):
// nici banda, nici blocul/eticheta sursei-destinației nu apar dacă toate benzile ei sunt sub prag.
import { fmtPower, esc } from './format.js';
import { iconForName, iconForMdi, ICON_SOLAR, ICON_RETEA, ICON_FULGER, ICON_ALTELE, ICON_SOARE, ICON_PROD } from './icons.js';

// Culori per sursă (neon, cyber). Numele din computeFlow(): solar / rețea / baterie.
const SRC_COLOR = { solar: '#00e5ff', 're\u021bea': '#ff00ea', 'retea': '#ff00ea', baterie: '#ffe066' };
const srcColor = (s) => SRC_COLOR[s] || SRC_COLOR[String(s).toLowerCase()] || '#00e5ff';

// (P3) culorile cerute explicit pentru hub: benzile sursă→nod în culoarea sursei,
// benzile nod→destinație în culoarea destinației.
const HUB_SRC_COLOR = { solar: '#19e6ff', 're\u021bea': '#ff3df0', 'retea': '#ff3df0', baterie: '#7dff3a' };
const HUB_DST_COLOR = {
  'Cas\u0103': '#ccffff', 'Baterie': '#7dff3a', 'Re\u021bea': '#ff3df0', 'Re\u0219ea': '#ff3df0',
  'Piscin\u0103': '#ffd23a', 'Hal\u0103': '#ff9a3a', 'Altele': '#c58aff',
};
const hubColor = (name, kind) =>
  (kind === 'src' ? HUB_SRC_COLOR[name] : HUB_DST_COLOR[name]) ||
  (kind === 'src' ? srcColor(name) : '#00e5ff');

/**
 * Construiește SVG-ul diagramii de flux.
 * @param {object} flow   – rezultatul computeFlow(): { alloc, totalSources, totalDestinations, imbalance }
 *   alloc = { [sursă]: { [destinație]: W } } (toate ≥ 0)
 * @param {object} opts   – { width?, height?, title?, style?, selected? } opțional
 *   style: 'hub' (implicit P3) | 'ribbons' (desenul original, neschimbat).
 *   selected: numele unei destinații (P4) → benzile ei la opacitate 1, celelalte la 0.25.
 * @returns {string} SVG (sau un div „fără flux” dacă total < 50 W)
 */
export function buildFlowSVG(flow, opts) {
  opts = opts || {};
  const total = Math.max(0, flow ? flow.totalSources : 0);
  // total < 50 W → „fără flux” (același text ca înainte, pentru ambele stiluri)
  if (total < 50) return '<div class="flow-empty">f\u0103r\u0103 flux</div>';
  // (P3) hub = stilul implicit nou; 'ribbons' = desenul original, neschimbat
  if ((opts.style || 'hub') === 'hub') return buildHubSVG(flow, opts);
  return buildRibbonSVG(flow, opts);
}
// Desenul original (ribbons) — corporatura a rămas identică, doar a schimbat numele.
function buildRibbonSVG(flow, opts) {
  opts = opts || {};
  const W = opts.width || 800, H = opts.height || 260;
  const alloc = (flow && flow.alloc) || {};
  const total = Math.max(0, flow ? flow.totalSources : 0);

  // total < 50 W → „fără flux”
  if (total < 50) return '<div class="flow-empty">f\u0103r\u0103 flux</div>';


  // (1) benzile VIZIBILE: alloc > 0 și ≥ 1% din total. Restul se agregă (omise).
  const visible = [];   // [{ s, d, v }]
  for (const s of Object.keys(alloc)) {
    for (const d of Object.keys(alloc[s] || {})) {
      const v = alloc[s][d] || 0;
      if (v > 0 && v >= 0.01 * total) visible.push({ s, d, v });
    }
  }
  // totaluri pe sursă / destinație, doar din benzile vizibile
  const srcTotal = {}, dstTotal = {};
  for (const { s, d, v } of visible) {
    srcTotal[s] = (srcTotal[s] || 0) + v;
    dstTotal[d] = (dstTotal[d] || 0) + v;
  }
  const srcs = Object.entries(srcTotal).sort((a, b) => b[1] - a[1]);
  const dsts = Object.entries(dstTotal).sort((a, b) => b[1] - a[1]);
  if (!srcs.length || !dsts.length) return '<div class="flow-empty">f\u0103r\u0103 flux</div>';

  // (2) geometrie: stânga (surse), dreapta (destinații)
  const PAD = { l: 130, r: 130, t: 44, b: 44 };
  const maxThick = 24;   // grosime maximă bandă (din prompt)
  const minThick = 2;    // grosime minimă bandă (din prompt)
  const srcX = PAD.l, dstX = W - PAD.r;

  // alocare verticală: fiecare sursă/destinație primește o „colană” de înălțime ∝ total, cu spațiere
  function stack(items, x) {
    const gap = 16;
    const sum = items.reduce((a, [, v]) => a + v, 0);
    const avail = Math.max(1, H - PAD.t - PAD.b - gap * (items.length - 1));
    const scale = avail / sum;
    let y = PAD.t;
    const out = [];
    for (const [name, v] of items) {
      const h = Math.max(16, v * scale);
      out.push({ name, total: v, y, h, x });
      y += h + gap;
    }
    return out;
  }
  const srcBlocks = stack(srcs, srcX);
  const dstBlocks = stack(dsts, dstX);
  const srcBy = {}, dstBy = {};
  for (const b of srcBlocks) srcBy[b.name] = b;
  for (const b of dstBlocks) dstBy[b.name] = b;

  const srcMax = Math.max(...srcs.map(([, v]) => v));

  // (3) benzi: pentru fiecare pereche vizibilă, grosime ∝ v, clamped la [min,max]
  //     grosimea nu depășește înălțimea sursei sau a destinației (ca să încapă în „colană”)
  let paths = '', labels = '';
  const perSrc = {}, perDst = {};
  // ordonez benzile după sursă (apoi destinație) ca să stivuiască frumos
  const order = [...visible].sort((a, b) => (srcBy[a.s].y - srcBy[b.s].y) || (dstBy[a.d].y - dstBy[b.d].y));
  for (const { s, d, v } of order) {
    const sb = srcBy[s], db = dstBy[d];
    const bySrc = sb.h * (v / sb.total);
    const byDst = db.h * (v / db.total);
    const t = Math.max(minThick, Math.min(maxThick, bySrc, byDst));
    const cy1 = (sb.y + (perSrc[s] || 0)) + t / 2;
    const cy2 = (db.y + (perDst[d] || 0)) + t / 2;
    const col = srcColor(s);
    const opacity = (0.28 + 0.42 * (v / srcMax)).toFixed(2);
    const cx = (srcX + dstX) / 2;
    const dd = `M${srcX},${cy1.toFixed(1)} C ${cx.toFixed(1)},${cy1.toFixed(1)} ${cx.toFixed(1)},${cy2.toFixed(1)} ${dstX},${cy2.toFixed(1)}`;
    paths += `<path d="${dd}" fill="none" stroke="${col}" stroke-width="${t.toFixed(1)}" stroke-opacity="${opacity}" stroke-linecap="round"/>`;
    perSrc[s] = (perSrc[s] || 0) + t;
    perDst[d] = (perDst[d] || 0) + t;
    // etichetă pe bandă doar dacă banda e suficient de groasă (ca să nu se suprapună)
    if (t >= 6) {
      const my = (cy1 + cy2) / 2;
      const txt = esc(s) + ' \u2192 ' + esc(d) + ' ' + fmtPower(v);
      labels += `<text x="${cx.toFixed(1)}" y="${(my + 5).toFixed(1)}" fill="#cfe" font-size="16" text-anchor="middle">${txt}</text>`;
    }
  }

  // (4) etichete surse (stânga) + destinații (dreapta)
  let srcLabels = '', dstLabels = '';
  for (const sb of srcBlocks) {
    const col = srcColor(sb.name);
    srcLabels += `<rect x="${srcX - 6}" y="${sb.y.toFixed(1)}" width="6" height="${sb.h.toFixed(1)}" fill="${col}"/>`;
    srcLabels += `<text x="${(srcX - 10).toFixed(1)}" y="${(sb.y + sb.h / 2 - 2).toFixed(1)}" fill="#cfe" font-size="16" text-anchor="end">${esc(sb.name)}</text>`;
    srcLabels += `<text x="${(srcX - 10).toFixed(1)}" y="${(sb.y + sb.h / 2 + 18).toFixed(1)}" fill="${col}" font-size="16" text-anchor="end">${fmtPower(sb.total)}</text>`;
  }
  for (const db of dstBlocks) {
    dstLabels += `<rect x="${dstX}" y="${db.y.toFixed(1)}" width="6" height="${db.h.toFixed(1)}" fill="#00e5ff"/>`;
    dstLabels += `<text x="${(dstX + 10).toFixed(1)}" y="${(db.y + db.h / 2 - 2).toFixed(1)}" fill="#cfe" font-size="16" text-anchor="start">${esc(db.name)}</text>`;
    dstLabels += `<text x="${(dstX + 10).toFixed(1)}" y="${(db.y + db.h / 2 + 18).toFixed(1)}" fill="#00e5ff" font-size="16" text-anchor="start">${fmtPower(db.total)}</text>`;
  }

  // (5) titlu „estimat” + dezechilibru > 50 W
  const title = opts.title || 'flux de energie (estimat)';
  const imb = (flow && flow.imbalance) || 0;
  let foot = `<text x="${(W / 2).toFixed(1)}" y="22" fill="#7fd" font-size="16" text-anchor="middle">${esc(title)}</text>`;
  if (Math.abs(imb) > 50) {
    foot += `<text x="${(W / 2).toFixed(1)}" y="${H - 8}" fill="#ff00ea" font-size="16" text-anchor="middle">dezechilibru ${fmtPower(imb)}</text>`;
  }

  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;">
${foot}
${srcLabels}${dstLabels}
${paths}${labels}
</svg>`;
}

// (P3) Diagramă cu NOD CENTRAL. Surse în stânga, destinații în dreapta, un nod
// central (dreptunghi cu colțuri tăiate + glow) care afișează TOTALUL surselor.
// Alocarea sursă→destinație vine din computeFlow() (ne-rescrisă); aici doar desenez.
//   banda sursă→nod: culoarea SURSEI, grosime ∝ totalul sursei;
//   banda nod→destinație: culoarea DESTINAȚIEI, grosime ∝ totalul destinației;
//   benzi sub 1% din total → omise; total < 50 W → „fără flux” (în buildFlowSVG).
//   nodul arată „dezechilibru X W” doar dacă |surse − destinații| > 50 W.
// (P4) opts.selected = nume destinație: benzile ei la opacitate 1, celelalte la 0.25;
//      etichetele destinațiilor sunt butoane (data-flow-dst) cu țintă ≥ 48 px.
function buildHubSVG(flow, opts) {
  const W = opts.width || 800;
  const alloc = (flow && flow.alloc) || {};
  const total = Math.max(0, flow.totalSources);
  const selected = opts.selected || null;

  // totaluri pe sursă / destinație (toate alocările, apoi filtru la 1%)
  const srcTotal = {}, dstTotal = {};
  for (const s of Object.keys(alloc)) {
    for (const d of Object.keys(alloc[s] || {})) {
      const v = alloc[s][d] || 0;
      if (v <= 0) continue;
      srcTotal[s] = (srcTotal[s] || 0) + v;
      dstTotal[d] = (dstTotal[d] || 0) + v;
    }
  }
  // doar sursele / destinațiile cu ≥ 1% din total apar în diagramă
  const srcs = Object.entries(srcTotal).filter(([, v]) => v >= 0.01 * total);
  const dsts = Object.entries(dstTotal).filter(([, v]) => v >= 0.01 * total);
  if (!srcs.length || !dsts.length) return '<div class="flow-empty">f\u0103r\u0103 flux</div>';
  const H = opts.height || Math.max(230, 84 + 72 * Math.max(srcs.length, dsts.length));

  // geometrie: nodul central, surse stânga, destinații dreapta
  const narrow = W < 640;                       // card îngust: cutii și nod mai mici, text tot ≥ 16
  const nodeW = narrow ? 100 : 164, nodeH = narrow ? 84 : 92;
  const nx0 = (W - nodeW) / 2, nx1 = nx0 + nodeW;
  const ny0 = (H - nodeH) / 2, ny1 = ny0 + nodeH;
  const boxW = narrow ? 128 : 200, srcX = 6 + boxW, dstX = W - 6 - boxW;      // x-ul de unde pleacă benzile
  const maxThick = 24, minThick = 7;   // grosime ∝ putere, clamped (ca la ribbons)
  const srcSum = srcs.reduce((a, [, v]) => a + v, 0);
  const dstSum = dsts.reduce((a, [, v]) => a + v, 0);
  const maxV = Math.max(...srcs.map(([, v]) => v), ...dsts.map(([, v]) => v));

  // așez vertical: fiecare sursă/destinație = un punct centrat pe o coloană
  function rowY(items) {
    const top = 48, bottom = H - 12, step = (bottom - top) / items.length;
    const out = {};
    items.forEach(([name], i) => { out[name] = { y: top + step * (i + 0.5), h: 60 }; });
    return out;
  }
  const srcAt = rowY(srcs);
  const dstAt = rowY(dsts);

  // puncte de atașare pe muchia stângă / dreaptă a nodului (stivuite pe total)
  function edgeAt(items, sum, y0, y1) {
    const gap = 8;
    const span = (y1 - y0) - gap * (items.length - 1);
    let y = y0 + gap;
    const out = {};
    for (const [name, v] of items) {
      const h = Math.max(10, (span * v) / (sum || 1));
      out[name] = y + h / 2;
      y += h + gap;
    }
    return out;
  }
  const srcEdge = edgeAt(srcs, srcSum, ny0 + 6, ny1 - 6);
  const dstEdge = edgeAt(dsts, dstSum, ny0 + 6, ny1 - 6);

  const thick = (v) => Math.max(minThick, Math.min(maxThick, (maxV > 0 ? v / maxV : 0) * maxThick));
  // opacitate banda în funcție de selecția P4: banda „evidențiată" = 1, restul 0.25
  const bandOp = (d, isDst) => (selected == null) ? '' : (isDst && d === selected) ? '1' : '0.25';

  // puncte de lumină care curg pe bandă (CSS offset-path; oprite la prefers-reduced-motion)
  const dots = (d) => {
    let o = '';
    for (let k = 0; k < 2; k++) {
      o += '<circle class="flow-dot" r="4.5" cx="0" cy="0" fill="#fff" style="offset-path:path(\'' + d +
        '\');animation-delay:-' + (k * 1.4).toFixed(1) + 's"/>';
    }
    return o;
  };
  let paths = '', labels = '';
  const nodeMidY = (ny0 + ny1) / 2;
  // Caz degenerat: o singură sursă și o singură destinație → o singură bandă
  // dreaptă prin nod (corespunde așteptărilor testelor existente: 1 path pe flux).
  if (srcs.length === 1 && dsts.length === 1) {
    const s = srcs[0][0], d = dsts[0][0];
    const v = alloc[s][d] || 0;
    const t = thick(v);
    const col = hubColor(s, 'src');
    const y2 = dstAt[d].y;
    const op = bandOp(d, true);
    const dimAttr = op ? ' stroke-opacity="' + op + '"' : '';
    paths += '<path class="flow-band" data-flow-src="' + esc(s) + '" data-flow-dst="' + esc(d) + '" ' +
      'd="M' + srcX + ',' + nodeMidY.toFixed(1) + ' H' + dstX + '" fill="none" ' +
      'stroke="' + col + '" stroke-width="' + t.toFixed(1) + '"' + dimAttr + ' stroke-linecap="round"/>';
    paths += dots('M' + srcX + ',' + nodeMidY.toFixed(1) + ' H' + dstX); // (etichetele sursei/destinației se desenează mai jos)
  } else {
  // banda sursă→nod: culoarea sursei
  for (const [s, v] of srcs) {
    const t = thick(v);
    const y1 = srcAt[s].y, y2 = srcEdge[s];
    const col = hubColor(s, 'src');
    const op = bandOp(s, false);
    const dimAttr = op ? ' stroke-opacity="' + op + '"' : '';
    const cx = (srcX + nx0) / 2;
    paths += '<path class="flow-band" data-flow-src="' + esc(s) + '" ' +
      'd="M' + srcX + ',' + y1.toFixed(1) + ' C ' + cx.toFixed(1) + ',' + y1.toFixed(1) + ' ' +
      cx.toFixed(1) + ',' + y2.toFixed(1) + ' ' + nx0 + ',' + y2.toFixed(1) + '" fill="none" ' +
      'stroke="' + col + '" stroke-width="' + t.toFixed(1) + '"' + dimAttr + ' stroke-linecap="round"/>';
    paths += dots('M' + srcX + ',' + y1.toFixed(1) + ' C ' + cx.toFixed(1) + ',' + y1.toFixed(1) + ' ' +
      cx.toFixed(1) + ',' + y2.toFixed(1) + ' ' + nx0 + ',' + y2.toFixed(1));
  }
  // banda nod→destinație: culoarea destinației
  for (const [d, v] of dsts) {
    const t = thick(v);
    const y1 = dstEdge[d], y2 = dstAt[d].y;
    const col = hubColor(d, 'dst');
    const op = bandOp(d, true);
    const dimAttr = op ? ' stroke-opacity="' + op + '"' : '';
    const cx = (nx1 + dstX) / 2;
    paths += '<path class="flow-band" data-flow-dst="' + esc(d) + '" ' +
      'd="M' + nx1 + ',' + y1.toFixed(1) + ' C ' + cx.toFixed(1) + ',' + y1.toFixed(1) + ' ' +
      cx.toFixed(1) + ',' + y2.toFixed(1) + ' ' + dstX + ',' + y2.toFixed(1) + '" fill="none" ' +
      'stroke="' + col + '" stroke-width="' + t.toFixed(1) + '"' + dimAttr + ' stroke-linecap="round"/>';
    paths += dots('M' + nx1 + ',' + y1.toFixed(1) + ' C ' + cx.toFixed(1) + ',' + y1.toFixed(1) + ' ' +
      cx.toFixed(1) + ',' + y2.toFixed(1) + ' ' + dstX + ',' + y2.toFixed(1));
  }
  } // încheiere caz multiplu (else)

  // nod central: dreptunghi cu colțuri tăiate (polyline) + glow, TOTALUL surselor
  const cut = 12;
  const nodeShape =
    '<polygon class="flow-node" points="' +
    (nx0 + cut) + ',' + ny0 + ' ' + nx1 + ',' + ny0 + ' ' +
    (nx1) + ',' + (ny1 - cut) + ' ' + (nx1 - cut) + ',' + ny1 + ' ' +
    nx0 + ',' + (ny1 - cut) + ' ' + nx0 + ',' + ny0 + '" ' +
    'fill="#071624" stroke="#19e6ff" stroke-width="2"/>';
  const totalTxt = '<text x="' + (W / 2).toFixed(1) + '" y="' + (nodeMidY - 10).toFixed(1) +
    '" fill="#19e6ff" font-size="16" letter-spacing="2" text-anchor="middle">TOTAL</text>';
  const totalVal = '<text x="' + (W / 2).toFixed(1) + '" y="' + (nodeMidY + 22).toFixed(1) +
    '" fill="#fff" font-size="' + (narrow ? 24 : 30) + '" font-weight="bold" text-anchor="middle">' + fmtPower(total) + '</text>';
  // dezechilibru: discret, DOAR dacă |surse − destinații| > 50 W
  const imb = (flow.imbalance != null) ? flow.imbalance : (flow.totalSources - (flow.totalDestinations || 0));
  let imbTxt = '';
  if (Math.abs(imb) > 50) {
    imbTxt = '<text x="' + (W / 2).toFixed(1) + '" y="' + (ny1 + 22).toFixed(1) +
      '" fill="#ff3df0" font-size="16" text-anchor="middle">dezechilibru ' + fmtPower(Math.round(imb)) + '</text>';
  }
  labels += nodeShape + totalTxt + totalVal + imbTxt;

  const cut12 = (t) => { t = String(t); return t.length > (narrow ? 9 : 14) ? t.slice(0, narrow ? 8 : 13) + '…' : t; };
  const cap = (t) => { t = String(t); return t.charAt(0).toUpperCase() + t.slice(1); };
  // cutie cu iconiță + nume + valoare (surse stânga, destinații dreapta)
  const mkBox = (x, yc, name, v, col, isDst, op) =>
    '<g' + (isDst ? ' class="flow-dst" data-flow-dst="' + esc(name) + '" style="cursor:pointer"' : '') +
    (op !== '1' ? ' opacity="' + op + '"' : '') + '>' +
    '<rect class="flow-box" x="' + x + '" y="' + (yc - 30).toFixed(1) + '" width="' + boxW +
    '" height="60" rx="12" fill="#06121c" stroke="' + col + '" stroke-width="2"/>' +
    '<g transform="translate(' + (x + (narrow ? 8 : 12)) + ',' + (yc - (narrow ? 14 : 18)).toFixed(1) + ') scale(' + (narrow ? 0.875 : 1.125) + ')" fill="none" stroke="' + col +
    '" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + iconForName(name) + '</g>' +
    '<text x="' + (x + (narrow ? 42 : 60)) + '" y="' + (yc - 4).toFixed(1) + '" fill="#e8fbff" font-size="' + (narrow ? 16 : 17) + '" font-weight="bold">' +
      esc(cut12(cap(name))) + '</text>' +
    '<text x="' + (x + (narrow ? 42 : 60)) + '" y="' + (yc + (narrow ? 18 : 20)).toFixed(1) + '" fill="' + col + '" font-size="' + (narrow ? 16 : 20) + '" font-weight="bold">' +
      fmtPower(v) + '</text></g>';
  for (const [s2, v] of srcs) labels += mkBox(6, srcAt[s2].y, s2, v, hubColor(s2, 'src'), false, '1');
  for (const [d, v] of dsts) {
    const boxOp = (selected == null || selected === d) ? '1' : '0.35';
    labels += mkBox(dstX, dstAt[d].y, d, v, hubColor(d, 'dst'), true, boxOp);
  }

  // titlu „estimat” (ca la ribbons) deasupra
  const title = opts.title || 'flux de energie (estimat)';
  const foot = '<text x="' + (W / 2).toFixed(1) + '" y="22" fill="#7fd" font-size="18" text-anchor="middle">' +
    esc(title) + '</text>';

  return '<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" ' +
    'style="width:100%;height:auto;">' +
    foot + paths + labels + '</svg>';
}

// ---------------------------------------------------------------------------
// Fluxul COMPACT, fără nume: doar iconițe, flux și valori (W/kW). Aranjare verticală la orice lățime.
//   rând sus   : Solar · Rețea · Baterie (fixe; rețeaua și bateria merg în ambele sensuri)
//   mijloc     : nod cu totalul
//   rând jos   : consumatorii (Casă fixă la mijloc; max 3; restul → „Altele”)
// IMPORT = ROȘU (rețea → nod → destinațiile alimentate din import); EXPORT = VERDE (nod → rețea, în sus).
// Panglici ca în poza de referință: halou larg translucid + corp + miez luminos + sclipiri + săgeți în sensul fluxului.
// flow = computeFlow(); info = { texts:{solar,grid,battery}, dir:{grid,battery}, soc, entities:{…}, dim:{…}, icons:{nume:mdi}, colors:{…} }
// ---------------------------------------------------------------------------
export function buildCompactSVG(flow, info, opts) {
  opts = opts || {};
  info = info || {};
  const texts = info.texts || {}, ents = info.entities || {}, dirs = info.dir || {};
  const iconsCfg = info.icons || {};
  const colors = Object.assign({ solar: '#ffa726', importGrid: '#ff4d5e', exportGrid: '#3dff9a', battery: '#7dff3a', house: '#ccffff', other: '#19e6ff', more: '#c58aff', own: '#ffa726' }, info.colors || {});
  const W = opts.width || 336;
  const small = W < 420;
  const M = small
    ? { bh: 22, vg: 30, nodeH: 22, fv: 11, ico: 12, cut: 5, pad: 4, gap: 5, nfv: 12 }
    : { bh: 42, vg: 48, nodeH: 30, fv: 17, ico: 24, cut: 9, pad: 6, gap: 8, nfv: 18 };
  const alloc = (flow && flow.alloc) || {};
  const total = Math.max(0, (flow && flow.totalSources) || 0);

  const srcTotal = {}, dstTotal = {};
  for (const s of Object.keys(alloc)) {
    for (const d of Object.keys(alloc[s] || {})) {
      const v = alloc[s][d] || 0;
      if (v <= 0) continue;
      srcTotal[s] = (srcTotal[s] || 0) + v;
      dstTotal[d] = (dstTotal[d] || 0) + v;
    }
  }
  const R = 'rețea', houseName = 'Casă';
  const solarV = srcTotal.solar || 0;
  const gridImp = srcTotal[R] || 0, gridExp = dstTotal['Rețea'] || 0;
  const batDis = srcTotal.baterie || 0, batChg = dstTotal['Baterie'] || 0;

  // ---- dimensiuni casete: se strâng pe conținut (iconiță + număr), centrate pe slotul lor ----
  const CH = { d: 0.6, c: 0.3, s: 0.3, p: 0.6, m: 0.6, k: 0.58, W: 0.95, x: 0.9, o: 0.6 };   // lățimi aproximative (em), generoase
  const estW = (txt, fs) => {
    let w = 0;
    for (const ch of String(txt)) {
      w += /[0-9]/.test(ch) ? CH.d : (ch === ',' || ch === '.') ? CH.c : ch === ' ' ? CH.s : ch === '+' ? CH.p :
        (ch === '−' || ch === '-') ? CH.m : ch === 'k' ? CH.k : ch === 'W' ? CH.W : ch === '—' ? CH.x : CH.o;
    }
    return w * fs;
  };
  const padX = small ? 6 : 11, gapIT = small ? 4 : 8, subFs = small ? 8 : 11;
  const fitW = (txt, sub) => Math.ceil(2 * padX + M.ico + gapIT + estW(txt, M.fv) + (sub ? estW(sub, subFs) + 4 : 0) + 4);

  // consumatori (jos): Casă fixă la mijloc; consumatorii alternativ stânga/dreapta (după putere), câți încap pe un rând;
  // restul se adună în „Altele”. Rețeaua/bateria nu apar aici (sunt sus).
  const houseV = dstTotal[houseName] || 0;
  const others = Object.entries(dstTotal)
    .filter(([n, v]) => n !== houseName && n !== 'Rețea' && n !== 'Baterie' && total > 0 && v >= 0.01 * total)
    .sort((a, b) => b[1] - a[1]);
  const gapB = M.gap;
  const layoutBottom = (maxVis) => {
    const vis = others.slice(0, maxVis), extra = others.slice(maxVis);
    const items = vis.map(([name, v]) => ({ name, v }));
    if (extra.length) items.push({ name: 'Altele', v: extra.reduce((a, [, v]) => a + v, 0), members: extra.map(([n]) => n) });
    const house = { name: houseName, v: houseV, w: fitW(fmtPower(houseV)), cx: W / 2 };
    const lefts = [], rights = [];
    items.forEach((it, i) => { it.w = fitW(fmtPower(it.v)); (i % 2 === 0 ? lefts : rights).push(it); });
    let edgeL = W / 2 - house.w / 2 - gapB;
    for (const it of lefts) { it.cx = edgeL - it.w / 2; edgeL -= it.w + gapB; }
    let edgeR = W / 2 + house.w / 2 + gapB;
    for (const it of rights) { it.cx = edgeR + it.w / 2; edgeR += it.w + gapB; }
    const all = [...lefts, house, ...rights].sort((a, b) => a.cx - b.cx);
    return { boxes: all, minX: Math.min(...all.map((b) => b.cx - b.w / 2)), maxX: Math.max(...all.map((b) => b.cx + b.w / 2)) };
  };
  let layout = null;
  for (let mv = others.length <= 4 ? others.length : 3; mv >= 0; mv--) {
    const L = layoutBottom(mv);
    if (L.minX >= M.pad - 0.5 && L.maxX <= W - M.pad + 0.5) { layout = L; break; }
  }
  if (!layout) layout = layoutBottom(0);
  const dsts = layout.boxes.map((b) => [b.name, b.v]);
  const altMembers = ((layout.boxes.find((b) => b.name === 'Altele') || {}).members) || [];
  // cât din fiecare destinație vine din IMPORT (se colorează roșu pe bandă)
  const importShare = (name) => {
    if (gridImp <= 0) return 0;
    if (name === 'Altele') {
      const imp = altMembers.reduce((acc, n) => acc + ((alloc[R] || {})[n] || 0), 0);
      const tot = altMembers.reduce((acc, n) => acc + (dstTotal[n] || 0), 0);
      return tot > 0 ? imp / tot : 0;
    }
    const tot = dstTotal[name] || 0;
    return tot > 0 ? ((alloc[R] || {})[name] || 0) / tot : 0;
  };

  const { bh, vg, cut } = M;
  const showTotal = !!opts.showTotal;            // implicit: fără casetă TOTAL (doar o scânteie la intersecție)
  const nodeH = showTotal ? bh : 0;               // caseta „Total” (opțională) are același format ca restul
  const bw = Math.floor((W - 2 * M.pad - 2 * M.gap) / 3);
  const srcTop = 2, srcBot = srcTop + bh, nodeTop = srcBot + vg, nodeBot = nodeTop + nodeH;
  const dstTop = nodeBot + vg, dstBot = dstTop + bh;
  const H = opts.height || (dstBot + 2);
  const cx = W / 2;
  const nodeW = small ? 112 : 150;
  const nx0 = cx - nodeW / 2, nx1 = cx + nodeW / 2;
  const attSp = showTotal ? 22 : 10;             // cât de depărtate se prind panglicile de intersecție
  const allV = [solarV, gridImp, gridExp, batDis, batChg, ...dsts.map(([, v]) => v)];
  const maxV = Math.max(1, ...allV);
  const thick = (v) => (small ? 8 : 11) + Math.min(1, v / maxV) * (small ? 9 : 15);   // 9–20 px (mic) / 11–26 px: late și pline, ca în poză

  // ---- panglici ----
  const lighten = (hex, k) => {
    const m = /^#([0-9a-f]{6})$/i.exec(hex);
    if (!m) return '#ffffff';
    const n = parseInt(m[1], 16);
    const f = (c) => Math.round(c + (255 - c) * k);
    return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => f(c).toString(16).padStart(2, '0')).join('');
  };
  // pseudo-aleatoriu determinist (aceeași imagine la fiecare randare)
  const rnd = (n) => { const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
  let ribbonSeq = 0;
  const approxLen = (d) => {
    const n = (d.match(/-?[0-9.]+/g) || []).map(Number);
    if (n.length < 8) return 40;
    let L = 0;
    for (let i = 0; i < 3; i++) L += Math.hypot(n[2 * i + 2] - n[2 * i], n[2 * i + 3] - n[2 * i + 1]);
    return L * 0.92;
  };
  const star = (z) => 'M0,' + (-z) + ' L' + (z * 0.28).toFixed(2) + ',' + (-z * 0.28).toFixed(2) + ' L' + z + ',0 L' + (z * 0.28).toFixed(2) + ',' + (z * 0.28).toFixed(2) +
    ' L0,' + z + ' L' + (-z * 0.28).toFixed(2) + ',' + (z * 0.28).toFixed(2) + ' L' + (-z) + ',0 L' + (-z * 0.28).toFixed(2) + ',' + (-z * 0.28).toFixed(2) + ' Z';
  // sclipiri (ca în poza de referință): cruciulițe „×” / „+” de mărimi diferite și puncte, strălucitoare, cu pâlpâire,
  // înșirate pe miez; nicio săgeată, nicio pată (pulsul = sclipirile care curg)
  const sparkles = (d, t, col) => {
    const id = ribbonSeq++;
    const len = approxLen(d);
    const n = Math.max(6, Math.min(12, Math.round(len / 8.5)));
    const glow = 'filter:drop-shadow(0 0 1px ' + col + '99);';
    let o = '';
    for (let k = 0; k < n; k++) {
      const r1 = rnd(id * 31 + k + 1), r2 = rnd(id * 17 + k + 5), r3 = rnd(id * 7 + k + 11);
      const dur = 1.9 + r1 * 1.7, tw = 0.7 + r3 * 1.1;
      const delay = (-(k / n) * dur - r2 * 0.5).toFixed(2);
      const common = 'style="offset-path:path(\'' + d + '\');offset-rotate:' + (r3 > 0.5 ? 45 : 0) + 'deg;' + glow +
        'animation-duration:' + dur.toFixed(2) + 's,' + tw.toFixed(2) + 's;animation-delay:' + delay + 's,' + (-r2 * tw).toFixed(2) + 's"';
      if (k % 3 === 2) {
        o += '<circle class="rb-star" r="' + (0.9 + r2 * 1.1).toFixed(1) + '" cx="0" cy="0" fill="#fff" ' + common + '/>';
      } else {
        const z = 1.8 + r2 * 2.4 + Math.min(1.4, t / 14);
        o += '<path class="rb-star" d="' + star(parseFloat(z.toFixed(1))) + '" fill="#fff" ' + common + '/>';
      }
    }
    return o;
  };
  // panglică ca în poză, TRANSLUCIDĂ: halou moale, corp saturat translucid (margini mai închise), strat mijlociu și luminos spre centru,
  // miez alb-colorat subțire, apoi sclipiri + puls
  // Panglica e CONICĂ, ca în poza de referință: subțire la capătul de proveniență / destinație, mai groasă la intrarea/ieșirea din Total.
  // Capătul dinspre Total = cel mai apropiat de un punct din `hubPts` (umplut de aranjare). Dacă `d` nu e o singură curbă cubică → bandă de lățime constantă.
  const hubPts = [];
  const parseCubic = (d) => {
    const n = (d.match(/-?[0-9]*\.?[0-9]+/g) || []).map(Number);
    return (n.length === 8 && /^M/.test(d) && (d.match(/C/g) || []).length === 1) ? n : null;
  };
  const taperPoly = (P, wOf, k, add) => {
    const N = 30, L = [], R = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N, v = 1 - u;
      const x = v * v * v * P[0] + 3 * v * v * u * P[2] + 3 * v * u * u * P[4] + u * u * u * P[6];
      const y = v * v * v * P[1] + 3 * v * v * u * P[3] + 3 * v * u * u * P[5] + u * u * u * P[7];
      let dx = 3 * v * v * (P[2] - P[0]) + 6 * v * u * (P[4] - P[2]) + 3 * u * u * (P[6] - P[4]);
      let dy = 3 * v * v * (P[3] - P[1]) + 6 * v * u * (P[5] - P[3]) + 3 * u * u * (P[7] - P[5]);
      const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
      const h = (wOf(u) * k + (add || 0)) / 2;
      L.push([x - dy * h, y + dx * h]); R.push([x + dy * h, y - dx * h]);
    }
    const pts = L.concat(R.reverse());
    return 'M' + pts.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' L') + ' Z';
  };
  const ribbon = (d, col, t, spec) => {
    const P = parseCubic(d);
    let body;
    if (P) {
      const dist = (x, y) => Math.min(...(hubPts.length ? hubPts : [[P[0], P[1]]]).map((h) => Math.hypot(h[0] - x, h[1] - y)));
      const hubAtStart = dist(P[0], P[1]) <= dist(P[6], P[7]);
      const wMax = t * 1.2, wMin = Math.max(1.6, t * 0.28);
      let wOf = (u) => { const s = hubAtStart ? 1 - u : u; const e = s * s * (3 - 2 * s); return wMin + (wMax - wMin) * e; };
      if (spec && spec.hubW != null) {
        // fusiform: vârf subțire la sursă/destinație, lățimea reală (proporțională cu puterea) la mijloc, îngust la intrarea în Total (încape în latura casetei)
        const tip = Math.max(1.8, t * 0.22), hw = Math.min(spec.hubW, t), lenF = Math.min(1, approxLen(d) / 110);   // panglicile scurte se umflă mai puțin (nu devin „bulbi”)
        wOf = (u) => {
          const s = spec.hubAtStart ? 1 - u : u;
          const lin = tip + (hw - tip) * s;
          return lin + Math.max(0, t - Math.max(tip, hw)) * lenF * Math.pow(Math.sin(Math.PI * Math.min(1, Math.max(0, s))), 1.1);
        };
      }
      body =
        '<path class="rb-halo" d="' + taperPoly(P, wOf, 1.9) + '" fill="' + col + '" opacity="0.10"/>' +
        '<path class="rb-edge" d="' + taperPoly(P, wOf, 1, 1.6) + '" fill="' + lighten(col, 0.3) + '" opacity="0.32"/>' +
        '<path class="rb-body" d="' + taperPoly(P, wOf, 1) + '" data-c="' + d + '" data-t="' + t.toFixed(1) + '" fill="' + col + '" opacity="0.5"/>' +
        '<path class="rb-mid" d="' + taperPoly(P, wOf, 0.5) + '" fill="' + lighten(col, 0.25) + '" opacity="0.3"/>' +
        '<path class="rb-light" d="' + taperPoly(P, wOf, 0.22) + '" fill="' + lighten(col, 0.55) + '" opacity="0.5"/>';
    } else {
      body =
        '<path class="rb-halo" d="' + d + '" fill="none" stroke="' + col + '" stroke-width="' + (t * 1.9).toFixed(1) + '" stroke-linecap="round" opacity="0.10"/>' +
        '<path class="rb-edge" d="' + d + '" fill="none" stroke="' + lighten(col, 0.3) + '" stroke-width="' + (t + 1.6).toFixed(1) + '" stroke-linecap="round" opacity="0.32"/>' +
        '<path class="rb-body" d="' + d + '" data-c="' + d + '" data-t="' + t.toFixed(1) + '" fill="none" stroke="' + col + '" stroke-width="' + t.toFixed(1) + '" stroke-linecap="round" opacity="0.5"/>' +
        '<path class="rb-mid" d="' + d + '" fill="none" stroke="' + lighten(col, 0.25) + '" stroke-width="' + (t * 0.5).toFixed(1) + '" stroke-linecap="round" opacity="0.3"/>' +
        '<path class="rb-light" d="' + d + '" fill="none" stroke="' + lighten(col, 0.55) + '" stroke-width="' + (t * 0.22).toFixed(1) + '" stroke-linecap="round" opacity="0.5"/>';
    }
    return body +
      '<path class="rb-core" d="' + d + '" fill="none" stroke="' + lighten(col, 0.9) + '" stroke-width="' + Math.max(0.8, t * 0.07).toFixed(1) + '" stroke-linecap="round" opacity="0.75"/>' +
      sparkles(d, t, col);
  };
  const down = (sx, sy, ax, ay) => 'M' + sx.toFixed(1) + ',' + sy + ' C ' + sx.toFixed(1) + ',' + (sy + vg * 0.6).toFixed(1) + ' ' +
    ax.toFixed(1) + ',' + (ay - vg * 0.6).toFixed(1) + ' ' + ax.toFixed(1) + ',' + ay;
  const up = (ax, ay, sx, sy) => 'M' + ax.toFixed(1) + ',' + ay + ' C ' + ax.toFixed(1) + ',' + (ay - vg * 0.6).toFixed(1) + ' ' +
    sx.toFixed(1) + ',' + (sy + vg * 0.6).toFixed(1) + ' ' + sx.toFixed(1) + ',' + sy;

  // ---- casete octogonale (toate colțurile teșite, ca în poză) ----
  const oct = (x, y, w, h, c) => 'M' + (x + c) + ',' + y + ' L' + (x + w - c) + ',' + y + ' L' + (x + w) + ',' + (y + c) +
    ' L' + (x + w) + ',' + (y + h - c) + ' L' + (x + w - c) + ',' + (y + h) + ' L' + (x + c) + ',' + (y + h) +
    ' L' + x + ',' + (y + h - c) + ' L' + x + ',' + (y + c) + ' Z';
  const batteryIcon = (soc) => {
    let o = '<rect x="8" y="6" width="16" height="23" rx="2.5"/><path d="M13 6V3h6v3"/>';
    if (soc != null && isFinite(soc)) {
      const h = soc > 0 ? Math.max(2.6, Math.min(18, 18 * soc / 100)) : 0;   // umplerea graduală (proporțională cu SOC), mereu vizibilă când SOC > 0
      if (h > 0.5) o += '<rect class="bat-fill" x="10.5" y="' + (26.5 - h).toFixed(1) + '" width="11" height="' + h.toFixed(1) + '" rx="1" fill="currentColor" stroke="none"/>';
    }
    return o;
  };
  const iconFor = (name, key) => {
    if (key === 'battery') return batteryIcon(info.soc);
    if (key === 'total') return ICON_FULGER;
    if (key === 'solar') return ICON_SOLAR;
    if (key === 'grid') return ICON_RETEA;
    if (name === 'Altele') return ICON_ALTELE;
    return iconForMdi(iconsCfg[name]) || iconForName(name);
  };
  // casetă strânsă pe conținut: [iconiță][număr (+ procent mic)], centrată pe cxB; `maxW` limitează lățimea (slotul din rândul de sus).
  // Toate casetele au același format ca „Total”: joase, text mic, margine subțire.
  function box(cxB, y, title, text, col, entity, dimmed, key, maxW, anchor, sub, glow) {
    const w0 = fitW(text, sub), w = maxW ? Math.min(w0, maxW) : w0, x = anchor === 'r' ? cxB - w : (anchor === 'l' ? cxB : cxB - w / 2);
    const is = M.ico / 32, sw = small ? 1.6 : 2;
    const availT = w - 2 * padX - M.ico - gapIT, est = estW(text, M.fv) + (sub ? estW(sub, subFs) + 4 : 0);
    const tl = est > availT ? ' textLength="' + Math.max(8, availT).toFixed(1) + '" lengthAdjust="spacingAndGlyphs"' : '';
    return '<g class="cbox"' + (entity ? ' data-entity="' + esc(entity) + '" role="button"' : '') + (dimmed ? ' opacity="0.5"' : '') +
      (glow ? ' style="filter:drop-shadow(0 0 3px ' + col + '66)"' : '') +
      ' data-anchor="' + (anchor || 'c') + '" data-cx="' + cxB.toFixed(1) + '" data-y="' + y + '" data-h="' + bh + '" data-cut="' + cut + '" data-padx="' + padX + '" data-ico="' + M.ico + '" data-gap="' + gapIT + '"' +
      (maxW ? ' data-maxw="' + maxW.toFixed(1) + '"' : '') + '>' +
      '<title>' + esc(title) + '</title>' +
      '<path d="' + oct(x, y, w, bh, cut) + '" class="cb-line" fill="#06121c" stroke="' + col + '" stroke-width="' + sw + '" stroke-linejoin="round"/>' +
      '<path d="' + oct(x, y, w, bh, cut) + '" class="cb-tint" fill="' + col + '" fill-opacity="0.08" stroke="none"/>' +
      '<g class="cb-icon" transform="translate(' + (x + padX).toFixed(1) + ',' + (y + (bh - M.ico) / 2).toFixed(1) + ') scale(' + is.toFixed(3) + ')" fill="none" stroke="' + col +
      '" color="' + col + '" stroke-width="' + (small ? 2.6 : 2.4) + '" stroke-linecap="round" stroke-linejoin="round">' + iconFor(title, key) + '</g>' +
      '<text class="cb-text" x="' + (x + padX + M.ico + gapIT).toFixed(1) + '" y="' + (y + bh / 2 + M.fv * 0.36).toFixed(1) + '" text-anchor="start" fill="' + (glow ? '#fff' : col) + '"' + tl +
      ' font-size="' + M.fv + '" font-weight="bold">' + esc(text) +
      (sub ? '<tspan class="cb-sub" dx="3" font-size="' + subFs + '" fill="' + col + '" fill-opacity="0.85">' + esc(sub) + '</tspan>' : '') + '</text></g>';
  }

  // mici informații extra (ex. radiația solară W/m², producția pe zi): text 9 px + iconiță, în spațiul liber al cardului
  const exs = (Array.isArray(info.extras) ? info.extras.filter((e) => e && e.text) : []).slice(0, 2);
  const exFs = small ? 9 : 11, exIc = small ? 10 : 13;
  const exW = (e) => exIc + 3 + estW(e.text, exFs);
  const exItem = (e, x, yBase, mode) => {
    const w = exW(e), xl = mode === 'end' ? x - w : (mode === 'mid' ? x - w / 2 : x);
    const col = e.col || '#ffd23a';
    return '<g class="cx"' + (e.entity ? ' data-entity="' + esc(e.entity) + '" role="button"' : '') + '><title>' + esc(e.title || (e.key === 'prod' ? 'Produc\u021bie azi' : 'Radia\u021bie solar\u0103')) + '</title>' +
      '<g transform="translate(' + xl.toFixed(1) + ',' + (yBase - exIc * 0.86).toFixed(1) + ') scale(' + (exIc / 32).toFixed(3) + ')" fill="none" stroke="' + col +
      '" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">' + (e.key === 'prod' ? ICON_PROD : ICON_SOARE) + '</g>' +
      '<text class="cx-text" x="' + (xl + exIc + 3).toFixed(1) + '" y="' + yBase.toFixed(1) + '" text-anchor="start" fill="' + col + '" fill-opacity="0.92" font-size="' + exFs + '" font-weight="bold">' + esc(e.text) + '</text></g>';
  };

  let bands = '', boxes = '';
  // rând sus: Solar · Rețea · Baterie (3 sloturi egale; caseta se strânge pe conținut, centrată pe slot)
  const gridCol = dirs.grid === 'export' ? colors.exportGrid : colors.importGrid;
  const topAll = [
    { key: 'solar', title: 'Solar', col: colors.solar, text: texts.solar, ent: ents.solar, dimmed: solarV <= 0, v: solarV, dir: 'down' },
    { key: 'grid', title: 'Rețea', col: gridCol, text: texts.grid, ent: ents.grid, dimmed: dirs.grid === 'idle',
      v: dirs.grid === 'export' ? gridExp : gridImp, dir: dirs.grid === 'export' ? 'up' : 'down' },
    { key: 'battery', title: 'Baterie', col: colors.battery, text: texts.battery, ent: ents.battery, dimmed: dirs.battery === 'idle',
      v: dirs.battery === 'charge' ? batChg : batDis, dir: dirs.battery === 'charge' ? 'up' : 'down',
      sub: (info.soc != null && isFinite(info.soc)) ? Math.round(info.soc) + '%' : null },
  ];
  // culoarea intersecției = culoarea care DOMINĂ fluxul: energie proprie (solar/baterie) = portocaliu, import din rețea = roșu,
  // amestecate continuu după ponderea importului în total; fără flux: gri
  const mixHex = (a, b, k) => {
    const pa = /^#([0-9a-f]{6})$/i.exec(a), pb = /^#([0-9a-f]{6})$/i.exec(b);
    if (!pa || !pb) return a;
    const na = parseInt(pa[1], 16), nb = parseInt(pb[1], 16);
    const ch = (sh) => Math.round(((na >> sh) & 255) * (1 - k) + ((nb >> sh) & 255) * k).toString(16).padStart(2, '0');
    return '#' + ch(16) + ch(8) + ch(0);
  };
  const impShareTotal = total > 0 ? Math.min(1, gridImp / total) : 0;
  // margine = culoarea care DOMINĂ, dar trecerea e GRADUALĂ: de la portocaliu (fără import) spre roșu (doar import), cu curbă netedă;
  // peste 50% import domină roșul, sub 50% domină portocaliul
  const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  // proporțional: 10% din total din import → 10% roșu
  const hubCol = total > 0 ? mixHex(colors.own, colors.importGrid, impShareTotal) : '#6f8aa0';
  // o destinație alimentată (și) din import primește UN SINGUR flux, „contaminat” cu roșu: culoarea ei se amestecă gradual cu roșul după ponderea importului
  // proporțional (10% din destinație din import → 10% roșu pe flux și pe iconiță)
  const tint = (col, sh) => (sh > 0.002 ? mixHex(col, colors.importGrid, Math.min(1, sh)) : col);
  // ce există se vede; ce lipsește (de ex. bateria la Huawei) nu lasă gol: elementele rămase se reașază singure
  const present = Object.assign({ solar: true, grid: true, battery: true }, info.present || {});
  const top = topAll.filter((t) => present[t.key] !== false);
  const nT = top.length, slotW = (W - 2 * M.pad) / 3;
  const dPair = Math.max(62, Math.min(90, W * 0.2));
  const slotCx = (i) => nT >= 3 ? M.pad + slotW * (i + 0.5) : (nT === 2 ? cx + (i === 0 ? -dPair : dPair) : cx);
  // ---- aranjare ORIZONTALĂ, în diagonală (pentru configurații fără consumatori suplimentari: doar Casă) ----
  //   stânga: Solar (sus) · Rețea (jos)      centru: Total (jos)      dreapta: Casă (sus, opus totalului) · Baterie (jos, sub Casă)
  // Panglicile se încrucișează în diagonală, deci se văd lungi. Alegerea auto/forțată e după STRUCTURĂ, nu după valori.
  const layoutOpt = opts.layout || 'auto';
  const consN = info.consumerCount != null ? info.consumerCount : others.length;
  const structH = nT >= 1 && consN === 0;
  const WORST = '−12,4 kW';
  const hubWw = showTotal ? fitW('12,4 kW') : 0;
  const hubWh = showTotal ? fitW(fmtPower(total)) : 0;
  const leftItems = top.filter((t) => t.key !== 'battery'), batItem = top.find((t) => t.key === 'battery');
  const wLeft = leftItems.length ? Math.max(...leftItems.map((t) => fitW(t.text == null ? '—' : t.text, t.sub))) : 0;
  const wRight = Math.max(fitW(fmtPower(houseV)), batItem ? fitW(batItem.text == null ? '—' : batItem.text, batItem.sub) : 0);
  const gapLW = (cx - hubWw / 2) - (M.pad + (leftItems.length ? fitW(WORST) : 0)), gapRW = (W - M.pad - fitW(WORST)) - (cx + hubWw / 2);
  const hGapL = (cx - hubWh / 2) - (M.pad + wLeft), hGapR = (W - M.pad - wRight) - (cx + hubWh / 2);
  const hGapNeed = small ? 30 : 36;
  const useH = structH && (
    (layoutOpt === 'horizontal' && Math.min(hGapL, hGapR) >= 14) ||
    (layoutOpt === 'auto' && Math.min(gapLW, gapRW) >= hGapNeed));
  // ---- stil DESCHIS (opts.style === 'open'): fără casete; doar iconiță + valoare, iar „Total” e singura casetă ----
  //   stânga: Solar · Rețea · Baterie (procentul bateriei SUB valoare) · centru: Total · dreapta: Casă + consumatori (iconiță + valoare)
  //   panglici fusiforme: nu ies în afara casetei Total (fiecare intră pe latura ei, în propriul slot, îngustă), iconițele se colorează gradual cu roșu la import
  if (opts.style === 'open') {
    const oFv = small ? 12 : 16, oIco = small ? 16 : 22, oSub = small ? 9 : 11, rowH = small ? 34 : 46;
    const gInfo = (Array.isArray(info.gridInfo) ? info.gridInfo : []).slice(0, 3);
    const left = top.map((t) => ({ key: t.key, title: t.title, text: t.text == null ? '\u2014' : t.text, sub: t.sub, col: t.col, ent: t.ent,
      dimmed: t.dimmed && t.key !== 'battery', v: t.v, dir: t.dir, sh: (t.key === 'battery' && t.dir === 'up') ? importShare('Baterie') : 0,
      // Rețea: 3 rânduri informative (fără flux): aceeași iconiță, import roșu / export verde
      rows: t.key === 'grid' ? gInfo.filter((g) => g.pos !== 'above').map((g) => ({ text: g.text + ' ' + g.unit + (g.label ? ' ' + g.label : ''), col: g.col === 'exp' ? colors.exportGrid : colors.importGrid, title: g.title })) : [],
      rowsAbove: t.key === 'grid' ? gInfo.filter((g) => g.pos === 'above').map((g) => ({ text: g.text + ' ' + g.unit + (g.label ? ' ' + g.label : ''), col: g.col === 'exp' ? colors.exportGrid : colors.importGrid, title: g.title })) : [] }));
    const rowIco = oSub + 3, rowStep = oSub + 3, mainH = oFv + 2;
    // înălțimea blocului unui element (linia principală + procent/rânduri informative dedesubt) și slotul lui
    const aboveH = (it) => it.rowsAbove.length * rowStep;
    const blockH = (it) => aboveH(it) + mainH + (it.sub ? oSub + 2 : 0) + it.rows.length * rowStep;
    const slotH = (it) => Math.max(rowH, blockH(it) + 8);
    const maxRows = small ? 5 : 6;
    const many = others.length + 1 > maxRows;
    const visO = many ? others.slice(0, maxRows - 2) : others, restO = many ? others.slice(maxRows - 2) : [];
    const rows = [{ name: houseName, v: houseV }, ...visO.map(([name, v]) => ({ name, v }))];
    if (restO.length) rows.push({ name: 'Altele', v: restO.reduce((a, [, v]) => a + v, 0), members: restO.map(([n]) => n) });
    const rcol = () => colors.house;   // toți consumatorii au culoarea casei; doar importul îi înroșește
    const shOf = (it) => {
      if (gridImp <= 0) return 0;
      const names = it.members || [it.name];
      const imp = names.reduce((a, n) => a + ((alloc[R] || {})[n] || 0), 0), tot = names.reduce((a, n) => a + (dstTotal[n] || 0), 0);
      return tot > 0 ? imp / tot : 0;
    };
    const right = rows.map((it) => ({ key: 'dst', title: it.name, text: fmtPower(it.v), col: rcol(it.name), ent: null, dimmed: false, v: it.v, sh: shOf(it) }));
    const nL = left.length, nR = right.length, nMax = Math.max(nL, nR, 1);
    const sumL = left.reduce((a, it) => a + slotH(it), 0);
    // înălțime STABILĂ: se rezervă rânduri pentru toți consumatorii configurați (Casă + info.consumerCount, max. maxRows), ca desenul să nu-și schimbe
    // înălțimea când un consumator apare/dispare (ar muta tot ce e dedesubt și pe telefon ar sări derularea)
    const nRres = Math.max(nR, Math.min(maxRows, 1 + (info.consumerCount != null ? info.consumerCount : 0)));
    const Ho = opts.height || Math.max(sumL, nRres * rowH, small ? 84 : 120) + 8;
    const yOf = (i, n) => Ho / 2 + (i - (n - 1) / 2) * rowH;
    // stânga: sloturi de înălțimi diferite (Rețea e mai înaltă din cauza rândurilor informative); yc = linia principală a elementului
    const slotsL = []; { let acc = Ho / 2 - sumL / 2; left.forEach((it) => { const h = slotH(it); slotsL.push({ top: acc, h, yc: acc + h / 2 - blockH(it) / 2 + aboveH(it) + mainH / 2 }); acc += h; }); }
    const yLeft = (i) => slotsL[i].yc;
    const colW = (arr) => arr.length ? oIco + 5 + Math.max(...arr.map((it) => Math.max(estW(it.text, oFv), it.sub ? estW(it.sub, oSub) : 0,
      (it.rows || []).concat(it.rowsAbove || []).length ? Math.max(...(it.rows || []).concat(it.rowsAbove || []).map((r) => estW(r.text, oSub) + rowIco - oIco + 3 - 5)) : 0))) : 0;
    const wLc = colW(left), wRc = colW(right);
    const xl0 = M.pad + 2, xlEnd = xl0 + wLc + 5;
    const xrIco = W - M.pad - 2 - wRc, xrStart = xrIco - 5;
    const totTxt = fmtPower(total), wT = Math.ceil(2 * padX + M.ico + gapIT + estW(totTxt, M.fv + 1) + 6);
    // panglicile se prind doar pe partea DREAPTĂ a laturii (între teșituri), ca să nu rămână gol între colțul teșit și flux
    const boxH = Math.min(Ho - 8, Math.max(small ? 36 : 46, nMax * (small ? 10 : 12) + 2 * (cut + 1) + 4));
    const hx0 = cx - wT / 2, hx1 = cx + wT / 2, ty = Ho / 2 - boxH / 2;
    const xsL = (it) => xl0 + oIco + 5 + estW(it.text, oFv) + 4;   // panglica începe lângă valoarea ei (nu la marginea coloanei)
    const xsMax = Math.max(xl0 + oIco + 5, ...left.map(xsL));
    if (hx0 - xsMax >= 22 && xrStart - hx1 >= 22) {
      const toR = (x0, y0, x1, y1b, g) => 'M' + x0.toFixed(1) + ',' + y0.toFixed(1) + ' C ' + (x0 + g * 0.55).toFixed(1) + ',' + y0.toFixed(1) + ' ' +
        (x1 - g * 0.55).toFixed(1) + ',' + y1b.toFixed(1) + ' ' + x1.toFixed(1) + ',' + y1b.toFixed(1);
      const toL = (x0, y0, x1, y1b, g) => 'M' + x0.toFixed(1) + ',' + y0.toFixed(1) + ' C ' + (x0 - g * 0.55).toFixed(1) + ',' + y0.toFixed(1) + ' ' +
        (x1 + g * 0.55).toFixed(1) + ',' + y1b.toFixed(1) + ' ' + x1.toFixed(1) + ',' + y1b.toFixed(1);
      const band0 = ty + cut + 1, bandH = boxH - 2 * (cut + 1), IN = 4;   // IN: panglica intră 4 px sub casetă (acoperită de ea), fără hairline
      const slotY = (k, n) => band0 + (k + 0.5) * bandH / n;
      let rb = '', items = '';
      left.forEach((it, k) => {
        if (!(it.v > 0)) return;
        const yc = yLeft(k), yh = slotY(k, nL), t = thick(it.v), hubW = Math.max(2.2, Math.min(t * 0.7, bandH / nL - 2)), xs0 = xsL(it), gg = hx0 - xs0;
        const col = tint(it.col, it.sh);
        rb += it.dir === 'up' ? ribbon(toL(hx0 + IN, yh, xs0, yc, gg), col, t, { hubW, hubAtStart: true })
          : ribbon(toR(xs0, yc, hx0 + IN, yh, gg), col, t, { hubW, hubAtStart: false });
      });
      right.forEach((it, k) => {
        if (!(it.v > 0)) return;
        const yc = yOf(k, nR), yh = slotY(k, nR), t = thick(it.v), hubW = Math.max(2.2, Math.min(t * 0.7, bandH / nR - 2)), gg = xrStart - hx1;
        rb += ribbon(toR(hx1 - IN, yh, xrStart, yc, gg), tint(it.col, it.sh), t, { hubW, hubAtStart: true });
      });
      const icoAt = (x, yc, col, title, key) => '<g transform="translate(' + (x - (key === 'battery' ? oIco * 0.1 : 0)).toFixed(1) + ',' + (yc - oIco * (key === 'battery' ? 0.6 : 0.5)).toFixed(1) + ') scale(' + (oIco * (key === 'battery' ? 1.2 : 1) / 32).toFixed(3) +
        ')" fill="none" stroke="' + col + '" color="' + col + '" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">' + iconFor(title, key) + '</g>';
      const item = (it, k, n, x) => {
        const yc = it.side === 'l' ? yLeft(k) : yOf(k, n), col = tint(it.col, it.sh || 0), tx = x + oIco + 5;
        const vy = yc + oFv * 0.36;
        const rowSvg = (r, ry) => '<g class="co-row"><title>' + esc(r.title) + '</title><g transform="translate(' + (x + (oIco - rowIco) / 2).toFixed(1) + ',' + (ry - rowIco / 2).toFixed(1) + ') scale(' + (rowIco / 32).toFixed(3) +
          ')" fill="none" stroke="' + r.col + '" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">' + ICON_RETEA + '</g>' +
          '<text class="co-led" x="' + (x + oIco + 2).toFixed(1) + '" y="' + (ry + oSub * 0.34).toFixed(1) + '" fill="' + r.col + '" font-size="' + oSub + '" font-weight="bold">' + esc(r.text) + '</text></g>';
        let o = '<g class="copen"' + (it.ent ? ' data-entity="' + esc(it.ent) + '" role="button"' : '') + (it.dimmed ? ' opacity="0.5"' : '') + '><title>' + esc(it.title) + '</title>';
        // rânduri informative DEASUPRA liniei principale (ex. importul lunar)
        (it.rowsAbove || []).forEach((r, j) => { o += rowSvg(r, yc - mainH / 2 - (it.rowsAbove.length - j) * rowStep + rowStep / 2); });
        o += icoAt(x, yc, col, it.title, it.key) +
          '<text class="co-text" x="' + tx.toFixed(1) + '" y="' + vy.toFixed(1) + '" fill="' + col + '" font-size="' + oFv + '" font-weight="bold">' + esc(it.text) + '</text>';
        let ly = yc + mainH / 2 + (oSub + 2) / 2;
        if (it.sub) { o += '<text class="co-sub" x="' + tx.toFixed(1) + '" y="' + (ly + oSub * 0.34).toFixed(1) + '" fill="' + col + '" fill-opacity="0.85" font-size="' + oSub + '" font-weight="bold">' + esc(it.sub) + '</text>'; ly += oSub + 2; }
        (it.rows || []).forEach((r) => { o += rowSvg(r, ly + rowStep / 2); ly += rowStep; });
        return o + '</g>';
      };
      left.forEach((it, k) => { items += item(Object.assign({ side: 'l' }, it), k, nL, xl0); });
      right.forEach((it, k) => { items += item(it, k, nR, xrIco); });
      const isT = M.ico / 32;
      const chip = '<g class="copen-total" style="filter:drop-shadow(0 0 3px ' + hubCol + '66)"><title>Total</title>' +
        '<path d="' + oct(hx0, ty, wT, boxH, cut) + '" fill="#06121c" stroke="' + hubCol + '" stroke-width="' + (small ? 1.6 : 2) + '" stroke-linejoin="round"/>' +
        '<path d="' + oct(hx0, ty, wT, boxH, cut) + '" fill="' + hubCol + '" fill-opacity="0.08" stroke="none"/>' +
        '<g transform="translate(' + (hx0 + padX).toFixed(1) + ',' + (Ho / 2 - M.ico / 2).toFixed(1) + ') scale(' + isT.toFixed(3) + ')" fill="none" stroke="' + hubCol + '" color="' + hubCol +
        '" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">' + ICON_FULGER + '</g>' +
        '<text class="co-text" x="' + (hx0 + padX + M.ico + gapIT).toFixed(1) + '" y="' + (Ho / 2 + (M.fv + 1) * 0.36).toFixed(1) + '" fill="#fff" font-size="' + (M.fv + 1) + '" font-weight="bold">' + esc(totTxt) + '</text></g>';
      let ex = '';
      if (exs.length) {
        ex += exItem(exs[0], cx, ty - 5, 'mid');
        if (exs[1]) ex += exItem(exs[1], cx, ty + boxH + exFs + 4, 'mid');
      }
      return '<svg viewBox="0 0 ' + W + ' ' + Ho + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="flux de energie (estimat)" data-layout="open" ' +
        'style="width:100%;height:auto;display:block;overflow:visible;">' + rb + chip + items + ex + '</svg>';
    }
  }
  if (useH) {
    // card lat (nu telefon): rândurile se depărtează ca desenul să fie mai pătrat și fluxurile să se vadă cum merg; pe ecran îngust rămâne compact
    // forma: 'square' = înalt, Total la mijloc · 'wide' = scund/dreptunghiular, Total jos · 'auto' (implicit) = înalt pe card lat, scund pe telefon/tabletă
    const tall = opts.shape === 'square' ? true : (opts.shape === 'wide' ? false : !small);
    const rowGap = tall ? Math.max(bh + 24, Math.min(130, Math.round(W * 0.24))) : bh + 24, y1 = 2 + bh / 2, y2 = y1 + rowGap, Hh = opts.height || (y2 + bh / 2 + 2);
    const yh = tall ? Math.round((y1 + y2) / 2) : y2;   // pe card lat Total stă la mijloc (nu „trântit” jos); pe telefon rămâne jos
    const xLR = M.pad + wLeft, xRL = W - M.pad - wRight, hx0 = cx - hubWh / 2, hx1 = cx + hubWh / 2;
    const gL = Math.max(10, hx0 - xLR), gR = Math.max(10, xRL - hx1);
    const toR = (x0, y0, x1, y1b, g) => 'M' + x0.toFixed(1) + ',' + y0.toFixed(1) + ' C ' + (x0 + g * 0.55).toFixed(1) + ',' + y0.toFixed(1) + ' ' +
      (x1 - g * 0.55).toFixed(1) + ',' + y1b.toFixed(1) + ' ' + x1.toFixed(1) + ',' + y1b.toFixed(1);
    const toL = (x0, y0, x1, y1b, g) => 'M' + x0.toFixed(1) + ',' + y0.toFixed(1) + ' C ' + (x0 - g * 0.55).toFixed(1) + ',' + y0.toFixed(1) + ' ' +
      (x1 + g * 0.55).toFixed(1) + ',' + y1b.toFixed(1) + ' ' + x1.toFixed(1) + ',' + y1b.toFixed(1);
    // un singur flux, culoarea destinației „contaminată” cu roșu după ponderea importului
    // lățimea la intrarea în Total e limitată la partea dreaptă a laturii (între teșituri), ca fluxul să nu iasă peste casetă; intră 3 px sub ea
    const bandH2 = bh - 2 * (cut + 1), ao = bandH2 / 4, IN2 = 3;
    const hw = (tk) => Math.max(2.2, Math.min(tk * 0.7, bandH2 / 2 - 1.5));
    const stripes = (mk, col, tk, sh) => ribbon(mk(0), tint(col, sh), tk, { hubW: hw(tk), hubAtStart: true });
    hubPts.push([hx0, yh], [hx1, yh]);
    let hb = '', hxs = '';
    // stânga: Solar sus, Rețea jos
    for (const t of leftItems) {
      const yc = t.key === 'solar' ? y1 : y2, ay = t.key === 'solar' ? yh - ao : yh + ao;
      if (t.v > 0) {
        const up2 = t.dir === 'up', tk0 = thick(t.v);
        hb += ribbon(up2 ? toL(hx0 + IN2, ay, xLR, yc, gL) : toR(xLR, yc, hx0 + IN2, ay, gL), t.col, tk0, { hubW: hw(tk0), hubAtStart: up2 });
      }
      hxs += box(xLR, yc - bh / 2, t.title, t.text == null ? '—' : t.text, t.col, t.ent, t.dimmed, t.key, 0, 'r');
    }
    // dreapta: Casă sus (opus totalului), Baterie jos (sub Casă)
    if (houseV > 0) {
      const tk = thick(houseV), sh = importShare(houseName);
      hb += stripes((off) => toR(hx1 - IN2, yh - ao + off, xRL, y1 + off, gR), colors.house, tk, sh);
    }
    hxs += box(xRL, y1 - bh / 2, houseName, fmtPower(houseV), colors.house, null, false, 'dst', 0, 'l');
    if (batItem) {
      if (batItem.v > 0) {
        const tk = thick(batItem.v), sh = batItem.dir === 'up' ? importShare('Baterie') : 0;
        hb += batItem.dir === 'up'
          ? stripes((off) => toR(hx1 - IN2, yh + ao + off, xRL, y2 + off, gR), batItem.col, tk, sh)
          : ribbon(toL(xRL, y2, hx1 - IN2, yh + ao, gR), batItem.col, tk, { hubW: hw(tk), hubAtStart: false });
      }
      hxs += box(xRL, y2 - bh / 2, batItem.title, batItem.text == null ? '—' : batItem.text, batItem.col, batItem.ent, batItem.dimmed, batItem.key, 0, 'l', batItem.sub);
    }
    const hubH = showTotal
      ? box(cx, yh - bh / 2, 'Total', fmtPower(total), hubCol, null, false, 'total', 0, 'c', null, true)
      : (total > 0 ? '<circle class="flow-hub" cx="' + cx + '" cy="' + yh + '" r="' + (small ? 3.5 : 5) + '" fill="#fff" opacity="0.95" style="filter:drop-shadow(0 0 3px ' + hubCol + '99)"/>' : '');
    let hex = '';
    if (exs.length) {
      const availL = xLR + 8, availR = xRL - 8, wmax = Math.max(...exs.map(exW));
      if (wmax <= availR - availL) {
        if (exs.length === 1) hex = exItem(exs[0], cx, y1 + exFs * 0.36, 'mid');
        else exs.forEach((e, i) => { hex += exItem(e, cx, y1 - 2 + i * 11, 'mid'); });
      }
    }
    return '<svg viewBox="0 0 ' + W + ' ' + Hh + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="flux de energie (estimat)" data-layout="horizontal" ' +
      'style="width:100%;height:auto;display:block;overflow:visible;">' + hb + hubH + hxs + hex + '</svg>';
  }

  // la intrarea/ieșirea din Total panglicile încap pe latura casetei (între teșituri) și intră 3 px sub ea
  const IV = showTotal ? 3 : 0, wTotV = showTotal ? fitW(fmtPower(total)) : 60;
  const hwV = (tk, n) => Math.max(2.2, Math.min(tk * 0.7, (wTotV - 2 * (cut + 1)) / Math.max(1, n) - 2));
  hubPts.push([cx, nodeTop], [cx, nodeBot]);
  top.forEach((t, i) => {
    const sx = slotCx(i), ax = cx + (i - (nT - 1) / 2) * attSp;
    if (t.v > 0) {
      const tk = thick(t.v);
      const sh = (t.key === 'battery' && t.dir === 'up') ? importShare('Baterie') : 0;
      // bateria se încarcă (și) din import: un singur flux, culoarea bateriei „contaminată” cu roșu
      bands += ribbon(t.dir === 'up' ? up(ax, nodeTop + IV, sx, srcBot) : down(sx, srcBot, ax, nodeTop + IV), tint(t.col, sh), tk, { hubW: hwV(tk, nT), hubAtStart: t.dir === 'up' });
    }
    boxes += box(sx, srcTop, t.title, t.text == null ? '—' : t.text, t.col, t.ent, t.dimmed, t.key, slotW - 1, undefined, t.sub);
  });
  // rând jos: consumatori; partea alimentată din import = bandă ROȘIE (alăturată), restul în culoarea destinației
  const dstColor = () => colors.house;   // toți consumatorii au culoarea casei; doar importul îi înroșește
  const m = layout.boxes.length, sAtt = m > 1 ? Math.min(attSp, 40 / (m - 1)) : 0;
  layout.boxes.forEach((b, i) => {
    const dx = b.cx, ex = cx + (i - (m - 1) / 2) * sAtt;
    const col = dstColor(b.name);
    if (b.v > 0) {
      const t = thick(b.v), sh = importShare(b.name);
      // un singur flux către destinație, culoarea ei „contaminată” cu roșu după ponderea importului
      bands += ribbon(down(ex, nodeBot - IV, dx, dstTop), tint(col, sh), t, { hubW: hwV(t, m), hubAtStart: true });
    }
    boxes += box(dx, dstTop, b.name, fmtPower(b.v), col, null, false, 'dst');
  });

  // intersecția: implicit doar o scânteie mică (când există flux); opțional o casetă „Total”, strânsă ca celelalte
  const hub = showTotal
    ? box(cx, nodeTop, 'Total', fmtPower(total), hubCol, null, false, 'total', 0, 'c', null, true)
    : (total > 0 ? '<circle class="flow-hub" cx="' + cx + '" cy="' + nodeTop + '" r="' + (small ? 3.5 : 5) + '" fill="#fff" opacity="0.95" style="filter:drop-shadow(0 0 3px ' + hubCol + '99)"/>' : '');

  // extra în vertical: stânga/dreapta intersecției (panglicile se adună doar în centru)
  let exV = '';
  if (exs.length) {
    const hubHalf = showTotal ? fitW(fmtPower(total)) / 2 : 6, yb = nodeTop + (nodeH ? nodeH / 2 : 0) + exFs * 0.36;
    exs.forEach((e, i) => {
      const side = (exs.length === 1 || i === 0) ? 'l' : 'r';
      if (exW(e) > cx - hubHalf - 10 - M.pad) return;                      // nu încape: nu-l desenăm
      exV += side === 'l' ? exItem(e, M.pad + 2, yb, 'start') : exItem(e, W - M.pad - 2, yb, 'end');
    });
  }
  return '<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="flux de energie (estimat)" ' +
    'style="width:100%;height:auto;display:block;overflow:visible;">' + bands + hub + boxes + exV + '</svg>';
}

// ---------------------------------------------------------------------------
// Pas de MĂSURARE (DOM, după randare): strânge fiecare casetă pe conținutul real (iconiță + text), indiferent de font.
// Caseta rămâne centrată pe `data-cx`, deci panglicile rămân prinse la mijloc. Nu face nimic fără getBBox (Node, teste).
// ---------------------------------------------------------------------------
export function fitCompactBoxes(root) {
  if (!root || typeof root.querySelectorAll !== 'function') return 0;
  const oct2 = (x, y, w, h, c) => 'M' + (x + c) + ',' + y + ' L' + (x + w - c) + ',' + y + ' L' + (x + w) + ',' + (y + c) +
    ' L' + (x + w) + ',' + (y + h - c) + ' L' + (x + w - c) + ',' + (y + h) + ' L' + (x + c) + ',' + (y + h) +
    ' L' + x + ',' + (y + h - c) + ' L' + x + ',' + (y + c) + ' Z';
  let n = 0;
  root.querySelectorAll('.cbox').forEach((g) => {
    const t = g.querySelector('.cb-text');
    if (!t || typeof t.getBBox !== 'function') return;
    const cxB = parseFloat(g.getAttribute('data-cx')), y = parseFloat(g.getAttribute('data-y')), h = parseFloat(g.getAttribute('data-h'));
    const cut = parseFloat(g.getAttribute('data-cut')), padX = parseFloat(g.getAttribute('data-padx'));
    const ico = parseFloat(g.getAttribute('data-ico')), gap = parseFloat(g.getAttribute('data-gap'));
    const maxW = parseFloat(g.getAttribute('data-maxw')), anchor = g.getAttribute('data-anchor') || 'c';
    t.removeAttribute('textLength'); t.removeAttribute('lengthAdjust');
    const bb = t.getBBox();
    if (!bb || !isFinite(bb.width) || bb.width <= 0) return;
    let w = Math.ceil(2 * padX + ico + gap + bb.width);
    let tl = null;
    if (isFinite(maxW) && w > maxW) { tl = Math.max(8, maxW - 2 * padX - ico - gap); w = maxW; }
    const x = anchor === 'r' ? cxB - w : (anchor === 'l' ? cxB : cxB - w / 2);
    g.querySelectorAll('.cb-line, .cb-tint').forEach((p) => p.setAttribute('d', oct2(x, y, w, h, cut)));
    const ig = g.querySelector('.cb-icon');
    if (ig) ig.setAttribute('transform', 'translate(' + (x + padX).toFixed(1) + ',' + (y + (h - ico) / 2).toFixed(1) + ') scale(' + (ico / 32).toFixed(3) + ')');
    t.setAttribute('x', (x + padX + ico + gap).toFixed(1));
    if (tl != null) { t.setAttribute('textLength', tl.toFixed(1)); t.setAttribute('lengthAdjust', 'spacingAndGlyphs'); }
    n++;
  });
  return n;
}
