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

**Scene switch and street (Phase 4a).**
- A door chip beside the build panel's category strip (or the `O` key) switches between the room and the storefront. Outside, tapping the shop door (or Enter on the focused scene) goes back in. The switch dissolves through the sky in about 0.34 s, and is instant with reduced motion.
- Both scenes share one camera (`cam`, the same pan, pinch and zoom, fitted to each scene's bounds by `fitCamera`) and one light (the same sky, `lit()` night tint and sky preview). The sim keeps running while the player is outside.
- The storefront is a flat side view on its own floating island: world px with x to the right and y down, the foot of the facade at y = 0 (`frontGeom()`). The shop is `64 + 40 × gridSize` px wide, so it grows with the room. In front of it: a planting strip, the path with a mat and a step up to the door, a sidewalk (`walk0` to `walk1`, the line street walkers will use in 4e), a verge with small flowers, and the island soil.
- The building in 4a is a plain shell (wall, base band, corner pilasters, parapet roof, the door with a round window that glows at night). The real facade (windows, sign with the shop name) is 4b.
- Outside, the room tools give way to a short note, and a drag only pans. Going out drops any drag, selection or open sheet; the chosen tool stays. Which scene is shown is a view preference in localStorage (`cozy-restaurant-scene`), not shop data, so the save format does not change.

### 3.2 Interior (Isometric)
- Grid-based placement with a ghost preview.
- Item types: floor, wall, table, chair, counter, stove, shelf, decoration, lighting.
- Items can be rotated (4 directions) and moved or removed.
- Walkable path must exist from door to every seat (validate on placement).
- **Build panel (3g1):** a strip of category icons (tables, chairs, stoves and stations, plants, lighting, floor, wallpaper, tools) over a grid of the chosen category's designs, each with its price and a count badge when some are in the room. The Tools entry holds Move, Rotate, Remove, Menu and Staff.
- **Catalog data:** `CATALOG` has one entry per item type (the id a save stores) with its category (`cat`); `CATEGORIES` lists the strip. Designs live in `VARIANTS[id].list` (the save keeps the index as `variant`). A design is a palette swap by default, and may also carry its own `draw` function, `h` (picking height) and `scale`, so a later design can change the shape (a stool, a booth) without a new item id or a save change. Grid thumbnails are drawn by the same draw functions.

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
- With no chef, a station does not cook at all (guests wait and may leave, and the hint says "Hire a chef so the kitchen can cook"). Chef speed multiplies the station's cook time.
- Different stove types per dish (wok, pot, grill) are not part of Phase 3; Phase 3g adds a fryer and a drink machine (see "Stations (Phase 3g)" below and the station rule in 8.1).

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

**Stations (Phase 3g, spec 3g4, approved and built in 3g5).** The kitchen gets three kinds of station. Each is a 1x1 item, placed anywhere (no kitchen zone, no wall rule); the only rules are the existing ones: its front tile stays clear for its chef, and every seat keeps a path from the door. One chef per station.

| Station type | Item id | Label | Price | Cooks | First dish |
|---|---|---|---|---|---|
| `stove` | `counter_01` (kept, so saves load) | Gas stove (was "Stove") | 60 to 110 by design, as today | rice, noodles, pancakes, dumplings, curry, parfait | Lv 1 |
| `fryer` | `fryer_01` (new) | Fryer | 85 | fried dishes | Lv 3 |
| `drinks` | `drinks_01` (new) | Drink machine | 75 | drinks | Lv 2 |

- `CATALOG` gets a `station` field (`'stove'`, `'fryer'`, `'drinks'`); every place that today tests `id === 'counter_01'` (front tile rule, trash, chef spots, `updateKitchen`, the pickup) tests `isStation(it)` instead, and `stoveFront` becomes `stationFront`. Rotation mirrors the fryer and drink machine like the stove.
- **Locked until useful:** the fryer and drink machine show in the build grid with a "Lv 3" / "Lv 2" badge and cannot be bought before their first dish unlocks, so a new player never buys a station that has nothing to make (open question Q3).
- **Chef assignment** (`planKitchen()`, shared by `economy()` and `assignStations()` so the estimate and the floor agree): chefs sorted fastest first; stations sorted so that every station type with a dish on the menu gets its first chef before any type gets a second (types with more menu dishes first, ties stove, fryer, drinks, then item order); stations whose type has no menu dish come last. A chef with no station waits off to the side as today ("A chef has no station"). A chef at a station with nothing on the menu stands there idle.
- **Open types:** a station type is *open* when at least one station of it has a chef. Guests only order menu dishes of open types (8.1 station rule), so no guest ever waits for food nobody can make. If nothing on the menu is open, guests order as today and leave with the clock bubble, and the hint names the fix.
- **Orders:** there is still one `orders` queue. A chef takes the first order whose dish matches the station's type. When the layout or the team changes and a type closes, guests already waiting for that type order again from the open dishes (`reorderClosed()`); if none is open they keep waiting and may leave with the clock bubble, as with a removed stove today.
- **Pickup:** every station keeps its finished food on itself, like the stove's pickup shelf: the fryer has a tray on top of its back panel for the plate (built like the stove's pickup shelf), the drink machine its drip tray for the cup. `ready` entries keep pointing at the station (`counter`), so waiters and helpers need no new logic. Drinks are carried and set down as a cup instead of a plate, and a finished cup is cleared like a dirty plate.
- **Chef at the fryer:** stands at the front tile facing it, same front view as at the stove; while cooking the near arm holds the basket handle and gives it a small shake every second or so; when the dish is done the basket lifts and drips for about 0.4 s, then the plate appears on the side tray.
- **Chef at the drink machine:** stands at the front, the near arm holds a cup under a tap; a thin pour stream runs and the cup fills with the progress; when done the cup goes to the drip tray.
- New work for 3g5: the two items and their draw functions (ported from `scratch/mockup-decor.html`), their idle and working states, the cup drawing (on the tray, in hand, on the table, empty), the two chef poses, the level lock in the build grid, and everything in the 8.1 station rule. The progress ring, the pickup flow, the front tile rule and the walking are reused.

