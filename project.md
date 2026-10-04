# Project: Cozy Restaurant Decorating Game

> Working title: TBD
> Companion file: `design.md` (visual style, palette, animation, UI)
> Status: Planning

## 1. Vision

A cozy, social restaurant game where the main fun is **decorating your own shop and showing it to friends**. Food sales fund new decorations. The game follows real-world time, so the shop earns money even while the player is away.

**Pillars**
1. **Decorate:** the shop is the player's self-expression, both storefront and interior.
2. **Show off:** friends can visit and react to your shop.
3. **Relax:** no fail states, no punishing timers. Coming back should always feel rewarding.

**Target:** mobile-first web, 5 to 10 minute sessions, Thai and English players.

## 2. Core Loop

```
Customers visit -> eat -> pay coins
      ^                       |
      |                       v
Better shop attracts     Buy decor / staff / recipes
more customers  <------  Decorate shop (storefront + interior)
      |
      v
Friends visit and react -> social rewards
```

- **Short loop (seconds):** tap trash, collect coins, place an item.
- **Medium loop (minutes):** redecorate, hire staff, unlock a recipe.
- **Long loop (days):** level up, expand the shop, climb friend rankings.

## 3. Two Scenes

| Scene | View | Purpose |
|---|---|---|
| **Storefront** | 2D side view (flat facade) | First impression, attracts customers, decorated by player |
| **Interior** | Isometric grid | Seats, kitchen, decor, where customers and staff move |

- Player switches between scenes with a door/button.
- Both scenes are fully decoratable.
- Both scenes use the same pastel style from `design.md`.

### 3.1 Storefront (2D)
Decoratable slots:
- Sign (name, shape, color, font from a limited set)
- Awning / roof
- Walls and paint color
- Door and windows
- Front items: plants, lanterns, menu board, bench, bicycle, cat, etc.
- Ground strip: path, small garden
- Lights that turn on at night

**Curb appeal score:** storefront items add to a score that increases customer arrival rate (see section 8).

### 3.2 Interior (Isometric)
- Grid-based placement with a ghost preview.
- Item types: floor, wall, table, chair, counter, stove, shelf, decoration, lighting.
- Items can be rotated (4 directions) and moved or removed.
- Walkable path must exist from door to every seat (validate on placement).

## 4. Player Level and Shop Size

Level determines interior grid size.

**Rule:** start at 5x5; every 5 levels, add 1 tile to each side.

```
size = 5 + floor(level / 5)
```

| Level | Interior grid |
|---|---|
| 1 to 4 | 5x5 |
| 5 to 9 | 6x6 |
| 10 to 14 | 7x7 |
| 15 to 19 | 8x8 |
| ... | ... |
| 35+ | 12x12 (max) |

> Decision to confirm: size increases **at** level 5, 10, 15 (not 6, 11, 16).

- Expanding adds a new row and column on the open sides; existing items stay in place.
- Storefront width also grows at the same milestones (cosmetic slots increase).
- **XP sources:** serving customers, placing a new type of item for the first time, daily tasks, friend visits.

## 5. Time System

- Game time = **real-world time** from the player's device clock for display, with **server time** used for all earnings math (anti-cheat, see section 9).
- No fast-forward, no pause.

| Phase | Local time | Look |
|---|---|---|
| Dawn | 05:00 to 07:00 | warm pink sky, soft light |
| Day | 07:00 to 17:00 | bright pastel |
| Dusk | 17:00 to 19:00 | orange and lavender sky |
| Night | 19:00 to 05:00 | deep blue tint, lit windows, glowing lamps, stars |

- Smooth transitions between phases (gradual color blend, not hard switch).
- Lighting items (lanterns, string lights, neon signs) matter at night; they give a **night appeal bonus**.
- When visiting a friend, use the **visitor's** local time for the sky and lighting.
- Optional: different customer types at night.

## 6. Customers and Food

- Customers walk in from the storefront, find a free seat, order, eat, pay, leave.
- **Menu:** each dish has a price, cook time, and unlock level.
- Higher-priced dishes earn more but may reduce arrival rate if the shop's appeal is low.
- **Recipes:** unlock with level or coins; can be upgraded (better quality means higher price).
- Customers show small emote bubbles (hungry, happy, heart, coin).

### 6.1 Customer Satisfaction
Each customer ends their visit satisfied or unsatisfied. This feeds the shop rating (section 8.1 `ratingFactor`).

