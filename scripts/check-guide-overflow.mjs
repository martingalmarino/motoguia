import { chromium } from 'playwright';

const browser = await chromium.launch();

async function checkOverflow(url, label) {
  const context = await browser.newContext({ viewport: { width: 375, height: 800 } });
  const page = await context.newPage();
  
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  
  const check = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth
  }));
  
  await context.close();
  return check;
}

console.log('\n=== Verificación de Overflow en Guías ===\n');

const mainGuide = await checkOverflow('http://localhost:8080/guias/primera-moto-argentina/', 'MAIN');
console.log('MAIN Guía:');
console.log(`  scrollWidth: ${mainGuide.scrollWidth}px`);
console.log(`  innerWidth: ${mainGuide.innerWidth}px`);
console.log(`  Overflow: ${mainGuide.scrollWidth > mainGuide.innerWidth ? '❌ SÍ' : '✅ NO'}`);

const branchGuide = await checkOverflow('http://localhost:8081/guias/primera-moto-argentina/', 'BRANCH');
console.log('\nBRANCH Guía:');
console.log(`  scrollWidth: ${branchGuide.scrollWidth}px`);
console.log(`  innerWidth: ${branchGuide.innerWidth}px`);
console.log(`  Overflow: ${branchGuide.scrollWidth > branchGuide.innerWidth ? '❌ SÍ' : '✅ NO'}`);

console.log('\n=== Conclusión ===');
if (mainGuide.scrollWidth === branchGuide.scrollWidth) {
  console.log('✅ Sin cambios en overflow - diferencias son solo cosméticas');
} else {
  console.log(`⚠️  Overflow cambió: ${mainGuide.scrollWidth}px → ${branchGuide.scrollWidth}px`);
}

await browser.close();