### 7.2 Dirt and Trash
- Trash and spills spawn over time, proportional to number of customers served.
- Shop has a **dirt level** (0 to 100).
- High dirt reduces appeal and customer arrival, and can lower rating.
- **Cleaning:**
  - Idle staff (no customer to serve) clean automatically.
  - If the player is on screen, they can **tap trash to collect it** for a small coin or XP bonus.
  - While offline, cleaning is handled inside the earnings formula (more staff means less dirt penalty).

**Trash on the floor (Phase 3c).**
- Each happy guest has a `TRASH_CHANCE` (0.8) of dropping one piece near their seat when they pay: a paper ball, a fruit peel or a spill. It lands on the free tile nearest the seat (within 2 tiles), never in the doorway, under furniture, on a stove's front tile or on a tile that already holds trash. At most `TRASH_MAX` (14) pieces lie on the floor.
- **Dirt level** is the total weight of the pieces, capped at 100: paper ball 6, peel 6, spill 9. Nothing else changes it, so picking a piece up lowers dirt at once. `cleanFactor = 1 - dirt / 100 * DIRT_PENALTY` (0.5) feeds the income formula, and the breakdown row shows dirt and the piece count.
- Each arriving guest turns around with a trash bubble with probability `dirt / 100 * DIRT_PENALTY`, which is exactly the share of guests the estimate's `cleanFactor` removes, so the live shop and the income panel agree (3f; before that a hard cliff at dirt 60 did not match). Each such guest moves the rating down and shows up as the top reason. `TRASH_LIMIT` (60) is now only where the hint changes to "Guests are leaving over trash".
- Trash is saved as the list of pieces (save v7, `trash: [[x, y, kind, ox, oy]]`); dirt is recomputed on load. Furniture placed on a piece, or a smaller room, removes it quietly. Older saves start clean.

**Cleaning (Phase 3d).**
- **Player:** tapping a piece (or pressing Enter on its tile) picks it up for a small tip, 1 coin for a paper ball or peel and 2 for a spill, plus 1 XP, with a coin pop and the usual coin flight to the HUD. A piece right under the finger wins over a tall item that overlaps it on screen. Pieces only come from guests, so the tip cannot be farmed.
- **Staff:** a waiter or helper with nothing to carry or clear walks to the nearest piece nobody else has claimed, spends `SWEEP_TIME` (1.6 s) sweeping, and removes it (no tip). Order for a waiter: plates to carry, then dirty plates to clear, then trash. A helper sweeps first, unless the shop has no waiter, so plates still get carried. A piece that cannot be reached is skipped until the layout changes, and a piece the player takes first just ends that job.
- Chefs stay at their stoves and never sweep.

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
- Menu slots: `3 + floor(level / 5)`, max 8 (`MENU_MAX`). Each dish also has its own unlock level.

**Staff rule (in use since Phase 3a).** Staff replace the old "counters cook by themselves" kitchen. `staffCount * servesPerStaff` from the formula above splits into a kitchen side and a service side, and capacity is the smallest of three:

