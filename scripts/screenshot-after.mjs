import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const artifactsDir = '/opt/cursor/artifacts';
mkdirSync(artifactsDir, { recursive: true });

const browser = await chromium.launch();

async function takeFullScreenshot(url, width, filename) {
  const context = await browser.newContext({
    viewport: { width, height: 800 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  
  await page.goto(url, { waitUntil: 'networkidle' });
  
  // Check for horizontal overflow
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const innerWidth = await page.evaluate(() => window.innerWidth);
  const hasOverflow = scrollWidth > innerWidth;
  
  console.log(`${width}px - ScrollWidth: ${scrollWidth}, InnerWidth: ${innerWidth}, Overflow: ${hasOverflow ? '❌' : '✅'}`);
  
  // Take full page screenshot
  await page.screenshot({ 
    path: join(artifactsDir, filename),
    fullPage: true 
  });
  
  await context.close();
  
  return { width, hasOverflow, scrollWidth, innerWidth };
}

console.log('\n=== Screenshots DESPUÉS de las correcciones ===\n');

const baseUrl = `file://${projectRoot}/dist`;
const postUrl = `${baseUrl}/blog/honda-plan-de-ahorro-motos-cuotas-octubre-2026/index.html`;

// Screenshots móviles del post de Honda DESPUÉS
const results = [];
results.push(await takeFullScreenshot(postUrl, 375, 'honda-mobile-375px-after.png'));
results.push(await takeFullScreenshot(postUrl, 414, 'honda-mobile-414px-after.png'));

console.log('\n=== Resumen ===');
results.forEach(r => {
  console.log(`${r.width}px: ${r.hasOverflow ? '❌ OVERFLOW DETECTADO' : '✅ Sin overflow'}`);
});

await browser.close();
console.log(`\nScreenshots guardados en ${artifactsDir}`);
