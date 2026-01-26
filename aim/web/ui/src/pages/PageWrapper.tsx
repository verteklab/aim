import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';

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

  const history = useHistory();
  const location = useLocation();

  React.useEffect(() => {
    const handleParentMsg = (e: MessageEvent) => {
      // 1. 过滤非相关消息
      if (e.data?.type !== 'AIM_GO_BACK') return;
      // 2. 对比当前状态与初始状态
      // 如果路径一致，且参数也完全一致，说明回到了“原点”
      const isAtStart =
        location.pathname === e.data?.root_url &&
        location.search === e.data?.root_search;
      if (isAtStart) {
        // 已经在根了，通知父页面
        window.parent.postMessage({ type: 'AIM_AT_ROOT' }, '*');
      } else {
        // 还没到根，执行内部回退
        history.replace(e.data?.root_url + e.data?.root_search, {
          replace: true,
        });
      }
    };

    window.addEventListener('message', handleParentMsg);

    // 3. 重要：清理监听器，防止内存泄漏和重复绑定
    return () => window.removeEventListener('message', handleParentMsg);
  }, [location.pathname, history]); // 依赖项包含路径，确保逻辑最新

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
