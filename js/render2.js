/*
 * PRISM v2 renderer. Commit-fire: in BUILD mode the board shows your machine and
 * dormant sources — no beam. On FIRE the beam sweeps out from the source, locks
 * light, powers switches and slides doors open. Animation teaches the mechanic.
 *   draw(level, placed, sim, opts)   sim==null => build mode (no beam)
 *   opts: { fireStart, ghost:{x,y,tool}, win }
 */
(function () {
  'use strict';
  const MASKCOL = { 0:'#3a4368',1:'#4aa8ff',2:'#41e0a3',3:'#38e6e6',4:'#ff5a78',5:'#c66bff',6:'#ffd35a',7:'#eaf6ff' };
  const MASKGLW = { 0:'58,67,104',1:'74,168,255',2:'65,224,163',3:'56,230,230',4:'255,90,120',5:'198,107,255',6:'255,211,90',7:'180,225,255' };
  const col = m => MASKCOL[m] || MASKCOL[7];
  const glw = m => MASKGLW[m] || MASKGLW[7];
  const FILTERCOL = { 4:'#ff5a78', 2:'#41e0a3', 1:'#4aa8ff' };

  function Renderer2(canvas) {
    this.canvas = canvas; this.ctx = canvas.getContext('2d');
    this.cell = 40; this.ox = 0; this.oy = 0; this.particles = [];
    this.doorAnim = {}; // door id -> eased open amount 0..1
  }
  Renderer2.prototype.layout = function (level) {
    const dpr = window.devicePixelRatio || 1, rect = this.canvas.getBoundingClientRect();
    const W = rect.width, H = rect.height;
    this.canvas.width = W * dpr; this.canvas.height = H * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cell = Math.floor(Math.min(W / level.w, H / level.h));
    this.cell = cell; this.ox = Math.floor((W - cell * level.w) / 2); this.oy = Math.floor((H - cell * level.h) / 2);
    this.viewW = W; this.viewH = H;
  };
  Renderer2.prototype.cellAt = function (px, py) { return { x: Math.floor((px - this.ox) / this.cell), y: Math.floor((py - this.oy) / this.cell) }; };
  Renderer2.prototype.burst = function (cx, cy, mask) {
    const c = this.ox + (cx + .5) * this.cell, d = this.oy + (cy + .5) * this.cell;
    for (let i = 0; i < 22; i++) { const a = Math.random() * 6.28, s = 1 + Math.random() * 3.6; this.particles.push({ x: c, y: d, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, mask: mask || 7 }); }
  };

  Renderer2.prototype.draw = function (level, placed, sim, opts) {
    opts = opts || {};
    const ctx = this.ctx, cell = this.cell, ox = this.ox, oy = this.oy, t = Date.now();
    const cx = g => ox + (g + .5) * cell, cy = g => oy + (g + .5) * cell;
    ctx.clearRect(0, 0, this.viewW, this.viewH);
    ctx.fillStyle = 'rgba(12,16,34,0.6)'; rr(ctx, ox - 6, oy - 6, level.w * cell + 12, level.h * cell + 12, 14); ctx.fill();
    ctx.strokeStyle = 'rgba(120,150,220,0.10)'; ctx.lineWidth = 1;
    for (let x = 0; x <= level.w; x++) ln(ctx, ox + x * cell, oy, ox + x * cell, oy + level.h * cell);
    for (let y = 0; y <= level.h; y++) ln(ctx, ox, oy + y * cell, ox + level.w * cell, oy + level.h * cell);

    // walls
    (level.walls || []).forEach(([x, y]) => {
      ctx.fillStyle = 'rgba(64,78,124,0.95)'; rr(ctx, ox + x * cell + 2, oy + y * cell + 2, cell - 4, cell - 4, 5); ctx.fill();
      ctx.fillStyle = 'rgba(90,108,160,0.5)'; rr(ctx, ox + x * cell + 2, oy + y * cell + 2, cell - 4, (cell - 4) * 0.4, 5); ctx.fill();
    });
    // voids — danger throb
    (level.voids || []).forEach(([x, y]) => {
      ctx.save(); ctx.translate(cx(x), cy(y));
      ctx.fillStyle = '#05060c'; ctx.beginPath(); ctx.arc(0, 0, cell * 0.34, 0, 6.2832); ctx.fill();
      ctx.strokeStyle = 'rgba(255,90,120,' + (0.6 + 0.3 * Math.sin(t / 300)) + ')'; ctx.lineWidth = 2.5;
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(0, 0, cell * (0.12 + i * 0.09), i + t / 600, i + t / 600 + 4.4); ctx.stroke(); }
      ctx.restore();
    });

    // ---- beams (only when fired) with a sweep reveal ----
    let reveal = 1;
    if (sim) {
      if (!sim._dist) computeDist(sim, level);
      const age = opts.fireStart ? (t - opts.fireStart) : 9999;
      reveal = Math.min(1, age / 320);
      const frontier = reveal * sim._maxDist;
      ctx.lineCap = 'round';
      for (let pass = 0; pass < 2; pass++) sim.segments.forEach((s, k) => {
        if (sim._dist[k] > frontier) return;
        ctx.beginPath(); ctx.moveTo(ox + s.x1 * cell, oy + s.y1 * cell); ctx.lineTo(ox + s.x2 * cell, oy + s.y2 * cell);
        if (pass === 0) { ctx.strokeStyle = 'rgba(' + glw(s.mask) + ',0.22)'; ctx.lineWidth = cell * 0.42; }
        else { ctx.strokeStyle = col(s.mask); ctx.lineWidth = Math.max(2, cell * 0.09); }
        ctx.stroke();
        // bright head at the frontier
        if (pass === 1 && sim._dist[k] > frontier - sim._maxDist * 0.08) {
          ctx.fillStyle = '#fff'; ctx.globalAlpha = 0.8; ctx.beginPath(); ctx.arc(ox + s.x2 * cell, oy + s.y2 * cell, cell * 0.12, 0, 6.2832); ctx.fill(); ctx.globalAlpha = 1;
        }
      });
    }

    // ---- doors (animate open) ----
    (level.doors || []).forEach(d => {
      const open = sim && sim.openDoors && sim.openDoors.has(d.door);
      const tgt = open ? 1 : 0;
      const cur = this.doorAnim[d.door + ':' + d.x + ',' + d.y] || 0;
      const next = cur + (tgt - cur) * 0.2;
      this.doorAnim[d.door + ':' + d.x + ',' + d.y] = next;
      ctx.save(); ctx.translate(cx(d.x), cy(d.y)); const r = cell * 0.36;
      ctx.strokeStyle = 'rgba(150,170,220,0.9)'; ctx.lineWidth = 2; ctx.strokeRect(-r, -r, r * 2, r * 2);
      const h = r * (1 - next); // shutters retract as it opens
      ctx.fillStyle = open ? 'rgba(120,220,170,0.85)' : 'rgba(90,110,160,0.95)';
      ctx.fillRect(-r, -r, r * 2, h); ctx.fillRect(-r, r - h, r * 2, h);
      if (next > 0.05) { ctx.strokeStyle = 'rgba(120,220,170,' + (0.5 * next) + ')'; ctx.lineWidth = 2; ln(ctx, -r, 0, r, 0); }
      ctx.restore();
    });

    // ---- teleporters ----
    (level.teleporters || []).forEach(p => {
      ctx.save(); ctx.translate(cx(p.x), cy(p.y)); const c = '#b97bff';
      ctx.strokeStyle = c; ctx.lineWidth = 2.4; ctx.shadowColor = c; ctx.shadowBlur = 10;
      for (let k = 0; k < 3; k++) { const r2 = cell * (0.12 + k * 0.08); ctx.beginPath(); ctx.arc(0, 0, r2, t / 400 + k, t / 400 + k + 5); ctx.stroke(); }
      ctx.restore();
    });

    // ---- switches (power-on pulse) ----
    const swOn = {}; if (sim) (sim.switchStatus || []).forEach(s => { if (s.on) swOn[s.x + ',' + s.y] = true; });
    (level.switches || []).forEach(s => {
      const on = swOn[s.x + ',' + s.y] && reveal > 0.6; const c = col(s.mask);
      ctx.save(); ctx.translate(cx(s.x), cy(s.y)); const R = cell * 0.3 * (on ? 1 + 0.06 * Math.sin(t / 90) : 1);
      if (on) { ctx.shadowColor = c; ctx.shadowBlur = 22; }
      ctx.beginPath(); ctx.moveTo(0, -R); ctx.lineTo(R, 0); ctx.lineTo(0, R); ctx.lineTo(-R, 0); ctx.closePath();
      ctx.fillStyle = on ? c : 'rgba(20,26,48,0.92)'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = c; ctx.stroke();
      ctx.shadowBlur = 0; ctx.fillStyle = on ? '#fff' : c; ctx.globalAlpha = on ? 0.9 : 0.6;
      ctx.beginPath(); ctx.arc(0, 0, R * 0.28, 0, 6.2832); ctx.fill(); ctx.globalAlpha = 1;
      ctx.restore();
    });

    // ---- sources (dormant in build mode, beaming when fired) ----
    (level.sources || []).forEach(s => {
      const live = !!sim; ctx.save(); ctx.translate(cx(s.x), cy(s.y)); const R = cell * 0.32;
      ctx.fillStyle = 'rgba(8,12,28,0.92)'; ctx.beginPath(); ctx.arc(0, 0, R, 0, 6.2832); ctx.fill();
      ctx.strokeStyle = live ? '#eaf6ff' : 'rgba(160,180,220,0.55)'; ctx.lineWidth = 3;
      if (live) { ctx.shadowColor = '#eaf6ff'; ctx.shadowBlur = 14; }
      ctx.beginPath(); ctx.arc(0, 0, R, 0, 6.2832); ctx.stroke();
      const d = DIRS[s.dir], a = Math.atan2(d[1], d[0]); ctx.rotate(a); ctx.shadowBlur = 0;
      ctx.fillStyle = live ? '#eaf6ff' : 'rgba(160,180,220,0.55)';
      ctx.beginPath(); ctx.moveTo(R * 0.2, 0); ctx.lineTo(-R * 0.25, -R * 0.4); ctx.lineTo(-R * 0.25, R * 0.4); ctx.closePath(); ctx.fill();
      ctx.restore();
    });

    // ---- targets ----
    const st = {}; if (sim) sim.targetStatus.forEach(x => st[x.x + ',' + x.y] = x);
    (level.targets || []).forEach(tg => {
      const s = st[tg.x + ',' + tg.y] || { lit: false }, lit = s.lit && reveal > 0.7, c = col(tg.mask);
      ctx.save(); ctx.translate(cx(tg.x), cy(tg.y)); const R = cell * 0.3 * (lit ? 1 + 0.05 * Math.sin(t / 110) : 1);
      if (lit) { ctx.shadowColor = c; ctx.shadowBlur = 24; }
      ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = -1.5708 + i * 1.0472, px = Math.cos(a) * R, py = Math.sin(a) * R; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.closePath();
      ctx.fillStyle = lit ? c : 'rgba(20,26,48,0.92)'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = c; ctx.stroke();
      ctx.shadowBlur = 0; ctx.globalAlpha = lit ? 0.5 : 0.7; ctx.lineWidth = 1; ctx.strokeStyle = lit ? 'rgba(255,255,255,.6)' : c;
      ln(ctx, 0, -R, 0, R); ln(ctx, -R * 0.86, -R * 0.5, R * 0.86, R * 0.5); ln(ctx, -R * 0.86, R * 0.5, R * 0.86, -R * 0.5);
      ctx.globalAlpha = 1; ctx.restore();
    });

    // ---- fixed + placed pieces ----
    (level.fixed || []).forEach(p => drawPiece(ctx, cx(p.x), cy(p.y), cell, p, true, t));
    placed.forEach(p => drawPiece(ctx, cx(p.x), cy(p.y), cell, p, false, t));

    // ghost preview of the selected tool under the cursor cell
    if (opts.ghost && opts.ghost.tool) {
      ctx.globalAlpha = 0.4; drawPiece(ctx, cx(opts.ghost.x), cy(opts.ghost.y), cell, ghostPiece(opts.ghost.tool), false, t); ctx.globalAlpha = 1;
    }

    // particles
    this.particles = this.particles.filter(p => p.life > 0);
    this.particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.life -= 0.022; ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = col(p.mask); ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, 6.2832); ctx.fill(); ctx.globalAlpha = 1; });
  };

  function ghostPiece(tool) { return tool === 'filter' ? { type: 'filter', color: 4 } : { type: tool, orient: '/' }; }

  function drawPiece(ctx, X, Y, cell, p, fixed, t) {
    ctx.save(); ctx.translate(X, Y); const r = cell * 0.3;
    if (p.type === 'mirror') {
      ctx.lineWidth = Math.max(3, cell * 0.11); ctx.lineCap = 'round';
      ctx.strokeStyle = fixed ? '#8aa0d8' : '#ffffff'; ctx.shadowColor = 'rgba(170,200,255,0.85)'; ctx.shadowBlur = 8;
      ctx.beginPath(); if (p.orient === '/') { ctx.moveTo(r, -r); ctx.lineTo(-r, r); } else { ctx.moveTo(-r, -r); ctx.lineTo(r, r); } ctx.stroke();
    } else if (p.type === 'splitter') {
      const q = cell * 0.27; ctx.strokeStyle = 'rgba(207,230,255,0.9)'; ctx.lineWidth = 2.4; ctx.strokeRect(-q, -q, q * 2, q * 2);
      ctx.strokeStyle = '#cfe6ff'; ctx.lineWidth = 3; ctx.shadowColor = '#9fd0ff'; ctx.shadowBlur = 8;
      ctx.beginPath(); if (p.orient === '/') { ctx.moveTo(q, -q); ctx.lineTo(-q, q); } else { ctx.moveTo(-q, -q); ctx.lineTo(q, q); } ctx.stroke();
    } else if (p.type === 'prism') {
      const grd = ctx.createLinearGradient(-r, r, r, -r); grd.addColorStop(0, '#ff5a78'); grd.addColorStop(.5, '#41e0a3'); grd.addColorStop(1, '#4aa8ff');
      const flip = p.orient === '\\' ? -1 : 1; ctx.scale(flip, 1);
      ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(r * 0.92, r * 0.62); ctx.lineTo(-r * 0.92, r * 0.62); ctx.closePath();
      ctx.fillStyle = 'rgba(10,14,30,0.7)'; ctx.fill(); ctx.strokeStyle = grd; ctx.lineWidth = 3; ctx.shadowColor = 'rgba(200,220,255,.6)'; ctx.shadowBlur = 8; ctx.stroke();
    } else if (p.type === 'filter') {
      const c = FILTERCOL[p.color] || '#fff'; const q = cell * 0.3;
      ctx.fillStyle = 'rgba(8,12,28,0.6)'; rr(ctx, -q, -q, q * 2, q * 2, 5); ctx.fill();
      ctx.globalAlpha = 0.45; ctx.fillStyle = c; rr(ctx, -q, -q, q * 2, q * 2, 5); ctx.fill();
      ctx.globalAlpha = 1; ctx.strokeStyle = c; ctx.lineWidth = 2.5; rr(ctx, -q, -q, q * 2, q * 2, 5); ctx.stroke();
      ctx.globalAlpha = 0.5; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ln(ctx, -q * 0.5, -q, q, q * 0.5); ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  function computeDist(sim, level) {
    // distance of each segment from the nearest source, for the sweep reveal
    const srcs = (level.sources || []).map(s => [s.x + .5, s.y + .5]);
    let max = 0; sim._dist = sim.segments.map(s => {
      let d = 1e9; srcs.forEach(([sx, sy]) => { const dd = Math.abs(s.x1 - sx) + Math.abs(s.y1 - sy); if (dd < d) d = dd; });
      if (d > max) max = d; return d;
    });
    sim._maxDist = max + 1;
  }

  const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]];
  function ln(c, a, b, d, e) { c.beginPath(); c.moveTo(a, b); c.lineTo(d, e); c.stroke(); }
  function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }

  window.Renderer2 = Renderer2;
})();
