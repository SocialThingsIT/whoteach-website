import { getPermalink, getBlogPermalink, getAsset } from './utils/permalinks';

export const headerData = {
  links: [
    {
      text: 'Componenti',
      links: [
        {
          text: 'La piattaforma',
          href: getPermalink('/components/the-platform'),
        },
        {
          text: 'Recommender System',
          href: getPermalink('/components/recommender-system'),
        },
        {
          text: 'Generative AI',
          href: getPermalink('/components/generative-ai'),
        },
        {
          text: 'Aule Virtuali',
          href: getPermalink('/components/virtual-room'),
        },
        {
          text: 'LMS',
          href: getPermalink('/components/lms'),
        },
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
};

export const footerData = {
  links: [
    {
      title: 'Azienda',
      links: [
        { text: 'Contatti', href: getPermalink('/contact') },
        { text: 'Accedi a WhoTeachPlatform', href: getPermalink('/login') },
        { text: 'Chi Siamo', href: getPermalink('/who-we-are') },
        { text: 'Blog', href: getBlogPermalink() },
        { text: 'Piani Tariffari', href: getPermalink('/prices') },
        { text: 'Editor News', href: getPermalink('/text-editor') }
      ],
    },
    {
      title: 'Moduli di WhoTeach',
      links: [
        { text: 'Learning Management System', href: getPermalink('/components/lms') },
        { text: 'WhoTeach AI - Recommender System', href: getPermalink('/components/recommender-system') },
        { text: 'WhoTeach AI - Generative AI', href: getPermalink('/components/generative-ai') },
        { text: 'Live ', href: getPermalink('/components/virtual-room') },
      ],
    },
    {
      title: 'Assistenza',
      links: [{ text: 'Contatti', href: getPermalink('/contact') }],
    },
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
  ],
};