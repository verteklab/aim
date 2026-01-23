import React from 'react';

import { Button, Icon } from 'components/kit';

import { useTranslation } from 'config/i18n';

import { ISearchButtonProps } from './SearchButton.d';

function SearchButton({ isFetching, onSubmit, ...rest }: ISearchButtonProps) {
  const { t } = useTranslation();

  return (
    <Button
      key={`${isFetching}`}
      color='primary'
      variant={isFetching ? 'outlined' : 'contained'}
      startIcon={
        <Icon
          name={isFetching ? 'close' : 'search'}
          fontSize={isFetching ? 12 : 14}
        />
      }
      className='QueryForm__search__button'
      onClick={onSubmit}
      {...rest}
    >
      {isFetching
        ? t('common.cancel', { defaultValue: 'Cancel' })
        : t('common.search', { defaultValue: 'Search' })}
    </Button>
  );
}

export default React.memo(SearchButton);
