import { chromium } from 'playwright';

const browser = await chromium.launch();

async function checkCSSRules(url, pageName) {
  const context = await browser.newContext({ viewport: { width: 375, height: 800 } });
  const page = await context.newPage();
  
  await page.goto(url, { waitUntil: 'networkidle' });
  
  const check = await page.evaluate(() => {
    const article = document.querySelector('.article');
    const hasArticle = !!article;
    
    let articleMinWidth = 'N/A';
    let articleMaxWidth = 'N/A';
    
    if (article) {
      const children = article.children;
      if (children.length > 0) {
        const computed = getComputedStyle(children[0]);
        articleMinWidth = computed.minWidth;
        articleMaxWidth = computed.maxWidth;
      }
    }
    
    return {
      hasArticle,
      articleMinWidth,
      articleMaxWidth,
      hasProseTable: !!document.querySelector('.article .prose table'),
      isHomePage: !!document.querySelector('.home-hero'),
      isGuidePage: !!document.querySelector('.article-toc'),
      isBlogPost: hasArticle && !!document.querySelector('.prose')
    };
  });
  
  await context.close();
  return check;
}

console.log('\n=== Verificación de Aplicación de CSS ===\n');

const branchHome = await checkCSSRules('http://localhost:8081/', 'Home');
console.log('Branch - Home:');
console.log(`  Tiene .article: ${branchHome.hasArticle}`);
console.log(`  Es home page: ${branchHome.isHomePage}`);
console.log(`  Es blog post: ${branchHome.isBlogPost}`);
if (branchHome.hasArticle) {
  console.log(`  CSS aplicado - min-width: ${branchHome.articleMinWidth}`);
  console.log(`  CSS aplicado - max-width: ${branchHome.articleMaxWidth}`);
}

const branchGuide = await checkCSSRules('http://localhost:8081/guias/primera-moto-argentina/', 'Guía');
console.log('\nBranch - Guía:');
console.log(`  Tiene .article: ${branchGuide.hasArticle}`);
console.log(`  Es guía: ${branchGuide.isGuidePage}`);
console.log(`  Es blog post: ${branchGuide.isBlogPost}`);
if (branchGuide.hasArticle) {
  console.log(`  CSS aplicado - min-width: ${branchGuide.articleMinWidth}`);
  console.log(`  CSS aplicado - max-width: ${branchGuide.articleMaxWidth}`);
}

const branchBlog = await checkCSSRules('http://localhost:8081/blog/honda-plan-de-ahorro-motos-cuotas-octubre-2026/', 'Blog Post');
console.log('\nBranch - Blog Post:');
console.log(`  Tiene .article: ${branchBlog.hasArticle}`);
console.log(`  Es blog post: ${branchBlog.isBlogPost}`);
console.log(`  Tiene tablas en .prose: ${branchBlog.hasProseTable}`);
if (branchBlog.hasArticle) {
  console.log(`  CSS aplicado - min-width: ${branchBlog.articleMinWidth}`);
  console.log(`  CSS aplicado - max-width: ${branchBlog.articleMaxWidth}`);
}

await browser.close();

console.log('\n=== Conclusión ===');
console.log('Si min-width:0 aparece en Home o Guía, mis cambios CSS');
console.log('están afectando páginas que NO deberían cambiar.');
