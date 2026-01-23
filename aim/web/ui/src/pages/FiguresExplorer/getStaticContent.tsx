import * as React from 'react';

import { DOCUMENTATIONS } from 'config/references';
import { useTranslation } from 'config/i18n';

import getBaseExplorerStaticContent, {
  STATIC_CONTENT_TYPES,
} from 'modules/BaseExplorer/utils/getBaseExplorerStaticContent';
import { StaticContentType } from 'modules/BaseExplorer/types';

function getFiguresExplorerStaticContent(
  type: StaticContentType,
): React.ReactNode {
  const illustrationContent = getFiguresExplorerIllustrationContent(type);
  return getBaseExplorerStaticContent(type, illustrationContent);
}

function getFiguresExplorerIllustrationContent(
  type: StaticContentType,
): React.ReactNode {
  // Create a component that uses translation hook
  const ContentWrapper: React.FC = () => {
    const { t } = useTranslation();

    const Never_Executed = (
      <>
        {t('figures.staticContent.neverExecuted.intro', {
          defaultValue:
            "It's super easy to search Aim experiments. Just start typing your query in the search bar above.",
        })}
        <br />
        {t('figures.staticContent.neverExecuted.lookUp', {
          defaultValue: 'Look up',
        })}{' '}
        <a
          className='qlAnchor'
          href={DOCUMENTATIONS.EXPLORERS.SEARCH}
          target='_blank'
          rel='noreferrer'
        >
          {t('figures.staticContent.neverExecuted.searchDocs', {
            defaultValue: 'search docs',
          })}
        </a>{' '}
        {t('figures.staticContent.neverExecuted.toLearnMore', {
          defaultValue: 'to learn more.',
        })}
      </>
    );
    const Failed = t('figures.staticContent.failed', {
      defaultValue: 'Incorrect Query',
    });
    const Insufficient_Resources = t(
      'figures.staticContent.insufficientResources',
      {
        defaultValue: "You don't have any tracked figures",
      },
    );
    const Empty = t('figures.staticContent.empty', {
      defaultValue: 'No Results',
    });
    const Empty_Bookmarks = t('figures.staticContent.emptyBookmarks', {
      defaultValue: "You don't have any saved bookmark",
    });

    const CONTENT: Record<string, React.ReactNode> = {
      [STATIC_CONTENT_TYPES.Never_Executed]: Never_Executed,
      [STATIC_CONTENT_TYPES.Failed]: Failed,
      [STATIC_CONTENT_TYPES.Insufficient_Resources]: Insufficient_Resources,
      [STATIC_CONTENT_TYPES.Empty]: Empty,
      [STATIC_CONTENT_TYPES.Empty_Bookmarks]: Empty_Bookmarks,
    };
    return <>{CONTENT[type] || null}</>;
  };

  return <ContentWrapper />;
}

export default getFiguresExplorerStaticContent;
