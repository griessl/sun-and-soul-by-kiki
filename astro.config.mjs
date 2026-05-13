// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  // Production-URL für Sitemap + Canonical-Tags
  site: 'https://sunandsoulbykiki.de',

  // Server-Output für Middleware (Coming-Soon-Gate).
  // Einzelne Pages bleiben auf Wunsch static via `export const prerender = true`.
  output: 'server',
  adapter: vercel({
    webAnalytics: { enabled: false },
  }),

  i18n: {
    defaultLocale: 'de',
    locales: ['de', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },

  integrations: [
    sitemap({
      // Während Coming-Soon: nur Startseite indexieren lassen.
      // Bei Launch: filter entfernen → alle Seiten in Sitemap.
      filter: (page) => {
        const path = new URL(page).pathname;
        return path === '/' || path === '/en/' || path === '/en';
      },
      i18n: {
        defaultLocale: 'de',
        locales: { de: 'de-DE', en: 'en-US' },
      },
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});
