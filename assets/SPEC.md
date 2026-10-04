# Character art spec

How to make painted character art for the game. The loader is in `index.html` (`// ===== CHARACTER ART =====`). Until a look has every layer it needs, that person is drawn in code, so art can arrive a layer at a time and nothing breaks.

A full set is **141 layer files**. Check what is still missing at any time: open the game with `?debug` and run `cozyDebug.art()` in the browser console (it returns `on`, `pending`, `loaded` and the `missing` list).

## 1. Canvas sizes and anchors

The game measures people in "chibi units". Art is drawn at **8 px per unit**. An exact multiple (2x = 544 x 768) also works and looks crisper when zoomed; mixed sizes inside one group do not.

| Group | Canvas | Anchor (inside the canvas) |
|---|---|---|
| **Body** layers (`body/...`) | **272 x 384 px** (34 x 48 units) | Feet centre at **(136, 352)** |
| **Head** layers (`head/...`) | **272 x 272 px** | Head centre at **(136, 160)** |

- Every layer in a group uses the same canvas, transparent background, so layers line up by stacking. Never crop or trim.
- Body: the **torso top (neck base) is at y = 228** when standing and **y = 272** when sitting (15.5 and 10 units above the feet). Body art has **no head**.
- The game puts the head centre 4.6 units above the torso top (standing: 191 px, sitting: 235 px, measured on the body canvas), so the head canvas lands on the neck by itself. Leave the head canvas room for hats above (about 160 px) and long hair below (about 100 px).
- Head size: a head is about **13 units (104 px) wide**. The on-screen size is set in code (`PERSON_SCALE`), so only draw to the proportions above.

If a file has the wrong size the game ignores it, prints a console warning with the expected size, and falls back to code drawing.

## 2. Views, poses and frames

- **Two views only: `f` and `b`.** `f` faces the camera, `b` has its back to the camera. Both are **turned slightly toward screen right** (about 20 degrees), because the game **mirrors them in code** for the left-facing directions. Never paint left-facing versions.
- **Poses** (body layers only; heads have one image per view):

| Pose | Frames | Notes |
|---|---|---|
| `idle` | `0` | Standing. The game adds a small breathing bob. |
| `walk` | `0`, `1`, `2`, `3` | One stride: `0` = contact (one foot forward, opposite arm forward), `1` = passing, `2` = contact with the other foot forward, `3` = passing. Loops 0, 1, 2, 3. The game adds the body bob. |
| `sit` | `0` | Seated at a table, only the upper body shows above the table. |

Not in v1 (the game draws these on top in code): carried plate, stirring spoon, eating hand.

## 3. Layers, bottom to top

| # | Layer | Folder | Colour |
|---|---|---|---|
| 1 | Hair behind the head (front view only, 4 styles) | `head/hair/<style>/back_f` | **tinted** (hair colour) |
| 2 | Body skin (hands, bare arms) | `body/skin/` | **tinted** (skin colour) |
| 3 | Outfit (see section 5) | `body/outfit/<set>/` | per set |
| 4 | Head skin | `head/skin/` | **tinted** (skin colour) |
| 5 | Face: blush and mouth (front only) | `head/face/<face>` | final colour |
| 6 | Eyes (front only) | `head/eyes/<eye>_<state>` | final colour |
| 7 | Glasses or freckles (front only) | `head/acc/<acc>_f` | final colour |
| 8 | Hair in front (front view) or the whole back of the head (back view) | `head/hair/<style>/front_f`, `.../b` | **tinted** (hair colour) |
| 9 | Hat (chef and helper only) | `head/hat/<role>_<view>` | final colour |
| 10 | Hair clip (star, flower) | `head/acc/<acc>_<view>` | final colour |

Layers 1 and 3 to 10 follow the head or body they belong to; the loader handles the positions.

### Tinted layers (skin, hair, guest shirt, pants, scarf)

Paint these in **neutral light grey with the shading baked in** (no colour at all). The game **multiplies** them by the saved colour, so the brightest highlights should be near white and shadows a darker grey. Pure white is allowed here because the layer is never shown raw. This is how a few images serve every skin tone, hair colour and guest outfit.

Reference palettes the game multiplies by (so you know what the end result looks like):

| What | Colours |
|---|---|
| Skin (4) | `#ffdcc4` `#f1c3a0` `#d9a07c` `#b57a5a` |
| Hair (7) | `#7a5a6e` `#a9785c` `#5e5a7a` `#e2b38a` `#c97b7b` `#e8a5b4` `#a99bc4` |
| Guest shirt (6) | `#ff9fb2` `#7fb8e6` `#f6d27a` `#ffb5a7` `#e8a06a` `#a8d58f` |
| Guest pants (4) | `#8e7cc3` `#7a9cc6` `#a98f80` `#6f9e95` |
| Guest scarf (5) | `#f4978e` `#f6d27a` `#7fb8e6` `#e8a06a` `#c9a0dc` |

At night the whole sprite is also multiplied by the ambient light, so paint for daytime.

### Final-colour layers

Eyes, face, accessories, hats and the staff outfits are painted in their real colours (they are only multiplied by the day/night light). Staff colours to keep (from the code-drawn version): chef top `#fff1e2` with a `#8a6f7e` apron and a tall white hat; waiter top `#8e78b8` with a `#6f5c9c` vest and a coral `#ffb5a7` bow; helper top `#5fae98` with a `#f6d27a` apron and headband. Every staff outfit keeps a cream **name badge with a coral dot** on the chest (front view only) so staff and guests stay easy to tell apart.

## 4. Folder structure and file names

All names are **lowercase letters, digits and underscores**. One format only, **`.webp` (with alpha) or `.png`**, never both. Everything lives under `assets/characters/`.

