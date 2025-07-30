import type { Lang } from './i18n';

// Slug personalizzati per lingua (aggiungi quelli che ti servono)
const slugs = {
  home: { it: '', en: '' },
  about: { it: 'chi-siamo', en: 'about' },
  contact: { it: 'contatti', en: 'contact' },
} as const;

export function link(lang: Lang, page: keyof typeof slugs) {
  // per la home restituiamo solo `/it/` o `/en/`
  const slug = slugs[page][lang];
  return `/${lang}/${slug}`.replace(/\/\/$/, '/');
}
