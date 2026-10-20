import { chromium } from 'playwright';

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 375, height: 800 },
});
const page = await context.newPage();

await page.goto('http://localhost:8080/blog/honda-plan-de-ahorro-motos-cuotas-octubre-2026/index.html', { waitUntil: 'networkidle' });
await page.waitForTimeout(500);

const widest = await page.evaluate(() => {
  const results = [];
  const viewportWidth = window.innerWidth;
  
  document.querySelectorAll('*').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.width > viewportWidth + 5) {
      results.push({
        tag: el.tagName,
        class: el.className.split(' ')[0] || '',
        width: Math.round(rect.width),
        text: el.textContent ? el.textContent.substring(0, 40) : ''
      });
    }
  });
  
  return results.sort((a, b) => b.width - a.width).slice(0, 8);
});

console.log('\n=== Elementos más anchos que 375px ===\n');
widest.forEach(el => {
  console.log(`${el.tag}.${el.class} - ${el.width}px`);
  if (el.text.trim()) console.log(`  "${el.text.trim()}..."`);
});

await browser.close();
