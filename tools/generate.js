/*
 * PRISM — level generator (Node, build-time only).
 *
 * Strategy: build a beam path *constructively*. We walk a beam from the source,
 * placing a mirror at every turn and dropping targets / filters / a splitter
 * along the way. The mirrors we placed become the intended SOLUTION; we then
 * remove them from the board so the player must rediscover them.
 *
 * Because the solution is built before the puzzle, every level is guaranteed
 * solvable. We still validate each one with the real engine and reject any
 * that solve with zero mirrors (i.e. are trivial).
 *
 * Output: js/levels.js with 32 concrete, validated levels.
 */
const fs = require('fs');
const path = require('path');
const Engine = require('../js/engine.js');
const { DIRS, mirrorFor } = Engine;

// --- seeded RNG (mulberry32) ---------------------------------------------
function rngFrom(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];

const COLORS = ['R', 'G', 'B'];

// Walk a beam, placing a mirror at each turn. Returns null on failure.
//   occupied : shared cell map ("x,y" -> role)
//   returns  : { cells:[{x,y}], mirrors:[{x,y,orient}], end:{x,y}, endDir }
function walk(occupied, w, h, start, dir, turns, rng) {
  const inb = (x, y) => x >= 0 && y >= 0 && x < w && y < h;
  let x = start.x, y = start.y, curDir = dir;
  const cells = [], mirrors = [];

  for (let t = 0; t <= turns; t++) {
    const isLast = t === turns;
    const len = 2 + Math.floor(rng() * 3); // 2..4 cells per segment
    let stepped = 0;
    for (let i = 0; i < len; i++) {
      const cx = x + DIRS[curDir][0], cy = y + DIRS[curDir][1];
      if (!inb(cx, cy) || occupied[cx + ',' + cy]) break;
      x = cx; y = cy; occupied[x + ',' + y] = 'path';
      cells.push({ x, y });
      stepped++;
    }
    if (stepped === 0) return null;

    if (!isLast) {
      const perps = curDir % 2 === 0 ? [1, 3] : [0, 2];
      if (rng() < 0.5) perps.reverse();
      let nd = null;
      for (const d of perps) {
        const cx = x + DIRS[d][0], cy = y + DIRS[d][1];
        if (inb(cx, cy) && !occupied[cx + ',' + cy]) { nd = d; break; }
      }
      if (nd === null) return null;
      mirrors.push({ x, y, orient: mirrorFor(curDir, nd) });
      occupied[x + ',' + y] = 'mirror';
      curDir = nd;
    }
  }
  return { cells, mirrors, end: { x, y }, endDir: curDir };
}

// Choose `n` target cells from a branch's plain (non-mirror) path cells,
// optionally assigning each a color with a filter placed earlier on the path.
function decorate(branch, occupied, n, colored, rng, targets, filters) {
  const mirrorSet = new Set(branch.mirrors.map(m => m.x + ',' + m.y));
  // plain pass-through cells, kept in path order, skipping the first (too close)
  const plain = branch.cells.filter(c => !mirrorSet.has(c.x + ',' + c.y));
  if (plain.length < n + (colored ? n : 0) + 1) return false;

  // target indices, ascending, spaced out
  const idxs = [];
  const startFrom = colored ? 1 : 0;
  let cursor = startFrom + 1;
  for (let i = 0; i < n; i++) {
    const room = plain.length - cursor - (n - i - 1);
    if (room <= cursor) return false;
    const ti = cursor + Math.floor(rng() * Math.max(1, room - cursor));
    idxs.push(Math.min(ti, plain.length - 1));
    cursor = idxs[idxs.length - 1] + (colored ? 2 : 1);
  }

  let prev = -1;
  for (const ti of idxs) {
    const cell = plain[ti];
    if (occupied[cell.x + ',' + cell.y] !== 'path') return false;
    let color = 'W';
    if (colored) {
      // place a filter strictly between the previous target and this one
      const fi = prev + 1 + Math.floor(rng() * Math.max(1, ti - prev - 1));
      if (fi >= ti || fi < 0) return false;
      const fcell = plain[fi];
      if (occupied[fcell.x + ',' + fcell.y] !== 'path') return false;
      color = pick(rng, COLORS);
      filters.push({ x: fcell.x, y: fcell.y, color });
      occupied[fcell.x + ',' + fcell.y] = 'filter';
    }
    targets.push({ x: cell.x, y: cell.y, color });
    occupied[cell.x + ',' + cell.y] = 'target';
    prev = ti;
  }
  return true;
}

