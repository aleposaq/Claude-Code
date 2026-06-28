/*
 * PRISM v2 curriculum. 5 worlds x 10 levels. Each world has a distinct theme and
 * teaches a mechanic family; difficulty is tuned by live-decision count (hard to
 * SEE, not long) and optimization (spare inventory, a par to beat).
 *   W1 Foundry · W2 Prism Coast · W3 Switchyard · W4 Wormworks · W5 Crucible
 * Validate/emit: tools/build2.js   debug: tools/check2.js
 */
module.exports = [
  // ===================== WORLD 1 — FOUNDRY (learn the toolbox) =====================
  { world: 1, name: 'Reflect', w: 5, h: 5,
    sources: [{ x: 0, y: 2, dir: 1 }], targets: [{ x: 4, y: 4, mask: 7 }],
    inventory: { mirror: 1 } },

  { world: 1, name: 'The Long Way', w: 5, h: 5,
    sources: [{ x: 0, y: 0, dir: 1 }], targets: [{ x: 0, y: 4, mask: 7 }],
    inventory: { mirror: 2 } },

  { world: 1, name: 'Detour', w: 5, h: 5,
    sources: [{ x: 0, y: 0, dir: 1 }], walls: [[2, 0], [2, 1]], targets: [{ x: 4, y: 2, mask: 7 }],
    inventory: { mirror: 3 } },

  { world: 1, name: 'Fork', w: 5, h: 5,
    sources: [{ x: 0, y: 2, dir: 1 }], targets: [{ x: 4, y: 2, mask: 7 }, { x: 3, y: 4, mask: 7 }],
    inventory: { splitter: 1, mirror: 2 } },

  { world: 1, name: 'Spectrum', w: 5, h: 5,
    sources: [{ x: 0, y: 2, dir: 1 }], targets: [{ x: 2, y: 0, mask: 4 }, { x: 4, y: 2, mask: 2 }, { x: 2, y: 4, mask: 1 }],
    inventory: { prism: 1 } },

  { world: 1, name: 'Tint', w: 5, h: 5,
    sources: [{ x: 0, y: 2, dir: 1 }], targets: [{ x: 4, y: 4, mask: 4 }],
    inventory: { filter: 1, mirror: 1 } },

  { world: 1, name: 'Painted Fork', w: 5, h: 5,
    sources: [{ x: 0, y: 2, dir: 1 }], targets: [{ x: 4, y: 2, mask: 7 }, { x: 3, y: 4, mask: 4 }],
    inventory: { splitter: 1, filter: 1, mirror: 1 } },

  { world: 1, name: 'Twin Tint', w: 5, h: 5,
    sources: [{ x: 0, y: 2, dir: 1 }], targets: [{ x: 4, y: 0, mask: 4 }, { x: 4, y: 4, mask: 1 }],
    inventory: { splitter: 1, mirror: 2, filter: 2 } },

  { world: 1, name: 'Crossroads', w: 6, h: 5,
    sources: [{ x: 0, y: 2, dir: 1 }], targets: [{ x: 5, y: 1, mask: 7 }, { x: 5, y: 3, mask: 7 }],
    inventory: { splitter: 1, mirror: 3 } },

  { world: 1, name: 'Assembly', w: 6, h: 5,
    sources: [{ x: 0, y: 2, dir: 1 }], targets: [{ x: 2, y: 0, mask: 4 }, { x: 5, y: 2, mask: 2 }, { x: 2, y: 4, mask: 1 }],
    inventory: { prism: 1, mirror: 3, splitter: 1, filter: 2 } },

  // ===================== WORLD 2 — PRISM COAST (colour & mixing) =====================
  { world: 2, name: 'Refract', w: 5, h: 5,
    sources: [{ x: 0, y: 2, dir: 1 }], targets: [{ x: 0, y: 0, mask: 4 }, { x: 0, y: 4, mask: 1 }],
    inventory: { prism: 1, mirror: 2 } },

  { world: 2, name: 'Pure Hue', w: 5, h: 5,
    sources: [{ x: 0, y: 2, dir: 1 }], targets: [{ x: 4, y: 0, mask: 2 }],
    inventory: { filter: 1, mirror: 2 } },

  { world: 2, name: 'Forge Yellow', w: 5, h: 5,
    sources: [{ x: 0, y: 2, dir: 1 }], targets: [{ x: 4, y: 2, mask: 6 }],
    inventory: { splitter: 1, filter: 2, mirror: 2 } },

  { world: 2, name: 'Forge Cyan', w: 5, h: 5,
    sources: [{ x: 2, y: 0, dir: 2 }], targets: [{ x: 2, y: 4, mask: 3 }],
    inventory: { splitter: 1, filter: 2, mirror: 2 } },

  { world: 2, name: 'Forge Magenta', w: 5, h: 5,
    sources: [{ x: 0, y: 2, dir: 1 }], walls: [[3, 2]], targets: [{ x: 4, y: 2, mask: 5 }],
    inventory: { prism: 1, mirror: 4 } },

  { world: 2, name: 'No Spill', w: 5, h: 5,
    sources: [{ x: 0, y: 2, dir: 1 }], targets: [{ x: 4, y: 0, mask: 6 }, { x: 2, y: 4, mask: 1 }],
    inventory: { prism: 1, mirror: 3 } },

  { world: 2, name: 'Prismatic', w: 6, h: 5,
    sources: [{ x: 0, y: 2, dir: 1 }], targets: [{ x: 0, y: 0, mask: 4 }, { x: 5, y: 2, mask: 2 }, { x: 0, y: 4, mask: 1 }],
    inventory: { prism: 1, mirror: 3 } },

  { world: 2, name: 'Wavebreak', w: 6, h: 5,
    sources: [{ x: 0, y: 2, dir: 1 }], walls: [[4, 1], [4, 2]],
    targets: [{ x: 2, y: 0, mask: 4 }, { x: 5, y: 4, mask: 2 }, { x: 2, y: 4, mask: 1 }],
    inventory: { prism: 1, mirror: 3 } },

  { world: 2, name: 'Coast Maze', w: 6, h: 6,
    sources: [{ x: 0, y: 0, dir: 1 }], walls: [[2, 0], [2, 1], [2, 2], [4, 2], [4, 3], [4, 4]],
    targets: [{ x: 5, y: 5, mask: 4 }], inventory: { filter: 1, mirror: 4 } },

  { world: 2, name: 'Spectrum Tide', w: 7, h: 5,
    sources: [{ x: 0, y: 2, dir: 1 }], walls: [[3, 1], [3, 3]],
    targets: [{ x: 6, y: 0, mask: 4 }, { x: 6, y: 2, mask: 2 }, { x: 6, y: 4, mask: 1 }],
    inventory: { prism: 1, mirror: 4 } },

  // ===================== WORLD 3 — SWITCHYARD (sequencing) =====================
  { world: 3, name: 'Power the Door', w: 5, h: 5,
    sources: [{ x: 0, y: 2, dir: 1 }], targets: [{ x: 4, y: 2, mask: 7 }],
    doors: [{ x: 3, y: 2, door: 'A' }], switches: [{ x: 2, y: 4, mask: 7, door: 'A' }],
    inventory: { splitter: 1 } },

  { world: 3, name: 'Red Key', w: 5, h: 5,
    sources: [{ x: 0, y: 2, dir: 1 }], targets: [{ x: 4, y: 2, mask: 4 }],
    doors: [{ x: 3, y: 2, door: 'A' }], switches: [{ x: 2, y: 4, mask: 4, door: 'A' }],
    inventory: { filter: 1, splitter: 1 } },

  { world: 3, name: 'Sentinel', w: 5, h: 5,
    sources: [{ x: 0, y: 2, dir: 1 }], targets: [{ x: 4, y: 2, mask: 7 }],
    doors: [{ x: 3, y: 2, door: 'A' }], switches: [{ x: 0, y: 4, mask: 7, door: 'A' }],
    inventory: { splitter: 1, mirror: 2 } },

  { world: 3, name: 'Green Key', w: 5, h: 5,
    sources: [{ x: 0, y: 2, dir: 1 }], targets: [{ x: 4, y: 2, mask: 2 }],
    doors: [{ x: 3, y: 2, door: 'A' }], switches: [{ x: 2, y: 0, mask: 2, door: 'A' }],
    inventory: { filter: 1, splitter: 1 } },

  { world: 3, name: 'Long Circuit', w: 6, h: 5,
    sources: [{ x: 0, y: 2, dir: 1 }], targets: [{ x: 5, y: 2, mask: 7 }],
    doors: [{ x: 4, y: 2, door: 'A' }], switches: [{ x: 1, y: 4, mask: 7, door: 'A' }],
    inventory: { splitter: 1, mirror: 2 } },

  { world: 3, name: 'Prism Key', w: 5, h: 5,
    sources: [{ x: 0, y: 2, dir: 1 }], targets: [{ x: 4, y: 2, mask: 2 }],
    doors: [{ x: 3, y: 2, door: 'A' }], switches: [{ x: 2, y: 0, mask: 4, door: 'A' }],
    inventory: { prism: 1, mirror: 2 } },

  { world: 3, name: 'Double Lock', w: 6, h: 5,
    sources: [{ x: 0, y: 2, dir: 1 }],
    doors: [{ x: 2, y: 2, door: 'B' }, { x: 4, y: 2, door: 'A' }],
    switches: [{ x: 1, y: 4, mask: 7, door: 'B' }, { x: 3, y: 2, mask: 7, door: 'A' }],
    targets: [{ x: 5, y: 2, mask: 7 }], inventory: { splitter: 1, mirror: 2 } },

  { world: 3, name: 'Cascade', w: 6, h: 5,
    sources: [{ x: 0, y: 2, dir: 1 }], doors: [{ x: 4, y: 2, door: 'A' }],
    switches: [{ x: 2, y: 0, mask: 4, door: 'A' }], targets: [{ x: 5, y: 2, mask: 2 }, { x: 2, y: 4, mask: 1 }],
    inventory: { prism: 1, mirror: 3 } },

  { world: 3, name: 'Switchback', w: 5, h: 6,
    sources: [{ x: 0, y: 0, dir: 1 }], walls: [[2, 0], [2, 1], [2, 3], [2, 4]],
    doors: [{ x: 2, y: 2, door: 'A' }], switches: [{ x: 0, y: 5, mask: 7, door: 'A' }],
    targets: [{ x: 4, y: 2, mask: 7 }], inventory: { splitter: 1, mirror: 3 } },

  { world: 3, name: 'Switchyard', w: 6, h: 5,
    sources: [{ x: 0, y: 2, dir: 1 }], doors: [{ x: 2, y: 2, door: 'B' }, { x: 4, y: 2, door: 'A' }],
    switches: [{ x: 1, y: 4, mask: 7, door: 'B' }, { x: 3, y: 0, mask: 4, door: 'A' }],
    targets: [{ x: 5, y: 2, mask: 4 }], inventory: { filter: 1, splitter: 1, mirror: 2 } },

  // ===================== WORLD 4 — WORMWORKS (portals) =====================
  { world: 4, name: 'Wormhole', w: 5, h: 5,
    sources: [{ x: 0, y: 2, dir: 1 }], walls: [[2, 0], [2, 1], [2, 2], [2, 3], [2, 4]],
    teleporters: [{ x: 1, y: 2, pair: 'p' }, { x: 3, y: 2, pair: 'p' }],
    targets: [{ x: 4, y: 0, mask: 7 }], inventory: { mirror: 1 } },

  { world: 4, name: 'Leap', w: 5, h: 5,
    sources: [{ x: 0, y: 0, dir: 1 }], walls: [[2, 0], [2, 1], [2, 2], [2, 3], [2, 4]],
    teleporters: [{ x: 1, y: 0, pair: 'p' }, { x: 3, y: 4, pair: 'p' }],
    targets: [{ x: 4, y: 2, mask: 7 }], inventory: { mirror: 1 } },

  { world: 4, name: 'Tinted Leap', w: 5, h: 5,
    sources: [{ x: 0, y: 2, dir: 1 }], walls: [[2, 0], [2, 1], [2, 2], [2, 3], [2, 4]],
    teleporters: [{ x: 1, y: 2, pair: 'p' }, { x: 3, y: 2, pair: 'p' }],
    targets: [{ x: 4, y: 4, mask: 4 }], inventory: { filter: 1, mirror: 1 } },

  { world: 4, name: 'Two Mouths', w: 5, h: 5,
    sources: [{ x: 0, y: 0, dir: 1 }],
    teleporters: [{ x: 4, y: 0, pair: 'p' }, { x: 0, y: 4, pair: 'p' }],
    targets: [{ x: 4, y: 2, mask: 7 }], inventory: { mirror: 1 } },

  { world: 4, name: 'Split Jump', w: 6, h: 5,
    sources: [{ x: 0, y: 2, dir: 1 }],
    teleporters: [{ x: 3, y: 2, pair: 'p' }, { x: 4, y: 0, pair: 'p' }],
    targets: [{ x: 5, y: 0, mask: 7 }, { x: 2, y: 4, mask: 7 }],
    inventory: { splitter: 1, mirror: 2 } },

  { world: 4, name: 'Through the Void', w: 5, h: 5,
    sources: [{ x: 0, y: 2, dir: 1 }], voids: [[2, 1], [2, 2], [2, 3]],
    teleporters: [{ x: 1, y: 2, pair: 'p' }, { x: 3, y: 2, pair: 'p' }],
    targets: [{ x: 4, y: 0, mask: 7 }], inventory: { mirror: 1 } },

  { world: 4, name: 'Prism Portal', w: 6, h: 5,
    sources: [{ x: 0, y: 2, dir: 1 }],
    teleporters: [{ x: 1, y: 2, pair: 'p' }, { x: 2, y: 0, pair: 'p' }],
    targets: [{ x: 5, y: 0, mask: 2 }, { x: 3, y: 4, mask: 1 }],
    inventory: { prism: 1, mirror: 2 } },

  { world: 4, name: 'Keyed Jump', w: 6, h: 5,
    sources: [{ x: 0, y: 2, dir: 1 }], doors: [{ x: 4, y: 2, door: 'A' }],
    switches: [{ x: 5, y: 0, mask: 7, door: 'A' }],
    teleporters: [{ x: 2, y: 2, pair: 'p' }, { x: 5, y: 2, pair: 'p' }],
    targets: [{ x: 5, y: 4, mask: 7 }], inventory: { splitter: 1, mirror: 2 } },

  { world: 4, name: 'Folded Space', w: 6, h: 6,
    sources: [{ x: 0, y: 0, dir: 1 }], walls: [[3, 0], [3, 1], [3, 2], [3, 4], [3, 5]],
    teleporters: [{ x: 2, y: 0, pair: 'p' }, { x: 4, y: 5, pair: 'p' }],
    targets: [{ x: 5, y: 5, mask: 7 }, { x: 2, y: 3, mask: 7 }],
    inventory: { splitter: 1, mirror: 3 } },

  { world: 4, name: 'Wormworks', w: 6, h: 6,
    sources: [{ x: 0, y: 2, dir: 1 }], voids: [[2, 4], [4, 1]],
    teleporters: [{ x: 2, y: 2, pair: 'p' }, { x: 5, y: 5, pair: 'p' }],
    targets: [{ x: 5, y: 0, mask: 4 }, { x: 0, y: 5, mask: 1 }],
    inventory: { prism: 1, mirror: 4 } },

  // ===================== WORLD 5 — CRUCIBLE (everything, brutal) =====================
  { world: 5, name: 'Crucible Key', w: 5, h: 5,
    sources: [{ x: 0, y: 2, dir: 1 }], voids: [[2, 0]],
    doors: [{ x: 3, y: 2, door: 'A' }], switches: [{ x: 2, y: 4, mask: 4, door: 'A' }],
    targets: [{ x: 4, y: 2, mask: 4 }], inventory: { filter: 1, splitter: 1, mirror: 1 } },

  { world: 5, name: 'Void Run', w: 6, h: 5,
    sources: [{ x: 0, y: 0, dir: 1 }], voids: [[2, 0], [2, 2], [4, 1], [4, 3], [1, 4]],
    targets: [{ x: 5, y: 4, mask: 7 }], inventory: { mirror: 4 } },

  { world: 5, name: 'Portal Forge', w: 6, h: 5,
    sources: [{ x: 0, y: 2, dir: 1 }], walls: [[3, 0], [3, 1], [3, 2], [3, 3], [3, 4]],
    teleporters: [{ x: 2, y: 2, pair: 'p' }, { x: 4, y: 2, pair: 'p' }],
    targets: [{ x: 5, y: 4, mask: 4 }], inventory: { filter: 1, mirror: 1 } },

  { world: 5, name: 'Locked Spectrum', w: 6, h: 5,
    sources: [{ x: 0, y: 2, dir: 1 }], voids: [[4, 0]],
    doors: [{ x: 4, y: 2, door: 'A' }], switches: [{ x: 2, y: 0, mask: 4, door: 'A' }],
    targets: [{ x: 5, y: 2, mask: 2 }, { x: 2, y: 4, mask: 1 }], inventory: { prism: 1, mirror: 3 } },

  { world: 5, name: 'No Contamination', w: 5, h: 5,
    sources: [{ x: 0, y: 2, dir: 1 }], targets: [{ x: 4, y: 0, mask: 5 }],
    inventory: { prism: 1, mirror: 4 } },

  { world: 5, name: 'Gauntlet', w: 6, h: 6,
    sources: [{ x: 0, y: 2, dir: 1 }], voids: [[3, 1], [3, 4]],
    doors: [{ x: 4, y: 2, door: 'A' }], switches: [{ x: 2, y: 5, mask: 4, door: 'A' }],
    targets: [{ x: 5, y: 2, mask: 4 }], inventory: { filter: 1, splitter: 1, mirror: 3 } },

  { world: 5, name: 'Wormhole Mix', w: 6, h: 5,
    sources: [{ x: 0, y: 2, dir: 1 }],
    teleporters: [{ x: 2, y: 2, pair: 'p' }, { x: 4, y: 0, pair: 'p' }],
    targets: [{ x: 5, y: 0, mask: 2 }, { x: 3, y: 4, mask: 1 }], inventory: { prism: 1, mirror: 3 } },

  { world: 5, name: 'The Crucible', w: 6, h: 6,
    sources: [{ x: 0, y: 2, dir: 1 }], voids: [[2, 0], [4, 5]],
    doors: [{ x: 4, y: 2, door: 'A' }], switches: [{ x: 2, y: 5, mask: 7, door: 'A' }],
    targets: [{ x: 5, y: 2, mask: 7 }, { x: 0, y: 5, mask: 7 }], inventory: { splitter: 1, mirror: 4 } },

  { world: 5, name: 'Convergence', w: 7, h: 5,
    sources: [{ x: 0, y: 2, dir: 1 }], walls: [[3, 1], [3, 3]],
    doors: [{ x: 5, y: 2, door: 'A' }], switches: [{ x: 6, y: 0, mask: 2, door: 'A' }],
    targets: [{ x: 6, y: 2, mask: 4 }, { x: 6, y: 4, mask: 1 }], inventory: { prism: 1, mirror: 4 } },

  { world: 5, name: 'Singularity', w: 6, h: 6,
    sources: [{ x: 0, y: 2, dir: 1 }], voids: [[2, 0], [2, 5]],
    teleporters: [{ x: 2, y: 2, pair: 'p' }, { x: 3, y: 5, pair: 'p' }],
    doors: [{ x: 5, y: 3, door: 'A' }], switches: [{ x: 0, y: 5, mask: 4, door: 'A' }],
    targets: [{ x: 5, y: 4, mask: 4 }, { x: 5, y: 0, mask: 2 }], inventory: { prism: 1, filter: 1, mirror: 3 } },
];
