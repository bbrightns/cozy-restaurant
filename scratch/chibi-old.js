/* current paintChibi, copied from index.html for comparison (scratch only) */
window.paintOld = (function () {
  const STAFF_TOP = { chef: rgb('#fff1e2'), waiter: rgb('#8e78b8'), helper: rgb('#5fae98') };
  const GUEST_SCARF = ['#f4978e', '#f6d27a', '#7fb8e6', '#e8a06a', '#c9a0dc'].map(rgb);
  const CAP = { white: rgb('#fbf0e3'), whiteDeep: rgb('#efdfcc'), band: rgb('#f6d27a'), bow: rgb('#ffb5a7'), apron: rgb('#8a6f7e'), vest: rgb('#6f5c9c'), apronY: rgb('#f6d27a'), blush: rgb('#ff9f96'), mouth: rgb('#b8566a'), cream: rgb('#fff8ef') };
  const dimRgb = (c, f) => [c[0] * f, c[1] * f, c[2] * f];
  const CHIBI = { top: 12.5, topSit: 7.5, headUp: 6.6, rx: 8, ry: 7.4 };
  const headRise = (sitting) => (sitting ? CHIBI.topSit : CHIBI.top) + CHIBI.headUp;   // head centre height above the feet
  function paintChibi(g, b, sitting, pose, scarf) {
    const p = b.look || b, role = b.role, tc = role ? STAFF_TOP[role] : b.shirt;
    const stp = pose.st * 1.4, sw = pose.st * 1.3, back = !!pose.back;
    const top = sitting ? -CHIBI.topSit : -CHIBI.top, th = sitting ? 7.5 : 7.9;
    const rr = (x, y, w, h, r) => { g.beginPath(); if (g.roundRect) g.roundRect(x, y, w, h, r); else g.rect(x, y, w, h); };
    const ci = (x, y, r) => { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); };
    // one part: light-to-dark across the body, then an edge tone of its own colour
    const part = (c, build, edge) => {
      build();
      const gr = g.createLinearGradient(-7, 0, 7, 0);
      gr.addColorStop(0, lit(c, 1.07));
      gr.addColorStop(1, lit(c, 0.84));
      g.fillStyle = gr;
      g.fill();
      if (edge !== false) { g.strokeStyle = lit(c, 0.74); g.lineWidth = 0.5; g.lineJoin = 'round'; g.stroke(); }
    };
    const flatFill = (c, build, a) => { build(); g.fillStyle = lit(c, 1, a); g.fill(); };
    // a soft blob: colour c at alpha a in the middle fading to clear at the rim, squashed to an rx by ry ellipse
    const soft = (c, x, y, rx, ry, a) => {
      g.save();
      g.translate(x, y);
      g.scale(1, ry / rx);
      const gr = g.createRadialGradient(0, 0, 0, 0, 0, rx);
      gr.addColorStop(0, lit(c, 1, a));
      gr.addColorStop(1, lit(c, 1, 0));
      g.fillStyle = gr;
      g.beginPath(); g.arc(0, 0, rx, 0, Math.PI * 2); g.fill();
      g.restore();
    };
    g.lineCap = 'round';
    // legs and shoes (seated guests are hidden by the table and chair)
    if (!sitting) {
      const shoe = dimRgb(b.pants, 0.7);
      const lh = Math.max(0, stp), rh = Math.max(0, -stp);
      part(b.pants, () => rr(-3.3, -5.4, 2.8, 5.4 - lh, 1.2));
      part(b.pants, () => rr(0.5, -5.4, 2.8, 5.4 - rh, 1.2));
      part(shoe, () => rr(-3.7, -lh - 1.7, 3.6, 1.7, 0.85));
      part(shoe, () => rr(0.1, -rh - 1.7, 3.6, 1.7, 0.85));
    }
    // arms, swinging against the legs
    part(dimRgb(tc, 0.94), () => rr(-6, top + 1 + sw * 0.3, 2.4, 5.6, 1.2));
    part(dimRgb(tc, 0.94), () => rr(3.6, top + 1 - sw * 0.3, 2.4, 5.6, 1.2));
    part(b.skin, () => ci(-4.8, top + 6.9 + sw * 0.3, 1.35));
    part(b.skin, () => ci(4.8, top + 6.9 - sw * 0.3, 1.35));
    // torso and the role garment over it
    const torso = () => rr(-4.3, top, 8.6, th, 3.2);
    part(tc, torso);
    if (role === 'chef') {
      if (back) part(CAP.apron, () => rr(-4.3, top + 4, 8.6, 0.9, 0.45));   // apron strings
      else {
        part(CAP.apron, () => rr(-3.9, top + 3.8, 7.8, th - 3.6, 1.5));
        flatFill(CAP.cream, () => { g.beginPath(); g.arc(-1.3, top + 1.9, 0.55, 0, Math.PI * 2); g.moveTo(1.85, top + 1.9); g.arc(1.3, top + 1.9, 0.55, 0, Math.PI * 2); });
      }
    } else if (role === 'waiter') {
      if (back) part(CAP.vest, () => rr(-4.1, top + 0.4, 8.2, th - 0.8, 1.7));
      else {
        part(CAP.vest, () => rr(-4.1, top + 0.4, 3, th - 0.8, 1.5));
        part(CAP.vest, () => rr(1.1, top + 0.4, 3, th - 0.8, 1.5));
      }
    } else if (role === 'helper') {
      if (back) part(CAP.apronY, () => rr(-4.3, top + 4, 8.6, 0.9, 0.45));
      else part(CAP.apronY, () => rr(-3.5, top + 3.4, 7, th - 3.2, 1.5));
    }
    if (role && back) {
      // nothing on a staff back
    } else if (role) {
      // staff signature: a cream name badge with a coral dot on the chest, on every uniform
      part(CAP.cream, () => rr(0.6, top + 1.6, 3.4, 2.2, 0.8));
      flatFill(CAP.bow, () => ci(1.6, top + 2.7, 0.55));
    } else {
      // guest signature: a scarf, and a little bag when standing
      const sc = GUEST_SCARF[scarf];
      part(sc, () => rr(-4, top + 0.9, 8, 1.9, 1));
      if (!sitting) part(dimRgb(sc, 0.85), () => rr(3.2, top + 5.2, 3.6, 3, 1));
    }
    if (pose.eat >= 0) part(b.skin, () => ci(4.9, top + 5 - (pose.eat / 3) * 3.6, 1.5));
    // the head's soft shadow on the chest, kept inside the torso
    g.save();
    torso();
    g.clip();
    soft(dimRgb(tc, 0.62), 0, top + 0.5, 5.6, 1.9, 0.45);
    g.restore();

    // head: a slightly wide oval, with the hair that sits behind it
    const hy = top - CHIBI.headUp, rx = CHIBI.rx, ry = CHIBI.ry, r = rx, style = p.hairStyle, hairDeep = dimRgb(b.hair, 0.88);
    const headPath = () => { g.beginPath(); g.ellipse(0, hy, rx, ry, 0, 0, Math.PI * 2); };
    if (style === 'bob') part(hairDeep, () => rr(-r - 0.6, hy - 1, r * 2 + 1.2, 9.6, 3.8));
    else if (style === 'long') part(hairDeep, () => rr(-r - 0.6, hy - 1, r * 2 + 1.2, 13.5, 3.6));
    else if (style === 'twin') part(hairDeep, () => { g.beginPath(); g.ellipse(-r - 0.9, hy + 4.4, 2.6, 4.4, 0, 0, Math.PI * 2); g.moveTo(r + 0.9 + 2.6, hy + 4.4); g.ellipse(r + 0.9, hy + 4.4, 2.6, 4.4, 0, 0, Math.PI * 2); }, false);
    else if (style === 'bun') part(b.hair, () => ci(5.4, hy - 6.6, 3.5));
    if (!back && style !== 'bob' && style !== 'long' && style !== 'curly') {
      part(b.skin, () => { g.beginPath(); g.ellipse(-rx + 0.2, hy + 1, 1.3, 1.6, 0, 0, Math.PI * 2); g.moveTo(rx - 0.2 + 1.3, hy + 1); g.ellipse(rx - 0.2, hy + 1, 1.3, 1.6, 0, 0, Math.PI * 2); });
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
      // seen from behind the head is all hair; bob and long hair fall over the shoulders
      part(b.hair, () => { g.beginPath(); g.ellipse(0, hy - 0.2, rx + 0.45, ry + 0.6, 0, 0, Math.PI * 2); });
      if (style === 'bob') part(hairDeep, () => rr(-r - 0.6, hy - 1, r * 2 + 1.2, 9.6, 3.8));
      else if (style === 'long') part(hairDeep, () => rr(-r - 0.6, hy - 1, r * 2 + 1.2, 13.5, 3.6));
      else if (style === 'buzz') part(dimRgb(b.hair, 0.94), () => { g.beginPath(); g.ellipse(0, hy - 0.2, rx + 0.45, ry + 0.6, 0, 0, Math.PI * 2); });
      else if (style === 'messy') part(b.hair, () => { g.beginPath(); g.moveTo(-1, hy - ry - 0.6); g.lineTo(1.8, hy - ry - 2.8); g.lineTo(3.2, hy - ry); g.closePath(); });
    } else {
      // a soft shade under the fringe and along the jaw, kept on the face
      const shade = dimRgb(b.skin, 0.72);
      g.save();
      headPath();
      g.clip();
      const fs = g.createLinearGradient(0, hy - 4.8, 0, hy - 1.4);
      fs.addColorStop(0, lit(shade, 1, 0.42));
      fs.addColorStop(1, lit(shade, 1, 0));
      g.fillStyle = fs;
      g.fillRect(-rx - 1, hy - 4.8, rx * 2 + 2, 3.4);
      soft(shade, 0, hy + ry + 0.6, rx * 0.85, 2.8, 0.38);
      g.restore();
    }
    // face (front views only), shifted a little toward the way it looks
    g.save();
    g.translate(back ? 0 : 0.8, 0);
    if (!back) {
      const ey = hy + 1, ec = rgb(EYE_COLS[p.eye] || EYE_COLS[0]);
      const glow = ec.map((v) => v + (255 - v) * 0.42), deep = dimRgb(ec, 0.6);
      const happy = p.face === 'happy';
      // soft round blush that fades out at the edge
      soft(CAP.blush, -4.8, ey + 2.2, 2.2, 1.35, 0.62);
      soft(CAP.blush, 4.8, ey + 2.2, 2.2, 1.35, 0.62);
      if (happy || pose.blink) {
        g.strokeStyle = lit(deep, 1); g.lineWidth = 0.75;
        g.beginPath();
        if (happy) {
          const dy = ey + 0.9;
          for (const ex of [-3, 3]) { g.moveTo(ex - 1.3, dy); g.quadraticCurveTo(ex, dy - 1.9, ex + 1.3, dy); }
        } else for (const ex of [-3, 3]) { g.moveTo(ex - 1.4, ey + 0.2); g.quadraticCurveTo(ex, ey + 1.1, ex + 1.4, ey + 0.2); }
        g.stroke();
      } else {
        for (const ex of [-3, 3]) {
          // glossy eye: deep at the top, its own colour, a lighter glow low in the iris, a pupil and two highlights
          g.save();
          g.beginPath(); g.ellipse(ex, ey, 1.6, 2.15, 0, 0, Math.PI * 2);
          const eg = g.createLinearGradient(0, ey - 2.15, 0, ey + 2.15);
          eg.addColorStop(0, lit(deep, 1));
          eg.addColorStop(0.55, lit(ec, 1));
          eg.addColorStop(1, lit(glow, 1));
          g.fillStyle = eg;
          g.fill();
          g.clip();
          soft(glow, ex, ey + 1.35, 1.55, 0.95, 0.8);
          g.restore();
          flatFill(deep, () => { g.beginPath(); g.ellipse(ex, ey - 0.1, 0.68, 1, 0, 0, Math.PI * 2); });
          flatFill(CAP.cream, () => ci(ex + 0.55, ey - 0.85, 0.64));
          flatFill(CAP.cream, () => ci(ex - 0.6, ey + 0.9, 0.33), 0.9);
          // upper lid line
          g.strokeStyle = lit(deep, 1); g.lineWidth = 0.55;
          g.beginPath(); g.ellipse(ex, ey + 0.1, 1.78, 2.22, 0, Math.PI * 1.12, Math.PI * 1.88); g.stroke();
        }
      }
      const my = ey + 2.7;
      g.strokeStyle = lit(CAP.mouth, 1); g.fillStyle = lit(CAP.mouth, 1); g.lineWidth = 0.65;
      if (p.face === 'grin' || happy) {
        g.beginPath(); g.arc(0, my - 0.2, 1.35, 0, Math.PI); g.fill();
        flatFill(CAP.bow, () => { g.beginPath(); g.ellipse(0, my + 0.65, 0.7, 0.32, 0, 0, Math.PI * 2); });
      } else if (p.face === 'cat') {
        g.beginPath(); g.arc(-0.85, my - 0.2, 0.85, 0.1, Math.PI - 0.1); g.moveTo(1.7, my - 0.2); g.arc(0.85, my - 0.2, 0.85, 0.1, Math.PI - 0.1); g.stroke();
      } else { g.beginPath(); g.arc(0, my - 0.4, 1.1, Math.PI * 0.15, Math.PI * 0.85); g.stroke(); }
      if (p.acc === 'glasses') {
        g.strokeStyle = lit(rgb('#8a6f7e'), 1); g.lineWidth = 0.6;
        g.beginPath(); g.arc(-3, ey, 2.5, 0, Math.PI * 2); g.moveTo(5.5, ey); g.arc(3, ey, 2.5, 0, Math.PI * 2); g.moveTo(-0.55, ey - 0.2); g.lineTo(0.55, ey - 0.2); g.stroke();
      } else if (p.acc === 'freckles') {
        flatFill(dimRgb(b.skin, 0.76), () => { g.beginPath(); for (const [x, y] of [[-5.2, 3.9], [-4, 4.4], [-3.9, 3.1], [5.2, 3.9], [4, 4.4], [3.9, 3.1]]) { g.moveTo(x + 0.38, hy + y); g.arc(x, hy + y, 0.38, 0, Math.PI * 2); } }, 0.9);
      }
    }
    g.restore();
    // hair in front, with a glossy band
    if (style === 'curly') {
      part(b.hair, () => { g.beginPath(); for (const [ox, oy, rr_] of [[-6.2, -1.2, 3], [-4.6, -5.2, 3.3], [0, -7.2, 3.5], [4.6, -5.2, 3.3], [6.2, -1.2, 3], [-2, -4.4, 2.7], [2.2, -4.4, 2.7]]) { g.moveTo(ox + rr_, hy + oy); g.arc(ox, hy + oy, rr_, 0, Math.PI * 2); } }, false);
    } else if (!back) {
      const cap = style === 'buzz' ? 0.55 : 0.82;
      part(b.hair, () => {
        g.beginPath(); g.arc(0, hy - 0.2, r + 0.5, Math.PI * 1.04, Math.PI * 1.96);
        g.lineTo(r * 0.9, hy - 1 - cap * 2.4); g.quadraticCurveTo(0, hy - 3 * cap - 1.6, -r * 0.9, hy - 1 - cap * 2.4); g.closePath();
        if (style === 'messy') { g.moveTo(-1, hy - r - 0.6); g.lineTo(1.8, hy - r - 2.8); g.lineTo(3.2, hy - r); g.closePath(); }
      });
    }
    if (style !== 'buzz') {
      g.strokeStyle = lit(b.hair, 1.32, 0.5); g.lineWidth = 0.9;
      g.beginPath(); g.arc(-0.4, hy - 0.4, r - 1.7, Math.PI * 1.2, Math.PI * 1.42); g.stroke();
    }
    // headwear and accessories
    if (role === 'chef') {
      part(CAP.white, () => { g.beginPath(); for (const [ox, oy, rr_] of [[-3.9, -10.3, 3.6], [3.9, -10.3, 3.6], [0, -12.1, 4.1]]) { g.moveTo(ox + rr_, hy + oy); g.arc(ox, hy + oy, rr_, 0, Math.PI * 2); } }, false);
      part(CAP.white, () => rr(-6.3, hy - 9.9, 12.6, 5.8, 1.9), false);
      part(CAP.whiteDeep, () => rr(-6.5, hy - 6.1, 13, 2, 1));
    } else if (role === 'helper') {
      g.strokeStyle = lit(CAP.band, 1); g.lineWidth = 1.8;
      g.beginPath(); g.arc(0, hy - 0.6, r + 0.2, Math.PI * 1.1, Math.PI * 1.9); g.stroke();
    } else if (role === 'waiter' && !back) {
      const y = top + 0.8;
      part(CAP.bow, () => { g.beginPath(); g.moveTo(0, y); g.lineTo(-3, y - 1.7); g.lineTo(-3, y + 1.7); g.closePath(); g.moveTo(0, y); g.lineTo(3, y - 1.7); g.lineTo(3, y + 1.7); g.closePath(); });
    }
    if (p.acc === 'star' || p.acc === 'flower') {
      const ax = 5.6, ay = hy - 4.2;
      if (p.acc === 'star') {
        part(CAP.band, () => { g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rd = i % 2 ? 1.1 : 2.4; g[i ? 'lineTo' : 'moveTo'](ax + Math.cos(a) * rd, ay + Math.sin(a) * rd); } g.closePath(); });
      } else {
        part(CAP.bow, () => { g.beginPath(); for (let i = 0; i < 5; i++) { const a = i * Math.PI * 2 / 5, cx = ax + Math.cos(a) * 1.5, cy = ay + Math.sin(a) * 1.5; g.moveTo(cx + 1.2, cy); g.arc(cx, cy, 1.2, 0, Math.PI * 2); } }, false);
        flatFill(CAP.band, () => ci(ax, ay, 0.9));
      }
    }
  }
  return paintChibi;
})();
