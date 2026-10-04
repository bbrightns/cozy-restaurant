# Character art spec

How to make painted character art for the game. The loader is in `index.html` (`// ===== CHARACTER ART =====`). Until a character has every file it needs, that person is drawn in code, so art can arrive one character at a time and nothing breaks.

There are two modes. **Whole-character mode (the plan)** uses 12 finished characters. A layered mode (recolourable parts) is also supported by the loader but is not planned; see the appendix.

Check progress at any time: open the game with `?debug` and run `cozyDebug.art()` in the browser console. `cast` lists, per character, what the manifest still lacks (`lacks`) and its load state (`unused` until someone in the game uses it, then `loading`, `ready` or `bad`).

## 1. The cast: 12 characters

| Pool | Ids | Used by | Files per character |
|---|---|---|---|
| Chefs | `chef1` `chef2` `chef3` `chef4` | the **chef** role | 12 body frames + `portrait` = **13** |
| Staff | `staff1` `staff2` `staff3` `staff4` | the **waiter** and **helper** roles | 12 body frames + `portrait` = **13** |
| Guests | `guest1` `guest2` `guest3` `guest4` | customers | 12 body frames = **12** |

**Total: 8 x 13 + 4 x 12 = 152 files.**

- Staff are saved with a `cast` number (0 to 3), so a hired person keeps their face. The hire list avoids showing the same character twice when it can. Guests pick a random character on arrival.
- Waiters and helpers share the staff pool because both wear a service look. If helpers should look different later, add a `helper` pool (a small code change).
- The same character can appear many times on a busy day (up to 10 staff and many guests), so keep each character distinct in silhouette, hair and colour.

## 2. Image sizes and anchors

| File | Canvas | Notes |
|---|---|---|
| Body frame | **17:24 shape. Recommended 272 x 384 px. Minimum 136 x 192.** | Transparent background. An exact 2x (544 x 768) also works but uses 4x the memory. |
| `portrait` | **Square. Recommended 256 x 256 px. Minimum 128 x 128.** | Head and shoulders, centred, transparent background. The game puts it on a cream circle (44 px) in the staff panel. |

Body frame layout (shown for 272 x 384; scale for other sizes):

- **Feet centre at (136, 352)**: the middle of the figure is the horizontal centre and the soles sit on the line 32 px (8%) above the bottom edge. The game puts this point on the floor tile.
- **Standing height: about 300 px** from the soles to the top of the hair or hat (top edge near y = 52). Maximum width about 200 px. Chef hats count as part of the height.
- **Every character the same height** (within about 5%), and **the same scale in every frame** of a character. Do not rescale a frame to fit; walking must not make the character grow or shrink.
- **Never trim or crop** the canvas. Every frame of every character uses the same canvas, so the feet stay on the same spot.
- Leave a margin: nothing may touch the canvas edge.
- Frames that are the wrong shape are ignored (the game prints a console warning with the file name) and that character stays code-drawn.

## 3. Views, poses and frames (12 body frames per character)

- **Two views: `f` (front, facing the camera) and `b` (back, facing away).** Both may be turned slightly toward screen right. The game **mirrors** them in code for the left-facing directions, so never paint left-facing versions. Avoid text, logos or one-sided details that would look wrong mirrored.
- Poses:

| Pose | Frames | Notes |
|---|---|---|
| `idle` | `0` | Standing. The game adds a small breathing bob. |
| `walk` | `0`, `1`, `2`, `3` | One stride that loops 0, 1, 2, 3: `0` = contact (one foot forward, opposite arm forward), `1` = passing (legs together, one foot lifted), `2` = contact with the other foot forward, `3` = passing. Keep the head height almost constant; the game adds the body bob. |
| `sit` | `0` | Seated on a chair, legs bent forward. Used only for guests, but staff need it too (the loader requires all 12 frames so any character can be any role later). The head sits about **44 px (11%) lower** than standing, because the body drops onto the seat. Nothing below the sole line. |

Not in v1: carried plate, cooking and eating poses. In whole-character mode the game does not draw the code-made stirring hand and spoon or the plate-holding hand, so a carried plate floats in front of the body. A later step can add `carry`, `cook` and `eat` frames.

## 4. Consistency rules (the same person in all 12 frames)

- Same face, hair, hat, clothes, accessories and colours in every frame. Check the sit frame and the back view especially.
- The front head in the `portrait` matches the front frames.
- The back view shows the back of the same hair and hat.
- Same line quality and shading in every frame. Soft pastel and low contrast. No pure black or pure white. A darker tone of the part's own colour for edges instead of black outlines (see `design.md`).
- No ground shadow inside the image; the game draws the shadow.
- Hold the walk frames to one stride length so characters do not look like they slide.

