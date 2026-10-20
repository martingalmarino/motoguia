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
await page.waitForTimeout(500);

const cssInfo = await page.evaluate(() => {
  const sheets = [];
  for (const sheet of document.styleSheets) {
    sheets.push({
      href: sheet.href,
      rules: sheet.cssRules ? sheet.cssRules.length : 'blocked'
    });
  }
  return sheets;
});

console.log('\n=== CSS Sheets cargadas ===');
cssInfo.forEach((s, i) => {
  console.log(`\n${i + 1}. ${s.href || 'inline'}`);
  console.log(`   Reglas: ${s.rules}`);
});

await browser.close();
