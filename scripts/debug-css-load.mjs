import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 375, height: 800 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();

const baseUrl = `file://${projectRoot}/dist`;
const postUrl = `${baseUrl}/blog/honda-plan-de-ahorro-motos-cuotas-octubre-2026/index.html`;

await page.goto(postUrl, { waitUntil: 'networkidle' });

// Wait a moment for styles to apply
await page.waitForTimeout(1000);

const info = await page.evaluate(() => {
  const img = document.querySelector('.moto-card__media img');
  if (!img) return null;
  
  // Get all matching CSS rules
  const matchingRules = [];
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules || []) {
        if (rule.type === CSSRule.MEDIA_RULE && rule.conditionText.includes('767')) {
          for (const innerRule of rule.cssRules) {
            if (innerRule.selectorText && innerRule.selectorText.includes('moto-card__media')) {
              matchingRules.push({
                selector: innerRule.selectorText,
                media: rule.conditionText,
                styles: innerRule.style.cssText.substring(0, 200)
              });
            }
          }
        }
      }
    } catch (e) {}
  }
  
  const computed = getComputedStyle(img);
  return {
    viewport: { w: window.innerWidth, h: window.innerHeight },
    matchingRules,
    computed: {
      width: computed.width,
      maxWidth: computed.maxWidth,
      height: computed.height
    },
    rect: {
      width: img.getBoundingClientRect().width
    }
  };
});

console.log('\n=== Debug CSS Loading ===');
console.log(`\nViewport: ${info.viewport.w}x${info.viewport.h}`);
console.log(`\nReglas CSS que coinciden con moto-card__media en media queries 767px:`);
if (info.matchingRules.length === 0) {
  console.log('  ❌ No se encontraron reglas');
} else {
  info.matchingRules.forEach(r => {
    console.log(`\n  Selector: ${r.selector}`);
    console.log(`  Media: ${r.media}`);
    console.log(`  Estilos: ${r.styles}`);
  });
}

console.log(`\nEstilos computados:`);
console.log(`  width: ${info.computed.width}`);
console.log(`  max-width: ${info.computed.maxWidth}`);
console.log(`  height: ${info.computed.height}`);
console.log(`  Renderizado: ${info.rect.width}px`);

await browser.close();
