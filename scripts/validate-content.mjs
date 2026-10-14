import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const errors = [];

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return walk(path);
    return [path];
  });
}

const files = walk(join(root, 'src')).filter((file) => /\.(md|astro|ts|json)$/.test(file));
for (const file of files) {
  const text = readFileSync(file, 'utf8');
  if (/lorem ipsum/i.test(text)) errors.push(`${file}: lorem ipsum`);
  if (/javascript:/i.test(text)) errors.push(`${file}: javascript: URL`);
  if (/pub-0000000000000000/.test(text)) errors.push(`${file}: fake ads id`);
}

const motorcycles = readdirSync(join(root, 'src/content/motorcycles'));
const ids = new Set();
for (const file of motorcycles) {
  const text = readFileSync(join(root, 'src/content/motorcycles', file), 'utf8');
  const id = text.match(/^id: (.+)$/m)?.[1];
  if (!id) errors.push(`${file}: missing id`);
  if (id && ids.has(id)) errors.push(`duplicate id ${id}`);
  if (id) ids.add(id);
  if (/status: published/.test(text) && !/sourceIds:/.test(text)) {
    errors.push(`${file}: published without sources`);
  }
}

function frontmatterValue(text, name) {
  const raw = text.match(new RegExp(`^${name}: (.+)$`, 'm'))?.[1]?.trim();
  if (!raw) return null;
  if (raw.startsWith('"')) {
    try {
      return JSON.parse(raw);
    } catch {
      return raw.slice(1, -1);
    }
  }
  return raw;
}

const seoSeen = { seoTitle: new Map(), seoDescription: new Map() };
const seoCollections = [
  { dir: 'motorcycles', strict: true },
  { dir: 'comparisons', strict: true },
  { dir: 'guides', strict: false },
  { dir: 'accessory-guides', strict: false },
];
for (const { dir, strict } of seoCollections) {
  for (const file of readdirSync(join(root, 'src/content', dir)).filter((name) => name.endsWith('.md'))) {
    const text = readFileSync(join(root, 'src/content', dir, file), 'utf8');
    if (!/^status: published$/m.test(text)) continue;
    const label = `${dir}/${file}`;
    const title = frontmatterValue(text, 'seoTitle');
    const description = frontmatterValue(text, 'seoDescription');
    if (!title) errors.push(`${label}: missing seoTitle`);
    if (!description) errors.push(`${label}: missing seoDescription`);
    if (strict && title && title.length > 60) errors.push(`${label}: seoTitle has ${title.length} chars (max 60)`);
    if (strict && description && (description.length < 110 || description.length > 160)) {
      errors.push(`${label}: seoDescription has ${description.length} chars (110-160)`);
    }
    for (const [key, value] of [['seoTitle', title], ['seoDescription', description]]) {
      if (!value) continue;
      const previous = seoSeen[key].get(value);
      if (previous) errors.push(`${label}: duplicate ${key} with ${previous}`);
      else seoSeen[key].set(value, label);
    }
    if (dir === 'motorcycles') {
      const id = file.replace(/\.md$/, '');
      if (!existsSync(join(root, 'public/images/og', `${id}.jpg`))) {
        errors.push(`${label}: missing share image public/images/og/${id}.jpg (run npm run og)`);
      }
    }
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`validate-content: ${motorcycles.length} motorcycle files, no blockers`);
