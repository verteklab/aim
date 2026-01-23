import React from 'react';
import classNames from 'classnames';

import { Tooltip } from '@material-ui/core';

import ControlPopover from 'components/ControlPopover/ControlPopover';
import GroupingPopover from 'components/GroupingPopover/GroupingPopover';
import { Icon } from 'components/kit';
import { IconName } from 'components/kit/Icon';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { useTranslation } from 'config/i18n';

import { IGroupingItemProps } from 'types/pages/components/GroupingItem/GroupingItem';

import './GroupingItem.scss';

const icons = {
  stroke: 'line-style',
  chart: 'chart-group',
  row: 'image-group',
  color: 'coloring',
};

function GroupingItem({
  title,
  groupName,
  groupingData,
  inputLabel,
  advancedComponent,
  onSelect,
  onGroupingModeChange,
  groupingSelectOptions,
  isDisabled,
}: IGroupingItemProps): React.FunctionComponentElement<React.ReactNode> {
  const { t } = useTranslation();
  const translatedTitle =
    title ||
    t(`grouping.titles.${groupName}`, {
      defaultValue: `Group by ${groupName}`,
    });
  const translatedInputLabel = inputLabel
    ? t(`grouping.inputLabels.${groupName}`, { defaultValue: inputLabel }) ||
      inputLabel
    : undefined;
  const tooltipTitle =
    t('grouping.groupBy', { defaultValue: 'Group by' }) +
    ' ' +
    (t(`grouping.groupName.${groupName}`, { defaultValue: groupName }) ||
      groupName);

  return (
    <ErrorBoundary>
      <ControlPopover
        title={translatedTitle}
        anchor={({ onAnchorClick, opened }) => (
          <Tooltip title={tooltipTitle}>
            <div
              onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                if (!isDisabled) {
                  onAnchorClick(e);
                }
              }}
              className={classNames('GroupingItem', {
                isDisabled: isDisabled,
              })}
            >
              <div
                className={`GroupingItem__icon__box ${opened ? 'active' : ''} ${
                  groupingSelectOptions?.length &&
                  groupingData?.[groupName]?.length
                    ? 'outlined'
                    : ''
                }`}
              >
                <Icon name={icons[groupName] as IconName} />
              </div>
            </div>
          </Tooltip>
        )}
        component={
          <GroupingPopover
            groupName={groupName}
            inputLabel={translatedInputLabel}
            groupingData={groupingData}
            groupingSelectOptions={groupingSelectOptions}
            advancedComponent={advancedComponent}
            onSelect={onSelect}
            onGroupingModeChange={onGroupingModeChange}
          />
        }
      />
    </ErrorBoundary>
  );
}

export default GroupingItem;
