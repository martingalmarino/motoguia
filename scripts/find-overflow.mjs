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

const widestElements = await page.evaluate(() => {
  const viewportWidth = window.innerWidth;
  const results = [];
  
  document.querySelectorAll('*').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.width > viewportWidth || el.scrollWidth > viewportWidth) {
      results.push({
        tag: el.tagName,
        class: el.className,
        scrollWidth: el.scrollWidth,
        rectWidth: Math.round(rect.width),
        text: el.textContent ? el.textContent.substring(0, 40) : ''
      });
    }
  });
  
  return results.sort((a, b) => b.scrollWidth - a.scrollWidth).slice(0, 10);
});

console.log('Elementos más anchos que el viewport (375px):\n');
widestElements.forEach((el, i) => {
  console.log(`${i+1}. <${el.tag}${el.class ? ' class="'+el.class.split(' ')[0]+'..."' : ''}>`);
  console.log(`   scrollWidth: ${el.scrollWidth}px, rectWidth: ${el.rectWidth}px`);
  if (el.text.trim()) console.log(`   "${el.text.trim()}..."`);
  console.log('');
});

await browser.close();
