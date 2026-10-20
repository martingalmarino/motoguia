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

const proseAnalysis = await page.evaluate(() => {
  const prose = document.querySelector('.prose');
  const viewportWidth = window.innerWidth;
  
  if (!prose) return { error: 'No .prose found' };
  
  const result = {
    proseScrollWidth: prose.scrollWidth,
    proseClientWidth: prose.clientWidth,
    proseRectWidth: Math.round(prose.getBoundingClientRect().width),
    tables: [],
    images: []
  };
  
  prose.querySelectorAll('table').forEach((table, i) => {
    const rect = table.getBoundingClientRect();
    const parent = table.parentElement;
    result.tables.push({
      index: i,
      scrollWidth: table.scrollWidth,
      clientWidth: table.clientWidth,
      rectWidth: Math.round(rect.width),
      parentTag: parent.tagName,
      parentScrollWidth: parent.scrollWidth,
      display: getComputedStyle(table).display,
      overflowX: getComputedStyle(table).overflowX,
      parentOverflowX: getComputedStyle(parent).overflowX
    });
  });
  
  prose.querySelectorAll('img').forEach((img, i) => {
    const rect = img.getBoundingClientRect();
    result.images.push({
      index: i,
      rectWidth: Math.round(rect.width),
      scrollWidth: img.scrollWidth,
      naturalWidth: img.naturalWidth,
      computedMaxWidth: getComputedStyle(img).maxWidth
    });
  });
  
  return result;
});

console.log('\n=== Análisis de .prose ===\n');
console.log(`prose scrollWidth: ${proseAnalysis.proseScrollWidth}px`);
console.log(`prose clientWidth: ${proseAnalysis.proseClientWidth}px`);
console.log(`prose rectWidth: ${proseAnalysis.proseRectWidth}px\n`);

if (proseAnalysis.tables.length) {
  console.log(`Tablas (${proseAnalysis.tables.length}):`);
  proseAnalysis.tables.forEach(t => {
    console.log(`  Tabla ${t.index + 1}:`);
    console.log(`    scrollWidth: ${t.scrollWidth}px, rectWidth: ${t.rectWidth}px`);
    console.log(`    display: ${t.display}, overflow-x: ${t.overflowX}`);
    console.log(`    parent <${t.parentTag}> scrollWidth: ${t.parentScrollWidth}px, overflow-x: ${t.parentOverflowX}`);
  });
  console.log('');
}

if (proseAnalysis.images.length) {
  console.log(`Imágenes en .prose (${proseAnalysis.images.length}):`);
  proseAnalysis.images.forEach(img => {
    console.log(`  Imagen ${img.index + 1}: rectWidth=${img.rectWidth}px, naturalWidth=${img.naturalWidth}px, max-width=${img.computedMaxWidth}`);
  });
}

await browser.close();
