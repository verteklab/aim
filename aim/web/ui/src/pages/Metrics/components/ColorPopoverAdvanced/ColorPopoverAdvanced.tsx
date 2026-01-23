import React from 'react';

import { Box, Radio } from '@material-ui/core';

import { Button, Switcher, Text } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { useTranslation } from 'config/i18n';
import COLORS from 'config/colors/colors';

import { IGroupingPopoverAdvancedProps } from 'types/components/GroupingPopover/GroupingPopover';

import './ColorPopoverAdvanced.scss';

function ColorPopoverAdvanced({
  onPersistenceChange,
  onGroupingPaletteChange,
  onShuffleChange,
  persistence,
  paletteIndex,
  groupingData,
}: IGroupingPopoverAdvancedProps): React.FunctionComponentElement<React.ReactNode> {
  const { t } = useTranslation();
  function onPaletteChange(e: React.ChangeEvent<HTMLInputElement>) {
    let { value } = e.target;
    if (onGroupingPaletteChange) {
      onGroupingPaletteChange(parseInt(value));
    }
  }
  function isShuffleDisabled(): boolean {
    //ToDo reverse mode
    // if (groupingData?.reverseMode.color || groupingData?.color.length) {
    if (groupingData?.color.length) {
      return false;
    }
    return true;
  }

  return (
    <ErrorBoundary>
      <div className='ColorPopoverAdvanced'>
        <div className='ColorPopoverAdvanced__persistence'>
          <Text component='h3' size={12} tint={50}>
            {t('grouping.colorPopoverAdvanced.colorsPersistence', {
              defaultValue: 'colors persistence',
            })}
          </Text>
          <Text
            component='p'
            size={14}
            className='ColorPopoverAdvanced__persistence__p'
          >
            {t('grouping.colorPopoverAdvanced.persistenceDescription', {
              defaultValue:
                'Enable persistent coloring mode so that each item always has the same color regardless of its order.',
            })}
          </Text>
          <div className='flex fac fjb'>
            <div className='ColorPopoverAdvanced__Switcher__button__container'>
              <Switcher
                onChange={() => onPersistenceChange('color')}
                checked={persistence}
                size='large'
                variant='contained'
              />
              <Text size={14} className='ColorPopoverAdvanced__span'>
                {t('grouping.colorPopoverAdvanced.enable', {
                  defaultValue: 'Enable',
                })}
              </Text>
            </div>
            {persistence && (
              <Button
                disabled={isShuffleDisabled()}
                onClick={() => onShuffleChange('color')}
                variant='contained'
                size='small'
              >
                {t('grouping.colorPopoverAdvanced.shuffle', {
                  defaultValue: 'Shuffle',
                })}
              </Button>
            )}
          </div>
        </div>
        <div className='ColorPopoverAdvanced__preferred__colors'>
          <Text component='h3' tint={50}>
            {t('grouping.colorPopoverAdvanced.preferredColorPalette', {
              defaultValue: 'Preferred color palette',
            })}
          </Text>
          <div>
            {COLORS.map((options, index) => (
              <ErrorBoundary key={index}>
                <Box display='flex' alignItems='center'>
                  <Radio
                    color='primary'
                    checked={paletteIndex === index}
                    onChange={onPaletteChange}
                    size='small'
                    value={index}
                  />
                  <Text size={14} className='ColorPopoverAdvanced__span'>
                    {index === 0
                      ? t('grouping.colorPopoverAdvanced.eightDistinctColors', {
                          defaultValue: '8 distinct colors',
                        })
                      : t('grouping.colorPopoverAdvanced.twentyFourColors', {
                          defaultValue: '24 colors',
                        })}{' '}
                  </Text>
                  <div
                    className={`ColorPopoverAdvanced__paletteColors__container ${
                      paletteIndex === index ? 'active' : ''
                    }`}
                  >
                    {options.map((color) => (
                      <Box
                        key={color}
                        component='span'
                        className='ColorPopoverAdvanced__paletteColors__colorItem'
                        bgcolor={color}
                      />
                    ))}
                  </div>
                </Box>
              </ErrorBoundary>
            ))}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default ColorPopoverAdvanced;
