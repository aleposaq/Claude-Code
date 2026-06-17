/*
 * PRISM — beam simulation engine (pure, no DOM).
 * Usable in the browser (window.Engine) and in Node (module.exports).
 *
 * Grid: x = column (0..w-1, left→right), y = row (0..h-1, top→bottom).
 * Directions:  0 = up, 1 = right, 2 = down, 3 = left.
 *
 * COLOUR MODEL — additive RGB bitmask:
 *     R = 4 (100)   G = 2 (010)   B = 1 (001)
 *     Y = 6 (R|G)   C = 3 (G|B)   M = 5 (R|B)   W = 7 (R|G|B)   dead = 0
 * A crystal accumulates the OR of every beam that reaches it and is satisfied
 * only when that combined mask EXACTLY equals what it asks for. So secondary
 * colours must be MIXED from separate beams, and stray light contaminates.
 *
 * Object effects on a travelling beam {mask}:
 *   wall / source ......... block
 *   gel (filter R/G/B) .... mask &= gel ; if 0 the beam dies (subtractive)
 *   bleach ................ mask = 7 (white) again
 *   mirror / fixed mirror . reflect
 *   splitter .............. straight + reflected, same mask
 *   prism ................. disperse: R bends left, G straight, B bends right
 *   target ................ accumulate; beam passes through
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else root.Engine = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]];

  function reflect(orient, dir) {
    return orient === '/' ? [1, 0, 3, 2][dir] : [3, 2, 1, 0][dir];
  }
  function mirrorFor(inDir, outDir) {
    if ((inDir === 0 && outDir === 1) || (inDir === 1 && outDir === 0) ||
        (inDir === 2 && outDir === 3) || (inDir === 3 && outDir === 2)) return '/';
    return '\\';
  }

  function buildMap(level, placed) {
    const m = {};
    const put = (x, y, o) => { m[x + ',' + y] = o; };
    (level.walls || []).forEach(([x, y]) => put(x, y, { type: 'wall' }));
    (level.sources || []).forEach(s => put(s.x, s.y, { type: 'source', dir: s.dir, mask: s.mask }));
    (level.targets || []).forEach(t => put(t.x, t.y, { type: 'target', mask: t.mask }));
    (level.filters || []).forEach(f => put(f.x, f.y, { type: 'filter', mask: f.mask }));
    (level.bleaches || []).forEach(p => put(p.x, p.y, { type: 'bleach' }));
    (level.prisms || []).forEach(p => put(p.x, p.y, { type: 'prism' }));
    (level.splitters || []).forEach(s => put(s.x, s.y, { type: 'splitter', orient: s.orient }));
    (level.gates || []).forEach(g => put(g.x, g.y, { type: 'gate', mask: g.mask }));
    (level.fixedMirrors || []).forEach(s => put(s.x, s.y, { type: 'mirror', orient: s.orient, fixed: true }));
    (placed || []).forEach(p => { if (!m[p.x + ',' + p.y]) put(p.x, p.y, { type: 'mirror', orient: p.orient }); });
    return m;
  }

  function simulate(level, placed) {
    const w = level.w, h = level.h, map = buildMap(level, placed);
    const at = (x, y) => map[x + ',' + y];
    const segments = [], lit = {}, visited = new Set(), stack = [];

    (level.sources || []).forEach(s => stack.push({ x: s.x, y: s.y, dir: s.dir, mask: s.mask }));

    const emit = (x, y, dir, mask) => { if (mask) stack.push({ x, y, dir, mask }); };

    let guard = 0;
    while (stack.length) {
      if (++guard > 400000) break;
      const b = stack.pop();
      if (!b.mask) continue;
      const dx = DIRS[b.dir][0], dy = DIRS[b.dir][1];
      const nx = b.x + dx, ny = b.y + dy;

      if (nx < 0 || ny < 0 || nx >= w || ny >= h) {
        segments.push({ x1: b.x + .5, y1: b.y + .5, x2: b.x + .5 + dx * .5, y2: b.y + .5 + dy * .5, mask: b.mask });
        continue;
      }
      const o = at(nx, ny);
      if (o && (o.type === 'wall' || o.type === 'source')) {
        segments.push({ x1: b.x + .5, y1: b.y + .5, x2: b.x + .5 + dx * .5, y2: b.y + .5 + dy * .5, mask: b.mask });
        continue;
      }
      // coloured gate: only beams that exactly match its colour pass through.
      if (o && o.type === 'gate' && b.mask !== o.mask) {
        segments.push({ x1: b.x + .5, y1: b.y + .5, x2: b.x + .5 + dx * .5, y2: b.y + .5 + dy * .5, mask: b.mask });
        continue;
      }

      const key = nx + ',' + ny + ',' + b.dir + ',' + b.mask;
      if (visited.has(key)) continue;
      visited.add(key);
      segments.push({ x1: b.x + .5, y1: b.y + .5, x2: nx + .5, y2: ny + .5, mask: b.mask });

      if (!o || o.type === 'gate') {
        emit(nx, ny, b.dir, b.mask);
      } else if (o.type === 'target') {
        lit[nx + ',' + ny] = (lit[nx + ',' + ny] || 0) | b.mask;
        emit(nx, ny, b.dir, b.mask);
      } else if (o.type === 'filter') {
        emit(nx, ny, b.dir, b.mask & o.mask);          // subtractive; may die
      } else if (o.type === 'bleach') {
        emit(nx, ny, b.dir, 7);                          // reset to white
      } else if (o.type === 'mirror') {
        emit(nx, ny, reflect(o.orient, b.dir), b.mask);
      } else if (o.type === 'splitter') {
        emit(nx, ny, b.dir, b.mask);
        emit(nx, ny, reflect(o.orient, b.dir), b.mask);
      } else if (o.type === 'prism') {
        if (b.mask & 4) emit(nx, ny, (b.dir + 3) % 4, 4); // red bends left
        if (b.mask & 2) emit(nx, ny, b.dir, 2);           // green straight
        if (b.mask & 1) emit(nx, ny, (b.dir + 1) % 4, 1); // blue bends right
      }
    }

    let win = true;
    const targetStatus = [];
    (level.targets || []).forEach(t => {
      const got = lit[t.x + ',' + t.y] || 0;
      const ok = got === t.mask;
      if (!ok) win = false;
      targetStatus.push({ x: t.x, y: t.y, mask: t.mask, got: got, lit: ok });
    });

    return { segments, lit, win, targetStatus };
  }

  return { simulate, reflect, mirrorFor, buildMap, DIRS };
}));
