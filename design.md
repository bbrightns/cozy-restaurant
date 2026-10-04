# Design Document: Pastel Isometric Restaurant Game

> Working title: TBD (candidates: Noodle Nook / Midnight Diner / Tiny Tavern Tales / Cloud Kitchen Co.)
> Visual reference: Pocket Metropolis (pastel isometric city-builder toy)

## 1. Concept

A cozy restaurant-management toy. The player builds and decorates a tiny floating-island restaurant, hires staff, serves customers, earns coins, and unlocks new decorations and recipes.

- Mood: calm, cute, relaxing. No fail states, no timers that punish.
- Session length: 5 to 10 minutes, easy to return to.
- Platform: mobile-first web, works on desktop.

## 2. Visual Style

| Aspect | Decision |
|---|---|
| Projection | Isometric (2:1 dimetric), 2.5D |
| Look | Flat colors + soft shading, no outlines, no pixel art |
| Mood | Cozy miniature diorama on a floating island |
| Palette | Pastel, low contrast, never pure black or pure white |
| Shape language | Rounded corners, chunky simple volumes |

## 3. Color Palette

### Core (from reference)
| Role | Hex |
|---|---|
| Grass | `#a8d5a2` |
| Water | `#7ec8e3` |
| Road / path | `#d6d0c4` |
| Peach | `#ffb5a7` |
| Blush | `#fcd5ce` |
| Mint | `#b8e0d2` |
| Lavender | `#cdb4db` |

### UI additions
| Role | Hex |
|---|---|
| Cream card background | `#fff8ef` |
| Soft text | `#5b4b57` |
| Coin gold | `#f6d27a` |
| Accent (buttons) | `#ffb5a7` |

### Rules
- Shadows are a darker, more saturated version of the surface color, not gray or black.
- Keep at most 4 to 5 hues visible on screen at once.
- Night tint uses deep blue/violet multiplied over surfaces, never a black overlay.

## 4. Lighting and Shading

- Each box has 3 visible faces: top (lightest), left (mid), right (darkest).
- Side faces get a vertical gradient: darker near the ground (ambient occlusion).
- Soft contact shadow under every object base.
- Cast shadows projected on the ground; direction and length follow the sun.
- Thin highlight on top edges.
- Blurred oval shadow under the whole island.

## 5. World Layout

- Grid: 12x12 tiles on desktop, fitted to screen on mobile.
- Island: grass top, layered soil edge, floating in a sky gradient with drifting clouds.
- Tile types: floor, wall, path, grass, water, decoration slot.
- Painter's algorithm: draw back-to-front by depth (x + y); ground and shadows first.

## 6. Objects

| Category | Examples |
|---|---|
| Furniture | tables, chairs, counters, stoves, shelves |
| Decor | plants, lanterns, rugs, signs, string lights |
| Structures | walls, doors, windows, roof awnings |
| Outdoor | trees, flower beds, benches, water tiles |
| Characters | customers, chef, waiter (simple rounded bodies, no faces needed at small size) |

Each object: simple box/rounded primitives, 2 to 3 palette colors, soft AO, a small unique detail (a steam wisp, a candle, a flower).

## 7. Characters and Behavior

- Customer cycle: arrive, walk to a free seat, order, wait, eat, pay (coin pop), leave.
- Staff cycle: take order, cook, serve, idle.
- Little emote bubbles above heads (heart, coin, hungry).
- Characters walk along tile paths; sort by depth with other objects.

## 8. Animation and Motion

- Placement: squash-and-stretch pop-in (volume-preserving, anchored at tile base), expanding ring on the ground.
- Removal: puff of dust particles.
- Idle: swaying trees, rising steam, blinking lights, drifting water glints.
- Coin collect: coin floats up and arcs into the HUD counter.
- Use requestAnimationFrame; animate transform/opacity only.
- Respect `prefers-reduced-motion`: slower, no bounce.
- Pause animation when the tab is hidden.

## 9. Day / Night Cycle

- Slow cycle (a few real minutes per day).
- Sun and moon travel along an arc; sky gradient shifts (dawn, day, dusk, night).
- Ambient color multiplies all materials.
- Night: lit windows, glowing lanterns and string lights, warm light pools on the ground, twinkling stars.
- Optional: night brings different customers.

## 10. UI

### Layout
- Top: title card with coins, level, and a small sun/moon clock dial.
- Bottom: raised pastel toolbar with tool icons (Build, Decorate, Staff, Menu, Bulldoze).
- Build menu (Sims-style): the Furniture tab shows a design row with a coin price under every design; the Decor tab has a Wallpaper / Floor switch and a priced design row. While painting, the card above the toolbar shows the chosen design, a running coin total and a Done button. Designs the player cannot afford are dimmed with a red price.
- Cards: cream background, 16 to 20px radius, soft drop shadow.
- Buttons: pill shape, pastel fill, slight press-down animation.

### Typography
- Rounded friendly sans from local system stack, e.g.
  `ui-rounded, "Nunito", "Quicksand", "Segoe UI", system-ui, sans-serif`
- No web fonts or external files.
- Large tap targets (minimum 44px).

### Icons
- Inline SVG, isometric mini-icons, same palette.

## 11. Interaction

| Input | Action |
|---|---|
| Tap / click tile | Place selected item |
| Right-click / long-press | Remove (with dust puff) |
| Drag | Pan camera |
| Scroll / pinch | Zoom around pointer |
| Hover | Dashed tile cursor + translucent ghost preview |
| Keyboard | 1 to 7 select tools, arrows move cursor, Enter places, Delete removes, +/- zoom |

## 12. Game Systems

- Economy: customers pay coins per dish; coins buy furniture, decor, recipes, staff.
- Progression: restaurant level unlocks new items and island expansion.
- Happiness/rating: rises with decoration, seat comfort, greenery, cleanliness; affects customer flow and tips.
- Recipes: unlock and upgrade dishes; higher quality means higher price.
- Social (later phase): visit friends' restaurants, leaderboard.

## 13. Sound (optional)

- Web Audio API, synthesized only, starts after the first user gesture.
- Soft pop on place, puff on remove, coin chime, gentle ambient loop.
- Visible mute toggle.

## 14. Technical Constraints

- Stack: HTML, CSS, vanilla JS, Canvas 2D. Firebase for save/online later. Hosting on Vercel.
- Phase 1 is one standalone HTML file, no external resources.
- Canvas matches container size and devicePixelRatio (capped at 2); re-layout on resize.
- Responsive from 360px wide with no horizontal scroll.
- Save to localStorage in try/catch; no console errors.
- Pointer events for mouse and touch; visible `:focus-visible`; aria-labels on controls.

## 15. Roadmap

1. **Phase 1:** single restaurant, place/remove furniture, pan/zoom, day/night, localStorage save.
2. **Phase 2:** customers and staff with behavior loop, coin income.
3. **Phase 3:** menu, recipes, levels, unlock shop.
4. **Phase 4:** Firebase login, cloud save, visit friends, leaderboard.

## 16. Originality Rules

- Original name, characters, art, and copy. Do not copy assets, names, or characters from any existing game.
- Game mechanics (restaurant management) are generic; theme and look must be our own.
- All visuals are generated by code (Canvas, CSS, inline SVG).

## 17. Open Decisions

- [ ] Final theme and title
- [ ] Mascot / main character design
- [ ] Day length (real minutes per in-game day)
- [ ] Monetization: none for now
