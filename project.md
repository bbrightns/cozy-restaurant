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

**Staff model (Phase 3a).** These rules are in use from Phase 3a on.

| Role | Job | Work power |
|---|---|---|
| **Chef** | Cooks at a counter. One chef per counter; extra chefs wait for a free counter. | speed |
| **Waiter** | Carries plates from the kitchen to the table. | speed |
| **Helper** | Lends a hand with plates at half pace. From Phase 3c, helpers clean first. | 0.5 × speed |

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

Phase 3a is the model, hire list and economy. Staff drawn walking on the floor is Phase 3b; trash, dirt and cleaning are Phase 3c (section 12).

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

- In the live sim, each chef is assigned to one counter (fastest chefs first) and cooks a dish in `cookTime / speed` seconds. A finished plate waits until a waiter or helper is free; each delivery keeps that person busy for `60 / (SERVES_PER_WAITER * power)` seconds. This matches `kitchenCap` and `serviceCap`.
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

- Show a "Welcome back" popup: time away, coins earned, customers served.
- Optional: collect with a button (satisfying coin burst animation).

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
- **Prototype:** single HTML file, localStorage save, no external resources.
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
| 3c | Trash and dirt | Trash spawns, dirt level, tap-to-clean, idle staff and helpers clean |
| **4** | Storefront | 2D facade scene, sign and exterior decor, curb appeal |
| **5** | Offline earnings | Server time, welcome-back popup, cap and efficiency settings |
| **6** | Social | Firebase login, friend code, visit shops, likes, guestbook, help-friend cleaning, daily gift, achievements |
| **7** | Polish and live ops | Sound, tutorial, events, leaderboard, photo mode |

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
