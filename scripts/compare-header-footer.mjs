import { chromium } from 'playwright';
import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';

const artifactsDir = '/opt/cursor/artifacts';
const browser = await chromium.launch();

async function captureHeaderFooter(url, label, pageName) {
  const results = {};
  
  for (const viewport of [{ name: 'mobile', width: 375 }, { name: 'desktop', width: 1280 }]) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: 1024 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    
    const headerClip = await page.evaluate(() => {
      const header = document.querySelector('.site-header');
      if (!header) return null;
      const rect = header.getBoundingClientRect();
      return {
        x: 0,
        y: Math.round(rect.top),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      };
    });
    
    if (headerClip) {
      const headerPath = join(artifactsDir, `${label}-${pageName}-header-${viewport.width}px.png`);
      await page.screenshot({ path: headerPath, clip: headerClip });
      const headerMd5 = createHash('md5').update(readFileSync(headerPath)).digest('hex');
      results[`header_${viewport.name}`] = { md5: headerMd5 };
    }
    
    const footerClip = await page.evaluate(() => {
      const footer = document.querySelector('.site-footer');
      if (!footer) return null;
      const rect = footer.getBoundingClientRect();
      return {
        x: 0,
        y: Math.round(rect.top),
        width: Math.round(rect.width),
        height: Math.min(Math.round(rect.height), 400)
      };
    });
    
    if (footerClip) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(300);
      
      const footerPath = join(artifactsDir, `${label}-${pageName}-footer-${viewport.width}px.png`);
      await page.screenshot({ path: footerPath, clip: footerClip });
      const footerMd5 = createHash('md5').update(readFileSync(footerPath)).digest('hex');
      results[`footer_${viewport.name}`] = { md5: footerMd5 };
    }
    
    await context.close();
  }
  
  return results;
}

console.log('\n=== Comparación Header/Footer ===\n');

console.log('📸 Capturando MAIN home...');
const mainHome = await captureHeaderFooter('http://localhost:8080/', 'main', 'home');

console.log('📸 Capturando BRANCH home...');
const branchHome = await captureHeaderFooter('http://localhost:8081/', 'branch', 'home');

console.log('📸 Capturando MAIN guía...');
const mainGuide = await captureHeaderFooter('http://localhost:8080/guias/primera-moto-argentina/', 'main', 'guide');

console.log('📸 Capturando BRANCH guía...');
const branchGuide = await captureHeaderFooter('http://localhost:8081/guias/primera-moto-argentina/', 'branch', 'guide');

console.log('\n=== Resultados ===\n');

console.log('HOME PAGE:');
console.log(`  Header 375px: ${mainHome.header_mobile.md5 === branchHome.header_mobile.md5 ? '✅ IDÉNTICO' : '❌ DIFERENTE'}`);
console.log(`  Header 1280px: ${mainHome.header_desktop.md5 === branchHome.header_desktop.md5 ? '✅ IDÉNTICO' : '❌ DIFERENTE'}`);
console.log(`  Footer 375px: ${mainHome.footer_mobile.md5 === branchHome.footer_mobile.md5 ? '✅ IDÉNTICO' : '❌ DIFERENTE'}`);
console.log(`  Footer 1280px: ${mainHome.footer_desktop.md5 === branchHome.footer_desktop.md5 ? '✅ IDÉNTICO' : '❌ DIFERENTE'}`);

console.log('\nGUÍA:');
console.log(`  Header 375px: ${mainGuide.header_mobile.md5 === branchGuide.header_mobile.md5 ? '✅ IDÉNTICO' : '❌ DIFERENTE'}`);
console.log(`  Header 1280px: ${mainGuide.header_desktop.md5 === branchGuide.header_desktop.md5 ? '✅ IDÉNTICO' : '❌ DIFERENTE'}`);
console.log(`  Footer 375px: ${mainGuide.footer_mobile.md5 === branchGuide.footer_mobile.md5 ? '✅ IDÉNTICO' : '❌ DIFERENTE'}`);
console.log(`  Footer 1280px: ${mainGuide.footer_desktop.md5 === branchGuide.footer_desktop.md5 ? '✅ IDÉNTICO' : '❌ DIFERENTE'}`);

await browser.close();
console.log('\n✅ Comparación completada');
