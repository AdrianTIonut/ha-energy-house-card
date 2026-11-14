// tests/format.test.js — teste pentru fmtPower, fmtEnergy, fmtSigned, fmtExtra, fmtPct
// Valorile de intrare sunt exemple alese pentru capcane de prag (0/849/999/1000/1004/9999/10000, -983, -1500, NaN);
// nu sunt citite dintr-un senzor.
import { fmtPower, fmtEnergy, fmtSigned, fmtExtra, fmtPct, esc } from '../src/format.js';

let passed = 0, failed = 0;
function eq(label, got, want) {
  if (got === want) { passed++; }
  else { failed++; console.log('FAIL', label, '=> got', JSON.stringify(got), 'want', JSON.stringify(want)); }
}

// fmtPower: capcane cerute în prompt
eq('power 0',          fmtPower(0),       '0 W');
eq('power 849',        fmtPower(849),     '849 W');
eq('power 999',        fmtPower(999),     '999 W');
eq('power 1000',       fmtPower(1000),    '1,00 kW');
eq('power 1004',       fmtPower(1004),    '1,00 kW');
eq('power 9999',       fmtPower(9999),    '9,99 kW');
eq('power 10000',      fmtPower(10000),   '10,0 kW');
eq('power -983',       fmtPower(-983),    '\u2212983 W');
eq('power -1500',      fmtPower(-1500),   '\u22121,50 kW');
eq('power NaN',        fmtPower(NaN),     '—');
eq('power null',       fmtPower(null),    '—');
eq('power 1182',       fmtPower(1182),    '1,18 kW');
eq('power 12400',      fmtPower(12400),   '12,4 kW');
eq('power -0',         fmtPower(-0),      '0 W');

// fmtPower: unitatea se decide DUPĂ rotunjire la W întreg
eq('power 999.5',      fmtPower(999.5),   '1,00 kW');
eq('power 999.4',      fmtPower(999.4),   '999 W');
eq('power 9999.6',     fmtPower(9999.6),  '10,0 kW');
eq('power 9999.4',     fmtPower(9999.4),  '9,99 kW');
eq('power -999.5',     fmtPower(-999.5),  '\u22121,00 kW');

// fmtEnergy: kWh / MWh / capcane
eq('energy 0',         fmtEnergy(0),      '0,00 kWh');
eq('energy 15.15',     fmtEnergy(15.15),  '15,15 kWh');
eq('energy 999',       fmtEnergy(999),    '999,00 kWh');
eq('energy 1000',      fmtEnergy(1000),   '1,00 MWh');
eq('energy -1500',     fmtEnergy(-1500),  '\u22121,50 MWh');
eq('energy NaN',       fmtEnergy(NaN),    '—');
eq('energy 999.999',   fmtEnergy(999.999),'1,00 MWh');
eq('energy 999.994',   fmtEnergy(999.994),'999,99 kWh');

// fmtSigned: semnul de direcție (fără spațiu, parte a numărului)
eq('signed + solar',   fmtSigned(192, fmtPower, '+'),  '+192 W');
eq('signed - house',   fmtSigned(1182, fmtPower, '\u2212'), '\u22121,18 kW');
eq('signed - batt',    fmtSigned(983, fmtPower, '\u2212'),  '\u2212983 W');
eq('signed + energy',  fmtSigned(15.83, fmtEnergy, '+'), '+15,83 kWh');
eq('signed no sign',   fmtSigned(850, fmtPower, ''),  '850 W');
eq('signed NaN',       fmtSigned(NaN, fmtPower, '+'), '—');
// FIX: valoarea 0 NU primește semn („0 W”, nu „+0 W” / „−0 W”)
eq('signed 0 +',       fmtSigned(0, fmtPower, '+'),  '0 W');
eq('signed 0 -',       fmtSigned(0, fmtPower, '\u2212'), '0 W');
eq('signed 0 energy',  fmtSigned(0, fmtEnergy, '+'), '0,00 kWh');
eq('signed -0 +',      fmtSigned(-0, fmtPower, '+'), '0 W');

// fmtExtra: după unit_of_measurement
eq('extra W/m2',       fmtExtra(612, 'W/m\u00b2'), '612 W/m\u00b2');
eq('extra lx',         fmtExtra(12400, 'lx'), '12\u2009400 lx');
eq('extra lx small',   fmtExtra(999, 'lx'), '999 lx');
eq('extra kWh',        fmtExtra(15.83, 'kWh'), '15,83 kWh');
eq('extra kW',         fmtExtra(1.5, 'kW'), '1,50 kW');
eq('extra W',          fmtExtra(450, 'W'), '450 W');
eq('extra °C',         fmtExtra(41.7, '°C'), '41,7 °C');
eq('extra no unit',    fmtExtra(41.7, ''), '41,7');
eq('extra NaN',        fmtExtra(NaN, 'W'), '—');

// fmtPct
eq('pct 31.2',         fmtPct(31.2), '31%');
eq('pct 0',            fmtPct(0), '0%');
eq('pct null',         fmtPct(null), '—');
eq('pct NaN',          fmtPct(NaN), '—');

// esc: escape HTML pentru nume/icoane din config (Faza 4)
eq('esc amp',  esc('A&B'),     'A&amp;B');
eq('esc ltgt', esc('A<B>C'),   'A&lt;B&gt;C');
eq('esc quote',esc('a"b\'c'), 'a&quot;b&#39;c');
eq('esc null',  esc(null),      '');
eq('esc num',   esc(500),       '500');

console.log(`format.test.js: ${passed} OK, ${failed} FAIL`);
if (failed > 0) process.exit(1);
