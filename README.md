# PRISM — a neon light-routing puzzle game

**Bend the light. Light the crystals.**

PRISM is a fully playable, self-contained mobile puzzle game built with vanilla
HTML5 / Canvas / JavaScript — no frameworks, no build step, no asset downloads
(sound is synthesized at runtime). Open `index.html` and play.

![levels](https://img.shields.io/badge/levels-48-blueviolet) ![worlds](https://img.shields.io/badge/worlds-6-9b6bff) ![deps](https://img.shields.io/badge/dependencies-none-success)

## Play

Just open `index.html` in any modern mobile or desktop browser. To play locally
with a server (recommended on mobile):

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

The game is portrait-first and touch-friendly. Progress (stars, unlocked levels)
is saved to `localStorage`.

## How to play

- A **source** ◉ emits a white beam in a fixed direction.
- **Tap a cell** to place a **mirror** `/`. Tap again to rotate it to `\`. Tap
  once more to remove it.
- Route light into every **crystal** ◆ — each must receive its **exact colour**.
- You have a limited number of mirrors per level — solve it within budget.
- Beat the **par** tap count to earn all **3 stars**.

### Light physics

PRISM models light additively. Colours are red, green and blue; a crystal
**adds up** every beam that reaches it:

> red + blue = **purple** · red + green = **yellow** · green + blue = **cyan** ·
> all three = **white**

A stray ray contaminates a mix, so routing must be clean.

### Mechanics, introduced world by world

| World | Name | Introduces |
|------:|------|-----------|
| 1 | **Reflection** | Mirrors, walls, fixed mirrors, multi-turn routing |
| 2 | **Spectrum** | **Gels** — tint white to a primary; the *wrong* gel **absorbs** the beam (it dies), and a primary can't be re-tinted |
| 3 | **Fracture** | **Splitters** — one beam becomes two; colour each arm |
| 4 | **Alchemy** | **Mixing** — converge two primaries to make a secondary; avoid contamination |
| 5 | **Dispersion** | The **prism** (splits white into red/green/blue) and the **bleach** (washes a beam back to white) |
| 6 | **Convergence** | Everything woven together, culminating in a grand finale |

In-game, tap **HOW TO PLAY** for the full legend. Stuck on a level? The
**💡 Hint** button briefly reveals a working solution.

## Project layout

```
index.html          App shell + all screens (menu, level select, game, help, win)
css/style.css       Neon UI theme, responsive, safe-area aware
js/engine.js        Pure beam-simulation engine — additive RGB bitmask colour model
js/levels.js        The 48 built + validated levels (generated from leveldata)
js/render.js        Canvas renderer: grid, objects, glowing beams, particles
js/audio.js         Procedural Web Audio sound effects
js/game.js          Game controller: screens, input, progression, save data
tools/leveldata.js  The hand-authored level designs (ASCII maps + design notes)
tools/parse.js      Shared ASCII → level parser
tools/solver.js     DFS solver: finds every minimal solution to a level
tools/build.js      Parses leveldata, validates with the solver, emits levels.js
tools/check.js      Validate + ASCII-visualise an arbitrary designs file (authoring)
tools/trace.js      ASCII beam-tracer for debugging a level's solution
tools/validate.js   Independent re-check of the emitted js/levels.js
```

## Level design is intentional — and verified

Every level is **hand-authored** in `tools/leveldata.js` as an ASCII map with a
stated design *note* (shown in-game): it introduces exactly one new idea, the
next levels complicate it, and each world ends with a capstone that combines the
lot. The six worlds form a teaching curriculum that builds a real mental toolkit
— reflection → colour → splitting → mixing → dispersion → mastery.

Quality is enforced by a real **solver** (`tools/solver.js`) that finds *every*
minimal solution. For every level the build step checks it is **solvable**, that
its budget equals the **minimum** mirrors required (no room for sloppy play), and
reports the **solution count** so puzzles stay tight — most have a single
intended solution.

```bash
node tools/build.js            # report: budget / min-mirrors / solution-count per level
node tools/build.js --emit     # validate all 48 and (re)write js/levels.js
node tools/validate.js         # independent re-check of the emitted file
```

The stored solution doubles as the in-game **Hint**.

### The colour engine

Colours are a 3-bit RGB mask (`R=4 G=2 B=1`). A crystal accumulates the OR of
every beam reaching it and is satisfied on an **exact** match. **Gels** are
subtractive (`beam &= gel`), so the wrong colour drops the beam to zero — it
dies. The **prism** disperses a beam into its components (red left, green
straight, blue right); the **bleach** resets a beam to white. Everything — the
game, the solver and the authoring tools — runs on this one engine.

## Features

- 6 worlds · 48 hand-crafted, solver-verified levels with a deliberate
  difficulty and concept curve
- Mechanics: mirrors, walls, fixed mirrors, subtractive colour gels, splitters,
  additive colour **mixing**, dispersion **prisms**, **bleach** resets
- In-game **How to Play** legend; par-based star ratings; level unlocking
- Save/restore progress, reset progress, mute toggle
- Hint system, instant reset, real-time beam re-simulation on every tap
- Glowing neon visuals, win particle bursts, synthesized SFX
- Mobile-first, responsive, notch/safe-area aware, no external dependencies
