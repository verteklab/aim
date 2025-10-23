import React from 'react';
import classNames from 'classnames';

import { SUPPORTED_LANGUAGES, useTranslation } from 'config/i18n';

import './LanguageSwitcher.scss';

function LanguageSwitcher(): React.FunctionComponentElement<React.ReactNode> {
  const { language, setLanguage, t } = useTranslation();

  return (
    <div
      className='LanguageSwitcher'
      role='group'
      aria-label={t('languageSwitcher.label', {
        defaultValue: 'Language selector',
      })}
    >
      {SUPPORTED_LANGUAGES.map((lang) => {
        const fullLabel = t(`language.${lang}`);
        const shortLabel = t(`languageSwitcher.short.${lang}`, {
          defaultValue: fullLabel.slice(0, 2).toUpperCase(),
        });
        return (
          <button
            key={lang}
            type='button'
            className={classNames('LanguageSwitcher__button', {
              'LanguageSwitcher__button--active': lang === language,
            })}
            onClick={() => setLanguage(lang)}
            aria-pressed={lang === language}
            title={fullLabel}
            aria-label={fullLabel}
          >
            {shortLabel}
          </button>
        );
      })}
    </div>
  );
}

export default React.memo(LanguageSwitcher);
