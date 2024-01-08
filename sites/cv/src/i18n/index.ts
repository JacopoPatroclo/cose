import { en } from './en';
import { it } from './it';

export function getTranslation(key: keyof typeof en, lang: string | undefined) {
  if (lang === 'en') return en[key];
  if (lang === 'it') return it[key];
  return en[key];
}
