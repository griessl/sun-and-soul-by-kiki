// Load all section content files
import startseite from '../content/texts/01-startseite.json';
import reiki from '../content/texts/02-reiki.json';
import soundAndSoul from '../content/texts/03-sound-and-soul.json';
import ueberMich from '../content/texts/04-ueber-mich.json';
import buchungKontakt from '../content/texts/05-buchung-kontakt.json';
import navFooter from '../content/texts/06-navigation-footer.json';

export type Lang = 'de' | 'en';

// Build translation maps from content files
// Each content file has keys like "hero_tagline_de" / "hero_tagline_en"
// We transform them into "hero.tagline" -> value for each lang
function buildTranslations(lang: Lang): Record<string, string> {
  const suffix = `_${lang}`;
  const result: Record<string, string> = {};
  const allContent = { ...startseite, ...reiki, ...soundAndSoul, ...ueberMich, ...buchungKontakt, ...navFooter } as Record<string, string>;

  for (const [key, value] of Object.entries(allContent)) {
    if (key.endsWith(suffix)) {
      // Convert "hero_tagline_de" -> "hero.tagline"
      const cleanKey = key.slice(0, -suffix.length).replace(/_/g, '.');
      result[cleanKey] = value;
    }
  }
  return result;
}

const translations: Record<Lang, Record<string, string>> = {
  de: buildTranslations('de'),
  en: buildTranslations('en'),
};

export function getLangFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split('/');
  if (lang === 'en') return 'en';
  return 'de';
}

export function t(lang: Lang, key: string): string {
  return translations[lang]?.[key] ?? translations['de']?.[key] ?? key;
}

/** Split pipe-delimited translation strings into arrays */
export function tList(lang: Lang, key: string): string[] {
  return t(lang, key).split('|');
}

/** Mapping of German slugs to English slugs */
const slugMap: Record<string, string> = {
  '/': '/en',
  '/reiki': '/en/reiki',
  '/sound-and-soul': '/en/sound-and-soul',
  '/testimonials': '/en/testimonials',
  '/ueber-mich': '/en/about',
  '/buchen': '/en/book',
  '/kontakt': '/en/contact',
  '/impressum': '/en/legal',
  '/datenschutz': '/en/privacy',
};

const reverseSlugMap: Record<string, string> = Object.fromEntries(
  Object.entries(slugMap).map(([de, en]) => [en, de])
);

/** Get the equivalent path in the other language */
export function getLocalizedPath(currentPath: string, targetLang: Lang): string {
  const cleanPath = currentPath.replace(/\/$/, '') || '/';
  if (targetLang === 'en') {
    return slugMap[cleanPath] ?? `/en${cleanPath}`;
  }
  return reverseSlugMap[cleanPath] ?? (cleanPath.replace(/^\/en/, '') || '/');
}

/** Get nav items for a given language */
export function getNavItems(lang: Lang) {
  const prefix = lang === 'en' ? '/en' : '';
  return [
    { label: t(lang, 'nav.home'), href: `${prefix}/`, sectionId: 'home' },
    { label: t(lang, 'nav.reiki'), href: `${prefix}/reiki`, sectionId: 'reiki' },
    { label: t(lang, 'nav.soundAndSoul'), href: `${prefix}/sound-and-soul`, sectionId: 'sound-and-soul' },
    { label: t(lang, 'nav.testimonials'), href: `${prefix}/testimonials`, sectionId: 'testimonials' },
    { label: t(lang, 'nav.about'), href: lang === 'en' ? '/en/about' : '/ueber-mich', sectionId: 'ueber-mich' },
  ];
}

export function getBookingPath(lang: Lang): string {
  return lang === 'en' ? '/en/book' : '/buchen';
}

export function getContactPath(lang: Lang): string {
  return lang === 'en' ? '/en/contact' : '/kontakt';
}
