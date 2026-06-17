/*
 * PRISM — the crafted curriculum. 10 worlds, 100+ hand-authored levels.
 *
 * Every level is built with INTENT: it introduces an idea, complicates it, then
 * a world capstone combines the lot. Budgets are AUTO-CALIBRATED by tools/build.js
 * to the minimum mirrors required (tight by construction), and every level is
 * verified by the solver (solvable, non-trivial, few solutions). The 'note' is a
 * short design beat (metadata; not shown during play).
 *
 * Legend:
 *   .  empty (place a mirror)   #  wall            / \  fixed mirror
 *   > < ^ v  source             r g b primary      y c m secondary   w white crystal
 *   R G B  gel (subtractive)    j k l tinter(+R/+G/+B)               @  rotator (R->G->B->R)
 *   S Z    splitter             P  prism           *  bleach
 *   1..7   coloured gate(mask)  o  portal(paired)  x  void (black hole)
 *
 * Worlds: 1 Reflection · 2 Spectrum · 3 Fracture · 4 Alchemy · 5 Dispersion
 *         6 Gateway · 7 Wormhole · 8 Singularity · 9 Chroma · 10 Convergence
 */
module.exports = [

  { world:1, name:'First Light', note:'one turn and there is light', grid:[
    '>....',
    '.....',
    '....w'] },
  { world:1, name:'Switchback', note:'down, then across', grid:[
    '>...#',
    '....#',
    '....#',
    'w...#'] },
  { world:1, name:'Through the Gap', note:'mind the wall', grid:[
    '>..#..',
    '...#..',
    '...#.w',
    '......'] },
  { world:1, name:'The Pillar', note:'a mirror already stands', grid:[
    '>....',
    '.....',
    '..\\..',
    '.....',
    'w....'] },
  { world:1, name:'Twin Lamps', note:'two lights, one stone', grid:[
    '>....',
    '.....',
    '....w',
    '.....',
    '>....'] },
  { world:1, name:'Pair of Stars', note:'feed both crystals', grid:[
    '>.....',
    '......',
    '.....w',
    '......',
    '.....w'] },
  { world:1, name:'The Spiral', note:'wind your way in', grid:[
    '>......',
    '#####.#',
    '#...#.#',
    '#.w.#.#',
    '#.###.#',
    '#.....#',
    '#######'] },
  { world:1, name:'Crossroads', note:'route both lamps home', grid:[
    '>.....#',
    '.....#.',
    '...##.w',
    '...##..',
    'w..##..',
    '.#.....',
    '>.....#'] },
  { world:1, name:'Long Way Round', note:'the wall forbids the short cut', grid:[
    '>.....',
    '#####.',
    '......',
    '.#####',
    '......',
    'w.....'] },
  { world:1, name:'The Labyrinth', note:'patience routes the light', grid:[
    '>....#',
    '####.#',
    '...#.#',
    '.#.#.#',
    '.#.#.#',
    '.#...#',
    'w#####'] },
  { world:2, name:'Tint', note:'white through glass', grid:[
    '>....',
    '..R..',
    '....r'] },
  { world:2, name:'Wrong Glass', note:'red dies on green', grid:[
    '>.G..',
    '.R...',
    '.....',
    '....r'] },
  { world:2, name:'Pick a Lane', note:'only one glass is yours', grid:[
    '>..G.',
    '.....',
    '>..B.',
    '.....',
    '....b'] },
  { world:2, name:'No Second Coat', note:'a second glass is death', grid:[
    '>..R..G..',
    '.........',
    '........r'] },
  { world:2, name:'Two Colours', note:'each lamp its hue', grid:[
    '>...R..',
    '.......',
    '>...B..',
    '.......',
    'r.....b'] },
  { world:2, name:'Detour', note:'the green glass blocks your road', grid:[
    '>....#',
    '.#.#.#',
    'G#.#.#',
    '.#R#.#',
    '....r#'] },
  { world:2, name:'Decoys', note:'most glass kills, one saves', grid:[
    '>....G.',
    '.G.....',
    '....B..',
    '....G..',
    'B.....b'] },
  { world:2, name:'The Filter Maze', note:'thread the colour through', grid:[
    '>....G.',
    '####.##',
    '...#.#.',
    '.#.#.#.',
    '.#.B...',
    '.#...#b',
    '.#####.'] },
  { world:2, name:'Split Duty', note:'two crystals, two stains', grid:[
    '>..R.....',
    '........g',
    '....#....',
    '>..G.....',
    '........r'] },
  { world:2, name:'Prism Vault', note:'the maze keeps its colour', grid:[
    '>.....G',
    '#####.#',
    '..R...#',
    '.####.#',
    '.#....#',
    '.#.####',
    'r.#####'] },

  // ================= WORLD 3 — FRACTURE =================
  { world: 3, name: 'Cleave', note: 'One beam, two crystals. The splitter divides.', grid: [
    '>...Z...',
    '........',
    'w......w'] },

  { world: 3, name: 'Wide Fork', note: 'The two arms scatter far. Each bends home alone.', grid: [
    '>..Z....',
    '........',
    '.......w',
    '..w.....'] },

  { world: 3, name: 'Long Arms', note: 'Steer onto the splitter, then chase both halves.', grid: [
    '>.......',
    '........',
    '...Z...w',
    'w.......'] },

  { world: 3, name: 'Two Tints', note: 'Gel each arm a different colour before it lands.', grid: [
    '>..Z..R.',
    '......r.',
    '...B....',
    '...b....'] },

  { world: 3, name: 'Crossed Hues', note: 'Both arms cross gels on the way out.', grid: [
    '>..Z...R.',
    '...B.....',
    'b........',
    '........r'] },

  { world: 3, name: 'Triptych', note: 'A second splitter makes a third beam.', grid: [
    '>..Z....w',
    '.........',
    '...Z.....',
    '.........',
    'w.......w'] },

  { world: 3, name: 'Penned', note: 'Walls hem the splits in. Thread each gap.', grid: [
    '>..Z....',
    '...#.#..',
    'w..#.#.w',
    '...#.#..',
    '....w...'] },

  { world: 3, name: 'Quartet', note: 'Split, split again — four arms, four shards.', grid: [
    '>...Z....',
    '.........',
    '....Z...w',
    'w...w...w'] },

  { world: 3, name: 'Prism Garden', note: 'A wide field of scattered crystals to feed.', grid: [
    '>....Z.....',
    '...........',
    '.....Z.....',
    '...........',
    '........w..',
    'w.......#.w'] },

  { world: 3, name: 'Shatterglass', note: 'Capstone: split twice, colour an arm, steer every shard.', grid: [
    '>...Z......',
    '..........R',
    '....Z......',
    '..........r',
    '...........',
    'w.......w..'] },

  // ================= WORLD 4 — ALCHEMY =================
  { world: 4, name: 'First Brew', note: 'A crystal sums its light. Red and blue make magenta.', grid: [
    '>..Z..R..',
    '...B.....',
    '.........',
    '......m..'] },

  { world: 4, name: 'Gold', note: 'Red and green together burn yellow.', grid: [
    '>..Z..R..',
    '...G.....',
    '.........',
    '......y..'] },

  { world: 4, name: 'Seafoam', note: 'Green and blue settle into cyan.', grid: [
    '>..Z..G..',
    '...B.....',
    '.........',
    '......c..'] },

  { world: 4, name: 'Confluence', note: 'Two sources, opposite shores, meet in the middle.', grid: [
    '>R.......',
    '.........',
    '....m....',
    '.........',
    '.......B<'] },

  { world: 4, name: 'Convergence', note: 'Two coloured lamps stack into one well.', grid: [
    '>R.........',
    '...........',
    '......y....',
    '...........',
    '>G.........'] },

  { world: 4, name: 'Keep Green Out', note: 'Magenta is red plus blue ONLY. Stray green ruins it.', grid: [
    'v.........',
    '..........',
    'ZR.......m',
    '..........',
    'ZB........',
    '.G.......g'] },

  { world: 4, name: 'Clean Room', note: 'A tempting gel would spoil the mix. Route around it.', grid: [
    '>..Z..R...',
    '...G......',
    '.........y',
    '...B......',
    '..........'] },

  { world: 4, name: 'Twin Potions', note: 'Brew two mixes at once. Share your primaries with care.', grid: [
    '>..Z.R...',
    '...G.....',
    '......y..',
    '>..Z.G...',
    '...B.....',
    '......c..'] },

  { world: 4, name: 'Sealed Vault', note: 'The mix hides behind walls. Find the two ways in.', grid: [
    '>..ZB.....',
    '...R......',
    '....#.#...',
    '.....m#...',
    '....###...',
    '..........'] },

  { world: 4, name: 'Grand Alchemy', note: 'Capstone: split, colour, converge three into white.', grid: [
    '>.Z.....###',
    '...........',
    '..Z.....###',
    '.....R.....',
    '....GwB....',
    '.....#.....'] },

  // ===== WORLD 5 — DISPERSION (prism + bleach) =====
  { world:5, name:'Unpacked', note:'the prism breaks white apart', grid:[
    '>P.g',
    '...b'] },

  { world:5, name:'Steer the Red', note:'send red where it must go', grid:[
    'r....',
    '.....',
    '>..P.',
    '.....',
    '....g'] },

  { world:5, name:'Three Ways', note:'guide all three colours home', grid:[
    'r....',
    '.....',
    '>..P.',
    '.....',
    'b...g'] },

  { world:5, name:'Wash to White', note:'bleach forgets every colour', grid:[
    '>R.*.',
    '....w'] },

  { world:5, name:'Reset & Retint', note:'red cannot become blue, unless washed', grid:[
    '>R*B.',
    '....b'] },

  { world:5, name:'One Pure Ray', note:'feed the prism a single colour', grid:[
    '.....',
    '>BP..',
    '....b'] },

  { world:5, name:'Marry the Light', note:'recombine two rays into one hue', grid:[
    '...y',
    '....',
    '>P..',
    '....'] },

  { world:5, name:'Boxed Spectrum', note:'a rainbow penned by walls', grid:[
    '.#.#g',
    'r..#.',
    '#....',
    '>.P..',
    '.#..b'] },

  { world:5, name:'Long Dispersion', note:'three pure colours, three corners', grid:[
    'r......',
    '.......',
    '>..P...',
    '.......',
    'b.....g'] },

  { world:5, name:'Spectrometer', note:'split the long way past the walls', grid:[
    'r....#.',
    '...#...',
    '>...P..',
    '...#...',
    'b....#g'] },

  // ===== WORLD 6 — GATEWAY (coloured gates) =====
  { world:6, name:'Locked Door', note:'a red door opens only for red', grid:[
    '>R..#',
    '...4.',
    '...r.'] },

  { world:6, name:'Right Lane', note:'one gate matches, one will not', grid:[
    '>R...',
    '.1.4.',
    '...r.',
    '.....'] },

  { world:6, name:'Wrong Glass', note:'green at a blue door goes nowhere', grid:[
    '>R...',
    '...1#',
    '.....',
    '...4#',
    '....r'] },

  { world:6, name:'Two Keys', note:'two doors, two colours to make', grid:[
    '>.ZR4r',
    '...B1b'] },

  { world:6, name:'Split the Keys', note:'tint each arm to pass its own door', grid:[
    '>ZR.4r',
    '....##',
    '.B...#',
    '.G1.b#'] },

  { world:6, name:'Door Behind Door', note:'pass red, then green waits beyond', grid:[
    '>R4..',
    '...*.',
    'g2G..'] },

  { world:6, name:'Prism Key', note:'disperse to forge the exact hue', grid:[
    '>P....',
    '#..##.',
    '...#..',
    '.#.#.#',
    '...1b.'] },

  { world:6, name:'Guarded Vault', note:'gates ring the crystals within', grid:[
    '>R...#.',
    '.##.#..',
    '....4r.',
    '.##.#.#',
    '>B..1b.'] },

  { world:6, name:'Spectrum Locks', note:'one prism, three coloured doors', grid:[
    '..4r.',
    '.....',
    '>P2.g',
    '.....',
    '..1b.'] },

  { world:6, name:'The Gatekeeper', note:'every door, every key, one board', grid:[
    '>Z.R4r',
    '.P..2g',
    '......',
    '....1b'] },

  { world:7, name:'Event Horizon', note:'step through the dark door', grid:[">....#","....o#","######","o.....","....w."] },
  { world:7, name:'Across the Void', note:'the gap is no obstacle now', grid:[">...o.","......","######","o.....","....w."] },
  { world:7, name:'Tunnel', note:'thread the needle, then turn', grid:[">.....#",".....o#","#######","o.....#","......#","....w.#"] },
  { world:7, name:'Sealed Chamber', note:'no door but the wormhole', grid:[">.....",".....o","######","#o...#","#..w.#","######"] },
  { world:7, name:'Inner Sanctum', note:'arrive within, then aim', grid:[">......","......o","##.####","##o...#","##....#","##..w.#","#######"] },
  { world:7, name:'Two Doors', note:'one gate leads home, one strays', grid:[">.....","..#..#",".....#",".oo.oo","##.###","##w###"] },
  { world:7, name:'Relay', note:'door to door to the light', grid:[">...o.","#####.","o.....","###.##","...o.o","#####.","....w."] },
  { world:7, name:'Forked Path', note:'split, and send one through', grid:[">..Z.w","....o.","#####.","o.....","....w."] },
  { world:7, name:'Crimson Gate', note:'colour first, then the long jump', grid:["v.....","....o.","#####.","oR....","###.##","...o.o","....r."] },
  { world:7, name:'Singularity Run', note:'the deep maze answers to the doors', grid:[">....#..o.","####.#.###","o..#.#...#","#.##.###.#","#....G.o.#","#.#####.##","#.o.....##","#######g##"] },
  { world:8, name:'First Dark', note:'the straight road is swallowed', grid:[">..x.",".....","..w.."] },
  { world:8, name:'Gauntlet', note:'thread the hungry dark', grid:[">..x.",".x...","...x.","x...w"] },
  { world:8, name:'Narrow Lane', note:'one lane survives the dark', grid:[">....x.",".x.x...","...x.x.","x...x..",".x...xw"] },
  { world:8, name:'Cleave the Dark', note:'two beams, two perils', grid:[">..Z..","..x.x.",".....w","..x.x.","w....."] },
  { world:8, name:'Twin Hazards', note:'split, and clear both fields', grid:[">...Z..",".x...x.","...x...",".x...x.","w..x..w"] },
  { world:8, name:'Spectrum Hazard', note:'three colours, three voids', grid:[">....",".x.x.","b.P.r",".x.x.","..g.."] },
  { world:8, name:'Knife Edge', note:'one approach keeps all three clean', grid:[">.r.x.","...x..","..P..g","...x..","..b.x."] },
  { world:8, name:'Three Ways Out', note:'one beam, three paths through the dark', grid:[">.r.x.x","...x.x.",".x.x.x.","..P...g",".x.x.x.","...x.x.","..b.x.x"] },
  { world:8, name:'Two Colours, One Dark', note:'colour each, clear the corridor', grid:[">..Z....","xxx..G.g","x.x...x.","x.x.R.x.","x.x...x.","x.x.r.x.","x.x...x."] },
  { world:8, name:'The Maw', note:'every colour must survive the abyss', grid:[">..xrxxxx","xx.x.xxxx","xx...xxxx","xxx..xxxx","xxx.P...g","xxxx.xxxx","xxxxbxxxx"] },

  // ================= WORLD 9 — CHROMA =================
  { world:9, name:'Shift', note:'Gel it red, rotate it green. Colour, then turn.', grid:[
    '>R@..',
    '.....',
    '....g'] },

  { world:9, name:'Inject', note:'A red beam, plus blue, becomes magenta.', grid:[
    '>Rl..',
    '.....',
    '....m'] },

  { world:9, name:'Two Adds', note:'Red, then a splash of green, burns gold.', grid:[
    '>R.k.',
    '.....',
    '....y'] },

  { world:9, name:'Twice Turned', note:'No blue gel here. Spin red the long way round.', grid:[
    '>R@..',
    '...@.',
    '....b'] },

  { world:9, name:'Long Cycle', note:'Choose how far to turn the wheel of colour.', grid:[
    '>R@...',
    '......',
    '....@.',
    '.....b'] },

  { world:9, name:'Forked Hues', note:'Split the beam; send each arm its own way.', grid:[
    '>..Z.R.@..',
    '...R.....g',
    '...l......',
    '....m.....'] },

  { world:9, name:'Dispersed Spin', note:'Disperse the white, then turn one stray ray.', grid:[
    '....@.',
    '>..P..',
    '......',
    '....bg'] },

  { world:9, name:'Locked Hue', note:'The gate wants a colour you must build first.', grid:[
    '>Rk...',
    '...6..',
    '......',
    '.....y'] },

  { world:9, name:'Colour Mill', note:'Red, tinted gold, spun to cyan in passing.', grid:[
    '>R.k....',
    '.....@..',
    '.......c',
    '........'] },

  { world:9, name:'Spectrum Engine', note:'Capstone: spin, tint and split to feed them all.', grid:[
    '>..Z.R.k.@.',
    '...R.......',
    '...@.......',
    '...........',
    '..g......c.'] },

  // ================= WORLD 10 — CONVERGENCE =================
  { world:10, name:'Rejoin', note:'Split, gel each half, fuse them back to magenta.', grid:[
    '>..Z..R..',
    '...B.....',
    '.........',
    '......m..'] },

  { world:10, name:'Spectral Key', note:'Disperse the white; the red door wants its own.', grid:[
    '...4r..',
    '.......',
    '>..P...',
    '.......'] },

  { world:10, name:'Wormhole', note:'The void blocks the road; the portal is the only way.', grid:[
    '>.x...',
    '..#...',
    'o.#..o',
    '###...',
    '.....w'] },

  { world:10, name:'Twin Spin', note:'One arm spun to green, the other gelled to blue.', grid:[
    '>..Z.R.@..',
    '...B......',
    '.......g..',
    '......b...',
    '..........'] },

  { world:10, name:'Forge', note:'Disperse, tint a ray gold, pass the golden door.', grid:[
    '>..P.....',
    '.........',
    '....j.6.y',
    '.........',
    '.........'] },

  { world:10, name:'Relay', note:'Split past the walls; one half rides the portal home.', grid:[
    '>..Z..#o',
    '...R..#.',
    '#####...',
    'o....#.r',
    '...B..#.'] },

  { world:10, name:'Reset', note:'Red cannot become blue, unless the bleach forgets.', grid:[
    '>R...#..',
    '....*...',
    '..#...B.',
    '......b.',
    '........'] },

  { world:10, name:'Minefield', note:'Split and colour two ways through a field of voids.', grid:[
    '>..Z.R....',
    '...B..x...',
    '......r...',
    '..x.......',
    '.....x.b..'] },

  { world:10, name:'Atrium', note:'A grand hall: spin one half green, gel the other blue.', grid:[
    '>...Z.R.@..',
    '....B......',
    '.......#...',
    '.......#..g',
    '...........',
    '..........b',
    '...........',
    '...........'] },

  { world:10, name:'Spindle', note:'Box the crystal; only the portal threads the voids.', grid:[
    '>..Z......',
    '...R......',
    'o....#####',
    '.....#...r',
    '...B.#x...',
    '.........o',
    '.......b..',
    '..........'] },

  { world:10, name:'Loom', note:'Three threads on the loom: spun, tinted, and gelled.', grid:[
    '>..Z.R.@..g',
    '...Z.......',
    '...R.......',
    '...l....m..',
    '...B.......',
    '.......b...',
    '...........',
    '...........'] },

  { world:10, name:'Convergence', note:'The grand finale: two suns, four shards, every art.', grid:[
    '>..Z.R.@..g',
    '...R.......',
    '...k.......',
    '.....6....y',
    '#########.#',
    '...4r......',
    '...........',
    '>..P.......',
    '..........b'] },
];
