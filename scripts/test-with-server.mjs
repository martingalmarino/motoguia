import { chromium } from 'playwright';

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 375, height: 800 },
});
const page = await context.newPage();

const postUrl = 'http://localhost:8080/blog/honda-plan-de-ahorro-motos-cuotas-octubre-2026/index.html';

await page.goto(postUrl, { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);

const result = await page.evaluate(() => {
  const img = document.querySelector('.moto-card__media img');
  if (!img) return null;
  
  const computed = getComputedStyle(img);
  return {
    docScrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    imgWidth: computed.width,
    imgMaxWidth: computed.maxWidth,
    imgDisplayWidth: img.getBoundingClientRect().width
  };
});

console.log('\n=== Test con servidor HTTP ===');
console.log(`Viewport: ${result.innerWidth}px`);
console.log(`Document scrollWidth: ${result.docScrollWidth}px`);
console.log(`Overflow: ${result.docScrollWidth > result.innerWidth ? '❌ SÍ' : '✅ NO'}`);
console.log(`\nImagen .moto-card__media img:`);
console.log(`  width: ${result.imgWidth}`);
console.log(`  max-width: ${result.imgMaxWidth}`);
console.log(`  Ancho renderizado: ${result.imgDisplayWidth}px`);

await browser.close();
