/* Headless screenshot harness for visual validation (Playwright + Chromium).
 * usage: node tools/shot.js <url> <outPng> [steps]
 *   steps: comma list e.g. "click:#btn-play2,wait:700,tap:120:300,click:#btn-fire,wait:900"
 *   tap:X:Y taps page coords (for canvas). Mobile viewport by default. */
const { chromium } = require('playwright');
(async () => {
  const [url, out, steps = ''] = process.argv.slice(2);
  const W = +(process.env.VW || 390), H = +(process.env.VH || 844);
  const b = await chromium.launch({ headless: true });
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  p.on('console', m => console.log('PAGE:', m.text()));
  p.on('pageerror', e => console.log('PAGEERR:', e.message));
  await p.goto(url, { waitUntil: 'networkidle' });
  await p.waitForTimeout(500);
  for (const s of steps.split(',').filter(Boolean)) {
    const [k, a, c] = s.split(':');
    if (k === 'click') await p.click(a).catch(e => console.log('click fail', a, e.message));
    else if (k === 'tap') await p.mouse.click(+a, +c);
    else if (k === 'wait') await p.waitForTimeout(+a);
  }
  await p.screenshot({ path: out });
  await b.close();
  console.log('wrote', out);
})();
