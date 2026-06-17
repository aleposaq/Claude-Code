# PRISM — a neon light-routing puzzle game

**Bend the light. Light the crystals.**

PRISM is a fully playable, self-contained mobile puzzle game built with vanilla
HTML5 / Canvas / JavaScript — no frameworks, no build step, no asset downloads
(sound is synthesized at runtime, the icon is an inline SVG). Open `index.html`
and play. It installs to your home screen and works offline.

![levels](https://img.shields.io/badge/levels-100+-blueviolet) ![worlds](https://img.shields.io/badge/worlds-10-9b6bff) ![mechanics](https://img.shields.io/badge/mechanics-13-3ad1c0) ![deps](https://img.shields.io/badge/dependencies-none-success)

## Play

Open `index.html` in any modern mobile or desktop browser. To play locally with
a server (recommended on mobile so the service worker / install works):

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

Portrait-first and touch-friendly. Progress (stars, unlocked worlds, daily
streak, settings) is saved to `localStorage`. Add it to your home screen for a
full-screen, offline, app-like experience.

## How to play

- A **source** ◉ emits a beam in a fixed direction.
- **Tap a cell** to place a **mirror** `╱`. Tap again to flip it to `╲`. Tap
  once more to remove it. **Undo** and **Reset** are always one tap away.
- Route light into every **crystal** ◆ — each must receive its **exact colour**.
- You have a limited number of mirrors per level — solve it within budget.
- Beat the **par** tap count to earn all **3 stars**.

### Light physics

PRISM models light additively. Colours are red, green and blue; a crystal
**adds up** every beam that reaches it:

> red + blue = **magenta** · red + green = **yellow** · green + blue = **cyan** ·
> all three = **white**

A stray ray contaminates a mix, so routing must be clean.

## 10 worlds, 13 mechanics, a real difficulty curve

Each world introduces one idea, complicates it, then ends on a capstone that
combines it with everything before. Later worlds **expand the map** and tighten
the mirror budget so puzzles demand planning and exploration — not a single
obvious line.

| World | Name | Introduces |
|------:|------|-----------|
| 1 | **Reflection** | Mirrors, walls, fixed mirrors, multi-turn routing |
| 2 | **Spectrum** | **Gels** — tint white to a primary; the *wrong* gel **absorbs** the beam |
| 3 | **Fracture** | **Splitters** — one beam becomes two; serve many crystals |
| 4 | **Alchemy** | **Mixing** — converge two primaries into a secondary; avoid contamination |
| 5 | **Dispersion** | The **prism** (white → R/G/B) and the **bleach** (wash back to white) |
| 6 | **Gateway** | **Gates** — coloured locked doors that open only for their exact colour |
| 7 | **Wormhole** | **Portals** — teleport a beam across the board, past walls |
| 8 | **Singularity** | **Voids** — black holes; if *any* beam touches one, you lose |
| 9 | **Chroma** | The **rotator** (cycles R→G→B→R) and additive **tinters** (+R/+G/+B) |
| 10 | **Convergence** | Everything woven together, building to a grand finale |

In-game, tap **HOW TO PLAY** for the full legend. Stuck? The **💡 Hint** button
briefly reveals a working solution.

## Modes & polish

- **Campaign** — the 10 worlds, unlocked as you progress, with per-world
  win-screen celebrations and a **world-complete** fanfare.
- **Daily Challenge** — a deterministic puzzle that changes each day, with a
  **streak** to keep coming back.
- **Settings** — toggle sound, haptics (vibration) and reduced motion; reset
  progress.
- Glowing neon visuals with a **distinct icon for every mechanic**, particle
  win-bursts, synthesized SFX, undo/redo-friendly input, and safe-area / notch
  awareness. Installable PWA, fully offline, no ads, no tracking.

## Project layout

```
index.html              App shell + all screens (menu, worlds, levels, game, modals)
manifest.webmanifest    PWA manifest (installable)
sw.js                   Offline service worker (cache-first app shell)
icon.svg                App icon (inline SVG — a prism dispersing light)
css/style.css           Neon UI theme: worlds, settings, win/world-complete screens
js/engine.js            Pure beam-simulation engine — additive RGB bitmask colour model
js/levels.js            The built + solver-verified levels (generated from leveldata)
js/render.js            Canvas renderer: grid, distinct mechanic icons, beams, particles
js/audio.js             Procedural Web Audio sound effects
js/game.js              Game controller: screens, modes, input, progression, save data
tools/leveldata.js      The hand-authored level designs (ASCII maps + design notes)
tools/parse.js          Shared ASCII → level parser
tools/solver.js         DFS solver: finds every minimal solution to a level
tools/build.js          Parses leveldata, auto-calibrates budgets, validates, emits levels.js
tools/author.js         Authoring validator: auto-budget + difficulty signals + ASCII trace
tools/check.js          Validate + ASCII-visualise an arbitrary designs file (authoring)
tools/trace.js          ASCII beam-tracer for debugging a level's solution
tools/validate.js       Independent re-check of the emitted js/levels.js
```

## Level design is intentional — and verified

Every level is **hand-authored** in `tools/leveldata.js` as an ASCII map. The
build step doesn't trust the author: a real **solver** (`tools/solver.js`)
finds *every* minimal solution. For each level the build **auto-calibrates the
budget** to the *minimum* mirrors required (so there is no slack for sloppy
play), confirms it is **solvable** and **not trivially winnable with zero
mirrors**, and reports the **solution count** so puzzles stay tight — most have
a single intended solution.

```bash
node tools/build.js            # report: size / budget / min-mirrors / solution-count per level
node tools/build.js --emit     # validate all levels and (re)write js/levels.js
node tools/validate.js         # independent re-check of the emitted file
node tools/author.js f.js      # iterate on a scratch designs file with full difficulty signals
```

The stored solution doubles as the in-game **Hint**.

### The colour engine

Colours are a 3-bit RGB mask (`R=4 G=2 B=1`). A crystal accumulates the OR of
every beam reaching it and is satisfied on an **exact** match. **Gels** are
subtractive (`beam &= gel`); **tinters** are additive (`beam |= colour`); the
**rotator** cycles the channels (`R→G→B→R`); the **prism** disperses (red left,
green straight, blue right); the **bleach** resets to white; a **gate** passes a
beam only if it matches exactly; a **void** fails the level if any beam touches
it. Everything — the game, the solver and the authoring tools — runs on this one
engine.

## Legend (ASCII authoring)

```
.   empty (place a mirror)     #   wall            / \  fixed mirror
> < ^ v  source                r g b primary       y c m secondary   w white crystal
R G B  gel (subtractive)       j k l tinter (+R/+G/+B)                @  rotator (R→G→B→R)
S Z    splitter                P  prism            *  bleach
1..7   coloured gate (mask)    o  portal (paired)  x  void (black hole)
```