function tryBuild(cfg, seed) {
  const rng = rngFrom(seed);
  const w = cfg.w, h = cfg.h;
  const occupied = {};

  // source on a random edge pointing inward
  let source;
  const edge = Math.floor(rng() * 4);
  if (edge === 0) source = { x: 0, y: 1 + Math.floor(rng() * (h - 2)), dir: 1 };
  else if (edge === 1) source = { x: w - 1, y: 1 + Math.floor(rng() * (h - 2)), dir: 3 };
  else if (edge === 2) source = { x: 1 + Math.floor(rng() * (w - 2)), y: 0, dir: 2 };
  else source = { x: 1 + Math.floor(rng() * (w - 2)), y: h - 1, dir: 0 };
  source.color = 'W';
  occupied[source.x + ',' + source.y] = 'source';

  const level = {
    w, h, sources: [source], targets: [], walls: [],
    filters: [], splitters: [], solution: []
  };

  // main branch
  const main = walk(occupied, w, h, source, source.dir, cfg.turns, rng);
  if (!main) return null;
  main.mirrors.forEach(m => level.solution.push(m));

  // optional splitter branch
  if (cfg.splitter) {
    const mirrorSet = new Set(main.mirrors.map(m => m.x + ',' + m.y));
    const plain = main.cells.filter((c, i) => i > 0 && i < main.cells.length - 1 && !mirrorSet.has(c.x + ',' + c.y));
    if (plain.length < 2) return null;
    // find a plain cell with room to branch perpendicular
    let split = null, branchDir = null;
    const order = plain.slice().sort(() => rng() - 0.5);
    for (const c of order) {
      // determine the main beam's direction at this cell from its neighbours
      const perps = [0, 1, 2, 3];
      for (const d of perps) {
        const cx = c.x + DIRS[d][0], cy = c.y + DIRS[d][1];
        if (cx >= 0 && cy >= 0 && cx < w && cy < h && !occupied[cx + ',' + cy]) { split = c; branchDir = d; break; }
      }
      if (split) break;
    }
    if (!split) return null;
    // we need the main travel direction through `split` to compute orient
    const si = main.cells.findIndex(c => c.x === split.x && c.y === split.y);
    const prevC = si > 0 ? main.cells[si - 1] : source;
    const mainDir = prevC.x === split.x ? (split.y > prevC.y ? 2 : 0) : (split.x > prevC.x ? 1 : 3);
    if (branchDir % 2 === mainDir % 2) return null; // must be perpendicular
    level.splitters.push({ x: split.x, y: split.y, orient: mirrorFor(mainDir, branchDir) });
    occupied[split.x + ',' + split.y] = 'splitter';

    const sub = walk(occupied, w, h, split, branchDir, cfg.subTurns, rng);
    if (!sub) return null;
    sub.mirrors.forEach(m => level.solution.push(m));
    if (!decorate(sub, occupied, cfg.subTargets, cfg.colored, rng, level.targets, level.filters)) return null;
  }

  if (!decorate(main, occupied, cfg.targets, cfg.colored, rng, level.targets, level.filters)) return null;

  // scatter some decorative walls on free cells
  let free = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (!occupied[x + ',' + y]) free.push([x, y]);
  free = free.sort(() => rng() - 0.5).slice(0, cfg.walls);
  free.forEach(([x, y]) => { level.walls.push([x, y]); occupied[x + ',' + y] = 'wall'; });

  // budget = number of mirrors in the solution
  level.budget = level.solution.length;
  level.par = level.solution.reduce((s, m) => s + (m.orient === '/' ? 1 : 2), 0);

  // --- validate with the real engine ---
  const solved = Engine.simulate(level, level.solution);
  if (!solved.win) return null;
  const trivial = Engine.simulate(level, []);
  if (trivial.win) return null; // must require mirrors
  if (level.targets.length < cfg.targets) return null;

  return level;
}

function generate(cfg, count, startSeed) {
  const out = [];
  let seed = startSeed;
  let guard = 0;
  while (out.length < count) {
    if (++guard > 200000) throw new Error('generation stuck for ' + JSON.stringify(cfg));
    const lvl = tryBuild(cfg, seed++);
    if (lvl) out.push(lvl);
  }
  return out;
}

// --- world configs --------------------------------------------------------
const worlds = [
  { name: 'Awakening', levels: 8, base: { w: 7, h: 7, turns: 1, targets: 1, colored: false, splitter: false, walls: 2 },
    ramp: i => ({ turns: 1 + Math.floor(i / 2), targets: i >= 5 ? 2 : 1, walls: 2 + Math.floor(i / 3) }) },
  { name: 'Spectrum', levels: 8, base: { w: 8, h: 8, turns: 2, targets: 1, colored: true, splitter: false, walls: 3 },
    ramp: i => ({ turns: 2 + Math.floor(i / 3), targets: i >= 4 ? 2 : 1, walls: 3 + Math.floor(i / 4) }) },
  { name: 'Fracture', levels: 8, base: { w: 8, h: 8, turns: 2, targets: 1, colored: false, splitter: true, subTurns: 1, subTargets: 1, walls: 3 },
    ramp: i => ({ turns: 2 + Math.floor(i / 4), subTurns: 1 + Math.floor(i / 3), walls: 3 + Math.floor(i / 4) }) },
  { name: 'Convergence', levels: 8, base: { w: 9, h: 9, turns: 2, targets: 1, colored: true, splitter: true, subTurns: 1, subTargets: 1, walls: 4 },
    ramp: i => ({ turns: 2 + Math.floor(i / 3), subTurns: 1 + Math.floor(i / 4), walls: 4 + Math.floor(i / 3) }) },
];

const all = [];
let seedBase = 1000;
worlds.forEach((world, wi) => {
  for (let i = 0; i < world.levels; i++) {
    const cfg = Object.assign({}, world.base, world.ramp(i));
    const lvl = generate(cfg, 1, seedBase)[0];
    seedBase += 5000;
    lvl.id = all.length + 1;
    lvl.world = wi + 1;
    lvl.worldName = world.name;
    lvl.name = world.name + ' ' + (i + 1);
    all.push(lvl);
  }
});

const banner = '/* AUTO-GENERATED by tools/generate.js — do not edit by hand. */\n';
const body = '(function (root, factory) {\n' +
  '  if (typeof module !== "undefined" && module.exports) module.exports = factory();\n' +
  '  else root.LEVELS = factory();\n' +
  '}(typeof self !== "undefined" ? self : this, function () {\n' +
  '  return ' + JSON.stringify(all, null, 0) + ';\n' +
  '}));\n';

fs.writeFileSync(path.join(__dirname, '..', 'js', 'levels.js'), banner + body);
console.log('Generated', all.length, 'levels.');
all.forEach(l => console.log(`  #${l.id} ${l.name}  ${l.w}x${l.h}  mirrors:${l.budget} targets:${l.targets.length}` +
  (l.splitters.length ? ' splitter' : '') + (l.filters.length ? ' filters:' + l.filters.length : '')));
