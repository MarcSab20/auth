// src/i18n/i18n.ts 
import en_US from './locales/en_US.js';
import fr_FR from './locales/fr_FR.js';

import { defaultLanguage, SupportedLang, TranslationResources } from './languages.js';

const messagesMapping = {
  en_US,
  fr_FR,
};

export class I18n {
  private lang: SupportedLang;
  private messages: TranslationResources = {};
  private langModule: any;

  constructor(lang: SupportedLang = defaultLanguage) {
    this.lang = lang;
    this.loadLanguage(lang);
  }

  async loadLanguage(lang: SupportedLang = defaultLanguage) {
    try {
      const module = messagesMapping[lang] ; //await import(`./locales/${lang}.ts`);
      this.langModule = module ;
      this.messages = module.messages || {};
      if (this.messages) {
        this.lang = lang;
      } else {
        console.warn(`Unsupported language: ${lang}. Falling back to default ${defaultLanguage}.`);
        this.lang = defaultLanguage;
      }
    } catch (error) {
      console.error(`Failed to load translations for language: ${lang}`, error);
    }
  }

  async setLanguage(lang: SupportedLang) {
    await this.loadLanguage(lang);
  }

  t(key: string, params: Record<string, string | number> = {}): string {
    const messageTemplate = this.messages[key] ?? key;
    if (!messageTemplate || messageTemplate == "") {
      console.warn(`Missing translation for key: ${key} in language: ${this.lang}`);
      return key;
    }
    const formated = messageTemplate.replace(/{(\w+)}/g, (_, match) => params[match]?.toString() || '');
    return formated ;
  }

  translate(key: string, params: Record<string, string | number> = {}): string {
    return this.t(key, params);
  }
  // Les autres méthodes comme formatDate et formatNumber restent inchangées.

  formatDate(date: Date, format: 'short' | 'long' = 'short'): string {
    const options = this.langModule.dateTimeFormat[format];
    return new Intl.DateTimeFormat(this.lang, options).format(date);
  }

  formatNumber(value: number, style: 'currency' | 'decimal' = 'decimal'): string {
    const options = this.langModule.numberFormat[style];
    return new Intl.NumberFormat(this.lang, options).format(value);
  }

  getCurrentLanguage(): SupportedLang {
    return this.lang;
  }
}
