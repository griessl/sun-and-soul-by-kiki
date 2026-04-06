// Load all section content files
import startseite from '../content/texts/01-startseite.json';
import wasIstReiki from '../content/texts/02a-was-ist-reiki.json';
import vorteile from '../content/texts/02b-vorteile.json';
import vergleich from '../content/texts/02c-vergleich.json';
import nachDerSession from '../content/texts/02d-nach-der-session.json';
import soundAndSoul from '../content/texts/03-sound-and-soul.json';
import ueberMichIntro from '../content/texts/04a-ueber-mich-intro.json';
import meinWeg from '../content/texts/04b-mein-weg.json';
import persoenliches from '../content/texts/04c-persoenliches.json';
import buchungKontakt from '../content/texts/05-buchung-kontakt.json';
import navFooter from '../content/texts/06-navigation-footer.json';

export type Lang = 'de' | 'en';

// Build translation maps from content files
function buildTranslations(lang: Lang): Record<string, string> {
  const suffix = `_${lang}`;
  const result: Record<string, string> = {};
  const allContent = {
    ...startseite, ...wasIstReiki, ...vorteile, ...vergleich,
    ...nachDerSession, ...soundAndSoul, ...ueberMichIntro,
    ...meinWeg, ...persoenliches, ...buchungKontakt, ...navFooter,
  } as Record<string, string>;

  for (const [key, value] of Object.entries(allContent)) {
    if (key.endsWith(suffix)) {
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

export function tList(lang: Lang, key: string): string[] {
  return t(lang, key).split('|');
}

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

export function getLocalizedPath(currentPath: string, targetLang: Lang): string {
  const cleanPath = currentPath.replace(/\/$/, '') || '/';
  if (targetLang === 'en') {
    return slugMap[cleanPath] ?? `/en${cleanPath}`;
  }
  return reverseSlugMap[cleanPath] ?? (cleanPath.replace(/^\/en/, '') || '/');
}

export type NavItem = {
  label: string;
  href: string;
  scrollHref: string;
  sectionId: string;
  children?: { label: string; href: string }[];
};

export function getNavItems(lang: Lang): NavItem[] {
  const prefix = lang === 'en' ? '/en' : '';
  const home = `${prefix}/`;
  const aboutHref = lang === 'en' ? '/en/about' : '/ueber-mich';
  const contactHref = lang === 'en' ? '/en/contact' : '/kontakt';
  return [
    { label: t(lang, 'nav.home'), href: home, scrollHref: `${home}#home`, sectionId: 'home' },
    { label: t(lang, 'nav.reiki'), href: `${prefix}/reiki`, scrollHref: `${home}#reiki`, sectionId: 'reiki' },
    { label: t(lang, 'nav.soundAndSoul'), href: `${home}#sound-and-soul`, scrollHref: `${home}#sound-and-soul`, sectionId: 'sound-and-soul' },
    { label: t(lang, 'nav.testimonials'), href: `${home}#testimonials`, scrollHref: `${home}#testimonials`, sectionId: 'testimonials' },
    {
      label: t(lang, 'nav.about'), href: aboutHref, scrollHref: `${home}#ueber-mich`, sectionId: 'ueber-mich',
      children: [
        { label: lang === 'de' ? 'Über Kiki' : 'About Kiki', href: aboutHref },
        { label: lang === 'de' ? 'Kontakt' : 'Contact', href: contactHref },
      ],
    },
  ];
}

export function getBookingPath(lang: Lang): string {
  return lang === 'en' ? '/en/book' : '/buchen';
}

export function getContactPath(lang: Lang): string {
  return lang === 'en' ? '/en/contact' : '/kontakt';
}
