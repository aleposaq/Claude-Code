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

  { world: 4, name: 'Cyan', budget: 2,
    note: 'Green + blue = cyan, from one split beam.',
    grid: ['>.Z.G.', '..B...', '......', '.....c'] },

  { world: 4, name: 'Opposite Shores', budget: 2,
    note: 'You combined light; now the sources sit across the map with little room.',
    grid: ['>R.......', '...#m#...', '.......B<'] },

  { world: 4, name: 'Keep It Clean', budget: 2,
    note: 'Purple is red + blue ONLY — let green touch it and you get white. Keep green away.',
    grid: ['v........', '.........', 'ZR......m', '.........', 'ZB.......', '.G......g'] },

  { world: 4, name: 'Two Potions', budget: 3,
    note: 'Brew two mixes at once; share your primaries with care.',
    grid: ['v.......', 'ZR......', '........', 'ZG..Z..y', '........', 'ZB.....c'] },

  { world: 4, name: 'Crucible', budget: 4,
    note: 'A mix locked behind walls — converge two colours in tight quarters.',
    grid: ['>.Z.R.', '..B.#.', '....#.', '#.#.#.', '.....m'] },

  { world: 4, name: 'Alchemy', budget: 6,
    note: 'Capstone: split, tint, and converge two colours into one crystal through a wall maze.',
    grid: ['>.Z.R.', '..B...', '.....#', '......', '...#..', '.....m'] },

  // ================= WORLD 5 — DISPERSION =================
  // The prism splits a beam into its colours (R left, G straight, B right).
  // The bleach washes a beam back to white so it can be used again.
  { world: 5, name: 'Rainbow', budget: 1,
    note: 'The prism unpacks white into its colours.',
    grid: ['.r..', '>Pg.', '...b'] },

  { world: 5, name: 'Aim the Rainbow', budget: 3,
    note: 'The colours come out where the prism decides — now bend them where YOU need.',
    grid: ['r....', '.....', '.>P..', '.....', 'b...g'] },

  { world: 5, name: 'Bleach', budget: 1,
    note: 'A bleach washes any beam back to white.',
    grid: ['>R*..', '....w'] },

  { world: 5, name: 'Reset & Retint', budget: 1,
    note: "You can't turn red into blue — but wash it white first, and you can.",
    grid: ['>R*B.', '....b'] },

  { world: 5, name: 'Half Spectrum', budget: 2,
    note: 'Feed the prism a single colour and only that colour comes out.',
    grid: ['.....', '.....', '>RP.r', '.....'] },

  { world: 5, name: 'Refract & Mix', budget: 2,
    note: 'Disperse white, then recombine two of the colours into one mixed crystal.',
    grid: ['...y', '....', '>P..', '....'] },

  { world: 5, name: 'Prism Maze', budget: 3,
    note: 'A rainbow in a box — route the colours past the walls to their crystals.',
    grid: ['.#.#g', 'r..#.', '#....', '>.P..', '.#..b'] },

  { world: 5, name: 'Dispersion', budget: 3,
    note: 'Split white the long way and deliver three pure colours.',
    grid: ['r......', '.......', '>..P...', '.......', 'b.....g'] },

  // ================= WORLD 6 — CONVERGENCE =================
  // Mastery. Every tool, woven together, building to the finale.
  { world: 6, name: 'Toolkit', budget: 3,
    note: 'Warm-up for the end: a splitter, a gel and a mix in one breath.',
    grid: ['>.....', '..Z.R.', '..B...', '.....m'] },

  { world: 6, name: 'Long Distance', budget: 4,
    note: 'Sources on opposite shores; mix their light in the middle with no slack.',
    grid: ['>R..####', '###.####', '###.m.##', '#####.##', '#####.B<'] },

  { world: 6, name: 'Recycle', budget: 3,
    note: 'One beam, used twice: light a primary crystal, wash it white, then light a white one.',
    grid: ['>Rr..', '####.', '#..*.', '#.###', '#w...'] },

  { world: 6, name: 'Prism Mixer', budget: 4,
    note: 'Disperse white, then marry two of its colours into a mixed crystal while the third flies clear.',
    grid: ['.####.', '......', '>P.g#m', '......', '.####.'] },

  { world: 6, name: 'Triage', budget: 4,
    note: 'Three beams, three demands — decide what each split arm is for.',
    grid: ['>ZR.#...', '.ZG.....', '.B..#..r', '....#...', '........', '.b..g...'] },

  { world: 6, name: 'No Contamination', budget: 5,
    note: 'A mix and a pure colour side by side; one stray ray ruins everything.',
    grid: ['>....ZR.', '.....B..', '........', '###.###.', '...m....', 'r..#....'] },

  { world: 6, name: 'Grand Design', budget: 5,
    note: 'Split, disperse, mix, and bleach — every tool, one puzzle.',
    grid: ['>.Z.P..#', '#.R....#', '##.#.#.#', '##.#.#.#', '#w.m.#.#', '#.*....#', '########'] },

  { world: 6, name: 'Convergence', budget: 6,
    note: 'Everything you have learned converges here. Light them all.',
    grid: ['##..r#v###', '>.P.g#R###', '##.###*w##', '##..b#..##', '##########', '>ZR.######', '#B#.######', '#..m######'] },

  // ================= WORLD 7 — GATEWAY =================
  // Coloured gates (digits 1-7) open ONLY for a beam of that exact colour.
  // Carry, forge, or disperse the right key to every lock.
  { world: 7, name: 'Keyhole', budget: 1,
    note: 'A gate opens only for its own colour. Tint the beam, then pass.',
    grid: ['>.R..', '....4', '....r'] },
  { world: 7, name: 'Wrong Key', budget: 1,
    note: 'White light is no key. Take the lane whose gel matches the lock.',
    grid: ['>....', '.B.R.', '...4.', '...r.'] },
  { world: 7, name: 'Two Doors', budget: 2,
    note: 'Two gates, two colours. Tint each beam to open its own door.',
    grid: ['>R...', '....4', '....r', '>B...', '....1', '....b'] },
  { world: 7, name: 'Forge the Key', budget: 2,
    note: 'No single gel makes yellow. Tint red and green, converge to forge it.',
    grid: ['>.Z.R.', '..G...', '....6.', '.....y'] },
  { world: 7, name: 'Locked Vault', budget: 2,
    note: 'The vault opens for red alone, and the red gel is a detour away.',
    grid: ['>........', '.........', '....R....', '......4r.'] },
  { world: 7, name: 'Decoy Door', budget: 2,
    note: 'The straight path runs into the wrong colour. Go around to the right door.',
    grid: ['>....', '.R...', '..3..', '..4r.'] },
  { world: 7, name: 'Gatekeeper', budget: 4,
    note: 'Two locked crystals, two keys. Mind which beam carries which colour.',
    grid: ['>R...#', '#.##.4', '#....r', '#.##.#', '>G...#', '....2g'] },
  { world: 7, name: 'Spectrum Lock', budget: 3,
    note: 'Three doors, three colours. Disperse white and aim each ray at its lock.',
    grid: ['.r4.....', '........', '>..P....', '.....2..', '.b1..g..'] },
  { world: 7, name: 'Gateway', budget: 4,
    note: 'Capstone: forge two keys from one beam and open the vault.',
    grid: ['>.Z.R.', '..G...', '...6.y', '......', '...4.r'] },

  // ================= WORLD 8 — WORMHOLE =================
  // A beam entering a portal 'o' exits its twin keeping its heading.
  // One pair per level — light leaps walls and minefields you cannot.
  { world: 8, name: 'Wormhole', budget: 1,
    note: 'A portal hurls light to its twin, still travelling the same way. Bridge the wall.',
    grid: ['>..o.', '.....', '#####', 'o....', '....w'] },
  { world: 8, name: 'Detour Portal', budget: 2,
    note: 'You choose how light enters the mouth — and so how it leaves the other side.',
    grid: ['>....', '....o', '#####', 'o....', '.w...'] },
  { world: 8, name: 'Coloured Jump', budget: 2,
    note: 'Colour rides through a portal too. Tint before you leap.',
    grid: ['>R...', '....o', '#####', 'o....', '....r'] },
  { world: 8, name: 'Split & Send', budget: 2,
    note: 'Split the beam; keep one arm here, post the other through the wormhole.',
    grid: ['>.Z..', '..o.w', '#####', 'o....', '....w'] },
  { world: 8, name: 'Far Shore', budget: 2,
    note: 'The exit lands you far away. Steer whatever comes out the other end.',
    grid: ['>....', '..o..', '#####', '....o', '.w...'] },
  { world: 8, name: 'Two Worlds', budget: 2,
    note: 'Two sealed rooms, one wormhole between. Light a crystal in each.',
    grid: ['>..w.', '....o', '#####', 'o....', '.w...'] },
  { world: 8, name: 'In and Out', budget: 4,
    note: 'A maze with a shortcut only light can take. Find both ends.',
    grid: ['>..#..', '...#o.', '...#.#', 'o..#..', '...#.w'] },
  { world: 8, name: 'Prism Portal', budget: 3,
    note: 'Disperse, then post one colour through the wormhole to its far crystal.',
    grid: ['r....', '>P..o', '.....', 'o....', 'b..g.'] },
  { world: 8, name: 'Event Horizon', budget: 2,
    note: 'Capstone: split, tint, and thread the wormhole to light all three.',
    grid: ['>.Z.R.', '..o..r', '######', 'o.....', '..w.w.'] },

  // ================= WORLD 9 — THE VOID =================
  // A beam that so much as touches a void 'x' destroys the whole run.
  // Route so that NOTHING — no stray split, no spare ray — ever strays into one.
  { world: 9, name: 'Hazard', budget: 1,
    note: 'A void swallows any light that touches it — and dooms the run. Go around.',
    grid: ['>.x..', '.....', '.w...'] },
  { world: 9, name: 'Minefield', budget: 2,
    note: 'Voids on every lane. Thread the one safe path to the crystal.',
    grid: ['>..x.', '.x...', '...x.', '.w...'] },
  { world: 9, name: 'Live Wire', budget: 2,
    note: 'A tunnel walled with voids. One wrong turn and it is over.',
    grid: ['>....', 'x.x.x', '.....', 'x.x.x', '....w'] },
  { world: 9, name: 'Careful Split', budget: 1,
    note: 'A splitter throws light two ways at once — make sure NEITHER arm finds a void.',
    grid: ['..w..', '.....', 'w.Zx.', '.....', '>....'] },
  { world: 9, name: 'Tinted Hazard', budget: 2,
    note: 'Mind the colour AND the voids — the safe lane is also the right colour.',
    grid: ['>....', '.B.R.', '.x...', '....r'] },
  { world: 9, name: 'Guarded Void', budget: 1,
    note: 'A locked crystal ringed by voids. Tint the key, thread the gap.',
    grid: ['>R...', '...4.', '..xrx', '...#.'] },
  { world: 9, name: 'Threaded', budget: 4,
    note: 'A forced snake through a lattice of voids. Precision, nothing less.',
    grid: ['>....x', 'xxxx..', '......', '..xxxx', 'x....w'] },
  { world: 9, name: 'Prism Hazard', budget: 3,
    note: 'Every colour the prism throws must land safe. No stray ray may stray.',
    grid: ['r..x.', '.....', '>P...', '.....', 'b..xg'] },
  { world: 9, name: 'The Void', budget: 3,
    note: 'Capstone: disperse into the abyss and bring every colour safely home.',
    grid: ['r..x.g', '....x.', '>P....', '....x.', 'b..x..'] },

  // ================= WORLD 10 — LABYRINTH =================
  // Every mechanic now combines: tint + gate + portal + void on bigger boards.
  { world: 10, name: 'Wormhole Key', budget: 2,
    note: 'Colour, then leap, then unlock — three skills woven into one beam.',
    grid: ['>R...', '....o', '#####', 'o....', '.4..r'] },
  { world: 10, name: 'Portal Field', budget: 2,
    note: 'The void blocks the road. Only the wormhole crosses to the far crystal.',
    grid: ['>..x.', '.o...', '#####', 'o....', '....w'] },
  { world: 10, name: 'Crucible', budget: 2,
    note: 'Brew magenta from red and blue — and keep both clear of the abyss.',
    grid: ['>.Z.R.', '..B...', 'x...x.', '.....m'] },
  { world: 10, name: 'Keymaster', budget: 4,
    note: 'Tint the beam, thread the abyss, and carry the key all the way to the lock.',
    grid: ['>..R.', 'xxxx.', '.....', '.xxxx', '.4..r'] },
  { world: 10, name: 'Forge Keys', budget: 3,
    note: 'Disperse white and aim each colour at the door that only it can open.',
    grid: ['.r4.....', '......x.', '>..P....', '......x.', '.b1..g..'] },
  { world: 10, name: 'Spectrum Vault', budget: 3,
    note: 'A rainbow of locks behind a curtain of voids. Every ray must land true.',
    grid: ['r.4.x.', '....x.', '>P....', '....x.', 'b.1.xg'] },
  { world: 10, name: 'Relay', budget: 4,
    note: 'Wormhole one arm of a split across the wall while the other stays home.',
    grid: ['>.Z..o', '.....x', '######', 'o....w', '..w..x'] },
  { world: 10, name: 'Double Lock', budget: 4,
    note: 'One thread, two crystals — catch one in passing, gate the other.',
    grid: ['>..R.', 'xxxx.', '..r..', '.xxxx', '.4..r'] },
  { world: 10, name: 'Labyrinth', budget: 5,
    note: 'Capstone: the long maze. Find the single thread that lights it all.',
    grid: ['>...R.', 'xxxxx.', '......', '.xxxxx', '.4....', 'xxxx.r'] },

  // ================= WORLD 11 — PARADOX =================
  // The hardest puzzles: the one correct solution is the one you cannot see.
  { world: 11, name: 'Pinhole', budget: 3,
    note: 'A prism behind a lattice of voids. Find the needle each colour must pass through.',
    grid: ['r.x.x.', '..x.x.', '>P....', '..x.x.', 'b.x.xg'] },
  { world: 11, name: 'Long Dark', budget: 5,
    note: 'A single thread through a vast dark. One wrong turn and the run is gone.',
    grid: ['>...R..', 'xxxxxx.', '.......', '.xxxxxx', '.......', 'xxxxxx.', '.4....r'] },
  { world: 11, name: 'Prism Lock', budget: 3,
    note: 'Three locks, three colours, and voids guarding every approach.',
    grid: ['r.4.x...', '....x.x.', '>P......', '....x.x.', 'b.1.x..g'] },
  { world: 11, name: 'Serpentine', budget: 6,
    note: 'Six turns, no shortcuts. See the whole snake before you place a thing.',
    grid: ['>....R.', '.xxxxx.', '.x...x.', '.x.x.x.', '.x.x.x.', '...x...', 'r..x..4'] },
  { world: 11, name: 'Kaleidoscope', budget: 4,
    note: 'Every ray weaves through the voids to a lock only it can open.',
    grid: ['r.4.x..', '....x.x', '>P.....', '....x.x', 'b.1.x.g'] },
  { world: 11, name: 'Triangulate', budget: 4,
    note: 'Three crystals, one cascade of splitters, a board full of dead ends.',
    grid: ['>ZR.#...', '.ZG.....', '.B..#..r', '....#...', '........', '.b..g...'] },
  { world: 11, name: 'Prism Gauntlet', budget: 4,
    note: 'Disperse into a gauntlet of locks and voids. Only one routing survives.',
    grid: ['r.4.x...', '....x.x.', '>P......', '....x.x.', 'b.1.x.g.'] },
  { world: 11, name: 'Paradox', budget: 5,
    note: 'Capstone: a mix and a pure colour, inches apart. One stray ray ruins everything.',
    grid: ['>....ZR.', '.....B..', '........', '###.###.', '...m....', 'r..#....'] },

  // ================= WORLD 12 — SINGULARITY =================
  // The finale. Everything you have learned, at maximum scale.
  { world: 12, name: 'Aftershock', budget: 3,
    note: 'A warm-up for the end of all things. Thread the dark, claim the key.',
    grid: ['>..R.', 'xxxx.', '.....', '.xxxx', 'r...4'] },
  { world: 12, name: 'Alloy', budget: 3,
    note: 'Brew the exact colour the lock demands — nothing else will open it.',
    grid: ['>.Z.R.', '..B...', '....5m', '......'] },
  { world: 12, name: 'Fusion', budget: 4,
    note: 'Red and blue, fused into magenta, deep in a wall of stone.',
    grid: ['>.Z.R.#', '..B...#', '......#', '#.#.#.#', '.....m#'] },
  { world: 12, name: 'Ignition', budget: 4,
    note: 'Red and green this time — forge gold where the walls allow.',
    grid: ['>.Z.R.#', '..G...#', '......#', '#.#.#.#', '.....y#'] },
  { world: 12, name: 'Cryostasis', budget: 4,
    note: 'Green and blue, bound into cyan in the heart of the maze.',
    grid: ['>.Z.G.#', '..B...#', '......#', '#.#.#.#', '.....c#'] },
  { world: 12, name: 'Oblivion', budget: 7,
    note: 'Seven turns through the endless dark. Hold the whole path in your mind.',
    grid: ['>.....R.', 'xxxxxxx.', '........', '.xxxxxxx', '........', 'xxxxxxx.', '........', '.xxxxxxx', 'r......4'] },
  { world: 12, name: 'Spectrum Collapse', budget: 4,
    note: 'The widest rainbow, the deepest voids. Every colour must find its lock.',
    grid: ['r.4.x....', '....x.x..', '>P.......', '....x.x..', 'b.1.x.g..'] },
  { world: 12, name: 'Singularity', budget: 8,
    note: 'The end. Eight turns, one thread, no light to spare. Master of PRISM — prove it.',
    grid: ['>.....R.', 'xxxxxxx.', '........', '.xxxxxxx', '........', 'xxxxxxx.', '........', '.xxxxxxx', '.4.....r'] },
];
