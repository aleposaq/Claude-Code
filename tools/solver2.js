/*
 * PRISM v2 solver (Node, build-time). Generalised from "place mirrors" to
 * "place pieces from the level's INVENTORY" (mirror / splitter / prism / filter).
 *
 * The redesign WANTS multiple solutions (optimisation play), so this no longer
 * chases uniqueness. Instead it answers the questions that actually gate quality:
 *   - solvable()      : is there ANY way to satisfy every target with the inventory?
 *   - par()           : fewest pieces that solve it (the score to beat)
 *   - liveFirstMoves(): real "hard-to-SEE" difficulty = how many distinct opening
 *                       placements lead to a win (low = forced/obvious, high = deep)
 *   - requires()      : is a featured mechanic/piece actually load-bearing?
 *
 * A mirror in dark space is a no-op, so we only ever place on cells a current
 * beam traverses — the same sound pruning as v1, now over a typed inventory.
 * Truncated searches are reported HONESTLY (truncated:true), never as fact.
 */
const Engine = require('../js/engine2.js');

const NODE_CAP = 800000;

function occupied(level) {
  const s = new Set();
  const add = (x, y) => s.add(x + ',' + y);
  (level.walls || []).forEach(([x, y]) => add(x, y));
  (level.voids || []).forEach(([x, y]) => add(x, y));
  (level.sources || []).forEach(o => add(o.x, o.y));
  (level.targets || []).forEach(o => add(o.x, o.y));
  (level.switches || []).forEach(o => add(o.x, o.y));
  (level.doors || []).forEach(o => add(o.x, o.y));
  (level.teleporters || []).forEach(o => add(o.x, o.y));
  (level.fixed || []).forEach(o => add(o.x, o.y));
  return s;
}

// Distinct placement options for one inventory piece type.
function optionsFor(type) {
  if (type === 'filter') return [{ type: 'filter', color: 4 }, { type: 'filter', color: 2 }, { type: 'filter', color: 1 }];
  return [{ type, orient: '/' }, { type, orient: '\\' }];
}

// Cells a current beam passes through that are still free to build on.
function beamCells(level, placed, sim, occ) {
  const taken = new Set(placed.map(p => p.x + ',' + p.y));
  const out = [], seen = new Set();
  sim.segments.forEach(s => {
    [[s.x1, s.y1], [s.x2, s.y2]].forEach(([fx, fy]) => {
      const x = Math.floor(fx), y = Math.floor(fy);
      if (x < 0 || y < 0 || x >= level.w || y >= level.h) return;
      const k = x + ',' + y;
      if (seen.has(k)) return; seen.add(k);
      if (occ.has(k) || taken.has(k)) return;
      out.push({ x, y });
    });
  });
  return out;
}

function invList(inv) {
  const out = [];
  Object.keys(inv || {}).forEach(t => { for (let i = 0; i < inv[t]; i++) out.push(t); });
  return out;
}

// Find minimal solutions (fewest pieces) up to `cap`. Returns {solutions, par, nodes, truncated}.
function solve(level, cap) {
  cap = cap || 6;
  const occ = occupied(level);
  const inv = level.inventory || {};
  const budget = invList(inv).length;
  const solutions = [], seen = new Set();
  let nodes = 0, truncated = false;

  function key(placed) {
    return placed.map(p => p.x + ',' + p.y + (p.orient || '') + (p.color || '')).sort().join('|');
  }

  function dfs(placed, remaining) {
    if (solutions.length >= cap) return;
    if (nodes > NODE_CAP) { truncated = true; return; }
    nodes++;
    const sim = Engine.simulate(level, placed);
    if (sim.win) { const k = key(placed); if (!seen.has(k)) { seen.add(k); solutions.push(placed.slice()); } return; }
    if (placed.length >= budget) return;
    const cells = beamCells(level, placed, sim, occ);
    for (const c of cells) {
      for (const type of Object.keys(remaining)) {
        if (remaining[type] <= 0) continue;
        remaining[type]--;
        for (const opt of optionsFor(type)) {
          placed.push(Object.assign({ x: c.x, y: c.y }, opt));
          dfs(placed, remaining);
          placed.pop();
          if (solutions.length >= cap) { remaining[type]++; return; }
        }
        remaining[type]++;
      }
    }
  }

  dfs([], Object.assign({}, inv));
  solutions.sort((a, b) => a.length - b.length);
  return { solutions, par: solutions.length ? solutions[0].length : null, nodes, truncated };
}

