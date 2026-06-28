/*
 * PRISM v2 — beam simulation engine for the "build a machine, then FIRE it" redesign.
 * Browser: window.Engine2.  Node: module.exports.
 *
 * What's new vs v1:
 *   - The PLAYER places a toolbox of pieces (mirror, splitter, prism, filter),
 *     not just mirrors. Pieces arrive via `placed` exactly like the old mirrors.
 *   - STATE: switch-crystals latch open linked doors. The sim is resolved as a
 *     monotone fixpoint over the open-door set, so it stays deterministic and
 *     terminating (doors only ever open, never re-close within a FIRE).
 *   - Commit model: nothing simulates until you FIRE. This file just computes the
 *     result of a firing; the controller decides when to call it.
 *
 * COLOUR — additive RGB bitmask: R=4 G=2 B=1; Y=6 C=3 M=5 W=7; dead=0.
 * Grid: x=col (0..w-1), y=row (0..h-1). Directions 0=up,1=right,2=down,3=left.
 *
 * Object behaviour on a travelling beam {mask}:
 *   wall / source ............. block
 *   void ...................... block AND fail the firing
 *   door (closed) ............. block ;  door (open) .......... pass
 *   teleporter ................ exit its pair, same heading (explicit pairing)
 *   filter (R/G/B) ............ mask &= colour ; 0 = beam dies (subtractive)
 *   mirror (/ \) .............. reflect
 *   splitter (/ \) ............ straight + reflected
 *   prism (/ \) ............... disperse: G straight; '/' sends R left & B right,
 *                               '\' sends R right & B left
 *   switch .................... accumulate; passes through; when its mask matches
 *                               EXACTLY it latches every door sharing its id open
 *   target ................... accumulate; passes through; win on EXACT match
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else root.Engine2 = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]];
  function reflect(orient, dir) { return orient === '/' ? [1, 0, 3, 2][dir] : [3, 2, 1, 0][dir]; }

  // Build the cell map for ONE firing, given which doors are currently open.
  function buildMap(level, placed, openDoors) {
    const m = {};
    const put = (x, y, o) => { m[x + ',' + y] = o; };
    (level.walls || []).forEach(([x, y]) => put(x, y, { type: 'wall' }));
    (level.voids || []).forEach(([x, y]) => put(x, y, { type: 'void' }));
    (level.sources || []).forEach(s => put(s.x, s.y, { type: 'source' }));
    (level.targets || []).forEach(t => put(t.x, t.y, { type: 'target', mask: t.mask }));
    (level.switches || []).forEach(s => put(s.x, s.y, { type: 'switch', mask: s.mask, door: s.door }));
    (level.doors || []).forEach(d => put(d.x, d.y, { type: 'door', door: d.door, open: openDoors.has(d.door) }));
    (level.teleporters || []).forEach(t => put(t.x, t.y, { type: 'teleporter', pair: t.pair }));
    (level.fixed || []).forEach(p => put(p.x, p.y, Object.assign({ fixed: true }, p)));
    (placed || []).forEach(p => { if (!m[p.x + ',' + p.y]) put(p.x, p.y, Object.assign({}, p)); });
    return m;
  }

  // Index teleporters by pair id so a beam can find its exit.
  function teleIndex(level) {
    const idx = {};
    (level.teleporters || []).forEach(t => { (idx[t.pair] = idx[t.pair] || []).push(t); });
    return idx;
  }

  // Propagate every source beam through a FIXED door configuration (one pass).
  function propagate(level, map, tele) {
    const w = level.w, h = level.h;
    const at = (x, y) => map[x + ',' + y];
    const segments = [], lit = {}, switchLit = {}, visited = new Set(), stack = [];
    let voidHit = false;

    (level.sources || []).forEach(s => stack.push({ x: s.x, y: s.y, dir: s.dir, mask: s.mask == null ? 7 : s.mask }));
    const emit = (x, y, dir, mask) => { if (mask) stack.push({ x, y, dir, mask }); };
    const stub = (b, dx, dy) => segments.push({ x1: b.x + .5, y1: b.y + .5, x2: b.x + .5 + dx * .5, y2: b.y + .5 + dy * .5, mask: b.mask });

    let guard = 0;
    while (stack.length) {
      if (++guard > 400000) break;
      const b = stack.pop();
      if (!b.mask) continue;
      const dx = DIRS[b.dir][0], dy = DIRS[b.dir][1];
      const nx = b.x + dx, ny = b.y + dy;
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) { stub(b, dx, dy); continue; }

      const key = nx + ',' + ny + ',' + b.dir + ',' + b.mask;
      if (visited.has(key)) continue;
      visited.add(key);

      const o = at(nx, ny);
      const blocked = o && (o.type === 'wall' || o.type === 'source' || (o.type === 'door' && !o.open));
      if (blocked) { stub(b, dx, dy); continue; }
      if (o && o.type === 'void') { voidHit = true; stub(b, dx, dy); continue; }

      // beam genuinely enters the next cell
      segments.push({ x1: b.x + .5, y1: b.y + .5, x2: nx + .5, y2: ny + .5, mask: b.mask });

      if (!o || (o.type === 'door' && o.open)) { emit(nx, ny, b.dir, b.mask); }
      else if (o.type === 'target') { lit[nx + ',' + ny] = (lit[nx + ',' + ny] || 0) | b.mask; emit(nx, ny, b.dir, b.mask); }
      else if (o.type === 'switch') { switchLit[nx + ',' + ny] = (switchLit[nx + ',' + ny] || 0) | b.mask; emit(nx, ny, b.dir, b.mask); }
      else if (o.type === 'filter') emit(nx, ny, b.dir, b.mask & o.color);
      else if (o.type === 'mirror') emit(nx, ny, reflect(o.orient, b.dir), b.mask);
      else if (o.type === 'splitter') { emit(nx, ny, b.dir, b.mask); emit(nx, ny, reflect(o.orient, b.dir), b.mask); }
      else if (o.type === 'prism') {
        if (b.mask & 4) emit(nx, ny, (b.dir + (o.orient === '/' ? 3 : 1)) % 4, 4); // red
        if (b.mask & 2) emit(nx, ny, b.dir, 2);                                    // green straight
        if (b.mask & 1) emit(nx, ny, (b.dir + (o.orient === '/' ? 1 : 3)) % 4, 1); // blue
      } else if (o.type === 'teleporter') {
        const pair = (tele[o.pair] || []).filter(t => !(t.x === nx && t.y === ny))[0];
        if (pair) emit(pair.x, pair.y, b.dir, b.mask); // exit the partner, same heading
      }
    }
    return { segments, lit, switchLit, voidHit };
  }

  // Resolve a whole firing: iterate the monotone door-open set to a fixpoint.
  function simulate(level, placed) {
    const tele = teleIndex(level);
    const doors = level.doors || [];
    const switches = level.switches || [];
    const openDoors = new Set();
    let sim;
    const maxIter = doors.length + 2;
    for (let i = 0; i < maxIter; i++) {
      sim = propagate(level, buildMap(level, placed, openDoors), tele);
      let grew = false;
      switches.forEach(s => {
        if ((sim.switchLit[s.x + ',' + s.y] || 0) === s.mask && !openDoors.has(s.door)) {
          openDoors.add(s.door); grew = true; // latch: stays open for the rest of the firing
        }
      });
      if (!grew) break;
    }

    const targetStatus = [];
    let win = !sim.voidHit;
    (level.targets || []).forEach(t => {
      const got = sim.lit[t.x + ',' + t.y] || 0;
      const ok = got === t.mask;
      if (!ok) win = false;
      targetStatus.push({ x: t.x, y: t.y, mask: t.mask, got: got, lit: ok });
    });
    const switchStatus = switches.map(s => ({ x: s.x, y: s.y, mask: s.mask, door: s.door,
      got: sim.switchLit[s.x + ',' + s.y] || 0, on: (sim.switchLit[s.x + ',' + s.y] || 0) === s.mask }));

    return { segments: sim.segments, lit: sim.lit, win, voidHit: sim.voidHit,
      targetStatus, switchStatus, openDoors: openDoors };
  }

  return { simulate, propagate, buildMap, reflect, teleIndex, DIRS };
}));
