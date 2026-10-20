import { chromium } from 'playwright';

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 375, height: 800 },
});
const page = await context.newPage();

await page.goto('http://localhost:8080/blog/honda-plan-de-ahorro-motos-cuotas-octubre-2026/index.html', { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);

const debug = await page.evaluate(() => {
  const article = document.querySelector('.article');
  const articleHeader = document.querySelector('.article-header');
  
  const articleComputed = getComputedStyle(article);
  const headerComputed = getComputedStyle(articleHeader);
  
  return {
    article: {
      display: articleComputed.display,
      gap: articleComputed.gap,
      maxWidth: articleComputed.maxWidth,
      width: articleComputed.width,
      padding: `${articleComputed.paddingLeft} ${articleComputed.paddingRight}`,
      rectWidth: Math.round(article.getBoundingClientRect().width)
    },
    header: {
      display: headerComputed.display,
      gap: headerComputed.gap,
      padding: `${headerComputed.paddingLeft} ${headerComputed.paddingRight}`,
      maxWidth: headerComputed.maxWidth,
      width: headerComputed.width,
      rectWidth: Math.round(articleHeader.getBoundingClientRect().width),
      position: headerComputed.position
    },
    computed566: 'Checking why 566px...',
    breadcrumbsWidth: Math.round(document.querySelector('.breadcrumbs').getBoundingClientRect().width)
  };
});

console.log('\n=== Debug Article Layout ===\n');
console.log('Article (.article):');
Object.entries(debug.article).forEach(([k, v]) => console.log(`  ${k}: ${v}`));
console.log('\nHeader (.article-header):');
Object.entries(debug.header).forEach(([k, v]) => console.log(`  ${k}: ${v}`));
console.log(`\nBreadcrumbs width: ${debug.breadcrumbsWidth}px`);

await browser.close();