```
assets/
  SPEC.md                       this file
  CREDITS.md                    source and license of every art file (required)
  characters/
    manifest.js                 generated; lists the files that exist
    make-manifest.ps1           regenerates manifest.js
    head/
      skin/        f.webp  b.webp
      hair/<style>/  back_f.webp (4 styles only)  front_f.webp  b.webp
      eyes/        <eye>_open.webp  <eye>_blink.webp  <eye>_happy.webp
      face/        <face>.webp
      acc/         star_f  star_b  flower_f  flower_b  glasses_f  freckles_f   (.webp)
      hat/         chef_f  chef_b  helper_f  helper_b                           (.webp)
    body/
      skin/        <view>_<pose>_<n>.webp
      outfit/<set>/  <view>_<pose>_<n>.webp
```

`<view>` is `f` or `b`, `<pose>` is `idle`, `walk` or `sit`, `<n>` is the frame number. Example: `body/outfit/chef/f_walk_2.webp`.

After adding or removing files, run (from the repo root):

```
powershell -ExecutionPolicy Bypass -File assets/characters/make-manifest.ps1
```

It rewrites `manifest.js` (with `enabled: false` when no art files exist). Serve the game from a small local server while testing; opening `index.html` as a plain file can make some browsers block image handling.

## 5. Art checklist (built from the ids in `index.html`)

The ids come from `HAIR_STYLES`, `FACES`, `ACCS`, `EYE_COLS`, `ROLES` and the outfit sets in the loader. If one of those lists changes in code, this list changes too (`cozyDebug.art().missing` always shows the live truth).

### Head (272 x 272, views `f` and `b`)

| Layer | Ids | Files |
|---|---|---|
| Skin (tinted) | none | `head/skin/f`, `head/skin/b` (2) |
| Hair (tinted) | `fluffy`, `messy`, `bob`, `bun`, `twin`, `long`, `curly`, `buzz` | `head/hair/<style>/front_f` and `head/hair/<style>/b` for all 8 (16); **plus** `head/hair/<style>/back_f` for `bob`, `bun`, `twin`, `long` only (4) |
| Eyes | `plum` (`#4a3340`), `cocoa` (`#5a3e2e`), `dusk` (`#3f3b5c`), each in `open`, `blink`, `happy` | `head/eyes/<eye>_<state>` (9). `blink` = closed lid line; `happy` = happy arcs, used when the face is `happy` |
| Face (blush and mouth) | `smile`, `grin`, `cat`, `happy` | `head/face/<face>` (4). Eyes are not in this layer. |
| Accessories | `glasses`, `freckles` (front only); `star`, `flower` (hair clips, both views); `none` has no file | `head/acc/glasses_f`, `head/acc/freckles_f`, `head/acc/star_f`, `head/acc/star_b`, `head/acc/flower_f`, `head/acc/flower_b` (6) |
| Hats | chef (tall white hat), helper (headband); waiter and guests have none | `head/hat/chef_f`, `chef_b`, `helper_f`, `helper_b` (4) |

Head subtotal: **2 + 20 + 9 + 4 + 6 + 4 = 45** files.

Hair notes: `front_f` is the fringe and top. `b` is the entire back of the head (it also covers the head, and for `bob` and `long` it falls over the shoulders). `back_f` is only the part that hangs behind the head and shoulders. `curly` is all in `front_f`.

### Body (272 x 384)

Each folder below needs the **12 frames** `f_idle_0`, `f_walk_0..3`, `f_sit_0`, `b_idle_0`, `b_walk_0..3`, `b_sit_0`.

| Folder | What it contains | Colour |
|---|---|---|
| `body/skin/` | Hands (and bare arms if any), under the sleeves | tinted skin |
| `body/outfit/chef/` | Full chef uniform: torso, apron, legs, shoes | final |
| `body/outfit/waiter/` | Full waiter uniform: torso, vest, bow, legs, shoes | final |
| `body/outfit/helper/` | Full helper uniform: torso, apron, legs, shoes | final |
| `body/outfit/guest_pants/` | Guest legs | tinted pants |
| `body/outfit/guest_shoes/` | Guest shoes | final |
| `body/outfit/guest_shirt/` | Guest torso and sleeves | tinted shirt |
| `body/outfit/guest_scarf/` | Guest scarf (a little bag may go in `guest_shirt`) | tinted scarf |

Body subtotal: 8 folders x 12 = **96** files. **Total: 45 + 96 = 141.**

Staff look parts are saved as palette indices and names, and the same ones are shared with guests, so no extra art is needed per person.

## 6. How the game uses it

- Layers are composited **once** into the same cached sprite the code-drawn people use, so there is no per-frame cost. The sprite is rebuilt when the pose, look or day/night light step changes.
- `drawChibi` still places the figure, shadow, bob, mirroring and bubble anchors, and still draws carried plates and the stirring spoon over the figure.
- A person only uses art when **every layer it needs exists** (all views and frames for its role, hair style, eye, face and accessory). Otherwise that person is drawn in code. Layers load at start-up; until they have all loaded, everyone is drawn in code.
- The staff panel portraits (`avatarSvg`) are still drawn in code for now.

## 7. Rules for the art itself

- Original work only (CLAUDE.md rule 3). List every file's source and license in `assets/CREDITS.md`.
- Pastel, low contrast, no pure black and no pure white in final-colour layers; shadows are a darker, more saturated version of the surface colour; no hard black outline (use a darker tone of the part's own colour, like the code version). See `design.md` sections 3, 6 and 7.
- Keep files small: WebP quality about 90, trimmed metadata. A 272 x 384 layer should be well under 40 KB.
