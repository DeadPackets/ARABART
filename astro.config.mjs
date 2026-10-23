import { defineConfig } from 'astro/config';
import { writeFile } from 'node:fs/promises';

const site = 'https://arabart.deadpackets.pw';

// sitemap.xml for every built page; the 404 page and the old timeline redirect stay out
const sitemap = {
  name: 'sitemap',
  hooks: {
    'astro:build:done': async ({ dir, pages }) => {
      const urls = pages.map(p => p.pathname).filter(p => !/^(404|timeline)\/?$/.test(p)).sort()
        .map(p => `  <url><loc>${site}/${p}</loc></url>`);
      await writeFile(new URL('sitemap.xml', dir), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);
    },
  },
};

export default defineConfig({
  site,
  output: 'static',
  // one request less per stylesheet: the pages' CSS is small, and separate files blocked the first paint
  build: { inlineStylesheets: 'always' },
  integrations: [sitemap],
});
