/* Shared ASCII -> level parser for the build + trace tools. */
const DIR = { '>': 1, '<': 3, '^': 0, 'v': 2 };
const MASK = { r: 4, g: 2, b: 1, y: 6, c: 3, m: 5, w: 7 };
const WORLD_NAMES = { 1: 'Reflection', 2: 'Spectrum', 3: 'Fracture', 4: 'Alchemy', 5: 'Dispersion', 6: 'Convergence' };

function parse(design) {
  const grid = design.grid;
  const h = grid.length, w = grid[0].length;
  const L = { w, h, sources: [], targets: [], walls: [], filters: [], bleaches: [], prisms: [], splitters: [], gates: [], fixedMirrors: [] };
  for (let y = 0; y < h; y++) {
    if (grid[y].length !== w) throw new Error(`${design.name}: row ${y} width ${grid[y].length} != ${w}`);
    for (let x = 0; x < w; x++) {
      const c = grid[y][x];
      if (c === '.') continue;
      else if (c === '#') L.walls.push([x, y]);
      else if ('><^v'.includes(c)) L.sources.push({ x, y, dir: DIR[c], mask: 7 });
      else if ('rgbycmw'.includes(c)) L.targets.push({ x, y, mask: MASK[c] });
      else if (c === 'R') L.filters.push({ x, y, mask: 4 });
      else if (c === 'G') L.filters.push({ x, y, mask: 2 });
      else if (c === 'B') L.filters.push({ x, y, mask: 1 });
      else if (c === '*') L.bleaches.push({ x, y });
      else if (c === 'P') L.prisms.push({ x, y });
      else if (c === 'S') L.splitters.push({ x, y, orient: '/' });
      else if (c === 'Z') L.splitters.push({ x, y, orient: '\\' });
      else if (c === '/' || c === '\\') L.fixedMirrors.push({ x, y, orient: c });
      else throw new Error(`${design.name}: unknown char '${c}' at ${x},${y}`);
    }
  }
  return L;
}

module.exports = { parse, DIR, MASK, WORLD_NAMES };
