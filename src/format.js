// src/format.js — Formatare valori pentru afișare. Fără DOM, fără dependențe.
// Convenție: zecimala cu virgulă, niciodată "1000 W" sau "1182,4 W".

/**
 * Trunchiază (nu rotunjește) o valoare la dp zecimale.
 * Se folosește la afișarea kW ca să nu „sărim" peste pragul de unitate
 * (ex: 9999 W / 1000 = 9,999 → 9,99 kW, nu 10,00 kW).
 * @param {number} v
 * @param {number} dp – numărul de zecimale
 * @returns {number}
 */
function trunc(v, dp) {
  const f = 10 ** dp;
  return Math.floor(v * f + 1e-9) / f;
}

/**
 * Formatează o putere (W sau kW). Unitatea se decide DUPĂ rotunjire la W întreg:
 *   r = |w| rotunjit la W întreg
 *   r < 1000     → "850 W" (întreg)
 *   1000 ≤ r < 10000 → "1,18 kW" (2 zecimale)
 *   r ≥ 10000    → "12,4 kW" (1 zecimală)
 * Capcane de prag: 999,5 W → "1,00 kW"; 999,4 W → "999 W";
 *                  9999,6 W → "10,0 kW"; 9999,4 W → "9,99 kW".
 * NaN / null → "—"
 * @param {number} w – puterea în W (poate fi negativă)
 * @returns {string}
 */
export function fmtPower(w) {
  if (w === null || w === undefined || Number.isNaN(w)) return '—';
  const sign = w < 0 ? '\u2212' : '';
  const r = Math.round(Math.abs(w));      // rotunjire la W întreg (decide unitatea)
  if (r < 1000) return sign + r + ' W';
  const dp = (r < 10000) ? 2 : 1;
  const v = trunc(r / 1000, dp);
  return sign + v.toFixed(dp).replace('.', ',') + ' kW';
}

/**
 * Formatează o energie (kWh sau MWh). Unitatea se decide DUPĂ rotunjire la 2 zecimale:
 *   r = |kwh| rotunjit la 2 zecimale
 *   r < 1000  → "15,15 kWh"
 *   r ≥ 1000  → "1,24 MWh"
 * Capcană: 999,999 kWh → r=1000,00 → "1,00 MWh" (nu "999,99 kWh").
 * NaN / null → "—"
 * @param {number} kwh
 * @returns {string}
 */
export function fmtEnergy(kwh) {
  if (kwh === null || kwh === undefined || Number.isNaN(kwh)) return '—';
  const sign = kwh < 0 ? '\u2212' : '';
  const a = Math.abs(kwh);
  const r = Math.round(a * 100) / 100;    // rotunjire la 2 zecimale (decide unitatea)
  if (r < 1000) return sign + a.toFixed(2).replace('.', ',') + ' kWh';
  return sign + (a / 1000).toFixed(2).replace('.', ',') + ' MWh';
}

/**
 * Formatare cu semn de direcție (convenția din IDEE-card-energie.md).
 * Semnul e parte a numărului (fără spațiu): "+192 W", "−1,18 kW".
 * Convenție: solar → '+', export → '+', încărcare → '+';
 *            import → '−', consum casă → '−', descărcare → '−'.
 * VALOAREA 0 nu primește semn: fmtSigned(0, …, '+') → "0 W", fmtSigned(0, …, '−') → "0 W".
 * @param {number} value  – valoarea (folosește magnitudinea)
 * @param {function} fmtFn – fmtPower sau fmtEnergy
 * @param {string} sign    – '+' | '\u2212' | '' (fără semn)
 * @returns {string}
 */
export function fmtSigned(value, fmtFn, sign) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  const a = Math.abs(value);
  if (a === 0) return fmtFn(0);           // 0 fără semn, indiferent de `sign`
  return (sign || '') + fmtFn(a);
}

/**
 * Formatare generică pentru chip-urile „extras".
 * Depinde de unit_of_measurement:
 *   W/m² → întreg + " W/m²"
 *   lx   → întreg cu spațiu separator de mii + " lx"
 *   kWh / MWh → prin fmtEnergy
 *   W / kW    → prin fmtPower (kW se convertește la W)
 *   altă unitate → valoarea (max 2 zecimale, fără zerouri finale) + unitatea
 * @param {number} value
 * @param {string} unit – unit_of_measurement
 * @returns {string}
 */
export function fmtExtra(value, unit) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  const u = (unit || '').trim();
  if (u === 'W/m\u00b2') return Math.round(value) + ' W/m\u00b2';
  if (u === 'lx') {
    // separator de mii cu spațiu: 12400 → "12 400"
    const s = Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u2009');
    return s + ' lx';
  }
  if (u === 'kWh' || u === 'MWh') return fmtEnergy(value);
  if (u === 'W' || u === 'kW') return fmtPower(u === 'kW' ? value * 1000 : value);
  // unitate necunoscută: afișăm valoarea + unitatea ca atare
  const str = parseFloat(value.toFixed(2)).toString().replace('.', ',');
  return u ? str + ' ' + u : str;
}

/**
 * Formatare procent: "31%" sau "—" dacă null/NaN.
 * @param {number|null} val
 * @returns {string}
 */
export function fmtPct(val) {
  if (val === null || val === undefined || Number.isNaN(val)) return '—';
  return Math.round(val) + '%';
}

/**
 * Escape pentru inserare în HTML (text SAU atribute):
 * & < > " ' → entități. Folosit înainte de innerHTML pentru nume/icoane din config.
 * @param {string} s
 * @returns {string}
 */
export function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
