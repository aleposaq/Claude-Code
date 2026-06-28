/*
 * PRISM v2 controller. Build a machine from an inventory, then FIRE it.
 * No live beam while building (commit-to-solve). Scored on pieces used vs par.
 */
(function () {
  'use strict';
  const SAVE_KEY = 'prism2.save.v1';
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const LEVELS = window.LEVELS2 || [];

  function loadSave() { try { return JSON.parse(localStorage.getItem(SAVE_KEY)) || {}; } catch (e) { return {}; } }
  function persist() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) {} }
  let save = loadSave();
  function vibe(p) { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) {} }

  const TOOLS = ['mirror', 'splitter', 'prism', 'filter'];
  const GLYPH = { mirror: '╱', splitter: '▣', prism: '△', filter: '▦' };

  const renderer = new Renderer2($('#board2'));
  let level = null, placed = [], sim = null, fireStart = 0, fires = 0, levelIndex = 0;
  let selectedTool = null, animating = false;

  function stars(id) { return (save[id] && save[id].stars) || 0; }
  function isUnlocked(i) { return i === 0 || stars(LEVELS[i - 1].id) > 0; }
  function remaining(type) { return (level.inventory[type] || 0) - placed.filter(p => p.type === type).length; }
  function totalInv() { return TOOLS.reduce((s, t) => s + (level.inventory[t] || 0), 0); }

  function furnitureAt(x, y) {
    const eq = a => (a || []).some(o => (o.x === x && o.y === y) || (Array.isArray(o) && o[0] === x && o[1] === y));
    return eq(level.walls) || eq(level.voids) || eq(level.sources) || eq(level.targets) ||
      eq(level.switches) || eq(level.doors) || eq(level.teleporters) || eq(level.fixed);
  }

  function startLevel(i) {
    levelIndex = i; level = LEVELS[i]; placed = []; sim = null; fires = 0;
    selectedTool = TOOLS.find(t => (level.inventory[t] || 0) > 0) || null;
    renderer.particles = []; renderer.doorAnim = {};
    $('#lvl-name2').textContent = level.name;
    $('#lvl-par2').textContent = 'PAR ' + level.par;
    show('game');
    requestAnimationFrame(() => { renderer.layout(level); buildTray(); updateHud(); });
  }

  function updateHud() {
    $('#pieces-stat').textContent = placed.length + ' / ' + totalInv();
    $('#fires-stat').textContent = fires;
  }

  function buildTray() {
    const tray = $('#tray2'); tray.innerHTML = '';
    TOOLS.forEach(type => {
      if (!(level.inventory[type] > 0)) return;
      const rem = remaining(type);
      const b = document.createElement('button');
      b.className = 'tool' + (selectedTool === type ? ' sel' : '') + (rem <= 0 ? ' empty' : '');
      b.innerHTML = `<span class="tg">${GLYPH[type]}</span><span class="tc">${rem}</span>`;
      b.addEventListener('click', () => { Sound.click(); selectedTool = type; buildTray(); });
      tray.appendChild(b);
    });
  }

  // tap: cycle an existing piece, else place the selected tool
  function tapCell(gx, gy) {
    if (animating) return;
    if (gx < 0 || gy < 0 || gx >= level.w || gy >= level.h) return;
    const ex = placed.find(p => p.x === gx && p.y === gy);
    if (ex) { cyclePiece(ex); }
    else {
      if (furnitureAt(gx, gy)) return;
      if (!selectedTool || remaining(selectedTool) <= 0) { flashTray(); vibe(30); return; }
      const piece = selectedTool === 'filter' ? { type: 'filter', x: gx, y: gy, color: 4 } : { type: selectedTool, x: gx, y: gy, orient: '/' };
      placed.push(piece); Sound.place(); vibe(8);
    }
    sim = null; // any edit returns to BUILD mode — you must FIRE again
    buildTray(); updateHud();
  }

  function cyclePiece(p) {
    if (p.type === 'filter') {
      if (p.color === 4) { p.color = 2; Sound.rotate(); vibe(6); }
      else if (p.color === 2) { p.color = 1; Sound.rotate(); vibe(6); }
      else { removePiece(p); }
    } else {
      if (p.orient === '/') { p.orient = '\\'; Sound.rotate(); vibe(6); }
      else { removePiece(p); }
    }
  }
  function removePiece(p) { placed = placed.filter(q => q !== p); Sound.remove(); vibe(10); }

  function flashTray() { const el = $('#tray2'); el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash'); Sound.back(); }

  function fire() {
    if (animating) return;
    sim = Engine2.simulate(level, placed); fireStart = Date.now(); fires++; updateHud();
    Sound.hit(); vibe(12);
    if (sim.win) {
      animating = true;
      setTimeout(() => { sim.targetStatus.forEach((t, i) => setTimeout(() => renderer.burst(t.x, t.y, t.mask), i * 80)); }, 340);
      Sound.win(); vibe([0, 30, 30, 70]);
      const earned = recordWin();
      setTimeout(() => { showWin(earned); animating = false; }, 900);
    } else if (sim.voidHit) { vibe([0, 40]); }
  }

  function recordWin() {
    let s = 1;
    if (placed.length <= level.par) s = 3; else if (placed.length <= level.par + 1) s = 2;
    const prev = save[level.id] || { stars: 0, bestPieces: 99, bestFires: 99 };
    save[level.id] = { stars: Math.max(prev.stars, s), bestPieces: Math.min(prev.bestPieces, placed.length), bestFires: Math.min(prev.bestFires, fires) };
    persist(); return s;
  }

  function showWin(earned) {
    const last = levelIndex >= LEVELS.length - 1;
    $('#win2-title').textContent = last ? 'FOUNDRY CLEARED' : (earned >= 3 ? 'PERFECT' : 'SOLVED');
    $('#win2-stats').innerHTML = `<b>${placed.length}</b> pieces · par <b>${level.par}</b> · <b>${fires}</b> fire${fires === 1 ? '' : 's'}`;
    const se = $$('#win2-stars .s');
    se.forEach((el, i) => { el.classList.remove('on'); if (i < earned) setTimeout(() => { el.classList.add('on'); Sound.star(); }, 200 + i * 200); });
    $('#btn-next2').style.display = last ? 'none' : '';
    $('#modal-win2').classList.add('show');
  }

  // ---- screens ----
  function show(name) {
    $$('.screen2').forEach(s => s.classList.remove('active'));
    $('#modal-win2').classList.remove('show');
    if (name === 'menu') { $('#screen-menu2').classList.add('active'); buildMenu(); }
    else if (name === 'game') { $('#screen-game2').classList.add('active'); }
  }
  function totalStars() { return LEVELS.reduce((s, l) => s + stars(l.id), 0); }
  function buildMenu() {
    $('#menu-stars2').textContent = totalStars() + ' / ' + (LEVELS.length * 3);
    const grid = $('#level-grid2'); grid.innerHTML = '';
    LEVELS.forEach((l, i) => {
      const unlocked = isUnlocked(i), st = stars(l.id);
      const b = document.createElement('button');
      b.className = 'lvl-btn' + (unlocked ? '' : ' locked');
      b.innerHTML = unlocked ? `<span class="n">${i + 1}</span><span class="s">${'★'.repeat(st)}${'☆'.repeat(3 - st)}</span>` : '🔒';
      if (unlocked) b.addEventListener('click', () => { Sound.click(); startLevel(i); });
      grid.appendChild(b);
    });
  }

  // ---- input ----
  const board = $('#board2');
  board.addEventListener('click', e => {
    const r = board.getBoundingClientRect();
    const c = renderer.cellAt((e.clientX) - r.left, (e.clientY) - r.top);
    tapCell(c.x, c.y);
  });
  $('#btn-fire').addEventListener('click', fire);
  $('#btn-clear2').addEventListener('click', () => { if (animating) return; placed = []; sim = null; Sound.back(); buildTray(); updateHud(); });
  $('#btn-quit2').addEventListener('click', () => { Sound.back(); show('menu'); });
  $('#btn-play2').addEventListener('click', () => { Sound.click(); let i = LEVELS.findIndex((l, k) => isUnlocked(k) && stars(l.id) === 0); if (i < 0) i = 0; startLevel(i); });
  $('#btn-next2').addEventListener('click', () => { Sound.click(); startLevel(Math.min(levelIndex + 1, LEVELS.length - 1)); });
  $('#btn-replay2').addEventListener('click', () => { Sound.click(); startLevel(levelIndex); });
  $('#btn-levels2').addEventListener('click', () => { Sound.click(); show('menu'); });
  window.addEventListener('resize', () => { if (level && $('#screen-game2').classList.contains('active')) renderer.layout(level); });

  function loop() {
    if (level && $('#screen-game2').classList.contains('active')) renderer.draw(level, placed, sim, { fireStart });
    requestAnimationFrame(loop);
  }
  loop();
  show('menu');
})();
