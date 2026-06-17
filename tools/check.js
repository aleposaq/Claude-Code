/*
 * PRISM — validate an arbitrary designs file (for authoring scratch work).
 *   node tools/check.js /tmp/myworld.js [1-based index] [budgetOverride]
 * The file must `module.exports = [ {world,name,budget,note,grid:[...]}, ... ]`.
 * Prints, per level: budget / min mirrors / solution count / win, plus an
 * ASCII map of the solved beams so designs can be debugged visually.
 */
const Engine = require('./../js/engine.js');
const { solve } = require('./solver.js');
const { parse } = require('./parse.js');

const file = process.argv[2];
if (!file) { console.error('usage: node tools/check.js <designs.js> [idx] [budget]'); process.exit(2); }
const DESIGNS = require(require('path').resolve(file));
const onlyIdx = process.argv[3] ? parseInt(process.argv[3], 10) : null;
const budgetOverride = process.argv[4] ? parseInt(process.argv[4], 10) : null;

const MASKCH = { 0: '·', 1: 'b', 2: 'g', 3: 'c', 4: 'r', 5: 'm', 6: 'y', 7: 'W' };

let bad = 0;
DESIGNS.forEach((d, i) => {
  if (onlyIdx && onlyIdx !== i + 1) return;
  const L = parse(d);
  const sols = solve(L, budgetOverride || d.budget, 6);
  const sol = sols[0] || [];
  const sim = Engine.simulate(L, sol);
  const minLen = sols.length ? sols[0].length : '-';
  const flags = [];
  if (!sols.length) { flags.push('UNSOLVABLE'); bad++; }
  else { if (sols[0].length < d.budget) flags.push('loose'); if (sols.length >= 6) flags.push('many'); }
  console.log(`#${i + 1} ${d.name}  budget:${d.budget} min:${minLen} sols:${sols.length} ${flags.join(',') || 'ok'}`);

  const glyph = d.grid.map(r => r.split(''));
  sol.forEach(m => { glyph[m.y][m.x] = m.orient === '/' ? '/' : '\\'; });
  const beam = {};
  sim.segments.forEach(s => { const x = Math.floor(s.x2), y = Math.floor(s.y2); if (x >= 0 && y >= 0 && x < L.w && y < L.h) beam[x + ',' + y] = (beam[x + ',' + y] || 0) | s.mask; });
  for (let y = 0; y < L.h; y++) for (let x = 0; x < L.w; x++) if (glyph[y][x] === '.' && beam[x + ',' + y]) glyph[y][x] = MASKCH[beam[x + ',' + y]];
  console.log(glyph.map(r => '   ' + r.join(' ')).join('\n'));
  console.log('   ' + sim.targetStatus.map(t => `(${t.x},${t.y})${MASKCH[t.mask]}=${MASKCH[t.got]}${t.lit ? '+' : '-'}`).join(' '));
});
if (onlyIdx === null) console.log(`\n${bad} unsolvable of ${DESIGNS.length}`);