```
chefPower    = sum of speeds of the fastest min(chefs, counters) chefs
servePower   = sum(waiter speeds) + 0.5 * sum(helper speeds)
seatCap      = seats * seatTurnover                         // peak, 2 guests per seat per minute (a guest holds a seat about 30 s)
seatBlock    = erlangB(seats, arrivalRate / seatTurnover)   // share of guests who find every seat taken (3f)
kitchenCap   = chefPower * 60 / avgCookTime
serviceCap   = servePower * SERVES_PER_WAITER        // 6 plates per minute at speed 1
capacity     = min(seatCap, kitchenCap, serviceCap)        // for the hints
served       = min(arrivalRate * (1 - seatBlock), kitchenCap, serviceCap)
wagesPerMin  = sum of every staff member's wage
income/min   = served * (avgMenuPrice - avgCost) * cleanFactor - wagesPerMin
```

- In the live sim, each chef is assigned to one counter (fastest chefs first) and cooks a dish in `cookTime / speed` seconds. A finished plate waits until a waiter or helper is free; each delivery keeps that person busy for `60 / (SERVES_PER_WAITER * power)` seconds (or the walk, if longer; see "Staff on the floor" in 7.1). This matches `kitchenCap` and `serviceCap`.
- Guests still wait with the same patience, so a slow kitchen or too few waiters shows up as "waited too long" (clock bubble).
- The breakdown shows Seats, Kitchen and Service as separate rows and the hint names the bottleneck: "Not enough seats", "Kitchen is busy: hire a chef" or "add a counter", "Waiters are busy: hire a waiter or helper", "Hire a chef so the kitchen can cook", "Hire a waiter to carry plates", or "A chef has no counter" when a chef is idle. From Phase 3e, dirt at half the trash limit or more shows "Trash is piling up: tap it, or hire a helper to sweep" (and "Guests are leaving over trash" at the limit), ahead of the capacity and appeal hints. The order is: missing seat, stove, chef or waiter; trash; seats, kitchen or service shortfall; idle chef; low appeal or high prices.
- Wage check (8.2): a Brisk waiter fully busy carries 6 guests a minute; even at the cheapest dish and lowest price (margin 5) that is 30 coins/min against a wage of 2. Staff only cost more than they earn when they are idle, and the hint says so.

**Station rule (Phase 3g, spec 3g4, approved and built in 3g5).**

*Choice.* Two designs were compared:

| | A. Every dish has a station (chosen) | B. Stations are boosters |
|---|---|---|
| Rule | Each dish carries `station` (`stove`, `fryer`, `drinks`). Guests only order menu dishes whose station type is open (placed and staffed). | The stove still cooks everything. A fryer adds extra fried dishes; a drink machine adds a drink a guest may order on top of the meal for a bonus. |
| Good | One clear idea ("fried food needs a fryer"); one dish per guest, so seats, plates, waiters, `seatBlock` and `cleanFactor` stay as they are; existing saves are all-stove, so nothing changes for them. | No station is ever "needed"; a drink add-on raises income per guest without a new seat. |
| Bad | Food of one type can only be made at that type, so a menu heavy on one type with one station of it is slower than the same chefs all at stoves (pooling loss, see example 2). | A guest with two items needs a second carry, a second pickup and a combined bubble; the fryer becomes a second stove with another look; the formula needs an add-on rate that has to be tuned. |

A is recommended: it matches the user's wish that fried food and drinks are their own things, it changes only the kitchen side of the formula, and it cannot strand a guest (closed types are not ordered). What the user loses: the "drink on the side" bonus, and the kitchen gets a planning puzzle (match stations to the menu) instead of being a pure booster. The hint and the menu sheet carry that puzzle.

*Dishes.* The six existing dishes are all `stove` dishes (no change). Six new dishes are appended (ids `dish_07` to `dish_12`; `cols` are cup or plate, food, topping). Margin per second of cook time stays on the existing curve (about 1.6 at Lv 1 rising to about 2.1 at Lv 10), so no station is a trap or a jackpot:

| Id | Dish | Station | Price | Cost | Cook (s) | Lv | Margin/s | cols |
|---|---|---|---|---|---|---|---|---|
| dish_01 to 06 | (unchanged) | stove | | | | 1 to 10 | 1.60 to 2.14 | |
| dish_07 | Peach Fizz Soda | drinks | 11 | 3 | 5 | 2 | 1.60 | `#ffd9c9`, `#ffb5a7`, `#fff6ea` |
| dish_08 | Minty Pearl Tea | drinks | 17 | 6 | 6 | 4 | 1.83 | `#e6f4ec`, `#b8e0d2`, `#8a6f7e` |
| dish_09 | Starlit Berry Float | drinks | 26 | 10 | 8 | 8 | 2.00 | `#e9dcf2`, `#cdb4db`, `#fff1e2` |
| dish_10 | Crunchy Sun Drumsticks | fryer | 21 | 7 | 8 | 3 | 1.75 | `#fff6ea`, `#e8b26a`, `#94c98d` |
| dish_11 | Honey Puff Nuggets | fryer | 26 | 9 | 9 | 5 | 1.89 | `#fff1e2`, `#f2c46d`, `#ffb5a7` |
| dish_12 | Lotus Crisp Platter | fryer | 39 | 14 | 12 | 9 | 2.08 | `#fff6ea`, `#f0c98a`, `#f4a6b8` |

