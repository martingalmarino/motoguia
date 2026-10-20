import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 375, height: 800 },
});
const page = await context.newPage();

const baseUrl = `file://${projectRoot}/dist`;
const postUrl = `${baseUrl}/blog/honda-plan-de-ahorro-motos-cuotas-octubre-2026/index.html`;

await page.goto(postUrl, { waitUntil: 'networkidle' });

const selectorCheck = await page.evaluate(() => {
  const imgs = document.querySelectorAll('.article-layout + .section .moto-card__media img');
  const allCardImgs = document.querySelectorAll('.moto-card__media img');
  
  return {
    matchedBySelector: imgs.length,
    totalCardImages: allCardImgs.length,
    firstImageWidth: allCardImgs[0] ? allCardImgs[0].getBoundingClientRect().width : 0,
    firstImageComputedMaxWidth: allCardImgs[0] ? getComputedStyle(allCardImgs[0]).maxWidth : 'none'
  };
});

console.log('\nSelector check:');
console.log(`  Matched by '.article-layout + .section ...': ${selectorCheck.matchedBySelector}`);
console.log(`  Total card images: ${selectorCheck.totalCardImages}`);
console.log(`  First image width: ${selectorCheck.firstImageWidth}px`);
console.log(`  First image max-width: ${selectorCheck.firstImageComputedMaxWidth}`);

await browser.close();