| Result | Cause | Bubble shown |
|---|---|---|
| Satisfied | Ate and paid | heart |
| Unsatisfied | Too much trash in the shop | trash |
| Unsatisfied | No free seat | chair |
| Unsatisfied | Dirty plate or table not cleared | plate |
| Unsatisfied | Waited too long for food | clock |

- Satisfied customers raise the rating slowly; unsatisfied customers lower it slowly. No sudden drops.
- **Waiting chairs:** a chair with no table. Customers wait there briefly for a free table before giving up.
- Rating has a cap that rises with player level; expensive decor can raise the cap further (see section 8.1).
- The shop UI shows the top reason customers left, so the player knows what to fix.

### 6.2 Dish Levels
- Each dish has 5 levels (Simple, Standard, Classic, Delicious, Royal).
- Leveling a dish costs coins and gives XP.
- A higher level changes the plate's look and raises the dish price.
- First-time dish unlock gives a one-time XP bonus.

## 7. Staff and Cleanliness

### 7.1 Staff
- Hire from a staff list; each has a role, speed, and wage.
- Roles: Waiter (serves), Chef (cooks), Helper (general).
- More staff means higher serving capacity, with a wage cost per minute.
- Staff can be dressed in uniforms (cosmetic items).
- Staff cap depends on shop size.

**Work spots (chef and waiter behavior).**
- Every counter has one **work spot**: the floor tile in front of it. A chef walks there with A*, faces the counter, and plays a cooking animation (arm moving, steam or smoke from the pan, a soft sizzle sound) while a dish is being made. When it finishes, the plate appears at the counter's **pickup spot**.
- One chef per counter. A chef without a free counter waits politely off to the side or helps with dishes. The UI hint says "Add a stove" when chefs outnumber counters.
- A waiter walks to the pickup spot, takes the plate, and carries it to the customer's table.
- With no chef, a counter still cooks but slower, so a new player is never blocked. Chef speed multiplies the counter's cook time.
- Different stove types per dish (wok, pot, grill) are a later option, not part of Phase 3.

**Staff model (Phase 3a).** These rules are in use from Phase 3a on.

| Role | Job | Work power |
|---|---|---|
| **Chef** | Cooks at a counter. One chef per counter; extra chefs wait for a free counter. | speed |
| **Waiter** | Carries plates from the kitchen to the table. | speed |
| **Helper** | Lends a hand with plates at half pace. From Phase 3d, helpers clean first. | 0.5 × speed |

Each person has a **speed tier** (shown as stars). Speed and wage come from role and tier, so they are never stored per person and retuning applies to everyone:

| Tier | Label | Speed | Unlocks at | Chef wage | Waiter wage | Helper wage |
|---|---|---|---|---|---|---|
| ★ | Steady | 0.8 | Lv 1 | 2 | 1 | 1 |
| ★★ | Brisk | 1.0 | Lv 1 | 3 | 2 | 1 |
| ★★★ | Swift | 1.25 | Lv 5 | 4 | 3 | 2 |
| ★★★★ | Zippy | 1.5 | Lv 12 | 6 | 4 | 3 |

Wages are coins per minute. Faster staff cost a little more per unit of work but take fewer staff slots, so neither choice is a trap.

- **Hire fee:** a one-time fee of `25 × wage` (a Brisk chef costs 75, a Brisk waiter 50). No refund when letting someone go.
- **Staff cap:** `staffCap = gridSize - 2`, so 3 at 5x5, 4 at 6x6, up to 10 at 12x12. If the room ever shrinks (debug level buttons), nobody is let go; hiring is blocked until the team fits.
- **Starter crew:** every shop starts with one Brisk chef and one Brisk waiter, free. Older saves get the same crew when they migrate, so their income does not drop.
- **Hire list:** the Staff sheet shows the team and 4 candidates looking for work, always at least one per role, with a random unlocked tier and a name and look of their own. "New faces" rerolls the candidates for free; since speed and wage are tied to the tier, rerolling never finds a better deal, only a different person. Candidates are not saved.
- **Letting go:** a "Let go" button on each team row asks for a second tap. A shop may end up with no chef or no waiter; income then shows the gap and the hint names the fix.
- **No fail state:** wages are paid in whole coins as they add up (once a coin is owed). If the shop cannot pay, coins stop at 0, the unpaid part is forgiven, and staff keep working.
- `DEV_MODE` (or `?free`) waives hire fees and wages.

Phase 3a is the model, hire list and economy. Staff drawn walking on the floor is Phase 3b; trash and dirt are Phase 3c, and cleaning is 3d (section 12).

