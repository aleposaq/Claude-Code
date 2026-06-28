/* Full visual validation pass for PRISM v2. Captures menu + a sampling of levels
 * across worlds (build mode) plus a fired/win state, at mobile viewport. */
const { chromium } = require('playwright');
const SHOTS = process.argv[2];
const URL = 'http://localhost:8099/prism2.html';
(async () => {
  const b = await chromium.launch({ headless: true });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  p.on('pageerror', e => console.log('PAGEERR:', e.message));
  await p.goto(URL, { waitUntil: 'networkidle' });
  await p.evaluate(() => window.__dev.unlock());
  await p.evaluate(() => location.reload());
  await p.waitForTimeout(700);
  await p.screenshot({ path: SHOTS + '/v-menu.png' });
  // scroll menu to reveal later worlds
  await p.evaluate(() => document.querySelector('#screen-menu2').scrollBy(0, 560));
  await p.waitForTimeout(300); await p.screenshot({ path: SHOTS + '/v-menu2.png' });

  async function level(idx, name, placed) {
    await p.evaluate(i => window.__dev.start(i), idx);
    await p.waitForTimeout(500);
    await p.screenshot({ path: SHOTS + '/v-' + name + '-build.png' });
    if (placed) {
      await p.evaluate(a => window.__dev.set(a), placed);
      await p.waitForTimeout(200);
      await p.evaluate(() => window.__dev.fire());
      await p.waitForTimeout(1100);
      await p.screenshot({ path: SHOTS + '/v-' + name + '-fire.png' });
    }
  }
  // W1 Assembly (idx 9): multi-tool tray; fire the prism solution
  await level(9, 'assembly', [{ type: 'prism', x: 1, y: 2, orient: '/' }]);
  // W3 Power the Door (idx 20): switch/door build
  await level(20, 'door', null);
  // W5 Void Run (idx 41): voids
  await level(41, 'void', null);
  await b.close();
  console.log('done');
})();
