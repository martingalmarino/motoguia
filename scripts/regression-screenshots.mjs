import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { join } from 'path';

const artifactsDir = '/opt/cursor/artifacts';
mkdirSync(artifactsDir, { recursive: true });

const baseUrl = 'http://localhost:8080';

const pages = [
  { name: 'honda-blog-post', url: '/blog/honda-plan-de-ahorro-motos-cuotas-octubre-2026/index.html' },
  { name: 'mercado-blog-post', url: '/blog/mercado-motos-septiembre-2026/index.html' },
  { name: 'home', url: '/index.html' },
  { name: 'ficha-wave-110s', url: '/motos/honda/honda-wave-110s/index.html' },
  { name: 'guia-primera-moto', url: '/guias/primera-moto-argentina/index.html' },
];

const viewports = [
  { name: 'mobile', width: 375, height: 800 },
  { name: 'desktop', width: 1280, height: 1024 },
];

const browser = await chromium.launch();

console.log('\n=== Tomando screenshots de regresión ===\n');

for (const page of pages) {
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 2,
    });
    const browserPage = await context.newPage();
    
    try {
      await browserPage.goto(baseUrl + page.url, { waitUntil: 'networkidle', timeout: 10000 });
      await browserPage.waitForTimeout(500);
      
      if (viewport.name === 'mobile') {
        const { scrollWidth, innerWidth } = await browserPage.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth
        }));
        const hasOverflow = scrollWidth > innerWidth;
        console.log(`${page.name} @ ${viewport.width}px: ${hasOverflow ? '❌ overflow' : '✅ sin overflow'} (${scrollWidth}px)`);
      }
      
      const filename = `${page.name}-${viewport.name}-${viewport.width}px.png`;
      await browserPage.screenshot({ 
        path: join(artifactsDir, filename),
        fullPage: true 
      });
      
      if (viewport.name === 'desktop') {
        console.log(`${page.name} @ ${viewport.width}px: ✅ screenshot tomado`);
      }
    } catch (error) {
      console.log(`${page.name} @ ${viewport.width}px: ❌ ERROR - ${error.message}`);
    }
    
    await context.close();
  }
}

await browser.close();
console.log(`\n✅ Screenshots guardados en ${artifactsDir}`);
