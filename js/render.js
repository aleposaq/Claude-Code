/*
 * PRISM — canvas renderer.
 *
 * Icon language — every mechanic has a DISTINCT silhouette so nothing reads alike:
 *   source ....... filled disc + bright nozzle arrow
 *   crystal ...... faceted hexagon gem (colour core)
 *   mirror ....... clean bright bar (player) — fixed mirror is blue-grey with end-anchors
 *   wall ......... solid beveled block
 *   gel .......... translucent glass tile (subtractive colour)
 *   gate ......... coloured portcullis door (vertical bars + lock)
 *   bleach ....... white starburst
 *   prism ........ rainbow-edged triangle
 *   splitter ..... glass cube + half-mirror diagonal + two diverging arrows
 *   rotator ...... circular rotation arrow around an RGB tri-core
 *   tinter ....... colour injector: ringed "+" glowing in its added colour
 *   portal ....... hollow glowing ring (torus) with an orbiting spark, paired colour
 *   void ......... filled black hole with a danger ring + accretion spikes
 */
(function () {
  'use strict';
  const MASKCOL = { 0:'#3a4368',1:'#4aa8ff',2:'#41e0a3',3:'#38e6e6',4:'#ff5a78',5:'#c66bff',6:'#ffd35a',7:'#eaf6ff' };
  const MASKGLW = { 0:'58,67,104',1:'74,168,255',2:'65,224,163',3:'56,230,230',4:'255,90,120',5:'198,107,255',6:'255,211,90',7:'180,225,255' };
  const PORTAL_PAIR = ['#38e6e6', '#ffd35a', '#c66bff', '#41e0a3', '#ff9d5a'];
  const col = m => MASKCOL[m] || MASKCOL[7];
  const glw = m => MASKGLW[m] || MASKGLW[7];

  function Renderer(canvas) {
    this.canvas = canvas; this.ctx = canvas.getContext('2d');
    this.cell = 40; this.ox = 0; this.oy = 0; this.particles = [];
    this.accent = '#4aa8ff'; this.reduceMotion = false;
  }
  Renderer.prototype.layout = function (level) {
    const dpr = window.devicePixelRatio || 1, rect = this.canvas.getBoundingClientRect();
    const W = rect.width, H = rect.height;
    this.canvas.width = W * dpr; this.canvas.height = H * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cell = Math.floor(Math.min(W / level.w, H / level.h));
    this.cell = cell; this.ox = Math.floor((W - cell * level.w) / 2); this.oy = Math.floor((H - cell * level.h) / 2);
    this.viewW = W; this.viewH = H;
  };
  Renderer.prototype.cellAt = function (px, py) { return { x: Math.floor((px - this.ox) / this.cell), y: Math.floor((py - this.oy) / this.cell) }; };
  Renderer.prototype.burst = function (cx, cy, mask, big) {
    const c = this.ox + (cx + .5) * this.cell, d = this.oy + (cy + .5) * this.cell;
    const n = big ? 30 : 18;
    for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, s = 1 + Math.random() * (big ? 5 : 3.4); this.particles.push({ x: c, y: d, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, mask: mask == null ? 7 : mask, r: 2 + Math.random() * 2.5 }); }
  };

  Renderer.prototype.draw = function (level, placed, sim) {
    const ctx = this.ctx, cell = this.cell, ox = this.ox, oy = this.oy, t = this.reduceMotion ? 0 : Date.now();
    ctx.clearRect(0, 0, this.viewW, this.viewH);

    // board backdrop — faintly tinted by the world accent
    const bw = level.w * cell, bh = level.h * cell;
    const bg = ctx.createLinearGradient(ox, oy, ox, oy + bh);
    bg.addColorStop(0, 'rgba(14,18,40,0.66)'); bg.addColorStop(1, 'rgba(8,11,26,0.66)');
    ctx.fillStyle = bg; rr(ctx, ox - 7, oy - 7, bw + 14, bh + 14, 16); ctx.fill();
    ctx.save(); ctx.globalAlpha = 0.06; ctx.fillStyle = this.accent; rr(ctx, ox - 7, oy - 7, bw + 14, bh + 14, 16); ctx.fill(); ctx.restore();
    ctx.strokeStyle = 'rgba(120,150,220,0.10)'; ctx.lineWidth = 1;
    for (let x = 0; x <= level.w; x++) ln(ctx, ox + x * cell, oy, ox + x * cell, oy + bh);
    for (let y = 0; y <= level.h; y++) ln(ctx, ox, oy + y * cell, ox + bw, oy + y * cell);
    const cx = g => ox + (g + .5) * cell, cy = g => oy + (g + .5) * cell;

    // walls — solid beveled block
    (level.walls || []).forEach(([x, y]) => {
      ctx.fillStyle = 'rgba(58,71,116,0.96)'; rr(ctx, ox + x * cell + 2, oy + y * cell + 2, cell - 4, cell - 4, 5); ctx.fill();
      ctx.fillStyle = 'rgba(96,116,172,0.55)'; rr(ctx, ox + x * cell + 3, oy + y * cell + 3, cell - 6, (cell - 6) * 0.38, 4); ctx.fill();
      ctx.fillStyle = 'rgba(8,11,26,0.35)'; rr(ctx, ox + x * cell + 3, oy + y * cell + (cell - 6) * 0.66, cell - 6, (cell - 6) * 0.32, 4); ctx.fill();
    });

    // voids — filled black hole with danger ring + accretion spikes
    (level.voids || []).forEach(([x, y]) => {
      ctx.save(); ctx.translate(cx(x), cy(y)); const R = cell * 0.34;
      const g = ctx.createRadialGradient(0, 0, 1, 0, 0, R); g.addColorStop(0, '#000'); g.addColorStop(.7, '#0a0410'); g.addColorStop(1, 'rgba(20,6,16,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, R, 0, 6.2832); ctx.fill();
      ctx.strokeStyle = '#ff5a78'; ctx.lineWidth = 2; ctx.shadowColor = '#ff3b62'; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.arc(0, 0, R * 0.62, 0, 6.2832); ctx.stroke(); ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(255,120,140,0.85)'; ctx.lineWidth = 2; const rot = t / 700;
      for (let i = 0; i < 8; i++) { const a = rot + i * 0.785; ln(ctx, Math.cos(a) * R * 0.72, Math.sin(a) * R * 0.72, Math.cos(a) * R * 0.98, Math.sin(a) * R * 0.98); }
      ctx.restore();
    });

    // beams — soft glow pass then bright core
    const beams = sim ? sim.segments : []; ctx.lineCap = 'round';
    for (let pass = 0; pass < 2; pass++) beams.forEach(s => {
      ctx.beginPath(); ctx.moveTo(ox + s.x1 * cell, oy + s.y1 * cell); ctx.lineTo(ox + s.x2 * cell, oy + s.y2 * cell);
      if (pass === 0) { ctx.strokeStyle = 'rgba(' + glw(s.mask) + ',0.22)'; ctx.lineWidth = cell * 0.42; }
      else { ctx.strokeStyle = col(s.mask); ctx.lineWidth = Math.max(2, cell * 0.09); }
      ctx.stroke();
    });

    // gels — translucent glass tile
    (level.filters || []).forEach(f => {
      const c = col(f.mask); ctx.save(); ctx.translate(cx(f.x), cy(f.y)); const r = cell * 0.3;
      ctx.fillStyle = 'rgba(8,12,28,0.55)'; rr(ctx, -r, -r, r * 2, r * 2, 6); ctx.fill();
      ctx.globalAlpha = 0.42; ctx.fillStyle = c; rr(ctx, -r, -r, r * 2, r * 2, 6); ctx.fill();
      ctx.globalAlpha = 1; ctx.strokeStyle = c; ctx.lineWidth = 2.5; rr(ctx, -r, -r, r * 2, r * 2, 6); ctx.stroke();
      ctx.globalAlpha = 0.5; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.4; ln(ctx, -r * 0.5, -r * 0.78, r * 0.78, r * 0.5); ctx.globalAlpha = 1;
      ctx.restore();
    });

    // gates — coloured portcullis door (vertical bars + lock)
    (level.gates || []).forEach(g => {
      const c = col(g.mask); ctx.save(); ctx.translate(cx(g.x), cy(g.y)); const r = cell * 0.34;
      ctx.globalAlpha = 0.18 + 0.06 * Math.sin(t / 260); ctx.fillStyle = c; rr(ctx, -r, -r, r * 2, r * 2, 4); ctx.fill(); ctx.globalAlpha = 1;
      ctx.fillStyle = '#cfd8ee'; ctx.fillRect(-r, -r, cell * 0.07, r * 2); ctx.fillRect(r - cell * 0.07, -r, cell * 0.07, r * 2);
      ctx.fillStyle = c; ctx.shadowColor = c; ctx.shadowBlur = 8;
      for (let i = -1; i <= 1; i++) ctx.fillRect(i * r * 0.5 - cell * 0.03, -r * 0.85, cell * 0.06, r * 1.7);
      ctx.shadowBlur = 0; ctx.fillStyle = '#0a0e1e'; ctx.strokeStyle = c; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(0, 0, r * 0.26, 0, 6.2832); ctx.fill(); ctx.stroke();
      ctx.restore();
    });

    // tinters — colour injector: ringed "+" glowing in its added colour
    (level.tinters || []).forEach(p => {
      const c = col(p.mask); ctx.save(); ctx.translate(cx(p.x), cy(p.y)); const R = cell * 0.3;
      const g = ctx.createRadialGradient(0, 0, 1, 0, 0, R); g.addColorStop(0, c); g.addColorStop(1, 'rgba(8,12,28,0.1)');
      ctx.globalAlpha = 0.4; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, R, 0, 6.2832); ctx.fill(); ctx.globalAlpha = 1;
      ctx.strokeStyle = c; ctx.lineWidth = 2.2; ctx.shadowColor = c; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(0, 0, R * 0.82, 0, 6.2832); ctx.stroke();
      ctx.lineWidth = 3.2; ctx.lineCap = 'round'; ln(ctx, -R * 0.42, 0, R * 0.42, 0); ln(ctx, 0, -R * 0.42, 0, R * 0.42);
      ctx.restore();
    });

    // rotators — circular rotation arrow around an RGB tri-core
    (level.rotators || []).forEach(p => {
      ctx.save(); ctx.translate(cx(p.x), cy(p.y)); const R = cell * 0.31; const a0 = t / 900;
      // tri-colour core
      [[ -1, '#ff5a78'], [0.3, '#41e0a3'], [1.6, '#4aa8ff']].forEach(([ang, cc], i) => {
        ctx.fillStyle = cc; ctx.beginPath(); ctx.arc(Math.cos(a0 + i * 2.094) * R * 0.28, Math.sin(a0 + i * 2.094) * R * 0.28, R * 0.2, 0, 6.2832); ctx.fill();
      });
      ctx.strokeStyle = 'rgba(220,232,255,0.92)'; ctx.lineWidth = 2.4; ctx.lineCap = 'round'; ctx.shadowColor = 'rgba(190,210,255,.7)'; ctx.shadowBlur = 6;
      ctx.beginPath(); ctx.arc(0, 0, R * 0.78, a0 + 0.5, a0 + 5.4); ctx.stroke();
      const ex = Math.cos(a0 + 5.4) * R * 0.78, ey = Math.sin(a0 + 5.4) * R * 0.78, ta = a0 + 5.4 + 1.57;
      ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex + Math.cos(ta - 0.5) * R * 0.3, ey + Math.sin(ta - 0.5) * R * 0.3); ctx.lineTo(ex + Math.cos(ta + 0.5) * R * 0.3, ey + Math.sin(ta + 0.5) * R * 0.3); ctx.closePath(); ctx.fillStyle = '#dce8ff'; ctx.fill();
      ctx.restore();
    });

    // bleach — white starburst
    (level.bleaches || []).forEach(p => {
      ctx.save(); ctx.translate(cx(p.x), cy(p.y)); ctx.strokeStyle = '#eaf6ff'; ctx.lineWidth = 2.4;
      ctx.shadowColor = '#fff'; ctx.shadowBlur = 12; const R = cell * 0.28;
      for (let i = 0; i < 8; i++) { const a = i * 0.785 + t / 2400; ln(ctx, Math.cos(a) * R * 0.32, Math.sin(a) * R * 0.32, Math.cos(a) * R, Math.sin(a) * R); }
      ctx.beginPath(); ctx.arc(0, 0, R * 0.32, 0, 6.2832); ctx.stroke(); ctx.restore();
    });

    // prism — rainbow triangle
    (level.prisms || []).forEach(p => {
      ctx.save(); ctx.translate(cx(p.x), cy(p.y)); const r = cell * 0.32;
      const grd = ctx.createLinearGradient(-r, r, r, -r); grd.addColorStop(0, '#ff5a78'); grd.addColorStop(.5, '#41e0a3'); grd.addColorStop(1, '#4aa8ff');
      ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(r * 0.92, r * 0.62); ctx.lineTo(-r * 0.92, r * 0.62); ctx.closePath();
      ctx.fillStyle = 'rgba(10,14,30,0.7)'; ctx.fill(); ctx.strokeStyle = grd; ctx.lineWidth = 3; ctx.shadowColor = 'rgba(200,220,255,.6)'; ctx.shadowBlur = 8; ctx.stroke(); ctx.restore();
    });

    // splitters — glass cube + half-mirror diagonal + two diverging arrows
    (level.splitters || []).forEach(s => {
      ctx.save(); ctx.translate(cx(s.x), cy(s.y)); const r = cell * 0.27;
      ctx.fillStyle = 'rgba(120,180,255,0.08)'; rr(ctx, -r, -r, r * 2, r * 2, 4); ctx.fill();
      ctx.strokeStyle = 'rgba(159,208,255,0.7)'; ctx.lineWidth = 2; ctx.strokeRect(-r, -r, r * 2, r * 2);
      ctx.strokeStyle = '#cfe6ff'; ctx.lineWidth = 2.6; ctx.shadowColor = '#9fd0ff'; ctx.shadowBlur = 7; ctx.lineCap = 'round';
      ctx.beginPath(); if (s.orient === '/') { ctx.moveTo(r, -r); ctx.lineTo(-r, r); } else { ctx.moveTo(-r, -r); ctx.lineTo(r, r); } ctx.stroke();
      ctx.shadowBlur = 0; ctx.fillStyle = 'rgba(207,230,255,0.9)';
      const arr = (ax, ay) => { ctx.beginPath(); ctx.arc(ax * r * 0.92, ay * r * 0.92, cell * 0.045, 0, 6.2832); ctx.fill(); };
      arr(1, 0); arr(0, 1); // two output stubs
      ctx.restore();
    });

    // portals — hollow glowing ring with an orbiting spark, paired colour
    (level.portals || []).forEach((p, i) => {
      const c = PORTAL_PAIR[(i >> 1) % PORTAL_PAIR.length]; ctx.save(); ctx.translate(cx(p.x), cy(p.y)); const R = cell * 0.3;
      ctx.strokeStyle = c; ctx.shadowColor = c; ctx.shadowBlur = 12;
      ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, R * 0.86, 0, 6.2832); ctx.stroke();
      ctx.lineWidth = 1.6; ctx.globalAlpha = 0.6; ctx.beginPath(); ctx.arc(0, 0, R * 0.55, 0, 6.2832); ctx.stroke(); ctx.globalAlpha = 1;
      ctx.shadowBlur = 0; const a = t / 360 + i; ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(Math.cos(a) * R * 0.86, Math.sin(a) * R * 0.86, cell * 0.05, 0, 6.2832); ctx.fill();
      ctx.restore();
    });

    // sources — disc + bold nozzle arrow
    (level.sources || []).forEach(s => {
      ctx.save(); ctx.translate(cx(s.x), cy(s.y)); const R = cell * 0.32;
      ctx.fillStyle = 'rgba(8,12,28,0.92)'; ctx.beginPath(); ctx.arc(0, 0, R, 0, 6.2832); ctx.fill();
      ctx.strokeStyle = col(s.mask); ctx.lineWidth = 3; ctx.shadowColor = col(s.mask); ctx.shadowBlur = 14; ctx.beginPath(); ctx.arc(0, 0, R, 0, 6.2832); ctx.stroke();
      const d = Engine.DIRS[s.dir], a = Math.atan2(d[1], d[0]); ctx.rotate(a); ctx.shadowBlur = 0; ctx.fillStyle = col(s.mask);
      ctx.beginPath(); ctx.moveTo(R * 0.34, 0); ctx.lineTo(-R * 0.22, -R * 0.42); ctx.lineTo(-R * 0.22, R * 0.42); ctx.closePath(); ctx.fill();
      ctx.restore();
    });

    // crystals — faceted hexagon gem
    const st = {}; if (sim) sim.targetStatus.forEach(x => st[x.x + ',' + x.y] = x);
    (level.targets || []).forEach(tg => {
      const s = st[tg.x + ',' + tg.y] || { lit: false }, c = col(tg.mask);
      ctx.save(); ctx.translate(cx(tg.x), cy(tg.y)); const R = cell * 0.3 * (s.lit ? 1 + 0.05 * Math.sin(t / 110) : 1);
      if (s.lit) { ctx.shadowColor = c; ctx.shadowBlur = 24; }
      ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = -1.5708 + i * 1.0472, px = Math.cos(a) * R, py = Math.sin(a) * R; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.closePath();
      ctx.fillStyle = s.lit ? c : 'rgba(20,26,48,0.92)'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = c; ctx.stroke();
      ctx.shadowBlur = 0; ctx.globalAlpha = s.lit ? 0.5 : 0.7; ctx.lineWidth = 1; ctx.strokeStyle = s.lit ? 'rgba(255,255,255,.6)' : c;
      ln(ctx, 0, -R, 0, R); ln(ctx, -R * 0.86, -R * 0.5, R * 0.86, R * 0.5); ln(ctx, -R * 0.86, R * 0.5, R * 0.86, -R * 0.5);
      if (!s.lit) { ctx.globalAlpha = 0.85; ctx.fillStyle = c; ctx.beginPath(); ctx.arc(0, 0, R * 0.22, 0, 6.2832); ctx.fill(); }
      ctx.restore();
    });

    // mirrors — placed (bright bar) vs fixed (blue-grey bar with end anchors)
    const dm = (x, y, orient, fixed) => {
      ctx.save(); ctx.translate(cx(x), cy(y)); const r = cell * 0.3; ctx.lineWidth = Math.max(3, cell * 0.11); ctx.lineCap = 'round';
      const x1 = orient === '/' ? r : -r, y1 = -r, x2 = orient === '/' ? -r : r, y2 = r;
      ctx.strokeStyle = fixed ? '#8aa0d8' : '#ffffff'; ctx.shadowColor = fixed ? 'rgba(130,150,210,0.7)' : 'rgba(170,200,255,0.9)'; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      ctx.shadowBlur = 0;
      if (fixed) { ctx.fillStyle = '#6f86c4'; ctx.beginPath(); ctx.arc(x1, y1, cell * 0.05, 0, 6.2832); ctx.fill(); ctx.beginPath(); ctx.arc(x2, y2, cell * 0.05, 0, 6.2832); ctx.fill(); }
      else { ctx.strokeStyle = 'rgba(120,160,255,0.5)'; ctx.lineWidth = 1; }
      ctx.restore();
    };
    (level.fixedMirrors || []).forEach(m => dm(m.x, m.y, m.orient, true));
    placed.forEach(m => dm(m.x, m.y, m.orient, false));

    // particles
    this.particles = this.particles.filter(p => p.life > 0);
    this.particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.life -= 0.022; ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = col(p.mask); ctx.beginPath(); ctx.arc(p.x, p.y, p.r || 3, 0, 6.2832); ctx.fill(); ctx.globalAlpha = 1; });
    return this.particles.length > 0;
  };

  function ln(c, a, b, d, e) { c.beginPath(); c.moveTo(a, b); c.lineTo(d, e); c.stroke(); }
  function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }

  window.Renderer = Renderer;
  window.PRISM_MASKCOL = MASKCOL;
})();
