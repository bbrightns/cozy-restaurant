  /* ---- Polish C2 painter (scratch copy; this block is pasted into index.html as is) ---- */
  const STAFF_TOP = { chef: rgb('#fff1e2'), waiter: rgb('#8e78b8'), helper: rgb('#5fae98') };
  const GUEST_SCARF = ['#f4978e', '#f6d27a', '#7fb8e6', '#e8a06a', '#c9a0dc'].map(rgb);
  const CAP = {
    white: rgb('#fbf0e3'), whiteDeep: rgb('#efdfcc'), band: rgb('#f6d27a'), bow: rgb('#ffb5a7'), apron: rgb('#8a6f7e'), vest: rgb('#6f5c9c'),
    apronY: rgb('#f6d27a'), blush: rgb('#ff9f96'), mouth: rgb('#b8566a'), cream: rgb('#fff8ef'), button: rgb('#d8b08c'), sole: rgb('#f3e2cf')
  };
  const dimRgb = (c, f) => [c[0] * f, c[1] * f, c[2] * f];
  const tintRgb = (c, t) => [c[0] + (255 - c[0]) * t, c[1] + (255 - c[1]) * t, c[2] + (255 - c[2]) * t];

  /* Chibi proportions in chibi units, feet at 0 and y up negative. The head is about 56% of a standing figure (14.8 of 26.5).
     top / topSit: torso top above the feet; headUp: head centre above the torso top; rx, ry: head radii. */
  const CHIBI = { top: 12.5, topSit: 7.5, headUp: 6.6, rx: 8, ry: 7.4 };
  const headRise = (sitting) => (sitting ? CHIBI.topSit : CHIBI.top) + CHIBI.headUp;   // head centre height above the feet

  /* Paints one figure with the feet at (0, 0), y up is negative. Every outline is a curve: a soft mochi head, a body with a neck,
     round shoulders, a waist and a flared hem, puffy sleeves with cuffs, mitten hands, calf-shaped legs and round-toed shoes with
     soles. pose: back (seen from behind), turn (front view turned further toward the camera, chefs at the stove), st (walk step
     -1 to 1), stir (the near arm reaches out to stir), eat (0 to 3 while eating, else -1), blink. Front views look toward +x; the caller mirrors the sprite for left. */
  function paintChibi(g, b, sitting, pose, scarf) {
    const p = b.look || b, role = b.role, tc = role ? STAFF_TOP[role] : b.shirt;
    const back = !!pose.back, turn = !back && !!pose.turn, st = pose.st || 0;
    const top = sitting ? -CHIBI.topSit : -CHIBI.top, th = sitting ? 7.5 : 7.9, hem = top + th;
    const hy = top - CHIBI.headUp, rx = CHIBI.rx, ry = CHIBI.ry, style = p.hairStyle, PI = Math.PI;
    const hair = b.hair, hairDeep = dimRgb(hair, 0.84), hairLite = tintRgb(hair, 0.42);
    const fo = back ? 0 : turn ? 1.7 : 0.8;   // how far the face and fringe part sit toward the way the head looks
    const rr = (x, y, w, h, r) => { g.beginPath(); if (g.roundRect) g.roundRect(x, y, w, h, r); else g.rect(x, y, w, h); };
    const ci = (x, y, r) => { g.beginPath(); g.arc(x, y, r, 0, PI * 2); };
    // one part: light-to-dark across the body, then an edge tone of its own colour
    const part = (c, build, edge) => {
      build();
      const gr = g.createLinearGradient(-7, 0, 7, 0);
      gr.addColorStop(0, lit(c, 1.07));
      gr.addColorStop(1, lit(c, 0.84));
      g.fillStyle = gr;
      g.fill();
      if (edge !== false) { g.strokeStyle = lit(c, 0.74); g.lineWidth = 0.5; g.stroke(); }
    };
    const flatFill = (c, build, a) => { build(); g.fillStyle = lit(c, 1, a); g.fill(); };
    const ink = (c, w, a, build) => { build(); g.strokeStyle = lit(c, 1, a); g.lineWidth = w; g.stroke(); };
    const clipped = (path, fn) => { g.save(); path(); g.clip(); fn(); g.restore(); };
    // a soft blob: colour c at alpha a in the middle fading to clear at the rim, squashed to an rx by ry ellipse
    const soft = (c, x, y, sx, sy, a) => {
      g.save();
      g.translate(x, y);
      g.scale(1, sy / sx);
      const gr = g.createRadialGradient(0, 0, 0, 0, 0, sx);
      gr.addColorStop(0, lit(c, 1, a));
      gr.addColorStop(1, lit(c, 1, 0));
      g.fillStyle = gr;
      g.beginPath(); g.arc(0, 0, sx, 0, PI * 2); g.fill();
      g.restore();
    };
    // hair: lit from the upper left, deepening toward the nape, with an edge tone of its own colour
    const hairFill = (c, build, edge) => {
      build();
      const gr = g.createRadialGradient(-2.6, hy - 4.2, 0.4, 0, hy, rx + 7);
      gr.addColorStop(0, lit(c, 1.12));
      gr.addColorStop(0.5, lit(c, 1));
      gr.addColorStop(1, lit(c, 0.78));
      g.fillStyle = gr;
      g.fill();
      if (edge !== false) { g.strokeStyle = lit(c, 0.72); g.lineWidth = 0.45; g.stroke(); }
    };
    g.lineCap = 'round';
    g.lineJoin = 'round';

    /* ---------------- shapes ---------------- */
    // body: round shoulders, a waist and a hem that flares and dips a little in the middle; the neckline dips in front
    const torsoPath = () => {
      const sh = 4.3, wa = 3.5, hm = 4.65, y0 = top - 0.1;
      g.beginPath();
      g.moveTo(-1.7, y0);
      g.quadraticCurveTo(-sh + 0.15, y0, -sh, y0 + 1.7);
      g.bezierCurveTo(-sh - 0.05, y0 + 3, -wa, y0 + 3.5, -wa, y0 + 4.6);
      g.bezierCurveTo(-wa, hem - 1.7, -hm, hem - 1, -hm, hem - 0.25);
      g.quadraticCurveTo(0, hem + 0.95, hm, hem - 0.25);
      g.bezierCurveTo(hm, hem - 1, wa, hem - 1.7, wa, y0 + 4.6);
      g.bezierCurveTo(wa, y0 + 3.5, sh + 0.05, y0 + 3, sh, y0 + 1.7);
      g.quadraticCurveTo(sh - 0.15, y0, 1.7, y0);
      g.quadraticCurveTo(0, y0 + (back ? 0.5 : 1.5), -1.7, y0);
      g.closePath();
    };
    // a soft mochi head: round on top, full cheeks, a broad chin
    const headPath = () => {
      g.beginPath();
      g.moveTo(0, hy - ry);
      g.bezierCurveTo(rx * 0.6, hy - ry, rx, hy - ry * 0.56, rx, hy + 0.3);
      g.bezierCurveTo(rx, hy + ry * 0.74, rx * 0.56, hy + ry, 0, hy + ry);
      g.bezierCurveTo(-rx * 0.56, hy + ry, -rx, hy + ry * 0.74, -rx, hy + 0.3);
      g.bezierCurveTo(-rx, hy - ry * 0.56, -rx * 0.6, hy - ry, 0, hy - ry);
      g.closePath();
    };
    // the hair that sits behind the head: behind the body in front views, falling over the back in back views
    const NAPE = { buzz: ry - 2.4, bun: ry - 1.5, twin: ry - 1.1, fluffy: ry - 0.6, messy: ry - 1.2, curly: ry + 0.4 };
    const massPath = () => {
      const R = rx + 0.55, T = hy - ry - 0.7;
      g.beginPath();
      g.moveTo(0, T);
      if (style === 'bob') {
        g.bezierCurveTo(rx * 0.7, T - 0.1, rx + 1.2, hy - ry * 0.5, rx + 1.35, hy + 1.6);
        g.bezierCurveTo(rx + 1.5, hy + 4.6, rx + 0.9, hy + 6.8, rx - 0.9, hy + 6.8);
        g.quadraticCurveTo(0, hy + 7.7, -rx + 0.9, hy + 6.8);
        g.bezierCurveTo(-rx - 0.9, hy + 6.8, -rx - 1.5, hy + 4.6, -rx - 1.35, hy + 1.6);
        g.bezierCurveTo(-rx - 1.2, hy - ry * 0.5, -rx * 0.7, T - 0.1, 0, T);
      } else if (style === 'long') {
        const by = top + 6.4;
        g.bezierCurveTo(rx * 0.7, T - 0.1, rx + 1.05, hy - ry * 0.5, rx + 1.15, hy + 2);
        g.bezierCurveTo(rx + 1.4, hy + 6.5, rx + 0.7, by - 3, rx - 0.3, by);
        g.quadraticCurveTo(5.4, by + 1.7, 2.6, by + 0.2);
        g.quadraticCurveTo(0, by + 1.9, -2.6, by + 0.2);
        g.quadraticCurveTo(-5.4, by + 1.7, -rx + 0.3, by);
        g.bezierCurveTo(-rx - 0.7, by - 3, -rx - 1.4, hy + 6.5, -rx - 1.15, hy + 2);
        g.bezierCurveTo(-rx - 1.05, hy - ry * 0.5, -rx * 0.7, T - 0.1, 0, T);
      } else {
        const ny = hy + (NAPE[style] || ry - 0.4);
        g.bezierCurveTo(rx * 0.62, T, R + 0.1, hy - ry * 0.6, R, hy + 0.6);
        g.bezierCurveTo(R - 0.1, ny - 2.6, rx - 1, ny - 0.6, rx - 2.2, ny);
        if (style === 'fluffy') {
          // soft scallops at the nape
          g.quadraticCurveTo(3.8, ny + 1.6, 1.9, ny + 0.2);
          g.quadraticCurveTo(0, ny + 1.6, -1.9, ny + 0.2);
          g.quadraticCurveTo(-3.8, ny + 1.6, -rx + 2.2, ny);
        } else if (style === 'messy') {
          // little points at the nape
          g.lineTo(4.4, ny + 1.4); g.lineTo(3, ny + 0.1); g.lineTo(1.4, ny + 1.7); g.lineTo(0, ny + 0.2);
          g.lineTo(-1.5, ny + 1.5); g.lineTo(-3, ny + 0.1); g.lineTo(-4.5, ny + 1.2); g.lineTo(-rx + 2.2, ny);
        } else g.quadraticCurveTo(0, ny + (style === 'buzz' ? 0.5 : 1.1), -rx + 2.2, ny);
        g.bezierCurveTo(-rx + 1, ny - 0.6, -R + 0.1, ny - 2.6, -R, hy + 0.6);
        g.bezierCurveTo(-R - 0.1, hy - ry * 0.6, -rx * 0.62, T, 0, T);
      }
      g.closePath();
    };
    // curls around the outline of curly hair
    const CURLS = [[-7.2, 1.6, 2.3], [-7.4, -2, 2.5], [-5.6, -5.4, 2.7], [-2.2, -7.4, 2.8], [1.6, -7.6, 2.8], [5.2, -5.8, 2.7], [7.3, -2.4, 2.5], [7.3, 1.4, 2.3], [-5.6, 4.8, 2.4], [5.6, 4.8, 2.4], [-2.2, 6.6, 2.3], [1.8, 6.6, 2.3]];
    const curlPath = (front) => {
      g.beginPath();
      for (const [ox, oy, r] of CURLS) {
        if (front && oy > 2) continue;
        g.moveTo(ox + r, hy + oy); g.arc(ox, hy + oy, r, 0, PI * 2);
      }
    };
    // the bun on the crown, with its scrunchie
    const BUN = back ? [0, hy - ry + 0.4, 3.7] : [0.6, hy - ry - 0.6, 3.4];
    const drawBun = () => {
      const [bx, by, br] = BUN;
      hairFill(hair, () => ci(bx, by, br));
      ink(hairDeep, 0.45, 0.8, () => { g.beginPath(); g.arc(bx + 0.2, by + 0.3, br * 0.62, PI * 0.9, PI * 2.1); g.moveTo(bx - 0.5 + br * 0.3, by + 0.6); g.arc(bx - 0.5, by + 0.6, br * 0.3, 0, PI * 1.3); });
      ink(hairLite, 0.8, 0.55, () => { g.beginPath(); g.arc(bx, by, br - 1, PI * 1.12, PI * 1.45); });
      if (back) part(CAP.bow, () => { g.beginPath(); g.ellipse(bx, by + br - 0.4, br * 0.68, 0.85, 0, 0, PI * 2); });
    };
    // twin tails tied at the sides, with a bobble on each tie
    const tailPath = (s) => {
      const x0 = s * (rx - 0.3), y0 = hy + 0.8;
      g.moveTo(x0 - s * 0.4, y0 - 1.5);
      g.bezierCurveTo(x0 + s * 3.4, y0 - 1.6, x0 + s * 4.1, y0 + 4.2, x0 + s * 2.2, y0 + 7.6);
      g.quadraticCurveTo(x0 + s * 1.5, y0 + 8.4, x0 + s * 0.9, y0 + 7.7);
      g.quadraticCurveTo(x0 + s * 2.1, y0 + 6.6, x0 + s * 1.2, y0 + 4.4);
      g.bezierCurveTo(x0 + s * 0.6, y0 + 3, x0 - s * 0.7, y0 + 1.4, x0 - s * 0.4, y0 - 1.5);
    };
    const drawTails = () => {
      hairFill(hair, () => { g.beginPath(); tailPath(-1); tailPath(1); });
      ink(hairDeep, 0.4, 0.7, () => { g.beginPath(); for (const s of [-1, 1]) { const x0 = s * (rx - 0.3), y0 = hy + 0.8; g.moveTo(x0 + s * 1.2, y0 + 0.4); g.quadraticCurveTo(x0 + s * 2.8, y0 + 3.4, x0 + s * 1.9, y0 + 6.4); } });
      ink(hairLite, 0.7, 0.55, () => { g.beginPath(); for (const s of [-1, 1]) { const x0 = s * (rx - 0.3), y0 = hy + 0.8; g.moveTo(x0 + s * 1.6, y0 - 0.4); g.quadraticCurveTo(x0 + s * 2.9, y0 + 0.8, x0 + s * 3, y0 + 2.6); } });
      for (const s of [-1, 1]) part(CAP.bow, () => ci(s * (rx - 0.2), hy + 0.3, 1.05));
    };
    // fringe and the hair over the top of the head, front views
    const SIDE = { fluffy: 1.6, messy: 1, bob: 5.6, long: 4.4, bun: -0.6, twin: 0.8, buzz: -1.2, curly: 1.2 };
    const capPath = () => {
      const sy = hy + (SIDE[style] === undefined ? 1 : SIDE[style]), L = -rx - 0.55, R = rx + 0.55, f = fo * 0.6;
      const inR = rx - 1.6, inL = -rx + 1.6;
      g.beginPath();
      g.moveTo(L, sy);
      g.bezierCurveTo(L - 0.25, hy - ry * 0.95, -rx * 0.55, hy - ry - 0.85, 0, hy - ry - 0.75);
      g.bezierCurveTo(rx * 0.55, hy - ry - 0.85, R + 0.25, hy - ry * 0.95, R, sy);
      if (style === 'fluffy') {
        g.quadraticCurveTo(inR + 0.2, hy + 0.6, inR, hy - 1.7);
        g.quadraticCurveTo(4.6 + f, hy - 0.6, 3.3 + f, hy - 3.4);
        g.quadraticCurveTo(1.8 + f, hy - 0.8, 0.1 + f, hy - 3.5);
        g.quadraticCurveTo(-1.6 + f, hy - 0.9, -3.2 + f, hy - 3.3);
        g.quadraticCurveTo(-4.7 + f, hy - 0.7, inL, hy - 1.7);
        g.quadraticCurveTo(inL - 0.2, hy + 0.6, L, sy);
      } else if (style === 'messy') {
        g.lineTo(inR, hy - 0.9);
        g.quadraticCurveTo(5.6 + f, hy - 2.6, 5.2 + f, hy - 3.9);
        g.quadraticCurveTo(4.6 + f, hy - 2.6, 3.9 + f, hy - 1.6);
        g.quadraticCurveTo(3.4 + f, hy - 3.2, 2.4 + f, hy - 4.2);
        g.quadraticCurveTo(1.6 + f, hy - 2.6, 0.7 + f, hy - 1.7);
        g.quadraticCurveTo(0.2 + f, hy - 3.4, -1 + f, hy - 4.2);
        g.quadraticCurveTo(-1.8 + f, hy - 2.8, -2.8 + f, hy - 1.9);
        g.quadraticCurveTo(-3.3 + f, hy - 3.2, -4.4 + f, hy - 3.9);
        g.quadraticCurveTo(-5 + f, hy - 2.4, inL, hy - 1);
        g.lineTo(L, sy);
      } else if (style === 'bob') {
        g.quadraticCurveTo(rx - 0.3, hy + 6.3, rx - 1.3, hy + 5.1);
        g.bezierCurveTo(rx - 2, hy + 2.6, rx - 1.6, hy - 0.4, rx - 2.4, hy - 2.2);
        g.bezierCurveTo(3 + f, hy - 1.6, -3 + f, hy - 1.6, -rx + 2.4, hy - 2.2);
        g.bezierCurveTo(-rx + 1.6, hy - 0.4, -rx + 2, hy + 2.6, -rx + 1.3, hy + 5.1);
        g.quadraticCurveTo(-rx + 0.3, hy + 6.3, L, sy);
      } else if (style === 'long') {
        g.bezierCurveTo(rx - 1.1, hy + 3.6, rx - 0.9, hy + 0.4, rx - 1.6, hy - 1.3);
        g.bezierCurveTo(2.2 + f, hy - 1.8, -1 + f, hy - 2.8, -3 + f, hy - 5.3);
        g.quadraticCurveTo(-4.4 + f, hy - 2.6, inL, hy - 1.1);
        g.bezierCurveTo(-rx + 1, hy + 0.4, -rx + 1.2, hy + 3.6, L, sy);
      } else if (style === 'bun') {
        g.quadraticCurveTo(rx - 0.7, hy - 0.4, rx - 1.6, hy - 2.6);
        g.bezierCurveTo(3 + f, hy - 5.3, -3 + f, hy - 5.3, -rx + 1.6, hy - 2.6);
        g.quadraticCurveTo(-rx + 0.7, hy - 0.4, L, sy);
      } else if (style === 'twin') {
        g.quadraticCurveTo(rx - 0.6, hy + 0.6, inR, hy - 1.6);
        g.bezierCurveTo(4 + f, hy - 2.2, 1.7 + f, hy - 3, 0.5 + f, hy - 5.6);
        g.bezierCurveTo(-0.7 + f, hy - 3, -3 + f, hy - 2.2, inL, hy - 1.6);
        g.quadraticCurveTo(-rx + 0.6, hy + 0.6, L, sy);
      } else {
        // buzz: a short, close cap with a soft hairline
        g.quadraticCurveTo(rx - 0.6, hy - 1.4, inR, hy - 3.2);
        g.bezierCurveTo(3, hy - 4.9, -3, hy - 4.9, inL, hy - 3.2);
        g.quadraticCurveTo(-rx + 0.6, hy - 1.4, L, sy);
      }
      g.closePath();
    };
    // a cowlick that sticks up from the crown
    const ahoge = () => hairFill(hair, () => { const x = back ? -1.6 : 0; g.beginPath(); g.moveTo(x - 0.2, hy - ry - 0.3); g.quadraticCurveTo(x + 0.2, hy - ry - 3.8, x + 2.9, hy - ry - 3.4); g.quadraticCurveTo(x + 1.2, hy - ry - 2.6, x + 1.3, hy - ry - 0.4); g.closePath(); });
    const crownSpikes = () => hairFill(hair, () => { g.beginPath(); g.moveTo(-2.4, hy - ry); g.quadraticCurveTo(-1.6, hy - ry - 2, -0.6, hy - ry - 2.8); g.quadraticCurveTo(-0.4, hy - ry - 1, 0.4, hy - ry - 0.6); g.quadraticCurveTo(1.4, hy - ry - 2.2, 2.8, hy - ry - 2.4); g.quadraticCurveTo(2, hy - ry - 0.8, 2.4, hy - ry + 0.2); g.closePath(); });

    /* ---------------- garments ---------------- */
    const cuffC = role === 'chef' ? CAP.whiteDeep : role === 'waiter' ? CAP.cream : tintRgb(tc, 0.5);
    // an arm hanging from the shoulder: puffy sleeve, cuff and a mitten hand, turned by ang (radians, + swings the hand to -x)
    const arm = (s, ang, hold) => {
      g.save();
      g.translate(s * 3.6, top + 1.2);
      g.rotate(ang);
      // a little spoon in the eating hand, held up toward the mouth
      if (hold === 'spoon') {
        ink(rgb('#c9b8a8'), 0.55, 1, () => { g.beginPath(); g.moveTo(0.2, 5.2); g.lineTo(-2.6, 5.6); });
        flatFill(rgb('#d8c9ba'), () => { g.beginPath(); g.ellipse(-3.1, 5.65, 0.75, 0.5, 0.15, 0, PI * 2); });
      }
      part(dimRgb(tc, 0.97), () => {
        g.beginPath(); g.moveTo(-1.3, -1);
        g.bezierCurveTo(-2.5, -0.6, -2.4, 2.5, -1.35, 3.3);
        g.lineTo(1.35, 3.3);
        g.bezierCurveTo(2.4, 2.5, 2.5, -0.6, 1.3, -1);
        g.quadraticCurveTo(0, -1.7, -1.3, -1); g.closePath();
      });
      part(cuffC, () => rr(-1.45, 2.9, 2.9, 1.1, 0.55));
      if (hold !== 'none') {
        part(b.skin, () => { g.beginPath(); g.ellipse(0, 5, 1.3, 1.45, 0, 0, PI * 2); });
        flatFill(tintRgb(b.skin, 0.4), () => { g.beginPath(); g.ellipse(-0.45, 4.5, 0.45, 0.35, 0, 0, PI * 2); }, 0.7);
      }
      g.restore();
    };
    // a bow knot with two tails, for apron ties on the back
    const bowKnot = (c, x, y, w) => {
      part(c, () => {
        g.beginPath();
        g.moveTo(x, y); g.bezierCurveTo(x - w * 0.5, y - w * 0.75, x - w * 1.1, y - w * 0.5, x - w, y + w * 0.1); g.bezierCurveTo(x - w * 0.9, y + w * 0.55, x - w * 0.4, y + w * 0.5, x, y);
        g.moveTo(x, y); g.bezierCurveTo(x + w * 0.5, y - w * 0.75, x + w * 1.1, y - w * 0.5, x + w, y + w * 0.1); g.bezierCurveTo(x + w * 0.9, y + w * 0.55, x + w * 0.4, y + w * 0.5, x, y);
        g.moveTo(x - 0.2, y + 0.3); g.quadraticCurveTo(x - w * 0.5, y + w * 0.9, x - w * 0.7, y + w * 1.6); g.lineTo(x - w * 0.25, y + w * 1.45); g.quadraticCurveTo(x - w * 0.15, y + w * 0.8, x + 0.2, y + 0.3);
        g.moveTo(x + 0.2, y + 0.3); g.quadraticCurveTo(x + w * 0.45, y + w * 0.9, x + w * 0.5, y + w * 1.7); g.lineTo(x + w * 0.9, y + w * 1.5); g.quadraticCurveTo(x + w * 0.6, y + w * 0.8, x + 0.2, y + 0.3);
      });
      part(dimRgb(c, 0.9), () => { g.beginPath(); g.ellipse(x, y + 0.1, w * 0.3, w * 0.28, 0, 0, PI * 2); });
    };
    const dots = (c, pts, r) => flatFill(c, () => { g.beginPath(); for (const [x, y] of pts) { g.moveTo(x + r, y); g.arc(x, y, r, 0, PI * 2); } });

    /* ---------------- painting, back to front ---------------- */
    // hair behind the head and body (front views)
    if (!back && (style === 'bob' || style === 'long')) hairFill(hairDeep, massPath);
    // guest bag peeking out behind the hip in back views
    const sc = GUEST_SCARF[scarf] || GUEST_SCARF[0];
    if (!role && back && !sitting) part(dimRgb(sc, 0.82), () => rr(2.8, top + 5, 3.8, 3.2, 1.2));

    // legs with a calf, and round-toed shoes with a sole (seated people are hidden by the table and chair)
    if (!sitting) {
      const stp = st * 1.4, shoeC = dimRgb(b.pants, 0.66);
      for (const s of [-1, 1]) {
        const lift = Math.max(0, s < 0 ? stp : -stp), cx = s * 1.75 + (lift ? 0.35 : 0) * (back ? -1 : 1), ay = -lift - 1.3;
        part(b.pants, () => {
          g.beginPath();
          g.moveTo(cx - 1.4, -6);
          g.lineTo(cx + 1.4, -6);
          g.bezierCurveTo(cx + 1.55, ay - 3, cx + 1.45, ay - 1.4, cx + 1.05, ay);
          g.lineTo(cx - 1.05, ay);
          g.bezierCurveTo(cx - 1.45, ay - 1.4, cx - 1.55, ay - 3, cx - 1.4, -6);
          g.closePath();
        });
        const y = -lift, toe = back ? 0 : 0.55;
        part(shoeC, () => {
          g.beginPath();
          g.moveTo(cx - 1.8, y - 0.6);
          g.bezierCurveTo(cx - 1.95, y - 2.2, cx - 0.4, y - 2.45, cx + 0.4, y - 2.15);
          g.bezierCurveTo(cx + 1.5 + toe, y - 1.85, cx + 2 + toe, y - 1.3, cx + 1.95 + toe, y - 0.6);
          g.closePath();
        });
        part(CAP.sole, () => rr(cx - 1.95, y - 0.8, 3.95 + toe, 0.8, 0.4), false);
        if (!back) flatFill(tintRgb(shoeC, 0.55), () => { g.beginPath(); g.ellipse(cx + 0.7, y - 1.6, 0.6, 0.32, -0.25, 0, PI * 2); }, 0.75);
      }
    }

    // neck, then the body
    part(dimRgb(b.skin, 0.88), () => rr(-1.4, top - 1.8, 2.8, 3.2, 1.2), false);
    if (back && style === 'long') { /* the long fall covers the neck and upper back below */ }
    part(tc, torsoPath);
    // a soft fold shade at the waist and hem, kept inside the body
    clipped(torsoPath, () => {
      soft(dimRgb(tc, 0.7), 0, hem + 0.4, 5.4, 1.4, 0.35);
      soft(tintRgb(tc, 0.5), -2.2, top + 2.2, 2.4, 2, 0.35);
    });

    if (role === 'chef') {
      if (back) {
        ink(dimRgb(tc, 0.8), 0.4, 0.7, () => { g.beginPath(); g.moveTo(0, top + 1.2); g.lineTo(0, hem - 0.2); });
        part(CAP.whiteDeep, () => { g.beginPath(); g.moveTo(-2.1, top - 0.2); g.quadraticCurveTo(0, top + 0.6, 2.1, top - 0.2); g.lineTo(2.1, top + 0.8); g.quadraticCurveTo(0, top + 1.5, -2.1, top + 0.8); g.closePath(); });
        part(CAP.apron, () => rr(-3.65, top + 3.9, 7.3, 0.95, 0.45));
        bowKnot(CAP.apron, 0, top + 4.35, 1.7);
      } else {
        // wrap fold, two rows of buttons, mandarin collar, then the apron with its waistband and a pocket
        ink(dimRgb(tc, 0.82), 0.4, 0.8, () => { g.beginPath(); g.moveTo(1.2, top + 0.6); g.bezierCurveTo(0.6, top + 2, -0.2, top + 2.8, -0.5, top + 4); });
        dots(CAP.button, [[-1.6, top + 2], [-1.75, top + 3.3], [1.25, top + 2.6]], 0.42);
        part(CAP.whiteDeep, () => { g.beginPath(); g.moveTo(-2.3, top - 0.2); g.quadraticCurveTo(0, top + 1.7, 2.3, top - 0.2); g.lineTo(2.2, top + 0.7); g.quadraticCurveTo(0, top + 2.5, -2.2, top + 0.7); g.closePath(); });
        part(CAP.apron, () => {
          g.beginPath();
          g.moveTo(-3.55, top + 4.1); g.lineTo(3.55, top + 4.1);
          g.bezierCurveTo(3.7, hem - 1.2, 4.2, hem - 0.5, 4.1, hem + 0.3);
          g.quadraticCurveTo(0, hem + 1.3, -4.1, hem + 0.3);
          g.bezierCurveTo(-4.2, hem - 0.5, -3.7, hem - 1.2, -3.55, top + 4.1);
          g.closePath();
        });
        part(dimRgb(CAP.apron, 0.88), () => rr(-3.7, top + 3.85, 7.4, 0.95, 0.45));
        ink(tintRgb(CAP.apron, 0.35), 0.35, 0.8, () => { g.beginPath(); g.moveTo(-1.6, top + 5.9); g.quadraticCurveTo(0, top + 6.5, 1.6, top + 5.9); });
        part(CAP.apron, () => { g.beginPath(); g.ellipse(3.85, top + 4.6, 0.55, 0.9, 0.4, 0, PI * 2); });
      }
    } else if (role === 'waiter') {
      if (back) {
        clipped(torsoPath, () => part(CAP.vest, () => rr(-5, top + 0.6, 10, th + 1, 0)));
        part(dimRgb(CAP.vest, 0.9), () => rr(-2.4, top + 4.7, 4.8, 1, 0.5));
        dots(CAP.cream, [[-1.8, top + 5.2], [1.8, top + 5.2]], 0.36);
        part(CAP.cream, () => { g.beginPath(); g.moveTo(-2, top - 0.2); g.quadraticCurveTo(0, top + 0.6, 2, top - 0.2); g.lineTo(2, top + 0.7); g.quadraticCurveTo(0, top + 1.4, -2, top + 0.7); g.closePath(); });
      } else {
        // a V-necked vest with pointed tips, two buttons and the shirt collar points
        clipped(torsoPath, () => part(CAP.vest, () => {
          g.beginPath(); g.moveTo(-5, top - 0.5); g.lineTo(-1.6, top - 0.5); g.lineTo(0.1, top + 3.8); g.lineTo(1.8, top - 0.5); g.lineTo(5, top - 0.5); g.lineTo(5, hem + 2); g.lineTo(-5, hem + 2); g.closePath();
        }));
        part(CAP.vest, () => { g.beginPath(); g.moveTo(-1.5, hem - 0.2); g.lineTo(-0.9, hem + 1); g.lineTo(0.1, hem + 0.3); g.lineTo(1.1, hem + 1); g.lineTo(1.7, hem - 0.2); g.closePath(); }, false);
        ink(dimRgb(CAP.vest, 0.75), 0.35, 0.9, () => { g.beginPath(); g.moveTo(0.1, top + 3.8); g.lineTo(0.1, hem + 0.3); });
        dots(CAP.cream, [[0.1, top + 4.9], [0.1, top + 6.3]], 0.4);
        part(CAP.cream, () => { g.beginPath(); g.moveTo(-0.1, top + 0.4); g.lineTo(-1.9, top - 0.1); g.lineTo(-1.2, top + 1.7); g.closePath(); g.moveTo(0.3, top + 0.4); g.lineTo(2.1, top - 0.1); g.lineTo(1.4, top + 1.7); g.closePath(); });
      }
    } else if (role === 'helper') {
      if (back) {
        // apron straps crossing on the back, tied in a bow at the waist
        ink(CAP.apronY, 0.95, 1, () => { g.beginPath(); g.moveTo(-2.9, top + 0.1); g.lineTo(2.4, top + 4.3); g.moveTo(2.9, top + 0.1); g.lineTo(-2.4, top + 4.3); });
        part(CAP.apronY, () => rr(-3.6, top + 4, 7.2, 0.9, 0.45));
        bowKnot(CAP.apronY, 0, top + 4.4, 1.6);
        part(tintRgb(tc, 0.55), () => { g.beginPath(); g.moveTo(-2, top - 0.2); g.quadraticCurveTo(0, top + 0.6, 2, top - 0.2); g.lineTo(2, top + 0.6); g.quadraticCurveTo(0, top + 1.3, -2, top + 0.6); g.closePath(); });
      } else {
        // a bib apron with straps and a stitched pocket, over a rounded collar
        ink(CAP.apronY, 0.85, 1, () => { g.beginPath(); g.moveTo(-2.1, top + 2.3); g.lineTo(-2.8, top + 0.1); g.moveTo(2.3, top + 2.3); g.lineTo(3, top + 0.1); });
        part(CAP.apronY, () => {
          g.beginPath();
          g.moveTo(-2.4, top + 2); g.lineTo(2.6, top + 2);
          g.quadraticCurveTo(2.9, top + 3.4, 3.1, top + 4.2);
          g.bezierCurveTo(3.7, hem - 1.4, 4, hem - 0.6, 3.9, hem + 0.3);
          g.quadraticCurveTo(0, hem + 1.2, -3.9, hem + 0.3);
          g.bezierCurveTo(-4, hem - 0.6, -3.7, hem - 1.4, -2.9, top + 4.2);
          g.quadraticCurveTo(-2.7, top + 3.4, -2.4, top + 2);
          g.closePath();
        });
        part(tintRgb(CAP.apronY, 0.35), () => rr(-1.6, top + 5.2, 3.4, 1.9, 0.7));
        ink(dimRgb(CAP.apronY, 0.75), 0.3, 0.8, () => { g.setLineDash([0.5, 0.5]); g.beginPath(); g.moveTo(-1.2, top + 5.7); g.lineTo(1.4, top + 5.7); });
        g.setLineDash([]);
        part(tintRgb(tc, 0.62), () => { g.beginPath(); g.moveTo(-0.1, top + 0.3); g.bezierCurveTo(-1.2, top + 2.1, -3.1, top + 1.7, -2.6, top - 0.1); g.closePath(); g.moveTo(0.3, top + 0.3); g.bezierCurveTo(1.4, top + 2.1, 3.3, top + 1.7, 2.8, top - 0.1); g.closePath(); });
      }
    } else {
      // guest: placket buttons, a strap across the body for the bag (drawn with the arms), then the scarf over the neck
      if (!back) dots(tintRgb(tc, 0.55), [[0.3, top + 4], [0.25, top + 5.5]], 0.36);
      if (!sitting) ink(dimRgb(sc, 0.7), 0.6, 1, () => { g.beginPath(); g.moveTo(back ? 3.2 : -3.2, top + 0.6); g.quadraticCurveTo(0, top + 3.6, back ? -3.4 : 3.6, top + 5.4); });
      part(sc, () => {
        g.beginPath();
        g.moveTo(-4, top + 0.6);
        g.quadraticCurveTo(0, top + (back ? 1.4 : 2.6), 4, top + 0.6);
        g.lineTo(4, top + 2.1);
        g.quadraticCurveTo(0, top + (back ? 3 : 4.2), -4, top + 2.1);
        g.closePath();
      });
      // the scarf tail, over the front on the right, behind on the left
      const tx = back ? -2.4 : 2.2;
      part(dimRgb(sc, 0.92), () => { g.beginPath(); g.moveTo(tx - 1, top + 2.4); g.quadraticCurveTo(tx - 1.2, top + 4.6, tx - 0.8, top + 5.8); g.lineTo(tx + 1, top + 5.6); g.quadraticCurveTo(tx + 1, top + 4.2, tx + 1.1, top + 2.3); g.closePath(); });
      ink(tintRgb(sc, 0.45), 0.3, 0.9, () => { g.beginPath(); for (const k of [-0.5, 0, 0.5]) { g.moveTo(tx - 0.1 + k, top + 5.3); g.lineTo(tx + k, top + 6.2); } });
      if (!back) part(dimRgb(sc, 0.9), () => { g.beginPath(); g.ellipse(tx + 0.1, top + 2.3, 1.2, 0.9, 0, 0, PI * 2); });
    }
    if (role && !back) {
      // staff signature: a cream name badge with a coral dot on the chest, on every uniform
      part(CAP.cream, () => rr(1.1, top + 1.7, 3, 2, 0.8));
      flatFill(CAP.bow, () => ci(2, top + 2.7, 0.5));
    }

    // arms swing against the legs; the eating arm lifts toward the mouth
    const sw = st * 0.32, eating = pose.eat >= 0 && !back;
    arm(-1, 0.14 + sw);
    // turned at the stove, the near arm reaches forward to the pot; drawStaffBits adds the stirring hand and spoon
    if (turn && pose.stir) arm(1, -1.62, 'none');
    else if (!eating) arm(1, -0.14 - sw);
    // guest bag at the hip, under the hand
    if (!role && !back && !sitting) {
      part(dimRgb(sc, 0.85), () => { g.beginPath(); g.moveTo(3.4, top + 5.6); g.lineTo(6.6, top + 5.6); g.quadraticCurveTo(7, top + 8.6, 5, top + 8.7); g.quadraticCurveTo(3, top + 8.6, 3.4, top + 5.6); g.closePath(); });
      part(sc, () => { g.beginPath(); g.moveTo(3.3, top + 5.5); g.lineTo(6.7, top + 5.5); g.quadraticCurveTo(6.4, top + 7.2, 5, top + 7.3); g.quadraticCurveTo(3.6, top + 7.2, 3.3, top + 5.5); g.closePath(); });
      dots(CAP.band, [[5, top + 7]], 0.4);
    }
    // the head's soft shadow on the chest, kept inside the body
    clipped(torsoPath, () => soft(dimRgb(tc, 0.62), 0, top + 0.5, 5.6, 2, 0.45));

    /* ---------------- head ---------------- */
    if (!back && style === 'twin') drawTails();
    if (style === 'bun' && !back) drawBun();
    // ears, front views (hair covers them for bob, long and curly)
    const showEars = style !== 'bob' && style !== 'long' && style !== 'curly';
    if (!back && showEars) {
      for (const s of turn ? [1] : [-1, 1]) {
        part(b.skin, () => { g.beginPath(); g.ellipse(s * (rx - 0.1), hy + 1.3, 1.35, 1.7, 0, 0, PI * 2); });
        flatFill(dimRgb(b.skin, 0.8), () => { g.beginPath(); g.ellipse(s * (rx + 0.25), hy + 1.4, 0.5, 0.85, 0, 0, PI * 2); }, 0.6);
      }
    }
    // skin lit from the upper left, deepening toward the jaw
    headPath();
    const hg = g.createRadialGradient(-2.6, hy - 2.8, 0.5, 0, hy + 0.5, rx + 1.5);
    hg.addColorStop(0, lit(b.skin, 1.08));
    hg.addColorStop(0.62, lit(b.skin, 1));
    hg.addColorStop(1, lit(b.skin, 0.86));
    g.fillStyle = hg;
    g.fill();
    g.strokeStyle = lit(b.skin, 0.78); g.lineWidth = 0.45; g.stroke();

    if (back) {
      /* seen from behind: the head is all hair, with a shine band, strands, and a parting or cowlick per style */
      hairFill(hair, massPath);
      if (style === 'curly') hairFill(hair, () => curlPath(false));
      clipped(massPath, () => {
        // depth: the hair deepens toward the nape, with a few short locks flowing down near the ends
        const by = style === 'long' ? top + 6.4 : style === 'bob' ? hy + 7 : hy + (NAPE[style] || ry);
        soft(dimRgb(hair, 0.62), 0, by + 0.5, rx + 1.5, style === 'long' ? 6 : 3.6, 0.55);
        if (style !== 'buzz' && style !== 'curly') ink(hairDeep, 0.42, 0.75, () => {
          g.beginPath();
          for (const x of [-4.6, -1.5, 1.6, 4.7]) { g.moveTo(x * 0.9, by - (style === 'long' ? 6 : 3.4)); g.quadraticCurveTo(x * 1.08 + 0.4, by - 1.6, x * 1.02, by - 0.3); }
        });
        // fluffy hair falls in soft layered tufts
        if (style === 'fluffy') ink(hairDeep, 0.45, 0.7, () => { g.beginPath(); for (const [x, y] of [[-4.6, 1.4], [-1.6, 2], [1.6, 2], [4.6, 1.4], [-3, 4.6], [0, 5.2], [3, 4.6]]) { g.moveTo(x - 1.5, hy + y - 0.3); g.quadraticCurveTo(x, hy + y + 1.3, x + 1.5, hy + y - 0.3); } });
        if (style === 'twin') ink(hairDeep, 0.6, 0.9, () => { g.beginPath(); g.moveTo(0, hy - ry - 0.5); g.lineTo(0, hy + ry); });
        else if (style === 'long' || style === 'bob') ink(hairDeep, 0.55, 0.9, () => { g.beginPath(); g.moveTo(0, hy - ry - 0.5); g.quadraticCurveTo(0.3, hy - 4, 0, hy - 2); });
        else if (style === 'bun') ink(hairDeep, 0.42, 0.7, () => { g.beginPath(); for (const x of [-6, -3, 3, 6]) { g.moveTo(x, hy + ry - 1.6); g.quadraticCurveTo(x * 0.8, hy - 2, x * 0.2, hy - ry + 2.6); } });
        else if (style === 'curly') ink(hairDeep, 0.45, 0.7, () => { g.beginPath(); for (const [x, y] of [[-3.5, -2], [2.8, -3], [0, 1.5], [-4.6, 3], [4.2, 2.6]]) { g.moveTo(x + 1, hy + y); g.arc(x, hy + y, 1, 0, PI * 1.5); } });
        // a broken shine band across the back of the head
        const shine = style === 'buzz' ? 0.32 : 0.7, sr = ry - 2.2, sy = hy + 1.2;
        ink(hairLite, 1.5, shine, () => { g.beginPath(); g.arc(0, sy, sr, PI * 1.13, PI * 1.4); g.moveTo(Math.cos(PI * 1.5) * sr, sy + Math.sin(PI * 1.5) * sr); g.arc(0, sy, sr, PI * 1.5, PI * 1.72); });
        ink(hairLite, 0.6, shine * 0.6, () => { g.beginPath(); g.arc(0, sy, sr - 1.5, PI * 1.2, PI * 1.32); });
      });
      if (style === 'fluffy' || style === 'messy' || style === 'buzz') ink(hairDeep, 0.5, 0.85, () => { g.beginPath(); g.arc(0.6, hy - ry + 2, 0.9, PI * 0.2, PI * 1.9); });
      if (style === 'fluffy') ahoge();
      else if (style === 'messy') crownSpikes();
      else if (style === 'bun') drawBun();
      else if (style === 'twin') drawTails();
      // ears peek out where the hair is short or pulled up
      if (style === 'buzz' || style === 'bun') for (const s of [-1, 1]) part(b.skin, () => { g.beginPath(); g.ellipse(s * (rx + 0.3), hy + 1.6, 1.05, 1.5, 0, 0, PI * 2); });
    } else {
      // a soft shade under the fringe and along the jaw, kept on the face
      const shade = dimRgb(b.skin, 0.72);
      clipped(headPath, () => {
        const fs = g.createLinearGradient(0, hy - 4.8, 0, hy - 1.2);
        fs.addColorStop(0, lit(shade, 1, 0.42));
        fs.addColorStop(1, lit(shade, 1, 0));
        g.fillStyle = fs;
        g.fillRect(-rx - 1, hy - 4.8, rx * 2 + 2, 3.6);
        soft(shade, 0, hy + ry + 0.6, rx * 0.85, 2.8, 0.38);
      });
      // face, shifted toward the way it looks; the far eye narrows when turned
      const ey = hy + 1, ec = rgb(EYE_COLS[p.eye] || EYE_COLS[0]);
      const glow = ec.map((v) => v + (255 - v) * 0.42), deep = dimRgb(ec, 0.6);
      const happy = p.face === 'happy';
      g.save();
      g.translate(fo, 0);
      clipped(headPath, () => {
        soft(CAP.blush, -4.8, ey + 2.2, 2.2, 1.35, 0.62);
        soft(CAP.blush, 4.8, ey + 2.2, 2.2, 1.35, 0.62);
      });
      for (const ex of [-3, 3]) {
        g.save();
        if (turn && ex < 0) { g.translate(ex, 0); g.scale(0.8, 1); g.translate(-ex, 0); }
        if (happy || pose.blink) {
          g.strokeStyle = lit(deep, 1); g.lineWidth = 0.75;
          g.beginPath();
          if (happy) { const dy = ey + 0.9; g.moveTo(ex - 1.3, dy); g.quadraticCurveTo(ex, dy - 1.9, ex + 1.3, dy); }
          else { g.moveTo(ex - 1.4, ey + 0.2); g.quadraticCurveTo(ex, ey + 1.1, ex + 1.4, ey + 0.2); }
          g.stroke();
        } else {
          // glossy eye: deep at the top, its own colour, a lighter glow low in the iris, a pupil and two highlights
          g.save();
          g.beginPath(); g.ellipse(ex, ey, 1.6, 2.15, 0, 0, PI * 2);
          const eg = g.createLinearGradient(0, ey - 2.15, 0, ey + 2.15);
          eg.addColorStop(0, lit(deep, 1));
          eg.addColorStop(0.55, lit(ec, 1));
          eg.addColorStop(1, lit(glow, 1));
          g.fillStyle = eg;
          g.fill();
          g.clip();
          soft(glow, ex, ey + 1.35, 1.55, 0.95, 0.8);
          g.restore();
          flatFill(deep, () => { g.beginPath(); g.ellipse(ex, ey - 0.1, 0.68, 1, 0, 0, PI * 2); });
          flatFill(CAP.cream, () => ci(ex + 0.55, ey - 0.85, 0.64));
          flatFill(CAP.cream, () => ci(ex - 0.6, ey + 0.9, 0.33), 0.9);
          g.strokeStyle = lit(deep, 1); g.lineWidth = 0.55;
          g.beginPath(); g.ellipse(ex, ey + 0.1, 1.78, 2.22, 0, PI * 1.12, PI * 1.88); g.stroke();
        }
        g.restore();
      }
      const my = ey + 2.7;
      g.strokeStyle = lit(CAP.mouth, 1); g.fillStyle = lit(CAP.mouth, 1); g.lineWidth = 0.65;
      if (p.face === 'grin' || happy) {
        g.beginPath(); g.arc(0, my - 0.2, 1.35, 0, PI); g.fill();
        flatFill(CAP.bow, () => { g.beginPath(); g.ellipse(0, my + 0.65, 0.7, 0.32, 0, 0, PI * 2); });
      } else if (p.face === 'cat') {
        g.beginPath(); g.arc(-0.85, my - 0.2, 0.85, 0.1, PI - 0.1); g.moveTo(1.7, my - 0.2); g.arc(0.85, my - 0.2, 0.85, 0.1, PI - 0.1); g.stroke();
      } else { g.beginPath(); g.arc(0, my - 0.4, 1.1, PI * 0.15, PI * 0.85); g.stroke(); }
      if (p.acc === 'glasses') {
        g.strokeStyle = lit(rgb('#8a6f7e'), 1); g.lineWidth = 0.6;
        g.beginPath(); g.arc(-3, ey, 2.5, 0, PI * 2); g.moveTo(5.5, ey); g.arc(3, ey, 2.5, 0, PI * 2); g.moveTo(-0.55, ey - 0.2); g.lineTo(0.55, ey - 0.2); g.stroke();
      } else if (p.acc === 'freckles') {
        flatFill(dimRgb(b.skin, 0.76), () => { g.beginPath(); for (const [x, y] of [[-5.2, 3.9], [-4, 4.4], [-3.9, 3.1], [5.2, 3.9], [4, 4.4], [3.9, 3.1]]) { g.moveTo(x + 0.38, hy + y); g.arc(x, hy + y, 0.38, 0, PI * 2); } }, 0.9);
      }
      g.restore();
      // the eating arm comes over the chin
      if (eating) arm(1, -0.14 + (pose.eat / 3) * 1.9, 'spoon');

      /* hair in front: the fringe cap, its shine, and the style's own touches */
      if (style === 'curly') {
        hairFill(hair, () => curlPath(true));
        ink(hairDeep, 0.45, 0.7, () => { g.beginPath(); for (const [x, y] of [[-5.4, -4.6], [-1.6, -6.6], [2.4, -6.6], [5.6, -4.8]]) { g.moveTo(x + 0.9, hy + y); g.arc(x, hy + y, 0.9, 0, PI * 1.5); } });
      } else {
        if (style === 'long') {
          // locks falling in front of the shoulders
          hairFill(hair, () => { g.beginPath(); for (const s of [-1, 1]) { g.moveTo(s * (rx + 0.5), hy + 1); g.bezierCurveTo(s * (rx + 1.2), hy + 5, s * (rx - 0.2), top + 2.5, s * (rx - 2), top + 4.8); g.quadraticCurveTo(s * (rx - 2.6), top + 1, s * (rx - 1.3), hy + 3); g.closePath(); } });
        }
        hairFill(style === 'buzz' ? dimRgb(hair, 0.94) : hair, capPath);
        clipped(capPath, () => {
          ink(hairDeep, 0.4, 0.55, () => {
            g.beginPath();
            if (style === 'bun') for (const x of [-4, -1.2, 1.8, 4.6]) { g.moveTo(x * 1.1 + fo * 0.5, hy - 3.4); g.quadraticCurveTo(x * 0.9, hy - 6.5, x * 0.4 + 0.6, hy - ry - 0.4); }
            else if (style !== 'buzz') for (const x of [-4.2, -1, 2.4]) { g.moveTo(x * 0.5 + fo * 0.6, hy - ry + 0.4); g.quadraticCurveTo(x, hy - 5, x * 1.2 + fo * 0.6, hy - 2.8); }
          });
          ink(hairLite, 1.1, style === 'buzz' ? 0.28 : 0.55, () => { g.beginPath(); g.arc(-0.4, hy + 0.6, ry - 1, PI * 1.17, PI * 1.43); g.moveTo(Math.cos(PI * 1.52) * (ry - 1) - 0.4, hy + 0.6 + Math.sin(PI * 1.52) * (ry - 1)); g.arc(-0.4, hy + 0.6, ry - 1, PI * 1.52, PI * 1.62); });
        });
        if (style === 'twin') ink(hairDeep, 0.55, 0.85, () => { g.beginPath(); g.moveTo(0.5 + fo * 0.6, hy - 5.6); g.quadraticCurveTo(0.2, hy - ry + 0.4, 0, hy - ry - 0.6); });
        if (style === 'bun') ink(hair, 0.45, 0.9, () => { g.beginPath(); for (const s of turn ? [1] : [-1, 1]) { g.moveTo(s * (rx - 1.4), hy - 1.2); g.quadraticCurveTo(s * (rx - 0.6), hy + 1.4, s * (rx - 1.2), hy + 3); } });
        if (style === 'fluffy') ahoge();
        else if (style === 'messy') crownSpikes();
      }
    }

    /* ---------------- headwear and accessories ---------------- */
    if (role === 'chef') {
      part(CAP.white, () => { g.beginPath(); for (const [ox, oy, r_] of [[-3.9, -10.3, 3.6], [3.9, -10.3, 3.6], [0, -12.1, 4.1]]) { g.moveTo(ox + r_, hy + oy); g.arc(ox, hy + oy, r_, 0, PI * 2); } }, false);
      part(CAP.white, () => { g.beginPath(); g.moveTo(-6.3, hy - 4.2); g.bezierCurveTo(-6.6, hy - 7, -6.4, hy - 9.4, -5.4, hy - 10.2); g.lineTo(5.4, hy - 10.2); g.bezierCurveTo(6.4, hy - 9.4, 6.6, hy - 7, 6.3, hy - 4.2); g.closePath(); }, false);
      ink(CAP.whiteDeep, 0.45, 0.9, () => { g.beginPath(); for (const x of [-3, 0, 3]) { g.moveTo(x, hy - 5.6); g.quadraticCurveTo(x + 0.4, hy - 8, x * 1.15, hy - 10.6); } });
      part(CAP.whiteDeep, () => { g.beginPath(); g.moveTo(-6.6, hy - 6.1); g.quadraticCurveTo(0, hy - 6.9, 6.6, hy - 6.1); g.lineTo(6.6, hy - 4.2); g.quadraticCurveTo(0, hy - 3.4, -6.6, hy - 4.2); g.closePath(); });
    } else if (role === 'helper') {
      g.strokeStyle = lit(CAP.band, 1); g.lineWidth = 1.8;
      g.beginPath(); g.arc(0, hy - 0.6, rx + 0.25, PI * 1.1, PI * 1.9); g.stroke();
      if (!back) bowKnot(CAP.band, 4.8, hy - 6.4, 1.3);
    } else if (role === 'waiter' && !back) {
      const y = top + 1;
      part(CAP.bow, () => {
        g.beginPath();
        g.moveTo(0, y); g.bezierCurveTo(-1.1, y - 2.2, -3.4, y - 2, -3.2, y); g.bezierCurveTo(-3.4, y + 2, -1.1, y + 2.2, 0, y);
        g.moveTo(0, y); g.bezierCurveTo(1.1, y - 2.2, 3.4, y - 2, 3.2, y); g.bezierCurveTo(3.4, y + 2, 1.1, y + 2.2, 0, y);
      });
      part(dimRgb(CAP.bow, 0.88), () => ci(0, y, 0.85));
    }
    if (p.acc === 'star' || p.acc === 'flower') {
      const ax = back ? -5.6 : 5.6, ay = hy - 4.2;
      if (p.acc === 'star') {
        part(CAP.band, () => { g.beginPath(); for (let i = 0; i < 10; i++) { const a = -PI / 2 + i * PI / 5, rd = i % 2 ? 1.1 : 2.4; g[i ? 'lineTo' : 'moveTo'](ax + Math.cos(a) * rd, ay + Math.sin(a) * rd); } g.closePath(); });
      } else {
        part(CAP.bow, () => { g.beginPath(); for (let i = 0; i < 5; i++) { const a = i * PI * 2 / 5, cx = ax + Math.cos(a) * 1.5, cy = ay + Math.sin(a) * 1.5; g.moveTo(cx + 1.2, cy); g.arc(cx, cy, 1.2, 0, PI * 2); } }, false);
        flatFill(CAP.band, () => ci(ax, ay, 0.9));
      }
    }
  }
