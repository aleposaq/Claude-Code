/*
 * PRISM — game controller. Screens, input handling, progression and save data.
 */
(function () {
  'use strict';

  const SAVE_KEY = 'prism.save.v1';
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  // ---- save data ----
  function loadSave() {
    try { return JSON.parse(localStorage.getItem(SAVE_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function persist() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) {} }
  let save = loadSave();
  if (save.muted) Sound.toggle(true);

  function stars(id) { return (save.levels && save.levels[id] && save.levels[id].stars) || 0; }
  function isUnlocked(idx) {
    if (idx === 0) return true;
    return stars(LEVELS[idx - 1].id) > 0; // beat previous level
  }
  function recordWin(level, taps) {
    save.levels = save.levels || {};
    let s = 1;
    if (taps <= level.par) s = 3;
    else if (taps <= Math.ceil(level.par * 1.6)) s = 2;
    const prev = stars(level.id);
    save.levels[level.id] = { stars: Math.max(prev, s), bestTaps: Math.min(prev ? save.levels[level.id].bestTaps : 9999, taps) };
    persist();
    return s;
  }

  // ---- game state ----
  const renderer = new Renderer($('#board'));
  let level = null, placed = [], sim = null, taps = 0, levelIndex = 0;
  let animating = false;

  function placedList() { return placed; }

  function recompute() {
    sim = Engine.simulate(level, placed);
    updateHud();
  }

  function updateHud() {
    const used = placed.length;
    $('#mirror-count').textContent = (level.budget - used) + ' / ' + level.budget;
    const total = level.targets.length;
    const litCount = sim.targetStatus.filter(t => t.lit).length;
    $('#target-count').textContent = litCount + ' / ' + total;
    $('#tap-count').textContent = taps;
    $('#par-count').textContent = level.par;
  }

  function startLevel(idx) {
    levelIndex = idx;
    level = LEVELS[idx];
    placed = [];
    taps = 0;
    renderer.particles = [];
    $('#level-name').textContent = level.name;
    $('#world-tag').textContent = 'World ' + level.world + ' · ' + level.worldName;
    $('#level-note').textContent = level.note || '';
    show('game');
    requestAnimationFrame(() => { renderer.layout(level); recompute(); });
  }

  function resetLevel() { Sound.back(); placed = []; taps = 0; renderer.particles = []; recompute(); }

  // Tap a cell: cycle empty -> "/" -> "\\" -> empty (respecting the budget).
  function tapCell(gx, gy) {
    if (animating) return;
    if (gx < 0 || gy < 0 || gx >= level.w || gy >= level.h) return;
    const occupied = Engine.buildMap(level, []); // fixed objects only
    if (occupied[gx + ',' + gy]) return; // can't place on fixed object
    const existing = placed.find(m => m.x === gx && m.y === gy);
    if (!existing) {
      if (placed.length >= level.budget) { flashBudget(); return; }
      placed.push({ x: gx, y: gy, orient: '/' });
      taps++; Sound.place();
    } else if (existing.orient === '/') {
      existing.orient = '\\'; taps++; Sound.rotate();
    } else {
      placed = placed.filter(m => m !== existing); taps++; Sound.remove();
    }
    recompute();
    if (sim.win) onWin();
  }

  function flashBudget() {
    const el = $('#mirror-pill');
    el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
    Sound.back();
  }

  function onWin() {
    animating = true;
    Sound.win();
    sim.targetStatus.forEach(t => renderer.burst(t.x, t.y, t.mask));
    const earned = recordWin(level, taps);
    setTimeout(() => {
      // stars chime
      for (let i = 0; i < earned; i++) setTimeout(() => Sound.star(), 200 + i * 180);
      showWinModal(earned);
      animating = false;
    }, 600);
  }

  function showWinModal(earned) {
    $('#win-taps').textContent = taps;
    $('#win-par').textContent = level.par;
    const starEls = $$('#win-stars .star');
    starEls.forEach((s, i) => {
      s.classList.remove('on');
      if (i < earned) setTimeout(() => s.classList.add('on'), 250 + i * 200);
    });
    const last = levelIndex >= LEVELS.length - 1;
    $('#btn-next').style.display = last ? 'none' : '';
    $('#win-title').textContent = last ? 'ALL CLEAR!' : 'SOLVED';
    show('win', true);
  }

  // ---- hint: briefly reveal the intended solution ----
  function showHint() {
    if (animating) return;
    Sound.click();
    const before = placed;
    placed = level.solution.map(m => ({ x: m.x, y: m.y, orient: m.orient }));
    recompute();
    animating = true;
    $('#board').classList.add('hinting');
    setTimeout(() => {
      $('#board').classList.remove('hinting');
      placed = before; animating = false; recompute();
    }, 1400);
  }

  // ---- screens ----
  function show(name, overlay) {
    if (!overlay) $$('.screen').forEach(s => s.classList.remove('active'));
    if (name === 'menu') { $('#screen-menu').classList.add('active'); buildContinue(); }
    else if (name === 'levels') { $('#screen-levels').classList.add('active'); buildLevelGrid(); }
    else if (name === 'game') { $('#screen-game').classList.add('active'); $('#modal-win').classList.remove('show'); }
    else if (name === 'win') { $('#modal-win').classList.add('show'); }
  }
  function hideOverlay() { $('#modal-win').classList.remove('show'); }

  function totalStars() { return LEVELS.reduce((s, l) => s + stars(l.id), 0); }

  function buildContinue() {
    $('#total-stars').textContent = totalStars() + ' / ' + (LEVELS.length * 3);
    // first unlocked-but-unbeaten, else first level
    let idx = LEVELS.findIndex((l, i) => isUnlocked(i) && stars(l.id) === 0);
    if (idx < 0) idx = 0;
    $('#btn-continue').dataset.idx = idx;
    $('#btn-continue').textContent = (totalStars() > 0 ? 'CONTINUE · ' : 'PLAY · ') + LEVELS[idx].name;
  }

  function buildLevelGrid() {
    $('#levels-stars').textContent = totalStars() + ' / ' + (LEVELS.length * 3);
    const wrap = $('#level-grid');
    wrap.innerHTML = '';
    let curWorld = 0;
    LEVELS.forEach((l, i) => {
      if (l.world !== curWorld) {
        curWorld = l.world;
        const head = document.createElement('div');
        head.className = 'world-head';
        head.innerHTML = `<span>WORLD ${l.world}</span><b>${l.worldName}</b>`;
        wrap.appendChild(head);
      }
      const unlocked = isUnlocked(i);
      const st = stars(l.id);
      const btn = document.createElement('button');
      btn.className = 'level-btn' + (unlocked ? '' : ' locked');
      btn.innerHTML = unlocked
        ? `<span class="num">${i + 1}</span><span class="lvstars">${'★'.repeat(st)}${'☆'.repeat(3 - st)}</span>`
        : `<span class="lock">🔒</span>`;
      if (unlocked) btn.addEventListener('click', () => { Sound.click(); startLevel(i); });
      wrap.appendChild(btn);
    });
  }

  // ---- input ----
  const board = $('#board');
  function pointer(e) {
    const r = board.getBoundingClientRect();
    const px = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
    const py = (e.touches ? e.touches[0].clientY : e.clientY) - r.top;
    return renderer.cellAt(px, py);
  }
  board.addEventListener('click', e => { const c = pointer(e); tapCell(c.x, c.y); });

  // buttons
  $('#btn-play').addEventListener('click', () => { Sound.click(); show('levels'); });
  $('#btn-help').addEventListener('click', () => { Sound.click(); $('#modal-help').classList.add('show'); });
  $('#btn-help-close').addEventListener('click', () => { Sound.click(); $('#modal-help').classList.remove('show'); });
  $('#btn-continue').addEventListener('click', e => { Sound.click(); startLevel(+e.currentTarget.dataset.idx); });
  $('#btn-levels-back').addEventListener('click', () => { Sound.back(); show('menu'); });
  $('#btn-quit').addEventListener('click', () => { Sound.back(); show('levels'); });
  $('#btn-reset').addEventListener('click', resetLevel);
  $('#btn-hint').addEventListener('click', showHint);
  $('#btn-next').addEventListener('click', () => { Sound.click(); hideOverlay(); startLevel(Math.min(levelIndex + 1, LEVELS.length - 1)); });
  $('#btn-replay').addEventListener('click', () => { Sound.click(); hideOverlay(); startLevel(levelIndex); });
  $('#btn-win-levels').addEventListener('click', () => { Sound.click(); hideOverlay(); show('levels'); });
  $('#btn-mute').addEventListener('click', () => {
    const m = !Sound.muted; Sound.toggle(m); save.muted = m; persist();
    $('#btn-mute').textContent = m ? '🔇' : '🔊';
  });
  $('#btn-mute').textContent = Sound.muted ? '🔇' : '🔊';

  $('#btn-reset-progress').addEventListener('click', () => {
    if (confirm('Reset all progress and stars?')) { save = {}; persist(); buildContinue(); Sound.back(); }
  });

  window.addEventListener('resize', () => { if (level && $('#screen-game').classList.contains('active')) { renderer.layout(level); } });

  // ---- render loop ----
  function loop() {
    if (level && $('#screen-game').classList.contains('active')) {
      renderer.draw(level, placed, sim, {});
    }
    requestAnimationFrame(loop);
  }
  loop();

  // boot
  show('menu');
})();
