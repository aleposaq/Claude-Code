/*
 * PRISM — tiny synthesized sound engine (Web Audio, no asset files).
 * All effects are generated procedurally so the game stays self-contained.
 */
(function () {
  'use strict';
  let ctx = null, muted = false;

  function ac() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctx = new AC();
    }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // A single enveloped oscillator blip.
  function blip(freq, dur, type, vol, when) {
    const c = ac(); if (!c || muted) return;
    const t = when || c.currentTime;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.2, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t + dur + 0.02);
  }

  function chord(freqs, dur, type, vol) {
    const c = ac(); if (!c) return;
    freqs.forEach((f, i) => blip(f, dur, type, vol, c.currentTime + i * 0.06));
  }

  const Sound = {
    place: () => blip(420, 0.08, 'triangle', 0.18),
    rotate: () => blip(560, 0.06, 'square', 0.12),
    remove: () => blip(240, 0.08, 'sine', 0.14),
    hit:   () => blip(880, 0.12, 'triangle', 0.16),
    win:   () => chord([523, 659, 784, 1047], 0.35, 'triangle', 0.22),
    star:  () => blip(1175, 0.18, 'triangle', 0.2),
    click: () => blip(330, 0.05, 'sine', 0.12),
    back:  () => blip(220, 0.06, 'sine', 0.1),
    toggle(m) { muted = m; },
    get muted() { return muted; }
  };
  window.Sound = Sound;
})();
