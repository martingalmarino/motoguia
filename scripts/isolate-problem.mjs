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

console.log('\n=== Aislando el problema ===\n');

// Hide related motorcycles section and check overflow
const withoutRelated = await page.evaluate(() => {
  const section = document.querySelector('.section');
  if (section) {
    section.style.display = 'none';
  }
  return {
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth
  };
});

console.log('SIN la sección de motos relacionadas:');
console.log(`  scrollWidth: ${withoutRelated.scrollWidth}, innerWidth: ${withoutRelated.innerWidth}`);
console.log(`  Overflow: ${withoutRelated.scrollWidth > withoutRelated.innerWidth ? '❌ SÍ' : '✅ NO'}\n`);

// Show it again and hide article content
const withoutArticle = await page.evaluate(() => {
  document.querySelector('.section').style.display = '';
  const article = document.querySelector('.article');
  if (article) {
    article.style.display = 'none';
  }
  return {
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth
  };
});

console.log('SIN el contenido del artículo:');
console.log(`  scrollWidth: ${withoutArticle.scrollWidth}, innerWidth: ${withoutArticle.innerWidth}`);
console.log(`  Overflow: ${withoutArticle.scrollWidth > withoutArticle.innerWidth ? '❌ SÍ' : '✅ NO'}\n`);

await browser.close();