**Staff on the floor (Phase 3b).** Every team member is drawn in the room and walks the grid with A*, like guests, at `2.2 × speed` tiles per second.

- **Looks:** the same rounded body as guests, in a role uniform: chef in cream with a tall hat, waiter in lavender with a peach bow, helper in mint with a butter-yellow headband. Skin and hair come from the saved look.
- **Stations:** each chef takes a free floor tile beside their counter (fastest chef to the first counter, as in the 8.1 staff rule). Waiters and helpers wait on the next free tiles beside a counter, or the nearest free tile to it. Stations are recomputed when the layout or the team changes, and idle staff walk to the new spot.
- **Chef:** cooks only while standing at their station (a stirring hand and the counter's steam show it). After a layout change the chef walks back first, so cooking pauses for those few seconds.
- **Waiter and helper:** when a plate is ready and they are free, they walk to the counter, pick the plate up, carry it to the guest's table, and set it down. The plate no longer flies on its own. A delivery keeps them busy for `60 / (SERVES_PER_WAITER × power)` seconds or the walk, whichever is longer, so in a big room the live shop can be slightly slower than the estimate.
- **Clearing tables:** a free waiter or helper with no plate to carry walks to a dirty plate on an empty seat and clears it (table section 6.1, "dirty plate"). The player can still tap a table to clear it at once.
- **Hiring and letting go:** a new hire walks in through the door to their station; someone let go walks out and fades. A plate they were carrying goes back to the counter for the next waiter.
- Guests and staff can pass through each other; only furniture blocks the way.

### 7.2 Dirt and Trash
- Trash and spills spawn over time, proportional to number of customers served.
- Shop has a **dirt level** (0 to 100).
- High dirt reduces appeal and customer arrival, and can lower rating.
- **Cleaning:**
  - Idle staff (no customer to serve) clean automatically.
  - If the player is on screen, they can **tap trash to collect it** for a small coin or XP bonus.
  - While offline, cleaning is handled inside the earnings formula (more staff means less dirt penalty).

## 8. Economy

### 8.1 Income per minute
Income is calculated from the shop's current setup:

```
appeal       = 1 + (decorValue + curbAppeal + nightBonus) / appealScale
arrivalRate  = baseArrival * appeal * ratingFactor          // customers per minute
capacity     = min(seats * seatTurnover, staffCount * servesPerStaff)
served       = min(arrivalRate, capacity)                   // customers per minute
cleanFactor  = 1 - (dirtLevel / 100) * dirtPenalty
income/min   = served * avgMenuPrice * cleanFactor - wagesPerMin
```

Inputs the player controls:
- **Expensive items** (decorValue, curbAppeal)
- **Number of staff**
- **Number of seats**
- **Menu prices**

Output shown in UI: "Estimated income: X coins/min" with a breakdown so players see what to upgrade.

**Menu rule (in use since the Phase 1 polish).** The formula above has no dish cost and no price response, so the menu fills those gaps. Guests pick evenly among the dishes on sale, so plain averages over the menu are used:

```
avgMenuPrice, avgCost, avgSuggested, avgCookTime   // averages over dishes on sale
priceFactor  = clamp(1 - 1.2 * (avgMenuPrice / avgSuggested - 1), 0.5, 1.4)
arrivalRate  = baseArrival * appeal * ratingFactor * priceFactor
capacity     = min(seats * seatTurnover, counters * 60 / avgCookTime)
income/min   = served * (avgMenuPrice - avgCost) * cleanFactor - wagesPerMin
```

- Prices can be set within ±30% of the suggested price (whole coins, rounded inward). At +30% the price factor is ×0.64 guests; at −30% it is ×1.36.
- Higher prices give a bigger margin per guest but fewer guests, which gives the diminishing returns in 8.2.
- In the live sim a guest pays the menu price and the dish cost comes out of it, so coins grow by `price - cost` per guest and match the estimate.
- Menu slots: `3 + floor(level / 5)`, max 6. Each dish also has its own unlock level.

**Staff rule (in use since Phase 3a).** Staff replace the old "counters cook by themselves" kitchen. `staffCount * servesPerStaff` from the formula above splits into a kitchen side and a service side, and capacity is the smallest of three:

```
chefPower    = sum of speeds of the fastest min(chefs, counters) chefs
servePower   = sum(waiter speeds) + 0.5 * sum(helper speeds)
seatCap      = seats * seatTurnover
kitchenCap   = chefPower * 60 / avgCookTime
serviceCap   = servePower * SERVES_PER_WAITER        // 6 plates per minute at speed 1
capacity     = min(seatCap, kitchenCap, serviceCap)
wagesPerMin  = sum of every staff member's wage
income/min   = served * (avgMenuPrice - avgCost) * cleanFactor - wagesPerMin
```

- In the live sim, each chef is assigned to one counter (fastest chefs first) and cooks a dish in `cookTime / speed` seconds. A finished plate waits until a waiter or helper is free; each delivery keeps that person busy for `60 / (SERVES_PER_WAITER * power)` seconds (or the walk, if longer; see "Staff on the floor" in 7.1). This matches `kitchenCap` and `serviceCap`.
- Guests still wait with the same patience, so a slow kitchen or too few waiters shows up as "waited too long" (clock bubble).
- The breakdown shows Seats, Kitchen and Service as separate rows and the hint names the bottleneck: "Not enough seats", "Kitchen is busy: hire a chef" or "add a counter", "Waiters are busy: hire a waiter or helper", "Hire a chef so the kitchen can cook", "Hire a waiter to carry plates", or "A chef has no counter" when a chef is idle.
- Wage check (8.2): a Brisk waiter fully busy carries 6 guests a minute; even at the cheapest dish and lowest price (margin 5) that is 30 coins/min against a wage of 2. Staff only cost more than they earn when they are idle, and the hint says so.

### 8.2 Balance principles
- More seats with too few staff means wasted seats; the UI should hint at the bottleneck ("Not enough staff" / "Not enough seats" / "Low appeal").
- Raising prices has diminishing returns.
- Wages are always lower than the income they enable, so hiring is never a trap.

### 8.3 Offline earnings
When the player returns:

```
offlineMinutes = min(now_server - lastSeen_server, OFFLINE_CAP)
offlineIncome  = incomePerMin * offlineMinutes * OFFLINE_EFFICIENCY
```

| Constant | Initial value | Notes |
|---|---|---|
| `OFFLINE_EFFICIENCY` | 1.0 | Future: 0.8 (20% cut) to reward playing online |
| `OFFLINE_CAP` | 8 to 12 hours | Prevents unlimited idle farming |

- Show a "Welcome back" popup on load (only when away longer than a minimum, e.g. 1 minute): a warm greeting, time away, the coins the player **left off with**, coins earned while away, the new total, and customers served.
- The popup is a modal over the game: dismiss with the collect button, Esc or a tap outside; it must keep focus and use `aria-live`/aria-labels.
- Coins from offline earnings are credited when the player taps collect (satisfying coin burst animation, skipped under `prefers-reduced-motion`). If the page is closed first, credit them on the next load so nothing is lost.
- If the offline cap was reached, say so ("Your restaurant worked for 8 hours, the maximum").
- First launch (no save) shows no popup.

### 8.4 Spending
- Furniture and decor (coins), see the build-mode rules below
- Staff hiring (one-time fee, then wages per minute; see 7.1)
- Recipes and menu upgrades
- Cosmetics for storefront and staff
- Island/shop expansion unlocks via level, not money

**Build-mode pricing (Phase 1 polish 7).** Everything the player puts in the room is bought, Sims-build-mode style:

- **Furniture:** picking a furniture type in the bottom bar shows its designs, each with its own price. Placing a piece costs the chosen design's price. Restyling a selected piece to a different design costs the new design's price. Moving and rotating are free. The starting layout is pre-owned.
- **Floor and wallpaper** are painted piece by piece: one floor tile or one wall segment (one tile wide) per tap, so one room can mix designs. A tap costs that design's per-piece price. Repainting replaces the old design and charges the new price; tapping a piece that already has the design is free and does nothing.
- A running total of the current decorating run shows beside the selected design. It resets when the player leaves the paint tool.
- If the player cannot afford a purchase, the action is blocked with a message and nothing changes. No refunds when pieces are replaced or removed.
- New shops start with 300 coins.
- `DEV_MODE` in `index.html` (or `?free` in the URL) makes everything free for testing.

Prices (coins): table 30-55, chair 15-28, counter 60-110, plant 12-20, lantern 20-30 by design; wallpaper 4-8 per wall piece; floor 3-9 per tile.

## 9. Social Features (Core Pillar)

- **Friends:** add by friend code or share link.
- **Visit:** view a friend's storefront and interior (read-only, with that shop's items and layout).
- **Reactions:** like, send a stamp or emoji, leave a short guestbook message.
- **Showcase:** pin a favorite corner or "featured item" on the shop profile.
- **Screenshot / photo mode:** hide UI and save an image to share.
- **Help a friend:** while visiting, tap trash in the friend's shop to clean it. The visitor gets a small coin reward and the friend gets a cleaner shop (daily cap per friend).
- **Daily gift:** send one small free gift to each friend per day (coins or a decor item).
- **Rewards:** small coin or XP for visiting friends and for receiving likes (daily cap).
- **Later:** leaderboard (most liked shop, highest level), weekly decorating contests.

