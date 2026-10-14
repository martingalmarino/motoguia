import type { APIRoute } from 'astro';
import { indexingEnabled, site } from '../config/site';

const AI_CRAWLERS = [
  'OAI-SearchBot',
  'ChatGPT-User',
  'GPTBot',
  'PerplexityBot',
  'Perplexity-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Google-Extended',
  'Applebot-Extended',
  'Bingbot',
];

export const GET: APIRoute = () => {
  const groups = [
    'User-agent: *\nAllow: /',
    ...AI_CRAWLERS.map((agent) => `User-agent: ${agent}\nAllow: /`),
  ];
  const lines = [groups.join('\n\n')];
  if (indexingEnabled) lines.push(`Sitemap: ${site.origin}/sitemap-index.xml`);
  return new Response(`${lines.join('\n\n')}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
