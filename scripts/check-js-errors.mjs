import { chromium } from 'playwright';

const browser = await chromium.launch();

async function checkErrors(url, label) {
  const context = await browser.newContext({
    viewport: { width: 375, height: 800 },
  });
  const page = await context.newPage();
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  page.on('pageerror', error => {
    errors.push(`PageError: ${error.message}`);
  });
  
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  const html = await page.content();
  const hasTable = html.includes('<table');
  
  await context.close();
  
  return { errors, hasTable, htmlLength: html.length };
}

console.log('\n=== Verificación de Errores JS ===\n');

const mainCheck = await checkErrors('http://localhost:8080/blog/honda-plan-de-ahorro-motos-cuotas-octubre-2026/index.html', 'MAIN');
console.log('MAIN:');
console.log(`  Tiene <table> en HTML: ${mainCheck.hasTable}`);
console.log(`  HTML length: ${mainCheck.htmlLength}`);
console.log(`  Errores JS: ${mainCheck.errors.length}`);
if (mainCheck.errors.length > 0) {
  mainCheck.errors.slice(0, 3).forEach(err => console.log(`    - ${err}`));
}

console.log('');

const branchCheck = await checkErrors('http://localhost:8081/blog/honda-plan-de-ahorro-motos-cuotas-octubre-2026/index.html', 'BRANCH');
console.log('BRANCH:');
console.log(`  Tiene <table> en HTML: ${branchCheck.hasTable}`);
console.log(`  HTML length: ${branchCheck.htmlLength}`);
console.log(`  Errores JS: ${branchCheck.errors.length}`);
if (branchCheck.errors.length > 0) {
  branchCheck.errors.slice(0, 3).forEach(err => console.log(`    - ${err}`));
}

await browser.close();