### 9.1 Achievements
Each achievement has 3 tiers (bronze, silver, gold) with a small coin or cosmetic reward.

| Category | Example goal (tier 1 / 2 / 3) |
|---|---|
| Customers served | 50 / 500 / 5000 |
| Trash collected | 100 / 1000 / 10000 |
| Friends visited | 10 / 100 / 1000 |
| Friends helped (cleaned shop) | 10 / 100 / 500 |
| Items placed | 20 / 200 / 1000 |
| Dishes at max level | 1 / 5 / 20 |
| Likes received | 10 / 100 / 1000 |

> Numbers are placeholders; tune after playtesting.

### Safety
- Guestbook messages are short with a profanity filter and the ability to report or block.
- Players can only edit their own shop; enforced by backend security rules.

## 10. Data Model (draft, Firebase)

```json
{
  "users/{uid}": {
    "displayName": "string",
    "friendCode": "string",
    "level": 1,
    "xp": 0,
    "coins": 0,
    "lastSeenServer": "serverTimestamp",
    "settings": { "sound": true, "language": "th" }
  },
  "shops/{uid}": {
    "name": "string",
    "interior": { "gridSize": 5, "items": [{ "id": "table_01", "x": 2, "y": 3, "rot": 0 }] },
    "storefront": { "items": [{ "id": "sign_02", "slot": "sign" }] },
    "menu": [{ "dishId": "noodle_01", "price": 40 }],
    "staff": [{ "id": "st_k2x9", "role": "waiter", "tier": 2, "name": "Wren", "skin": 0, "hair": 1 }],
    "dirtLevel": 0,
    "stats": { "likes": 0, "visitors": 0 }
  },
  "friends/{uid}/list/{friendUid}": { "since": "timestamp" },
  "guestbook/{shopUid}/{messageId}": { "from": "uid", "text": "string", "ts": "timestamp" }
}
```

