import { chromium } from 'playwright';

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 375, height: 800 } });

const checks = [
  { url: 'http://localhost:8081/blog/honda-plan-de-ahorro-motos-cuotas-octubre-2026/', name: 'Blog Post' },
  { url: 'http://localhost:8081/guias/primera-moto-argentina/', name: 'Guía' }
];

for (const check of checks) {
  const page = await context.newPage();
  await page.goto(check.url, { waitUntil: 'networkidle' });
  
  const classes = await page.evaluate(() => {
    const article = document.querySelector('.article');
    const parent = article?.parentElement;
    const grandparent = parent?.parentElement;
    
    return {
      articleParent: parent?.className || 'none',
      articleGrandparent: grandparent?.className || 'none',
      bodyClasses: document.body.className,
      hasArticleLayout: !!document.querySelector('.article-layout'),
      hasArticleToc: !!document.querySelector('.article-toc')
    };
  });
  
  console.log(`\n${check.name}:`);
  console.log(`  Padre de .article: "${classes.articleParent}"`);
  console.log(`  Abuelo de .article: "${classes.articleGrandparent}"`);
  console.log(`  .article-layout: ${classes.hasArticleLayout}`);
  console.log(`  .article-toc: ${classes.hasArticleToc}`);
  
  await page.close();
}

await context.close();
await browser.close();

console.log('\n✅ Usar .article-layout como contenedor específico de blog posts');