- A drink is a whole order (the guest sits, sips for the same `EAT_TIME` and pays), so the seat model does not change.
- **Menu slots:** `3 + floor(level / 5)`, capped by `MENU_MAX` = 8 (reached at Lv 25) instead of the dish count. Old saves keep their menu; from Lv 20 they simply get more free slots.
- **Menu sheet:** dishes grouped under small headers Gas stove, Fryer, Drinks, in `DISHES` order inside each. A dish whose type is not open shows a soft note ("needs a fryer", "needs a chef at the fryer") and can still be put on the menu; it just is not ordered until the station is open.

*Formulas.* Everything in the staff rule above stays (`seatCap`, `seatBlock` (Erlang B), `serviceCap`, `cleanFactor`, `wagesPerMin`, `priceFactor`); only the kitchen side and the menu averages change:

```
open         = station types with at least one station that has a chef (planKitchen)
sold         = menu dishes whose station is open          // if empty, sold = the whole menu and kitchenCap = 0
avgMenuPrice, avgCost, avgSuggested, avgCookTime           // now averaged over `sold`, the dishes guests actually order
for each type s with sold dishes:
  share_s    = (sold dishes of s) / (sold dishes)          // guests pick evenly, so this is s's share of orders
  chefPower_s= sum of speeds of the chefs planKitchen put on stations of s
  cap_s      = chefPower_s * 60 / avgCook_s                // dishes of s per minute
kitchenCap   = min over s of cap_s / share_s               // guests per minute the whole kitchen can feed
served       = min(arrivalRate * (1 - seatBlock), kitchenCap, serviceCap)
income/min   = served * (avgMenuPrice - avgCost) * cleanFactor - wagesPerMin
```

With only stove dishes on the menu there is one type with share 1, so `kitchenCap` is exactly today's `chefPower * 60 / avgCookTime`: an existing save earns the same.

*Example 1, starter shop* (Lv 1, 1 Brisk chef, 1 gas stove, 1 Brisk waiter, menu dish_01 to 03 at suggested prices): one type, share 1, avgCook (5 + 7 + 9) / 3 = 7, `kitchenCap` = 1 × 60 / 7 = 8.57 per minute, `serviceCap` = 6, margin (8 + 12 + 15) / 3 = 11.67, wages 5. Same as today; the 3f runs measured about 45 coins/min net (about 4.3 guests a minute, arrival-bound).

*Example 2, three stations* (Lv 10, 7x7, 5 menu slots, staff cap 5: 3 Brisk chefs, one each at a gas stove, a fryer and a drink machine, plus 2 Brisk waiters; menu Sunny Rice Bowl, Peach Pancake Stack, Crunchy Sun Drumsticks, Honey Puff Nuggets, Peach Fizz Soda):

| Type | Share | avgCook | cap_s | cap_s / share |
|---|---|---|---|---|
| stove | 2/5 | 6 | 10.0 | 25.0 |
| fryer | 2/5 | 8.5 | 7.06 | **17.6** |
| drinks | 1/5 | 5 | 12.0 | 60.0 |

`kitchenCap` = 17.6, `serviceCap` = 12, margin (8 + 12 + 14 + 17 + 8) / 5 = 11.8, wages 3 × 3 + 2 × 2 = 13. With enough seats and arrivals, served = 12 and income ≈ 12 × 11.8 − 13 ≈ 129 coins/min (service-bound; a third waiter would be the next step). Pooling loss, for honesty: a stove-heavy menu (three stove dishes, the drumsticks and the soda) gives `kitchenCap` = 14.3, while three gas stoves and the same chefs on that menu would give 3 × 60 / 6.8 = 26.5.

*8.2 check.* A chef fully busy at any station makes `60 × margin per second` ≥ 96 coins/min of margin, against a wage of 2 to 6, so a chef who is working always pays. In example 2 the fryer chef enables about 4.8 fried dishes a minute (≈ 74 coins/min) and the drinks chef about 2.4 drinks (≈ 19 coins/min), both above their wage of 3. The trap to watch: a station whose chef is idle. In a small shop the kitchen is rarely the limit (example 1 is arrival-bound), so a second station plus chef only adds a wage, and a cheap drink lowers the average margin per guest the same way Sunny Rice Bowl does today. The hints below say this, and the station lock (7.1) keeps a new player from buying a station with nothing to make. At 5x5 the staff cap is 3, so a starter shop can run at most two station types with a waiter; that is a choice, not a block.