**Rules**
- Use **server timestamps** for lastSeen and offline earnings; never trust the device clock for money.
- Validate item placement and coin balance on the server side (or with strict security rules) so players cannot edit their own coins.
- Anyone signed in can read a shop; only the owner can write it.

## 11. Technical Plan

- **Stack:** HTML, CSS, vanilla JS, Canvas 2D. Firebase (Auth, Firestore) for accounts, saves, and social. Hosting on Vercel. GitHub for versions.
- **Prototype:** `index.html` plus an optional `assets/` folder (images, fonts, libraries allowed, see CLAUDE.md rule 2), localStorage save.
- **Rendering:** two canvas scenes (storefront 2D, interior isometric) sharing one camera and lighting system; painter's algorithm for isometric depth.
- **Pathfinding:** A* on the interior grid for customers and staff.
- **Sim loop:** requestAnimationFrame for visuals; income is computed with the formula above (not by simulating every customer while offline).
- **Responsive:** from 360px phones; pointer events; reduced-motion support.

## 12. Roadmap

| Phase | Goal | Deliverable |
|---|---|---|
| **1** | Decorate sandbox | Isometric interior, place/move/remove items, level-based grid size, real-time day/night, localStorage |
| **2** | Customers and money | Customers, seats, kitchen, coins from food sales, income/min display, satisfaction bubbles, waiting chairs |
| **3** | Staff and cleanliness | Hiring, trash system, tap-to-clean, idle staff cleaning |
| 3a | Staff model | Roles, tiers, wages, hire list, staff cap, wages in income/min, save v4 |
| 3b | Staff on the floor | Staff drawn and walking (A*), waiters carry plates and clear tables |
| 3c | Trash and dirt | Trash spawns, dirt level, `cleanFactor` in income, trash sprites and bubbles |
| 3d | Cleaning | Tap-to-clean for the player, idle staff and helpers clean |
| **4** | Storefront | 2D facade scene, sign and exterior decor, curb appeal |
| **5** | Offline earnings | Server time, welcome-back popup, cap and efficiency settings |
| **6** | Social | Firebase login, friend code, visit shops, likes, guestbook, help-friend cleaning, daily gift, achievements |
| **7** | Polish and live ops | Sound, tutorial, events, leaderboard, photo mode |

### 12.1 Status

