/*
 * PRISM — beam simulation engine (pure, no DOM).
 * Browser: window.Engine.  Node: module.exports.
 *
 * Grid: x = column (0..w-1), y = row (0..h-1). Directions 0=up,1=right,2=down,3=left.
 *
 * COLOUR — additive RGB bitmask: R=4 G=2 B=1; Y=6 C=3 M=5 W=7; dead=0.
 * A crystal ORs every beam at its cell and is satisfied on an EXACT match.
 *
 * Objects acting on a travelling beam {mask}:
 *   wall / source ......... block
 *   void .................. block AND fail the level if any beam reaches it
 *   gel (R/G/B) ........... mask &= gel ; 0 = beam dies (subtractive)
 *   bleach ................ mask = 7 (white)
 *   gate (coloured) ....... passes only a beam whose mask matches exactly; else blocks
 *   rotator ............... cycle colour channels R->G->B->R (direction unchanged)
 *   tinter (R/G/B) ........ ADD a primary to the beam (mask |= c) — additive injector
 *   mirror / fixed ........ reflect
 *   splitter .............. straight + reflected
 *   prism ................. disperse: R left, G straight, B right
 *   portal ................ teleport to its partner, same direction
 *   target ................ accumulate; beam passes through
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else root.Engine = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]];
  // rotate the 3-bit RGB mask: R(4)->G(2)->B(1)->R(4). White & black are fixed points.
  function rot(m) { return ((m & 6) >> 1) | ((m & 1) << 2); }
  function reflect(orient, dir) { return orient === '/' ? [1, 0, 3, 2][dir] : [3, 2, 1, 0][dir]; }
  function mirrorFor(inDir, outDir) {
    if ((inDir === 0 && outDir === 1) || (inDir === 1 && outDir === 0) ||
        (inDir === 2 && outDir === 3) || (inDir === 3 && outDir === 2)) return '/';
    return '\\';
  }

  function buildMap(level, placed) {
    const m = {};
    const put = (x, y, o) => { m[x + ',' + y] = o; };
    (level.walls || []).forEach(([x, y]) => put(x, y, { type: 'wall' }));
    (level.voids || []).forEach(([x, y]) => put(x, y, { type: 'void' }));
    (level.sources || []).forEach(s => put(s.x, s.y, { type: 'source', dir: s.dir, mask: s.mask }));
    (level.targets || []).forEach(t => put(t.x, t.y, { type: 'target', mask: t.mask }));
    (level.filters || []).forEach(f => put(f.x, f.y, { type: 'filter', mask: f.mask }));
    (level.bleaches || []).forEach(p => put(p.x, p.y, { type: 'bleach' }));
    (level.rotators || []).forEach(p => put(p.x, p.y, { type: 'rotator' }));
    (level.tinters || []).forEach(p => put(p.x, p.y, { type: 'tinter', mask: p.mask }));
    (level.gates || []).forEach(g => put(g.x, g.y, { type: 'gate', mask: g.mask }));
    (level.prisms || []).forEach(p => put(p.x, p.y, { type: 'prism' }));
    (level.splitters || []).forEach(s => put(s.x, s.y, { type: 'splitter', orient: s.orient }));
    (level.portals || []).forEach((p, i) => put(p.x, p.y, { type: 'portal', idx: i }));
    (level.fixedMirrors || []).forEach(s => put(s.x, s.y, { type: 'mirror', orient: s.orient, fixed: true }));
    (placed || []).forEach(p => { if (!m[p.x + ',' + p.y]) put(p.x, p.y, { type: 'mirror', orient: p.orient }); });
    return m;
  }

  function simulate(level, placed) {
    const w = level.w, h = level.h, map = buildMap(level, placed);
    const portals = level.portals || [];
    const at = (x, y) => map[x + ',' + y];
    const segments = [], lit = {}, visited = new Set(), stack = [];
    let voidHit = false;

    (level.sources || []).forEach(s => stack.push({ x: s.x, y: s.y, dir: s.dir, mask: s.mask }));
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
      const o = at(nx, ny);
      if (o && (o.type === 'wall' || o.type === 'source')) { stub(b, dx, dy); continue; }
      if (o && o.type === 'void') { voidHit = true; stub(b, dx, dy); continue; }
      if (o && o.type === 'gate' && b.mask !== o.mask) { stub(b, dx, dy); continue; }

      const key = nx + ',' + ny + ',' + b.dir + ',' + b.mask;
      if (visited.has(key)) continue;
      visited.add(key);
      segments.push({ x1: b.x + .5, y1: b.y + .5, x2: nx + .5, y2: ny + .5, mask: b.mask });

      if (!o || o.type === 'gate') emit(nx, ny, b.dir, b.mask);
      else if (o.type === 'target') { lit[nx + ',' + ny] = (lit[nx + ',' + ny] || 0) | b.mask; emit(nx, ny, b.dir, b.mask); }
      else if (o.type === 'filter') emit(nx, ny, b.dir, b.mask & o.mask);
      else if (o.type === 'bleach') emit(nx, ny, b.dir, 7);
      else if (o.type === 'rotator') emit(nx, ny, b.dir, rot(b.mask));
      else if (o.type === 'tinter') emit(nx, ny, b.dir, b.mask | o.mask);
      else if (o.type === 'mirror') emit(nx, ny, reflect(o.orient, b.dir), b.mask);
      else if (o.type === 'splitter') { emit(nx, ny, b.dir, b.mask); emit(nx, ny, reflect(o.orient, b.dir), b.mask); }
      else if (o.type === 'prism') {
        if (b.mask & 4) emit(nx, ny, (b.dir + 3) % 4, 4);
        if (b.mask & 2) emit(nx, ny, b.dir, 2);
        if (b.mask & 1) emit(nx, ny, (b.dir + 1) % 4, 1);
      } else if (o.type === 'portal') {
        const partner = portals[o.idx ^ 1];
        if (partner) emit(partner.x, partner.y, b.dir, b.mask); // exit the paired portal
      }
    }

    let win = !voidHit;
    const targetStatus = [];
    (level.targets || []).forEach(t => {
      const got = lit[t.x + ',' + t.y] || 0;
      const ok = got === t.mask;
      if (!ok) win = false;
      targetStatus.push({ x: t.x, y: t.y, mask: t.mask, got: got, lit: ok });
    });
    return { segments, lit, win, targetStatus, voidHit };
  }

  return { simulate, reflect, mirrorFor, buildMap, DIRS, rot };
}));
