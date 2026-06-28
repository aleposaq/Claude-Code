/*
 * PRISM v2 design check: validate a v2 designs file and visualise a solution.
 *   node tools/check2.js [tools/leveldata2.js] [idx]
 * Prints per level: solvable / par / inventory / liveFirstMoves(difficulty) / truncated,
 * plus an ASCII map of one solution's beams so designs can be debugged.
 */
const Engine = require('../js/engine2.js');
const { solve, liveFirstMoves, par } = require('./solver2.js');

const file = process.argv[2] || './leveldata2.js';
const DESIGNS = require(require('path').resolve(__dirname, file.replace(/^tools\//, '')));
const onlyIdx = process.argv[3] ? parseInt(process.argv[3], 10) : null;

const MASKCH = { 0: '·', 1: 'b', 2: 'g', 3: 'c', 4: 'r', 5: 'm', 6: 'y', 7: 'W' };
const PIECE = { mirror: { '/': '/', '\\': '\\' }, splitter: { '/': 'Y', '\\': 'T' },
  prism: { '/': 'P', '\\': 'q' }, filter: { 4: 'R', 2: 'G', 1: 'B' } };

function furnitureGlyph(level, x, y) {
  const eq = (a) => a.some(o => o.x === x && o.y === y);
  if ((level.walls || []).some(([a, b]) => a === x && b === y)) return '#';
  if ((level.voids || []).some(([a, b]) => a === x && b === y)) return 'x';
  for (const s of level.sources || []) if (s.x === x && s.y === y) return '><v^'[[1, 3, 2, 0].indexOf(s.dir)] || '>';
  for (const t of level.targets || []) if (t.x === x && t.y === y) return MASKCH[t.mask];
  for (const s of level.switches || []) if (s.x === x && s.y === y) return '$';
  for (const d of level.doors || []) if (d.x === x && d.y === y) return 'D';
  for (const t of level.teleporters || []) if (t.x === x && t.y === y) return 'o';
  for (const f of level.fixed || []) if (f.x === x && f.y === y) return (PIECE[f.type] || {})[f.orient || f.color] || '?';
  return null;
}

let bad = 0;
DESIGNS.forEach((d, i) => {
  if (onlyIdx && onlyIdx !== i + 1) return;
  const res = solve(d, 8);
  const exactPar = par(d);
  const sol = (res.solutions.find(s => s.length === exactPar.par)) || res.solutions[0] || [];
  const live = liveFirstMoves(d);
  const invStr = Object.keys(d.inventory || {}).map(k => `${k}:${d.inventory[k]}`).join(' ');
  const flags = [];
  if (!res.solutions.length) { flags.push('UNSOLVABLE'); bad++; }
  if (res.truncated || exactPar.truncated) flags.push('TRUNCATED');
  console.log(`#${i + 1} ${d.name}  ${d.w}x${d.h}  inv[${invStr}]  par:${exactPar.par}  sols:${res.solutions.length}${res.solutions.length >= 8 ? '+' : ''}  live:${live.live}/${live.total}  ${flags.join(',') || 'ok'}`);

  // beam map of the first solution
  const sim = Engine.simulate(d, sol);
  const placedAt = {};
  sol.forEach(p => { placedAt[p.x + ',' + p.y] = (PIECE[p.type] || {})[p.orient || p.color] || '?'; });
  const beam = {};
  sim.segments.forEach(s => { const x = Math.floor(s.x2), y = Math.floor(s.y2); if (x >= 0 && y >= 0 && x < d.w && y < d.h) beam[x + ',' + y] = (beam[x + ',' + y] || 0) | s.mask; });
  const rows = [];
  for (let y = 0; y < d.h; y++) {
    let r = '';
    for (let x = 0; x < d.w; x++) {
      const f = furnitureGlyph(d, x, y);
      if (f) r += f + ' ';
      else if (placedAt[x + ',' + y]) r += placedAt[x + ',' + y] + ' ';
      else if (beam[x + ',' + y]) r += MASKCH[beam[x + ',' + y]] + ' ';
      else r += '. ';
    }
    rows.push('   ' + r);
  }
  console.log(rows.join('\n'));
  console.log('   targets: ' + sim.targetStatus.map(t => `(${t.x},${t.y})${MASKCH[t.mask]}=${MASKCH[t.got]}${t.lit ? '+' : '-'}`).join(' ')
    + (d.switches ? '  switches: ' + sim.switchStatus.map(s => `${s.on ? 'ON' : 'off'}`).join(',') : ''));
  console.log('   solution: ' + (sol.length ? sol.map(p => `${p.type}@${p.x},${p.y}${p.orient || ''}${p.color ? 'c' + p.color : ''}`).join('  ') : '(none)'));
  console.log('');
});
if (onlyIdx === null) console.log(`${bad} unsolvable of ${DESIGNS.length}`);