| Phase | Status |
|---|---|
| 1 Decorate sandbox (incl. polish 1 to 7) | Done |
| 2 Customers and money | Done |
| 3 Staff and cleanliness | In progress: 3a, 3b and polish A done; polish B done (B0 to B6); polish C1 and C2 done (code-drawn character upgrade and reshape); 3c next |
| 4 Storefront | Planned |
| 5 Offline earnings | Planned |
| 7a Playable polish | Planned |
| 6 Social (online) | Planned, separate milestone |

Milestones:
- **M1, Playable solo:** Phases 3, 4, 5 and 7a. A complete single-player loop that can be handed to friends.
- **M2, Online:** Phase 6 and 7b. Firebase, friends, visits, server-time money.

### 12.2 Phase completion report (mandatory)

When a phase or sub-phase is finished, Claude must stop and report to the user before starting the next one. The report states:

1. **Phase done:** the phase name and the sub-phase letter (for example "Phase 3b done").
2. **What changed:** a short list of features added or changed.
3. **Save format:** the save version bump and the `migrate()` step, if any.
4. **How it was checked:** what was played or tested (`?debug`, console clean, 360px width).
5. **Commit:** the commit hash and message.
6. **Known gaps:** anything left out or deferred.
7. **Next:** the next sub-phase and the suggested model.

Claude never starts the next phase until the user replies. Update the table in 12.1 in the same commit.

### 12.3 Detailed plan, Phase 3 to M1

Model key: **Opus** for design and cross-cutting work, **Sonnet** for feature work from a written spec, **Haiku** for mechanical edits, **Fable** for one-off deep reviews.

**Before Phase 3 (housekeeping)**
- Check that serving customers gives XP and that levels unlock grid size, dishes and menu slots. Add it if missing. (Sonnet)
- Add or ignore `.claude/` in git. Section `index.html` with banner comments (`// ===== STAFF =====`). Tag `phase2-done`. (Haiku)

**Phase 3 polish (A): look and scale. Done** (commits 1f734a1 to b2e6eb1; steps below were checked in a separate chat)
Already shipped: chibi portraits and in-world drawing for staff and guests (`drawChibi`, look parts `hairStyle`, `eye`, `face`, `acc`, save v5); staff uniforms made darker with a name badge, guests get a scarf and bag and avoid staff colours; furniture shrunk with `ITEM_SCALE` so people read at the right size.
| Step | Work | Model |
|---|---|---|
| A1 | Check staff versus guest contrast in daytime and at night. If they still blur together, adjust colours or the badge. | Sonnet |
| A2 | 360px pass: people, badges and the room must stay readable, no horizontal scroll. | Sonnet |
| A3 | Test drag, place, rotate and remove after the furniture shrink (hit boxes, ghost preview, spend pop). | Sonnet |
| A4 | Tune the gaps between tables and chairs and the shorter counter. Change `ITEM_SCALE` or shrink heights only. | Sonnet |
| A5 | Update the build-bar icons to match the new proportions. | Haiku |
| A6 | Check the guest cycle (door, walk, sit, eat, leave) and that emote bubbles do not overlap chef hats. | Sonnet |

Done when: staff and guests are told apart at a glance in day and night, nothing breaks at 360px, placing and removing furniture still works.

**Phase 3 polish (B): art and scale pass. Done**
Why: after A the room still reads wrong. People are about 28px tall on a 64px wide tile (about 0.44 of a tile). A readable isometric restaurant puts a person at roughly 0.8 to 1.0 of a tile, a table at waist height and a chair lower than the table. The shrink in A made the room feel empty instead of fixing this. The people also look flat and crude (plain shapes, no shading, always front-facing, tiny face details), and the counter reads as a box, not a kitchen.
Reference use: the user allows taking general ideas from restaurant games (proportions, a stove with burners and flames, a clothed table with chairs around it, value contrast between floor and furniture). Do not copy specific sprites, characters, posters or patterns; draw everything fresh in code. CLAUDE.md rule 3 still applies to names, characters and exact art.
| Step | Work | Model |
|---|---|---|
| B0 | Mockup first (outside `index.html`, in a scratch file): people at 1.6 to 1.8 times today's size beside furniture at about 0.85 to 0.9 of the original drawing, plus the new stove with a chef. Compare at real size and zoomed. The user picks the proportions. | Sonnet |
| B1 | Scale pass in the game: enlarge `drawChibi` (one scale constant), set `ITEM_SCALE` to the chosen values, chairs lower than tables, retune seat height, plate spots, picking heights `h`, bubble offsets and staff hand positions. Check 360px. | Sonnet |
| B2 | Value contrast: separate floor, wall and furniture tones (tables and cloth lightest, floor mid, rugs darker under tables) without breaking the pastel rules in design.md. | Sonnet |
| B3 | Character rendering: draw each look once into a cached offscreen canvas at 2x to 3x and scale down; two-level shading on every part (top lightest, left mid, right darkest) with a darker edge tone, no black outlines; simpler face (eye with one highlight, soft blush, short mouth). Cache by look, direction and frame. | Opus |
| B4 | Facing and walk cycle: four directions chosen from the movement vector, back-of-head hair for the two away directions, alternating steps, opposite arm swing, small body bob. Seated and eating poses keep working. | Sonnet |
| B5 | Kitchen look: keep id `counter_01` (old saves stay valid) but draw a stove: cabinet, two burners, animated flames and a pan or pot while cooking, steam, a small backsplash; a pickup shelf for finished plates in place of the cake dome and bell. Rename the label to Stove. Chef stands and stirs at the burner. | Sonnet |
| B6 | Sweep: day and night, 360px, drag and place, guest cycle, console clean, save and reload. Update design.md section 6 and 7 with the final numbers. | Sonnet |

