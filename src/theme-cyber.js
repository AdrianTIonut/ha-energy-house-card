// src/theme-cyber.js — „pielea” vizuală cyber (după referinta/cyber-chatgpt.webp).
// Se adaugă DUPĂ CYBER_CSS din card.js și îl suprascrie. Doar CSS, fără logică.
// Reguli: text >= 16px, butoane >= 48px, fără fonturi/resurse externe.
// Accentul fiecărui panou vine din variabila --ac (setată inline de card.js).

export const CYBER_SKIN = `
:host { --cy:#19e6ff; --mg:#ff3df0; --gr:#7dff3a; --yl:#ffd23a; }
.card { background:
    radial-gradient(120% 60% at 50% 0%, #0b2a3d55 0%, transparent 70%),
    linear-gradient(rgba(25,230,255,.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(25,230,255,.04) 1px, transparent 1px), #050b14;
  background-size: auto, 22px 22px, 22px 22px, auto;
  border: 2px solid #19e6ff88; border-radius: 16px; padding: 14px;
  box-shadow: 0 0 22px #19e6ff33, inset 0 0 34px #19e6ff14;
  font-family: "Rajdhani","Bahnschrift","Roboto Condensed","Segoe UI",system-ui,sans-serif;
  font-variant-numeric: tabular-nums; letter-spacing: .02em; }

/* antet: casă în cutie + titlu + ceas */
.head { display: flex; align-items: center; justify-content: space-between; gap: 12px;
  border: 2px solid #19e6ff99; border-radius: 14px; padding: 8px 14px 8px 8px; margin-bottom: 12px;
  background: linear-gradient(90deg, #0a2433, #06111c); box-shadow: 0 0 12px #19e6ff33, inset 0 0 16px #19e6ff1a; }
.head-ico { flex: 0 0 auto; display: grid; place-items: center; width: 52px; height: 52px;
  border: 2px solid #19e6ffaa; border-radius: 12px; background: #071a26; }
.head .title { flex: 1; min-width: 0; font-size: 18px; line-height: 1.25; color: #e8fbff; text-shadow: none; }
.title-warn { color: #ff7af4; }
.clock { display: flex; flex-direction: column; align-items: flex-end; line-height: 1.05; font-size: 22px; font-weight: 700; color: #7ff3ff; flex: 0 0 auto; }
.clock-d { font-size: 16px; font-weight: 600; color: #9fc4d0; white-space: nowrap; letter-spacing: 0; }
.hi { display: inline-block; white-space: nowrap; }
.hI { display: none; vertical-align: -2px; margin-right: 2px; }
.hv { font-size: 23px; font-weight: 700; margin: 0 2px; }
.hv-neg { color: #ff3df0; }
.hv-pos { color: #ffa726; }
.hv-bat { color: #7dff3a; }

/* plăci: 2 × 2, accent per placă */
.plates { grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 12px; }
.plate { --ac: #19e6ff; clip-path: none; border: 2px solid var(--ac); border-radius: 14px;
  padding: 12px 14px; gap: 14px; min-height: 112px; align-items: center;
  background: linear-gradient(155deg, #0b1c2b, #050e17);
  box-shadow: 0 0 14px color-mix(in srgb, var(--ac) 45%, transparent), inset 0 0 22px color-mix(in srgb, var(--ac) 16%, transparent); }
.tile-icon { filter: drop-shadow(0 0 5px var(--ac)); }
.plate-label { font-size: 20px; font-weight: 700; letter-spacing: .14em; color: var(--ac); }
.plate .plate-val { font-size: 34px; font-weight: 700; line-height: 1.1; color: var(--ac);
  text-shadow: 0 0 12px color-mix(in srgb, var(--ac) 60%, transparent); }
.plate .plate-val.dash { color: #4b6070; text-shadow: none; }
.plate-arrow { font-size: 18px; color: #e8fbff; }

/* butoane/taburi paralelogram */
.tabs, .sys-chips { gap: 4px; }
.tab, .sys-chip { border: 0; min-height: 48px; padding: 8px 28px; font-size: 20px; font-weight: 700;
  font-family: inherit; color: #19e6ff; background: #0a2231;
  clip-path: polygon(14px 0, 100% 0, calc(100% - 14px) 100%, 0 100%); }
.tab.active, .sys-chip[aria-pressed="true"] { color: #00131a; background: linear-gradient(180deg, #5cf2ff, #19e6ff);
  box-shadow: none; }

/* panouri mari: grafic, flux, baterie, invertoare */
.graph-wrap, .flow-wrap { border: 2px solid #19e6ff99; border-radius: 14px; padding: 12px;
  background: linear-gradient(180deg, #071624, #050c15); box-shadow: 0 0 12px #19e6ff33, inset 0 0 20px #19e6ff10; }
.graph-wrap { margin-top: 12px; }
.flow-wrap { margin-top: 12px; }
.bi-wrap { gap: 10px; margin-top: 12px; }
.bi-panel { --ac: #19e6ff; clip-path: none; border: 2px solid var(--ac); border-radius: 14px; padding: 12px 14px;
  background: linear-gradient(160deg, #0a1b2a, #050d16); margin-top: 12px;
  box-shadow: 0 0 12px color-mix(in srgb, var(--ac) 40%, transparent), inset 0 0 20px color-mix(in srgb, var(--ac) 14%, transparent); }
.bi-wrap .bi-panel { margin-top: 0; }
.bi-title { font-size: 24px; font-weight: 700; letter-spacing: .06em; text-transform: none; color: var(--ac);
  text-shadow: 0 0 10px color-mix(in srgb, var(--ac) 55%, transparent); }
.bi-k { color: #9fd9e6; }
.bi-v { color: #fff; font-size: 18px; }

/* gauge baterie: 10 celule pe toată lățimea */
.bat-gauge-wrap { flex-wrap: wrap; gap: 8px; margin-bottom: 10px; }
.bat-gauge { flex: 1 1 100%; gap: 5px; padding: 6px; border: 2px solid #7dff3a99; border-radius: 10px; background: #06130b; }
.bat-gauge .cell { flex: 1; min-width: 0; height: 34px; border-radius: 4px; background: #0b1f12; border: 1px solid #7dff3a33; }
.bat-gauge .cell.filled { border-color: #ffffff55; box-shadow: 0 0 10px #ffffff40, inset 0 0 6px #ffffff55; }
.bat-sum { font-size: 20px; color: #e8fbff; }

/* statistici: cartonașe cu accent */
.azi { grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 12px; }
.stat { --ac: #19e6ff; border: 2px solid var(--ac); border-radius: 12px; padding: 10px 12px;
  background: linear-gradient(160deg, #0a1b2a, #050d16);
  box-shadow: 0 0 10px color-mix(in srgb, var(--ac) 35%, transparent), inset 0 0 16px color-mix(in srgb, var(--ac) 12%, transparent); }
.stat:nth-child(1) { --ac: #ffa726; }
.stat:nth-child(2) { --ac: #ff3df0; }
.stat:nth-child(5) { --ac: #ff4d5e; }
.stat:nth-child(6) { --ac: #3dff9a; }
.stat:nth-child(3), .stat:nth-child(4), .stat:nth-child(8) { --ac: #7dff3a; }
.stat:nth-child(7) { --ac: #ffffff; }
.stat-k { color: var(--ac); font-size: 18px; font-weight: 700; }
.stat-v { font-size: 28px; font-weight: 700; color: #fff; margin-top: 4px; }
.stat-v.dash { color: #4b6070; }

/* consumatori + extras */
.consumers { margin-top: 12px; }
.group-title { color: #19e6ff; font-size: 18px; font-weight: 700; }
.consumer { border: 2px solid #19e6ff66; border-radius: 12px; margin-bottom: 8px; padding: 10px 12px;
  background: linear-gradient(160deg, #0a1b2a, #050d16); }
.c-name { font-size: 18px; }
.c-w { font-size: 20px; color: #ff7af4; }
.c-bar { height: 8px; border-radius: 4px; background: #19e6ff22; }
.c-bar-fill { border-radius: 4px; background: linear-gradient(90deg, #19e6ff, #5cf2ff); box-shadow: 0 0 8px #19e6ff88; }
.extra-chip { border: 2px solid #19e6ff44; border-radius: 12px; background: #071624; min-height: 48px; }
.graph-tip { font-size: 18px; }

/* ===== potrivire cu poza de referință ===== */
/* plăci: 3 pe rând (Casă e în antet) */
.plates { grid-template-columns: repeat(3, 1fr); gap: 10px; }
.card.has-head .plate-house { display: none; }
.card:not(.has-head) .plates { grid-template-columns: repeat(2, 1fr); }
.plate { padding: 12px 12px; gap: 10px; min-height: 124px; min-width: 0; }
.plate .tile-icon { width: 56px; height: 56px; flex: 0 0 auto; }
.plate-text { min-width: 0; }
.plate-label { font-size: 20px; }
.plate .plate-val { font-size: 32px; white-space: nowrap; }
.plate-arrow { font-size: 18px; }

/* baterie: o singură bară (gauge + procent + rezumat) */
.bi-battery { display: flex; flex-direction: column; padding: 14px 16px; position: relative; overflow: hidden; }
.bi-battery .bi-title, .bi-battery .bi-row { display: none; }
.bi-battery .bat-gauge-wrap { flex-wrap: nowrap; align-items: center; gap: 14px; margin: 0; }
.bi-battery .bat-gauge { flex: 0 0 230px; position: relative; padding: 5px; gap: 3px;
  border: 3px solid #7dff3a; border-radius: 10px; background: #06130b; margin-right: 12px; }
.bi-battery .bat-gauge::after { content: ''; position: absolute; right: -13px; top: 28%; width: 8px; height: 44%;
  border-radius: 0 4px 4px 0; background: var(--bat, #7dff3a); }
.bi-battery .bat-gauge .cell { height: 40px; }
.bat-pct { font-size: 46px; font-weight: 700; color: #fff; line-height: 1; padding-right: 14px;
  border-right: 2px solid #7dff3a55; }
.bi-battery .bat-sum { display: flex; flex-direction: column; gap: 2px; min-width: 0; font-size: 22px; color: #e8fbff; }
.bat-sep { display: none; }
.bat-aut { color: #7dff3a; }
.bi-battery::after { content: ''; position: absolute; right: 0; bottom: 0; width: 64px; height: 34px; opacity: .55;
  background: repeating-linear-gradient(135deg, transparent 0 7px, #19e6ff 7px 9px);
  clip-path: polygon(100% 0, 100% 100%, 0 100%); pointer-events: none; }

/* invertoare */
.bi-wrap .bi-title { font-size: 30px; }
.bi-wrap .bi-row { min-height: 34px; }
.bi-wrap .bi-k { font-size: 20px; }
.bi-wrap .bi-v { font-size: 24px; }

/* jos: statistici (3 col.) + consumatori */
.bottom { display: grid; grid-template-columns: minmax(0, 1.75fr) minmax(0, 1fr); gap: 10px; margin-top: 12px; align-items: start; }
.bottom:not(:has(.consumers)) { grid-template-columns: 1fr; }
.azi { grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 0; }
.azi .stat:nth-child(4), .azi .stat:nth-child(8) { display: none; }
.stat { padding: 10px 10px 12px; min-width: 0; }
.stat-head { display: flex; align-items: center; gap: 8px; color: var(--ac); }
.stat-ico { flex: 0 0 auto; }
.stat-k { font-size: 17px; white-space: nowrap; }
.stat-v { font-size: 30px; margin-top: 6px; line-height: 1.05; }
.stat-u { display: block; font-size: 18px; font-weight: 600; color: #cfeff5; margin-top: 2px; }
.consumers { margin-top: 0; border: 2px solid #19e6ff99; border-radius: 14px; padding: 12px 14px;
  background: linear-gradient(160deg, #0a1b2a, #050d16); box-shadow: 0 0 12px #19e6ff33, inset 0 0 18px #19e6ff10; }
.cons-head { display: flex; align-items: center; gap: 10px; font-size: 20px; font-weight: 700; color: #e8fbff; margin-bottom: 8px; }
.cons-dot { width: 12px; height: 12px; border-radius: 50%; background: #7dff3a; box-shadow: 0 0 8px #7dff3a; }
.consumers .group-title, .consumers .c-bottom { display: none; }
.consumers .consumer { border: 0; background: none; padding: 6px 0; margin: 0; min-height: 48px; border-radius: 0; }
.consumers .c-icon { color: #19e6ff; width: 34px; font-size: 26px; }
.consumers .c-name { font-size: 18px; color: #e8fbff; }
.consumers .c-w { font-size: 20px; color: #e8fbff; display: block; }
.consumers .c-top { flex-direction: column; align-items: flex-start; gap: 0; }


/* caseta de preț */
.prices { display: flex; gap: 10px; margin-top: 12px; }
.price { flex: 0 1 auto; display: flex; flex-direction: column; gap: 6px; min-width: 0; border: 2px solid #ffd23a; border-radius: 12px;
  padding: 10px 12px; background: linear-gradient(160deg, #1a1608, #0a0a08);
  box-shadow: 0 0 10px #ffd23a40, inset 0 0 16px #ffd23a14; }
.price-k { font-size: 18px; font-weight: 700; color: #ffd23a; }
.price-f { display: flex; align-items: center; gap: 8px; }
.price-in { flex: 0 0 auto; width: 5.2em; min-width: 0; min-height: 48px; box-sizing: border-box; font: inherit; font-size: 26px; font-weight: 700;
  color: #fff; background: #06121c; border: 2px solid #ffd23a88; border-radius: 10px; padding: 4px 10px; text-align: right; }
.price-in:focus { outline: none; border-color: #ffd23a; box-shadow: 0 0 10px #ffd23a88; }
.price-u { font-size: 18px; color: #cfeff5; white-space: nowrap; }



/* varianta compactă */
.compact { display: flex; flex-direction: column; gap: 6px; }
.cbox { cursor: pointer; filter: drop-shadow(0 0 2px #19e6ff33); }
.card.slim { padding: 6px; border-radius: 14px; }
.cstats3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
.cq { --ac: #19e6ff; min-width: 0; border: 2px solid var(--ac); border-radius: 10px; padding: 3px 8px 5px;
  background: linear-gradient(160deg, #0a1b2a, #050d16);
  box-shadow: 0 0 8px color-mix(in srgb, var(--ac) 35%, transparent), inset 0 0 12px color-mix(in srgb, var(--ac) 12%, transparent); }
.cq-k { display: block; font-size: 16px; font-weight: 700; color: var(--ac); white-space: nowrap; line-height: 1.15; }
.cq-v { display: block; font-size: 21px; font-weight: 700; color: #fff; white-space: nowrap; line-height: 1.15; }
.cq-u { font-size: 16px; font-weight: 600; color: #cfeff5; margin-left: 4px; }


/* compact-small:start — carduri compacte în coloană îngustă (≤ 400 px): text mic, ca restul vederii */
@container (max-width: 400px) {
  .card.slim { padding: 4px; }
  .compact { gap: 4px; }
  .cstats3 { gap: 4px; }
  .cq { padding: 2px 6px 4px; border-radius: 8px; }
  .cq-k { font-size: 11px; }
  .cq-v { font-size: 13px; }
  .cq-u { font-size: 11px; margin-left: 3px; }
}
/* compact-small:end */

/* ===== card îngust (coloană de tabletă/telefon): se adaptează lățimii cardului, nu a ferestrei ===== */
:host { container-type: inline-size; }
@container (max-width: 640px) {
  .card { padding: 10px; }
  .head { gap: 8px; padding: 6px 10px 6px 6px; }
  .head-ico { width: 44px; height: 44px; }
  .head .title { font-size: 16px; }
  .hv { font-size: 19px; }
  .clock { font-size: 18px; }
  .plates { gap: 6px; }
  .plate { flex-direction: column; align-items: flex-start; gap: 6px; padding: 10px 8px; min-height: 0; }
  .plate .tile-icon { width: 40px; height: 40px; }
  .plate-label { font-size: 16px; letter-spacing: .06em; }
  .plate .plate-val { font-size: 25px; }
  .plate-arrow { font-size: 16px; }
  .tabs { flex-wrap: wrap; }
  .tab, .sys-chip { padding: 8px 18px; font-size: 18px; }
  .graph-wrap, .flow-wrap { padding: 8px; }
  .bi-battery .bat-gauge-wrap { flex-wrap: wrap; }
  .bi-battery .bat-gauge { flex: 1 1 100%; margin-right: 12px; }
  .bat-pct { font-size: 38px; }
  .bi-battery .bat-sum { font-size: 18px; }
  .bi-wrap .bi-title { font-size: 24px; }
  .bi-wrap .bi-k { font-size: 16px; }
  .bi-wrap .bi-v { font-size: 20px; }
  .bottom { grid-template-columns: 1fr; }
  .azi { grid-template-columns: repeat(2, 1fr); }
  .stat-v { font-size: 26px; }
  .prices { flex-direction: column; }
  .price-in { font-size: 24px; }
}

/* telefon (iPhone ~ 370 px util): antetul rămâne pe UN singur rând, ca în design; textul se scalează cu lățimea cardului */
@container (max-width: 420px) {
  .head { padding: 6px 8px 6px 6px; gap: 6px; }
  .head-ico { width: 8.6cqw; height: 8.6cqw; min-width: 32px; min-height: 32px; }
  .head-ico svg { width: 70%; height: 70%; }
  .head .title { white-space: nowrap; overflow: hidden; font-size: 3.1cqw; line-height: 1.2; }
  .hv { font-size: 3.8cqw; margin: 0 .3cqw; }
  .hw { display: none; }
  .hI { display: inline-block; }
  .hb { display: none; }
  .hs { margin: 0 .4cqw; }
  .clock { font-size: 4.4cqw; }
  .clock-d { font-size: 3cqw; }
  .plate { padding: 10px 6px; }
  .plate .plate-val { font-size: 21px; }
}
/* plăci Solar / Rețea / Baterie: aceeași formă pătrată, dar mai mici, cu text scalat ca la butoanele de statistici
   (etichetă mică, valoare medie). Vine ULTIMUL ca să câștige peste regulile de mai sus. */
.plates { gap: 6px; margin-bottom: 8px; }
.plate { flex-direction: column; align-items: flex-start; gap: 3px; padding: 7px 8px 8px; min-height: 0; border-width: 1.6px; }
.plate .tile-icon { width: 26px; height: 26px; flex: 0 0 auto; }
.plate-text { display: grid; gap: 1px; min-width: 0; width: 100%; }
.plate-label { font-size: 16px; letter-spacing: .06em; line-height: 1.1; }
.plate .plate-val { font-size: 23px; line-height: 1.1; margin-top: 0; text-shadow: none; white-space: nowrap; }
.plate-arrow { font-size: 16px; line-height: 1.1; margin-top: 1px; white-space: nowrap; }
.plate-led { display: grid; gap: 0; margin-top: 3px; white-space: nowrap; font-size: clamp(10px, 3cqw, 12px); line-height: 1.18; font-weight: 600; }
.plate-led .led-i { color: #ff4d5e; }
.plate-led .led-e { color: #3dff9a; }
.plate-led .led-a { font-size: .8em; }
.plate-soc { margin-left: 4px; font-weight: 600; opacity: .9; letter-spacing: 0; }
/* telefon: ACELEAȘI dimensiuni ca în antet (titlu 3.1cqw, valori 3.8cqw, iconiță 6cqw) */
@container (max-width: 420px) {
  .plate .tile-icon { width: 6cqw; height: 6cqw; min-width: 20px; min-height: 20px; }
  .plate-label, .plate-arrow { font-size: 3.1cqw; }
  .plate .plate-val { font-size: 3.8cqw; }
  .plate { padding: 7px 8px 8px; }
}

/* telefon: O SINGURĂ scară pentru toate casetele (etichete 3.1cqw, valori 3.8cqw, iconițe 6cqw); forma rămâne */
@container (max-width: 420px) {
  .tab, .sys-chip { min-height: 36px; padding: 6px 14px; font-size: 3.4cqw; }
  .stat { padding: 7px 8px 8px; }
  .stat-head { gap: 6px; }
  .stat-ico { width: 6cqw; height: 6cqw; min-width: 18px; min-height: 18px; }
  .stat-k { font-size: 3.1cqw; }
  .stat-v { font-size: 3.8cqw; margin-top: 3px; }
  .stat-u { font-size: 3.1cqw; margin-top: 0; }
  .bi-battery { padding: 10px 12px; }
  .bi-battery .bat-gauge-wrap { flex-wrap: wrap; align-items: center; gap: 6px 10px; }
  .bi-battery .bat-gauge { flex: 1 1 100%; margin-right: 10px; padding: 4px; gap: 2px; }
  .bi-battery .bat-gauge .cell { height: 20px; border-radius: 3px; }
  .bi-battery .bat-gauge::after { right: -9px; width: 6px; }
  .bat-pct { font-size: 7cqw; padding-right: 10px; }
  .bi-battery .bat-sum { font-size: 3.1cqw; flex: 1; gap: 0; }
  .bi-battery::after { width: 40px; height: 20px; }
  .bi-wrap .bi-title { font-size: 3.8cqw; }
  .bi-wrap .bi-row { min-height: 26px; }
  .bi-wrap .bi-k { font-size: 3.1cqw; }
  .bi-wrap .bi-v { font-size: 3.8cqw; }
  .bi-panel { padding: 8px 10px; }
  .consumers { padding: 8px 10px; }
  .consumers .consumer { min-height: 34px; padding: 3px 0; }
  .consumers .c-icon { width: 6cqw; font-size: 6cqw; }
  .consumers .c-name { font-size: 3.1cqw; }
  .consumers .c-w { font-size: 3.8cqw; }
  .prices { flex-direction: row; gap: 6px; margin-top: 8px; }
  .price { padding: 6px 8px; gap: 3px; flex: 0 1 auto; }
  .cons-head { font-size: 3.8cqw; gap: 6px; }
  .cons-dot { width: 2.4cqw; height: 2.4cqw; min-width: 8px; min-height: 8px; }
  .price-f { gap: 6px; }
  .price-k, .price-u { font-size: 3.1cqw; }
  .price-in { font-size: 3.8cqw; min-height: 30px; width: 4.8em; flex: 0 1 4.8em; padding: 1px 6px; border-width: 1.6px; }
  .extra-chip { min-height: 36px; font-size: 3.1cqw; }
}
/* baterie: corp mic (~50%), umplere continuă proporțională, procentul pe baterie, capacitatea + autonomia dedesubt */
.bi-battery { padding: 10px 14px; }
.bi-battery .bat-gauge-wrap { flex-direction: row; flex-wrap: nowrap; align-items: center; gap: 0; margin: 0; }
.bi-battery .bat-gauge { position: relative; display: block; flex: 0 0 46%; width: auto; height: 34px; padding: 0; margin: 0 14px 0 0;
  border: 2px solid var(--bat, #7dff3a); border-radius: 8px; background: #06130b; }
.bi-battery .bat-gauge::after { right: -7px; top: 28%; width: 5px; height: 44%; border-radius: 0 3px 3px 0; }
.bat-level { position: absolute; left: 2px; top: 2px; bottom: 2px; border-radius: 5px; opacity: .9; box-shadow: 0 0 5px #ffffff30; }
.bi-battery .bat-pct { position: absolute; inset: 0; display: grid; place-items: center; padding: 0; border: 0; font-size: 20px;
  color: #fff; text-shadow: 0 1px 3px #000, 0 0 5px #000; }
.bi-battery .bat-sum { display: flex; flex-direction: column; justify-content: center; align-items: flex-start; text-align: left; font-size: 18px; gap: 2px; flex: 1; min-width: 0;
  border-left: 2px solid var(--bat-soft, #7dff3a66); padding-left: 12px; align-self: stretch; }
.bi-battery .bat-s1 { color: #e8fbff; white-space: nowrap; }
.bat-reserve { position: absolute; top: 2px; bottom: 2px; width: 2px; margin-left: -1px; background: #fff; opacity: .75; z-index: 1; border-radius: 1px; }
.bat-floor { background: #ff4d5e; opacity: .85; }
.bat-extra { font-size: .85em; color: #9fd9e6; white-space: nowrap; }
.bat-res { color: #ffd23a; }
.bat-lost { color: #ff9a3c; font-weight: 700; }
@container (max-width: 420px) {
  .bi-battery { padding: 8px 10px; }
  .bi-battery .bat-gauge { flex: 0 0 46%; height: 7.5cqw; min-height: 26px; margin-right: 12px; }
  .bi-battery .bat-pct { font-size: 3.8cqw; }
  .bi-battery .bat-sum { font-size: 3.1cqw; padding-left: 8px; }
}
.flow-wrap:has(.compact) { border: 0; padding: 0; background: none; box-shadow: none; }
/* antetul rămâne mereu pe UN rând (la nevoie _fitHead îl micșorează); starea bateriei scrisă ("se descarcă") doar pe card lat */
.head .title { white-space: nowrap; overflow: hidden; }
@container (max-width: 640px) { .hb { display: none; } }
/* colțuri teșite ca în designul inițial (sus-stânga + jos-dreapta tăiate, celelalte două puțin rotunjite).
   Fără corner-shape (nu există în Safari / WebView): clip-path taie colțul, iar diagonala se desenează cu gradient în ::before. */
.card, .head, .plate, .graph-wrap, .flow-wrap, .bi-panel, .stat, .consumers, .price, .cq {
  --cut: 14px; --bw: 2px; --bc: #19e6ff99; position: relative; border-radius: 0 8px 0 8px;
  clip-path: polygon(var(--cut) 0, 100% 0, 100% calc(100% - var(--cut)), calc(100% - var(--cut)) 100%, 0 100%, 0 var(--cut)); }
.card, .card.slim { border-radius: 0 10px 0 10px; }
.card { --cut: 26px; --bc: #19e6ff88; }
.card.slim { --cut: 18px; }
.plate, .stat, .bi-panel, .cq { --bc: var(--ac); }
.plate, .stat, .cq { --cut: 11px; }
.plate { --bw: 1.6px; }
.price { --cut: 11px; --bc: #ffd23a; }
.card::before, .head::before, .plate::before, .graph-wrap::before, .flow-wrap::before, .bi-panel::before, .stat::before, .consumers::before, .price::before, .cq::before {
  content: ''; position: absolute; inset: calc(-1 * var(--bw)); pointer-events: none; z-index: 2;   /* absolute se măsoară de la marginea INTERIOARĂ; compensăm grosimea bordurii */
  background:
    linear-gradient(135deg, transparent calc(50% - 0.5px), var(--bc) calc(50% - 0.5px), var(--bc) calc(50% + var(--bw)), transparent calc(50% + var(--bw))) top left / var(--cut) var(--cut) no-repeat,
    linear-gradient(315deg, transparent calc(50% - 0.5px), var(--bc) calc(50% - 0.5px), var(--bc) calc(50% + var(--bw)), transparent calc(50% + var(--bw))) bottom right / var(--cut) var(--cut) no-repeat; }
.head-ico { border-radius: 6px; }
/* cardul „doar baterie”: o singură margine (a cardului), fără panou în panou */
.card.solo-battery .bi-battery { border: 0; background: none; box-shadow: none; clip-path: none; border-radius: 0; padding: 0; }
.card.solo-battery .bi-battery::before, .card.solo-battery .bi-battery::after { display: none; }
/* cardul „doar antet”: rămâne doar banda (cu marginea ei), fără cardul exterior → nu mai e card în card */
.card.solo-header { border: 0; background: none; box-shadow: none; clip-path: none; border-radius: 0; padding: 0; }
.card.solo-header::before { display: none; }
.card.solo-header .head { margin-bottom: 0; }
`;
