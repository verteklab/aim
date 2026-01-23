import React from 'react';

import IllustrationBlock from 'components/IllustrationBlock/IllustrationBlock';

import { IllustrationsEnum } from 'config/illustrationConfig/illustrationConfig';
import { useTranslation } from 'config/i18n';

import { ITraceVisualizationContainerProps } from '../types';

/**
 * Higher order component for trace visualization component
 * @param TraceComponent
 */
function withEmptyTraceCheck(
  TraceComponent: (
    p: ITraceVisualizationContainerProps,
  ) => React.FunctionComponentElement<React.ReactNode>,
) {
  // eslint-disable-next-line react/display-name
  return (
    props: ITraceVisualizationContainerProps,
  ): React.FunctionComponentElement<React.ReactNode> => {
    const { t } = useTranslation();
    const traces = props?.traceInfo ? props?.traceInfo[props.traceType] : null;

    const getEmptyText = () => {
      const traceType = props.traceType;
      const translationKey = `runDetail.traceVisualization.noTracked.${traceType}`;
      const defaultText = `No tracked ${traceType}`;
      return t(translationKey, { defaultValue: defaultText });
    };

    if (!traces || !traces.length) {
      return (
        <IllustrationBlock
          size='xLarge'
          className='TraceEmptyVisualizer'
          type={IllustrationsEnum.EmptyData}
          title={getEmptyText()}
        />
      );
    }

    return <TraceComponent {...props} />;
  };
}

export default withEmptyTraceCheck;