## 5. Folder structure and file names

All names are **lowercase letters, digits and underscores**. One format only, **`.webp` (with alpha) or `.png`**, never both. Keep every file well under 40 KB if you can (WebP, quality about 90).

```
assets/
  SPEC.md                        this file
  CREDITS.md                     source and license of every art file (required)
  characters/
    manifest.js                  generated; lists the files that exist
    make-manifest.ps1            regenerates manifest.js
    cast/
      chef1/   portrait.webp
               f_idle_0.webp  f_walk_0.webp  f_walk_1.webp  f_walk_2.webp  f_walk_3.webp  f_sit_0.webp
               b_idle_0.webp  b_walk_0.webp  b_walk_1.webp  b_walk_2.webp  b_walk_3.webp  b_sit_0.webp
      chef2/ ... chef4/          same 13 files
      staff1/ ... staff4/        same 13 files
      guest1/ ... guest4/        same 12 files (no portrait)
    removed-bg/, white-bg/       your source sheets; ignored by the game and the manifest tool
```

After adding or removing files, regenerate the manifest (from the repo root):

```
powershell -ExecutionPolicy Bypass -File assets/characters/make-manifest.ps1
```

It rewrites `manifest.js` (with `enabled: false` when there are no art files). Only `head/`, `body/` and `cast/` are scanned. Serve the game from a small local server while testing; opening `index.html` as a plain file can make some browsers block image handling.

## 6. Checklist

Tick off per character (all 12 body frames and, where listed, the portrait):

| Id | Role in game | Portrait | f_idle | f_walk 0-3 | f_sit | b_idle | b_walk 0-3 | b_sit |
|---|---|---|---|---|---|---|---|---|
| `chef1` to `chef4` | chef | yes | 1 | 4 | 1 | 1 | 4 | 1 |
| `staff1` to `staff4` | waiter, helper | yes | 1 | 4 | 1 | 1 | 4 | 1 |
| `guest1` to `guest4` | customer | no | 1 | 4 | 1 | 1 | 4 | 1 |

Your current sheets (`chef.png`, `staff.png`, `customer.png`) match this plan as `C1` to `C4` = `chef1` to `chef4`, `S1` to `S4` = `staff1` to `staff4`, `Cu1` to `Cu4` = `guest1` to `guest4`, and the sheet's front head image is the `portrait`. The sheets are 1024 px wide, so each frame is only about 120 px wide; render or upscale each frame to at least 136 x 192 (ideally 272 x 384) before cutting.

## 7. How the game uses it

- Each character loads the first time somebody uses it (a hire list candidate, a staff member, a guest), not at start-up, so a full set costs nothing until it is seen.
- Frames are drawn once into the same cached sprite the code-drawn people use, with the day and night light baked in, so there is no per-frame cost. `drawChibi` still does the placing, shadow, mirroring, breathing bob and bubble anchors.
- A character needs **every** file listed for it in the manifest. If any are missing, or a frame is the wrong shape, it stays code-drawn (the console says which) and the hire list and new guests prefer characters that are complete.
- The staff panel shows the `portrait` for cast characters and the old code-drawn portrait for the rest.
- The look parts (hair style, face, accessory, colours) still exist in saves and code; cast art overrides them while a character is complete.
- Saves: v6 adds `cast` (0 to 3) to each staff entry. Older saves get a cast number from their id, so it does not change between reloads.

## 8. Rules for the art itself

- Original work only (CLAUDE.md rule 3). List every file's source and license in `assets/CREDITS.md`.
- Pastel, low contrast, cozy (see `design.md` sections 3, 6 and 7).

## Appendix: layered mode (supported, not planned)

If recolourable parts are ever wanted, the loader also accepts layers under `head/` and `body/`: head layers on a 272 x 272 canvas with the head centre at (136, 160), and body layers on a 272 x 384 canvas with the feet at (136, 352) and the torso top at y = 228 standing or 272 sitting. Skin, hair, guest shirt, pants and scarf are painted in neutral grey and multiplied by the saved colour; eyes, faces, accessories, hats and staff outfits are painted in final colour. The full list (141 files) is `artRequired()` in `index.html`; its names are `head/skin/{f,b}`, `head/hair/<style>/{back_f,front_f,b}`, `head/eyes/<plum|cocoa|dusk>_<open|blink|happy>`, `head/face/<face>`, `head/acc/...`, `head/hat/<chef|helper>_<f|b>`, `body/skin/<view>_<pose>_<n>` and `body/outfit/<set>/<view>_<pose>_<n>`. A character drawn from the cast takes priority over layers.