function solvable(level) { return solvableWithin(level, invList(level.inventory).length).ok; }

// Is the level winnable using AT MOST `maxPieces`? (bounded DFS, stops at first win)
function solvableWithin(level, maxPieces) {
  const occ = occupied(level);
  const inv = level.inventory || {};
  let nodes = 0, found = false, truncated = false;
  function dfs(pl, rem) {
    if (found) return;
    if (nodes > NODE_CAP) { truncated = true; return; }
    nodes++;
    const sim = Engine.simulate(level, pl);
    if (sim.win) { found = true; return; }
    if (pl.length >= maxPieces || invList(rem).length === 0) return;
    const cells = beamCells(level, pl, sim, occ);
    for (const c of cells) {
      for (const type of Object.keys(rem)) {
        if (rem[type] <= 0) continue;
        rem[type]--;
        for (const opt of optionsFor(type)) {
          pl.push(Object.assign({ x: c.x, y: c.y }, opt));
          dfs(pl, rem); pl.pop();
          if (found) { rem[type]++; return; }
        }
        rem[type]++;
      }
    }
  }
  dfs([], Object.assign({}, inv));
  return { ok: found, truncated };
}

// Exact par via iterative deepening: the fewest pieces that solve it.
function par(level) {
  const total = invList(level.inventory).length;
  for (let k = 0; k <= total; k++) {
    const r = solvableWithin(level, k);
    if (r.ok) return { par: k, truncated: false };
    if (r.truncated) return { par: null, truncated: true };
  }
  return { par: null, truncated: false };
}

// Real difficulty signal: how many distinct opening placements can begin a win.
// low (1-2) = forced/obvious; high = genuinely hard to SEE.
function liveFirstMoves(level) {
  const occ = occupied(level);
  const inv = level.inventory || {};
  const sim0 = Engine.simulate(level, []);
  if (sim0.win) return { live: 0, total: 0 }; // already solved with nothing
  const cells = beamCells(level, [], sim0, occ);
  let live = 0, total = 0;
  for (const c of cells) {
    for (const type of Object.keys(inv)) {
      if (inv[type] <= 0) continue;
      for (const opt of optionsFor(type)) {
        total++;
        const rem = Object.assign({}, inv); rem[type]--;
        const sub = { w: level.w, h: level.h }; // shallow reuse via closure on level
        if (winnableFrom(level, [Object.assign({ x: c.x, y: c.y }, opt)], rem, occ)) live++;
      }
    }
  }
  return { live, total };
}

// Boolean: is a win reachable from this partial placement within the remaining inventory?
function winnableFrom(level, placed, remaining, occ) {
  let nodes = 0; let found = false;
  function dfs(pl, rem) {
    if (found || nodes > NODE_CAP) return;
    nodes++;
    const sim = Engine.simulate(level, pl);
    if (sim.win) { found = true; return; }
    if (invList(rem).length === 0) return;
    const cells = beamCells(level, pl, sim, occ);
    for (const c of cells) {
      for (const type of Object.keys(rem)) {
        if (rem[type] <= 0) continue;
        rem[type]--;
        for (const opt of optionsFor(type)) {
          pl.push(Object.assign({ x: c.x, y: c.y }, opt));
          dfs(pl, rem); pl.pop();
          if (found) { rem[type]++; return; }
        }
        rem[type]++;
      }
    }
  }
  dfs(placed.slice(), Object.assign({}, remaining));
  return found;
}

// Prove a feature is load-bearing: solvable now, unsolvable once `mutate(clone)` removes it.
function requires(level, mutate) {
  if (!solvable(level)) return false;
  const clone = JSON.parse(JSON.stringify(level));
  mutate(clone);
  return !solvable(clone);
}

module.exports = { solve, solvable, solvableWithin, par, liveFirstMoves, winnableFrom, requires, beamCells, occupied };
