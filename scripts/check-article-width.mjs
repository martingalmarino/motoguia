import { chromium } from 'playwright';

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 375, height: 800 },
});
const page = await context.newPage();

await page.goto('http://localhost:8080/blog/honda-plan-de-ahorro-motos-cuotas-octubre-2026/index.html', { waitUntil: 'networkidle' });
await page.waitForTimeout(500);

const widths = await page.evaluate(() => {
  const getInfo = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const computed = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return {
      selector: sel,
      width: computed.width,
      maxWidth: computed.maxWidth,
      padding: `${computed.paddingLeft} / ${computed.paddingRight}`,
      margin: `${computed.marginLeft} / ${computed.marginRight}`,
      rectWidth: Math.round(rect.width)
    };
  };
  
  return {
    body: getInfo('body'),
    main: getInfo('main'),
    wrap: getInfo('.wrap'),
    article: getInfo('.article'),
    articleHeader: getInfo('.article-header'),
    h1: getInfo('.article h1')
  };
});

console.log('\n=== Anchos de contenedores ===\n');
Object.entries(widths).forEach(([key, info]) => {
  if (info) {
    console.log(`${key}:`);
    console.log(`  width: ${info.width}, max-width: ${info.maxWidth}`);
    console.log(`  padding L/R: ${info.padding}`);
    console.log(`  margin L/R: ${info.margin}`);
    console.log(`  rectWidth: ${info.rectWidth}px`);
    console.log('');
  }
});

await browser.close();
