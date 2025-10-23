import React from 'react';

import { Switcher, Text } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { useTranslation } from 'config/i18n';

import './LiveUpdateSettings.scss';

export interface ILiveUpdateSettingsProp {
  delay: number;
  enabled: boolean;
  onLiveUpdateConfigChange: ({ enabled }: { enabled: boolean }) => void;
}

function LiveUpdateSettings(
  props: ILiveUpdateSettingsProp,
): React.FunctionComponentElement<React.ReactNode> {
  const { t } = useTranslation();
  return (
    <ErrorBoundary>
      <div className='LiveUpdateSettings'>
        <Text className='LiveUpdateSettings__Text' size={14}>
          {t('liveUpdate.label')}
        </Text>
        <Switcher
          checked={Boolean(props.enabled)}
          onChange={() => {
            props.onLiveUpdateConfigChange({ enabled: !props.enabled });
          }}
          size='small'
          color='primary'
        />
      </div>
    </ErrorBoundary>
  );
}

export default React.memo<ILiveUpdateSettingsProp>(LiveUpdateSettings);