Open decisions for B: whether tables may span 2x2 tiles later (a bigger gameplay and save change, not part of B); final person height as a fraction of a tile.

Done when: a person next to a table, chair and stove looks right at a glance, characters look shaded and walk facing the way they move, the kitchen is recognisable as a kitchen, nothing breaks at 360px.

**Phase 3 polish (C): character upgrade, code-drawn**
Why: the people still read as flat vector shapes. A painted image approach (layered parts, then 12 whole characters loaded from `assets/`) was tried in C0 and C0b and dropped: AI-made frames were hard to keep consistent and lost the recolourable look parts. The upgrade is done in code instead.
| Step | Work | Model |
|---|---|---|
| C0 | Image art loaders (layered and whole-character), spec and manifest. Dropped and removed in C1; save v6 from C0b stays, and its `cast` field is ignored. | Sonnet |
| C1 | Code-drawn chibi upgrade in `paintChibi`: head about 56% of a standing figure (`CHIBI` proportions), glossy eyes (deep top, own colour, lighter glow low in the iris, pupil, two highlights, lid line), soft radial blush, shade under the fringe and along the jaw, the head's soft shadow on the chest, hair shine, ears, idle breathing stretch in `drawChibi`, sprites at 5px per unit. Done. | Opus |
| C2 | Reshape the code-drawn characters (mockup in `scratch/mockup-chibi.html` approved first): bezier body with a neck, round shoulders, a waist and a flared hem; puffy sleeves with cuffs, mitten hands, calf-shaped legs, round-toed shoes with soles; a softer mochi head; back-of-head hair per style (shine band, darker nape, short locks, parting or cowlick, bun with scrunchie, twin tails with ties, curls, layered fluffy tufts) and a fringe per style in front; collars, buttons and apron ties front and back; guests keep the scarf and bag; a chef at the stove turns toward the camera and, while cooking, reaches to the pot with the stirring hand. Same proportions, scale, sprites, bubbles and save (v6). Done. | Opus |
| C3 | Optional: bring the staff panel portrait (`avatarSvg`) to the same look; tune eye size, blush, curly and fluffy backs after playing. | Sonnet |

**Phase 3: Staff and cleanliness**
| Step | Work | Model |
|---|---|---|
| 3a | Design the staff model: data, hire list UI, staff cap by shop size, wages in income/min, work spots (see 7.1), save v4 and `migrate()`. Write the decisions into this file first. | Opus |
| 3b | Staff entities: waiter, chef, helper. They reuse A* and depth sorting. Chefs stand at counter work spots and cook. Waiters carry dishes from the pickup spot to tables. | Sonnet |
| 3c | (starts after polish B is signed off) Trash and dirt: spawn by customers served, dirt 0 to 100, `cleanFactor` in income, trash sprites, "plate" and "trash" bubbles. | Sonnet |
| 3d | Tap-to-clean for the player and idle cleaning for staff. | Sonnet |
| 3e | Bottleneck hint in the income panel (staff, seats, appeal, stoves). | Haiku |
| 3f | Balance pass with fast-forward runs through `cozyDebug`. Wages must stay below the income they enable. | Opus |

Done when: hiring raises income, ignoring dirt hurts income, old saves load, no console errors.

