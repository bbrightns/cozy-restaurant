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
- Value ladder in the room: tabletops and cloths lightest, wall paper next, floor mid (no rugs under tables for now). New floor designs must stay darker than any tabletop.
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
| Characters | customers, chef, waiter, helper (chibi: big head, simple face, see section 7) |

Each object: simple box/rounded primitives, 2 to 3 palette colors, soft AO, a small unique detail (a steam wisp, a candle, a flower).

**Scale rule.** A person is drawn `PERSON_SCALE` = 1.7 times the old chibi: about 45px tall (chef hat about 63px), roughly 0.7 of a 64px tile. Furniture is drawn slightly smaller than its tile (`ITEM_SCALE`: table 0.88, chair 0.78, stove 0.86 (item id `counter_01`), plant and lantern 0.88): table top about 16px (waist height) with the vase at 25px, chair seat 11px and back 20px (lower than the table with its vase), stove hob about 25px with its backsplash at 40px, door 64px, wall 74px. Seated guests sink `SIT_DROP` (3px) into the chair so a sitter is no taller than a stander. Keep new furniture to this scale.

**Stove** (item id `counter_01`, label Stove, 1x1 tile: one stove per chef). Cabinet with an oven door, window, handle and two knobs under a blush band; a hob with one burner and a pot; a backsplash with a rail and hanging tools on the far edge; a pickup shelf with two plates that shows finished plates waiting for a waiter. While it cooks the burner shows animated flames, the pot steams and a progress ring appears. Rot 1 and 3 draw the mirrored stove (front on the +x face); chefs stand at its visible front. The front tile is kept clear by placement (nothing can be put on it, and a stove cannot go where its front is blocked), and the chef stands only there. Different stove types can come later as new items, each still one chef.

**Trash** (Phase 3c): small pastel pieces lying flat on floor tiles, drawn after the floor and before furniture and people, 1.3 times their base size so they read next to a 45px person: a crumpled paper ball (cream, lighter left and darker right, a few creases), a fruit peel curl in peach with a leaf bit, and a flat spill puddle in butter yellow with a soft highlight. Each has a soft contact shadow (not the spill), pops in with a small squash (a plain fade with reduced motion) and takes the night tint like everything else.

## 7. Characters and Behavior

- Customer cycle: arrive, walk to a free seat, order, wait, eat, pay (coin pop), leave.
- Staff cycle: take order, cook, serve, idle.
- Characters are chibi: a big, soft mochi-shaped head (round on top, full cheeks, broad chin) (about 56% of a standing figure), glossy eyes (deep at the top, a lighter glow low in the iris, a pupil and two highlights), soft round blush that fades at the edge, a small mouth, a soft shade under the fringe and along the jaw, a shine band on the hair, no black outlines. Looks are built from parts (skin, hair colour, hair style, eye colour, face, accessory) so a crowd stays varied.
- Characters are painted once into cached offscreen sprites (5px per chibi unit, keyed by look, pose and a quantised ambient light) and stamped each frame. Every part shades from light on the left to dark on the right and has an edge tone that is a darker shade of its own colour. Every outline is a curve (no stuck-together circles and boxes): a short neck, round shoulders, a waist and a hem that flares and dips in the middle, puffy sleeves with cuffs and mitten hands, calf-shaped legs and round-toed shoes with a light sole. Clothing details show front and back: chef mandarin collar, buttons and apron with a bow on the back; waiter V-neck vest with buttons, collar points and a bow tie, half belt on the back; helper bib apron with straps and pocket, straps crossing into a bow on the back; guest scarf with a fringed tail and a bag on a strap. Hair has its own fringe in front and real depth from behind: a broken shine band, a darker nape, short locks, a parting (twin, long, bob) or a cowlick, a bun with a scrunchie, twin tails with coloured ties, curls on the outline, layered fluffy tufts; ears show where hair is short or pulled up. Four views, picked from the walk direction or the chair facing: front or back, mirrored for left or right; a chef at the stove always uses a front view turned toward the stove so the face shows, and while cooking the near arm reaches to the pot holding the spoon. Eating guests lift a spoon toward the mouth. Walking alternates the legs, swings the arms in opposition and bobs the body; standing still, people breathe with a slow, slight stretch (none with reduced motion); hair is drawn from behind in the back views.
- Staff and guests must be told apart at a glance. Staff wear deeper role uniforms and always a cream name badge; guests wear light, bright clothes that never use the staff lavender or mint, plus a scarf and a small bag.
- Staff wear role uniforms (chef cream with a tall puffy hat and a dark apron, waiter deep lavender with a plum vest and a bow, helper deep mint with a headband and a yellow apron). Chefs stand at the visible front of their stove and stir with a spoon; waiters carry the plate in hand to the table and clear dirty plates when free.
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
- Staff sheet (Tools tab, Staff button): floats over the room like the Menu sheet. "Your team" rows show a small code-drawn avatar (chef hat, waiter bow, helper scarf), name, role, stars, and wage per minute, with a "Let go" chip that asks for a second tap. "Looking for work" rows show candidates with a "Hire" pill and its coin fee; fees the player cannot afford, or a full team, dim the pill. A "New faces" chip rerolls the candidates.
- Cards: cream background, 16 to 20px radius, soft drop shadow.
- Buttons: pill shape, pastel fill, slight press-down animation.

### Typography
- Rounded friendly sans from local system stack, e.g.
  `ui-rounded, "Nunito", "Quicksand", "Segoe UI", system-ui, sans-serif`
- Web fonts and other external files are allowed (see CLAUDE.md rule 2); keep the system stack above as the fallback.
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
- External libraries, web fonts and image assets (in `assets/`) are allowed; see CLAUDE.md rules 2 and 3.
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
