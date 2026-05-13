// Coming-Soon-Gate Middleware
// =============================
// Wenn COMING_SOON_ENABLED=true und der Besucher KEIN gültiges `sunsoul_preview`-Cookie hat,
// wird der Inhalt der Coming-Soon-Seite zurückgegeben — egal welche URL aufgerufen wurde.
// Die URL bleibt im Browser stehen (interner Rewrite, kein Redirect → kein Hint für Bypass).
//
// Bei Cookie-Set: normale Page wird gerendert.
//
// Bypass-Liste: statische Assets, robots.txt, sitemap, API-Login, /admin (Decap CMS),
// favicon, OG-Images. Alles andere geht durchs Gate.

import { defineMiddleware } from 'astro:middleware';

const PASSTHROUGH_PREFIXES = [
  '/api/preview-login', // sonst kommt man nie rein
  '/admin',              // Decap CMS soll lokal nutzbar bleiben
  '/_image',             // Astro Image-Service
  '/_actions',           // Astro Actions falls genutzt
  '/_astro',             // Astro build assets
];

const PASSTHROUGH_FILES = [
  '/robots.txt',
  '/sitemap-index.xml',
  '/favicon.ico',
  '/favicon.svg',
];

function isPassthrough(pathname: string): boolean {
  if (PASSTHROUGH_FILES.includes(pathname)) return true;
  if (PASSTHROUGH_PREFIXES.some(p => pathname.startsWith(p))) return true;
  // Sitemap-Variants
  if (/^\/sitemap-\d+\.xml$/.test(pathname)) return true;
  // Static images & assets — alles in /images/ und /fonts/
  if (pathname.startsWith('/images/')) return true;
  if (pathname.startsWith('/fonts/')) return true;
  // Coming-Soon-Seite selbst (verhindert Rewrite-Loop)
  if (pathname === '/coming-soon' || pathname === '/coming-soon/') return true;
  return false;
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, rewrite } = context;

  const rawEnabled = process.env.COMING_SOON_ENABLED ?? import.meta.env.COMING_SOON_ENABLED;
  const enabled = String(rawEnabled ?? '').trim().toLowerCase() === 'true';

  if (!enabled) return next();
  if (isPassthrough(url.pathname)) return next();

  // Cookie gesetzt → echte Seite
  if (cookies.get('sunsoul_preview')?.value === '1') {
    return next();
  }

  // Sonst: Coming-Soon-Inhalt rendern, aber URL beibehalten (kein Redirect)
  return rewrite('/coming-soon');
});
