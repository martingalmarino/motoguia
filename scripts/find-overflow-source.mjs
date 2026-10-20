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

console.log('\n=== Buscando la fuente del overflow ===\n');

const analysis = await page.evaluate(() => {
  const viewportWidth = window.innerWidth;
  const docScrollWidth = document.documentElement.scrollWidth;
  
  console.log(`Viewport: ${viewportWidth}px`);
  console.log(`Document scrollWidth: ${docScrollWidth}px`);
  
  const results = {
    viewport: viewportWidth,
    docScrollWidth,
    elements: []
  };
  
  // Check every element to find which one is causing overflow
  function checkElement(el, path = '') {
    const rect = el.getBoundingClientRect();
    const computed = window.getComputedStyle(el);
    
    // Check if element exceeds viewport
    if (rect.right > viewportWidth || el.scrollWidth > viewportWidth) {
      const info = {
        path,
        tag: el.tagName,
        className: el.className,
        id: el.id,
        rectWidth: Math.round(rect.width),
        rectRight: Math.round(rect.right),
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
        offsetWidth: el.offsetWidth,
        computedWidth: computed.width,
        computedMaxWidth: computed.maxWidth,
        computedMinWidth: computed.minWidth,
        overflow: computed.overflow,
        overflowX: computed.overflowX,
        display: computed.display,
        boxSizing: computed.boxSizing
      };
      
      // Add text content for inline elements
      if (el.textContent && el.textContent.length < 100) {
        info.text = el.textContent.trim();
      }
      
      results.elements.push(info);
    }
  }
  
  // Walk the DOM
  function walkDOM(node, path = '') {
    if (node.nodeType === 1) { // Element node
      const newPath = path + ' > ' + node.tagName + (node.id ? '#' + node.id : '') + (node.className ? '.' + node.className.split(' ')[0] : '');
      checkElement(node, newPath);
      
      for (let child of node.children) {
        walkDOM(child, newPath);
      }
    }
  }
  
  walkDOM(document.body);
  
  return results;
});

console.log(`Viewport: ${analysis.viewport}px`);
console.log(`Document scrollWidth: ${analysis.docScrollWidth}px\n`);

console.log(`Encontrados ${analysis.elements.length} elementos con overflow:\n`);

// Sort by how much they overflow
analysis.elements.sort((a, b) => b.scrollWidth - a.scrollWidth);

analysis.elements.slice(0, 15).forEach((el, i) => {
  console.log(`${i + 1}. ${el.tag}${el.className ? '.' + el.className.split(' ')[0] : ''}${el.id ? '#' + el.id : ''}`);
  console.log(`   Path: ${el.path.substring(0, 100)}...`);
  console.log(`   scrollWidth: ${el.scrollWidth}px, rectWidth: ${el.rectWidth}px, rectRight: ${el.rectRight}px`);
  console.log(`   computedWidth: ${el.computedWidth}, maxWidth: ${el.computedMaxWidth}`);
  console.log(`   overflow-x: ${el.overflowX}, display: ${el.display}`);
  if (el.text) console.log(`   text: "${el.text.substring(0, 60)}..."`);
  console.log('');
});

await browser.close();
