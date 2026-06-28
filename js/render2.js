/*
 * PRISM v2 renderer — cohesive visual identity, per-world theming, intentional
 * animation. Commit-fire: BUILD mode shows the machine + dormant sources (no
 * beam); FIRE sweeps the beam out, powers switches, and slides doors open.
 *   draw(level, placed, sim, opts)   sim==null => build mode
 *   opts: { fireStart }
 * Shared piece art (Renderer2.pieceIcon) is reused for the inventory tray so the
 * tray always matches the board.
 */
(function () {
  'use strict';
  const MASKCOL = { 0:'#3a4368',1:'#4aa8ff',2:'#41e0a3',3:'#38e6e6',4:'#ff5a78',5:'#c66bff',6:'#ffd35a',7:'#eaf6ff' };
  const MASKGLW = { 0:'58,67,104',1:'74,168,255',2:'65,224,163',3:'56,230,230',4:'255,90,120',5:'198,107,255',6:'255,211,90',7:'180,225,255' };
  const FILTERCOL = { 4:'#ff5a78', 2:'#41e0a3', 1:'#4aa8ff' };
  const col = m => MASKCOL[m] || MASKCOL[7];
  const glw = m => MASKGLW[m] || MASKGLW[7];

  // per-world identity: accent + board background. Worlds beyond 5 wrap.
  const THEMES = {
    1: { name: 'Foundry',     accent: '#ffa94a', bg1: '#241423', bg0: '#0d0a16' },
    2: { name: 'Prism Coast', accent: '#38e6e6', bg1: '#0c2233', bg0: '#08111f' },
    3: { name: 'Switchyard',  accent: '#41e0a3', bg1: '#0c2419', bg0: '#08140f' },
    4: { name: 'Wormworks',   accent: '#b97bff', bg1: '#1b0f2c', bg0: '#0d0820' },
    5: { name: 'Crucible',    accent: '#ff5a78', bg1: '#27121d', bg0: '#140810' },
  };
  const themeFor = w => THEMES[((w - 1) % 5) + 1] || THEMES[1];
  const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]];

  function Renderer2(canvas) {
    this.canvas = canvas; this.ctx = canvas.getContext('2d');
    this.cell = 40; this.ox = 0; this.oy = 0; this.particles = []; this.doorAnim = {};
  }
  Renderer2.prototype.layout = function (level) {
    const dpr = window.devicePixelRatio || 1, rect = this.canvas.getBoundingClientRect();
    const W = Math.max(1, rect.width), H = Math.max(1, rect.height);
    this.canvas.width = Math.round(W * dpr); this.canvas.height = Math.round(H * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cell = Math.floor(Math.min(W / level.w, H / level.h));
    this.cell = cell; this.ox = Math.floor((W - cell * level.w) / 2); this.oy = Math.floor((H - cell * level.h) / 2);
    this.viewW = W; this.viewH = H;
  };
  Renderer2.prototype.cellAt = function (px, py) { return { x: Math.floor((px - this.ox) / this.cell), y: Math.floor((py - this.oy) / this.cell) }; };
  Renderer2.prototype.burst = function (cx, cy, mask) {
    const c = this.ox + (cx + .5) * this.cell, d = this.oy + (cy + .5) * this.cell;
    for (let i = 0; i < 24; i++) { const a = Math.random() * 6.28, s = 1.2 + Math.random() * 4; this.particles.push({ x: c, y: d, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, mask: mask || 7 }); }
  };

  Renderer2.prototype.draw = function (level, placed, sim, opts) {
    opts = opts || {};
    const ctx = this.ctx, cell = this.cell, ox = this.ox, oy = this.oy, t = Date.now();
    const th = themeFor(level.world || 1);
    const cx = g => ox + (g + .5) * cell, cy = g => oy + (g + .5) * cell;
    const BW = level.w * cell, BH = level.h * cell;
    ctx.clearRect(0, 0, this.viewW, this.viewH);

    // themed board panel
    const grd = ctx.createLinearGradient(ox, oy, ox, oy + BH);
    grd.addColorStop(0, th.bg1); grd.addColorStop(1, th.bg0);
    ctx.fillStyle = grd; rr(ctx, ox - 6, oy - 6, BW + 12, BH + 12, 16); ctx.fill();
    ctx.strokeStyle = hexA(th.accent, 0.22); ctx.lineWidth = 1.5; rr(ctx, ox - 6, oy - 6, BW + 12, BH + 12, 16); ctx.stroke();
    // grid
    ctx.strokeStyle = hexA(th.accent, 0.08); ctx.lineWidth = 1;
    for (let x = 0; x <= level.w; x++) ln(ctx, ox + x * cell, oy, ox + x * cell, oy + BH);
    for (let y = 0; y <= level.h; y++) ln(ctx, ox, oy + y * cell, ox + BW, oy + y * cell);

    (level.walls || []).forEach(([x, y]) => drawWall(ctx, ox + x * cell, oy + y * cell, cell));
    (level.voids || []).forEach(([x, y]) => drawVoid(ctx, cx(x), cy(y), cell, t));

    // switch->door wires (drawn under everything so they read as connections)
    const swOn = {}; if (sim) (sim.switchStatus || []).forEach(s => { if (s.on) swOn[s.x + ',' + s.y] = true; });
    (level.switches || []).forEach(s => {
      (level.doors || []).filter(d => d.door === s.door).forEach(d => {
        const on = swOn[s.x + ',' + s.y]; ctx.save();
        ctx.strokeStyle = hexA(col(s.mask), on ? 0.85 : 0.22); ctx.lineWidth = on ? 3 : 2;
        ctx.setLineDash([4, 6]); ctx.lineDashOffset = on ? -t / 40 : 0;
        if (on) { ctx.shadowColor = col(s.mask); ctx.shadowBlur = 8; }
        ln(ctx, cx(s.x), cy(s.y), cx(d.x), cy(d.y)); ctx.restore();
      });
    });

    // ---- beam sweep (only when fired) ----
    let reveal = 1;
    if (sim) {
      if (!sim._dist) computeDist(sim, level);
      const age = opts.fireStart ? (t - opts.fireStart) : 9999;
      reveal = Math.min(1, age / 300); const frontier = reveal * sim._maxDist;
      ctx.lineCap = 'round';
      for (let pass = 0; pass < 2; pass++) sim.segments.forEach((s, k) => {
        if (sim._dist[k] > frontier) return;
        ctx.beginPath(); ctx.moveTo(ox + s.x1 * cell, oy + s.y1 * cell); ctx.lineTo(ox + s.x2 * cell, oy + s.y2 * cell);
        if (pass === 0) { ctx.strokeStyle = 'rgba(' + glw(s.mask) + ',0.20)'; ctx.lineWidth = cell * 0.40; }
        else { ctx.strokeStyle = col(s.mask); ctx.lineWidth = Math.max(2, cell * 0.085); }
        ctx.stroke();
        if (pass === 1 && sim._dist[k] > frontier - sim._maxDist * 0.08) { ctx.fillStyle = '#fff'; ctx.globalAlpha = 0.85; ctx.beginPath(); ctx.arc(ox + s.x2 * cell, oy + s.y2 * cell, cell * 0.11, 0, 6.2832); ctx.fill(); ctx.globalAlpha = 1; }
      });
    }

    (level.doors || []).forEach(d => {
      const open = !!(sim && sim.openDoors && sim.openDoors.has(d.door));
      const key = d.door + ':' + d.x + ',' + d.y; const cur = this.doorAnim[key] || 0;
      this.doorAnim[key] = cur + ((open ? 1 : 0) - cur) * 0.18;
      drawDoor(ctx, cx(d.x), cy(d.y), cell, this.doorAnim[key], col(maskOfDoor(level, d.door)), t);
    });
    (level.teleporters || []).forEach(p => drawTeleporter(ctx, cx(p.x), cy(p.y), cell, t));
    (level.switches || []).forEach(s => drawSwitch(ctx, cx(s.x), cy(s.y), cell, s.mask, swOn[s.x + ',' + s.y] && reveal > 0.6, t));
    (level.sources || []).forEach(s => drawSource(ctx, cx(s.x), cy(s.y), cell, s.dir, !!sim, t));

    const stt = {}; if (sim) sim.targetStatus.forEach(x => stt[x.x + ',' + x.y] = x);
    (level.targets || []).forEach(tg => drawTarget(ctx, cx(tg.x), cy(tg.y), cell, tg.mask, (stt[tg.x + ',' + tg.y] || {}).lit && reveal > 0.7, t));

    (level.fixed || []).forEach(p => drawPiece(ctx, cx(p.x), cy(p.y), cell, p, true, t));
    placed.forEach(p => drawPiece(ctx, cx(p.x), cy(p.y), cell, p, false, t));

    this.particles = this.particles.filter(p => p.life > 0);
    this.particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.life -= 0.02; ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = col(p.mask); ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, 6.2832); ctx.fill(); ctx.globalAlpha = 1; });
  };

  function maskOfDoor(level, id) { const s = (level.switches || []).find(s => s.door === id); return s ? s.mask : 7; }

  // ===== piece art (shared with tray) =====
  function drawPiece(ctx, X, Y, cell, p, fixed, t) {
    ctx.save(); ctx.translate(X, Y); const r = cell * 0.30;
    if (p.type === 'mirror') {
      const g = ctx.createLinearGradient(-r, -r, r, r);
      g.addColorStop(0, fixed ? '#7f93c8' : '#ffffff'); g.addColorStop(0.5, fixed ? '#aeb9da' : '#cfe0ff'); g.addColorStop(1, fixed ? '#5d6ea0' : '#8fb0ff');
      ctx.lineCap = 'round'; ctx.lineWidth = Math.max(3.5, cell * 0.13); ctx.strokeStyle = g;
      ctx.shadowColor = 'rgba(180,210,255,0.9)'; ctx.shadowBlur = 10;
      ctx.beginPath(); if (p.orient === '/') { ctx.moveTo(r, -r); ctx.lineTo(-r, r); } else { ctx.moveTo(-r, -r); ctx.lineTo(r, r); } ctx.stroke();
      ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); if (p.orient === '/') { ctx.moveTo(r * 0.7, -r * 0.7); ctx.lineTo(-r * 0.7, r * 0.7); } else { ctx.moveTo(-r * 0.7, -r * 0.7); ctx.lineTo(r * 0.7, r * 0.7); } ctx.stroke();
    } else if (p.type === 'splitter') {
      const q = cell * 0.28;
      ctx.fillStyle = 'rgba(150,200,255,0.10)'; rr(ctx, -q, -q, q * 2, q * 2, 6); ctx.fill();
      ctx.strokeStyle = 'rgba(180,210,255,0.85)'; ctx.lineWidth = 2.2; rr(ctx, -q, -q, q * 2, q * 2, 6); ctx.stroke();
      ctx.strokeStyle = '#dff0ff'; ctx.lineWidth = 3; ctx.shadowColor = '#9fd0ff'; ctx.shadowBlur = 9;
      ctx.beginPath(); if (p.orient === '/') { ctx.moveTo(q, -q); ctx.lineTo(-q, q); } else { ctx.moveTo(-q, -q); ctx.lineTo(q, q); } ctx.stroke();
      ctx.shadowBlur = 0; ctx.fillStyle = '#dff0ff'; // two output pips
      const pips = p.orient === '/' ? [[q * 0.62, q * 0.62], [-q * 0.62, -q * 0.62]] : [[q * 0.62, -q * 0.62], [-q * 0.62, q * 0.62]];
      pips.forEach(([px, py]) => { ctx.beginPath(); ctx.arc(px, py, q * 0.13, 0, 6.2832); ctx.fill(); });
    } else if (p.type === 'prism') {
      const flip = p.orient === '\\' ? -1 : 1; ctx.scale(flip, 1);
      const g = ctx.createLinearGradient(-r, r, r, -r); g.addColorStop(0, '#ff5a78'); g.addColorStop(.5, '#41e0a3'); g.addColorStop(1, '#4aa8ff');
      ctx.beginPath(); ctx.moveTo(0, -r * 1.05); ctx.lineTo(r * 0.95, r * 0.66); ctx.lineTo(-r * 0.95, r * 0.66); ctx.closePath();
      const fillg = ctx.createLinearGradient(0, -r, 0, r); fillg.addColorStop(0, 'rgba(40,50,80,0.7)'); fillg.addColorStop(1, 'rgba(12,16,30,0.85)');
      ctx.fillStyle = fillg; ctx.fill(); ctx.strokeStyle = g; ctx.lineWidth = 3; ctx.shadowColor = 'rgba(200,220,255,.7)'; ctx.shadowBlur = 9; ctx.stroke();
      ctx.shadowBlur = 0; ctx.globalAlpha = 0.5; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ln(ctx, -r * 0.2, -r * 0.4, r * 0.2, r * 0.3); ctx.globalAlpha = 1;
    } else if (p.type === 'filter') {
      const spectrum = !FILTERCOL[p.color]; const c = FILTERCOL[p.color] || '#cfe6ff'; const q = cell * 0.30;
      ctx.fillStyle = 'rgba(8,12,24,0.55)'; rr(ctx, -q, -q, q * 2, q * 2, 6); ctx.fill();
      let g = ctx.createLinearGradient(-q, -q, q, q);
      if (spectrum) { g.addColorStop(0, 'rgba(255,90,120,0.6)'); g.addColorStop(0.5, 'rgba(65,224,163,0.6)'); g.addColorStop(1, 'rgba(74,168,255,0.6)'); }
      else { g.addColorStop(0, hexA(c, 0.7)); g.addColorStop(1, hexA(c, 0.30)); }
      ctx.fillStyle = g; rr(ctx, -q, -q, q * 2, q * 2, 6); ctx.fill();
      ctx.strokeStyle = spectrum ? 'rgba(207,230,255,0.9)' : c; ctx.lineWidth = 2.5; ctx.shadowColor = spectrum ? '#9fd0ff' : c; ctx.shadowBlur = 7; rr(ctx, -q, -q, q * 2, q * 2, 6); ctx.stroke();
      ctx.shadowBlur = 0; ctx.globalAlpha = 0.6; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ln(ctx, -q * 0.55, -q, q * 0.1, -q * 0.45); ln(ctx, q * 0.1, -q * 0.45, q, -q * 0.9); ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  // ===== switch: a power CELL with a bolt. off=dark, on=charged + radiant =====
  function drawSwitch(ctx, X, Y, cell, mask, on, t) {
    const c = col(mask), r = cell * 0.30; ctx.save(); ctx.translate(X, Y);
    if (on) { for (let i = 0; i < 8; i++) { const a = i * 0.785 + t / 500; ctx.strokeStyle = hexA(c, 0.5); ctx.lineWidth = 2; ln(ctx, Math.cos(a) * r * 1.15, Math.sin(a) * r * 1.15, Math.cos(a) * r * 1.45, Math.sin(a) * r * 1.45); } }
    const pulse = on ? 1 + 0.05 * Math.sin(t / 90) : 1;
    ctx.fillStyle = on ? hexA(c, 0.9) : 'rgba(16,20,38,0.95)';
    if (on) { ctx.shadowColor = c; ctx.shadowBlur = 20; }
    rr(ctx, -r * pulse, -r * pulse, r * 2 * pulse, r * 2 * pulse, 7); ctx.fill();
    ctx.shadowBlur = 0; ctx.strokeStyle = c; ctx.lineWidth = 2.5; rr(ctx, -r, -r, r * 2, r * 2, 7); ctx.stroke();
    // lightning bolt
    ctx.beginPath(); ctx.moveTo(r * 0.18, -r * 0.55); ctx.lineTo(-r * 0.30, r * 0.08); ctx.lineTo(0, r * 0.08); ctx.lineTo(-r * 0.18, r * 0.55); ctx.lineTo(r * 0.34, -r * 0.10); ctx.lineTo(0, -r * 0.10); ctx.closePath();
    ctx.fillStyle = on ? '#fff' : hexA(c, 0.8); ctx.fill();
    ctx.restore();
  }

  // ===== door: locked barrier that slides open. op 0=closed 1=open =====
  function drawDoor(ctx, X, Y, cell, op, c, t) {
    const r = cell * 0.36; ctx.save(); ctx.translate(X, Y);
    ctx.strokeStyle = hexA(c, 0.55 + 0.45 * op); ctx.lineWidth = 2; rr(ctx, -r, -r, r * 2, r * 2, 5); ctx.stroke();
    const h = r * (1 - op); // shutters retract
    const sg = ctx.createLinearGradient(0, -r, 0, r); sg.addColorStop(0, 'rgba(120,135,175,0.98)'); sg.addColorStop(1, 'rgba(70,84,120,0.98)');
    ctx.fillStyle = sg; rr(ctx, -r, -r, r * 2, h, 5); ctx.fill(); rr(ctx, -r, r - h, r * 2, h, 5); ctx.fill();
    // hazard stripes on the shutter edges
    if (h > 3) { ctx.strokeStyle = hexA(c, 0.7); ctx.lineWidth = 2; ln(ctx, -r, -r + h, r, -r + h); ln(ctx, -r, r - h, r, r - h); }
    // lock glyph fades as it opens
    if (op < 0.6) {
      ctx.globalAlpha = 1 - op / 0.6; ctx.strokeStyle = '#e7edff'; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(0, -r * 0.05, r * 0.22, Math.PI, 0); ctx.stroke(); // shackle
      ctx.fillStyle = '#e7edff'; rr(ctx, -r * 0.26, -r * 0.05, r * 0.52, r * 0.42, 3); ctx.fill();
      ctx.globalAlpha = 1;
    } else if (op < 0.99) { // brief "unlocked" flash of passage
      ctx.fillStyle = hexA(c, 0.18 * (op)); rr(ctx, -r, -r, r * 2, r * 2, 5); ctx.fill();
    }
    ctx.restore();
  }

  function drawSource(ctx, X, Y, cell, dir, live, t) {
    ctx.save(); ctx.translate(X, Y); const R = cell * 0.32;
    ctx.fillStyle = 'rgba(6,10,22,0.95)'; ctx.beginPath(); ctx.arc(0, 0, R, 0, 6.2832); ctx.fill();
    const c = live ? '#eaf6ff' : 'rgba(150,170,210,0.5)';
    ctx.strokeStyle = c; ctx.lineWidth = 3; if (live) { ctx.shadowColor = '#eaf6ff'; ctx.shadowBlur = 16; }
    ctx.beginPath(); ctx.arc(0, 0, R, 0, 6.2832); ctx.stroke(); ctx.shadowBlur = 0;
    if (live) { ctx.fillStyle = 'rgba(234,246,255,0.9)'; ctx.beginPath(); ctx.arc(0, 0, R * 0.32 + R * 0.05 * Math.sin(t / 120), 0, 6.2832); ctx.fill(); }
    const d = DIRS[dir]; ctx.rotate(Math.atan2(d[1], d[0])); ctx.fillStyle = c;
    ctx.beginPath(); ctx.moveTo(R * 0.92, 0); ctx.lineTo(R * 0.42, -R * 0.36); ctx.lineTo(R * 0.42, R * 0.36); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  function drawTarget(ctx, X, Y, cell, mask, lit, t) {
    const c = col(mask); ctx.save(); ctx.translate(X, Y); const R = cell * 0.30 * (lit ? 1 + 0.05 * Math.sin(t / 110) : 1);
    if (lit) { ctx.shadowColor = c; ctx.shadowBlur = 26; }
    ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = -1.5708 + i * 1.0472, px = Math.cos(a) * R, py = Math.sin(a) * R; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.closePath();
    ctx.fillStyle = lit ? c : 'rgba(18,24,44,0.92)'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = c; ctx.stroke();
    ctx.shadowBlur = 0; ctx.globalAlpha = lit ? 0.55 : 0.7; ctx.lineWidth = 1; ctx.strokeStyle = lit ? 'rgba(255,255,255,.7)' : c;
    ln(ctx, 0, -R, 0, R); ln(ctx, -R * 0.86, -R * 0.5, R * 0.86, R * 0.5); ln(ctx, -R * 0.86, R * 0.5, R * 0.86, -R * 0.5);
    if (!lit) { ctx.globalAlpha = 0.9; ctx.fillStyle = c; ctx.beginPath(); ctx.arc(0, 0, R * 0.2, 0, 6.2832); ctx.fill(); }
    ctx.globalAlpha = 1; ctx.restore();
  }

  function drawWall(ctx, x, y, cell) {
    const m = 1.5, s = cell - 2 * m; ctx.save();
    const g = ctx.createLinearGradient(x, y, x, y + cell); g.addColorStop(0, '#414c70'); g.addColorStop(0.5, '#2c3450'); g.addColorStop(1, '#202740');
    ctx.fillStyle = g; rr(ctx, x + m, y + m, s, s, 3); ctx.fill();
    ctx.strokeStyle = 'rgba(150,168,210,0.35)'; ctx.lineWidth = 1; rr(ctx, x + m + 1, y + m + 1, s - 2, s - 2, 3); ctx.stroke();
    ctx.fillStyle = 'rgba(18,22,40,0.9)'; const rv = cell * 0.06, p = cell * 0.16; // corner rivets read as "solid block"
    [[p, p], [cell - p, p], [p, cell - p], [cell - p, cell - p]].forEach(([rx, ry]) => { ctx.beginPath(); ctx.arc(x + rx, y + ry, rv, 0, 6.2832); ctx.fill(); });
    ctx.restore();
  }

  function drawVoid(ctx, X, Y, cell, t) {
    ctx.save(); ctx.translate(X, Y); const R = cell * 0.42;
    const g = ctx.createRadialGradient(0, 0, 1, 0, 0, R); g.addColorStop(0, '#000'); g.addColorStop(0.55, '#0a0610'); g.addColorStop(0.8, 'rgba(60,8,24,0.7)'); g.addColorStop(1, 'rgba(6,7,14,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, R, 0, 6.2832); ctx.fill();
    // bright accretion ring
    ctx.strokeStyle = 'rgba(255,80,110,' + (0.85 + 0.15 * Math.sin(t / 200)) + ')'; ctx.lineWidth = 2.4; ctx.shadowColor = '#ff5a78'; ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.arc(0, 0, cell * 0.30, 0, 6.2832); ctx.stroke(); ctx.shadowBlur = 0;
    // inward swirl arms
    ctx.strokeStyle = 'rgba(255,120,150,0.7)'; ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) { const a = i * 1.5708 + t / 360; ctx.beginPath(); ctx.arc(0, 0, cell * 0.18, a, a + 1.1); ctx.stroke(); }
    ctx.restore();
  }

  function drawTeleporter(ctx, X, Y, cell, t) {
    ctx.save(); ctx.translate(X, Y); const c = '#b97bff';
    ctx.strokeStyle = c; ctx.lineWidth = 2.4; ctx.shadowColor = c; ctx.shadowBlur = 10;
    for (let k = 0; k < 3; k++) { const r2 = cell * (0.12 + k * 0.08); ctx.beginPath(); ctx.arc(0, 0, r2, t / 350 + k, t / 350 + k + 5); ctx.stroke(); }
    ctx.restore();
  }

  function computeDist(sim, level) {
    const srcs = (level.sources || []).map(s => [s.x + .5, s.y + .5]); let max = 0;
    sim._dist = sim.segments.map(s => { let d = 1e9; srcs.forEach(([sx, sy]) => { const dd = Math.abs(s.x1 - sx) + Math.abs(s.y1 - sy); if (dd < d) d = dd; }); if (d > max) max = d; return d; });
    sim._maxDist = max + 1;
  }

  // tray icon: render a piece centered into its own canvas
  Renderer2.pieceIcon = function (canvas, type, color) {
    const dpr = window.devicePixelRatio || 1, S = 40; canvas.width = S * dpr; canvas.height = S * dpr;
    const ctx = canvas.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const piece = type === 'filter' ? { type: 'filter', color: color || 4 } : { type, orient: '/' };
    drawPiece(ctx, S / 2, S / 2, S * 1.05, piece, false, Date.now());
  };
  Renderer2.THEMES = THEMES;
  Renderer2.themeFor = themeFor;

  function ln(c, a, b, d, e) { c.beginPath(); c.moveTo(a, b); c.lineTo(d, e); c.stroke(); }
  function rr(c, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function hexA(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; }

  window.Renderer2 = Renderer2;
})();
