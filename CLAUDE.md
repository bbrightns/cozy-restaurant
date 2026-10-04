# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Cozy pastel isometric restaurant-decorating game (working title TBD). Repo: https://github.com/bbrightns/cozy-restaurant

The game is `index.html`, a single HTML file opened directly in a browser. There is no build, lint, or test tooling. Phases 1 (decorate sandbox) and 2 (customers and money) are done. Opening the page with `?debug` exposes a read-only `window.cozyDebug` (state snapshot and tile-to-screen mapping) for browser tests.

## Rules

1. **Read `project.md` and `design.md` before every task.** `project.md` is the source of truth for game systems, the economy formulas, the data model and the phase roadmap. `design.md` covers visual style, palette, animation, UI and interaction.
2. **Single HTML file, vanilla HTML/CSS/JS with Canvas 2D. No external libraries**, no web fonts, no external files (the Firebase plan applies only to later phases).
3. **Everything must be original.** Names, characters, items, art and copy must be our own. Never copy from Restaurant City or any other game. All visuals are drawn by code (Canvas, CSS, inline SVG).
4. **Work one phase at a time, in order. Never skip a phase.** Phases are listed in `project.md` section 12 (Phase 1 is the decorate sandbox: isometric interior, place/move/remove, level-based grid size, real-time day/night, localStorage).
5. **Commit every time a sub-phase is finished.**

## Reference files (do not copy from them)

- `reference.md`: a wiki dump of Restaurant City (employees, customers, popularity, dishes, ingredients, recipes). It is mechanics research only. Do not reuse its names, item lists, dish names, numbers or text. The original design already adapts the generic ideas (satisfaction bubbles, waiting chairs, dish levels) in `project.md` sections 6 to 9.
- `Pocket Metropolis.html`: a third-party saved page (a ~1950-line single-file isometric city toy) kept only as a **visual and technical reference** for the pastel isometric style, CSS variables and canvas structure. Do not ship or lift its code, and do not edit it.

## Architecture decisions to keep consistent

- Two scenes share one camera and lighting system: Storefront (2D side view) and Interior (isometric grid, painter's algorithm sorted by x + y depth, A* pathfinding for customers and staff).
- Interior grid size is `5 + floor(level / 5)`, capped at 12x12. Existing items stay in place when the grid expands.
- Placement must validate that a walkable path exists from the door to every seat.
- Income is computed with the formula in `project.md` section 8.1 and is **not** simulated per customer while offline. Offline earnings use a capped elapsed time multiplied by an efficiency constant.
- Time: the local device clock drives the sky and lighting display. Server time is for money math (Phase 5 onward). In friend visits, the visitor's local time drives the sky.
- Persistence in Phase 1 is localStorage inside try/catch. The Firebase data model in `project.md` section 10 is only a draft for later phases.

## Style constraints (from design.md)

- Palette is pastel and low contrast, with no pure black or white. Shadows are darker, saturated versions of the surface color. Night is a deep blue/violet multiply tint, never a black overlay. Core hexes are in `design.md` section 3.
- Box faces: top lightest, left mid, right darkest. No outlines, no pixel art.
- Animate with `requestAnimationFrame`, pause when the tab is hidden, and respect `prefers-reduced-motion`.
- Canvas matches container size and devicePixelRatio (capped at 2). Must work from 360px wide with no horizontal scroll. Use pointer events, a 44px minimum tap target, visible `:focus-visible`, aria-labels, and no console errors.
