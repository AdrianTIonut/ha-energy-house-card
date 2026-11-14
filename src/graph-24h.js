// src/graph-24h.js — Grafic SVG 24h + bare 7 zile. Funcții PURE, fără DOM.
// Producție (zona cyan), consum (linie magenta), SOC (linie subțire), import/export (zone sub axă).
// Date false (generateFake24h/generateFake7d) NU sunt în calea de producție a cardului —
// sunt injectate doar din preview/index.html printr-un hook (card._historyProvider / _historyProvider7d).
// Gaps (null) = gol în linie, nu 0. Font SVG >= 16. Ticks rotunde (0, 1, 2, 3 kW).

/**
 * Reeșantionează o serie la fiecare stepMin minute (interpolare liniară).
 * Păstrată pentru compatibilitate/teste; calea de producție folosește parseHistory()
 * (grilă 5 min, „ultima valoare valabilă rămâne”).
 */
export function resample5min(values, stepMin, totalMin) {
  const n = Math.floor(totalMin / stepMin) + 1;
  if (!values || values.length === 0) return new Array(n).fill(0);
  const origStep = totalMin / Math.max(1, values.length - 1);
  const out = [];
  for (let i = 0; i < n; i++) {
    const fi = (i * stepMin) / origStep;
    const lo = Math.floor(fi), hi = Math.min(lo + 1, values.length - 1);
    out.push(values[lo] * (1 - (fi - lo)) + values[hi] * (fi - lo));
  }
  return out;
}

/**
 * Pas „rotund” = CEL MAI MARE {1,2,4,5,9} × 10^n sub sau egal cu max (pentru unit-test).
 *   niceStep(99)=90, niceStep(450)=400, niceStep(800)=500, niceStep(1200)=1000, niceStep(3000)=2000.
 */
export function niceStep(max) {
  if (max <= 0) return 1;
  let best = 1;
  for (let e = 0; e < 12; e++) {
    const p = Math.pow(10, e);
    for (const m of [1, 2, 4, 5, 9]) {
      const v = m * p;
      if (v <= max && v > best) best = v;
    }
  }
  return best;
}

// Candidați „rotunzi” pentru pasul de axă (kW / W), crescând.
const AXIS_CANDIDATES = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 5000, 10000, 20000, 50000];

/**
 * Pas de AXĂ Y: cel mai mic candidat rotund la care max-ul produce ≤ 5 ticks
 * (deci pentru max ~3 kW → ticks 0, 1, 2, 3 kW; pentru max ~1,5 kW → 0, 0,5, 1, 1,5).
 */
export function axisStep(max) {
  const m = Math.max(1, max);
  for (const c of AXIS_CANDIDATES) {
    if (Math.ceil(m / c) <= 5) return c;
  }
  return Math.pow(10, Math.floor(Math.log10(m)));
}

/** Segmente consecutive non-null: [[i0,i1,...],[j0,j1,...], ...] */
function segments(arr) {
  const segs = []; let cur = [];
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] != null) cur.push(i);
    else { if (cur.length) segs.push(cur); cur = []; }
  }
  if (cur.length) segs.push(cur);
  return segs;
}

/**
 * Parsează răspunsul HA `history/history_during_period` → serii pe grilă de 5 min.
 * Input:  { entity_id: [{s:"192", lu:1794463158.9}, ...], ... }   (s = stare text, lu = secunde epoch)
 * Output: { times:number[], pv, imp, exp, chg, dis, soc, cons: (number|null)[] }
 *
 * Reguli:
 *  - grilă 5 min: t0 = floor(minLu/300)*300, până la maxLu.
 *  - „ultima valoare valabilă rămâne” (forward-fill): pentru o grilă t,
 *      valoarea = cea mai recentă stare VALABILĂ cu lu <= t; dacă nu e nicio
 *      stare valabilă înainte → null (nu e încă nimic). unavailable/unknown/NaN
 *      NU sunt „valori valide” (nu preiau forward-fill) și lasă GOL în linie, nu 0.
 *  - consum (cons) = formula HOUSE_W per punct: max(0, pv+imp-exp+dis-chg), doar
 *    când toate cele 5 componente sunt non-null (altfel null = gol).
 *
 * @param {object} raw  – răspunsul callWS (dict entity_id → [puncte])
 * @param {object} ents – { pv, imp, exp, chg, dis, soc } → entity_id
 * @param {object} opts – { consum_entity } opțional (senzor de consum direct)
 */
