// tests/run-all.mjs — rulează toate testele (fiecare într-un proces, cu limită de timp). Rulare: node tests/run-all.mjs
import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const here = dirname(fileURLToPath(import.meta.url));
const files = readdirSync(here).filter((f) => /\.test\.(m?js)$/.test(f)).sort();
let bad = 0;
for (const f of files) {
  const r = spawnSync(process.execPath, [join(here, f)], { encoding: 'utf8', timeout: 60000 });
  const tail = (r.stdout || '').trim().split('\n').pop();
  if (r.status === 0) console.log('✔', f, tail ? '— ' + tail.slice(0, 60) : '');
  else { bad++; console.log('✖', f, r.status === null ? '(timeout)' : '(cod ' + r.status + ')'); console.log((r.stdout || '').split('\n').filter((l) => /FAIL/.test(l)).slice(0, 5).join('\n')); }
}
console.log(bad ? `\n${bad} fișier(e) cu teste picate` : `\nToate cele ${files.length} fișiere de teste trec`);
process.exit(bad ? 1 : 0);
