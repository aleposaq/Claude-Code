/*
 * PRISM v2 — World 1: FOUNDRY. The accessible front of the redesign.
 * Teaches the toolbox one verb at a time (mirror -> splitter -> prism -> filter
 * -> sequencing), each level discovered by building + firing, ending in an
 * optimisation capstone with spare inventory (a par to beat).
 * Validate + emit with tools/build2.js; debug with tools/check2.js.
 */
module.exports = [
  // 1 — MIRROR + FIRE: the whole loop in one move. Bend the beam, fire it.
  {
    name: 'Reflect', w: 5, h: 5,
    sources: [{ x: 0, y: 2, dir: 1 }],
    targets: [{ x: 4, y: 4, mask: 7 }],
    inventory: { mirror: 1 },
  },

  // 2 — ROUTING: two bends, and more than one way to draw the line.
  {
    name: 'The Long Way', w: 5, h: 5,
    sources: [{ x: 0, y: 0, dir: 1 }],
    targets: [{ x: 0, y: 4, mask: 7 }],
    inventory: { mirror: 2 },
  },

  // 3 — SPLITTER: one source, two crystals. A fork serves both.
  {
    name: 'Fork', w: 5, h: 5,
    sources: [{ x: 0, y: 2, dir: 1 }],
    targets: [{ x: 4, y: 2, mask: 7 }, { x: 3, y: 4, mask: 7 }],
    inventory: { splitter: 1, mirror: 2 },
  },

  // 4 — PRISM: white unpacks into red, green, blue. Aim the rainbow.
  {
    name: 'Spectrum', w: 5, h: 5,
    sources: [{ x: 0, y: 2, dir: 1 }],
    targets: [{ x: 2, y: 0, mask: 4 }, { x: 4, y: 2, mask: 2 }, { x: 2, y: 4, mask: 1 }],
    inventory: { prism: 1 },
  },

  // 5 — FILTER: colour is YOUR choice now. Pick right or the beam dies.
  {
    name: 'Tint', w: 5, h: 5,
    sources: [{ x: 0, y: 2, dir: 1 }],
    targets: [{ x: 4, y: 4, mask: 4 }],
    inventory: { filter: 1, mirror: 1 },
  },

  // 6 — COMBINE: split, then paint one arm the colour it needs.
  {
    name: 'Painted Fork', w: 5, h: 5,
    sources: [{ x: 0, y: 2, dir: 1 }],
    targets: [{ x: 4, y: 2, mask: 7 }, { x: 3, y: 4, mask: 4 }],
    inventory: { splitter: 1, filter: 1, mirror: 1 },
  },

  // 7 — SEQUENCING: the crystal is locked. Power the switch to open the door.
  {
    name: 'Power the Door', w: 5, h: 5,
    sources: [{ x: 0, y: 2, dir: 1 }],
    targets: [{ x: 4, y: 2, mask: 7 }],
    doors: [{ x: 3, y: 2, door: 'A' }],
    switches: [{ x: 2, y: 4, mask: 7, door: 'A' }],
    inventory: { splitter: 1 },
  },

  // 8 — COLOURED KEY: the switch only powers on for red. Forge the key AND route it.
  {
    name: 'Red Key', w: 5, h: 5,
    sources: [{ x: 0, y: 2, dir: 1 }],
    targets: [{ x: 4, y: 2, mask: 4 }],
    doors: [{ x: 3, y: 2, door: 'A' }],
    switches: [{ x: 2, y: 4, mask: 4, door: 'A' }],
    inventory: { filter: 1, splitter: 1 },
  },

  // 9 — FOUNDRY (capstone): prism + sequencing + routing, with spare pieces.
  // Par is the score to beat; the elegant solve uses far fewer than you hold.
  {
    name: 'Foundry', w: 6, h: 5,
    sources: [{ x: 0, y: 2, dir: 1 }],
    targets: [{ x: 2, y: 4, mask: 1 }, { x: 5, y: 2, mask: 2 }],
    doors: [{ x: 4, y: 2, door: 'A' }],
    switches: [{ x: 2, y: 0, mask: 4, door: 'A' }],
    inventory: { prism: 1, mirror: 3, splitter: 1, filter: 2 },
  },
];