**Working rules for the whole plan**
- One step at a time, in order. After every sub-phase, stop and send the completion report in 12.2. Do not start the next one until the user replies.
- Update the table in 12.1 in the same commit as the work.
- Before each commit: open the game with `?debug`, check the console is clean, save and reload, and check 360px width.
- Stop and report instead of continuing if a step needs a change to CLAUDE.md, a save format change not planned here, or an error that cannot be fixed.
- Never push to GitHub unless asked. Do not commit unrelated pending changes (other chats may edit `project.md` or add reference files).
- Switch to the model in the Model column when the user changes it with `/model`; the assistant cannot change it itself.

**Phase 4: Storefront**
| Step | Work | Model |
|---|---|---|
| 4a | Scene switcher with shared camera and lighting, street path to the door. | Opus |
| 4b | Facade drawn in code: building, door, windows, sign with the shop name. | Sonnet |
| 4c | Exterior decor slots, build-mode shop for them, next free save version (v5 is taken by staff look parts; 3c will likely take v6 if it saves dirt). | Sonnet |
| 4d | `curbAppeal` and `nightBonus` feed the appeal formula. | Haiku |
| 4e | Customers walk in from the street to the door. | Sonnet |

Done when: it looks right at 360px, exterior decor measurably raises arrivals, day and night work in both scenes.

**Phase 5: Offline earnings** (local clock for M1, server time in Phase 6)
| Step | Work | Model |
|---|---|---|
| 5a | Store `lastSeen`, pay `min(elapsed, OFFLINE_CAP) * incomePerMin * EFFICIENCY` on load. | Sonnet |
| 5b | Welcome-back popup: greeting, time away, coins at leave-off, coins earned, new total, customers served, collect button and coin burst (respect reduced motion). Save `coinsAtLeave` with `lastSeen` so the popup can show where the player left off. | Sonnet |
| 5c | Clock guard: clamp negative elapsed time, mark the clock untrusted. | Opus |

Done when: 10 minutes away pays correctly, a clock moved backwards pays nothing, a day away pays only the cap.

**Phase 7a: Playable polish**
- Tutorial for the first 3 minutes: place, serve, collect. (Sonnet)
- Sound: WebAudio synthesized effects, mute toggle, start only after a user gesture. (Sonnet)
- Photo mode. (Haiku)
- Final title and shop copy (open decision in section 15). (Haiku)
- Accessibility, 360px and performance sweep. (Sonnet)
- Whole-file code review, then fixes. (Fable or Opus)

M1 is reached when a new player can play 30 minutes with no console errors, old saves load, and it works on mobile.

**Phase 6 and 7b: Social (M2)**: backend and security rules (Fable/Opus), auth and cloud save (Opus), friends and visits (Sonnet), likes and guestbook (Sonnet), help-friend and daily gift with server-side caps (Opus), achievements (Haiku/Sonnet), server-time offline earnings (Opus), leaderboard and events (Sonnet). `CLAUDE.md` must be updated first to allow the Firebase SDK as the one external library.

## 13. Suggested Additions (optional ideas)

- **Daily login streak** and simple daily tasks (serve 20 customers, place 3 items).
- **Seasonal events:** Songkran, Loy Krathong, New Year, Halloween with limited decor sets.
- **Shop rating (1 to 5 stars):** from appeal, cleanliness, and service; affects arrival rate.
- **Item rarity and sets:** matching a set (for example, "Thai canal set") gives a theme bonus.
- **Pets and mascots:** a cat or dog that wanders the shop (cosmetic, adds charm).
- **Wishlist and layout save slots:** save several layouts and switch between them.
- **Undo / redo** while decorating, and an item storage (inventory) for unplaced items.
- **Shop themes (templates):** quick-start layouts for new players.
- **Tutorial:** first 3 minutes teach place, serve, and collect.
- **Premium currency:** if ever added, cosmetics only. Never sell advantages in earnings.

## 14. Originality Rules

- Mechanics (restaurant management, decorating, visiting friends) are generic; name, art, characters, items, and copy must be original.
- Do not copy assets, names, or characters from any existing game.
- All visuals are generated by code (Canvas, CSS, inline SVG).

## 15. Open Decisions

- [ ] Final theme and title
- [ ] Level-to-size rule: size changes at level 5, 10, 15 (assumed) or 6, 11, 16
- [ ] Offline cap (8 or 12 hours) and when to introduce the 20% cut
- [x] Wages: charged per minute (Phase 3a, section 7.1)
- [ ] Can players have more than one shop or layout slot
- [ ] Language support at launch (Thai and English)
- [ ] Mascot and main character design
