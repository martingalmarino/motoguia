import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { blogPostPath } from '../../config/site';
import { site } from '../../config/site';
import { getPublishedBlogPosts } from '../../lib/content/catalog';

export async function GET(context: APIContext) {
  const posts = await getPublishedBlogPosts();

  return rss({
    title: `${site.name} - Blog`,
    description: 'Noticias, análisis y novedades del mercado de motos en Argentina.',
    site: context.site?.toString() ?? site.origin,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: blogPostPath(post.id),
      author: post.data.author,
    })),
    customData: '<language>es-AR</language>',
  });
}
