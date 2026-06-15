# PRISM — a neon light-routing puzzle game

**Bend the light. Light the crystals.**

PRISM is a fully playable, self-contained mobile puzzle game built with vanilla
HTML5 / Canvas / JavaScript — no frameworks, no build step, no asset downloads
(sound is synthesized at runtime). Open `index.html` and play.

![levels](https://img.shields.io/badge/levels-32-blueviolet) ![deps](https://img.shields.io/badge/dependencies-none-success)

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

- A **source** ◉ emits a beam of light in a fixed direction.
- **Tap a cell** to place a **mirror** `/`. Tap again to rotate it to `\`. Tap
  once more to remove it.
- Route the beam into every **crystal** ◆ to win. Crystals must be hit by a beam
  of their **matching colour**.
- You have a limited number of mirrors per level — solve it within budget.
- Beat the **par** tap count to earn all **3 stars**.

### Mechanics, introduced world by world

| World | Name | Introduces |
|------:|------|-----------|
| 1 | **Awakening** | Mirrors, walls, multiple crystals |
| 2 | **Spectrum** | Colour **filters** — recolour the beam to match crystals |
| 3 | **Fracture** | Beam **splitters** — one beam becomes two |
| 4 | **Convergence** | Everything combined |

Stuck? The **💡 Hint** button briefly reveals a working solution.

## Project layout

```
index.html          App shell + all screens (menu, level select, game, win)
css/style.css       Neon UI theme, responsive, safe-area aware
js/engine.js        Pure beam-simulation engine (shared by game + tools)
js/levels.js        The 32 built + validated levels (generated from leveldata)
js/render.js        Canvas renderer: grid, objects, glowing beams, particles
js/audio.js         Procedural Web Audio sound effects
js/game.js          Game controller: screens, input, progression, save data
tools/leveldata.js  The hand-authored level designs (ASCII maps + purpose)
tools/solver.js     DFS solver: finds every minimal solution to a level
tools/build.js      Parses leveldata, validates with the solver, emits levels.js
tools/validate.js   Independent re-check of the emitted js/levels.js
```

## Level design is intentional — and verified

Every level is **hand-authored** in `tools/leveldata.js` as an ASCII map with a
stated *purpose* (the `note` shown in-game): it introduces or tests one specific
skill and presents a real dilemma, not just a solution. The four worlds form a
teaching curriculum:

1. **Reflection** — mirrors, threading two crystals, fixed mirrors, wall mazes
2. **Spectrum** — colour filters: matching, ordering, repainting, wrong-tint traps
3. **Fracture** — beam splitters: aiming both arms, cascades, boxed-in threading
4. **Convergence** — the payoff: resolve a red/blue colour *conflict* by splitting

Quality is enforced by a real **solver** (`tools/solver.js`). For every level the
build step checks it is **solvable**, that its budget equals the **minimum**
mirrors required (no room for sloppy play), and reports the **solution count** so
puzzles stay tight and intentional — most have a single intended solution.

```bash
node tools/build.js            # report: budget / min-mirrors / solution-count per level
node tools/build.js --emit     # validate all 32 and (re)write js/levels.js
node tools/validate.js         # independent re-check of the emitted file
```

The stored solution doubles as the in-game **Hint**.

## Features

- 4 worlds · 32 levels with a tuned difficulty ramp (1 → 6 mirrors)
- Colour filters, beam splitters, walls, multi-crystal puzzles
- Star ratings (par-based), per-level best, level unlocking
- Save/restore progress, reset progress, mute toggle
- Hint system, instant reset, real-time beam re-simulation on every tap
- Glowing neon visuals, win particle bursts, synthesized SFX
- Mobile-first, responsive, notch/safe-area aware, no external dependencies
