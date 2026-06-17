/*
 * PRISM — canvas renderer. Distinct, readable icon language:
 *   source = disc + arrow   crystal = faceted hexagon gem   mirror = bar
 *   wall = block   void = dark vortex   gel = glass pane   bleach = sunburst
 *   gate = coloured doorway   splitter = half-mirror cube   prism = triangle
 *   portal = ringed vortex
 */
(function () {
  'use strict';
  const MASKCOL = { 0:'#3a4368',1:'#4aa8ff',2:'#41e0a3',3:'#38e6e6',4:'#ff5a78',5:'#c66bff',6:'#ffd35a',7:'#eaf6ff' };
  const MASKGLW = { 0:'58,67,104',1:'74,168,255',2:'65,224,163',3:'56,230,230',4:'255,90,120',5:'198,107,255',6:'255,211,90',7:'180,225,255' };
  const col = m => MASKCOL[m] || MASKCOL[7];
  const glw = m => MASKGLW[m] || MASKGLW[7];

  function Renderer(canvas) {
    this.canvas = canvas; this.ctx = canvas.getContext('2d');
    this.cell = 40; this.ox = 0; this.oy = 0; this.particles = [];
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
  Renderer.prototype.burst = function (cx, cy, mask) {
    const c = this.ox + (cx + .5) * this.cell, d = this.oy + (cy + .5) * this.cell;
    for (let i = 0; i < 18; i++) { const a = Math.random() * 6.28, s = 1 + Math.random() * 3.4; this.particles.push({ x: c, y: d, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, mask: mask || 7 }); }
  };

  Renderer.prototype.draw = function (level, placed, sim) {
    const ctx = this.ctx, cell = this.cell, ox = this.ox, oy = this.oy, t = Date.now();
    ctx.clearRect(0, 0, this.viewW, this.viewH);
    ctx.fillStyle = 'rgba(12,16,34,0.6)'; rr(ctx, ox - 6, oy - 6, level.w * cell + 12, level.h * cell + 12, 14); ctx.fill();
    ctx.strokeStyle = 'rgba(120,150,220,0.10)'; ctx.lineWidth = 1;
    for (let x = 0; x <= level.w; x++) ln(ctx, ox + x * cell, oy, ox + x * cell, oy + level.h * cell);
    for (let y = 0; y <= level.h; y++) ln(ctx, ox, oy + y * cell, ox + level.w * cell, oy + y * cell);
    const cx = g => ox + (g + .5) * cell, cy = g => oy + (g + .5) * cell;

    // walls
    (level.walls || []).forEach(([x, y]) => {
      ctx.fillStyle = 'rgba(64,78,124,0.95)'; rr(ctx, ox + x * cell + 2, oy + y * cell + 2, cell - 4, cell - 4, 5); ctx.fill();
      ctx.fillStyle = 'rgba(90,108,160,0.5)'; rr(ctx, ox + x * cell + 2, oy + y * cell + 2, cell - 4, (cell - 4) * 0.4, 5); ctx.fill();
    });

    // voids — dark danger vortex
    (level.voids || []).forEach(([x, y]) => {
      ctx.save(); ctx.translate(cx(x), cy(y));
      ctx.fillStyle = '#05060c'; ctx.beginPath(); ctx.arc(0, 0, cell * 0.34, 0, 6.2832); ctx.fill();
      ctx.strokeStyle = 'rgba(255,90,120,0.8)'; ctx.lineWidth = 2.5;
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(0, 0, cell * (0.12 + i * 0.09), i + t / 600, i + t / 600 + 4.4); ctx.stroke(); }
      ctx.restore();
    });

    // beams
    const beams = sim ? sim.segments : []; ctx.lineCap = 'round';
    for (let pass = 0; pass < 2; pass++) beams.forEach(s => {
      ctx.beginPath(); ctx.moveTo(ox + s.x1 * cell, oy + s.y1 * cell); ctx.lineTo(ox + s.x2 * cell, oy + s.y2 * cell);
      if (pass === 0) { ctx.strokeStyle = 'rgba(' + glw(s.mask) + ',0.22)'; ctx.lineWidth = cell * 0.42; }
      else { ctx.strokeStyle = col(s.mask); ctx.lineWidth = Math.max(2, cell * 0.09); }
      ctx.stroke();
    });

    // gates — coloured doorway (posts + force field)
    (level.gates || []).forEach(g => {
      const c = col(g.mask); ctx.save(); ctx.translate(cx(g.x), cy(g.y)); const r = cell * 0.34;
      ctx.fillStyle = '#cfd8ee'; ctx.fillRect(-r, -r, cell * 0.08, r * 2); ctx.fillRect(r - cell * 0.08, -r, cell * 0.08, r * 2);
      ctx.globalAlpha = 0.32 + 0.08 * Math.sin(t / 240); ctx.fillStyle = c; ctx.fillRect(-r + cell * 0.08, -r, r * 2 - cell * 0.16, r * 2);
      ctx.globalAlpha = 1; ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.strokeRect(-r + cell * 0.08, -r, r * 2 - cell * 0.16, r * 2);
      ctx.restore();
    });

    // gels — glass pane with diagonal sheen
    (level.filters || []).forEach(f => {
      const c = col(f.mask); ctx.save(); ctx.translate(cx(f.x), cy(f.y)); const r = cell * 0.3;
      ctx.fillStyle = 'rgba(8,12,28,0.6)'; rrp(ctx, -r, -r, r * 2, r * 2, 5); ctx.fill();
      ctx.globalAlpha = 0.4; ctx.fillStyle = c; rrp(ctx, -r, -r, r * 2, r * 2, 5); ctx.fill();
      ctx.globalAlpha = 1; ctx.strokeStyle = c; ctx.lineWidth = 2.5; rrp(ctx, -r, -r, r * 2, r * 2, 5); ctx.stroke();
      ctx.globalAlpha = 0.5; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ln(ctx, -r * 0.5, -r, r, r * 0.5); ctx.globalAlpha = 1;
      ctx.restore();
    });

    // bleach — white sunburst
    (level.bleaches || []).forEach(p => {
      ctx.save(); ctx.translate(cx(p.x), cy(p.y)); ctx.strokeStyle = '#eaf6ff'; ctx.lineWidth = 2.4;
      ctx.shadowColor = '#fff'; ctx.shadowBlur = 12; const R = cell * 0.28;
      for (let i = 0; i < 8; i++) { const a = i * 0.785; ln(ctx, Math.cos(a) * R * 0.35, Math.sin(a) * R * 0.35, Math.cos(a) * R, Math.sin(a) * R); }
      ctx.beginPath(); ctx.arc(0, 0, R * 0.34, 0, 6.2832); ctx.stroke(); ctx.restore();
    });

    // prism — rainbow triangle
    (level.prisms || []).forEach(p => {
      ctx.save(); ctx.translate(cx(p.x), cy(p.y)); const r = cell * 0.32;
      const grd = ctx.createLinearGradient(-r, r, r, -r); grd.addColorStop(0, '#ff5a78'); grd.addColorStop(.5, '#41e0a3'); grd.addColorStop(1, '#4aa8ff');
      ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(r * 0.92, r * 0.62); ctx.lineTo(-r * 0.92, r * 0.62); ctx.closePath();
      ctx.fillStyle = 'rgba(10,14,30,0.7)'; ctx.fill(); ctx.strokeStyle = grd; ctx.lineWidth = 3; ctx.shadowColor = 'rgba(200,220,255,.6)'; ctx.shadowBlur = 8; ctx.stroke(); ctx.restore();
    });

    // splitters — half-mirror cube (square + diagonal)
    (level.splitters || []).forEach(s => {
      ctx.save(); ctx.translate(cx(s.x), cy(s.y)); const r = cell * 0.27;
      ctx.strokeStyle = 'rgba(207,230,255,0.85)'; ctx.lineWidth = 2.4; ctx.strokeRect(-r, -r, r * 2, r * 2);
      ctx.strokeStyle = '#cfe6ff'; ctx.lineWidth = 3; ctx.shadowColor = '#9fd0ff'; ctx.shadowBlur = 8;
      ctx.beginPath(); if (s.orient === '/') { ctx.moveTo(r, -r); ctx.lineTo(-r, r); } else { ctx.moveTo(-r, -r); ctx.lineTo(r, r); } ctx.stroke();
      ctx.restore();
    });

    // portals — ringed vortex (paired colour by index)
    (level.portals || []).forEach((p, i) => {
      const c = (i >> 1) % 2 ? '#ffd35a' : '#38e6e6'; ctx.save(); ctx.translate(cx(p.x), cy(p.y));
      ctx.strokeStyle = c; ctx.lineWidth = 2.4; ctx.shadowColor = c; ctx.shadowBlur = 10;
      for (let k = 0; k < 3; k++) { const rr2 = cell * (0.12 + k * 0.08); ctx.beginPath(); ctx.arc(0, 0, rr2, t / 400 + k, t / 400 + k + 5); ctx.stroke(); }
      ctx.restore();
    });

    // sources — disc + bold arrow
    (level.sources || []).forEach(s => {
      ctx.save(); ctx.translate(cx(s.x), cy(s.y)); const R = cell * 0.32;
      ctx.fillStyle = 'rgba(8,12,28,0.92)'; ctx.beginPath(); ctx.arc(0, 0, R, 0, 6.2832); ctx.fill();
      ctx.strokeStyle = col(s.mask); ctx.lineWidth = 3; ctx.shadowColor = col(s.mask); ctx.shadowBlur = 14; ctx.beginPath(); ctx.arc(0, 0, R, 0, 6.2832); ctx.stroke();
      const d = Engine.DIRS[s.dir], a = Math.atan2(d[1], d[0]); ctx.rotate(a); ctx.shadowBlur = 0; ctx.fillStyle = col(s.mask);
      ctx.beginPath(); ctx.moveTo(R * 0.2, 0); ctx.lineTo(-R * 0.25, -R * 0.4); ctx.lineTo(-R * 0.25, R * 0.4); ctx.closePath(); ctx.fill();
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

    // mirrors
    const dm = (x, y, orient, fixed) => {
      ctx.save(); ctx.translate(cx(x), cy(y)); const r = cell * 0.3; ctx.lineWidth = Math.max(3, cell * 0.11); ctx.lineCap = 'round';
      ctx.strokeStyle = fixed ? '#8aa0d8' : '#ffffff'; ctx.shadowColor = 'rgba(170,200,255,0.85)'; ctx.shadowBlur = 8;
      ctx.beginPath(); if (orient === '/') { ctx.moveTo(r, -r); ctx.lineTo(-r, r); } else { ctx.moveTo(-r, -r); ctx.lineTo(r, r); } ctx.stroke();
      if (!fixed) { ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(120,160,255,0.5)'; ctx.lineWidth = 1; }
      ctx.restore();
    };
    (level.fixedMirrors || []).forEach(m => dm(m.x, m.y, m.orient, true));
    placed.forEach(m => dm(m.x, m.y, m.orient, false));

    // particles
    this.particles = this.particles.filter(p => p.life > 0);
    this.particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.life -= 0.025; ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = col(p.mask); ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, 6.2832); ctx.fill(); ctx.globalAlpha = 1; });
    return this.particles.length > 0;
  };

  function ln(c, a, b, d, e) { c.beginPath(); c.moveTo(a, b); c.lineTo(d, e); c.stroke(); }
  function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function rrp(c, x, y, w, h, r) { rr(c, x, y, w, h, r); }

  window.Renderer = Renderer;
  window.PRISM_MASKCOL = MASKCOL;
})();
