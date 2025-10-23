import React from 'react';

import en from './locales/en';
import zh from './locales/zh';

type Language = 'en' | 'zh';

const SUPPORTED_LANGUAGES: Language[] = ['en', 'zh'];
const STORAGE_KEY = 'aim_ui_language';

type TranslationTree = typeof en;
type TranslationValue = string | TranslationTree;

interface TranslateOptions {
  defaultValue?: string;
  values?: Record<string, string | number>;
}

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, options?: TranslateOptions) => string;
}

const translations: Record<Language, TranslationTree> = {
  en,
  zh,
};

function getValueFromTree(
  tree: TranslationValue,
  path: string[],
): TranslationValue | undefined {
  return path.reduce<TranslationValue | undefined>((acc, segment) => {
    if (acc && typeof acc === 'object') {
      return (acc as TranslationTree)[segment] as TranslationValue;
    }
    return undefined;
  }, tree);
}

function interpolate(
  template: string,
  values?: Record<string, string | number>,
) {
  if (!values) {
    return template;
  }
  return Object.keys(values).reduce((result, key) => {
    const value = values[key];
    const pattern = new RegExp(`\\{\\{\\s*${key}\\s*\\}}`, 'g');
    return result.replace(pattern, String(value));
  }, template);
}

const LanguageContext = React.createContext<LanguageContextValue | null>(null);

function detectInitialLanguage(): Language {
  if (typeof window === 'undefined') {
    return 'en';
  }
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Language | null;
    if (stored && SUPPORTED_LANGUAGES.includes(stored)) {
      return stored;
    }
  } catch (err) {
    /* localStorage may be unavailable; fall back to detection */
  }

  if (typeof navigator !== 'undefined') {
    const navLang = navigator.language || navigator.languages?.[0];
    if (navLang && navLang.toLowerCase().startsWith('zh')) {
      return 'zh';
    }
  }

  return 'en';
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = React.useState<Language>(() =>
    detectInitialLanguage(),
  );

  const setLanguage = React.useCallback((next: Language) => {
    setLanguageState((prev) => {
      if (prev === next) {
        return prev;
      }
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(STORAGE_KEY, next);
        }
      } catch (err) {
        /* ignore if storage is unavailable */
      }
      return next;
    });
  }, []);

  const translate = React.useCallback<LanguageContextValue['t']>(
    (key, options) => {
      if (!key) {
        return '';
      }
      const path = key.split('.');
      const activeValue = getValueFromTree(translations[language], path);
      const fallbackValue = getValueFromTree(translations.en, path);
      const resolved =
        (typeof activeValue === 'string' && activeValue) ||
        (typeof fallbackValue === 'string' && fallbackValue) ||
        options?.defaultValue ||
        key;

      return interpolate(resolved, options?.values);
    },
    [language],
  );

  const contextValue = React.useMemo<LanguageContextValue>(
    () => ({ language, setLanguage, t: translate }),
    [language, translate, setLanguage],
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useTranslation(): LanguageContextValue {
  const context = React.useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}

export { SUPPORTED_LANGUAGES };
