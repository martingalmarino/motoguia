import { chromium } from 'playwright';

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 375, height: 800 },
});
const page = await context.newPage();

await page.goto('http://localhost:8080/blog/honda-plan-de-ahorro-motos-cuotas-octubre-2026/index.html', { waitUntil: 'networkidle' });
await page.waitForTimeout(500);

const styles = await page.evaluate(() => {
  const h1 = document.querySelector('.article h1');
  if (!h1) return null;
  
  const computed = getComputedStyle(h1);
  return {
    textWrap: computed.textWrap,
    whiteSpace: computed.whiteSpace,
    wordBreak: computed.wordBreak,
    overflowWrap: computed.overflowWrap,
    display: computed.display,
    boxSizing: computed.boxSizing,
    fontSize: computed.fontSize,
    lineHeight: computed.lineHeight
  };
});

console.log('\n=== Estilos del H1 ===\n');
Object.entries(styles).forEach(([key, value]) => {
  console.log(`${key}: ${value}`);
});

await browser.close();
