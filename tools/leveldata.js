/*
 * PRISM — the crafted curriculum. 6 worlds, 8 levels each.
 *
 * Every level is built with INTENT: it introduces exactly one new idea, then
 * the next levels complicate it, then a world capstone combines the lot. The
 * `note` on each level is the design beat — the little story of what the player
 * just learned and what they must now do with it. tools/build.js validates each
 * with the solver (solvable, tight, budget = minimum mirrors).
 *
 * Legend:  . empty  # wall  > < ^ v source  r g b primary crystal
 *          y c m mixed crystal  w white crystal  R G B primary gel (subtractive)
 *          * bleach (reset to white)  P dispersion prism  S Z splitter  / \ fixed mirror
 */
module.exports = [
  // ================= WORLD 1 — REFLECTION =================
  // Teach routing: a mirror bends light. Build to multi-turn planning.
  { world: 1, name: 'First Light', budget: 1,
    note: 'Every journey starts with one bounce. Bend the beam into the crystal.',
    grid: ['>....', '.....', '.....', '....w'] },

  { world: 1, name: 'Carry On', budget: 1,
    note: 'A beam does not stop at a crystal — it carries on. Light two in a row.',
    grid: ['>.w..', '.....', '.....', '....w'] },

  { world: 1, name: 'Narrow Pass', budget: 2,
    note: 'A wall stands in the way. The only gap forces you to commit to two turns.',
    grid: ['>....', '.....', '##.##', '.....', 'w....'] },

  { world: 1, name: 'Detour', budget: 2,
    note: 'Collect one crystal in passing, then wind your way to the far corner.',
    grid: ['>..w.', '.....', '.....', 'w....'] },

  { world: 1, name: 'Borrowed Bounce', budget: 1,
    note: 'This mirror is bolted down. Work WITH what the level gives you.',
    grid: ['>..\\', '....', '....', '.w..'] },

  { world: 1, name: 'Twin Sources', budget: 2,
    note: 'Two beams now. Neither can light both crystals alone — divide the work.',
    grid: ['>...', '...w', '.w..', '>...'] },

  { world: 1, name: 'Switchback', budget: 4,
    note: 'The walls force a full lap of the board. See all four turns before you start.',
    grid: ['>....', '####.', '.....', '.####', '....w'] },

  { world: 1, name: 'The Long Way', budget: 5,
    note: 'A spiral with no shortcuts. Master of mirrors — prove it.',
    grid: ['>.....', '#####.', '......', '.#####', '......', '#####w'] },

  // ================= WORLD 2 — SPECTRUM =================
  // Gels are SUBTRACTIVE: white -> a primary, but the wrong gel kills the beam,
  // and a primary can't be re-tinted. Colour is a resource to protect.
  { world: 2, name: 'Tint', budget: 1,
    note: 'White light holds every colour. A gel keeps one — pass through red, light red.',
    grid: ['>.R..', '.....', '....r'] },

  { world: 2, name: 'Dead End', budget: 2,
    note: 'A gel only passes its own colour; the wrong one snuffs the beam out. Go around.',
    grid: ['>R.B.', '.....', '.....', '....r'] },

  { world: 2, name: 'Two Hues', budget: 2,
    note: 'One beam can wear one colour. Two crystals, two colours — so use both sources.',
    grid: ['>.R..', '....r', '>.B..', '....b'] },

  { world: 2, name: 'Choose Wisely', budget: 2,
    note: 'Two lanes, two gels. One tints your beam right; the other kills it. Pick.',
    grid: ['>....', '.R.B.', '.....', 'r....'] },

  { world: 2, name: 'No Take-Backs', budget: 2,
    note: 'You cannot repaint a primary — a second gel just kills it. Leave before the trap.',
    grid: ['>R...', '...B.', '...r.', '.....'] },

  { world: 2, name: 'Crossfade', budget: 4,
    note: 'Two coloured runs share the board. Keep each beam on its own gel.',
    grid: ['>....', '.R...', 'r...b', '...B.', '>....'] },

  { world: 2, name: 'Gel Maze', budget: 2,
    note: 'Thread the corridor so the beam meets its colour and dodges the walls.',
    grid: ['>....', '...#.', '.R.#.', '...#.', '...r.'] },

  { world: 2, name: 'Spectrum', budget: 2,
    note: 'Capstone: a wrong gel sits dead ahead — turn off before it kills the beam.',
    grid: ['>R.B.', '...#.', '...#.', '...#.', '...r.'] },

  // ================= WORLD 3 — FRACTURE =================
  // The splitter: one beam becomes two. Serve many crystals; colour each arm.
  { world: 3, name: 'Split', budget: 2,
    note: 'A splitter makes two beams from one. Send each to a crystal.',
    grid: ['>.Z..', '.....', 'w...w'] },

  { world: 3, name: 'Fork', budget: 2,
    note: 'The arms fly apart. Aim them at crystals that are nowhere near each other.',
    grid: ['>.Z..', '.....', '....w', '.w...'] },

  { world: 3, name: 'Coloured Split', budget: 2,
    note: 'Split white, then gel each arm a different colour. The bridge to mixing.',
    grid: ['>.Z.R.', '.....r', '..B...', '...b..'] },

  { world: 3, name: 'Twin Bend', budget: 2,
    note: 'Both arms need steering before they reach home.',
    grid: ['>..Z..', '.....w', '......', '.w....'] },

  { world: 3, name: 'Cascade', budget: 2,
    note: 'Bend the beam onto the splitter first, then serve both arms.',
    grid: ['>.....', '.....w', '..Z...', '.w....'] },

  { world: 3, name: 'Boxed In', budget: 2,
    note: 'Walls pen the split in. Thread each arm to its corner.',
    grid: ['>.Z..', '...#.', 'w..#w', '...#.', '.....'] },

  { world: 3, name: 'Tri-Split', budget: 3,
    note: 'A second splitter means three beams. Three crystals, exactly enough mirrors.',
    grid: ['>.Z...', '......', '..Z..w', 'w.w...'] },

  { world: 3, name: 'Shatter', budget: 3,
    note: 'Capstone: split, split again, light four crystals.',
    grid: ['>.Z...', '......', '..Z..w', 'w.w..w'] },

  // ================= WORLD 4 — ALCHEMY =================
  // MIXING: a crystal sums every beam that hits it. Make new colours from old.
  { world: 4, name: 'Purple', budget: 2,
    note: 'New rule: a crystal adds up the light it receives. Red + blue = purple.',
    grid: ['>.Z.R.', '..B...', '......', '.....m'] },

  { world: 4, name: 'Sunrise', budget: 2,
    note: 'Same trick, new mix: red + green = yellow.',
    grid: ['>.Z.R.', '..G...', '......', '.....y'] },

  { world: 4, name: 'Opposite Shores', budget: 2,
    note: 'You combined light. Now the sources sit across the map with little room.',
    grid: ['>R..........B<', '..............', '......m.......'] },

  { world: 4, name: 'Keep It Clean', budget: 3,
    note: 'Purple is red + blue ONLY. Let green touch it and you get white. Aim true.',
    grid: ['>.Z.R.', '..Z...', '..G..g', '.....m', '......'] },

  { world: 4, name: 'Cyan', budget: 3,
    note: 'Mix on the move: green + blue = cyan, from a single split beam.',
    grid: ['>..Z.G', '.....c', '...B..', '......'] },

  { world: 4, name: 'White Lie', budget: 3,
    note: 'A white crystal can be faked: red + green + blue all at once.',
    grid: ['>.Z.R.', '..Z...', '..G..w', '..B...', '......'] },

  { world: 4, name: 'Two Potions', budget: 4,
    note: 'Brew two mixes from one source. Share your primaries with care.',
    grid: ['>.Z.R.', '..Z..m', '..B...', '..G..y', '..R...'] },

  { world: 4, name: 'Alchemy', budget: 4,
    note: 'Capstone: split, tint, and converge two colours into one crystal past walls.',
    grid: ['>.Z..', '.R.#.', '...#.', '.B.#m', '.....'] },

  // ================= WORLD 5 — DISPERSION =================
  // The prism splits a beam into its colours (R left, G straight, B right).
  // The bleach washes a beam back to white so it can be used again.
  { world: 5, name: 'Rainbow', budget: 1,
    note: 'The prism unpacks white into its colours: red bends one way, blue the other.',
    grid: ['.r..', '>P..', '...g', '.b..'] },

  { world: 5, name: 'Aim the Rainbow', budget: 2,
    note: 'The colours come out where the prism decides. Now bend them where YOU need.',
    grid: ['>P...', '.....', 'r.g.b', '.....'] },

  { world: 5, name: 'Bleach', budget: 2,
    note: 'A bleach washes any beam back to white — so it can be coloured anew.',
    grid: ['>R.*.', '.....', '....w'] },

  { world: 5, name: 'Reset & Retint', budget: 2,
    note: "You can't turn red into blue — but wash it white first, and you can.",
    grid: ['>R*B.', '.....', '....b'] },

  { world: 5, name: 'Half Spectrum', budget: 2,
    note: 'Feed the prism a single colour and only that colour comes out.',
    grid: ['>R.P.', '.....', '...r.', '.....'] },

  { world: 5, name: 'Refract & Mix', budget: 3,
    note: 'Disperse white, then recombine two of the colours into one mixed crystal.',
    grid: ['>.P..', '..m..', 'g....', '.....'] },

  { world: 5, name: 'Prism Maze', budget: 3,
    note: 'A rainbow in a box. Route the colours past the walls to their crystals.',
    grid: ['>.P..', '.#.#.', 'r#b#g', '.....'] },

  { world: 5, name: 'Dispersion', budget: 3,
    note: 'Capstone: split white the long way and deliver three pure colours.',
    grid: ['>..P..', '..r...', '.....g', '..b...'] },

  // ================= WORLD 6 — CONVERGENCE =================
  // Everything, woven together. Long puzzles that demand the whole toolkit.
  { world: 6, name: 'Toolkit', budget: 3,
    note: 'Warm-up for the end: a splitter, a gel and a mix in one breath.',
    grid: ['>.Z.R.', '..B...', '.....m', '......'] },

  { world: 6, name: 'Long Distance', budget: 4,
    note: 'Sources on opposite shores; mix their light in the middle with no slack.',
    grid: ['>R........', '..........', '.....m....', '..........', '........B<'] },

  { world: 6, name: 'Recycle', budget: 3,
    note: 'One beam, used twice: light a red crystal, wash it white, light a white one.',
    grid: ['>R.r.', '....*', '....w', '.....'] },

  { world: 6, name: 'Prism Mixer', budget: 4,
    note: 'Disperse white, then marry two of its colours into a mixed crystal.',
    grid: ['>.P...', '.....m', 'g.....', '......'] },

  { world: 6, name: 'Triage', budget: 4,
    note: 'Three beams, three demands. Decide what each split arm is for.',
    grid: ['>.Z...', '..Z..r', '..R..g', '..G..b'] },

  { world: 6, name: 'No Contamination', budget: 5,
    note: 'A mix and a pure colour, side by side. One stray ray ruins everything.',
    grid: ['>.Z.R.', '..Z...', '..B..m', '..G..g', '......'] },

  { world: 6, name: 'Grand Design', budget: 5,
    note: 'Split, disperse, mix, and bleach — every tool, one puzzle.',
    grid: ['>.Z...', '..P..m', '.....g', '..B...', 'b.....'] },

  { world: 6, name: 'Convergence', budget: 6,
    note: 'The finale. Everything you have learned converges here. Light them all.',
    grid: ['>.Z..R.', '..Z..m.', '..B....', '..P..g.', '..b...r'] },
];
