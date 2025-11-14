import type { Lang } from './i18n';

// Predefined routes for common pages
const routes = {
  home: '',
  about: 'about',
  contact: 'contact',
  prices: 'prices',
  'who-we-are': 'who-we-are',
  'the-platform': 'the-platform',
  blog: 'blog',
  privacy: 'privacy',
  terms: 'terms',
  dashboard: 'dashboard',
} as const;

// Components routes
const componentRoutes = {
  'recommender-system': 'components/recommender-system',
  'generative-ai': 'components/generative-ai',
  'virtual-room': 'components/virtual-room',
  lms: 'components/lms',
} as const;

type RouteKey = keyof typeof routes;
type ComponentRouteKey = keyof typeof componentRoutes;

// Enhanced link function that can handle:
// 1. Predefined routes
// 2. Component routes
// 3. Custom paths
export function link(lang: Lang, page: RouteKey | ComponentRouteKey | string) {
  if (page === '') {
    return `/${lang}`;
  }

  // Check if it's a predefined route
  if (page in routes) {
    const path = routes[page as RouteKey];
    return path ? `/${lang}/${path}` : `/${lang}`;
  }

  // Check if it's a component route
  if (page in componentRoutes) {
    return `/${lang}/${componentRoutes[page as ComponentRouteKey]}`;
  }

  // Handle custom path (assume it's already formatted correctly)
  // This allows passing any custom path
  return `/${lang}/${page}`;
}
