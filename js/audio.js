/*
 * PRISM — synthesized sound engine (Web Audio, no asset files).
 * Everything is generated procedurally so the game stays fully self-contained.
 */
(function () {
  'use strict';
  let ctx = null, muted = false, master = null;

  function ac() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) { ctx = new AC(); master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination); }
    }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // One enveloped oscillator voice with optional pitch glide.
  function blip(freq, dur, type, vol, when, glideTo) {
    const c = ac(); if (!c || muted) return;
    const t = when || c.currentTime;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t);
    if (glideTo) o.frequency.exponentialRampToValueAtTime(glideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.2, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.02);
  }

  function seq(notes, type, vol, step) {
    const c = ac(); if (!c) return; step = step || 0.075;
    notes.forEach((f, i) => blip(f, step * 1.9, type || 'triangle', vol || 0.2, c.currentTime + i * step));
  }

  // soft filtered-noise tick for UI
  function noise(dur, vol, when) {
    const c = ac(); if (!c || muted) return; const t = when || c.currentTime;
    const n = Math.floor(c.sampleRate * dur), buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = c.createBufferSource(); src.buffer = buf; const g = c.createGain(); g.gain.value = vol || 0.05;
    const bp = c.createBiquadFilter(); bp.type = 'highpass'; bp.frequency.value = 1400;
    src.connect(bp); bp.connect(g); g.connect(master); src.start(t);
  }

  const Sound = {
    place:  () => blip(420, 0.09, 'triangle', 0.18, 0, 520),
    rotate: () => blip(560, 0.07, 'square', 0.11),
    remove: () => blip(300, 0.09, 'sine', 0.13, 0, 200),
    hit:    () => blip(880, 0.12, 'triangle', 0.16),
    lit:    () => seq([784, 1175], 'sine', 0.16, 0.05),
    deny:   () => blip(150, 0.14, 'sawtooth', 0.12, 0, 90),
    win:    () => seq([523, 659, 784, 1047, 1319], 'triangle', 0.2, 0.08),
    fanfare:() => { seq([523, 784, 1047], 'triangle', 0.18, 0.09); seq([659, 988, 1319], 'sine', 0.12, 0.09); },
    star:   () => blip(1175, 0.2, 'triangle', 0.2, 0, 1568),
    unlock: () => seq([392, 587, 784], 'triangle', 0.18, 0.08),
    click:  () => { blip(330, 0.05, 'sine', 0.1); noise(0.03, 0.04); },
    back:   () => blip(220, 0.06, 'sine', 0.09, 0, 170),
    daily:  () => seq([659, 784, 988, 1319], 'triangle', 0.18, 0.07),
    toggle(m) { muted = m; },
    get muted() { return muted; }
  };
  window.Sound = Sound;
})();
