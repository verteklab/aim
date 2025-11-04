import React from 'react';
import { Switch, Route, BrowserRouter, Redirect } from 'react-router-dom';
import { useModel } from 'hooks';

import { loader } from '@monaco-editor/react';

import AlertBanner from 'components/kit/AlertBanner';
import SideBar from 'components/SideBar/SideBar';
import ProjectWrapper from 'components/ProjectWrapper/ProjectWrapper';
import Theme from 'components/Theme/Theme';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { getBasePath } from 'config/config';
import { PathEnum } from 'config/enums/routesEnum';

import PageWrapper from 'pages/PageWrapper';

import routes from 'routes/routes';

import projectsModel from 'services/models/projects/projectsModel';

import { IProjectsModelState } from './types/services/models/projects/projectsModel';
// import { preloadFonts } from './utils/fontLoader';
import { preloadCriticalStyles, initStyleLoader } from './utils/styleLoader';
import { initScssLoader } from './utils/scssLoader';
import { initControlPopoverLoader } from './utils/controlPopoverLoader';

import './App.scss';

// loading monaco from node modules instead of CDN
// 在qiankun环境中，需要动态获取正确的路径
const getMonacoPath = () => {
  const win = window as any;
  if (win.__POWERED_BY_QIANKUN__ && win.__INJECTED_PUBLIC_PATH_BY_QIANKUN__) {
    return `${win.__INJECTED_PUBLIC_PATH_BY_QIANKUN__}vs`;
  }
  if (win.externalPublicPath) {
    return `${win.externalPublicPath}vs`;
  }
  return `${getBasePath()}/vs`;
};

loader.config({
  paths: {
    vs: getMonacoPath(),
  },
});

function App(): React.FunctionComponentElement<React.ReactNode> {
  const projectsData = useModel<Partial<IProjectsModelState>>(projectsModel);

  // 预加载字体文件和样式文件，确保在qiankun环境下正常显示
  React.useEffect(() => {
    // 初始化样式加载器
    initStyleLoader();

    // 初始化SCSS加载器
    initScssLoader();

    // 初始化ControlPopover样式加载器
    initControlPopoverLoader();

    // 预加载字体和样式
    // Promise.all([
    //   preloadFonts().catch(() => {
    //     // 字体加载失败时静默处理，不影响应用正常运行
    //   }),
    //   preloadCriticalStyles().catch(() => {
    //     // 样式加载失败时静默处理，不影响应用正常运行
    //   }),
    // ]).catch(() => {
    //   // 整体加载失败时静默处理
    // });
  }, []);

  return (
    <BrowserRouter
    // basename={(window as any).__POWERED_BY_QIANKUN__ ? '/app3' : '/'}
    >
      <ProjectWrapper />
      <Theme>
        {projectsData?.project?.warn_index && (
          <AlertBanner type='warning'>
            Index db was corrupted and deleted. Please run
            <b>`aim storage reindex`</b> command to restore optimal performance.
          </AlertBanner>
        )}
        {projectsData?.project?.warn_runs && (
          <AlertBanner type='warning'>
            Corrupted runs were detected. Please run
            <b>`aim runs rm --corrupted`</b> command to remove corrupted runs.
          </AlertBanner>
        )}
        <div className='pageContainer'>
          {/* <ErrorBoundary>
            <SideBar />
          </ErrorBoundary> */}
          <div className='mainContainer'>
            <React.Suspense
              fallback={<BusyLoaderWrapper height='100vh' isLoading />}
            >
              <Switch>
                {Object.values(routes).map((route, index) => {
                  const { component: Component, path, isExact, title } = route;

                  return (
                    <Route path={path} key={index} exact={isExact}>
                      <ErrorBoundary>
                        <PageWrapper path={path} title={title}>
                          <Component />
                        </PageWrapper>
                      </ErrorBoundary>
                    </Route>
                  );
                })}
                <Redirect to={PathEnum.Dashboard} />
              </Switch>
            </React.Suspense>
          </div>
        </div>
      </Theme>
    </BrowserRouter>
  );
}

export default App;
