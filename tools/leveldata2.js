/*
 * PRISM v2 — demonstrator levels proving the new core: the player builds from an
 * inventory of verbs (mirror/splitter/prism/filter) and fires; switch-crystals
 * latch doors open for sequencing. These are proofs-of-mechanic, not the
 * curriculum — they validate the engine + solver before the real level design.
 */
module.exports = [
  // A) PLAYER-PLACED PRISM: disperse white into three locks. The verb is "place + orient a prism".
  {
    name: 'Prism in Hand', w: 5, h: 5,
    sources: [{ x: 0, y: 2, dir: 1 }],
    targets: [{ x: 2, y: 0, mask: 4 }, { x: 4, y: 2, mask: 2 }, { x: 2, y: 4, mask: 1 }],
    inventory: { prism: 1 },
  },

  // B) PLAYER-CHOSEN FILTER COLOUR: the crystal wants red; white contaminates it.
  // The decision is which colour to make the beam.
  {
    name: 'Choose the Colour', w: 5, h: 1,
    sources: [{ x: 0, y: 0, dir: 1 }],
    targets: [{ x: 4, y: 0, mask: 4 }],
    inventory: { filter: 1 },
  },

  // C) STATEFUL SEQUENCING: target sits behind a closed door; a switch opens it.
  // One firing, resolved to a fixpoint: light the switch, the door latches open,
  // the other arm flows through.
  {
    name: 'Power the Door', w: 5, h: 5,
    sources: [{ x: 0, y: 2, dir: 1 }],
    targets: [{ x: 4, y: 2, mask: 7 }],
    doors: [{ x: 3, y: 2, door: 'A' }],
    switches: [{ x: 2, y: 4, mask: 7, door: 'A' }],
    inventory: { splitter: 1 },
  },

  // D) SPLITTER AS A PLAYER VERB: one source, two separated targets — only a fork serves both.
  {
    name: 'Fork It', w: 5, h: 5,
    sources: [{ x: 0, y: 2, dir: 1 }],
    targets: [{ x: 4, y: 2, mask: 7 }, { x: 3, y: 4, mask: 7 }],
    inventory: { splitter: 1, mirror: 2 },
  },

  // E) COMBINATION + CHOICE: tint two arms different colours to two coloured locks.
  // Inventory has spare pieces -> par is the score to beat (optimisation).
  {
    name: 'Two Tints', w: 5, h: 5,
    sources: [{ x: 0, y: 2, dir: 1 }],
    targets: [{ x: 4, y: 0, mask: 4 }, { x: 4, y: 4, mask: 1 }],
    inventory: { splitter: 1, mirror: 2, filter: 2 },
  },
];
