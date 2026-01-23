import React from 'react';
import _ from 'lodash-es';

import SliderWithInput from 'components/SliderWithInput';
import { Button, Icon, Text } from 'components/kit';
import { IValidationMetadata } from 'components/kit/Input';

import { useTranslation } from 'config/i18n';

import { IRangeSliderPanelProps } from './RangePanel.d';

import './RangePanel.scss';

function RangePanel({
  onApply,
  applyButtonDisabled,
  onRangeSliderChange,
  onInputChange,
  items,
}: IRangeSliderPanelProps) {
  const { t } = useTranslation();
  return (
    <form
      className='RangePanel'
      onSubmit={(e) => {
        e.preventDefault();
        onApply();
      }}
    >
      <div className='RangePanelContainer'>
        {items?.map((item) => {
          const rangeLength = _.range(
            item.rangeEndpoints?.[0] ?? 0,
            (item.rangeEndpoints?.[1] ?? 0) + 1,
          ).length;
          return (
            <React.Fragment key={item.sliderName}>
              {item.rangeEndpoints?.[0] !== item.rangeEndpoints?.[1] ? (
                <SliderWithInput
                  sliderType={item?.sliderType}
                  sliderTitle={item.sliderTitle}
                  countInputTitle={item.inputTitle}
                  countTitleTooltip={item.inputTitleTooltip}
                  sliderTitleTooltip={item.sliderTitleTooltip}
                  min={item.rangeEndpoints?.[0]}
                  max={item.rangeEndpoints?.[1]}
                  selectedRangeValue={item.selectedRangeValue}
                  selectedCountValue={item.inputValue}
                  onSearch={onApply}
                  onRangeChange={(value) =>
                    onRangeSliderChange(item.sliderName, value)
                  }
                  onCountChange={(value, metadata?: IValidationMetadata) => {
                    onInputChange(item.inputName, value, metadata);
                  }}
                  inputValidationPatterns={
                    item?.inputValidationPatterns ?? [
                      {
                        errorCondition: (value: string | number) => +value <= 0,
                        errorText: t('rangePanel.valueShouldBeGreater', {
                          defaultValue:
                            'Value should be greater than {{value}}',
                          values: { value: 0 },
                        }),
                      },
                      {
                        errorCondition: (value: string | number) => {
                          return +value > rangeLength;
                        },
                        errorText: t('rangePanel.valueShouldBeSmaller', {
                          defaultValue:
                            'Value should be smaller than {{value}}',
                          values: { value: rangeLength + 1 },
                        }),
                      },
                    ]
                  }
                />
              ) : (
                <div className='InfoMassageBox'>
                  <Icon name='circle-info' color={'#1473E6'} />
                  <Text size={11} tint={80} weight={500}>
                    {t('rangePanel.youHaveOnly', {
                      defaultValue: 'You have only',
                    })}{' '}
                    <Text
                      size={11}
                      tint={80}
                      weight={600}
                      className='InfoMessageBoldText'
                    >
                      1{' '}
                      {item?.infoPropertyName ||
                        t('rangePanel.step', { defaultValue: 'step' })}
                    </Text>{' '}
                    {t('rangePanel.logged', { defaultValue: 'logged.' })}
                  </Text>
                </div>
              )}
              <div className='VerticalDivider' />
            </React.Fragment>
          );
        })}
        <div className='ApplyButtonContainer'>
          <Button
            size='small'
            color='primary'
            variant='contained'
            type='submit'
            className='ApplyButton'
            disabled={applyButtonDisabled}
          >
            {t('common.apply', { defaultValue: 'Apply' })}
          </Button>
        </div>
      </div>
    </form>
  );
}

RangePanel.displayName = 'RangePanel';

export default React.memo<IRangeSliderPanelProps>(RangePanel);
