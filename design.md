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

**Decor variety** (Phase 3g, looks approved from `scratch/mockup-decor.html`, which holds the reference drawing code; the user took every design). Scale is the same as above.
- **Stations** (1x1, one chef each, free placement; the front and handles face the chef's tile and rotation mirrors them): S1 gas stove (cabinet with oven window and knobs, hob 20px with two burners, pot and pan, backsplash 41px with hanging tools; flames and steam while cooking), S3 fryer (steel body, drumstick plate, two oil wells with baskets whose handles point to the front, the second basket lifts and bubbles while cooking), S4 drink machine (46px, two glass tanks with peach and mint drinks and rising bubbles, taps, cup on the tray, cups on top).
- **Chairs** (in the game, listed after the six colours; change shape, not only colour): C1 stool (seat 13, round, no back), C2 classic (seat 11, back 20, today's chair), C3 high back (back 33 with a butter cushion), C4 booth seat (wood base, peach cushion, tufted back 31, arms only at the open ends so neighbours join into one long seat).
- **Tables:** T1 cloth square (top 16, vase 25, today's table), T2 round pedestal (top 16.5, candle), T3 diner (top 16, butter edge, napkin holder and bottle).
- **Extras:** P1 glass partition on wood (39px, blocks its tile), P2 wood lattice screen with a planter (37px plus plant), A1 arcade cabinet (60px with a marquee, an animated screen; the out-of-order state shows a dim screen and a spark).
- **Floors** (flat patterns drawn in tile space, so they shear to the grid): in the game F1 is Mint checker, F2 Kitchen tile (2 by 2 small tiles per floor tile with grout and a few lighter ones), plus a darker Slate tile, F3 Green carpet (a faint lattice and a cream dotted band on every edge that meets another floor or the room edge) and F4 Pale planks, next to the original six. Wallpapers add Polka (diamond dots) and Diamond border (a band of pastel diamonds above the chair rail). All floors stay darker than any tabletop.

**Storefront** (Phase 4a): a flat side view, at the same px scale as the room (door 64px, a person about 45px). The shop stands on its own floating island with rounded ends: grass top with a darker front lip, then the soil block, and a soft oval shadow below. From the facade outward: a planting strip with small pastel flowers, a sidewalk of staggered pale slabs with a light far edge and a cream curb, then a grass verge. A path with a peach mat and a cream step leads from the sidewalk to the door. The 4a shell is a blush plaster wall that darkens toward the ground, a base band, cream corner pilasters (the right one darker), and a lavender parapet roof that shades the wall under it. The door matches the room's door, and its round window is pale by day and warm at night, with a glow and a light pool on the step. Everything takes the same `lit()` night tint as the room.

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
- Edit mode: while the player places, paints, removes or holds a piece in the room, guests, staff and their bubbles fade out over about 0.25 s (instantly with reduced motion) and fade back in when editing stops; coin pops and the door keep animating.

## 9. Day / Night Cycle

- Slow cycle (a few real minutes per day).
- Sun and moon travel along an arc; sky gradient shifts (dawn, day, dusk, night).
- Ambient color multiplies all materials.
- Night: lit windows, glowing lanterns and string lights, warm light pools on the ground, twinkling stars.
- Optional: night brings different customers.

## 10. UI

### Layout
- Top: title card with coins, level, and a small sun/moon clock dial.
- Bottom: the build panel, a raised cream card (max 560px wide) with two rows.
  - **Category strip:** one icon per category in a pill track: Tables, Chairs, Kitchen (stoves and stations), Plants, Lights, Floor, Walls (wallpaper) and Tools (a gear). The chosen category is a lifted cream pill. Short labels show under the icons on wide screens; at 640px and below the strip is icons only. The Outside / Inside door chip sits at the right end. When the icons do not fit (below about 420px wide) the strip scrolls sideways, with a soft fade on the side that has more icons and the chosen one kept in view.
  - **Design grid:** the chosen category's designs, 5 across (3 at 480px and below, and in the sideways-phone dock), each a cream card with a thumbnail and its coin price underneath. Furniture thumbnails are the real item drawn by its own draw function in daylight, so designs that change the shape show it; floor and wallpaper show a pattern swatch. A small lavender badge on the corner counts how many of that design are in the room (pieces placed, or floor tiles and wall pieces painted). The chosen design has a lavender ring. Designs the player cannot afford are dimmed with a red price. More designs than fit slide in pages: chevron buttons on both sides (dimmed at the ends), or swipe or scroll the row; it snaps to whole cards.
  - **Tools** shows the tool row instead of a grid: Move, Rotate, Remove, Menu and Staff.
- Card above the panel: placing shows "Placing Table (Mint) · 30 coins" with Rotate; a selected piece shows its name, Rotate, Remove and Done plus a row of its type's design thumbnails to restyle it; while painting it shows the chosen design, a running coin total and a Done button.
- Item name label: a small cream pill with the item's name (Table, Dining chair, Waiting chair, Stove, Plant, Lantern) floats above the placed piece under the mouse or the keyboard cursor while the Move tool is on. It is drawn on the canvas, so it never takes a tap; it rises in over about 0.15 s, or just appears with reduced motion.
- Staff sheet (Tools, Staff button): floats over the room like the Menu sheet. "Your team" rows show a small code-drawn avatar (chef hat, waiter bow, helper scarf), name, role, stars, and wage per minute, with a "Let go" chip that asks for a second tap. "Looking for work" rows show candidates with a "Hire" pill and its coin fee; fees the player cannot afford, or a full team, dim the pill. A "New faces" chip rerolls the candidates.
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
| Hover | Dashed tile cursor + translucent ghost preview; with Move, the name label of the item under the pointer |
| Category strip | Tap an icon to show its designs; tap a design to place or paint with it, tap it again to stop. Left and right arrows (Home, End) move between categories when the strip has focus |
| Design grid | Chevrons page through the designs; swipe or scroll the row also works. Tab reaches each design card |
| Keyboard | 1 Move, 2 Table, 3 Chair, 4 Stove, 5 Plant, 6 Lantern, 7 Remove (each opens its category), 8 paints the floor and 9 the wallpaper with the last design used; arrows move the cursor (a name label shows on an item with Move), Enter places, R rotates, Delete removes, Esc stops painting or deselects, +/- zoom, O switches between the room and the storefront (outside, Enter goes in through the door) |

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
