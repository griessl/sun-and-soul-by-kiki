// POST /api/preview-login
// Validiert Passwort gegen COMING_SOON_PASSWORD env, setzt bei Erfolg httpOnly-Cookie und
// leitet auf "/" um. Bei Fehler zurück zur Coming-Soon-Seite mit ?error=1.
import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const password = String(formData.get('password') ?? '');
  const expected = import.meta.env.COMING_SOON_PASSWORD || process.env.COMING_SOON_PASSWORD;

  if (!expected) {
    return new Response('Preview disabled (no password configured)', { status: 500 });
  }

  if (password !== expected) {
    return new Response(null, {
      status: 303,
      headers: { Location: '/?error=1' },
    });
  }

  // 30 Tage gültig, httpOnly (kein JS-Zugriff), Secure (nur HTTPS außer in dev), SameSite=Lax
  const isProd = import.meta.env.PROD;
  const cookieAttrs = [
    'sunsoul_preview=1',
    'Path=/',
    `Max-Age=${60 * 60 * 24 * 30}`,
    'HttpOnly',
    'SameSite=Lax',
    isProd ? 'Secure' : '',
  ].filter(Boolean).join('; ');

  return new Response(null, {
    status: 303,
    headers: {
      Location: '/',
      'Set-Cookie': cookieAttrs,
    },
  });
};
