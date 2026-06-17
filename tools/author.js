/*
 * PRISM — authoring validator. The workhorse for designing levels.
 *
 *   node tools/author.js <designs.js> [idx]
 *
 * For every design it AUTO-CALIBRATES the budget (the minimum mirrors that
 * solve it), then reports the signals that tell you whether a puzzle is good:
 *   area      board size (bigger boards = more to plan)
 *   min       minimum mirrors required (higher = more involved)
 *   sols      distinct minimal solutions (1-3 = tight & intentional)
 *   PASS/FAIL solvable, not trivial, and within tightness limits
 * plus an ASCII map of the solved beam so the design can be read at a glance.
 *
 * A designs file is: module.exports = [ {world,name,note,grid:[...]}, ... ]
 * Omit `budget` and let the tool find the tight one; an explicit budget is honoured.
 */
const Engine = require('./../js/engine.js');
const { solve } = require('./solver.js');
const { parse } = require('./parse.js');

const file = process.argv[2];
if (!file) { console.error('usage: node tools/author.js <designs.js> [idx]'); process.exit(2); }
const DESIGNS = require(require('path').resolve(file));
const onlyIdx = process.argv[3] ? parseInt(process.argv[3], 10) : null;

const MASKCH = { 0: '·', 1: 'b', 2: 'g', 3: 'c', 4: 'r', 5: 'm', 6: 'y', 7: 'W' };
const MAXB = 9, CAP = 6;

let fails = 0, warns = 0;
DESIGNS.forEach((d, i) => {
  if (onlyIdx && onlyIdx !== i + 1) return;
  const L = parse(d);

  let budget = d.budget, sols;
  if (budget == null) {
    for (let b = 1; b <= MAXB; b++) { const s = solve(L, b, CAP); if (s.length) { budget = b; sols = s; break; } }
    if (budget == null) { budget = MAXB; sols = []; }
  } else sols = solve(L, budget, CAP);

  const sol = sols[0] || [];
  const sim = Engine.simulate(L, sol);
  const trivial = Engine.simulate(L, []).win;
  const area = L.w * L.h;

  const flags = [];
  let bad = false;
  if (!sols.length) { flags.push('UNSOLVABLE'); bad = true; }
  if (trivial) { flags.push('TRIVIAL'); bad = true; }
  if (sols.length >= CAP) { flags.push('many-sols'); warns++; }
  if (bad) fails++;

  const grade = bad ? 'FAIL' : 'PASS';
  console.log(`#${String(i + 1).padStart(3)} W${d.world} ${(d.name || '').padEnd(20)} ${L.w}x${L.h}(${area}) ` +
    `bud:${sols.length ? budget : '-'} min:${sols.length ? sol.length : '-'} sols:${sols.length}${sols.length >= CAP ? '+' : ''} ` +
    `${grade}${flags.length ? ' [' + flags.join(',') + ']' : ''}`);

  // ASCII viz of the solved board
  const glyph = d.grid.map(r => r.split(''));
  sol.forEach(m => { glyph[m.y][m.x] = m.orient === '/' ? '/' : '\\'; });
  const beam = {};
  sim.segments.forEach(s => { const x = Math.floor(s.x2), y = Math.floor(s.y2); if (x >= 0 && y >= 0 && x < L.w && y < L.h) beam[x + ',' + y] = (beam[x + ',' + y] || 0) | s.mask; });
  for (let y = 0; y < L.h; y++) for (let x = 0; x < L.w; x++) if (glyph[y][x] === '.' && beam[x + ',' + y]) glyph[y][x] = MASKCH[beam[x + ',' + y]];
  console.log(glyph.map(r => '    ' + r.join(' ')).join('\n'));
  console.log('    ' + sim.targetStatus.map(t => `(${t.x},${t.y})${MASKCH[t.mask]}=${MASKCH[t.got]}${t.lit ? '+' : '-'}`).join(' ') + (sim.voidHit ? '  VOID-HIT' : ''));
});

if (onlyIdx === null) console.log(`\n${DESIGNS.length} designs | ${fails} FAIL | ${warns} warn`);
if (fails) process.exit(1);