export function parseHistory(raw, ents, opts) {
  opts = opts || {};
  const raw2 = raw || {};
  // intervalul [minLu, maxLu]
  let minLu = Infinity, maxLu = -Infinity;
  for (const pts of Object.values(raw2))
    for (const p of pts || []) { if (p.lu < minLu) minLu = p.lu; if (p.lu > maxLu) maxLu = p.lu; }
  if (!isFinite(minLu) || !isFinite(maxLu)) return null;

  const STEP = 300; // 5 min
  const t0 = Math.floor(minLu / STEP) * STEP;
  const times = [];
  for (let t = t0; t <= maxLu; t += STEP) times.push(t);

  // forward-fill pe grilă pentru o entitate
  function seriesFor(eid) {
    const out = new Array(times.length).fill(null);
    const pts = raw2[eid];
    if (!pts || !pts.length) return out;
    const sorted = [...pts].sort((a, b) => a.lu - b.lu);
    let pi = 0, last = null;
    for (let ti = 0; ti < times.length; ti++) {
      while (pi < sorted.length && sorted[pi].lu <= times[ti]) {
        const s = sorted[pi].s, n = parseFloat(s);
        if (s === 'unavailable' || s === 'unknown' || Number.isNaN(n)) last = null;
        else last = n;
        pi++;
      }
      out[ti] = last;
    }
    return out;
  }

  const pv  = ents.pv  ? seriesFor(ents.pv)  : new Array(times.length).fill(null);
  const imp = ents.imp ? seriesFor(ents.imp) : new Array(times.length).fill(null);
  const exp = ents.exp ? seriesFor(ents.exp) : new Array(times.length).fill(null);
  const chg = ents.chg ? seriesFor(ents.chg) : new Array(times.length).fill(null);
  const dis = ents.dis ? seriesFor(ents.dis) : new Array(times.length).fill(null);
  const soc = ents.soc ? seriesFor(ents.soc) : new Array(times.length).fill(null);

  // consum: HOUSE_W per punct (toate componente non-null) sau consum_entity
  let cons;
  if (opts.consum_entity && raw2[opts.consum_entity]) {
    cons = seriesFor(opts.consum_entity);
  } else {
    cons = new Array(times.length).fill(null);
    for (let i = 0; i < times.length; i++) {
      if (pv[i]!=null && imp[i]!=null && exp[i]!=null && dis[i]!=null && chg[i]!=null)
        cons[i] = Math.max(0, pv[i] + imp[i] - exp[i] + dis[i] - chg[i]);
    }
  }
  return { times, pv, imp, exp, chg, dis, soc, cons };
}

/**
 * Construiește SVG-ul graficului 24h (stil neon): zonă cyan cu gradient, linii cu glow,
 * grilă fină, legendă cu puncte. Font >= 16, ticks rotunde, gaps pentru null.
 * @param {object} o – { pv, cons, soc, imp, exp, width, height, times }
 */
/** Scara de text a graficelor, după lățimea desenului (1 unitate = 1 px): telefon / intermediar / tabletă. */
export function fsFor(W) {
  return W < 420 ? { tick: 11, legend: 11, val: 11 } : W < 640 ? { tick: 13, legend: 13, val: 13 } : { tick: 18, legend: 16, val: 16 };
}

