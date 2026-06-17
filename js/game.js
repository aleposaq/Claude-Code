/*
 * PRISM — game controller. Screens, modes, input, progression and save data.
 */
(function () {
  'use strict';

  const SAVE_KEY = 'prism.save.v1';
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  // ---- per-world identity: accent, mechanic blurb, win celebration ----
  const WORLD_META = {
    1:  { accent: '#4aa8ff', mech: 'Mirrors & walls',     title: 'ALIGNED',    flavor: 'Clean lines.' },
    2:  { accent: '#41e0a3', mech: 'Colour gels',         title: 'TINTED',     flavor: 'Colour, kept.' },
    3:  { accent: '#b97bff', mech: 'Beam splitters',      title: 'SHATTERED',  flavor: 'One beam, many.' },
    4:  { accent: '#c66bff', mech: 'Colour mixing',       title: 'TRANSMUTED', flavor: 'New colour forged.' },
    5:  { accent: '#ffd35a', mech: 'Prisms & bleach',     title: 'DISPERSED',  flavor: 'The full spectrum.' },
    6:  { accent: '#38e6e6', mech: 'Coloured gates',      title: 'UNLOCKED',   flavor: 'The door opens.' },
    7:  { accent: '#7c8bff', mech: 'Portals',             title: 'WARPED',     flavor: 'Across the gap.' },
    8:  { accent: '#ff7a5a', mech: 'Black holes',         title: 'SURVIVED',   flavor: 'Not a photon lost.' },
    9:  { accent: '#ff5ab0', mech: 'Rotators & tinters',  title: 'RECHROMED',  flavor: 'Colour, rewritten.' },
    10: { accent: '#6af0ff', mech: 'Everything',          title: 'CONVERGED',  flavor: 'Everything, at once.' },
  };
  const meta = w => WORLD_META[w] || WORLD_META[1];

  // worlds, in order, with their level indices
  const WORLDS = [];
  (function () {
    const byWorld = {};
    LEVELS.forEach((l, i) => { (byWorld[l.world] = byWorld[l.world] || []).push(i); });
    Object.keys(byWorld).map(Number).sort((a, b) => a - b).forEach(w => {
      WORLDS.push({ num: w, name: LEVELS[byWorld[w][0]].worldName, idxs: byWorld[w], ...meta(w) });
    });
  })();
  const MAX_STARS = LEVELS.length * 3;

  // ---- save data ----
  function loadSave() { try { return JSON.parse(localStorage.getItem(SAVE_KEY)) || {}; } catch (e) { return {}; } }
  function persist() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) {} }
  let save = loadSave();
  if (save.muted) Sound.toggle(true);

  function vibe(p) { try { if (navigator.vibrate && !save.noHaptics) navigator.vibrate(p); } catch (e) {} }

  function stars(id) { return (save.levels && save.levels[id] && save.levels[id].stars) || 0; }
  function isUnlocked(idx) { return idx === 0 ? true : stars(LEVELS[idx - 1].id) > 0; }
  function totalStars() { return LEVELS.reduce((s, l) => s + stars(l.id), 0); }
  function worldStars(w) { return w.idxs.reduce((s, i) => s + stars(LEVELS[i].id), 0); }
  function worldDone(w) { return w.idxs.every(i => stars(LEVELS[i].id) > 0); }
  function worldUnlocked(w) { return isUnlocked(w.idxs[0]); }

  function recordWin(level, taps) {
    save.levels = save.levels || {};
    let s = 1;
    if (taps <= level.par) s = 3;
    else if (taps <= Math.ceil(level.par * 1.6)) s = 2;
    const prev = stars(level.id);
    const prevBest = prev ? save.levels[level.id].bestTaps : 9999;
    save.levels[level.id] = { stars: Math.max(prev, s), bestTaps: Math.min(prevBest, taps) };
    persist();
    return s;
  }

  // ---- daily challenge (deterministic by date) ----
  function dayKey(d) { d = d || new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function dailyIndex() {
    let h = 2166136261; const s = dayKey();
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return Math.abs(h) % LEVELS.length;
  }
  function dailyDoneToday() { return save.daily && save.daily.last === dayKey(); }
  function recordDaily() {
    const tk = dayKey();
    save.daily = save.daily || {};
    if (save.daily.last === tk) return save.daily.streak || 1;
    const y = new Date(); y.setDate(y.getDate() - 1);
    save.daily.streak = save.daily.last === dayKey(y) ? (save.daily.streak || 0) + 1 : 1;
    save.daily.last = tk; save.daily.count = (save.daily.count || 0) + 1;
    persist();
    return save.daily.streak;
  }

  // ---- game state ----
  const renderer = new Renderer($('#board'));
  renderer.reduceMotion = !!save.reduceMotion;
  let level = null, placed = [], sim = null, taps = 0, levelIndex = 0;
  let animating = false, mode = 'campaign', history = [];

  function recompute() { sim = Engine.simulate(level, placed); updateHud(); }

  function updateHud() {
    $('#mirror-count').textContent = (level.budget - placed.length) + ' / ' + level.budget;
    $('#target-count').textContent = sim.targetStatus.filter(t => t.lit).length + ' / ' + level.targets.length;
    $('#tap-count').textContent = taps;
    $('#par-count').textContent = level.par;
    $('#btn-undo').disabled = history.length === 0;
    $('#btn-undo').style.opacity = history.length ? '' : '.4';
  }

  function applyAccent(el, w) { el.style.setProperty('--accent', meta(w).accent); }

  function startLevel(idx, opts) {
    opts = opts || {};
    mode = opts.daily ? 'daily' : 'campaign';
    levelIndex = idx; level = LEVELS[idx];
    placed = []; taps = 0; history = []; renderer.particles = [];
    renderer.accent = meta(level.world).accent;
    $('#level-name').textContent = level.name;
    $('#world-tag').textContent = opts.daily ? 'DAILY CHALLENGE' : 'World ' + level.world + ' · ' + level.worldName;
    applyAccent($('#screen-game'), level.world);
    document.documentElement.style.setProperty('--accent', meta(level.world).accent);
    show('game');
    requestAnimationFrame(() => { renderer.layout(level); recompute(); });
  }

  function pushHistory() { history.push({ placed: placed.map(m => ({ x: m.x, y: m.y, orient: m.orient })), taps }); if (history.length > 200) history.shift(); }
  function undo() {
    if (animating || !history.length) return;
    const s = history.pop(); placed = s.placed; taps = s.taps; Sound.back(); vibe(6); recompute();
  }
  function resetLevel() { if (animating) return; Sound.back(); pushHistory(); placed = []; taps = 0; renderer.particles = []; recompute(); }

  // Tap a cell: cycle empty -> "/" -> "\\" -> empty (respecting the budget).
  function tapCell(gx, gy) {
    if (animating) return;
    if (gx < 0 || gy < 0 || gx >= level.w || gy >= level.h) return;
    if (Engine.buildMap(level, [])[gx + ',' + gy]) return; // can't place on a fixed object
    const existing = placed.find(m => m.x === gx && m.y === gy);
    if (!existing) {
      if (placed.length >= level.budget) { flashBudget(); vibe(30); return; }
      pushHistory(); placed.push({ x: gx, y: gy, orient: '/' }); taps++; Sound.place(); vibe(8);
    } else if (existing.orient === '/') {
      pushHistory(); existing.orient = '\\'; taps++; Sound.rotate(); vibe(6);
    } else {
      pushHistory(); placed = placed.filter(m => m !== existing); taps++; Sound.remove(); vibe(10);
    }
    recompute();
    if (sim.win) onWin();
  }

  function flashBudget() {
    const el = $('#mirror-pill'); el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash'); Sound.deny();
  }

  function onWin() {
    animating = true;
    Sound.win(); vibe([0, 35, 30, 70]);
    const big = level.targets.length >= 3;
    sim.targetStatus.forEach((t, i) => setTimeout(() => renderer.burst(t.x, t.y, t.mask, big), i * 80));
    const earned = recordWin(level, taps);
    let dailyStreak = 0; if (mode === 'daily') dailyStreak = recordDaily();
    setTimeout(() => {
      for (let i = 0; i < earned; i++) setTimeout(() => { Sound.star(); vibe(18); }, 220 + i * 200);
      showWinModal(earned, dailyStreak);
      animating = false;
    }, 600);
  }

  function showWinModal(earned, dailyStreak) {
    const m = meta(level.world);
    applyAccent($('#win-card'), level.world);
    $('#win-taps').textContent = taps; $('#win-par').textContent = level.par;
    const last = levelIndex >= LEVELS.length - 1;
    if (mode === 'daily') {
      $('#win-title').textContent = 'DAILY DONE';
      $('#win-flavor').textContent = dailyStreak > 1 ? dailyStreak + ' day streak 🔥' : 'Come back tomorrow.';
      $('#btn-next').style.display = 'none';
    } else {
      $('#win-title').textContent = last ? 'ALL CLEAR' : m.title;
      $('#win-flavor').textContent = last ? 'You have mastered the light.' : m.flavor;
      $('#btn-next').style.display = last ? 'none' : '';
    }
    const starEls = $$('#win-stars .star');
    starEls.forEach((s, i) => { s.classList.remove('on'); if (i < earned) setTimeout(() => s.classList.add('on'), 260 + i * 220); });
    const perfect = $('#win-perfect'); perfect.classList.remove('show');
    if (earned >= 3) setTimeout(() => { perfect.classList.add('show'); vibe([0, 20, 20, 20, 20, 40]); }, 260 + 3 * 220);
    show('win', true);
  }

  // proceed from a win — celebrate a finished world before the next one
  function proceed() {
    Sound.click(); hideOverlay('#modal-win');
    if (mode === 'daily') { show('menu'); return; }
    const next = levelIndex + 1;
    if (next >= LEVELS.length) { show('menu'); return; }
    const finishedWorld = LEVELS[next].world !== level.world && worldDone(WORLDS.find(w => w.num === level.world));
    if (finishedWorld) { showWorldComplete(level.world, next); return; }
    startLevel(next);
  }

  let pendingNextIdx = 0;
  function showWorldComplete(w, nextIdx) {
    pendingNextIdx = nextIdx;
    const wm = WORLDS.find(x => x.num === w), m = meta(w);
    applyAccent($('#world-card'), w);
    $('#world-done-name').textContent = wm.name.toUpperCase();
    $('#world-done-flavor').textContent = m.flavor;
    $('#world-done-stars').textContent = '★ ' + worldStars(wm) + ' / ' + (wm.idxs.length * 3);
    Sound.fanfare(); vibe([0, 40, 40, 80]);
    show('world', true);
  }

  // ---- hint: briefly reveal the intended solution ----
  function showHint() {
    if (animating || !level.solution || !level.solution.length) return;
    Sound.click();
    const before = placed;
    placed = level.solution.map(m => ({ x: m.x, y: m.y, orient: m.orient }));
    recompute(); animating = true; $('#board').classList.add('hinting');
    setTimeout(() => { $('#board').classList.remove('hinting'); placed = before; animating = false; recompute(); }, 1400);
  }

  // ---- screens & modals ----
  function show(name, overlay) {
    if (!overlay) $$('.screen').forEach(s => s.classList.remove('active'));
    if (name === 'menu') { $('#screen-menu').classList.add('active'); buildMenu(); }
    else if (name === 'worlds') { $('#screen-worlds').classList.add('active'); buildWorlds(); }
    else if (name === 'levels') { $('#screen-levels').classList.add('active'); }
    else if (name === 'game') { $('#screen-game').classList.add('active'); hideOverlay('#modal-win'); hideOverlay('#modal-world'); }
    else if (name === 'win') { $('#modal-win').classList.add('show'); }
    else if (name === 'world') { $('#modal-world').classList.add('show'); }
  }
  function hideOverlay(sel) { $(sel).classList.remove('show'); }

  function buildMenu() {
    $('#total-stars').textContent = totalStars() + ' / ' + MAX_STARS;
    let idx = LEVELS.findIndex((l, i) => isUnlocked(i) && stars(l.id) === 0);
    if (idx < 0) idx = 0;
    $('#btn-continue').dataset.idx = idx;
    $('#btn-continue').textContent = (totalStars() > 0 ? 'CONTINUE · ' : 'PLAY · ') + LEVELS[idx].name;
    const d = $('#btn-daily');
    if (dailyDoneToday()) d.textContent = '★ DAILY · DONE ✓' + (save.daily.streak > 1 ? ' · ' + save.daily.streak + '🔥' : '');
    else d.textContent = '★ DAILY CHALLENGE' + (save.daily && save.daily.streak > 1 ? ' · ' + save.daily.streak + '🔥' : '');
  }

  function buildWorlds() {
    $('#worlds-stars').textContent = totalStars() + ' / ' + MAX_STARS;
    const wrap = $('#world-list'); wrap.innerHTML = '';
    WORLDS.forEach(w => {
      const unlocked = worldUnlocked(w), done = worldDone(w), got = worldStars(w), max = w.idxs.length * 3;
      const card = document.createElement('button');
      card.className = 'world-card' + (unlocked ? '' : ' locked') + (done ? ' done' : '');
      card.style.setProperty('--wc', w.accent);
      card.innerHTML =
        `<div class="wc-num">WORLD ${w.num}</div>` +
        `<div class="wc-name">${w.name}</div>` +
        `<div class="wc-mech">${w.mech} · ${w.idxs.length} levels</div>` +
        (unlocked ? `<div class="wc-stars">★ ${got}/${max}</div>` : `<div class="wc-stars">🔒</div>`) +
        (done ? `<div class="wc-check">✓</div>` : '') +
        `<div class="wc-bar"><div class="wc-fill" style="width:${Math.round(got / max * 100)}%"></div></div>`;
      if (unlocked) card.addEventListener('click', () => { Sound.click(); openWorld(w); });
      wrap.appendChild(card);
    });
  }

  let currentWorld = null;
  function openWorld(w) {
    currentWorld = w;
    $('#levels-title').textContent = w.name.toUpperCase();
    applyAccent($('#screen-levels'), w.num);
    document.documentElement.style.setProperty('--accent', w.accent);
    $('#levels-stars').textContent = worldStars(w) + ' / ' + (w.idxs.length * 3);
    $('#levels-sub').textContent = 'World ' + w.num + ' · ' + w.mech;
    const wrap = $('#level-grid'); wrap.innerHTML = '';
    w.idxs.forEach((gi, n) => {
      const l = LEVELS[gi], unlocked = isUnlocked(gi), st = stars(l.id);
      const btn = document.createElement('button');
      btn.className = 'level-btn' + (unlocked ? '' : ' locked') + (st ? ' done' : '');
      btn.innerHTML = unlocked
        ? `<span class="num">${n + 1}</span><span class="lvstars">${'★'.repeat(st)}${'☆'.repeat(3 - st)}</span>`
        : `<span class="lock">🔒</span>`;
      if (unlocked) btn.addEventListener('click', () => { Sound.click(); startLevel(gi); });
      wrap.appendChild(btn);
    });
    show('levels');
  }

  // ---- settings ----
  function syncToggles() {
    $('#set-sound').setAttribute('aria-pressed', String(!Sound.muted));
    $('#set-haptics').setAttribute('aria-pressed', String(!save.noHaptics));
    $('#set-motion').setAttribute('aria-pressed', String(!!save.reduceMotion));
    $('#btn-mute').textContent = Sound.muted ? '🔇' : '🔊';
    document.body.classList.toggle('reduced-motion', !!save.reduceMotion);
    renderer.reduceMotion = !!save.reduceMotion;
  }

  // ---- input ----
  const board = $('#board');
  function pointer(e) {
    const r = board.getBoundingClientRect();
    const px = (e.changedTouches ? e.changedTouches[0].clientX : e.clientX) - r.left;
    const py = (e.changedTouches ? e.changedTouches[0].clientY : e.clientY) - r.top;
    return renderer.cellAt(px, py);
  }
  board.addEventListener('click', e => { const c = pointer(e); tapCell(c.x, c.y); });

  // ---- buttons ----
  $('#btn-continue').addEventListener('click', e => { Sound.click(); startLevel(+e.currentTarget.dataset.idx); });
  $('#btn-worlds').addEventListener('click', () => { Sound.click(); show('worlds'); });
  $('#btn-daily').addEventListener('click', () => { Sound.daily(); startLevel(dailyIndex(), { daily: true }); });
  $('#btn-help').addEventListener('click', () => { Sound.click(); $('#modal-help').classList.add('show'); });
  $('#btn-help-close').addEventListener('click', () => { Sound.click(); hideOverlay('#modal-help'); });
  $('#btn-settings').addEventListener('click', () => { Sound.click(); syncToggles(); $('#modal-settings').classList.add('show'); });
  $('#btn-settings-close').addEventListener('click', () => { Sound.click(); hideOverlay('#modal-settings'); });
  $('#btn-worlds-back').addEventListener('click', () => { Sound.back(); show('menu'); });
  $('#btn-levels-back').addEventListener('click', () => { Sound.back(); show('worlds'); });
  $('#btn-quit').addEventListener('click', () => { Sound.back(); mode === 'daily' ? show('menu') : (currentWorld ? show('levels') : show('worlds')); });
  $('#btn-undo').addEventListener('click', undo);
  $('#btn-reset').addEventListener('click', resetLevel);
  $('#btn-hint').addEventListener('click', showHint);
  $('#btn-next').addEventListener('click', proceed);
  $('#btn-replay').addEventListener('click', () => { Sound.click(); hideOverlay('#modal-win'); startLevel(levelIndex, { daily: mode === 'daily' }); });
  $('#btn-win-levels').addEventListener('click', () => { Sound.click(); hideOverlay('#modal-win'); mode === 'daily' ? show('menu') : openWorld(WORLDS.find(w => w.num === level.world)); });
  $('#btn-world-menu').addEventListener('click', () => { Sound.click(); hideOverlay('#modal-world'); show('worlds'); });
  $('#btn-world-next').addEventListener('click', () => { Sound.click(); hideOverlay('#modal-world'); startLevel(pendingNextIdx); });

  $('#btn-mute').addEventListener('click', () => { const m = !Sound.muted; Sound.toggle(m); save.muted = m; persist(); syncToggles(); });
  $('#set-sound').addEventListener('click', () => { const on = Sound.muted; Sound.toggle(!on); save.muted = !on; persist(); if (on) Sound.click(); syncToggles(); });
  $('#set-haptics').addEventListener('click', () => { save.noHaptics = !save.noHaptics; persist(); if (!save.noHaptics) vibe(20); syncToggles(); });
  $('#set-motion').addEventListener('click', () => { save.reduceMotion = !save.reduceMotion; persist(); Sound.click(); syncToggles(); });
  $('#btn-reset-progress').addEventListener('click', () => {
    if (confirm('Reset all progress, stars and streaks?')) { save = {}; persist(); Sound.back(); syncToggles(); buildMenu(); hideOverlay('#modal-settings'); show('menu'); }
  });

  window.addEventListener('resize', () => { if (level && $('#screen-game').classList.contains('active')) renderer.layout(level); });

  // ---- render loop ----
  function loop() {
    if (level && $('#screen-game').classList.contains('active')) renderer.draw(level, placed, sim);
    requestAnimationFrame(loop);
  }
  loop();

  // boot
  syncToggles();
  show('menu');
})();
