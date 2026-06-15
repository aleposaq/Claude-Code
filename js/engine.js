/*
 * PRISM — beam simulation engine (pure, no DOM).
 * Usable in the browser (window.Engine) and in Node (module.exports)
 * so the same logic powers gameplay, validation and level generation.
 *
 * Grid coordinates: x = column (0..w-1, left→right), y = row (0..h-1, top→bottom).
 * Directions:  0 = up, 1 = right, 2 = down, 3 = left.
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else root.Engine = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // dx, dy for each direction.
  const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]];

  // Reflect a travelling direction off a mirror of the given orientation.
  //   "/"  swaps  up<->right  and  down<->left
  //   "\\" swaps  up<->left   and  down<->right
  function reflect(orient, dir) {
    return orient === '/' ? [1, 0, 3, 2][dir] : [3, 2, 1, 0][dir];
  }

  // Given an incoming and desired outgoing direction, the mirror that does it.
  function mirrorFor(inDir, outDir) {
    if ((inDir === 0 && outDir === 1) || (inDir === 1 && outDir === 0) ||
        (inDir === 2 && outDir === 3) || (inDir === 3 && outDir === 2)) return '/';
    return '\\';
  }

  // Build a fast lookup of every occupied cell from a level + the player's
  // placed mirrors. One object per cell; placed mirrors never overwrite a
  // fixed object.
  function buildMap(level, placed) {
    const m = {};
    const put = (x, y, o) => { m[x + ',' + y] = o; };
    (level.walls || []).forEach(([x, y]) => put(x, y, { type: 'wall' }));
    (level.sources || []).forEach(s => put(s.x, s.y, { type: 'source', dir: s.dir, color: s.color }));
    (level.targets || []).forEach(t => put(t.x, t.y, { type: 'target', color: t.color }));
    (level.filters || []).forEach(f => put(f.x, f.y, { type: 'filter', color: f.color }));
    (level.splitters || []).forEach(s => put(s.x, s.y, { type: 'splitter', orient: s.orient }));
    (level.fixedMirrors || []).forEach(s => put(s.x, s.y, { type: 'mirror', orient: s.orient, fixed: true }));
    (placed || []).forEach(p => { if (!m[p.x + ',' + p.y]) put(p.x, p.y, { type: 'mirror', orient: p.orient }); });
    return m;
  }

  // Trace every beam through the grid.
  // Returns { segments, lit, win, targetStatus } where segments is a list of
  // line pieces (in cell units) for rendering, lit maps "x,y" -> Set(colors).
  function simulate(level, placed) {
    const w = level.w, h = level.h, map = buildMap(level, placed);
    const at = (x, y) => map[x + ',' + y];
    const segments = [], lit = {}, visited = new Set(), stack = [];

    (level.sources || []).forEach(s => stack.push({ x: s.x, y: s.y, dir: s.dir, color: s.color }));

    let guard = 0;
    while (stack.length) {
      if (++guard > 200000) break; // safety against pathological loops
      const b = stack.pop();
      const dx = DIRS[b.dir][0], dy = DIRS[b.dir][1];
      const nx = b.x + dx, ny = b.y + dy;

      // Leaving the grid: draw a short stub to the edge.
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) {
        segments.push({ x1: b.x + .5, y1: b.y + .5, x2: b.x + .5 + dx * .5, y2: b.y + .5 + dy * .5, color: b.color });
        continue;
      }
      const o = at(nx, ny);
      // Walls and sources block the beam.
      if (o && (o.type === 'wall' || o.type === 'source')) {
        segments.push({ x1: b.x + .5, y1: b.y + .5, x2: b.x + .5 + dx * .5, y2: b.y + .5 + dy * .5, color: b.color });
        continue;
      }
      const key = nx + ',' + ny + ',' + b.dir + ',' + b.color;
      if (visited.has(key)) continue;
      visited.add(key);
      segments.push({ x1: b.x + .5, y1: b.y + .5, x2: nx + .5, y2: ny + .5, color: b.color });

      if (!o) {
        stack.push({ x: nx, y: ny, dir: b.dir, color: b.color });
      } else if (o.type === 'target') {
        (lit[nx + ',' + ny] = lit[nx + ',' + ny] || new Set()).add(b.color);
        stack.push({ x: nx, y: ny, dir: b.dir, color: b.color }); // pass through
      } else if (o.type === 'filter') {
        stack.push({ x: nx, y: ny, dir: b.dir, color: o.color });
      } else if (o.type === 'mirror') {
        stack.push({ x: nx, y: ny, dir: reflect(o.orient, b.dir), color: b.color });
      } else if (o.type === 'splitter') {
        stack.push({ x: nx, y: ny, dir: b.dir, color: b.color });                       // straight through
        stack.push({ x: nx, y: ny, dir: reflect(o.orient, b.dir), color: b.color });    // and reflected
      }
    }

    let win = true;
    const targetStatus = [];
    (level.targets || []).forEach(t => {
      const s = lit[t.x + ',' + t.y];
      const ok = !!(s && s.has(t.color));
      if (!ok) win = false;
      targetStatus.push({ x: t.x, y: t.y, color: t.color, lit: ok });
    });

    return { segments, lit, win, targetStatus };
  }

  return { simulate, reflect, mirrorFor, buildMap, DIRS };
}));
