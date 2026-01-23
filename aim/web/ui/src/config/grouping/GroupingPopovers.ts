import ColorPopoverAdvanced from 'pages/Metrics/components/ColorPopoverAdvanced/ColorPopoverAdvanced';
import StrokePopoverAdvanced from 'pages/Metrics/components/StrokePopover/StrokePopoverAdvanced';

import { IGroupingPopovers } from 'types/pages/components/Grouping/Grouping';

export enum GroupNameEnum {
  COLOR = 'color',
  STROKE = 'stroke',
  CHART = 'chart',
  ROW = 'row',
}

type TranslationFunction = (
  key: string,
  options?: { defaultValue?: string },
) => string;

export function getGroupingPopovers(
  t?: TranslationFunction,
): IGroupingPopovers[] {
  const getTranslation = (key: string, defaultValue: string): string => {
    return t ? t(key, { defaultValue }) : defaultValue;
  };

  return [
    {
      groupName: GroupNameEnum.COLOR,
      title: getTranslation('grouping.titles.color', 'Group by color'),
      AdvancedComponent: ColorPopoverAdvanced,
    },
    {
      groupName: GroupNameEnum.STROKE,
      title: getTranslation('grouping.titles.stroke', 'Group by stroke style'),
      AdvancedComponent: StrokePopoverAdvanced,
    },
    {
      groupName: GroupNameEnum.CHART,
      title: getTranslation('grouping.titles.chart', 'Divide into charts'),
      inputLabel: getTranslation(
        'grouping.inputLabels.chart',
        'Select fields to divide into charts',
      ),
    },
    {
      groupName: GroupNameEnum.ROW,
      title: getTranslation('grouping.titles.row', 'Group by row'),
    },
  ];
}

// Default export for backward compatibility (uses English)
const GroupingPopovers: IGroupingPopovers[] = getGroupingPopovers();

export default GroupingPopovers;
