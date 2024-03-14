import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import solidJs from '@astrojs/solid-js';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'https://jacopomartinelli.me',
  integrations: [tailwind(), sitemap(), solidJs()],
  vite: {
    server: {
      fs: {
        // Allow serving files from one level up to the project root
        allow: ['../..'],
      },
    },
  },
});
