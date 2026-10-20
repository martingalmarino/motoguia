import { chromium } from 'playwright';
import { createHash } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const artifactsDir = '/opt/cursor/artifacts';
const postPath = '/blog/honda-plan-de-ahorro-motos-cuotas-octubre-2026/index.html';

const browser = await chromium.launch();

async function captureAndAnalyze(url, label, filename) {
  const context = await browser.newContext({
    viewport: { width: 375, height: 800 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  
  const analysis = await page.evaluate(() => {
    return {
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      hasOverflow: document.documentElement.scrollWidth > window.innerWidth
    };
  });
  
  const screenshotPath = join(artifactsDir, filename);
  await page.screenshot({ 
    path: screenshotPath,
    fullPage: true 
  });
  
  // Calculate MD5
  const buffer = readFileSync(screenshotPath);
  const md5 = createHash('md5').update(buffer).digest('hex');
  
  await context.close();
  
  return { ...analysis, md5, filename };
}

console.log('\n=== Comparación Before (Main) vs After (Branch) ===\n');

// Main (before)
console.log('📸 Capturando MAIN (before fix)...');
const before = await captureAndAnalyze(
  `http://localhost:8080${postPath}`,
  'Main',
  'honda-main-before-375px.png'
);

console.log(`\nMAIN (before):`);
console.log(`  scrollWidth: ${before.scrollWidth}px`);
console.log(`  innerWidth: ${before.innerWidth}px`);
console.log(`  overflow: ${before.hasOverflow ? '❌ SÍ' : '✅ NO'}`);
console.log(`  MD5: ${before.md5}`);
console.log(`  File: ${before.filename}`);

// Branch (after)
console.log(`\n📸 Capturando BRANCH (after fix)...`);
const after = await captureAndAnalyze(
  `http://localhost:8081${postPath}`,
  'Branch',
  'honda-branch-after-375px.png'
);

console.log(`\nBRANCH (after):`);
console.log(`  scrollWidth: ${after.scrollWidth}px`);
console.log(`  innerWidth: ${after.innerWidth}px`);
console.log(`  overflow: ${after.hasOverflow ? '❌ SÍ' : '✅ NO'}`);
console.log(`  MD5: ${after.md5}`);
console.log(`  File: ${after.filename}`);

// Summary
console.log(`\n=== Resumen ===`);
console.log(`Reducción de overflow: ${before.scrollWidth}px → ${after.scrollWidth}px`);
console.log(`Diferencia: ${before.scrollWidth - after.scrollWidth}px`);
console.log(`Screenshots distintos: ${before.md5 !== after.md5 ? '✅ SÍ' : '❌ NO (idénticos!)'}`);

await browser.close();

// Save report
const report = `BEFORE vs AFTER Comparison
========================

MAIN (before fix):
  scrollWidth: ${before.scrollWidth}px
  innerWidth: ${before.innerWidth}px
  overflow: ${before.hasOverflow ? 'YES' : 'NO'}
  MD5: ${before.md5}
  File: ${before.filename}

BRANCH (after fix):
  scrollWidth: ${after.scrollWidth}px
  innerWidth: ${after.innerWidth}px
  overflow: ${after.hasOverflow ? 'YES' : 'NO'}
  MD5: ${after.md5}
  File: ${after.filename}

Results:
  Overflow reduction: ${before.scrollWidth - after.scrollWidth}px
  Screenshots distinct: ${before.md5 !== after.md5 ? 'YES' : 'NO'}
`;

writeFileSync(join(artifactsDir, 'BEFORE-AFTER-COMPARISON.txt'), report);
console.log(`\n✅ Report saved to ${artifactsDir}/BEFORE-AFTER-COMPARISON.txt`);
