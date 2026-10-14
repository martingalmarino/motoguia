// Genera las imágenes para compartir (1200x630 JPG) de cada ficha publicada y la imagen por defecto.
// Uso: npm run og. Los archivos se versionan en public/images/og/.
import { existsSync, mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const outDir = join(root, 'public/images/og');
mkdirSync(outDir, { recursive: true });

const brands = JSON.parse(readFileSync(join(root, 'src/data/brands.json'), 'utf8'));
const brandName = new Map(brands.map((brand) => [brand.id, brand.name]));
const CATEGORY = { cub: 'Cub', street: 'Calle', scooter: 'Scooter', trail: 'Trail', adventure: 'Adventure', sport: 'Sport', touring: 'Touring', other: 'Moto' };

const W = 1200;
const H = 630;
const PANEL_X = 760;

const esc = (value) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const field = (text, name) => text.match(new RegExp(`^\\s*${name}: (.+)$`, 'm'))?.[1]?.trim().replace(/^"|"$/g, '');

function wrap(text, max) {
  const lines = [];
  let line = '';
  for (const word of text.split(' ')) {
    if (line && `${line} ${word}`.length > max) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function panelSvg({ brand, model, spec }) {
  const usable = W - PANEL_X - 96;
  const fit = (size) => wrap(model, Math.floor(usable / (size * 0.6)));
  let titleSize = 60;
  let titleLines = fit(titleSize);
  if (titleLines.length > 2) {
    titleSize = 46;
    titleLines = fit(titleSize).slice(0, 3);
  }
  const titleY = 250;
  const title = titleLines
    .map((line, index) => `<text x="${PANEL_X + 48}" y="${titleY + index * (titleSize + 8)}" fill="#FFFFFF" font-size="${titleSize}" font-weight="700" font-family="Archivo, 'Helvetica Neue', Arial, sans-serif">${esc(line)}</text>`)
    .join('');
  const specY = titleY + titleLines.length * (titleSize + 8) + 30;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect x="${PANEL_X}" y="0" width="${W - PANEL_X}" height="${H}" fill="#123D50"/>
  <rect x="${PANEL_X + 48}" y="64" width="56" height="56" rx="12" fill="#FFFFFF"/>
  <path d="M${PANEL_X + 62} 102V80l14 13 14-13v22" fill="none" stroke="#123D50" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="${PANEL_X + 120}" y="101" fill="#FFFFFF" font-size="28" font-weight="700" font-family="Archivo, 'Helvetica Neue', Arial, sans-serif">MotoGuía AR</text>
  <text x="${PANEL_X + 48}" y="${titleY - titleSize - 14}" fill="#7CC4E4" font-size="26" font-weight="600" letter-spacing="2" font-family="Archivo, 'Helvetica Neue', Arial, sans-serif">${esc(brand.toUpperCase())}</text>
  ${title}
  <text x="${PANEL_X + 48}" y="${specY}" fill="#B8CCD6" font-size="28" font-family="Archivo, 'Helvetica Neue', Arial, sans-serif">${esc(spec)}</text>
  <text x="${PANEL_X + 48}" y="${H - 56}" fill="#B8CCD6" font-size="22" font-family="Archivo, 'Helvetica Neue', Arial, sans-serif">Ficha técnica y precio</text>
</svg>`;
}

async function modelImage(file) {
  const text = readFileSync(join(root, 'src/content/motorcycles', file), 'utf8');
  if (field(text, 'status') !== 'published') return null;
  const id = file.replace(/\.md$/, '');
  const photo = text.match(/^\s+- path: (\/images\/motos\/\S+)$/m)?.[1];
  if (!photo) return null;
  const stem = photo.replace(/^.*\//, '').replace(/\.[a-z0-9]+$/i, '');
  const stage = join(root, 'public/images/motos/stage', `${stem}-1200.webp`);
  const source = existsSync(stage) ? stage : join(root, 'public', photo);

  const engineType = field(text, 'engineType');
  const cc = field(text, 'displacementCc');
  const kw = field(text, 'nominalPowerKw');
  const category = CATEGORY[field(text, 'category')] ?? 'Moto';
  const lead = engineType === 'electric'
    ? (kw && kw !== 'null' ? `${String(kw).replace('.', ',')} kW` : 'Eléctrica')
    : (cc && cc !== 'null' ? `${String(cc).replace('.', ',')} cc` : null);
  const spec = [lead, category, engineType === 'electric' ? 'Eléctrica' : null].filter(Boolean).join(' · ');

  const photoBox = await sharp(source)
    .resize(PANEL_X - 64, H - 64, { fit: 'contain', background: '#FFFFFF' })
    .toBuffer();
  await sharp({ create: { width: W, height: H, channels: 3, background: '#FFFFFF' } })
    .composite([
      { input: photoBox, left: 32, top: 32 },
      { input: Buffer.from(panelSvg({ brand: brandName.get(field(text, 'brandId')) ?? '', model: field(text, 'name') ?? id, spec })), left: 0, top: 0 },
    ])
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(join(outDir, `${id}.jpg`));
  return id;
}

const files = readdirSync(join(root, 'src/content/motorcycles')).filter((file) => file.endsWith('.md'));
const done = (await Promise.all(files.map(modelImage))).filter(Boolean);

await sharp(join(root, 'public/images/og-default.svg'), { density: 144 })
  .resize(W, H)
  .png({ compressionLevel: 9 })
  .toFile(join(root, 'public/images/og-default.png'));

await sharp(join(root, 'public/favicon.svg'), { density: 600 })
  .resize(512, 512)
  .png({ compressionLevel: 9 })
  .toFile(join(root, 'public/images/logo-512.png'));

console.log(`build-og: ${done.length} imágenes de fichas y og-default.png`);
