// ~/utils/i18n.ts ------------------------------------------------------------
import it from '~/i18n/it.json';
import en from '~/i18n/en.json';

const resources = { it, en } as const;
export type Lang = keyof typeof resources;

/** Deep-access con tipo restituito dedotto.
 *  Usa <T = string> per conservare "string" come default. */
export function t<T = string>(lang: Lang, key: string): T {
  const result = key.split('.').reduce((acc: any, k) => acc?.[k], resources[lang]);

  // se la chiave non esiste restituiamo comunque la chiave originale
  return (result ?? key) as unknown as T;
}
