import { chromium } from 'playwright';
import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';

const artifactsDir = '/opt/cursor/artifacts';
const browser = await chromium.launch();

async function takeScreenshot(url, filename, width) {
  const context = await browser.newContext({
    viewport: { width, height: 1024 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  
  const path = join(artifactsDir, filename);
  await page.screenshot({ path, fullPage: true });
  
  const md5 = createHash('md5').update(readFileSync(path)).digest('hex');
  
  await context.close();
  return md5;
}

console.log('\n=== Capturando páginas para comparación ===\n');

console.log('Home 375px...');
const mainHome375 = await takeScreenshot('http://localhost:8080/', 'main-home-375px.png', 375);
const branchHome375 = await takeScreenshot('http://localhost:8081/', 'branch-home-375px.png', 375);

console.log('Home 1280px...');
const mainHome1280 = await takeScreenshot('http://localhost:8080/', 'main-home-1280px.png', 1280);
const branchHome1280 = await takeScreenshot('http://localhost:8081/', 'branch-home-1280px.png', 1280);

console.log('Guía 375px...');
const mainGuide375 = await takeScreenshot('http://localhost:8080/guias/primera-moto-argentina/', 'main-guide-375px.png', 375);
const branchGuide375 = await takeScreenshot('http://localhost:8081/guias/primera-moto-argentina/', 'branch-guide-375px.png', 375);

console.log('Guía 1280px...');
const mainGuide1280 = await takeScreenshot('http://localhost:8080/guias/primera-moto-argentina/', 'main-guide-1280px.png', 1280);
const branchGuide1280 = await takeScreenshot('http://localhost:8081/guias/primera-moto-argentina/', 'branch-guide-1280px.png', 1280);

await browser.close();

console.log('\n=== MD5 Hashes ===\n');
console.log('Home 375px:');
console.log(`  Main:   ${mainHome375}`);
console.log(`  Branch: ${branchHome375}`);
console.log(`  Match:  ${mainHome375 === branchHome375 ? '✅' : '❌'}`);

console.log('\nHome 1280px:');
console.log(`  Main:   ${mainHome1280}`);
console.log(`  Branch: ${branchHome1280}`);
console.log(`  Match:  ${mainHome1280 === branchHome1280 ? '✅' : '❌'}`);

console.log('\nGuía 375px:');
console.log(`  Main:   ${mainGuide375}`);
console.log(`  Branch: ${branchGuide375}`);
console.log(`  Match:  ${mainGuide375 === branchGuide375 ? '✅' : '❌'}`);

console.log('\nGuía 1280px:');
console.log(`  Main:   ${mainGuide1280}`);
console.log(`  Branch: ${branchGuide1280}`);
console.log(`  Match:  ${mainGuide1280 === branchGuide1280 ? '✅' : '❌'}`);

console.log('\n✅ Todas las capturas guardadas en /opt/cursor/artifacts/');
