/*
 * PRISM — independent validator. Re-checks the emitted js/levels.js with the
 * engine: every level must (a) win with its stored solution and (b) NOT win
 * with no mirrors. Exits non-zero on any failure.
 */
const Engine = require('../js/engine.js');
const LEVELS = require('../js/levels.js');

let fail = 0;
LEVELS.forEach(l => {
  const solved = Engine.simulate(l, l.solution);
  const trivial = Engine.simulate(l, []);
  const errs = [];
  if (!solved.win) errs.push('solution does NOT win');
  if (trivial.win) errs.push('trivial (wins with 0 mirrors)');
  if (l.budget !== l.solution.length) errs.push('budget != solution length');
  if (errs.length) { fail++; console.log(`FAIL #${l.id} ${l.name}: ${errs.join('; ')}`); }
});

if (fail) { console.error(`\n${fail} level(s) failed validation.`); process.exit(1); }
console.log(`All ${LEVELS.length} levels valid.`);
