import { getPermalink, getBlogPermalink, getAsset } from './utils/permalinks';

export const headerData = {
  links: [
    {
      text: 'Componenti',
      links: [
        {
          text: 'First Component',
          href: getPermalink('/components/first'),
        }
      ],
    },
    {
      text: 'Prezzi',
      href: getPermalink('/prices'),
    },
    {
      text: 'Clienti',
      href: getPermalink('/clients'),
    },
    {
      text: 'Chi siamo',
      href: getPermalink('/who-we-are'),
    },
    {
      text: 'Blog',
      href: getBlogPermalink(),
    },
    {
      text: 'Contatti',
      href: getPermalink('/contact'),
    },
  ],
  actions: [{ text: 'Accedi', href: 'https://github.com/onwidget/astrowind', target: '_blank' }],
};

export const footerData = {
  links: [
    {},
    {
      title: 'Azienda',
      links: [
        { text: 'Contatti', href: '#' },
        { text: 'Accedi a WhoTeachPlatform', href: '#' },
        { text: 'Chi Siamo', href: '#' },
        { text: 'Blog', href: '#' },
        { text: 'Piani Tariffari', href: '#' }
      ],
    },
    {
      title: 'Moduli di WhoTeach',
      links: [
        { text: 'Learning Management System', href: '#' },
        { text: 'WhoTeach AI - Recommender System', href: '#' },
        { text: 'WhoTeach AI - Generative AI', href: '#' },
        { text: 'Live ', href: '#' },
      ],
    },
    {
      title: 'Assistenza',
      links: [
        { text: 'Contatti', href: '#' }
      ],
    }
  ],
  secondaryLinks: [
    { text: 'Termini e condizioni', href: getPermalink('/terms') },
    { text: 'Privacy Policy', href: getPermalink('/privacy') },
  ],
  socialLinks: [
    { ariaLabel: 'X', icon: 'tabler:brand-x', href: '#' },
    { ariaLabel: 'Instagram', icon: 'tabler:brand-instagram', href: '#' },
    { ariaLabel: 'Facebook', icon: 'tabler:brand-facebook', href: '#' },
    { ariaLabel: 'RSS', icon: 'tabler:rss', href: getAsset('/rss.xml') },
  ]
};
