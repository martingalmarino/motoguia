import sharp from 'sharp';
import { readFileSync } from 'fs';

const ranking = JSON.parse(readFileSync('./src/content/rankings/2026-09.json', 'utf8'));
const top10 = ranking.rows.slice(0, 10);

const width = 1200;
const height = 675;
const margin = 60;
const chartWidth = width - margin * 2;
const chartHeight = height - margin * 2 - 100;

const maxUnits = Math.max(...top10.map(r => r.units));
const barSpacing = chartWidth / top10.length;
const barWidth = barSpacing * 0.7;

let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    </style>
  </defs>
  
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="#ffffff"/>
  
  <!-- Title -->
  <text x="${width/2}" y="40" font-size="28" font-weight="bold" text-anchor="middle" fill="#1a1a1a">
    Top 10 motos más patentadas - Septiembre 2026
  </text>
  
  <!-- Subtitle -->
  <text x="${width/2}" y="70" font-size="16" text-anchor="middle" fill="#666">
    Fuente: ACARA/SIOMAA
  </text>
  
  <!-- Chart area -->
  <g transform="translate(${margin}, ${margin + 80})">`;

top10.forEach((row, i) => {
  const barHeight = (row.units / maxUnits) * chartHeight;
  const x = i * barSpacing + (barSpacing - barWidth) / 2;
  const y = chartHeight - barHeight;
  
  // Bar
  svg += `
    <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="#2563eb" rx="4"/>`;
  
  // Value on top of bar
  svg += `
    <text x="${x + barWidth/2}" y="${y - 8}" font-size="14" font-weight="600" text-anchor="middle" fill="#1a1a1a">
      ${row.units.toLocaleString('es-AR')}
    </text>`;
  
  // Model name (rotated)
  const modelName = row.reportModelName.replace('HONDA ', '').replace('GILERA ', '').replace('KELLER ', '').replace('MOTOMEL ', '').replace('CORVEN ', '').replace('MONDIAL ', '');
  svg += `
    <text x="${x + barWidth/2}" y="${chartHeight + 15}" font-size="12" text-anchor="end" fill="#4a4a4a" transform="rotate(-45, ${x + barWidth/2}, ${chartHeight + 15})">
      ${modelName}
    </text>`;
});

svg += `
  </g>
  
  <!-- Footer -->
  <text x="${width/2}" y="${height - 20}" font-size="12" text-anchor="middle" fill="#999">
    MotoGuía AR · Análisis del mercado de motos en Argentina
  </text>
</svg>`;

const buffer = Buffer.from(svg);
await sharp(buffer)
  .png()
  .toFile('./public/images/blog/septiembre-2026-top10.png');

console.log('Imagen generada: public/images/blog/septiembre-2026-top10.png');
