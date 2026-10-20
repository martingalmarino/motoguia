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

const styles = await page.evaluate(() => {
  const img = document.querySelector('.moto-card__media img');
  if (!img) return null;
  
  const computed = getComputedStyle(img);
  return {
    width: computed.width,
    maxWidth: computed.maxWidth,
    height: computed.height,
    objectFit: computed.objectFit,
    naturalWidth: img.naturalWidth,
    naturalHeight: img.naturalHeight,
    displayWidth: img.getBoundingClientRect().width
  };
});

console.log('\nEstilos aplicados a .moto-card__media img:');
console.log(`  width: ${styles.width}`);
console.log(`  max-width: ${styles.maxWidth}`);
console.log(`  height: ${styles.height}`);
console.log(`  object-fit: ${styles.objectFit}`);
console.log(`  Tamaño natural: ${styles.naturalWidth}x${styles.naturalHeight}`);
console.log(`  Ancho renderizado: ${styles.displayWidth}px`);

await browser.close();
