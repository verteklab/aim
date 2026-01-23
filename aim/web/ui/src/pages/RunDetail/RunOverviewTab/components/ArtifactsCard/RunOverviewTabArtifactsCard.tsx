import React from 'react';

import { IconEye } from '@tabler/icons-react';

import { Card, Text } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import { ICardProps } from 'components/kit/Card/Card.d';
import CopyToClipBoard from 'components/CopyToClipBoard/CopyToClipBoard';

import { useTranslation } from 'config/i18n';

import { formatValue } from 'utils/formatValue';

import { IRunOverviewTabArtifactsCardProps } from './RunOverviewTabArtifactsCard.d';

function RunOverviewTabArtifactsCard({
  artifacts,
  isRunInfoLoading,
}: IRunOverviewTabArtifactsCardProps) {
  const { t } = useTranslation();
  const tableData = React.useMemo(() => artifacts, [artifacts]);

  const dataListProps = React.useMemo(
    (): ICardProps['dataListProps'] => ({
      calcTableHeight: true,
      tableColumns: [
        {
          dataKey: 'name',
          key: 'name',
          width: '20%',
          title: (
            <Text weight={600} size={14} tint={100}>
              {t('runDetail.overview.name', { defaultValue: 'Name' })}
              <Text
                weight={600}
                size={14}
                tint={50}
                className='RunOverviewTab__cardBox__tableTitleCount'
              >
                ({tableData.length})
              </Text>
            </Text>
          ),
          cellRenderer: ({ cellData }: any) => (
            <p title={cellData}>{cellData}</p>
          ),
        },
        {
          dataKey: 'path',
          key: 'path',
          width: '40%',
          title: t('runDetail.overview.path', { defaultValue: 'Path' }),
          cellRenderer: ({ cellData }: any) => (
            <p title={cellData}>{cellData}</p>
          ),
        },
        {
          dataKey: 'uri',
          key: 'uri',
          width: '40%',
          title: t('runDetail.overview.uri', { defaultValue: 'URI' }),
          cellRenderer: ({ cellData }: any) => (
            <div>
              <Text size={14}>{cellData}</Text>
              <CopyToClipBoard
                iconSize='xSmall'
                isURL='true'
                copyContent={cellData}
              />
            </div>
          ),
        },
      ],
      tableData,
      illustrationConfig: {
        size: 'large',
        title: t('runDetail.overview.noResults', {
          defaultValue: 'No Results',
        }),
      },
    }),
    [tableData, t],
  );
  return (
    <ErrorBoundary>
      <BusyLoaderWrapper isLoading={isRunInfoLoading} height='100%'>
        <Card
          title={t('runDetail.overview.runArtifacts', {
            defaultValue: 'Run Artifacts',
          })}
          className='RunOverviewTab__cardBox'
          dataListProps={dataListProps}
        />
      </BusyLoaderWrapper>
    </ErrorBoundary>
  );
}

RunOverviewTabArtifactsCard.displayName = 'RunOverviewTabArtifactsCard';

export default React.memo<IRunOverviewTabArtifactsCardProps>(
  RunOverviewTabArtifactsCard,
);
