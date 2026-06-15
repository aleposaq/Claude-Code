/*
 * PRISM — canvas renderer. Draws the grid, fixed objects, the player's mirrors
 * and the glowing beams. Pure drawing; reads game state, mutates nothing.
 */
(function () {
  'use strict';

  const COLOR = {
    W: '#eaf6ff', R: '#ff5a78', G: '#41e0a3', B: '#4aa8ff'
  };
  const GLOW = {
    W: 'rgba(180,225,255,', R: 'rgba(255,90,120,', G: 'rgba(65,224,163,', B: 'rgba(74,168,255,'
  };

  function Renderer(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.cell = 40;
    this.ox = 0; this.oy = 0;
    this.particles = [];
  }

  Renderer.prototype.layout = function (level) {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    const W = rect.width, H = rect.height;
    this.canvas.width = W * dpr;
    this.canvas.height = H * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cell = Math.floor(Math.min(W / level.w, H / level.h));
    this.cell = cell;
    this.ox = Math.floor((W - cell * level.w) / 2);
    this.oy = Math.floor((H - cell * level.h) / 2);
    this.viewW = W; this.viewH = H;
  };

  Renderer.prototype.cellAt = function (px, py) {
    const x = Math.floor((px - this.ox) / this.cell);
    const y = Math.floor((py - this.oy) / this.cell);
    return { x, y };
  };

  Renderer.prototype.burst = function (cx, cy, color) {
    const c = this.ox + (cx + .5) * this.cell, d = this.oy + (cy + .5) * this.cell;
    for (let i = 0; i < 14; i++) {
      const a = Math.random() * Math.PI * 2, s = 1 + Math.random() * 3;
      this.particles.push({ x: c, y: d, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, color: color || 'W' });
    }
  };

  Renderer.prototype.draw = function (level, placed, sim, opts) {
    const ctx = this.ctx, cell = this.cell, ox = this.ox, oy = this.oy;
    opts = opts || {};
    ctx.clearRect(0, 0, this.viewW, this.viewH);

    // board backdrop
    ctx.fillStyle = 'rgba(12,16,34,0.6)';
    roundRect(ctx, ox - 6, oy - 6, level.w * cell + 12, level.h * cell + 12, 14);
    ctx.fill();

    // grid lines
    ctx.strokeStyle = 'rgba(120,150,220,0.12)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= level.w; x++) line(ctx, ox + x * cell, oy, ox + x * cell, oy + level.h * cell);
    for (let y = 0; y <= level.h; y++) line(ctx, ox, oy + y * cell, ox + level.w * cell, oy + y * cell);

    const cx = (gx) => ox + (gx + .5) * cell;
    const cy = (gy) => oy + (gy + .5) * cell;

    // walls
    ctx.fillStyle = 'rgba(70,84,130,0.9)';
    (level.walls || []).forEach(([x, y]) => {
      roundRect(ctx, ox + x * cell + 3, oy + y * cell + 3, cell - 6, cell - 6, 6); ctx.fill();
    });

    // beams (glow underlay + bright core)
    const beams = sim ? sim.segments : [];
    ctx.lineCap = 'round';
    for (let pass = 0; pass < 2; pass++) {
      beams.forEach(s => {
        const col = COLOR[s.color] || COLOR.W;
        ctx.beginPath();
        ctx.moveTo(ox + s.x1 * cell, oy + s.y1 * cell);
        ctx.lineTo(ox + s.x2 * cell, oy + s.y2 * cell);
        if (pass === 0) { ctx.strokeStyle = (GLOW[s.color] || GLOW.W) + '0.25)'; ctx.lineWidth = cell * 0.42; }
        else { ctx.strokeStyle = col; ctx.lineWidth = Math.max(2, cell * 0.09); }
        ctx.stroke();
      });
    }

    // filters
    (level.filters || []).forEach(f => {
      const col = COLOR[f.color];
      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = 'rgba(8,12,28,0.85)';
      roundRect(ctx, ox + f.x * cell + 4, oy + f.y * cell + 4, cell - 8, cell - 8, 8); ctx.fill();
      ctx.strokeStyle = col; ctx.lineWidth = 3;
      roundRect(ctx, ox + f.x * cell + 4, oy + f.y * cell + 4, cell - 8, cell - 8, 8); ctx.stroke();
      ctx.globalAlpha = 0.4; ctx.fillStyle = col;
      roundRect(ctx, ox + f.x * cell + 8, oy + f.y * cell + 8, cell - 16, cell - 16, 6); ctx.fill();
      ctx.restore();
    });

    // splitters (diamond)
    (level.splitters || []).forEach(s => {
      ctx.save();
      ctx.translate(cx(s.x), cy(s.y));
      ctx.rotate(Math.PI / 4);
      ctx.strokeStyle = '#cfe6ff'; ctx.lineWidth = 3;
      ctx.shadowColor = '#9fd0ff'; ctx.shadowBlur = 10;
      const r = cell * 0.26;
      ctx.strokeRect(-r, -r, r * 2, r * 2);
      ctx.restore();
    });

    // sources
    (level.sources || []).forEach(s => {
      ctx.save();
      ctx.translate(cx(s.x), cy(s.y));
      ctx.fillStyle = 'rgba(8,12,28,0.9)';
      ctx.beginPath(); ctx.arc(0, 0, cell * 0.34, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = COLOR[s.color] || COLOR.W; ctx.lineWidth = 3;
      ctx.shadowColor = COLOR[s.color] || COLOR.W; ctx.shadowBlur = 14;
      ctx.beginPath(); ctx.arc(0, 0, cell * 0.34, 0, Math.PI * 2); ctx.stroke();
      // direction nub
      const d = Engine.DIRS[s.dir];
      ctx.fillStyle = COLOR[s.color] || COLOR.W;
      ctx.beginPath();
      ctx.arc(d[0] * cell * 0.28, d[1] * cell * 0.28, cell * 0.07, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });

    // targets (crystals)
    const status = {};
    if (sim) sim.targetStatus.forEach(t => { status[t.x + ',' + t.y] = t.lit; });
    (level.targets || []).forEach(t => {
      const lit = status[t.x + ',' + t.y];
      const col = COLOR[t.color];
      ctx.save();
      ctx.translate(cx(t.x), cy(t.y));
      const r = cell * 0.28 * (lit ? 1 + 0.05 * Math.sin(Date.now() / 120) : 1);
      if (lit) { ctx.shadowColor = col; ctx.shadowBlur = 22; }
      ctx.beginPath();
      ctx.moveTo(0, -r); ctx.lineTo(r, 0); ctx.lineTo(0, r); ctx.lineTo(-r, 0); ctx.closePath();
      ctx.fillStyle = lit ? col : 'rgba(20,26,48,0.9)';
      ctx.fill();
      ctx.lineWidth = 2.5; ctx.strokeStyle = col; ctx.stroke();
      ctx.restore();
    });

    // mirrors (fixed + placed)
    const drawMirror = (x, y, orient, fixed) => {
      ctx.save();
      ctx.translate(cx(x), cy(y));
      const r = cell * 0.3;
      ctx.lineWidth = Math.max(3, cell * 0.1);
      ctx.lineCap = 'round';
      ctx.strokeStyle = fixed ? '#8aa0d8' : '#ffffff';
      ctx.shadowColor = 'rgba(170,200,255,0.8)'; ctx.shadowBlur = 8;
      ctx.beginPath();
      if (orient === '/') { ctx.moveTo(r, -r); ctx.lineTo(-r, r); }
      else { ctx.moveTo(-r, -r); ctx.lineTo(r, r); }
      ctx.stroke();
      ctx.restore();
    };
    (level.fixedMirrors || []).forEach(m => drawMirror(m.x, m.y, m.orient, true));
    placed.forEach(m => drawMirror(m.x, m.y, m.orient, false));

    // particles
    this.particles = this.particles.filter(p => p.life > 0);
    this.particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.life -= 0.03;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = COLOR[p.color] || COLOR.W;
      ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    });

    return this.particles.length > 0;
  };

  function line(ctx, x1, y1, x2, y2) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  window.Renderer = Renderer;
  window.PRISM_COLORS = COLOR;
})();
