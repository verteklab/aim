import React from 'react';
import moment from 'moment';

import { Text, Card, Icon } from 'components/kit';

import { DATE_GIT_COMMIT } from 'config/dates/dates';
import { useTranslation } from 'config/i18n';

import { IGitInfoCardProps } from './GitInfoCard';

import './GitInfoCard.scss';

function GitInfoCard(props: IGitInfoCardProps) {
  const { t } = useTranslation();
  return (
    <Card
      title={t('runDetail.overview.gitInfoCard', {
        defaultValue: 'Git Info Card',
      })}
      className='GitInfoCard RunOverviewTab__cardBox'
    >
      <div className='InfoSection ScrollBar__hidden flex fjb'>
        <div className='InfoCard flex fdc'>
          <Text
            className='InfoCardLabel'
            weight={400}
            tint={50}
            size={12}
            color='primary'
          >
            {t('runDetail.overview.branch', { defaultValue: 'Branch' })}
          </Text>
          <div className='InfoCardValue flex fac'>
            <Icon name='branch' fontSize={14} />
            <Text
              className='InfoCardValueText'
              weight={500}
              size={12}
              color='primary'
            >
              {props.data?.branch}
            </Text>
          </div>
        </div>
        <div className='InfoCard flex fdc'>
          <Text
            className='InfoCardLabel'
            weight={400}
            tint={50}
            size={12}
            color='primary'
          >
            {t('runDetail.overview.author', { defaultValue: 'Author' })}
          </Text>
          <div className='InfoCardValue flex fac'>
            <Icon name='avatar' fontSize={14} />
            <Text
              className='InfoCardValueText'
              weight={500}
              size={12}
              color='primary'
            >
              {props.data.commit?.author}
            </Text>
          </div>
        </div>
        <div className='InfoCard flex fdc'>
          <Text
            className='InfoCardLabel'
            weight={400}
            tint={50}
            size={12}
            color='primary'
          >
            {t('runDetail.overview.hash', { defaultValue: 'Hash' })}
          </Text>
          <div className='InfoCardValue flex fac'>
            <Icon name='hash' fontSize={14} />
            <Text
              className='InfoCardValueText'
              weight={500}
              size={12}
              color='primary'
            >
              {props.data.commit?.hash}
            </Text>
          </div>
        </div>
        <div className='InfoCard flex fdc'>
          <Text
            className='InfoCardLabel'
            weight={400}
            tint={50}
            size={12}
            color='primary'
          >
            {t('runDetail.overview.timestamp', {
              defaultValue: 'Timestamp',
            })}
          </Text>
          <div className='InfoCardValue flex fac'>
            <Icon name='time' fontSize={14} />
            <Text
              className='InfoCardValueText'
              weight={500}
              size={12}
              color='primary'
            >
              {`${moment(props.data.commit?.timestamp).format(
                DATE_GIT_COMMIT,
              )}`}
            </Text>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default React.memo(GitInfoCard);
