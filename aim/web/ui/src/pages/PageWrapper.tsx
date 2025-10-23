import React from 'react';

import { PathEnum } from 'config/enums/routesEnum';
import { useTranslation } from 'config/i18n';

import { setDocumentTitle } from 'utils/document/documentTitle';

function PageWrapper(props: {
  children: React.ReactNode;
  title: string;
  path: PathEnum;
}) {
  const { title, path, children } = props;
  const { t } = useTranslation();

  const translatedTitle = React.useMemo(() => {
    if (!title) {
      return '';
    }
    return t(title);
  }, [title, t]);

  React.useEffect(() => {
    if (path === PathEnum.Dashboard) {
      setDocumentTitle();
    } else if (path !== PathEnum.Run_Detail) {
      if (translatedTitle) {
        setDocumentTitle(translatedTitle, true);
      } else {
        setDocumentTitle();
      }
    }
  }, [translatedTitle, path]);

  return <>{children}</>;
}

export default PageWrapper;
