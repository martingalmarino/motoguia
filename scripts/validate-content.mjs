import { readFileSync, readdirSync } from 'node:fs';
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

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`validate-content: ${motorcycles.length} motorcycle files, no blockers`);
