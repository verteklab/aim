import React, { useCallback } from 'react';

import { MenuItem } from '@material-ui/core';

import AppBar from 'components/AppBar/AppBar';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import ControlPopover from 'components/ControlPopover/ControlPopover';
import { Button, Icon } from 'components/kit';

import pageTitlesEnum from 'config/pageTitles/pageTitles';
import { useTranslation } from 'config/i18n';

import { PipelineStatusEnum } from 'modules/core/engine/types';
import { IExplorerBarProps } from 'modules/BaseExplorer/types';

import './ExplorerBar.scss';

const EXPLORER_TITLE_KEY_BY_NAME: Record<string, string> = {
  'metrics explorer': pageTitlesEnum.METRICS_EXPLORER,
  'metrics explorer v2': pageTitlesEnum.METRICS_EXPLORER_V2,
  'params explorer': pageTitlesEnum.PARAMS_EXPLORER,
  'images explorer': pageTitlesEnum.IMAGES_EXPLORER,
  'scatters explorer': pageTitlesEnum.SCATTERS_EXPLORER,
  'figures explorer': pageTitlesEnum.FIGURES_EXPLORER,
  'audios explorer': pageTitlesEnum.AUDIOS_EXPLORER,
  'text explorer': pageTitlesEnum.TEXT_EXPLORER,
  'runs explorer': pageTitlesEnum.RUNS_EXPLORER,
};

function ExplorerBar(props: IExplorerBarProps) {
  const { t } = useTranslation();
  const status = props.engine.useStore(props.engine.pipeline.statusSelector);

  const disableResetControls = React.useMemo(
    () =>
      [
        PipelineStatusEnum.Never_Executed,
        PipelineStatusEnum.Empty,
        PipelineStatusEnum.Insufficient_Resources,
        PipelineStatusEnum.Executing,
      ].indexOf(status) !== -1,
    [status],
  );

  const resetToSystemDefaults = useCallback(() => {
    if (!disableResetControls) {
      props.engine.visualizations.reset();
      props.engine.groupings.reset();
      props.engine.pipeline.reset();
    }
  }, [props.engine, disableResetControls]);

  const isExecuting = status === PipelineStatusEnum.Executing;

  const explorerTitle = React.useMemo(() => {
    if (!props.explorerName) {
      return '';
    }
    if (props.explorerName.includes('.')) {
      return t(props.explorerName);
    }
    const mappedKey =
      EXPLORER_TITLE_KEY_BY_NAME[props.explorerName.toLowerCase()];
    if (mappedKey) {
      return t(mappedKey);
    }
    return props.explorerName;
  }, [props.explorerName, t]);

  return (
    <div>
      <AppBar title={explorerTitle} disabled={isExecuting}>
        <div className='ExplorerBar__menu'>
          <ErrorBoundary>
            <ControlPopover
              title={t('common.menu')}
              anchor={({ onAnchorClick }) => (
                <Button
                  withOnlyIcon
                  color='secondary'
                  size='small'
                  onClick={(d: any) => !isExecuting && onAnchorClick(d)}
                >
                  <Icon
                    fontSize={16}
                    name='menu'
                    className='ExplorerBar__item__bookmark__Icon'
                  />
                </Button>
              )}
              component={
                <div className='ExplorerBar__popover'>
                  <MenuItem
                    disabled={disableResetControls}
                    onClick={resetToSystemDefaults}
                  >
                    {t('common.resetControls')}
                  </MenuItem>
                  <a
                    href={props.documentationLink}
                    target='_blank'
                    rel='noreferrer'
                    className='ExplorerBar__popover__docsLink'
                  >
                    <MenuItem>{t('common.explorerDocumentation')}</MenuItem>
                  </a>
                </div>
              }
            />
          </ErrorBoundary>
        </div>
      </AppBar>
    </div>
  );
}

export default React.memo(ExplorerBar);