*Hints* (order, extending the list above; `{Station}` is Gas stove, Fryer or Drink machine, `{dish}` a menu dish):
1. No dining seat: as today.
2. No station at all: "Add a gas stove so the kitchen can cook".
3. No chef: as today.
4. No waiter or helper: as today.
5. Nothing on the menu is open: "Nothing on the menu can be made: add a {Station} for {dish}, or put a gas stove dish on the menu" (or "hire a chef for the {Station}" when the station exists).
6. Trash: as today.
7. A menu dish is not open: "{dish} needs a {Station}" or "{dish} needs a chef at the {Station}".
8. Shortfall: seats as today; kitchen names the binding type `s`: "{Station} is busy: hire a chef" when a station of `s` has no chef, else "{Station} is busy: add a {Station} and a chef", or "…or take a {Station} dish off the menu" when `s` holds more than half the menu; service as today.
9. Idle: "A chef has no station: add a gas stove, fryer or drink machine"; "The {Station} has nothing on the menu: add a {type} dish".
10. Low appeal or high prices: as today.

The breakdown's Kitchen row lists each open type (for example "Gas stove 25/min · Fryer 17.6/min · Drinks 60/min"), with the binding one marked.

### 8.2 Balance principles
- More seats with too few staff means wasted seats; the UI should hint at the bottleneck ("Not enough staff" / "Not enough seats" / "Low appeal").
- Raising prices has diminishing returns.
- Wages are always lower than the income they enable, so hiring is never a trap.

**Balance pass (Phase 3f).** Runs were made with `cozyDebug.measure(seconds)` (the sim stepped at 20 steps a second, 15 to 20 sim minutes per window) on the 5x5 starter layout (2 tables, 4 dining seats, 1 stove) with different crews. What was found and changed:
- The live shop earned only about 60 to 70% of the estimate even with no dirt. Arrivals matched; the loss was guests who found every seat taken (random arrivals, about 30 s per seat) plus a crowd cap in the spawner (`customers < chairs + 3`) that dropped about 15% of arrivals. Fix: `seatBlock` (Erlang B) in the estimate, `SEAT_TURNOVER` set to 2 from the measured seat time, and the crowd cap raised to `chairs + 8` as a guard only. The live shop now sits at roughly 80 to 90% of the estimate (queueing in the kitchen and at the waiter accounts for the rest).
- Dirt: a hard turn-away at dirt 60 did not match the smooth `cleanFactor`; guests now turn away with probability `dirt / 100 * DIRT_PENALTY`, so live and estimate agree. With a waiter on the floor, dirt averaged about 1 to 2 (peaks near 10) at `TRASH_CHANCE` 0.55 and 0.9 s sweeping; it was raised to 0.8 and 1.6 s so trash is at least visible, but staff still keep it low: dirt only bites when nobody is free to sweep (no waiter or helper, or every one of them busy carrying plates), and the hint says what to do.
- Wages: starter crew (Brisk chef and waiter) netted about 45 coins/min after wages of 5; adding a Brisk helper (wage 1) raised the net to about 49. Staff only cost more than they earn when they are idle.
- Known limit: the estimate is steady-state, so it is a few percent above what a short session shows while the rating is still climbing.

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

- **Furniture:** picking a category in the build panel's strip shows its designs in a grid, each with its own price; tapping a design arms it for placing (tap it again to put it down). Placing a piece costs the chosen design's price. Restyling a selected piece (its design row appears in the card above the panel) to a different design costs the new design's price. Moving and rotating are free. The starting layout is pre-owned.
- **Floor and wallpaper** are painted piece by piece: one floor tile or one wall segment (one tile wide) per tap, so one room can mix designs. A tap costs that design's per-piece price. Repainting replaces the old design and charges the new price; tapping a piece that already has the design is free and does nothing.
- Floor and Wallpaper are their own categories in the strip; tapping a design starts painting with it. A running total of the current decorating run shows beside the selected design in the card above the panel, with a Done button. It resets when the player leaves the paint tool.
- If the player cannot afford a purchase, the action is blocked with a message and nothing changes. No refunds when pieces are replaced or removed.
- **Edit mode (3g1b):** while the player places, paints, removes, holds or has selected a piece in the room, guests and staff fade out and the people part of the sim (arrivals, walking, cooking, wages) pauses. When the player stops, they fade back in where they were and the time spent editing pays the current estimated income (never negative, capped at 8 hours, nothing under 10 seconds), so decorating never costs income. The storefront scene does not pause anything.
- New shops start with 300 coins.
- `DEV_MODE` in `index.html` (or `?free` in the URL) makes everything free for testing.

