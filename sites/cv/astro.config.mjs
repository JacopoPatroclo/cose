import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import solidJs from '@astrojs/solid-js';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'https://jacopomartinelli.me',
  i18n: {
    routing: {
      prefixDefaultLocale: false,
    },
    defaultLocale: 'en',
    locales: ['en', 'it'],
  },
  integrations: [tailwind(), sitemap(), solidJs()],
});