export function buildGraphSVG(o) {
  const W = o.width || 800, H = o.height || 320;
  const AC = o.accent || '#19e6ff';   // culoarea accentului (grilă)
  const FS = fsFor(W);
  const PAD = W < 420 ? { top: 34, right: 12, bottom: 28, left: 50 } : W < 640 ? { top: 40, right: 16, bottom: 34, left: 60 } : { top: 22, right: 18, bottom: 44, left: 84 };
  const pW = W - PAD.left - PAD.right, pH = H - PAD.top - PAD.bottom;
  const pv = o.pv || [], cons = o.cons || [], soc = o.soc || [], imp = o.imp || [], exp = o.exp || [];
  const N = Math.max(1, pv.length || cons.length || soc.length || imp.length || exp.length || 1);

  // scara Y (putere): max rotund, pas de axă pentru ticks 0/1/2/3 kW
  let mx = 0;
  for (const a of [pv, cons, imp, exp]) for (const v of a) if (v != null && v > mx) mx = v;
  const yStep = axisStep(mx);
  const maxY = Math.max(yStep, Math.ceil(mx / yStep) * yStep);

  const x = (i) => PAD.left + (i / Math.max(1, N - 1)) * pW;
  const y = (w) => PAD.top + pH - (w / maxY) * pH;
  const base = PAD.top + pH;

  // polyline pe segmente (gaps la null)
  function poly(arr, yFn, stroke, w, glow) {
    let s = '';
    for (const seg of segments(arr)) {
      if (seg.length < 2) continue;
      s += `<polyline points="${seg.map((i)=>x(i).toFixed(1)+','+yFn(arr[i]).toFixed(1)).join(' ')}" fill="none" stroke="${stroke}" stroke-width="${w||2}" stroke-linejoin="round" stroke-linecap="round"${glow ? ' filter="url(#eg-glow)"' : ''}/>`;
    }
    return s;
  }
  // zonă pe segmente
  function zone(arr, yFn, baseY, fill) {
    let s = '';
    for (const seg of segments(arr)) {
      if (seg.length < 2) continue;
      let d = `M${x(seg[0]).toFixed(1)},${baseY.toFixed(1)}`;
      for (const i of seg) d += ` L${x(i).toFixed(1)},${yFn(arr[i]).toFixed(1)}`;
      d += ` L${x(seg[seg.length-1]).toFixed(1)},${baseY.toFixed(1)} Z`;
      s += `<path d="${d}" fill="${fill}"/>`;
    }
    return s;
  }

  // ticks X: ore (HH:MM) + grilă verticală fină
  let xT = '';
  const times = o.times || [];
  const xTickCount = Math.min(W < 640 ? 5 : 7, N);
  for (let k = 0; k < xTickCount && xTickCount > 1; k++) {
    const i = Math.round((k / (xTickCount - 1)) * (N - 1));
    const px = x(i);
    const label = (times && times[i]) ?
      new Date(times[i] * 1000).toTimeString().slice(0, 5) :
      String(Math.floor((i * 5) / 60)).padStart(2, '0') + ':' + String((i * 5) % 60).padStart(2, '0');
    xT += `<line x1="${px.toFixed(1)}" y1="${PAD.top}" x2="${px.toFixed(1)}" y2="${base.toFixed(1)}" stroke="${AC}" stroke-opacity="0.12"/>`;
    const lastTick = (k === xTickCount - 1);
    xT += `<text x="${(lastTick ? px + 6 : px).toFixed(1)}" y="${H-(W < 640 ? 8 : 10)}" fill="#e8fbff" font-size="${FS.tick}" text-anchor="${lastTick ? 'end' : 'middle'}">${label}</text>`;
  }

  // ticks Y: 0, step, 2*step, ... (rotunde, kW cu virgulă) + grilă orizontală fină
  let yT = '';
  for (let v = 0; v <= maxY + 0.5; v += yStep) {
    const py = y(v);
    const lbl = v >= 1000 ? (v / 1000).toFixed(1).replace('.', ',') + ' kW' : String(Math.round(v)) + ' W';
    yT += `<text x="${(PAD.left-(W < 640 ? 6 : 10)).toFixed(1)}" y="${(py+FS.tick*0.34).toFixed(1)}" fill="#e8fbff" font-size="${FS.tick}" text-anchor="end">${lbl}</text>`;
    if (v > 0) yT += `<line x1="${PAD.left}" y1="${py.toFixed(1)}" x2="${(W-PAD.right).toFixed(1)}" y2="${py.toFixed(1)}" stroke="${AC}" stroke-opacity="0.12"/>`;
  }

  // SOC: linie albă (scara proprie 0–100%, în același cadru)
  let sP = '';
  for (const seg of segments(soc)) {
    if (seg.length < 2) continue;
    sP += `<polyline points="${seg.map((i)=>x(i).toFixed(1)+','+(base-(soc[i]/100)*pH).toFixed(1)).join(' ')}" fill="none" stroke="#ffffff" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" filter="url(#eg-glow-soft)"/>`;
  }

  // legendă (sus-dreapta, în interiorul cadrului)
  let legend;
  if (W < 640) {
    // card îngust: legenda pe un rând, deasupra graficului (nu acoperă curbele)
    const items = [['#ffa726', 'Solar'], ['#ff3df0', 'Consum'], ['#ffffff', 'SOC']];
    let lxx = PAD.left, parts = '';
    for (const [col, lbl] of items) {
      const r = Math.round(FS.legend * 0.4);
      parts += `<circle cx="${lxx + r}" cy="${PAD.top - 20}" r="${r}" fill="${col}"/><text x="${lxx + 2 * r + 5}" y="${PAD.top - 20 + FS.legend * 0.34}" fill="#e8fbff" font-size="${FS.legend}">${lbl}</text>`;
      lxx += 2 * r + 5 + lbl.length * FS.legend * 0.62 + 14;
    }
    legend = parts;
  } else {
    const lx = W - PAD.right - 214, ly = PAD.top + 14;
    legend =
      `<circle cx="${lx}" cy="${ly}" r="7" fill="#ffa726"/><text x="${lx+16}" y="${ly+6}" fill="#e8fbff" font-size="16">Producție solară</text>` +
      `<circle cx="${lx}" cy="${ly+28}" r="7" fill="#ff3df0"/><text x="${lx+16}" y="${ly+34}" fill="#e8fbff" font-size="16">Consum</text>` +
      `<circle cx="${lx}" cy="${ly+56}" r="7" fill="#ffffff"/><text x="${lx+16}" y="${ly+62}" fill="#e8fbff" font-size="16">SOC baterie (%)</text>`;
  }

  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;">
<defs>
<linearGradient id="eg-pv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffa726" stop-opacity="0.62"/><stop offset="1" stop-color="#ffa726" stop-opacity="0.06"/></linearGradient>
<filter id="eg-glow" x="-5%" y="-30%" width="110%" height="160%"><feGaussianBlur stdDeviation="3.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="eg-glow-soft" x="-5%" y="-30%" width="110%" height="160%"><feGaussianBlur stdDeviation="1.8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
${yT}${xT}
<line x1="${PAD.left}" y1="${PAD.top}" x2="${PAD.left}" y2="${base.toFixed(1)}" stroke="#e8fbff" stroke-opacity="0.75" stroke-width="2"/>
<line x1="${PAD.left}" y1="${base.toFixed(1)}" x2="${(W-PAD.right).toFixed(1)}" y2="${base.toFixed(1)}" stroke="#e8fbff" stroke-opacity="0.75" stroke-width="2"/>
${zone(pv, y, base, 'url(#eg-pv)')}
${poly(pv, y, '#ffa726', 4, true)}
${poly(cons, y, '#ff3df0', 3.5, true)}
${sP}
${legend}
</svg>`;
}

/** Bare 7 zile (kWh/zi). Font >= 16, ticks rotunde. */
export function buildBars7d(o) {
  const W = o.width || 800, H = o.height || 220;
  const FS = fsFor(W);
  const PAD = W < 420 ? { top: 24, right: 12, bottom: 28, left: 40 } : { top: 28, right: 24, bottom: 40, left: 64 };
  const pW = W - PAD.left - PAD.right, pH = H - PAD.top - PAD.bottom;
  const vals = o.kwhPerDay || [], labels = o.dayLabels || [];
  const mx = Math.max(1, ...vals);
  const yStep = axisStep(mx);
  const maxY = Math.max(yStep, Math.ceil(mx / yStep) * yStep);
  const n = Math.max(1, vals.length);
  const slot = pW / n;
  const bw = slot * 0.62;
  let bars = '';
  vals.forEach((v, i) => {
    const bx = PAD.left + i * slot + (slot - bw) / 2;
    const bh = (v / maxY) * pH, by = PAD.top + pH - bh;
    bars += `<rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" fill="#00e5ff" opacity="0.7" rx="2"/>`;
    bars += `<text x="${(bx+bw/2).toFixed(1)}" y="${(by-4).toFixed(1)}" fill="#cfe" font-size="${FS.val}" text-anchor="middle">${v.toFixed(1).replace('.', ',')}</text>`;
    bars += `<text x="${(bx+bw/2).toFixed(1)}" y="${H-8}" fill="#7fd" font-size="${FS.val}" text-anchor="middle">${labels[i] || ''}</text>`;
  });
  let yT = '';
  for (let v = 0; v <= maxY + 0.5; v += yStep) {
    const py = PAD.top + pH - (v / maxY) * pH;
    const lbl = v >= 1000 ? (v / 1000).toFixed(1).replace('.', ',') + ' kWh' : String(Math.round(v)) + ' kWh';
    yT += `<text x="${(PAD.left-6).toFixed(1)}" y="${(py+5).toFixed(1)}" fill="#7fd" font-size="${FS.val}" text-anchor="end">${lbl}</text>`;
    if (v > 0) yT += `<line x1="${PAD.left}" y1="${py.toFixed(1)}" x2="${(W-PAD.right).toFixed(1)}" y2="${py.toFixed(1)}" stroke="#00e5ff11"/>`;
  }
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;">
${yT}${bars}
<text x="${(W-PAD.right-52).toFixed(1)}" y="${(PAD.top+14).toFixed(1)}" fill="#7fd" font-size="${FS.val}">kWh/zi</text>
</svg>`;
}

/**
 * Date 24h de TEST/MACHETĂ (sinus solar, 289 puncte la 5 min).
 * NU e apelat de card în producție — doar din preview printr-un hook și din teste.
 */
export function generateFake24h() {
  const N = 289;
  const pv = [], cons = [], soc = [], imp = [], exp = [];
  for (let i = 0; i < N; i++) {
    const h = i * 5 / 60;
    const s = (h >= 6 && h <= 18) ? Math.sin((h - 6) / 12 * Math.PI) * 3000 : 0;
    pv.push(s);
    const c = 500 + 1000 * Math.exp(-((h-8)**2)/8) + 800 * Math.exp(-((h-20)**2)/6);
    cons.push(c); soc.push(30 + 50 * Math.sin((h-6)/24 * 2 * Math.PI));
    imp.push(Math.max(0, c - s)); exp.push(Math.max(0, s - c));
  }
  return { pv, cons, soc, imp, exp, times: [] };
}

/** Date 7 zile (test/machetă). */
export function generateFake7d() {
  return { kwhPerDay: [14,18,11,16,9,12,7].map(v=>v+Math.sin(v)*1.5),
           dayLabels: ['Lu','Ma','Mi','Jo','Vi','S\u0103','Du'], width: 800, height: 220 };
}

/** Tooltip: valorile momentului la un index. Folosește d.times dacă există. */
export function tooltipInfo(d, idx) {
  if (!d || !d.pv || !d.pv.length) return { time: '—', prod: 0, cons: 0, soc: null };
  const i = Math.max(0, Math.min(d.pv.length - 1, Math.round(idx)));
  let time;
  if (d.times && d.times[i]) {
    time = new Date(d.times[i] * 1000).toTimeString().slice(0, 5);
  } else {
    const m = i * 5;
    time = String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
  }
  return { time, prod: d.pv[i] != null ? d.pv[i] : 0,
           cons: d.cons && d.cons[i] != null ? d.cons[i] : 0,
           soc: d.soc && d.soc[i] != null ? d.soc[i] : null };
}
