import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import { join } from 'path';

const ARTIFACTS_DIR = '/opt/cursor/artifacts/screenshots';
const URL = 'http://localhost:4321/accesorios/como-elegir-casco-moto/';

try {
  await mkdir(ARTIFACTS_DIR, { recursive: true });
  
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  
  // Desktop screenshot
  console.log('Taking desktop screenshot...');
  const desktopPage = await context.newPage();
  await desktopPage.setViewportSize({ width: 1920, height: 1080 });
  await desktopPage.goto(URL, { waitUntil: 'networkidle' });
  await desktopPage.screenshot({
    path: join(ARTIFACTS_DIR, 'guia-cascos-desktop.png'),
    fullPage: true
  });
  
  // Mobile screenshot
  console.log('Taking mobile screenshot...');
  const mobilePage = await context.newPage();
  await mobilePage.setViewportSize({ width: 375, height: 667 });
  await mobilePage.goto(URL, { waitUntil: 'networkidle' });
  await mobilePage.screenshot({
    path: join(ARTIFACTS_DIR, 'guia-cascos-mobile.png'),
    fullPage: true
  });
  
  // Verify content
  console.log('\nVerifying rendered content...');
  const content = await desktopPage.content();
  
  // Check for literal braces
  if (content.includes('{#')) {
    console.error('❌ Found literal braces in headings');
  } else {
    console.log('✓ No literal braces found');
  }
  
  // Check for CTA buttons
  const ctaCount = await desktopPage.locator('.cta-button').count();
  console.log(`✓ Found ${ctaCount} CTA buttons`);
  
  // Check for product badges
  const badgeCount = await desktopPage.locator('.product-badge').count();
  console.log(`✓ Found ${badgeCount} product badges`);
  
  // Check for helmet cards
  const helmetCards = await desktopPage.locator('.helmet-card').count();
  console.log(`✓ Found ${helmetCards} helmet type cards`);
  
  await browser.close();
  
  console.log(`\n✓ Screenshots saved to ${ARTIFACTS_DIR}`);
  console.log('  - guia-cascos-desktop.png');
  console.log('  - guia-cascos-mobile.png');
  
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
