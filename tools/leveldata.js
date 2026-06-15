/*
 * PRISM — hand-authored levels. Each is designed with a PURPOSE (the `note`):
 * it introduces or tests a specific skill, and presents a real choice rather
 * than a single obvious move. tools/build.js validates each with the solver and
 * reports the solution count so every puzzle stays tight and intentional.
 *
 * Legend:  . empty   # wall   > < ^ v source   r g b w target   R G B filter
 *          / \ fixed mirror   S splitter(like /)   Z splitter(like \)
 *
 * Design rules learned the hard way:
 *  - every coloured crystal must have a reachable filter of its colour;
 *  - splitters sit in the interior so BOTH arms travel into the board;
 *  - never put a target on the cell where a straight beam would exit.
 */
module.exports = [
  // ============ WORLD 1 — REFLECTION ============
  { world: 1, name: 'First Light', budget: 1,
    note: 'The verb: a mirror bends light into the crystal.',
    grid: [
      '>....',
      '.....',
      '.....',
      '....w',
    ] },

  { world: 1, name: 'Thread', budget: 1,
    note: 'A beam keeps going — light TWO crystals with one path.',
    grid: [
      '>.w..',
      '.....',
      '.....',
      '....w',
    ] },

  { world: 1, name: 'Narrow Pass', budget: 2,
    note: 'A wall blocks the easy route; the only gap forces both turns.',
    grid: [
      '>....',
      '.....',
      '##.##',
      '.....',
      'w....',
    ] },

  { world: 1, name: 'Detour', budget: 2,
    note: 'Thread one crystal, then bend twice to the far corner.',
    grid: [
      '>..w.',
      '.....',
      '.....',
      'w....',
    ] },

  { world: 1, name: 'Borrowed Bounce', budget: 1,
    note: 'A FIXED mirror already bends the beam — finish what it starts.',
    grid: [
      '>..\\',
      '....',
      '....',
      '.w..',
    ] },

  { world: 1, name: 'Twin Sources', budget: 2,
    note: 'Two sources, two crystals — neither beam can do it alone.',
    grid: [
      '>...',
      '...w',
      '.w..',
      '>...',
    ] },

  { world: 1, name: 'Switchback', budget: 4,
    note: 'Walls force a full lap of the board. Plan all four turns.',
    grid: [
      '>....',
      '####.',
      '.....',
      '.####',
      '....w',
    ] },

  { world: 1, name: 'The Long Way', budget: 5,
    note: 'Capstone: a spiral with no shortcuts — five turns, exactly.',
    grid: [
      '>.....',
      '#####.',
      '......',
      '.#####',
      '......',
      '#####w',
    ] },

  // ============ WORLD 2 — SPECTRUM ============
  { world: 2, name: 'Tint', budget: 1,
    note: 'Crystals need matching colour — route through the filter first.',
    grid: [
      '>.R..',
      '.....',
      '....r',
    ] },

  { world: 2, name: 'Sequence', budget: 1,
    note: 'Filters recolour in order: red, then blue, along one beam.',
    grid: [
      '>RrB.',
      '.....',
      '....b',
    ] },

  { world: 2, name: 'Overshoot', budget: 2,
    note: 'A wrong-colour filter waits ahead — turn off before you hit it.',
    grid: [
      '>R.B.',
      '.....',
      '.....',
      'r....',
    ] },

  { world: 2, name: 'Two Tints', budget: 1,
    note: 'One beam, two colours: tint, light, re-tint, light again.',
    grid: [
      '>Rr..',
      '....B',
      '....b',
    ] },

  { world: 2, name: 'Repaint', budget: 2,
    note: 'The source tints you red immediately — repaint green downstream.',
    grid: [
      '>R...',
      '.....',
      '..G..',
      '....g',
    ] },

  { world: 2, name: 'Parallel Tints', budget: 2,
    note: 'Two beams, two colours — keep each on its own filter.',
    grid: [
      '>..B.',
      '.....',
      '....b',
      '>..G.',
      '....g',
    ] },

  { world: 2, name: 'Triad', budget: 1,
    note: 'Serve three colours from one white source, in sequence.',
    grid: [
      '>RrB.',
      '....b',
      '....G',
      '....g',
    ] },

  { world: 2, name: 'Prism Lock', budget: 2,
    note: 'Capstone: red on the way down, blue after a second turn.',
    grid: [
      '>....',
      '.R...',
      '.r...',
      '..B.b',
    ] },

  // ============ WORLD 3 — FRACTURE ============
  { world: 3, name: 'Split', budget: 2,
    note: 'A splitter makes two beams — bend each to its crystal.',
    grid: [
      '>.Z..',
      '.....',
      'w...w',
    ] },

  { world: 3, name: 'Fork', budget: 2,
    note: 'The two arms go different ways; aim them independently.',
    grid: [
      '>.Z..',
      '.....',
      '....w',
      '.w...',
    ] },

  { world: 3, name: 'Twin Bend', budget: 2,
    note: 'Steer one arm right, the other down — both need a mirror.',
    grid: [
      '>..Z..',
      '.....w',
      '......',
      '.w....',
    ] },

  { world: 3, name: 'Wishbone', budget: 3,
    note: 'First place the beam onto the splitter, then serve both arms.',
    grid: [
      '>.....',
      '......',
      '..Z...',
      'w....w',
    ] },

  { world: 3, name: 'Cascade', budget: 2,
    note: 'Bend the beam into the splitter, then steer both arms to crystals.',
    grid: [
      '>.....',
      '.....w',
      '..Z...',
      '.w....',
    ] },

  { world: 3, name: 'Boxed In', budget: 2,
    note: 'Walls hem in the split; thread each arm to its corner.',
    grid: [
      '>.Z..',
      '...#.',
      'w..#w',
      '...#.',
      '.....',
    ] },

  { world: 3, name: 'Three Ways', budget: 3,
    note: 'Both arms plus a threaded crystal — the budget is exact.',
    grid: [
      '>...Z.',
      '.w...w',
      '......',
      '....w.',
    ] },

  { world: 3, name: 'Shatter', budget: 3,
    note: 'Capstone: split, split again, and serve four crystals.',
    grid: [
      '>.Z...',
      '......',
      '..Z..w',
      'w.w..w',
    ] },

  // ============ WORLD 4 — CONVERGENCE ============
  { world: 4, name: 'Divide & Colour', budget: 2,
    note: 'One white beam, two colours: split it, then tint each arm.',
    grid: [
      '......',
      '>.Z.R.',
      '.....r',
      '..B...',
      '....b.',
    ] },

  { world: 4, name: 'Conflict', budget: 2,
    note: 'A beam cannot be red AND blue — only splitting resolves it.',
    grid: [
      '...b..',
      '..B...',
      '>.S...',
      '....R.',
      '....r.',
    ] },

  { world: 4, name: 'Filtered Fork', budget: 2,
    note: 'Send each arm through the correct filter, then bend it home.',
    grid: [
      '......',
      '>.Z.R.',
      '.....r',
      '..B...',
      '....b.',
    ] },

  { world: 4, name: 'Gauntlet', budget: 2,
    note: 'A wall blocks the tinted arm — bend it off before it dies.',
    grid: [
      '>.Z...',
      '..R...',
      'r.....',
      '..#..w',
    ] },

  { world: 4, name: 'Crosshatch', budget: 3,
    note: 'Two coloured beams must cross without stealing each other\'s tint.',
    grid: [
      '>..G..',
      '......',
      'g....b',
      '......',
      '>..B..',
    ] },

  { world: 4, name: 'Kaleidoscope', budget: 2,
    note: 'Split, tint each arm, and thread a white crystal on the way.',
    grid: [
      '.b....',
      '..B...',
      '>.SwR.',
      '......',
      '.....r',
    ] },

  { world: 4, name: 'Convergence', budget: 2,
    note: 'Resolve the colour conflict by splitting, then thread white too.',
    grid: [
      '...b..',
      '..B...',
      '>.Sw..',
      '....R.',
      '....r.',
    ] },

  { world: 4, name: 'Finale', budget: 3,
    note: 'The full test: split, two colours, and bend each arm past a wall.',
    grid: [
      '....b...',
      '...B....',
      '>..S..R.',
      '.......r',
      '...#....',
    ] },
];