Prices (coins): table 30-55, chair 15-28, gas stove 60-110, fryer 85, drink machine 75 (3g5), plant 12-20, lantern 20-30 by design; wallpaper 4-9 per wall piece; floor 3-9 per tile.

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
| **3g** | Decor variety | Kitchen stations (gas stove, fryer, drink machine), chair and table styles with different shapes, partitions, arcade cabinet, patterned floor tiles |
| **4** | Storefront | 2D facade scene, sign and exterior decor, curb appeal. The outdoor lot (fence, garden plots) comes after the facade, as a later step |
| **5** | Offline earnings | Server time, welcome-back popup, cap and efficiency settings |
| **6** | Social | Firebase login, friend code, visit shops, likes, guestbook, help-friend cleaning, daily gift, achievements |
| **7** | Polish and live ops | Sound, tutorial, events, leaderboard, photo mode |

### 12.1 Status

| Phase | Status |
|---|---|
| 1 Decorate sandbox (incl. polish 1 to 7) | Done |
| 2 Customers and money | Done |
| 3 Staff and cleanliness | Done: 3a to 3f and polish A, B and C1/C2 (C3, the optional staff portrait pass, is still open). 3c trash and dirt (save v7), 3d tap-to-clean tip and staff sweeping, 3e trash hint, 3f balance pass (seat blocking, dirt matches cleanFactor). Next: Phase 4 |
| 3g Decor variety | In progress (3g0 to 3g7, see 12.3), runs before 4b: 3g0 done (looks approved), 3g1 done (Sims-style build panel: category strip, design grid with thumbnails, prices and count badges; designs can carry their own draw function; item name labels on hover and keyboard focus; no save change). 3g1b done (edit mode: while an item tool, paint, remove, a selection or a drag is active in the room, guests and staff fade out and the people sim pauses; the time spent editing pays the current estimate, capped at 8 hours, when the player stops; no save change).  3g2 done (five new floors: Mint checker, Kitchen tile, Slate tile, Pale planks, Green carpet with a dotted border where it meets another floor; two new wallpapers: Polka and Diamond border; styles appended to the lists, so no save change).  3g3 done (chairs Stool, High back, Booth seat that joins; tables Round pedestal, Diner; no save change). 3g4 spec approved (station rule in 7.1 and 8.1). 3g5 done (fryer and drink machine, six dishes with a station tag, `planKitchen()`, per-type kitchen cap, new hints, grouped menu sheet, level-locked designs; no save change); next 3g6 |
| 4 Storefront | In progress: 4a done (scene switch with shared camera and light, storefront island with the street path to the door; no save change). Next: 4b facade |
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
| 3c | Trash and dirt: spawn by customers served, dirt 0 to 100, `cleanFactor` in income, trash sprites, "plate" and "trash" bubbles, save v7. Done (see 7.2). A plain tap-to-pick-up was added here so the shop could not get stuck. | Sonnet |
| 3d | Tap-to-clean for the player (tip and XP) and idle cleaning for staff, helpers first. Done (see 7.2). | Sonnet |
| 3e | Bottleneck hint in the income panel (staff, seats, appeal, stoves). | Haiku |
| 3f | Balance pass with fast-forward runs through `cozyDebug` (`step` and `measure`, added under `?debug`). Wages must stay below the income they enable. Done (see 8.2). | Opus |

Done when: hiring raises income, ignoring dirt hurts income, old saves load, no console errors.

**Working rules for the whole plan**
- One step at a time, in order. After every sub-phase, stop and send the completion report in 12.2. Do not start the next one until the user replies.
- Update the table in 12.1 in the same commit as the work.
- Before each commit: open the game with `?debug`, check the console is clean, save and reload, and check 360px width.
- Stop and report instead of continuing if a step needs a change to CLAUDE.md, a save format change not planned here, or an error that cannot be fixed.
- Never push to GitHub unless asked. Do not commit unrelated pending changes (other chats may edit `project.md` or add reference files).
- Switch to the model in the Model column when the user changes it with `/model`; the assistant cannot change it itself.

