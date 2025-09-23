import { getAsset } from './utils/permalinks';
import { link } from './utils/routes';
import type { Lang } from './utils/i18n';

// import type { Lang } from './i18n';

/**
 * Creates an URL to switch language while keeping the same page
 * @param currentPath - Current URL path
 * @param targetLang - Target language to switch to
 * @returns URL string for the same page in the target language
 */
export function createLanguageSwitchUrl(currentPath: string, targetLang: Lang): string {
  // Check if the current path is just a language code (like /it or /en)
  if (currentPath.match(/^\/[a-z]{2}$/)) {
    return `/${targetLang}`;
  }

  // Extract current path without language prefix
  const pathWithoutLang = currentPath.replace(/^\/[a-z]{2}\//, '/');

  // For homepage, just return the language code
  if (pathWithoutLang === '/' || pathWithoutLang === '') {
    return `/${targetLang}`;
  }

  // Otherwise, return the path with the new language prefix
  return `/${targetLang}${pathWithoutLang}`;
}

export function getHeaderData(lang: Lang) {
  return {
    links: [
      {
        text: lang === 'it' ? 'Componenti' : 'Components',
        links: [
          {
            text: 'Recommender System',
            href: link(lang, 'recommender-system'),
          },
          {
            text: 'Generative AI',
            href: link(lang, 'generative-ai'),
          },
          {
            text: lang === 'it' ? 'Aule Virtuali' : 'Virtual Classrooms',
            href: link(lang, 'virtual-room'),
          },
          {
            text: 'LMS',
            href: link(lang, 'lms'),
          },
        ],
      },

      {
        text: lang === 'it' ? 'Prezzi' : 'Pricing',
        href: link(lang, 'prices'),
      },
      {
        text: lang === 'it' ? 'Piattaforma' : 'Platform',
        href: link(lang, 'the-platform'),
      },
      {
        text: lang === 'it' ? 'Chi siamo' : 'About Us',
        href: link(lang, 'who-we-are'),
      },
      {
        text: 'Blog',
        // href: link(lang, 'blog'),
        href: '/blog',
      },
      {
        text: lang === 'it' ? 'Contatti' : 'Contact',
        href: link(lang, 'contact'),
      },
    ],
    actions: [
      {
        text: lang === 'it' ? 'Accedi' : 'Login',
        href: 'https://platform.whoteach.it',
        target: '_blank',
      },
    ],
  };
}

export function getFooterData(lang: Lang) {
  return {
    links: [
      {
        title: lang === 'it' ? 'Azienda' : 'Company',
        links: [
          {
            text: lang === 'it' ? 'Contatti' : 'Contact',
            href: link(lang, 'contact'),
          },
          {
            text: lang === 'it' ? 'Accedi a WhoTeachPlatform' : 'Login to WhoTeachPlatform',
            href: 'https://platform.whoteach.it',
            target: '_blank',
          },
          {
            text: lang === 'it' ? 'Chi Siamo' : 'About Us',
            href: link(lang, 'who-we-are'),
          },
          {
            text: 'Blog',
            // href: link(lang, 'blog'),
            href: '/blog',
          },
          {
            text: lang === 'it' ? 'Piani Tariffari' : 'Pricing Plans',
            href: link(lang, 'prices'),
          },
        ],
      },
      {
        title: lang === 'it' ? 'Moduli di WhoTeach' : 'WhoTeach Modules',
        links: [
          {
            text: 'Learning Management System',
            href: link(lang, 'lms'),
          },
          {
            text: 'WhoTeach AI - Recommender System',
            href: link(lang, 'recommender-system'),
          },
          {
            text: 'WhoTeach AI - Generative AI',
            href: link(lang, 'generative-ai'),
          },
          {
            text: lang === 'it' ? 'Aule Virtuali' : 'Virtual Classrooms',
            href: link(lang, 'virtual-room'),
          },
        ],
      },
      {
        title: lang === 'it' ? 'Assistenza' : 'Support',
        links: [
          {
            text: lang === 'it' ? 'Contatti' : 'Contact',
            href: link(lang, 'contact'),
          },
        ],
      },
    ],
    secondaryLinks: [
      {
        text: lang === 'it' ? 'Termini e condizioni' : 'Terms and Conditions',
        // href: link(lang, 'terms'),
        href: '/terms',
      },
      {
        text: lang === 'it' ? 'Privacy Policy' : 'Privacy Policy',
        // href: link(lang, 'privacy'),
        href: '/privacy',
      },
    ],
    socialLinks: [
      { ariaLabel: 'X', icon: 'tabler:brand-x', href: 'https://twitter.com/whoteach' },
      { ariaLabel: 'Instagram', icon: 'tabler:brand-instagram', href: 'https://instagram.com/whoteach' },
      { ariaLabel: 'Facebook', icon: 'tabler:brand-facebook', href: 'https://facebook.com/whoteach' },
      { ariaLabel: 'RSS', icon: 'tabler:rss', href: getAsset('/rss.xml') },
    ],
  };
}

export function getHomeLink(lang: Lang) {
  return link(lang, '');
}
