/**
 * @see README.md for more details
 */
/* eslint-disable no-console */

import * as Comlink from 'comlink';

// eslint-disable-next-line import/no-webpack-loader-syntax
import LUWorker from 'comlink-loader?inline&singleton!../Worker';

import { getDataFromTransferable } from '../utils';

const embeddedAppNames = {
  runs: {
    name: 'Runs',
    endpoint: 'runs/search/run',
  },
  metrics: {
    name: 'Metrics',
    endpoint: 'runs/search/metric',
  },
  params: {
    name: 'Params',
    endpoint: 'runs/search/run',
  },
  scatters: {
    name: 'Scatters',
    endpoint: 'runs/search/run',
  },
};

class UpdateService {
  constructor(appName, responseListener, delay) {
    this.appName = appName;
    this.delay = delay;
    this.responseListener = responseListener;
    this.instance = null;

    // 延迟初始化worker，避免在构造函数中同步创建
    setTimeout(() => {
      this.initializeWorkerAsync(appName, delay);
    }, 0);
  }

  async initializeWorkerAsync(appName, delay) {
    try {
      this.instance = new LUWorker();
      this.initializeWorker(appName, delay);
    } catch (error) {
      console.error('Failed to initialize LiveUpdate worker:', error);
      this.instance = null;
    }
  }

  initializeWorker(appName, delay) {
    if (!this.instance) {
      console.warn('Worker instance not available');
      return;
    }

    try {
      // Check if replaceBasePath method exists before calling it
      if (typeof this.instance.replaceBasePath === 'function') {
        this.instance.replaceBasePath(window.API_BASE_PATH);
      } else {
        console.warn('replaceBasePath method not available on worker instance');
      }

      // Check if setAuthToken method exists before calling it
      if (typeof this.instance.setAuthToken === 'function') {
        this.instance.setAuthToken(localStorage.getItem('Auth') || '');
      } else {
        console.warn('setAuthToken method not available on worker instance');
      }

      // Check if setConfig method exists before calling it
      if (typeof this.instance.setConfig === 'function') {
        this.instance.setConfig(
          appName,
          embeddedAppNames[this.appName].endpoint,
          delay,
          process.env.NODE_ENV === 'development',
        );
      } else {
        console.warn('setConfig method not available on worker instance');
      }

      // 直接使用handler，避免Comlink代理问题
      if (typeof this.instance.subscribeToApiCallResult === 'function') {
        const responseHandler = this.responseHandler.bind(this);

        try {
          // 直接传递handler，不使用Comlink代理
          this.instance.subscribeToApiCallResult(responseHandler);
        } catch (error) {
          console.error('Failed to subscribe to API call result:', error);
        }
      } else {
        console.warn(
          'subscribeToApiCallResult method not available on worker instance',
        );
      }
    } catch (error) {
      console.error('Failed to initialize worker methods:', error);
    }
  }

  async stop() {
    if (this.inProgress && this.instance) {
      // Check if stop method exists before calling it
      if (typeof this.instance.stop !== 'function') {
        console.warn('stop method not available on worker instance');
        return;
      }

      try {
        const stopResult = await this.instance.stop();
        this.inProgress = false;
        return stopResult;
      } catch (e) {
        console.log("---- couldn't stop worker");
      }
    }
  }

  start(params) {
    if (!this.instance) {
      console.warn('Worker instance not available, cannot start');
      return;
    }

    // Check if start method exists before calling it
    if (typeof this.instance.start !== 'function') {
      console.warn('start method not available on worker instance');
      return;
    }

    this.inProgress = true;
    this.instance
      .start({ ...params, report_progress: 'False' })
      .then()
      .catch((e) => {
        console.log('worker start exception --> ', e);
      });
  }

  responseHandler(data) {
    const obj = getDataFromTransferable(data);

    this.responseListener(obj);
  }

  changeDelay(delay) {
    if (!this.instance) {
      console.warn('Worker instance not available, cannot change delay');
      return;
    }

    // Check if setConfig method exists before calling it
    if (typeof this.instance.setConfig !== 'function') {
      console.warn('setConfig method not available on worker instance');
      return;
    }

    this.stop()
      .catch(() => {
        console.log("---- couldn't change config");
      })
      .finally(() => {
        this.instance.setConfig(
          this.appName,
          embeddedAppNames[this.appName].endpoint,
          delay,
          process.env.NODE_ENV === 'development',
        );
      });
  }

  clear() {
    if (!this.instance) {
      return;
    }

    // Check if close method exists before calling it
    if (typeof this.instance.close !== 'function') {
      console.warn('close method not available on worker instance');
      return;
    }

    this.stop().finally(() => {
      this.instance.close();
      if (typeof this.instance[Comlink.releaseProxy] === 'function') {
        this.instance[Comlink.releaseProxy]();
      }
    });
  }
}

export default UpdateService;
