import React from 'react';

import { Button, Switcher, Text } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { useTranslation } from 'config/i18n';

import { IGroupingPopoverAdvancedProps } from 'types/components/GroupingPopover/GroupingPopover';

import './StrokePopoverAdvanced.scss';

function StrokePopoverAdvanced({
  onPersistenceChange,
  onShuffleChange,
  persistence,
  groupingData,
}: IGroupingPopoverAdvancedProps): React.FunctionComponentElement<React.ReactNode> {
  const { t } = useTranslation();
  function isShuffleDisabled(): boolean {
    //ToDo reverse mode
    // if (groupingData?.reverseMode.stroke || groupingData?.stroke.length) {
    if (groupingData?.stroke.length) {
      return false;
    }
    return true;
  }
  return (
    <ErrorBoundary>
      <div className='StrokePopoverAdvanced'>
        <div className='StrokePopoverAdvanced__container'>
          <Text component='h3' size={12} tint={50}>
            {t('grouping.strokePopoverAdvanced.strokeStylePersistence', {
              defaultValue: 'Stroke Style persistence',
            })}
          </Text>
          <Text
            component='p'
            size={14}
            className='StrokePopoverAdvanced__container__p'
          >
            {t('grouping.strokePopoverAdvanced.persistenceDescription', {
              defaultValue:
                'Enable persistent mode for stroke styles so that each group always has the same stroke style regardless to its order',
            })}
          </Text>
          <div className='flex fac fjb'>
            <div className='StrokePopoverAdvanced__Switcher__button__container'>
              <Switcher
                color='primary'
                checked={persistence}
                onChange={() => onPersistenceChange('stroke')}
                size='large'
              />
              <Text size={14} className='ColorPopoverAdvanced__container__span'>
                {t('grouping.strokePopoverAdvanced.enable', {
                  defaultValue: 'Enable',
                })}
              </Text>
            </div>
            {persistence && (
              <Button
                onClick={() => onShuffleChange('stroke')}
                disabled={isShuffleDisabled()}
                variant='contained'
                size='small'
              >
                {t('grouping.strokePopoverAdvanced.shuffle', {
                  defaultValue: 'Shuffle',
                })}
              </Button>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default StrokePopoverAdvanced;
