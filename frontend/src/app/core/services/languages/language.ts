import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type Lang = 'fr' | 'en' | 'de';

export interface LangOption {
  code: Lang;
  label: string;
  flag?: string; // optionnel
}

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private translate = inject(TranslateService);

readonly options = [
  { code: 'fr', label: 'Français', flag: 'assets/flags/fr.svg' },
  { code: 'en', label: 'English',  flag: 'assets/flags/en.svg' },
  { code: 'de', label: 'Deutsch',  flag: 'assets/flags/de.svg' },
] as const;

readonly flagByCode: Record<'fr'|'en'|'de', string> = {
  fr: 'assets/flags/fr.svg',
  en: 'assets/flags/en.svg',
  de: 'assets/flags/de.svg',
};

  readonly defaultLang: Lang = 'fr';

  init() {
    this.translate.addLangs(this.options.map(o => o.code));
    this.translate.setDefaultLang(this.defaultLang);

    const saved = localStorage.getItem('lang') as Lang | null;
    const browser = this.translate.getBrowserLang() as Lang | null;

    const initial: Lang =
      saved && this.isSupported(saved) ? saved :
      browser && this.isSupported(browser) ? browser :
      this.defaultLang;

    this.setLang(initial);
  }

  get current(): Lang {
    return (this.translate.currentLang as Lang) || this.defaultLang;
  }

  setLang(lang: Lang) {
    if (!this.isSupported(lang)) return;

    this.translate.use(lang);
    localStorage.setItem('lang', lang);

    // accessibilité + SEO
    document.documentElement.lang = lang;
  }

  private isSupported(lang: string): lang is Lang {
    return lang === 'fr' || lang === 'en' || lang === 'de';
  }
}