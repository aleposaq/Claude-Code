/*
 * PRISM — canvas renderer. Draws the grid, fixed objects, the player's mirrors
 * and the glowing beams. Pure drawing; reads game state, mutates nothing.
 */
(function () {
  'use strict';

  // mask -> css colour.  R=4 G=2 B=1.
  const MASKCOL = {
    0: '#3a4368', 1: '#4aa8ff', 2: '#41e0a3', 3: '#38e6e6',
    4: '#ff5a78', 5: '#c66bff', 6: '#ffd35a', 7: '#eaf6ff'
  };
  const MASKGLOW = {
    0: '58,67,104', 1: '74,168,255', 2: '65,224,163', 3: '56,230,230',
    4: '255,90,120', 5: '198,107,255', 6: '255,211,90', 7: '180,225,255'
  };
  const col = m => MASKCOL[m] || MASKCOL[7];
  const glow = m => MASKGLOW[m] || MASKGLOW[7];

  function Renderer(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.cell = 40; this.ox = 0; this.oy = 0;
    this.particles = [];
  }

  Renderer.prototype.layout = function (level) {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    const W = rect.width, H = rect.height;
    this.canvas.width = W * dpr; this.canvas.height = H * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cell = Math.floor(Math.min(W / level.w, H / level.h));
    this.cell = cell;
    this.ox = Math.floor((W - cell * level.w) / 2);
    this.oy = Math.floor((H - cell * level.h) / 2);
    this.viewW = W; this.viewH = H;
  };

  Renderer.prototype.cellAt = function (px, py) {
    return { x: Math.floor((px - this.ox) / this.cell), y: Math.floor((py - this.oy) / this.cell) };
  };

  Renderer.prototype.burst = function (cx, cy, mask) {
    const c = this.ox + (cx + .5) * this.cell, d = this.oy + (cy + .5) * this.cell;
    for (let i = 0; i < 16; i++) {
      const a = Math.random() * Math.PI * 2, s = 1 + Math.random() * 3.2;
      this.particles.push({ x: c, y: d, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, mask: mask || 7 });
    }
  };

  Renderer.prototype.draw = function (level, placed, sim) {
    const ctx = this.ctx, cell = this.cell, ox = this.ox, oy = this.oy;
    ctx.clearRect(0, 0, this.viewW, this.viewH);

    ctx.fillStyle = 'rgba(12,16,34,0.6)';
    roundRect(ctx, ox - 6, oy - 6, level.w * cell + 12, level.h * cell + 12, 14); ctx.fill();

    ctx.strokeStyle = 'rgba(120,150,220,0.12)'; ctx.lineWidth = 1;
    for (let x = 0; x <= level.w; x++) line(ctx, ox + x * cell, oy, ox + x * cell, oy + level.h * cell);
    for (let y = 0; y <= level.h; y++) line(ctx, ox, oy + y * cell, ox + level.w * cell, oy + y * cell);

    const cx = gx => ox + (gx + .5) * cell;
    const cy = gy => oy + (gy + .5) * cell;

    // walls
    ctx.fillStyle = 'rgba(70,84,130,0.9)';
    (level.walls || []).forEach(([x, y]) => { roundRect(ctx, ox + x * cell + 3, oy + y * cell + 3, cell - 6, cell - 6, 6); ctx.fill(); });

    // beams: glow underlay + bright core
    const beams = sim ? sim.segments : [];
    ctx.lineCap = 'round';
    for (let pass = 0; pass < 2; pass++) {
      beams.forEach(s => {
        ctx.beginPath();
        ctx.moveTo(ox + s.x1 * cell, oy + s.y1 * cell);
        ctx.lineTo(ox + s.x2 * cell, oy + s.y2 * cell);
        if (pass === 0) { ctx.strokeStyle = 'rgba(' + glow(s.mask) + ',0.22)'; ctx.lineWidth = cell * 0.42; }
        else { ctx.strokeStyle = col(s.mask); ctx.lineWidth = Math.max(2, cell * 0.09); }
        ctx.stroke();
      });
    }

    // gates (coloured bar that only its own colour may pass)
    (level.gates || []).forEach(g => {
      ctx.save(); ctx.translate(cx(g.x), cy(g.y));
      ctx.strokeStyle = col(g.mask); ctx.lineWidth = 3; ctx.globalAlpha = 0.9;
      ctx.setLineDash([4, 3]);
      ctx.strokeRect(-cell * 0.34, -cell * 0.34, cell * 0.68, cell * 0.68);
      ctx.restore();
    });

    // gels (filters)
    (level.filters || []).forEach(f => {
      const c = col(f.mask);
      ctx.save(); ctx.globalAlpha = 0.85; ctx.fillStyle = 'rgba(8,12,28,0.85)';
      roundRect(ctx, ox + f.x * cell + 4, oy + f.y * cell + 4, cell - 8, cell - 8, 8); ctx.fill();
      ctx.strokeStyle = c; ctx.lineWidth = 3;
      roundRect(ctx, ox + f.x * cell + 4, oy + f.y * cell + 4, cell - 8, cell - 8, 8); ctx.stroke();
      ctx.globalAlpha = 0.35; ctx.fillStyle = c;
      roundRect(ctx, ox + f.x * cell + 8, oy + f.y * cell + 8, cell - 16, cell - 16, 6); ctx.fill();
      ctx.restore();
    });

    // bleach (resets beam to white) — clear ringed star
    (level.bleaches || []).forEach(p => {
      ctx.save(); ctx.translate(cx(p.x), cy(p.y));
      ctx.strokeStyle = '#eaf6ff'; ctx.lineWidth = 2.5;
      ctx.shadowColor = '#ffffff'; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(0, 0, cell * 0.26, 0, Math.PI * 2); ctx.stroke();
      const r = cell * 0.22;
      for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; line(ctx, Math.cos(a) * r * 0.4, Math.sin(a) * r * 0.4, Math.cos(a) * r, Math.sin(a) * r); }
      ctx.restore();
    });

    // prism (dispersion) — rainbow triangle
    (level.prisms || []).forEach(p => {
      ctx.save(); ctx.translate(cx(p.x), cy(p.y));
      const r = cell * 0.3;
      const g = ctx.createLinearGradient(-r, r, r, -r);
      g.addColorStop(0, '#ff5a78'); g.addColorStop(0.5, '#41e0a3'); g.addColorStop(1, '#4aa8ff');
      ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(r * 0.92, r * 0.62); ctx.lineTo(-r * 0.92, r * 0.62); ctx.closePath();
      ctx.strokeStyle = g; ctx.lineWidth = 3; ctx.shadowColor = 'rgba(200,220,255,0.7)'; ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.restore();
    });

    // splitters
    (level.splitters || []).forEach(s => {
      ctx.save(); ctx.translate(cx(s.x), cy(s.y)); ctx.rotate(Math.PI / 4);
      ctx.strokeStyle = '#cfe6ff'; ctx.lineWidth = 3; ctx.shadowColor = '#9fd0ff'; ctx.shadowBlur = 10;
      const r = cell * 0.26; ctx.strokeRect(-r, -r, r * 2, r * 2); ctx.restore();
    });

    // sources
    (level.sources || []).forEach(s => {
      ctx.save(); ctx.translate(cx(s.x), cy(s.y));
      ctx.fillStyle = 'rgba(8,12,28,0.9)';
      ctx.beginPath(); ctx.arc(0, 0, cell * 0.34, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = col(s.mask); ctx.lineWidth = 3; ctx.shadowColor = col(s.mask); ctx.shadowBlur = 14;
      ctx.beginPath(); ctx.arc(0, 0, cell * 0.34, 0, Math.PI * 2); ctx.stroke();
      const d = Engine.DIRS[s.dir]; ctx.fillStyle = col(s.mask);
      ctx.beginPath(); ctx.arc(d[0] * cell * 0.28, d[1] * cell * 0.28, cell * 0.07, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });

    // targets (crystals)
    const status = {};
    if (sim) sim.targetStatus.forEach(t => { status[t.x + ',' + t.y] = t; });
    (level.targets || []).forEach(t => {
      const st = status[t.x + ',' + t.y] || { lit: false };
      const c = col(t.mask);
      ctx.save(); ctx.translate(cx(t.x), cy(t.y));
      const r = cell * 0.28 * (st.lit ? 1 + 0.05 * Math.sin(Date.now() / 120) : 1);
      if (st.lit) { ctx.shadowColor = c; ctx.shadowBlur = 24; }
      ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(r, 0); ctx.lineTo(0, r); ctx.lineTo(-r, 0); ctx.closePath();
      ctx.fillStyle = st.lit ? c : 'rgba(20,26,48,0.92)'; ctx.fill();
      ctx.lineWidth = 2.5; ctx.strokeStyle = c; ctx.stroke();
      // inner pip shows the required colour even when unlit
      if (!st.lit) { ctx.globalAlpha = 0.6; ctx.fillStyle = c; ctx.beginPath(); ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    });

    // mirrors (fixed + placed)
    const drawMirror = (x, y, orient, fixed) => {
      ctx.save(); ctx.translate(cx(x), cy(y));
      const r = cell * 0.3; ctx.lineWidth = Math.max(3, cell * 0.1); ctx.lineCap = 'round';
      ctx.strokeStyle = fixed ? '#8aa0d8' : '#ffffff';
      ctx.shadowColor = 'rgba(170,200,255,0.8)'; ctx.shadowBlur = 8;
      ctx.beginPath();
      if (orient === '/') { ctx.moveTo(r, -r); ctx.lineTo(-r, r); } else { ctx.moveTo(-r, -r); ctx.lineTo(r, r); }
      ctx.stroke(); ctx.restore();
    };
    (level.fixedMirrors || []).forEach(m => drawMirror(m.x, m.y, m.orient, true));
    placed.forEach(m => drawMirror(m.x, m.y, m.orient, false));

    // particles
    this.particles = this.particles.filter(p => p.life > 0);
    this.particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.life -= 0.03;
      ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = col(p.mask);
      ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
    });

    return this.particles.length > 0;
  };

  function line(ctx, x1, y1, x2, y2) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  window.Renderer = Renderer;
  window.PRISM_MASKCOL = MASKCOL;
})();
