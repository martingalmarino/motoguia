import { chromium } from 'playwright';

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 375, height: 800 },
});
const page = await context.newPage();

await page.goto('http://localhost:8080/blog/honda-plan-de-ahorro-motos-cuotas-octubre-2026/index.html', { waitUntil: 'networkidle' });
await page.waitForTimeout(500);

const info = await page.evaluate(() => {
  const h1 = document.querySelector('.article-header h1');
  const computed = getComputedStyle(h1);
  const rect = h1.getBoundingClientRect();
  
  return {
    textWrap: computed.textWrap,
    maxWidth: computed.maxWidth,
    width: computed.width,
    rectWidth: Math.round(rect.width),
    docScrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth
  };
});

console.log('\n=== Verificación text-wrap fix ===');
console.log(`\nH1:`);
console.log(`  text-wrap: ${info.textWrap}`);
console.log(`  max-width: ${info.maxWidth}`);
console.log(`  width: ${info.width}`);
console.log(`  rectWidth: ${info.rectWidth}px`);
console.log(`\nDocument:`);
console.log(`  scrollWidth: ${info.docScrollWidth}px`);
console.log(`  innerWidth: ${info.innerWidth}px`);
console.log(`  Overflow: ${info.docScrollWidth > info.innerWidth ? '❌' : '✅'}`);

await browser.close();
