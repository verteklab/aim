import React from 'react';

import { Card, Text } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import { ICardProps } from 'components/kit/Card/Card.d';

import { useTranslation } from 'config/i18n';

import { formatValue } from 'utils/formatValue';

import { IRunOverviewTabPackagesCardProps } from './RunOverviewTabPackagesCard.d';

function RunOverviewTabPackagesCard({
  packages,
  isRunInfoLoading,
}: IRunOverviewTabPackagesCardProps) {
  const { t } = useTranslation();
  const tableData = React.useMemo(
    () =>
      Object.entries(packages || {}).map(([key = '', value], index) => ({
        key: index,
        name: key,
        value: formatValue(value),
      })),
    [packages],
  );
  const dataListProps = React.useMemo(
    (): ICardProps['dataListProps'] => ({
      tableColumns: [
        {
          dataKey: 'name',
          key: 'name',
          width: '50%',
          title: (
            <Text weight={600} size={14} tint={100}>
              {t('runDetail.overview.packages', { defaultValue: 'Packages' })}
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
          dataKey: 'value',
          key: 'value',
          width: '50%',
          title: t('runDetail.overview.value', { defaultValue: 'Value' }),
          cellRenderer: ({ cellData }: any) => (
            <p title={cellData}>{cellData}</p>
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
          title={t('runDetail.overview.packages', {
            defaultValue: 'Packages',
          })}
          className='RunOverviewTab__cardBox'
          dataListProps={dataListProps}
        />
      </BusyLoaderWrapper>
    </ErrorBoundary>
  );
}

RunOverviewTabPackagesCard.displayName = 'RunOverviewTabPackagesCard';

export default React.memo<IRunOverviewTabPackagesCardProps>(
  RunOverviewTabPackagesCard,
);
