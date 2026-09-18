const stage = process.env.DEPLOYMENT_STAGE ?? 'development';
const siteUrl = process.env.SITE_URL ?? '(unset)';
const indexing = process.env.PUBLIC_INDEXING_ENABLED === 'true';
const ads = process.env.PUBLIC_ENABLE_ADS === 'true';
const analytics = process.env.PUBLIC_ENABLE_ANALYTICS === 'true';
const contact = process.env.PUBLIC_CONTACT_EMAIL ?? '';

const blockers = [];
if (indexing && (stage !== 'production' || /localhost|127\.0\.0\.1|motoguia\.ar/.test(siteUrl))) {
  blockers.push('Indexación activa sin origen de producción verificado.');
}
if (ads && !process.env.PUBLIC_ADSENSE_CLIENT) blockers.push('Ads sin client id.');
if (analytics && !process.env.PUBLIC_GA_MEASUREMENT_ID) blockers.push('Analytics sin measurement id.');

console.log(`stage=${stage} SITE_URL=${siteUrl} indexing=${indexing} contact=${contact || '(faltante)'}`);
if (blockers.length) {
  console.error(blockers.join('\n'));
  process.exit(1);
}
console.log('launch-check ok');
