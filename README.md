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
index.html         App shell + all screens (menu, level select, game, win)
css/style.css      Neon UI theme, responsive, safe-area aware
js/engine.js       Pure beam-simulation engine (shared by game + tools)
js/levels.js       32 generated, validated levels (auto-generated)
js/render.js       Canvas renderer: grid, objects, glowing beams, particles
js/audio.js        Procedural Web Audio sound effects
js/game.js         Game controller: screens, input, progression, save data
tools/generate.js  Constructive level generator (Node, build-time)
tools/validate.js  Independent validator for js/levels.js
```

## Levels are guaranteed solvable

Levels aren't hand-placed and hoped-for. `tools/generate.js` builds each puzzle
**constructively**: it walks a beam from the source, dropping a mirror at every
turn (plus filters / a splitter / crystals along the way). Those mirrors *are*
the intended solution — they're then removed from the board for the player to
rediscover. Because the solution exists before the puzzle, every level is
solvable by design.

Every level is then verified with the real engine: it must **win with its stored
solution** and must **not** already be solved with zero mirrors (i.e. it isn't
trivial). Regenerate and re-verify any time:

```bash
node tools/generate.js   # rebuild js/levels.js (32 validated levels)
node tools/validate.js   # independently re-check the emitted file
```

## Features

- 4 worlds · 32 levels with a tuned difficulty ramp (1 → 6 mirrors)
- Colour filters, beam splitters, walls, multi-crystal puzzles
- Star ratings (par-based), per-level best, level unlocking
- Save/restore progress, reset progress, mute toggle
- Hint system, instant reset, real-time beam re-simulation on every tap
- Glowing neon visuals, win particle bursts, synthesized SFX
- Mobile-first, responsive, notch/safe-area aware, no external dependencies
