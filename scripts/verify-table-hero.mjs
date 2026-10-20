import { chromium } from 'playwright';
import { join } from 'path';

const artifactsDir = '/opt/cursor/artifacts';
const browser = await chromium.launch();

// Check branch version at 375px
const context = await browser.newContext({
  viewport: { width: 375, height: 800 },
  deviceScaleFactor: 2,
});
const page = await context.newPage();

await page.goto('http://localhost:8081/blog/honda-plan-de-ahorro-motos-cuotas-octubre-2026/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);

console.log('\n=== Verificación de Tabla y Hero en Móvil ===\n');

// Check table visibility and scrollability
const tableCheck = await page.evaluate(() => {
  const tables = document.querySelectorAll('.prose table');
  if (tables.length === 0) return { found: false };
  
  const firstTable = tables[0];
  const rect = firstTable.getBoundingClientRect();
  const computed = getComputedStyle(firstTable);
  
  // Check if text is readable (not cut off)
  const cells = firstTable.querySelectorAll('td, th');
  const sampleText = cells[0] ? cells[0].textContent : '';
  
  return {
    found: true,
    tableCount: tables.length,
    width: Math.round(rect.width),
    overflowX: computed.overflowX,
    display: computed.display,
    isScrollable: firstTable.scrollWidth > firstTable.clientWidth,
    sampleCellText: sampleText.substring(0, 30),
    allCellsVisible: Array.from(cells).every(cell => {
      const r = cell.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    })
  };
});

console.log('Tablas:');
console.log(`  Encontradas: ${tableCheck.found ? tableCheck.tableCount : 0}`);
if (tableCheck.found) {
  console.log(`  Ancho: ${tableCheck.width}px`);
  console.log(`  overflow-x: ${tableCheck.overflowX}`);
  console.log(`  display: ${tableCheck.display}`);
  console.log(`  Scrollable: ${tableCheck.isScrollable ? 'SÍ' : 'NO'}`);
  console.log(`  Todas las celdas visibles: ${tableCheck.allCellsVisible ? '✅' : '❌'}`);
  console.log(`  Texto de muestra: "${tableCheck.sampleCellText}"`);
}

// Check hero image
const heroCheck = await page.evaluate(() => {
  const hero = document.querySelector('.article-hero img');
  if (!hero) return { found: false };
  
  const rect = hero.getBoundingClientRect();
  const computed = getComputedStyle(hero);
  const parent = hero.parentElement;
  const parentRect = parent.getBoundingClientRect();
  
  return {
    found: true,
    width: Math.round(rect.width),
    height: Math.round(rect.height),
    maxWidth: computed.maxWidth,
    parentWidth: Math.round(parentRect.width),
    fitsInParent: rect.width <= parentRect.width + 1,
    visible: rect.width > 0 && rect.height > 0
  };
});

console.log('\nHero Image:');
console.log(`  Encontrada: ${heroCheck.found ? 'SÍ' : 'NO'}`);
if (heroCheck.found) {
  console.log(`  Ancho: ${heroCheck.width}px`);
  console.log(`  Altura: ${heroCheck.height}px`);
  console.log(`  max-width: ${heroCheck.maxWidth}`);
  console.log(`  Ancho padre: ${heroCheck.parentWidth}px`);
  console.log(`  Cabe en contenedor: ${heroCheck.fitsInParent ? '✅' : '❌'}`);
  console.log(`  Visible: ${heroCheck.visible ? '✅' : '❌'}`);
}

// Take focused screenshots
await page.screenshot({
  path: join(artifactsDir, 'honda-table-mobile-375px.png'),
  fullPage: false,
  clip: { x: 0, y: 1400, width: 375, height: 600 }
});

await page.screenshot({
  path: join(artifactsDir, 'honda-hero-mobile-375px.png'),
  fullPage: false,
  clip: { x: 0, y: 400, width: 375, height: 400 }
});

console.log(`\n✅ Screenshots de tabla y hero guardados en ${artifactsDir}`);

await context.close();
await browser.close();
