// build.js — lipește src/*.js într-un singur modul energie-casa-card.js (fără `import`).
// Rulează:  node build.js
// Fișierul final e un MODUL cu un singur export (energie-casa-card), ca să se poată
// încărca în HA ca „JavaScript Module" și în Node ca ESM. Se pune în
// config\www\energie-casa-card\energie-casa-card.js (servit ca /local/energie-casa-card/energie-casa-card.js).
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ORDINE IMPORTANTĂ: calc → format → flow → flow-svg (folosește fmtPower/esc) → graph-24h → card
const SRC = ['icons.js', 'calc.js', 'format.js', 'flow.js', 'flow-svg.js', 'graph-24h.js', 'theme-cyber.js', 'editor.js', 'card.js'];

// transformă un modul ESM într-un fragment fără import/export local:
//  - linia `import {...} from './x.js'` → eliminată (depinența e inline, același domeniu)
//  - `export function/const/let/var/class` → declarație obisnuită (locală)
//  - `export { ... }` întreagă linie → eliminată (exportul final se adaugă la final)
function inline(code) {
  return code
    .split('\n')
    .map((line) => {
      if (/^\s*import\s/.test(line) && /from\s+['"]\.\//.test(line)) return '';
      let l = line.replace(/^(\s*)export\s+(default\s+)?(function|const|let|var|class)\b/, '$1$3');
      if (/^\s*export\s*\{/.test(l)) return '';
      return l;
    })
    .join('\n');
}

let out = '// energie-casa-card.js — asamblat automat din src/*.js (build.js). NU edita manual.\n';
for (const f of SRC) {
  const code = readFileSync(join(__dirname, 'src', f), 'utf8');
  out += '\n/* ===== ' + f + ' ===== */\n' + inline(code) + '\n';
}
// export unic al modulului (nu e local, nu e import → nu e „leftover")
out += '\nexport { EnergieCasaCard, eccDetectSensors };\n';
writeFileSync(join(__dirname, 'energie-casa-card.js'), out);
// aceeași carte sub numele repository-ului (HACS cere ca fișierul să poarte numele repo-ului)
writeFileSync(join(__dirname, 'ha-energy-house-card.js'), out);

// verificare: nu mai rămâne niciun `import` niciun export local în fișierul final
const bad = out.split('\n').filter((l) =>
  /^\s*import\b/.test(l) ||
  /^\s*export\s+(default\s+)?(function|const|let|var|class)\b/.test(l) ||
  /^\s*export\s+.*\bfrom\s/.test(l)
);
console.log('asamblat energie-casa-card.js:', out.length, 'char; leftover import/export local:', bad.length);
if (bad.length > 0) { console.log('AVERTISMENT: linii rămase:\n' + bad.join('\n')); process.exit(1); }
