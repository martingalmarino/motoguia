import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 375, height: 800 },
  deviceScaleFactor: 2,
});
const page = await context.newPage();

const baseUrl = `file://${projectRoot}/dist`;
const postUrl = `${baseUrl}/blog/honda-plan-de-ahorro-motos-cuotas-octubre-2026/index.html`;

await page.goto(postUrl, { waitUntil: 'networkidle' });

console.log('\n=== Diagnóstico de overflow en 375px ===\n');

// Check overall overflow
const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
const innerWidth = await page.evaluate(() => window.innerWidth);
console.log(`Página: scrollWidth=${scrollWidth}, innerWidth=${innerWidth}, overflow=${scrollWidth > innerWidth}\n`);

// Check specific elements in .prose
const overflowingElements = await page.evaluate(() => {
  const elements = [];
  const prose = document.querySelector('.prose');
  if (!prose) return elements;
  
  const viewportWidth = window.innerWidth;
  
  // Check all children
  const checkElement = (el, selector) => {
    const rect = el.getBoundingClientRect();
    const scrollW = el.scrollWidth;
    const clientW = el.clientWidth;
    const computedWidth = parseFloat(getComputedStyle(el).width);
    
    if (scrollW > viewportWidth || computedWidth > viewportWidth || rect.width > viewportWidth) {
      elements.push({
        selector,
        tagName: el.tagName,
        scrollWidth: scrollW,
        clientWidth: clientW,
        computedWidth: computedWidth,
        rectWidth: rect.width,
        text: el.textContent.substring(0, 50) + '...'
      });
    }
  };
  
  // Check tables
  prose.querySelectorAll('table').forEach((el, i) => {
    checkElement(el, `.prose table:nth-of-type(${i + 1})`);
  });
  
  // Check images
  prose.querySelectorAll('img').forEach((el, i) => {
    checkElement(el, `.prose img:nth-of-type(${i + 1})`);
  });
  
  // Check links with long URLs
  prose.querySelectorAll('a').forEach((el, i) => {
    if (el.textContent.length > 40 || el.href.length > 60) {
      checkElement(el, `.prose a:nth-of-type(${i + 1})`);
    }
  });
  
  // Check hero image
  const heroImg = document.querySelector('.article-hero img');
  if (heroImg) {
    checkElement(heroImg, '.article-hero img');
  }
  
  return elements;
});

console.log('Elementos con overflow:');
overflowingElements.forEach(el => {
  console.log(`\n${el.selector} (${el.tagName})`);
  console.log(`  scrollWidth: ${el.scrollWidth}px`);
  console.log(`  clientWidth: ${el.clientWidth}px`);
  console.log(`  computedWidth: ${el.computedWidth}px`);
  console.log(`  rectWidth: ${el.rectWidth}px`);
  if (el.text) console.log(`  contenido: ${el.text}`);
});

await browser.close();
