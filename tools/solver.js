/*
 * PRISM — puzzle solver (Node, build-time). Used to GUARANTEE design quality:
 * it finds every minimal solution to a level so we can check a puzzle is
 * solvable, tight (few solutions), and that its featured mechanic is required.
 *
 * Key idea: a mirror only matters if a beam actually hits it. So we only ever
 * try placing a mirror on a cell the current beams travel through. After each
 * placement we re-simulate (the beam reshapes) and recurse. This explores just
 * the meaningful search space and finds all minimal solutions.
 */
const Engine = require('../js/engine.js');

// Cells (empty + placeable) that the current beams pass through.
function beamCells(level, placed) {
  const sim = Engine.simulate(level, placed);
  const fixed = Engine.buildMap(level, []);
  const occ = new Set(placed.map(p => p.x + ',' + p.y));
  const out = [];
  const seen = new Set();
  sim.segments.forEach(s => {
    [[s.x1, s.y1], [s.x2, s.y2]].forEach(([fx, fy]) => {
      const x = Math.floor(fx), y = Math.floor(fy);
      if (x < 0 || y < 0 || x >= level.w || y >= level.h) return;
      const k = x + ',' + y;
      if (seen.has(k)) return;
      seen.add(k);
      if (fixed[k]) return;           // a fixed object lives here
      if (occ.has(k)) return;         // we already placed a mirror here
      out.push({ x, y });
    });
  });
  return { sim, cells: out };
}

// Find minimal solutions using at most `budget` mirrors. Returns an array of
// solutions (each an array of {x,y,orient}); stops once `cap` are found.
function solve(level, budget, cap) {
  cap = cap || 6;
  const solutions = [];
  const seenSets = new Set();
  let nodes = 0;

  function key(placed) {
    return placed.map(p => p.x + ',' + p.y + p.orient).sort().join('|');
  }

  function dfs(placed) {
    if (solutions.length >= cap || nodes > 600000) return;
    nodes++;
    const { sim, cells } = beamCells(level, placed);
    if (sim.win) {
      const k = key(placed);
      if (!seenSets.has(k)) { seenSets.add(k); solutions.push(placed.slice()); }
      return; // minimal — don't extend a winning configuration
    }
    if (placed.length >= budget) return;
    for (const c of cells) {
      for (const orient of ['/', '\\']) {
        placed.push({ x: c.x, y: c.y, orient });
        dfs(placed);
        placed.pop();
        if (solutions.length >= cap) return;
      }
    }
  }

  dfs([]);
  // sort solutions by size then return
  solutions.sort((a, b) => a.length - b.length);
  solutions.nodes = nodes; // search effort — a proxy for how hard the solution is to FIND
  return solutions;
}

// True if the level is unsolvable without the given fixed feature removed
// (used to prove a splitter / filter / fixed-mirror is genuinely required).
function requires(level, featureKey, budget) {
  const clone = JSON.parse(JSON.stringify(level));
  clone[featureKey] = [];
  return solve(clone, budget, 1).length === 0;
}

module.exports = { solve, requires, beamCells };
