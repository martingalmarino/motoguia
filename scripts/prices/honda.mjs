const decode = (text) =>
  text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

const parseArs = (text) => {
  const digits = text.replace(/[^\d]/g, '');
  return digits ? Number(digits) : null;
};

/**
 * Lee los precios de una página de modelo de motos.honda.com.ar.
 * Cada versión tiene una pestaña `model_version_N_id` con el nombre y un bloque `model_version_N_info` con el precio.
 * @param {string} html
 * @returns {{ label: string, priceARS: number }[]}
 */
export function parseHondaPrices(html) {
  const labels = new Map();
  for (const match of html.matchAll(/id="model_version_(\d+)_id"[^>]*>([^<]+)</g)) {
    labels.set(match[1], decode(match[2]));
  }
  const versions = [];
  const blocks = [...html.matchAll(/id="model_version_(\d+)_info"/g)];
  blocks.forEach((block, index) => {
    const end = blocks[index + 1]?.index ?? html.length;
    const chunk = html.slice(block.index, end);
    const price = chunk.match(/class="price-container"[^>]*>\s*<p[^>]*>\s*([^<]+)</);
    const priceARS = price ? parseArs(price[1]) : null;
    if (!priceARS) return;
    versions.push({ label: labels.get(block[1]) ?? `version ${block[1]}`, priceARS });
  });
  return versions;
}