**Phase 3g: Decor variety** (inspired by the user's gameplay reference; general ideas only, all art drawn fresh in code, CLAUDE.md rule 3 applies)
Why: decorating is the main pillar, but the catalog is 5 furniture types with colour swaps. Players want pieces that change the style of the room, not just its colour.
| Step | Work | Model |
|---|---|---|
| 3g0 | Mockup first (scratch file, not `index.html`): gas stove row, fryer, drink machine, 3 to 4 chair and table styles, a partition, an arcade cabinet and 4 floor tile patterns, at game scale. The user picks the looks. | Sonnet |
| 3g1 | Catalog structure and a Sims-style build panel: one icon per category in a strip (chairs, tables, stoves and stations, partitions, arcade, floor, wallpaper, lighting, plants), and under it a grid of designs (5 across on wide screens, 3 on a 360px phone) with the price under each, paging arrows or scrolling, and an owned count badge on a design the player already placed. Designs carry their own drawing function (so a design can change the shape, not only the colour), and items get a hover or focus label. No new items yet; existing ones move over unchanged. Cross-cutting (CATALOG, build bar, picking), so one careful pass. Done (see 3.2 and 8.4; partitions and arcade get their strip icons when 3g6 adds them). | Opus |
| 3g1b | Edit mode hides the people: while a build tool is open (furniture, decor, move, remove), guests and staff fade out, spawning and walking pause and no trash appears; when the player closes the tool they fade back in at the same spots and `assignStations()` re-plans. Time spent editing still pays the current `incomePerMin` (capped like the offline cap in 8.3), so decorating never costs income. Placement checks ignore people. | Sonnet. Done: `editing()` is true in the room when the tool is not Move, an item is selected or a drag is on; `peopleVis` fades people and bubbles in 0.25 s (instant with reduced motion); `simPeople` pauses while editing, coin pops and the door keep moving; `editBank` counts seconds and `payEditTime()` pays `floor(max(0, incomePerMin) × minutes)` on leaving (nothing under 10 s) with a toast and a coin flight |
| 3g2 | Floor and wallpaper designs with real patterns (checker, kitchen tile, carpet with a border motif, wood planks), drawn in code. Per-tile painting already supports zoned floors. Optional: a patterned border strip above a plain lower wall band. | Sonnet. Done: `kitchen` and `carpet` floor patterns (the carpet draws its dotted band on tile edges that meet another floor or the room edge), five floor styles and two wallpapers with a `deco` field (`dots`, `frieze`) |
| 3g3 | Chair and table styles that differ in shape and silhouette, not only colour (for example stool, high back, cushioned bench, booth seat, round and square tables), each with its own price. Same footprint and seat rules, so no save change. Connected seating (benches, booths) joins neighbours visually. | Sonnet. Done: chair designs Stool, High back and Booth seat, table designs Round pedestal and Diner, appended after the colour designs (saves load unchanged); shaped designs draw at scale 1 and carry `h`, `half` (width in tiles, used to keep a small gap between chair and table) and `sit` (seat height for the guest); a booth seat joins neighbours of the same design, rotation and row, with an arm only on free ends; new `cyl` primitive |
| 3g4 | Kitchen station design, text only: gas stove (the current stove, renamed), fryer and drink machine as 1x1 stations, one chef each. Decide whether dishes carry a `station` tag (a fryer cooks fried dishes, the drink machine pours drinks), how the 8.1 kitchen formula changes, the hint wording and the dish list. Write the decision into 7.1 and 8.1 before any code. | Opus. Done (spec): design A, every dish has a station; see "Stations (Phase 3g)" in 7.1 and "Station rule" in 8.1 |
| 3g5 | Build the stations from the 3g4 spec: `fryer_01` and `drinks_01` (prices 85 and 75, level-locked to Lv 3 and Lv 2) drawn with idle and working states and their chef poses, the stove relabelled Gas stove, a `station` tag on every dish plus six new dishes, `planKitchen()` shared by `economy()` and `assignStations()`, guests ordering only open dishes, per-type `kitchenCap`, the new hints and Kitchen row, the menu sheet grouped by station, cups for drinks. No save version change (v7 stays). | Sonnet. Done: `planKitchen()` is the one chef-to-station plan read by `economy()` and `assignStations()`; `isStation` and `stationFront` replace the `counter_01` checks; `orderableMenu()` and `reorderClosed()` keep guests on open dishes; `drawFryer`, `drawDrinks` and `drawCup` with idle, working and drip states; build designs show a "Lv N" badge and say why in a toast; keys 1 to 7 are unchanged (8 and 9 paint), so the two new stations are picked in the build panel only; starter layout estimate unchanged at 42.2 coins/min |
| 3g6 | Partition (1x1 panel that blocks its tile, placement still checks the path to every seat) and arcade cabinet (tap to collect coins, wears out and needs a repair tap or a helper). Save v8 stores the cabinet state; add the `migrate()` step. | Sonnet |
| 3g7 | Sweep: day and night, 360px, drag, place, rotate and remove, save and reload, old saves load, console clean. Re-run the 3f balance runs with the new stations. Update design.md. | Sonnet |

Free-form rule: stations, partitions and tables go anywhere the player likes. There is no kitchen zone, no required wall and no required divider; the only rules are the existing ones (a station's front tile stays clear for its chef, and every seat keeps a walkable path from the door). Station fronts and handles face the chef's tile, and rotation mirrors them like the current stove.

**3g5 plan (from the 3g4 spec).**
- *Save:* no version bump. New item ids `fryer_01` and `drinks_01` only appear in new saves; dishes `dish_07` to `dish_12` are appended, and the menu already stores `dishId`, so `sanitizeMenu` handles them. Older saves (stove only, dishes 1 to 6) load unchanged and earn the same (8.1 example 1). v8 stays reserved for 3g6.
- *Order of work:*
  1. DECOR DATA and CATALOG: `fryer_01` and `drinks_01` entries with `station`, `cat: 'stations'`, `h`, `ITEM_SCALE`, `APPEAL` 3 each, one design each in `VARIANTS` (a second colour later if the user wants); `counter_01` gets `station: 'stove'` and the label Gas stove; add both to the stations category and `TOOL_ORDER`; level lock (`unlock`) shown as a badge in the build grid.
  2. ITEMS: `drawFryer` and `drawDrinks` ported from `scratch/mockup-decor.html` (idle and working states, side tray, drip tray, progress ring as on the stove); `drawCup` for drinks on the tray, in hand, on the table and empty.
  3. SIM: `station` on each dish, the six new dishes, `MENU_MAX` = 8; `isStation(it)` and `stationFront(it)` replace the `counter_01` checks (placement front rule, `trashTileFree`); `economy()` uses `planKitchen()`, `sold`, per-type caps and the new hints; `updateCustomer` picks from open dishes; `updateKitchen` takes the first order of its type; `reorderClosed()` from `simOnLayout()` and `staffOnLayout()`; the Kitchen breakdown row per type.
  4. STAFF: `planKitchen()` (chef to station plan, open types); `assignStations()` uses it; chef poses at the fryer and drink machine in the body update and `drawChibi` call.
  5. ACTIONS: menu sheet grouped by station with the "needs a …" note; toast when a locked station is tapped.
  6. Check: `?debug`, `cozyDebug.measure` on the starter layout (must match the pre-3g5 numbers) and on a three-station layout, console clean, save and reload, 360px.
- *Risks:* per-type queues pool less than one queue, so the live shop may sit a little further below the estimate than the 80 to 90% measured in 3f (re-measure in 3g7); if `planKitchen()` is not the single source for both the estimate and the floor, they drift; a 5x5 room gets crowded (each station needs two tiles); the drink cup is new art in four places; hint text grows, so it must still fit at 360px.
- *Open questions for the user* (recommended default in brackets):
  - Q1. Every dish has a station (design A), with no drink-on-the-side bonus? [yes]
  - Q2. Drinks priced like cheap quick dishes (Peach Fizz Soda earns like Sunny Rice Bowl), so they help when the kitchen is busy rather than adding money per guest? [yes]
  - Q3. Fryer and drink machine locked until their first dish (fryer Lv 3, drink machine Lv 2)? [yes]
  - Q4. Menu cap raised from 6 to 8 slots (8 at Lv 25)? [yes]
  - Q5. When a station closes, waiting guests order again from what is open, instead of leaving? [yes]
  - Q6. The six dish names and the fryer and drink machine prices (85 and 75) as written in 8.1 and 7.1? [yes, rename any freely]
  - Q7. A drink takes a seat and the same time as a meal (no quick "drink and go" guests)? [yes, keeps the seat model; a takeaway counter could come later]

Order notes: 3g0 to 3g3 are looks and need no save change; 3g4 and 3g5 change gameplay but not the save; 3g6 changes the save (v8). Phase 3 polish C3 (staff portrait) stays optional and can be done any time.

Not part of 3g: the outdoor lot (fence, garden plots, path pieces), wall-mounted items and the trophy wall. They come with Phase 4 or later.

Done when: the catalog offers several clearly different styles per furniture type, the kitchen has more than one kind of station, and nothing breaks at 360px.

**Phase 4: Storefront**
| Step | Work | Model |
|---|---|---|
| 4a | Scene switcher with shared camera and lighting, street path to the door. Done (see 3.1). | Opus |
| 4b | Facade drawn in code: building, door, windows, sign with the shop name. Roof and window styles come as choosable designs, using the 3g1 catalog structure. | Sonnet |
| 4c | Exterior decor slots and a build-mode shop for them (sign, awning, lanterns, plants, statues, bench). Design the data model first, then build; next free save version (v8 is taken by 3g6, so this is v9). | Opus |
| 4d | `curbAppeal` and `nightBonus` feed the appeal formula (today `curbAppeal` is fixed at 0 in `economy()`). | Haiku |
| 4e | Customers walk in from the street to the door. | Sonnet |
| 4f | Later, optional: the outdoor lot (fence, garden plots, path pieces) and a skyline backdrop behind the street. | Sonnet |

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
