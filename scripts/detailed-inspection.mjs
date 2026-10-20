import { chromium } from 'playwright';

const browser = await chromium.launch();

async function inspectPage(url, label) {
  const context = await browser.newContext({
    viewport: { width: 375, height: 800 },
  });
  const page = await context.newPage();
  
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  
  const details = await page.evaluate(() => {
    const widestElements = [];
    document.querySelectorAll('*').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 380) {
        widestElements.push({
          tag: el.tagName,
          class: el.className.split(' ')[0] || '',
          width: Math.round(rect.width)
        });
      }
    });
    
    return {
      docScrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body.scrollWidth,
      innerWidth: window.innerWidth,
      widestElements: widestElements.slice(0, 5),
      tableCount: document.querySelectorAll('table').length,
      hasArticleLayout: !!document.querySelector('.article-layout'),
      hasMotoCards: document.querySelectorAll('.moto-card').length
    };
  });
  
  await context.close();
  return details;
}

console.log('\n=== Inspección Detallada ===\n');

const mainDetails = await inspectPage('http://localhost:8080/blog/honda-plan-de-ahorro-motos-cuotas-octubre-2026/index.html', 'MAIN');
console.log('MAIN:');
console.log(`  docScrollWidth: ${mainDetails.docScrollWidth}px`);
console.log(`  bodyScrollWidth: ${mainDetails.bodyScrollWidth}px`);
console.log(`  innerWidth: ${mainDetails.innerWidth}px`);
console.log(`  Tablas: ${mainDetails.tableCount}`);
console.log(`  Moto cards: ${mainDetails.hasMotoCards}`);
console.log(`  Elementos > 380px: ${mainDetails.widestElements.length}`);
if (mainDetails.widestElements.length > 0) {
  mainDetails.widestElements.forEach(el => {
    console.log(`    - ${el.tag}.${el.class}: ${el.width}px`);
  });
}

console.log('');

const branchDetails = await inspectPage('http://localhost:8081/blog/honda-plan-de-ahorro-motos-cuotas-octubre-2026/index.html', 'BRANCH');
console.log('BRANCH:');
console.log(`  docScrollWidth: ${branchDetails.docScrollWidth}px`);
console.log(`  bodyScrollWidth: ${branchDetails.bodyScrollWidth}px`);
console.log(`  innerWidth: ${branchDetails.innerWidth}px`);
console.log(`  Tablas: ${branchDetails.tableCount}`);
console.log(`  Moto cards: ${branchDetails.hasMotoCards}`);
console.log(`  Elementos > 380px: ${branchDetails.widestElements.length}`);
if (branchDetails.widestElements.length > 0) {
  branchDetails.widestElements.forEach(el => {
    console.log(`    - ${el.tag}.${el.class}: ${el.width}px`);
  });
}

await browser.close();
