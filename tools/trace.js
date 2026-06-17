/*
 * PRISM — ASCII tracer for authoring. Shows a level, the solver's solution,
 * and the solved beam map so designs can be debugged visually.
 *   node tools/trace.js [1-based level index]   (default: all)
 */
const Engine = require('../js/engine.js');
const { solve } = require('./solver.js');
const { parse } = require('./parse.js');
const DESIGNS = require('./leveldata.js');

const MASKCH = { 0: '·', 1: 'b', 2: 'g', 3: 'c', 4: 'r', 5: 'm', 6: 'y', 7: 'W' };

const BUDGET_OVERRIDE = process.argv[3] ? parseInt(process.argv[3], 10) : null;

function render(design) {
  const L = parse(design);
  const sols = solve(L, BUDGET_OVERRIDE || design.budget, 6);
  const sol = sols[0] || [];
  const sim = Engine.simulate(L, sol);

  // base glyph per cell from the source grid
  const glyph = [];
  for (let y = 0; y < L.h; y++) glyph.push(design.grid[y].split(''));
  // overlay solution mirrors
  sol.forEach(m => { glyph[m.y][m.x] = m.orient === '/' ? '╱' : '╲'; });
  // overlay beam presence (combined mask) where cell is empty/'.'
  const beam = {};
  sim.segments.forEach(s => {
    const x = Math.floor(s.x2), y = Math.floor(s.y2);
    if (x >= 0 && y >= 0 && x < L.w && y < L.h) beam[x + ',' + y] = (beam[x + ',' + y] || 0) | s.mask;
  });
  for (let y = 0; y < L.h; y++) for (let x = 0; x < L.w; x++) {
    if (glyph[y][x] === '.' && beam[x + ',' + y]) glyph[y][x] = MASKCH[beam[x + ',' + y]];
  }

  const lines = glyph.map(r => '  ' + r.join(' '));
  const status = sim.targetStatus.map(t => `(${t.x},${t.y}) need ${MASKCH[t.mask]} got ${MASKCH[t.got]} ${t.lit ? 'OK' : 'NO'}`);
  console.log(`\n#${design.id || '?'} ${design.name}  budget ${design.budget}  solutions ${sols.length}  win:${sim.win}`);
  console.log(lines.join('\n'));
  console.log('  ' + status.join('   '));
}

const idx = process.argv[2] ? parseInt(process.argv[2], 10) : null;
DESIGNS.forEach((d, i) => { d.id = i + 1; if (idx === null || idx === i + 1) render(d); });
